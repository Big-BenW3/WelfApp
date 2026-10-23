import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("lib/rate-limit", () => {
  beforeEach(() => {
    // Reset the in-memory store between tests
    (rateLimit as any).entries?.clear?.();
  });

  it("allows requests under the limit", () => {
    const result = rateLimit("test:key", 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it("blocks requests over the limit", () => {
    rateLimit("test:key", 2, 60_000);
    rateLimit("test:key", 2, 60_000);
    const result = rateLimit("test:key", 2, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("tracks separate keys independently", () => {
    rateLimit("key:a", 1, 60_000);
    expect(rateLimit("key:b", 1, 60_000).allowed).toBe(true);
  });

  it("resets after the window expires", () => {
    const key = "reset:key";
    rateLimit(key, 1, 1); // 1ms window
    expect(rateLimit(key, 1, 1).allowed).toBe(false);
    // Wait for the 1ms window to expire
    return new Promise((resolve) => {
      setTimeout(() => {
        expect(rateLimit(key, 1, 60_000).allowed).toBe(true);
        resolve(undefined);
      }, 10);
    });
  });
});
