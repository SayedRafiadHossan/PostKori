export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-gold-300/60 bg-ivory/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-3">
          {/* Monogram: Bangla "প" in an emerald seal with a gold ring */}
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 font-serif text-xl text-gold-100 ring-1 ring-accent-500 ring-offset-2 ring-offset-ivory">
            প
          </span>
          <span className="leading-none">
            <span className="block font-display text-[22px] font-semibold tracking-tight text-brand-500">PostKori</span>
            <span className="mt-1 block font-serif text-xs text-gold-600">ছবি দিন, পোস্ট নিন</span>
          </span>
        </a>
        <span className="rounded-full border border-accent-500/60 px-3 py-0.5 font-serif text-xs text-gold-600">
          বেটা
        </span>
      </div>
    </header>
  );
}
