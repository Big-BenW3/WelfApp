// ─── Admin status API (role-gated) ──────────────────────────────────────────
// PATCH /api/admin/issues/[id]/status { status, note? }
// requireSession("admin") rejects students; writes admin_actions audit row.
import { NextRequest } from "next/server";
import { error, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { updateIssueStatus } from "@/lib/store";
import { adminStatusSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSession("admin");
  if (!auth.ok) return error(auth.message, auth.status);
  const { id } = await context.params;
  const parsed = adminStatusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Choose a valid status.");
  const updated = await updateIssueStatus(
    id,
    parsed.data.status,
    auth.session.userId,
    parsed.data.note,
  );
  if (!updated)
    return error(
      "This issue was just updated or no longer exists. Refresh to see the latest state.",
      409,
    );
  return ok({ updated });
}
