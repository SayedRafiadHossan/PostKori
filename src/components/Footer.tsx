export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted sm:flex-row">
        <p>
          Made with ❤️ in Bangladesh by{" "}
          <a
            href="https://www.linkedin.com/in/rafiadhossan"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink hover:text-brand-500"
          >
            Sayed Rafiad Hossan
          </a>
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/SayedRafiadHossan/PostKori"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-500"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/rafiadhossan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-500"
          >
            LinkedIn
          </a>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs">Powered by Gemini</span>
        </div>
      </div>
    </footer>
  );
}
