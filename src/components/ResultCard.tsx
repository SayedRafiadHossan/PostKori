"use client";

import { useState } from "react";

type Props = {
  icon: string;
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

export default function ResultCard({ icon, title, text }: Props) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (await copyText(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          <span>{icon}</span>
          {title}
        </h3>
        <button
          type="button"
          onClick={onCopy}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            copied ? "bg-green-100 text-green-700" : "bg-brand-50 text-brand-600 hover:bg-brand-100"
          }`}
        >
          {copied ? "কপি হয়েছে ✓" : "কপি"}
        </button>
      </div>
      <p className="whitespace-pre-line text-[15px] text-slate-700">{text}</p>
    </article>
  );
}
