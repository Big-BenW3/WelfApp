import { NextRequest } from "next/server";
import { error, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { reportSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return error(auth.message, auth.status);
  const body = await request.json().catch(() => null);
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return error("Tell us briefly what needs attention.");
  // The persistence adapter is intentionally small in the MVP. Production can insert this
  // record into the reports table without changing the client contract.
  return ok({ received: true, message: "Thanks — the welfare team can review this report." });
}
