# PostKori — project guide for Claude Code

PostKori (ছবি দিন, পোস্ট নিন) is an AI web app for Bangladeshi Facebook (f-commerce) sellers.
A seller uploads a product photo, and Google Gemini writes a Facebook caption, product description,
price/delivery post and hashtags, in Bangla, English or Banglish.

- **Live:** https://postkori.vercel.app (Vercel, auto-deploys on every push to `main`)
- **Repo:** https://github.com/SayedRafiadHossan/PostKori
- **Owner:** Sayed Rafiad Hossan, a frontend developer in Dhaka. This is a portfolio project, so code quality and the README matter.

## How to work with me (the owner)

- Work **step by step**. Before each step, explain what you'll do and which files you'll touch, then **ask for my permission**. Wait for "yes".
- After a step: summarise what changed (a short table of files is good), tell me how to test it, and propose the next step.
- **Commit and push every finished step** to `main` with a clear message (`Step N: …` or `Fix: …`). Vercel deploys automatically. Check the deploy succeeded.
- Explain simply. English is fine. The app's UI text is in Bangla.

## Commands

```bash
npm install      # after pulling, or whenever package.json changes
npm run dev      # http://localhost:3000
npm run build    # production build — run before pushing big changes
```

The dev server must be restarted after changing `.env.local`.

## Environment variables

| Name | Where | Notes |
|---|---|---|
| `GEMINI_API_KEY` | `.env.local` + Vercel (Production & Preview) | Required. Never commit it, never print it. |
| `GEMINI_MODEL` | optional | Comma-separated model order. Default: `gemini-flash-lite-latest,gemini-flash-latest,gemini-2.5-flash` |
| `NEXT_PUBLIC_SITE_URL` | Vercel | `https://postkori.vercel.app`, used for share-image URLs |
| `RATE_LIMIT_PER_HOUR` | optional | Default 10 posts per visitor per hour (production only) |

Changing a Vercel env var needs a **redeploy** to take effect.

## Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4 (config lives in `src/app/globals.css` `@theme`, no tailwind.config file)
- `@google/genai` (Gemini), structured JSON output via `responseSchema`
- Fonts via `next/font/google`: Hind Siliguri (body), Tiro Bangla (serif headings), Playfair Display (wordmark)
- No database and no login yet. The shop profile and history live in `localStorage`.

## Project structure

```
src/
├── app/
│   ├── api/generate/route.ts   # POST: validation, rate limit, Gemini call with model fallback
│   ├── layout.tsx              # fonts, metadata, viewport themeColor
│   ├── page.tsx                # renders <PostKoriApp/>
│   ├── globals.css             # Tailwind v4 @theme tokens (Emerald & Gold design)
│   ├── icon.svg                # favicon
│   └── opengraph-image.tsx     # generated share image (English only: no Bangla font in OG renderer)
├── components/
│   ├── PostKoriApp.tsx         # main client component: all state, generate flow, history wiring
│   ├── Header.tsx / Footer.tsx
│   ├── ShopProfile.tsx         # "আমার শপ" collapsible card
│   ├── UploadBox.tsx           # drag/drop + preview, accepts ≤15MB (compressed before upload)
│   ├── DetailsForm.tsx         # name, price, delivery, details
│   ├── OptionPicker.tsx        # generic typed option buttons (language, tone, occasion)
│   ├── ResultCard.tsx          # output card + copy button; exports copyText()
│   └── PostHistory.tsx         # "আগের পোস্ট" list
└── lib/
    ├── types.ts                # Language, Tone, Occasion, ProductDetails, GeneratedPost, ShopProfile, PaymentMethod
    ├── prompt.ts               # buildPrompt(details, language, tone, shop?, occasion?): all prompt engineering
    ├── compressImage.ts        # canvas → JPEG, max 1280px
    ├── shopProfile.ts          # localStorage shop profile helpers
    ├── history.ts              # localStorage history (max 30), thumbnails (160px), postToText()
    ├── rateLimit.ts            # in-memory per-IP limiter (soft limit on Vercel)
    └── mock.ts                 # old sample data, unused (safe to delete)
```

## Features (done)

1. Photo → caption, description, price post, hashtags (Gemini, JSON schema)
2. Languages: `bn`, `en`, `mixed` (Banglish). Tones: `simple`, `premium`, `offer`, `friendly`
3. Occasions: `none`, `eid`, `puja`, `boishakh`, `winter`, `newArrival`, `flashSale`
4. Shop profile (name, phone, delivery inside/outside Dhaka, payments COD/bKash/Nagad/Rocket/Card, page link), added to every post
5. Post history with thumbnails: open, copy, delete, clear all
6. Image compression, rate limiting, Bangla error messages, regenerate, copy-all
7. Premium "Emerald & Gold" classic redesign

## Important details: don't break these

### Gemini call (`src/app/api/generate/route.ts`)
- **Model fallback:** models are tried in order. 503/500/"high demand"/per-call timeout → retry or next model. 404, 429 (quota is per model) or 400 → next model. Bad API key → stop immediately.
- **Thinking:** first try with `thinkingConfig: { thinkingBudget: 0 }` (faster). Lite models reject it with a generic 400, so `noThinkingModels` remembers them and skips the setting.
- **Time budget:** `maxDuration = 60` (Vercel Hobby max). 25s per call, 50s total, so we return a friendly 504 before Vercel kills the function.
- Logs: `[PostKori] answered by <model> in <ms>`, warnings for busy/skip, `[PostKori] Gemini error:` for failures. Check them in Vercel → Logs.
- History of real problems we hit: 30s Vercel timeout (thinking models), 503 "high demand", 400 from lite on thinkingConfig, 429 quota.

### Prompt rules (`src/lib/prompt.ts`)
- **Honesty:** never invent discounts, percentages, deadlines, delivery dates, fabric or brand. If no price is given, use a blank like `মূল্য: ___ টাকা`.
- Mention cash on delivery only if the seller selected it (or gave no payment methods).
- Festival greetings must be respectful.

### Design system (Emerald & Gold)
- Tokens in `globals.css`: `brand-*` = emerald (`#0f3d2e`), `accent-500` = antique gold (`#b08d57`), `gold-100/300/600`, `ivory` (`#fbf8f1`), `paper`, `ink`, `muted`. `slate-*` is overridden with warm neutrals.
- `h1/h2/h3` are globally Tiro Bangla serif, weight 400. Use `text-brand-500` for headings.
- One standout element: the heading band "ছবি দিন, পোস্ট নিন" with the gold ❖ ornament. Keep everything else calm: no emoji icons in headings, `rounded-xl/2xl`, thin warm borders, gold focus rings.
- Mobile-first. Most sellers use phones.

### Other
- `localStorage` access is always wrapped in try/catch, and loaded in `useEffect` (avoids hydration mismatch).
- Server validates everything from the client (`parseShop`, allowed languages/tones/occasions, image type ≤5MB).
- Keep the README up to date (features + roadmap) when adding features.

## Ideas for next steps (not started)

- Step 9: Google login + cloud sync with Supabase (profile + history, row-level security). The owner postponed this.
- Price tag / text overlay on the product photo
- Post directly to a Facebook page (Meta API)
- Strict global rate limit with Upstash Redis
- Delete `src/lib/mock.ts`; add basic tests for `prompt.ts` and `parseShop`
