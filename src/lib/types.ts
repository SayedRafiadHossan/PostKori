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
