const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_TRACKED_IPS = 500;

const hits = new Map<string, number[]>();

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(ip: string, now = Date.now()): RateLimitResult {
  const windowStart = now - WINDOW_MS;
  const timestamps = (hits.get(ip) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = timestamps[0] ?? now;
    return {
      ok: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((oldest + WINDOW_MS - now) / 1000),
      ),
    };
  }

  timestamps.push(now);
  hits.set(ip, timestamps);

  if (hits.size > MAX_TRACKED_IPS) {
    for (const [key, values] of hits) {
      if (values.every((t) => t <= windowStart)) hits.delete(key);
    }
  }

  return { ok: true };
}