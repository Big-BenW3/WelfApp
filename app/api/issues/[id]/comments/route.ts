// --- Comment API ---
// POST /api/issues/[id]/comments { body, isAnonymous } -> login required.
// Validated by commentSchema; anonymous authors hidden from public reads.
import { NextRequest } from "next/server";
import { error, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { addComment } from "@/lib/store";
import { commentSchema } from "@/lib/validation";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireSession();
  if (!auth.ok) return error(auth.message, auth.status);
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Write a valid comment.");
  const comment = await addComment(
    id,
    parsed.data.body,
    { id: auth.session.userId, displayName: auth.session.displayName },
    parsed.data.isAnonymous,
  );
  if (!comment) return error("Issue not found.", 404);
  return ok({ comment }, { status: 201 });
}
