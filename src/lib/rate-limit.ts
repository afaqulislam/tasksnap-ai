const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_TRACKED_IPS = 500;
const PRUNE_EVERY_OP = 64;

const hits = new Map<string, number[]>();
let ops = 0;

const IPV4_RE = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_RE = /^[0-9a-fA-F:]{2,45}$/;

function isValidIp(value: string): boolean {
  if (IPV4_RE.test(value)) {
    const parts = value.split(".");
    return parts.every((part) => Number(part) >= 0 && Number(part) <= 255);
  }
  return IPV6_RE.test(value) && value.includes(":");
}

function pruneExpired(now: number): void {
  const windowStart = now - WINDOW_MS;
  for (const [key, values] of hits) {
    if (values.every((t) => t <= windowStart)) hits.delete(key);
  }
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSeconds: number };

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    for (const hop of forwarded.split(",")) {
      const candidate = hop.trim().toLowerCase();
      if (candidate && isValidIp(candidate)) return candidate;
    }
  }
  const real = request.headers.get("x-real-ip")?.trim().toLowerCase();
  if (real && isValidIp(real)) return real;
  return "unknown";
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

  ops += 1;
  if (ops % PRUNE_EVERY_OP === 0) {
    pruneExpired(now);
  }
  if (hits.size > MAX_TRACKED_IPS) {
    pruneExpired(now);
    for (const key of hits.keys()) {
      if (hits.size <= MAX_TRACKED_IPS) break;
      hits.delete(key);
    }
  }

  return { ok: true };
}