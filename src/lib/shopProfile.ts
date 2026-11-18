// Saves the seller's shop details in their own browser (localStorage).
// No login needed — the profile stays on this phone/laptop. (Step 9 will add cloud sync.)

import type { PaymentMethod, ShopProfile } from "./types";

const STORAGE_KEY = "postkori:shop:v1";

export const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; promptLabel: string }[] = [
  { value: "cod", label: "ক্যাশ অন ডেলিভারি", promptLabel: "Cash on delivery" },
  { value: "bkash", label: "বিকাশ", promptLabel: "bKash" },
  { value: "nagad", label: "নগদ", promptLabel: "Nagad" },
  { value: "rocket", label: "রকেট", promptLabel: "Rocket" },
  { value: "card", label: "কার্ড", promptLabel: "Card" },
];

export const emptyShopProfile: ShopProfile = {
  shopName: "",
  phone: "",
  deliveryInside: "",
  deliveryOutside: "",
  payments: ["cod"],
  pageLink: "",
};

export function isProfileSet(p: ShopProfile): boolean {
  return Boolean(p.shopName || p.phone || p.deliveryInside || p.deliveryOutside || p.pageLink);
}

export function loadShopProfile(): ShopProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyShopProfile;
    return { ...emptyShopProfile, ...JSON.parse(raw) };
  } catch {
    return emptyShopProfile;
  }
}

export function saveShopProfile(profile: ShopProfile): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    return true;
  } catch {
    return false; // private mode / storage blocked
  }
}

export function clearShopProfile() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Turns saved delivery charges into a short line, e.g. "ঢাকায় ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা" */
export function deliveryText(p: ShopProfile): string {
  const parts: string[] = [];
  if (p.deliveryInside) parts.push(`ঢাকায় ${p.deliveryInside} টাকা`);
  if (p.deliveryOutside) parts.push(`ঢাকার বাইরে ${p.deliveryOutside} টাকা`);
  return parts.join(", ");
}
