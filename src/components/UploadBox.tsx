"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";

const MAX_SIZE_MB = 15; // big phone photos are fine — we shrink them before upload
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
};

export default function UploadBox({ file, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a temporary preview URL for the chosen photo, and clean it up afterwards
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleFile(f: File | undefined) {
    if (!f) return;
    if (!ACCEPTED.includes(f.type)) {
      setError("শুধু JPG, PNG বা WEBP ছবি দিন।");
      return;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`ছবির সাইজ ${MAX_SIZE_MB}MB এর কম হতে হবে।`);
      return;
    }
    setError(null);
    onChange(f);
  }

  function onInputChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
    e.target.value = ""; // allow picking the same file again
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={onInputChange}
      />

      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Product preview" className="mx-auto max-h-80 w-full object-contain" />
          <div className="absolute right-2 top-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow hover:bg-white"
            >
              পরিবর্তন
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-red-600 shadow hover:bg-white"
            >
              মুছুন
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
            dragging ? "border-brand-500 bg-brand-50" : "border-slate-300 bg-slate-50 hover:border-brand-500 hover:bg-brand-50"
          }`}
        >
          <div className="mb-3 text-4xl">🖼️</div>
          <p className="font-semibold">পণ্যের ছবি আপলোড করুন</p>
          <p className="mt-1 text-sm text-muted">ট্যাপ করুন বা ছবি এখানে টেনে আনুন</p>
          <p className="mt-2 text-xs text-muted">JPG, PNG, WEBP · সর্বোচ্চ {MAX_SIZE_MB}MB</p>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
