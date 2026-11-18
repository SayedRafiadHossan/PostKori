export default function Footer() {
  return (
    <footer className="mt-14 bg-brand-500 text-gold-100">
      <div className="h-px bg-gradient-to-r from-transparent via-accent-500 to-transparent" />
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-display text-lg text-white">PostKori</p>
          <p className="mt-1 text-gold-300">
            বাংলাদেশের অনলাইন বিক্রেতাদের জন্য তৈরি ·{" "}
            <a
              href="https://www.linkedin.com/in/rafiadhossan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-accent-500 underline-offset-4 hover:decoration-2"
            >
              Sayed Rafiad Hossan
            </a>
          </p>
        </div>
        <nav className="flex items-center gap-5">
          <a
            href="https://github.com/SayedRafiadHossan/PostKori"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/rafiadhossan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            LinkedIn
          </a>
          <span className="rounded-full border border-accent-500/50 px-3 py-0.5 text-xs text-gold-300">
            Powered by Gemini
          </span>
        </nav>
      </div>
    </footer>
  );
}
