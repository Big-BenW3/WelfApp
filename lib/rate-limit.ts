// ─── In-memory rate limiter (per server instance) ───────────────────────────
// Usage: rateLimit(key, limit, windowMs). Guards auth + write routes.
// The `key` should include a trusted client IP — see API routes for examples.
// NOTE: resets on redeploy; swap for Redis/Upstash before horizontal scaling.
type Entry = { count: number; resetAt: number };

const entries = new Map<string, Entry>();

export function rateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const current = entries.get(key);
  if (!current || current.resetAt <= now) {
    entries.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }
  current.count += 1;
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count) };
}

/**
 * Extract client IP from a Next.js NextRequest safely.
 * - If behind a trusted reverse proxy, x-forwarded-for can be trusted
 * - Otherwise, use request.ip which is the direct connection IP
 * - Never trust x-forwarded-for from an untrusted source
 *
 * Example usage in API routes:
 *   const ip = getTrustedIp(request, ["192.168.1.1", "10.0.0.1"]);
 *   rateLimit(`login:${ip}`, 10, 60_000);
 *
 * @param request - Next.js NextRequest
 * @param trustedProxies - Optional array of trusted proxy IPv4/IPv6 addresses
 */
export function getTrustedIp(
  request: import("next/server").NextRequest,
  trustedProxies: string[] = []
): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (trustedProxies.length > 0) {
    // Check if the direct connection IP matches a trusted proxy
    const remoteAddr = request.headers.get("x-real-ip") || "";
    if (trustedProxies.includes(remoteAddr)) {
      // First IP in x-forwarded-for chain is the original client
      return forwardedFor?.split(",")[0].trim() ?? "local";
    }
  }

  // Not behind a trusted proxy - use the direct connection IP
  // In Next.js, NextRequest.ip gives the direct connection IP
  return request.ip ?? "local";
}