"use client";

import { useState } from "react";
import { copyText } from "./ResultCard";
import { postToText, type HistoryItem } from "@/lib/history";
import type { Language, Occasion, Tone } from "@/lib/types";

type Props = {
  items: HistoryItem[];
  activeId: string | null;
  onOpen: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
};

const languageLabel: Record<Language, string> = { bn: "বাংলা", en: "English", mixed: "মিক্স" };
const toneLabel: Record<Tone, string> = { simple: "সাধারণ", premium: "প্রিমিয়াম", offer: "অফার", friendly: "বন্ধুসুলভ" };

const occasionLabel: Record<Occasion, string> = {
  none: "",
  eid: "🌙 ঈদ",
  puja: "🪔 পূজা",
  boishakh: "🎊 বৈশাখ",
  winter: "❄️ শীত",
  newArrival: "🆕 নতুন",
  flashSale: "⚡ ফ্ল্যাশ সেল",
};

function formatDate(ts: number): string {
  try {
    return new Date(ts).toLocaleString("bn-BD", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  } catch {
    return new Date(ts).toLocaleString();
  }
}

export default function PostHistory({ items, activeId, onOpen, onDelete, onClearAll }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  async function handleCopy(item: HistoryItem) {
    if (await copyText(postToText(item.post))) {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">📚 আগের পোস্ট</h2>
          <p className="text-sm text-muted">
            {items.length > 0
              ? `${items.length}টি পোস্ট সেভ আছে · সর্বশেষ ৩০টি রাখা হয়`
              : "আপনার তৈরি করা পোস্টগুলো এখানে নিজে থেকেই সেভ হবে।"}
          </p>
        </div>

        {items.length > 0 &&
          (confirmClear ? (
            <div className="flex items-center gap-2 text-sm">
              <span>সব মুছবেন?</span>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white"
              >
                হ্যাঁ, মুছুন
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-slate-300 px-3 py-1.5"
              >
                না
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              সব মুছে ফেলুন
            </button>
          ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 px-6 py-8 text-center text-sm text-muted">
          এখনো কোনো পোস্ট নেই — প্রথম পোস্টটি তৈরি করুন ✨
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li
                key={item.id}
                className={`flex gap-3 rounded-2xl border p-3 transition ${
                  active ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-500"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onOpen(item)}
                  className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100"
                  aria-label="পোস্টটি দেখুন"
                >
                  {item.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-2xl">🖼️</span>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => onOpen(item)} className="block w-full text-left">
                    <p className="truncate font-semibold">{item.productName || "নাম ছাড়া পণ্য"}</p>
                    <p className="truncate text-xs text-muted">{item.post.caption.split("\n")[0]}</p>
                  </button>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">{languageLabel[item.language]}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5">{toneLabel[item.tone]}</span>
                    {item.occasion && item.occasion !== "none" && (
                      <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-accent-500">
                        {occasionLabel[item.occasion]}
                      </span>
                    )}
                    <span className="text-muted">{formatDate(item.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpen(item)}
                      className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-100"
                    >
                      দেখুন
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        copiedId === item.id ? "bg-green-100 text-green-700" : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      {copiedId === item.id ? "কপি হয়েছে ✓" : "কপি"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="ml-auto rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      aria-label="মুছুন"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
