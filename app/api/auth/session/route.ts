// ─── Session API (client probe) ─────────────────────────────────────────────
// GET /api/auth/session → { session } or { session: null }. Lets client
// islands check login state without reading the httpOnly cookie directly.
import { ok } from "@/lib/api";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  return ok({ session: await getSession() });
}
