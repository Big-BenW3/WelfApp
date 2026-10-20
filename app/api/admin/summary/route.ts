// ─── Admin summary API (role-gated) ─────────────────────────────────────────
// GET /api/admin/summary → open/resolved counts + trending. Feeds AdminDashboard.
import { error, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { getAdminSummary } from "@/lib/store";

export async function GET() {
  const auth = await requireSession("admin");
  if (!auth.ok) return error(auth.message, auth.status);
  return ok({ summary: await getAdminSummary() });
}
