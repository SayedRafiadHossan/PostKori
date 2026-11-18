import type { Language, Occasion, PaymentMethod, ProductDetails, ShopProfile, Tone } from "./types";

const paymentNames: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  bkash: "bKash",
  nagad: "Nagad",
  rocket: "Rocket",
  card: "Card",
};

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

// Festival / campaign styles. Greetings must be respectful; never invent discounts or deadlines.
const occasionRules: Record<Occasion, string> = {
  none: "",
  eid: `Occasion: EID (ঈদ) shopping season.
- Open the caption with a warm Eid greeting ("ঈদ মোবারক 🌙" / "Eid Mubarak 🌙").
- Present the product as perfect for Eid — outfits, gifting for family, festive look — whatever fits the product.
- Gentle urgency: ordering early helps get it before Eid. Do NOT promise a guaranteed delivery date.
- Festive emojis like 🌙 ✨ 🎁. Include hashtags such as #EidCollection #ঈদ_কালেকশন #EidMubarak.`,
  puja: `Occasion: DURGA PUJA (শারদীয় দুর্গোৎসব) season.
- Open with a respectful greeting ("শুভ শারদীয়া 🪔" / "Happy Durga Puja").
- Present the product as great for Puja outfits, pandal hopping or gifting — whatever fits the product.
- Festive emojis like 🪔 🌺 ✨. Include hashtags such as #PujaCollection #শারদীয়া #DurgaPuja.`,
  boishakh: `Occasion: POHELA BOISHAKH (Bangla New Year).
- Open with "শুভ নববর্ষ 🎊" / "Shubho Noboborsho".
- Use a festive, cultural, red-and-white Boishakh mood; present the product as perfect for Boishakhi celebrations or gifts.
- Emojis like 🎊 🌸 🪘. Include hashtags such as #PohelaBoishakh #শুভ_নববর্ষ #বৈশাখী_কালেকশন.`,
  winter: `Occasion: WINTER collection / winter sale.
- Cozy, warm mood: highlight comfort and warmth for the cold season where it fits the product.
- Emojis like ❄️ 🧣 ☕. Include hashtags such as #WinterCollection #শীতের_কালেকশন #WinterSale.
- Only mention a sale or discount if the seller gave one; otherwise say "শীতের বিশেষ কালেকশন" / "winter special".`,
  newArrival: `Occasion: NEW ARRIVAL announcement.
- Excitement about something new: "নতুন এসেছে!" / "Just arrived!". Highlight freshness and that early buyers get first pick.
- Emojis like 🆕 ✨ 🛍️. Include hashtags such as #NewArrival #নতুন_কালেকশন.`,
  flashSale: `Occasion: FLASH SALE.
- High energy and urgency: "সীমিত সময়ের অফার" / "Limited-time offer", "স্টক শেষ হওয়ার আগেই".
- Do NOT invent a discount percentage, end time or quantity — use only what the seller gave; otherwise keep it general.
- Emojis like ⚡ ⏰ 🔥. Include hashtags such as #FlashSale #অফার #LimitedOffer.`,
};

function shopSection(shop: ShopProfile | null | undefined): string {
  if (!shop) return "";
  const delivery = [
    shop.deliveryInside && `inside Dhaka ${shop.deliveryInside} Tk`,
    shop.deliveryOutside && `outside Dhaka ${shop.deliveryOutside} Tk`,
  ]
    .filter(Boolean)
    .join(", ");
  const lines = [
    shop.shopName && `Shop name: ${shop.shopName}`,
    shop.phone && `Phone/WhatsApp for orders: ${shop.phone}`,
    delivery && `Delivery charge: ${delivery}`,
    shop.payments.length > 0 && `Payment methods: ${shop.payments.map((p) => paymentNames[p]).join(", ")}`,
    shop.pageLink && `Facebook page: ${shop.pageLink}`,
  ].filter(Boolean);
  if (lines.length === 0) return "";

  return `
Seller's saved shop information (use these details exactly — never change names, numbers or links):
${lines.join("\n")}

How to use the shop information:
- In "pricePost": if a shop name is given, start with a line like "🏪 <shop name>". Include the delivery charge (both inside and outside Dhaka if given). Add a line for each given item: "📞 <phone>" for orders, "💳 <payment methods>", "🔗 <page link>". Only include lines for information that was given.
- In "caption": mention the shop name naturally once, and if a phone number is given, include it in the call to action (e.g. "অর্ডার করতে ইনবক্স করুন অথবা কল করুন: 01XXXXXXXXX").
- If payment methods are given and "Cash on delivery" is not among them, do not promise cash on delivery.
`;
}

export function buildPrompt(
  details: ProductDetails,
  language: Language,
  tone: Tone,
  shop?: ShopProfile | null,
  occasion: Occasion = "none",
): string {
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

${shopSection(shop)}
${occasionRules[occasion]}
${languageRules[language]}
${toneRules[tone]}

Produce four things:

1. "description": a product description of 2–4 sentences. Mention what it is, look/material, and who or what occasion it suits. Include the seller's extra details if given. Do not invent specific facts you cannot see or were not told (e.g. exact fabric, brand, warranty).

2. "caption": a ready-to-post Facebook caption. Start with a short eye-catching hook line, then 2–3 short lines about the product, then a clear call to action (e.g. inbox to order). Use line breaks between parts. Emojis as per tone.

3. "hashtags": 8–12 relevant hashtags as an array of strings, each starting with '#', no spaces inside a tag (use _ instead). Mix Bangla and English tags that Bangladeshi buyers search for (e.g. product type, #OnlineShopBD, location like #Dhaka).

4. "pricePost": a short price & delivery block with one item per line, using emojis like 💰 🚚 💵 📩. Include price and delivery charge if given. If price is NOT given, write the price line with a blank placeholder like "মূল্য: ___ টাকা" (or "Price: ___ Tk" in English) so the seller can fill it in. Add a line for how to order. Mention cash on delivery only if the seller's payment methods include it, or if no payment methods were given.

Return ONLY the JSON object, nothing else.`;
}
