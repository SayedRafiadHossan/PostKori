"use client";

import { useEffect, useRef, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import UploadBox from "./UploadBox";
import DetailsForm from "./DetailsForm";
import OptionPicker, { type Option } from "./OptionPicker";
import ResultCard, { copyText } from "./ResultCard";
import ShopProfileCard from "./ShopProfile";
import PostHistory from "./PostHistory";
import { compressImage } from "@/lib/compressImage";
import {
  addToHistory,
  clearHistory,
  loadHistory,
  makeThumbnail,
  newId,
  postToText,
  removeFromHistory,
  type HistoryItem,
} from "@/lib/history";
import {
  clearShopProfile,
  deliveryText,
  emptyShopProfile,
  isProfileSet,
  loadShopProfile,
  saveShopProfile,
} from "@/lib/shopProfile";
import type { GeneratedPost, Language, Occasion, ProductDetails, ShopProfile, Tone } from "@/lib/types";

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

const occasionOptions: Option<Occasion>[] = [
  { value: "none", label: "সাধারণ দিন", sub: "Regular" },
  { value: "eid", label: "🌙 ঈদ", sub: "Eid" },
  { value: "puja", label: "🪔 পূজা", sub: "Puja" },
  { value: "boishakh", label: "🎊 বৈশাখ", sub: "Boishakh" },
  { value: "winter", label: "❄️ শীত", sub: "Winter" },
  { value: "newArrival", label: "🆕 নতুন এসেছে", sub: "New arrival" },
  { value: "flashSale", label: "⚡ ফ্ল্যাশ সেল", sub: "Flash sale" },
];

// Messages that rotate while the AI is working
const loadingSteps = ["ছবি দেখছি…", "পণ্যটি বুঝছি…", "ক্যাপশন লিখছি…", "হ্যাশট্যাগ বাছাই করছি…", "শেষ করছি…"];

// Readable message when the server didn't send its own error (e.g. a timeout or crash page)
function statusMessage(status: number): string {
  if (status === 504) return "AI এর উত্তর দিতে দেরি হচ্ছে (timeout)। আবার চেষ্টা করুন।";
  if (status === 413) return "ছবিটি অনেক বড়। ছোট একটি ছবি দিয়ে চেষ্টা করুন।";
  if (status === 429) return "অনেক বেশি রিকোয়েস্ট। কিছুক্ষণ পর আবার চেষ্টা করুন।";
  return `সার্ভারে সমস্যা হয়েছে (${status})। আবার চেষ্টা করুন।`;
}

const emptyDetails: ProductDetails = { name: "", price: "", details: "", deliveryCharge: "" };

export default function PostKoriApp() {
  const [file, setFile] = useState<File | null>(null);
  const [details, setDetails] = useState<ProductDetails>(emptyDetails);
  const [language, setLanguage] = useState<Language>("bn");
  const [tone, setTone] = useState<Tone>("simple");
  const [occasion, setOccasion] = useState<Occasion>("none");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const [shop, setShop] = useState<ShopProfile>(emptyShopProfile);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [viewingOld, setViewingOld] = useState(false); // true when showing a post opened from history

  // Load the saved shop profile from this browser (once, after the page opens)
  useEffect(() => {
    const saved = loadShopProfile();
    setShop(saved);
    setHistory(loadHistory());
    const delivery = deliveryText(saved);
    if (delivery) setDetails((d) => (d.deliveryCharge ? d : { ...d, deliveryCharge: delivery }));
  }, []);

  function handleSaveShop(profile: ShopProfile) {
    saveShopProfile(profile);
    setShop(profile);
    // Fill the delivery charge from the profile if the seller hasn't typed one
    const delivery = deliveryText(profile);
    if (delivery) setDetails((d) => (d.deliveryCharge ? d : { ...d, deliveryCharge: delivery }));
  }

  function handleClearShop() {
    clearShopProfile();
    setShop(emptyShopProfile);
  }

  // Rotate the loading message every 1.6 seconds
  useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const id = setInterval(() => setLoadingStep((s) => Math.min(s + 1, loadingSteps.length - 1)), 1600);
    return () => clearInterval(id);
  }, [loading]);

  async function onGenerate() {
    if (!file || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setViewingOld(false);
    setActiveHistoryId(null);

    // Scroll to the results area so mobile users see the progress
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);

    try {
      // Shrink the photo first — much faster on mobile data
      const image = await compressImage(file);

      // Send the photo + options to our own backend route (src/app/api/generate/route.ts)
      const form = new FormData();
      form.append("image", image);
      form.append("language", language);
      form.append("tone", tone);
      form.append("occasion", occasion);
      form.append("name", details.name);
      form.append("price", details.price);
      form.append("details", details.details);
      form.append("deliveryCharge", details.deliveryCharge);
      if (isProfileSet(shop)) form.append("shop", JSON.stringify(shop));

      const res = await fetch("/api/generate", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || statusMessage(res.status));

      const post = data as GeneratedPost;
      setResult(post);

      // Save to history with a tiny thumbnail
      const item: HistoryItem = {
        id: newId(),
        createdAt: Date.now(),
        thumb: await makeThumbnail(image),
        productName: details.name.trim(),
        language,
        tone,
        occasion,
        post,
      };
      setHistory((h) => addToHistory(h, item));
      setActiveHistoryId(item.id);
    } catch (e) {
      const offline = typeof navigator !== "undefined" && !navigator.onLine;
      setError(
        offline
          ? "ইন্টারনেট সংযোগ নেই। সংযোগ চেক করে আবার চেষ্টা করুন।"
          : e instanceof Error
            ? e.message
            : "কিছু একটা সমস্যা হয়েছে।",
      );
    } finally {
      setLoading(false);
    }
  }

  function openFromHistory(item: HistoryItem) {
    setResult(item.post);
    setActiveHistoryId(item.id);
    setViewingOld(true);
    setError(null);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function deleteFromHistory(id: string) {
    setHistory((h) => removeFromHistory(h, id));
    if (id === activeHistoryId && viewingOld) {
      setResult(null);
      setViewingOld(false);
    }
    if (id === activeHistoryId) setActiveHistoryId(null);
  }

  function clearAllHistory() {
    setHistory(clearHistory());
    setActiveHistoryId(null);
    if (viewingOld) {
      setResult(null);
      setViewingOld(false);
    }
  }

  async function onCopyAll() {
    if (!result) return;
    if (await copyText(postToText(result))) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  }

  return (
    <>
      <Header />

      {/* Heading band — the one bold moment on the page */}
      <section className="mx-auto max-w-5xl px-4 pb-2 pt-10 text-center">
        <h1 className="font-serif text-4xl leading-tight text-brand-500 sm:text-5xl">ছবি দিন, পোস্ট নিন</h1>
        <div aria-hidden className="mx-auto mt-4 flex max-w-xs items-center gap-3 text-accent-500">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent-500" />
          <span className="text-sm">❖</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent-500" />
        </div>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          পণ্যের একটি ছবি থেকে ফেসবুকের জন্য ক্যাপশন, বিবরণ, দামের পোস্ট আর হ্যাশট্যাগ — বাংলা, ইংরেজি বা মিক্স ভাষায়।
        </p>
      </section>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 lg:grid-cols-2 lg:items-start">
        {/* ---------- Left: shop profile + inputs ---------- */}
        <div className="space-y-4">
          <ShopProfileCard profile={shop} onSave={handleSaveShop} onClear={handleClearShop} />

          <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-2xl text-brand-500">নতুন পোস্ট তৈরি করুন</h2>
              <p className="text-sm text-muted">ছবি দিন, কয়েকটি তথ্য দিন — বাকিটা PostKori করবে।</p>
            </div>

            <UploadBox
              file={file}
              onChange={(f) => {
                setFile(f);
                setResult(null);
                setViewingOld(false);
                setError(null);
              }}
            />

            <DetailsForm value={details} onChange={setDetails} />

            <OptionPicker label="ভাষা" options={languageOptions} value={language} onChange={setLanguage} />

            <OptionPicker label="পোস্টের ধরন" options={toneOptions} value={tone} onChange={setTone} />

            <OptionPicker label="উপলক্ষ" options={occasionOptions} value={occasion} onChange={setOccasion} />

            <button
              type="button"
              onClick={onGenerate}
              disabled={!file || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3.5 font-serif text-lg text-gold-100 shadow-md ring-1 ring-inset ring-accent-500/50 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white disabled:shadow-none disabled:ring-0"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {loadingSteps[loadingStep]}
                </>
              ) : result ? (
                <>নতুন অপশনে আবার তৈরি করুন</>
              ) : (
                <>পোস্ট তৈরি করুন</>
              )}
            </button>

            {error && <p className="-mt-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">⚠️ {error}</p>}
            {!file && <p className="-mt-3 text-center text-xs text-muted">শুরু করতে আগে একটি ছবি আপলোড করুন</p>}
          </section>
        </div>

        {/* ---------- Right: results ---------- */}
        <section ref={resultsRef} className="scroll-mt-20 space-y-4" aria-live="polite">
          {result ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl text-brand-500">{viewingOld ? "আগের পোস্ট" : "আপনার পোস্ট তৈরি"}</h2>
                <div className="flex gap-2">
                  {file && !viewingOld && (
                    <button
                      type="button"
                      onClick={onGenerate}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition hover:border-brand-500 hover:text-brand-600"
                    >
                      আরেকটা তৈরি করুন
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onCopyAll}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      copiedAll ? "bg-green-600 text-white" : "bg-accent-500 text-white hover:bg-gold-600"
                    }`}
                  >
                    {copiedAll ? "সব কপি হয়েছে ✓" : "সব একসাথে কপি"}
                  </button>
                </div>
              </div>
              <ResultCard title="ফেসবুক ক্যাপশন" text={result.caption} />
              <ResultCard title="পণ্যের বিবরণ" text={result.description} />
              <ResultCard title="দাম ও ডেলিভারি পোস্ট" text={result.pricePost} />
              <ResultCard title="হ্যাশট্যাগ" text={result.hashtags.join(" ")} />
            </>
          ) : loading ? (
            <div className="space-y-4">
              <p className="flex items-center gap-2 font-semibold text-brand-600">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-100 border-t-brand-500" />
                {loadingSteps[loadingStep]}
              </p>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold-300 bg-white/60 px-6 py-16 text-center">
              <div aria-hidden className="mb-3 font-serif text-3xl text-accent-500">❖</div>
              <p className="font-serif text-xl text-brand-500">এখানে আপনার পোস্ট দেখা যাবে</p>
              <p className="mt-1 text-sm text-muted">ক্যাপশন, বিবরণ, দামের পোস্ট আর হ্যাশট্যাগ — সব এক জায়গায়।</p>
            </div>
          )}
        </section>

        {/* ---------- Bottom: saved posts ---------- */}
        <PostHistory
          items={history}
          activeId={activeHistoryId}
          onOpen={openFromHistory}
          onDelete={deleteFromHistory}
          onClearAll={clearAllHistory}
        />
      </main>

      <Footer />
    </>
  );
}
