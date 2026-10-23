// --- Report API --- */
// POST /api/issues/[id]/report { reason } -> login required.
// Persists to the reports table for welfare team review.
import { NextRequest } from "next/server";
import { error, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { addReportToDb } from "@/lib/db/repository";
import { reportSchema } from "@/lib/validation";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (!auth.ok) return error(auth.message, auth.status);
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return error("Tell us briefly what needs attention.");
  const report = await addReportToDb(id, auth.session.userId, parsed.data.reason);
  if (!report) return error("Issue not found.", 404);
  return ok({ received: true, message: "Thanks — the welfare team can review this report." });
}
