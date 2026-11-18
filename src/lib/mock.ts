// Sample results used in Step 2 so we can build the UI before connecting the AI.
// Step 3 replaces this with a real Gemini call.

import type { GeneratedPost, Language, ProductDetails, Tone } from "./types";

const toneEmoji: Record<Tone, string> = {
  simple: "✨",
  premium: "💎",
  offer: "🔥",
  friendly: "😊",
};

export function getMockPost(
  details: ProductDetails,
  language: Language,
  tone: Tone,
): GeneratedPost {
  const name = details.name.trim() || (language === "en" ? "Cotton Three-Piece" : "কটন থ্রি-পিস");
  const price = details.price.trim() || "1250";
  const delivery =
    details.deliveryCharge.trim() ||
    (language === "en" ? "Inside Dhaka 60 Tk, outside Dhaka 120 Tk" : "ঢাকার ভিতরে ৬০ টাকা, বাইরে ১২০ টাকা");
  const emoji = toneEmoji[tone];

  if (language === "en") {
    return {
      description: `${name} made with soft, breathable fabric — perfect for everyday wear and special occasions. Neat stitching, colour that won't fade easily, and a comfortable fit for all-day use. ${details.details}`.trim(),
      caption: `${emoji} New arrival: ${name}! ${emoji}\n\nComfortable, stylish and made to last. Limited stock available — order before it's gone!\n\n📩 Inbox us to order now.`,
      hashtags: ["#NewArrival", "#OnlineShopBD", "#DhakaShopping", "#FashionBD", "#CashOnDelivery"],
      pricePost: `💰 Price: ${price} Tk\n🚚 Delivery: ${delivery}\n💵 Cash on delivery available\n📩 Inbox to order`,
    };
  }

  if (language === "mixed") {
    return {
      description: `${name} — soft আর comfortable fabric, daily use এবং special occasion দুটোর জন্যই perfect। Stitching একদম neat, রং সহজে উঠবে না। ${details.details}`.trim(),
      caption: `${emoji} New Collection চলে এসেছে! ${emoji}\n\n${name} — stylish, comfy আর long-lasting। Stock limited, তাই দেরি না করে এখনই order করুন!\n\n📩 Order করতে inbox করুন।`,
      hashtags: ["#NewCollection", "#OnlineShopBD", "#অনলাইন_শপ", "#FashionBD", "#CashOnDelivery"],
      pricePost: `💰 Price: ${price} টাকা\n🚚 Delivery: ${delivery}\n💵 Cash on delivery আছে\n📩 Order করতে inbox করুন`,
    };
  }

  return {
    description: `${name} — নরম ও আরামদায়ক কাপড়ে তৈরি, প্রতিদিনের ব্যবহার এবং বিশেষ অনুষ্ঠান দুটোর জন্যই মানানসই। সেলাই পরিপাটি, রং সহজে উঠবে না। ${details.details}`.trim(),
    caption: `${emoji} নতুন কালেকশন চলে এসেছে! ${emoji}\n\n${name} — স্টাইলিশ, আরামদায়ক আর টেকসই। স্টক সীমিত, তাই দেরি না করে আজই অর্ডার করুন!\n\n📩 অর্ডার করতে ইনবক্স করুন।`,
    hashtags: ["#নতুন_কালেকশন", "#অনলাইন_শপ", "#OnlineShopBD", "#ঢাকা", "#ক্যাশ_অন_ডেলিভারি"],
    pricePost: `💰 মূল্য: ${price} টাকা\n🚚 ডেলিভারি চার্জ: ${delivery}\n💵 ক্যাশ অন ডেলিভারি সুবিধা আছে\n📩 অর্ডার করতে পেজে ইনবক্স করুন`,
  };
}
