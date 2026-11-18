"use client";

export type Option<T extends string> = {
  value: T;
  label: string;
  sub?: string;
};

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function OptionPicker<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <fieldset>
      <legend className="mb-2 font-serif text-base text-brand-500">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`rounded-lg border px-3.5 py-2 text-left text-sm transition ${
                active
                  ? "border-brand-500 bg-brand-500 text-gold-100 shadow-sm ring-1 ring-inset ring-accent-500/40"
                  : "border-slate-300 bg-white hover:border-accent-500"
              }`}
            >
              <span className="block font-semibold leading-tight">{opt.label}</span>
              {opt.sub && (
                <span className={`block text-xs ${active ? "text-gold-300" : "text-muted"}`}>{opt.sub}</span>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
