import { GoogleGenAI, Type, type GenerateContentResponse } from "@google/genai";
import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import type { GeneratedPost, Language, ProductDetails, Tone } from "@/lib/types";

// This code runs only on the server — the API key is never sent to the browser.
export const runtime = "nodejs";
export const maxDuration = 60; // max allowed on Vercel Hobby plan

// Total time we spend trying Gemini (stays safely under Vercel's 60s limit)
const AI_TIMEOUT_MS = 50_000;
// Max time for one single model call, so there is time left to try a backup model
const PER_CALL_TIMEOUT_MS = 25_000;

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const LANGUAGES: Language[] = ["bn", "en", "mixed"];
const TONES: Tone[] = ["simple", "premium", "offer", "friendly"];

// Models to try, in order. If one is busy (503) or not available, the next one is used.
// Override with GEMINI_MODEL in .env.local / Vercel, e.g. "gemini-flash-lite-latest,gemini-flash-latest"
// Lite goes first: it's the fastest, least busy and has the biggest free quota — plenty for captions.
const MODELS = (process.env.GEMINI_MODEL || "gemini-flash-lite-latest,gemini-flash-latest,gemini-2.5-flash")
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// Tells Gemini the exact JSON shape we want back
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    description: { type: Type.STRING },
    caption: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
    pricePost: { type: Type.STRING },
  },
  required: ["description", "caption", "hashtags", "pricePost"],
  propertyOrdering: ["description", "caption", "hashtags", "pricePost"],
};

// ---------- small helpers ----------

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Google is overloaded or our single call took too long → try again / next model
const isBusy = (msg: string) =>
  msg === "AI_TIMEOUT" || /\b(500|503)\b|UNAVAILABLE|high demand|overloaded|INTERNAL/i.test(msg);
// This model can't be used right now (doesn't exist, quota used up, or rejects our settings) → try next model
const isMissingModel = (msg: string) => /\b404\b|NOT_FOUND|not found|is not supported/i.test(msg);
const isQuota = (msg: string) => /\b429\b|RESOURCE_EXHAUSTED|quota/i.test(msg);
const isBadRequest = (msg: string) => /\b400\b|INVALID_ARGUMENT|invalid argument/i.test(msg);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI_TIMEOUT")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

type GenerateArgs = Parameters<GoogleGenAI["models"]["generateContent"]>[0];

/**
 * Calls one model. Newer Gemini models "think" before answering, which is slow and not
 * needed for captions — so we turn thinking off. If a model rejects that setting, retry without it.
 */
async function callModel(
  ai: GoogleGenAI,
  model: string,
  contents: GenerateArgs["contents"],
  config: NonNullable<GenerateArgs["config"]>,
  timeoutMs: number,
): Promise<GenerateContentResponse> {
  const started = Date.now();
  try {
    return await withTimeout(
      ai.models.generateContent({ model, contents, config: { ...config, thinkingConfig: { thinkingBudget: 0 } } }),
      timeoutMs,
    );
  } catch (e) {
    const msg = errMsg(e);
    // Some models reject "thinking off" with a generic 400 "invalid argument" — retry without it
    if (msg === "AI_TIMEOUT" || !(/thinking|budget/i.test(msg) || isBadRequest(msg))) throw e;
    console.warn(`[PostKori] ${model} rejected thinkingConfig, retrying without it`);
    return withTimeout(ai.models.generateContent({ model, contents, config }), timeoutMs - (Date.now() - started));
  }
}

