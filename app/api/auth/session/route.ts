import { ok } from "@/lib/api";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  return ok({ session: await getSession() });
}
