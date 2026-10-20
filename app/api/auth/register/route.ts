// ─── Register API ───────────────────────────────────────────────────────────
// POST /api/auth/register { email, password, displayName }
// Rate-limited per IP, then creates user + session cookie (see lib/auth/session).
import { NextRequest } from "next/server";
import { error, ok } from "@/lib/api";
import { createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { createUser, findUserByEmail } from "@/lib/db/repository";
import { rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`register:${ip}`, 6, 60_000).allowed) return error("Too many attempts. Try again in a minute.", 429);
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Check your details.");
  const existing = await findUserByEmail(parsed.data.email);
  if (existing) return error("An account with that email already exists.", 409);
  const user = await createUser(parsed.data.email, await hashPassword(parsed.data.password), parsed.data.displayName);
  if (!user) return error("Could not create the account right now.", 500);
  await createSession({ ...user, initials: parsed.data.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase() });
  return ok({ user: { displayName: parsed.data.displayName, email: parsed.data.email } }, { status: 201 });
}