/** Tries each model in MODELS until one answers, within the overall time budget. */
async function generateWithFallback(
  ai: GoogleGenAI,
  contents: GenerateArgs["contents"],
  config: NonNullable<GenerateArgs["config"]>,
): Promise<{ response: GenerateContentResponse; model: string }> {
  const deadline = Date.now() + AI_TIMEOUT_MS;
  let lastError: unknown = new Error("AI_TIMEOUT");

  for (const [index, model] of MODELS.entries()) {
    // The first (main) model gets one quick retry, since demand spikes often clear in seconds
    const attempts = index === 0 ? 2 : 1;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      const msLeft = deadline - Date.now();
      if (msLeft < 3_000) throw lastError;

      try {
        const response = await callModel(ai, model, contents, config, Math.min(msLeft, PER_CALL_TIMEOUT_MS));
        return { response, model };
      } catch (e) {
        lastError = e;
        const msg = errMsg(e);

        if (isBusy(msg)) {
          console.warn(`[PostKori] ${model} busy/slow (attempt ${attempt}): ${msg.slice(0, 120)}`);
          if (attempt < attempts) await sleep(1_000);
          continue;
        }
        if (/API key|PERMISSION_DENIED/i.test(msg)) throw e; // bad key — other models won't help
        if (isMissingModel(msg) || isQuota(msg) || isBadRequest(msg)) {
          console.warn(`[PostKori] ${model} can't be used now, trying next model: ${msg.slice(0, 120)}`);
          break;
        }
        throw e; // e.g. bad API key — no point trying other models
      }
    }
  }
  throw lastError;
}

// ---------- the API route ----------

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const dev = process.env.NODE_ENV !== "production";
    return error(
      dev
        ? "Server is missing GEMINI_API_KEY. Add it to .env.local and restart the dev server."
        : "সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।",
      500,
    );
  }

  // ---------- 0. Rate limit: max posts per visitor per hour ----------
  const limit = rateLimit(getClientIp(req));
  if (!limit.ok) {
    return error(`আপনি এই ঘণ্টার সীমা পার করেছেন। ${limit.retryAfterMin} মিনিট পর আবার চেষ্টা করুন।`, 429);
  }

  // ---------- 1. Read and validate the form ----------
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return error("Invalid request.", 400);
  }

  const image = form.get("image");
  if (!(image instanceof File)) return error("একটি ছবি আপলোড করুন।", 400);
  if (!ACCEPTED.includes(image.type)) return error("শুধু JPG, PNG বা WEBP ছবি দিন।", 400);
  if (image.size > MAX_SIZE) return error("ছবির সাইজ 5MB এর কম হতে হবে।", 400);

  const language = String(form.get("language")) as Language;
  const tone = String(form.get("tone")) as Tone;
  if (!LANGUAGES.includes(language) || !TONES.includes(tone)) return error("Invalid options.", 400);

  const clean = (v: FormDataEntryValue | null) => String(v ?? "").trim().slice(0, 300);
  const details: ProductDetails = {
    name: clean(form.get("name")),
    price: clean(form.get("price")),
    details: clean(form.get("details")),
    deliveryCharge: clean(form.get("deliveryCharge")),
  };

  // ---------- 2. Call Gemini with the photo + prompt ----------
  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64 = Buffer.from(await image.arrayBuffer()).toString("base64");

    const contents = [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: image.type, data: base64 } },
          { text: buildPrompt(details, language, tone) },
        ],
      },
    ];

    const started = Date.now();
    const { response, model } = await generateWithFallback(ai, contents, {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.9,
    });
    console.log(`[PostKori] answered by ${model} in ${Date.now() - started}ms`);

    // ---------- 3. Parse and return the result ----------
    const text = response.text;
    if (!text) return error("AI কোনো উত্তর দেয়নি। আবার চেষ্টা করুন।", 502);

    const post = JSON.parse(text) as GeneratedPost;
    post.hashtags = (post.hashtags || []).map((h) => (h.startsWith("#") ? h : `#${h}`).replace(/\s+/g, "_"));

    return NextResponse.json(post);
  } catch (e) {
    console.error("[PostKori] Gemini error:", e);
    const msg = errMsg(e);
    if (msg === "AI_TIMEOUT") {
      return error("AI এর উত্তর দিতে দেরি হচ্ছে। একটু পরে আবার চেষ্টা করুন।", 504);
    }
    if (isBusy(msg)) {
      return error("AI সার্ভার এখন ব্যস্ত। ১-২ মিনিট পর আবার চেষ্টা করুন।", 503);
    }
    if (isQuota(msg)) {
      return error("এই মুহূর্তে অনেক রিকোয়েস্ট — এক মিনিট পর আবার চেষ্টা করুন।", 429);
    }
    if (/API key|PERMISSION_DENIED|\b401\b|\b403\b/i.test(msg)) {
      return error("Gemini API key কাজ করছে না। Key চেক করুন।", 500);
    }
    return error("পোস্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।", 502);
  }
}
