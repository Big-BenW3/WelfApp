// ─── Vote API ───────────────────────────────────────────────────────────────
// POST /api/issues/[id]/vote { direction: "up" | "down" | null }
// Login required; one vote per user per issue (upsert on conflict).
import { NextRequest } from "next/server";
import { error, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { voteIssue } from "@/lib/store";
import { voteSchema } from "@/lib/validation";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (!auth.ok) return error(auth.message, auth.status);
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) return error("Choose an upvote, downvote, or remove your vote.");
  const result = await voteIssue(id, auth.session.userId, parsed.data.direction, parsed.data.isAnonymous);
  if (!result) return error("Issue not found.", 404);
  return ok({ counts: result });
}
