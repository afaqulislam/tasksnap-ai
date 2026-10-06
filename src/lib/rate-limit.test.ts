import { describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp, refundRateLimit } from "./rate-limit";

const WINDOW_MS = 10 * 60 * 1000;

function request(headers: Record<string, string>): Request {
  return new Request("https://example.com/api/analyze", { headers });
}

describe("checkRateLimit", () => {
  it("allows 10 requests per window and blocks the 11th", () => {
    const ip = "203.0.113.10";
    const now = Date.now();
    for (let i = 0; i < 10; i += 1) {
      expect(checkRateLimit(ip, now + i).ok).toBe(true);
    }
    const blocked = checkRateLimit(ip, now + 10);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
      expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(
        Math.ceil(WINDOW_MS / 1000),
      );
    }
  });

  it("slides the window as old hits expire", () => {
    const ip = "203.0.113.11";
    const now = Date.now();
    for (let i = 0; i < 10; i += 1) checkRateLimit(ip, now + i);
    expect(checkRateLimit(ip, now + 11).ok).toBe(false);
    expect(checkRateLimit(ip, now + 11 + WINDOW_MS).ok).toBe(true);
  });

  it("refunds a slot so failures do not burn quota", () => {
    const ip = "203.0.113.12";
    const now = Date.now();
    for (let i = 0; i < 10; i += 1) checkRateLimit(ip, now);
    expect(checkRateLimit(ip, now).ok).toBe(false);

    refundRateLimit(ip, now);
    expect(checkRateLimit(ip, now).ok).toBe(true);
  });

  it("ignores refunds when nothing was recorded", () => {
    expect(() => refundRateLimit("203.0.113.99")).not.toThrow();
  });
});

describe("getClientIp", () => {
  it("uses the last valid x-forwarded-for hop", () => {
    const req = request({ "x-forwarded-for": "198.51.100.1, 203.0.113.7" });
    expect(getClientIp(req)).toBe("203.0.113.7");
  });

  it("skips invalid hops instead of trusting client input", () => {
    const req = request({ "x-forwarded-for": "not-an-ip, 203.0.113.8" });
    expect(getClientIp(req)).toBe("203.0.113.8");
  });

  it("falls back to x-real-ip", () => {
    const req = request({ "x-real-ip": "203.0.113.9" });
    expect(getClientIp(req)).toBe("203.0.113.9");
  });

  it("returns a shared bucket when no header is usable", () => {
    expect(getClientIp(request({}))).toBe("unknown");
    expect(
      getClientIp(request({ "x-forwarded-for": "totally bogus" })),
    ).toBe("unknown");
  });
});
