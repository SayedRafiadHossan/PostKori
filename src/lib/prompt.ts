import type { Language, ProductDetails, Tone } from "./types";

const languageRules: Record<Language, string> = {
  bn: "Write everything in natural, fluent Bangla (Bengali script). Use Bangla digits for prices (e.g. ১২৫০ টাকা). Avoid English words unless they are very common brand/product terms.",
  en: "Write everything in simple, clear English that Bangladeshi buyers easily understand. Use 'Tk' for prices.",
  mixed:
    "Write in the 'Banglish' style that Bangladeshi Facebook sellers commonly use: Bangla script sentences mixed naturally with common English words (e.g. 'New Collection চলে এসেছে', 'order করতে inbox করুন'). Prices in English digits with টাকা.",
};

const toneRules: Record<Tone, string> = {
  simple: "Tone: simple, clear and trustworthy. Minimal emojis (2–4 total in the caption).",
  premium:
    "Tone: elegant and premium. Highlight quality, craftsmanship and exclusivity. Tasteful emojis only (✨💎🤍).",
  offer:
    "Tone: exciting sale/offer post. Create urgency (limited stock, limited time) without making false claims. Energetic emojis (🔥🎉⚡). If no discount is given, do NOT invent a percentage — say 'বিশেষ অফার' / 'special offer' instead.",
  friendly:
    "Tone: warm and friendly, like a trusted apu/bhai talking to customers. Conversational, a few cheerful emojis.",
};

export function buildPrompt(details: ProductDetails, language: Language, tone: Tone): string {
  const given = [
    details.name && `Product name: ${details.name}`,
    details.price && `Price: ${details.price} Tk`,
    details.deliveryCharge && `Delivery charge: ${details.deliveryCharge}`,
    details.details && `Extra details from seller: ${details.details}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are an expert copywriter for Bangladeshi Facebook (f-commerce) shops. You write posts that sell: clear, attractive and honest.

Look carefully at the product photo. Identify the product, its colour, material/style and anything that makes it attractive.

Seller's information:
${given || "(The seller gave no extra information — rely on the photo.)"}

${languageRules[language]}
${toneRules[tone]}

Produce four things:

1. "description": a product description of 2–4 sentences. Mention what it is, look/material, and who or what occasion it suits. Include the seller's extra details if given. Do not invent specific facts you cannot see or were not told (e.g. exact fabric, brand, warranty).

2. "caption": a ready-to-post Facebook caption. Start with a short eye-catching hook line, then 2–3 short lines about the product, then a clear call to action (e.g. inbox to order). Use line breaks between parts. Emojis as per tone.

3. "hashtags": 8–12 relevant hashtags as an array of strings, each starting with '#', no spaces inside a tag (use _ instead). Mix Bangla and English tags that Bangladeshi buyers search for (e.g. product type, #OnlineShopBD, location like #Dhaka).

4. "pricePost": a short price & delivery block with one item per line, using emojis like 💰 🚚 💵 📩. Include price and delivery charge if given. If price is NOT given, write the price line with a blank placeholder like "মূল্য: ___ টাকা" (or "Price: ___ Tk" in English) so the seller can fill it in. Always add a line for cash on delivery and how to order.

Return ONLY the JSON object, nothing else.`;
}
