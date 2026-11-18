"use client";

import { useState } from "react";

type Props = {
  title: string;
  text: string;
};

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function ResultCard({ title, text }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <article className="relative rounded-xl border border-slate-200 bg-white py-4 pl-6 pr-4 shadow-sm">
      {/* Gold rule on the left — the signature of a finished post */}
      <span aria-hidden className="absolute bottom-4 left-0 top-4 w-[3px] rounded-r bg-accent-500" />
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-lg text-brand-500">{title}</h3>
        <button
          type="button"
          onClick={onCopy}
          className={`shrink-0 rounded-full border px-3.5 py-1 text-sm transition ${
            copied
              ? "border-brand-500 bg-brand-500 text-white"
              : "border-slate-300 text-brand-500 hover:border-accent-500 hover:bg-gold-100"
          }`}
        >
          {copied ? "কপি হয়েছে ✓" : "কপি"}
        </button>
      </div>
      <p className="whitespace-pre-line text-[15px] text-slate-700">{text}</p>
    </article>
  );
}
