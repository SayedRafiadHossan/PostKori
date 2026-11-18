import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import { buildPrompt } from "@/lib/prompt";
import { getClientIp, rateLimit } from "@/lib/rateLimit";
import type { GeneratedPost, Language, ProductDetails, Tone } from "@/lib/types";

// This code runs only on the server — the API key is never sent to the browser.
export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const LANGUAGES: Language[] = ["bn", "en", "mixed"];
const TONES: Tone[] = ["simple", "premium", "offer", "friendly"];

// "gemini-flash-latest" always points to Google's newest Flash model.
// You can pin a specific model by setting GEMINI_MODEL in .env.local.
const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

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

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return error("Server is missing GEMINI_API_KEY. Add it to .env.local and restart the dev server.", 500);
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

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: image.type, data: base64 } },
            { text: buildPrompt(details, language, tone) },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.9,
      },
    });

    // ---------- 3. Parse and return the result ----------
    const text = response.text;
    if (!text) return error("AI কোনো উত্তর দেয়নি। আবার চেষ্টা করুন।", 502);

    const post = JSON.parse(text) as GeneratedPost;
    post.hashtags = (post.hashtags || []).map((h) => (h.startsWith("#") ? h : `#${h}`).replace(/\s+/g, "_"));

    return NextResponse.json(post);
  } catch (e) {
    console.error("[PostKori] Gemini error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("429") || /quota|rate/i.test(msg)) {
      return error("এই মুহূর্তে অনেক রিকোয়েস্ট — এক মিনিট পর আবার চেষ্টা করুন।", 429);
    }
    if (/API key|PERMISSION_DENIED|401|403/i.test(msg)) {
      return error("Gemini API key কাজ করছে না। .env.local ফাইলের key চেক করুন।", 500);
    }
    return error("পোস্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।", 502);
  }
}
