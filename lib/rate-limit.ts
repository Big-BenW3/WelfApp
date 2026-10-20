// ─── In-memory rate limiter (per server instance) ───────────────────────────
// Usage: rateLimit(`register:${ip}`, 6, 60_000). Guards auth + write routes.
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
