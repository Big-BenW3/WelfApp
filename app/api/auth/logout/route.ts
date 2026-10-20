// ─── Logout API ─────────────────────────────────────────────────────────────
// POST /api/auth/logout → clears the session cookie. Used by profile screen.
import { clearSession } from "@/lib/auth/session";
import { ok } from "@/lib/api";

export async function POST() {
  await clearSession();
  return ok({ signedOut: true });
}
