import { error, ok } from "@/lib/api";
import { getIssue } from "@/lib/store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const issue = await getIssue(id);
  if (!issue) return error("Issue not found.", 404);
  return ok({ issue });
}
