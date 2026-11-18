// Simple in-memory rate limiter: max N requests per visitor (IP) per hour.
// Protects the free Gemini quota from being used up by one person or a bot.
//
// Note: on Vercel each server instance has its own memory, so this is a "soft" limit.
// For a strict global limit later, swap this for Upstash Redis (@upstash/ratelimit).

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const LIMIT = Number(process.env.RATE_LIMIT_PER_HOUR) || 10;

const hits = new Map<string, number[]>();

export type RateLimitResult = { ok: true; remaining: number } | { ok: false; retryAfterMin: number };

export function rateLimit(key: string): RateLimitResult {
  // Don't limit yourself while developing on localhost
  if (process.env.NODE_ENV !== "production") return { ok: true, remaining: LIMIT };

  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= LIMIT) {
    hits.set(key, recent);
    return { ok: false, retryAfterMin: Math.ceil((WINDOW_MS - (now - recent[0])) / 60_000) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep memory small: drop visitors with no recent requests
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (!times.some((t) => now - t < WINDOW_MS)) hits.delete(k);
    }
  }

  return { ok: true, remaining: LIMIT - recent.length };
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}
