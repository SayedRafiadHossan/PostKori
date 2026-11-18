export type Language = "bn" | "en" | "mixed";

export type Tone = "simple" | "premium" | "offer" | "friendly";

export interface ProductDetails {
  name: string;
  price: string;
  details: string; // size, fabric, colour, etc.
  deliveryCharge: string;
}

export interface GeneratedPost {
  description: string;
  caption: string;
  hashtags: string[];
  pricePost: string;
}

export type PaymentMethod = "bkash" | "nagad" | "rocket" | "cod" | "card";

export interface ShopProfile {
  shopName: string;
  phone: string; // phone / WhatsApp for orders
  deliveryInside: string; // inside Dhaka, e.g. "60"
  deliveryOutside: string; // outside Dhaka, e.g. "120"
  payments: PaymentMethod[];
  pageLink: string; // Facebook page or website
}
