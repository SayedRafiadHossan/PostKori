# 📸 PostKori — ছবি দিন, পোস্ট নিন

**An AI tool that turns a product photo into a ready-to-post Facebook post for Bangladeshi online sellers, in Bangla, English or Banglish.**

🔗 **Live demo:** [postkori.vercel.app](https://postkori.vercel.app) · Built by [Sayed Rafiad Hossan](https://www.linkedin.com/in/rafiadhossan)

---

## The problem

Bangladesh has hundreds of thousands of **f-commerce** sellers: small businesses that sell clothes, cosmetics, food and crafts through Facebook pages and groups. Every new product needs a caption, a description, hashtags and a price/delivery post, often in Bangla. Writing these every day takes time, and many sellers aren't confident writers.

## The solution

Upload a product photo, optionally add the price and a few details, and choose a language and tone. PostKori's AI looks at the photo and writes four things:

| Output | Example |
|---|---|
| 📣 **Facebook caption** | A hook line, a short pitch and a call to action ("অর্ডার করতে ইনবক্স করুন") |
| 📝 **Product description** | 2–4 sentences about look, material and occasion |
| 💰 **Price & delivery post** | Price, delivery charge, cash on delivery, how to order |
| #️⃣ **Hashtags** | 8–12 Bangla + English tags buyers actually search for |

Each one can be copied with one tap, or all of them at once, and pasted straight into Facebook.

## Features

- 🖼️ **Image understanding** with Google Gemini (multimodal AI)
- 🇧🇩 **3 language modes:** বাংলা, English, and Banglish (the mixed style real sellers use)
- 🎨 **4 tones:** Simple, Premium, Offer/Sale, Friendly
- ✅ **Honesty rules in the prompt:** never invents discounts, fabrics or brands it can't see
- 📱 **Mobile-first UI.** Most sellers work from their phones.
- ⚡ **Photos are compressed in the browser** before upload (5MB → ~300KB), so it's fast on mobile data
- 🔒 **API key stays on the server.** The browser only talks to our own API route.
- 🛡️ **Rate limiting** per visitor to protect the free AI quota
- 🔄 Regenerate, copy-all, Bangla error messages, loading states and social share image

## Tech stack

| Layer | Tech |
|---|---|
| Framework | **Next.js** (App Router) + **TypeScript** |
| Styling | **Tailwind CSS v4**, Hind Siliguri font (Bangla + Latin) |
| AI | **Google Gemini** via `@google/genai`, with structured JSON output (response schema) |
| Hosting | **Vercel** |

## How it works

```
Browser                              Next.js server (/api/generate)          Google Gemini
───────                              ──────────────────────────────          ─────────────
1. Seller picks photo + options
2. Photo compressed (canvas → JPEG)
3. POST multipart form  ───────────▶ 4. Rate limit + validate (type, size)
                                     5. Build prompt (language + tone rules)
                                     6. Send image + prompt + JSON schema ──▶ 7. Reads photo,
                                                                                writes post
                                     8. Parse JSON, clean hashtags ◀────────
9. Show 4 cards with copy buttons ◀─
```

## Project structure

```
src/
├── app/
│   ├── api/generate/route.ts   # Server route: validation, rate limit, Gemini call
│   ├── layout.tsx              # Fonts, SEO and share metadata
│   ├── page.tsx
│   ├── icon.svg                # Favicon
│   └── opengraph-image.tsx     # Generated social share image
├── components/
│   ├── PostKoriApp.tsx         # Main screen and state
│   ├── UploadBox.tsx           # Drag & drop / tap upload with preview
│   ├── DetailsForm.tsx         # Price, delivery and details
│   ├── OptionPicker.tsx        # Reusable typed option selector
│   ├── ResultCard.tsx          # Output card with copy button
│   └── Header.tsx / Footer.tsx
└── lib/
    ├── prompt.ts               # Prompt engineering (language + tone rules)
    ├── compressImage.ts        # Client-side image compression
    ├── rateLimit.ts            # Per-IP hourly limit
    └── types.ts
```

## Run locally

```bash
git clone https://github.com/SayedRafiadHossan/PostKori.git
cd PostKori
npm install
cp .env.example .env.local     # then add your GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000. Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey).

## Roadmap

- [x] Photo → caption, description, hashtags, price post
- [x] Bangla / English / Banglish + 4 tones
- [x] Image compression, rate limiting, share image
- [ ] Save shop profile (name, phone, delivery charges) and auto-add to every post
- [ ] Post history with login
- [ ] Festival templates (Eid, Puja, Boishakh offers)
- [ ] Price tag / text overlay on the product photo
- [ ] Post directly to a Facebook page

## Author

**Sayed Rafiad Hossan**, Frontend Developer (Next.js, React, Framer) from Dhaka, Bangladesh
[LinkedIn](https://www.linkedin.com/in/rafiadhossan) · [GitHub](https://github.com/SayedRafiadHossan)
