// Post history saved in the seller's browser (localStorage).
// Each item keeps a tiny thumbnail so the list is easy to recognise without using much storage.

import type { GeneratedPost, Language, Occasion, Tone } from "./types";

const STORAGE_KEY = "postkori:history:v1";
export const MAX_HISTORY = 30;

export interface HistoryItem {
  id: string;
  createdAt: number; // timestamp (ms)
  thumb: string; // small JPEG as a data URL
  productName: string;
  language: Language;
  tone: Tone;
  occasion?: Occasion; // optional: posts saved before Step 8 don't have it
  post: GeneratedPost;
}

/** The full post as one block of text, ready to paste into Facebook */
export function postToText(post: GeneratedPost): string {
  return `${post.caption}\n\n${post.description}\n\n${post.pricePost}\n\n${post.hashtags.join(" ")}`;
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items = raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

/** Saves the list; if the browser storage is full, drops the oldest posts and tries again */
function persist(items: HistoryItem[]): HistoryItem[] {
  let list = items.slice(0, MAX_HISTORY);
  while (list.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return list;
    } catch {
      list = list.slice(0, -1); // remove the oldest and retry
    }
  }
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage blocked — history just won't be saved */
  }
  return [];
}

export function addToHistory(items: HistoryItem[], item: HistoryItem): HistoryItem[] {
  return persist([item, ...items]);
}

export function removeFromHistory(items: HistoryItem[], id: string): HistoryItem[] {
  return persist(items.filter((i) => i.id !== id));
}

export function clearHistory(): HistoryItem[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return [];
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Makes a small square-ish JPEG thumbnail (max 160px) from the product photo */
export async function makeThumbnail(file: File, maxSide = 160): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return "";
  }
}
