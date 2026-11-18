"use client";

import { useEffect, useState } from "react";
import { PAYMENT_OPTIONS, emptyShopProfile, isProfileSet } from "@/lib/shopProfile";
import type { PaymentMethod, ShopProfile as Profile } from "@/lib/types";

type Props = {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onClear: () => void;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-gold-100";

export default function ShopProfile({ profile, onSave, onClear }: Props) {
  const hasProfile = isProfileSet(profile);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);

  // Keep the form in sync when the saved profile loads from the browser
  useEffect(() => setDraft(profile), [profile]);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function togglePayment(method: PaymentMethod) {
    setDraft((d) => ({
      ...d,
      payments: d.payments.includes(method) ? d.payments.filter((m) => m !== method) : [...d.payments, method],
    }));
  }

  function handleSave() {
    onSave({
      ...draft,
      shopName: draft.shopName.trim(),
      phone: draft.phone.trim(),
      deliveryInside: draft.deliveryInside.trim(),
      deliveryOutside: draft.deliveryOutside.trim(),
      pageLink: draft.pageLink.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1200);
  }

  function handleClear() {
    setDraft(emptyShopProfile);
    onClear();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent-500/60 bg-gold-100 font-serif text-lg text-brand-500">শ</span>
          <div className="leading-tight">
            <p className="font-serif text-lg text-brand-500">আমার শপ</p>
            <p className="text-sm text-muted">
              {hasProfile ? (
                <span className="text-green-700">✓ {profile.shopName || "শপের তথ্য সেভ করা আছে"}</span>
              ) : (
                "একবার তথ্য দিন — প্রতিটি পোস্টে নিজে থেকেই যোগ হবে"
              )}
            </p>
          </div>
        </div>
        <span className={`text-muted transition ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {/* Form — shown when open */}
      {open && (
        <div className="space-y-3 border-t border-slate-100 px-5 pb-5 pt-4">
          <div>
            <label className="mb-1 block text-sm font-medium">শপের নাম</label>
            <input
              className={inputClass}
              placeholder="যেমন: রিয়া'স কালেকশন"
              value={draft.shopName}
              onChange={(e) => set("shopName", e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">ফোন / হোয়াটসঅ্যাপ</label>
            <input
              className={inputClass}
              inputMode="tel"
              placeholder="01XXXXXXXXX"
              value={draft.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">ঢাকায় ডেলিভারি</label>
              <input
                className={inputClass}
                inputMode="numeric"
                placeholder="৬০"
                value={draft.deliveryInside}
                onChange={(e) => set("deliveryInside", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">ঢাকার বাইরে</label>
              <input
                className={inputClass}
                inputMode="numeric"
                placeholder="১২০"
                value={draft.deliveryOutside}
                onChange={(e) => set("deliveryOutside", e.target.value)}
              />
            </div>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">পেমেন্ট পদ্ধতি</legend>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_OPTIONS.map((opt) => {
                const active = draft.payments.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => togglePayment(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      active
                        ? "border-brand-500 bg-brand-50 font-semibold text-brand-700"
                        : "border-slate-300 bg-white hover:border-brand-500"
                    }`}
                  >
                    {active ? "✓ " : ""}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label className="mb-1 block text-sm font-medium">ফেসবুক পেজ লিংক</label>
            <input
              className={inputClass}
              inputMode="url"
              placeholder="facebook.com/yourshop"
              value={draft.pageLink}
              onChange={(e) => set("pageLink", e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              className={`flex-1 rounded-xl px-4 py-2.5 font-semibold text-white transition ${
                saved ? "bg-green-600" : "bg-brand-500 hover:bg-brand-600"
              }`}
            >
              {saved ? "সেভ হয়েছে ✓" : "সেভ করুন"}
            </button>
            {hasProfile && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:border-red-300"
              >
                মুছে ফেলুন
              </button>
            )}
          </div>

          <p className="text-xs text-muted">🔒 তথ্য শুধু আপনার এই ডিভাইসে সেভ থাকে।</p>
        </div>
      )}
    </section>
  );
}
