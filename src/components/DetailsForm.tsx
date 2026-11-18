"use client";

import type { ProductDetails } from "@/lib/types";

type Props = {
  value: ProductDetails;
  onChange: (value: ProductDetails) => void;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base outline-none transition placeholder:text-slate-400 focus:border-accent-500 focus:ring-2 focus:ring-gold-100";

export default function DetailsForm({ value, onChange }: Props) {
  function set<K extends keyof ProductDetails>(key: K, v: string) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">পণ্যের নাম</label>
        <input
          className={inputClass}
          placeholder="যেমন: কটন থ্রি-পিস"
          value={value.name}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">দাম (টাকা)</label>
          <input
            className={inputClass}
            inputMode="numeric"
            placeholder="১২৫০"
            value={value.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">ডেলিভারি চার্জ</label>
          <input
            className={inputClass}
            placeholder="ঢাকায় ৬০, বাইরে ১২০"
            value={value.deliveryCharge}
            onChange={(e) => set("deliveryCharge", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">অন্যান্য তথ্য</label>
        <textarea
          className={`${inputClass} min-h-20 resize-y`}
          placeholder="সাইজ, কাপড়, রং ইত্যাদি — যেমন: ফ্রি সাইজ, সুতি কাপড়, ৩টি রং"
          value={value.details}
          onChange={(e) => set("details", e.target.value)}
        />
      </div>

      <p className="text-xs text-muted">সব ঘর ঐচ্ছিক — যত বেশি তথ্য দেবেন, পোস্ট তত ভালো হবে।</p>
    </div>
  );
}
