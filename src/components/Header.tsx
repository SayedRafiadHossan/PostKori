export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg text-white">
            📸
          </div>
          <div className="leading-tight">
            <p className="text-lg font-bold">
              Post<span className="text-brand-500">Kori</span>
            </p>
            <p className="text-xs text-muted">ছবি দিন, পোস্ট নিন</p>
          </div>
        </div>
        <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-500">
          Beta
        </span>
      </div>
    </header>
  );
}
