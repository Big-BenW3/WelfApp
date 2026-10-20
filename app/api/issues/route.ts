// ─── Issues API ─────────────────────────────────────────────────────────────
// GET  /api/issues?q=&category=&sort=  → public feed (no login needed)
// POST /api/issues                    → login required, validated by createIssueSchema
import { NextRequest } from "next/server";
import { error, ok } from "@/lib/api";
import { requireSession } from "@/lib/auth/session";
import { createIssue, listIssues } from "@/lib/store";
import { CATEGORIES, type Category, type SortMode } from "@/lib/types";
import { createIssueSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const categoryParam = params.get("category");
  const category = CATEGORIES.includes(categoryParam as Category) ? (categoryParam as Category) : undefined;
  const sortParam = params.get("sort");
  const sort = ["trending", "newest", "commented"].includes(sortParam ?? "") ? (sortParam as SortMode) : "trending";
  const issues = await listIssues({ query: params.get("q") ?? undefined, category, sort });
  return ok({ issues });
}

export async function POST(request: NextRequest) {
  const auth = await requireSession();
  if (!auth.ok) return error(auth.message, auth.status);
  const body = await request.json().catch(() => null);
  const parsed = createIssueSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check your issue details.");
  const issue = await createIssue(parsed.data, { id: auth.session.userId, displayName: auth.session.displayName });
  if (!issue) return error("Could not create the issue right now.", 500);
  return ok({ issue }, { status: 201 });
}
