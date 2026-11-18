"use client";

import { useRef, useState } from "react";
import Header from "./Header";
import UploadBox from "./UploadBox";
import DetailsForm from "./DetailsForm";
import OptionPicker, { type Option } from "./OptionPicker";
import ResultCard, { copyText } from "./ResultCard";
import type { GeneratedPost, Language, ProductDetails, Tone } from "@/lib/types";

const languageOptions: Option<Language>[] = [
  { value: "bn", label: "বাংলা" },
  { value: "en", label: "English" },
  { value: "mixed", label: "মিক্স", sub: "Banglish" },
];

const toneOptions: Option<Tone>[] = [
  { value: "simple", label: "সাধারণ", sub: "Simple" },
  { value: "premium", label: "প্রিমিয়াম", sub: "Premium" },
  { value: "offer", label: "অফার", sub: "Sale / Offer" },
  { value: "friendly", label: "বন্ধুসুলভ", sub: "Friendly" },
];

const emptyDetails: ProductDetails = { name: "", price: "", details: "", deliveryCharge: "" };

export default function PostKoriApp() {
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState<ProductDetails>(emptyDetails);
  const [language, setLanguage] = useState<Language>("bn");
  const [tone, setTone] = useState<Tone>("simple");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  async function onGenerate() {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      // Send the photo + options to our own backend route (src/app/api/generate/route.ts)
      const form = new FormData();
      form.append("image", file);
      form.append("language", language);
      form.append("tone", tone);
      form.append("name", details.name);
      form.append("price", details.price);
      form.append("details", details.details);
      form.append("deliveryCharge", details.deliveryCharge);

      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "কিছু একটা সমস্যা হয়েছে।");

      setResult(data as GeneratedPost);
      // On mobile, scroll down to the results
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) {
      setError(e instanceof Error ? e.message : "কিছু একটা সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  }

  async function onCopyAll() {
    if (!result) return;
    const full = `${result.caption}\n\n${result.description}\n\n${result.pricePost}\n\n${result.hashtags.join(" ")}`;
    if (await copyText(full)) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  }

  return (
    <>
      <Header />

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-2 lg:items-start">
        {/* ---------- Left: inputs ---------- */}
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <h1 className="text-xl font-bold">নতুন পোস্ট তৈরি করুন</h1>
            <p className="text-sm text-muted">ছবি দিন, কয়েকটি তথ্য দিন — বাকিটা PostKori করবে।</p>
          </div>

          <UploadBox file={file} onChange={setFile} />

          <DetailsForm value={details} onChange={setDetails} />

          <OptionPicker label="ভাষা" options={languageOptions} value={language} onChange={setLanguage} />

          <OptionPicker label="পোস্টের ধরন" options={toneOptions} value={tone} onChange={setTone} />

          <button
            type="button"
            onClick={onGenerate}
            disabled={!file || loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3.5 text-lg font-semibold text-white shadow-md transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                তৈরি হচ্ছে...
              </>
            ) : (
              <>✨ পোস্ট তৈরি করুন</>
            )}
          </button>
          {error && (
            <p className="-mt-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">⚠️ {error}</p>
          )}
          {!file && <p className="-mt-3 text-center text-xs text-muted">শুরু করতে আগে একটি ছবি আপলোড করুন</p>}
        </section>

        {/* ---------- Right: results ---------- */}
        <section ref={resultsRef} className="scroll-mt-20 space-y-4">
          {result ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">আপনার পোস্ট তৈরি ✅</h2>
                <button
                  type="button"
                  onClick={onCopyAll}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    copiedAll ? "bg-green-600 text-white" : "bg-accent-500 text-white hover:opacity-90"
                  }`}
                >
                  {copiedAll ? "সব কপি হয়েছে ✓" : "সব একসাথে কপি"}
                </button>
              </div>
              <ResultCard icon="📣" title="ফেসবুক ক্যাপশন" text={result.caption} />
              <ResultCard icon="📝" title="পণ্যের বিবরণ" text={result.description} />
              <ResultCard icon="💰" title="দাম ও ডেলিভারি পোস্ট" text={result.pricePost} />
              <ResultCard icon="#️⃣" title="হ্যাশট্যাগ" text={result.hashtags.join(" ")} />
            </>
          ) : loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 px-6 py-16 text-center">
              <div className="mb-3 text-4xl">💬</div>
              <p className="font-semibold">এখানে আপনার পোস্ট দেখা যাবে</p>
              <p className="mt-1 text-sm text-muted">ক্যাপশন, বিবরণ, দামের পোস্ট আর হ্যাশট্যাগ — সব এক জায়গায়।</p>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
