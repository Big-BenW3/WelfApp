// --- In-memory rate limiter (per server instance) --------------------------
// Usage: rateLimit(key, limit, windowMs). Guards auth + write routes.
// The `key` should include a trusted client IP - see API routes for examples.
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
 * - Uses x-forwarded-for when behind trusted proxies
 * - Falls back to socket remote address for direct connections
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

  // Not behind trusted proxy - try to get direct connection IP via socket
  // @ts-ignore - socket is available on NextRequest in Next.js
  const socket = (request as any).socket;
  if (socket?.remoteAddress) {
    return socket.remoteAddress.replace(/^::ffff:/, ""); // strip IPv6-mapped IPv4
  }

  return "local";
}
