import { NextRequest } from "next/server";
import { error, ok } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { findUserByEmail } from "@/lib/db/repository";
import { rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!rateLimit(`login:${ip}`, 10, 60_000).allowed) return error("Too many attempts. Try again in a minute.", 429);
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return error("Enter a valid email and password.");
  const user = await findUserByEmail(parsed.data.email);
  const valid = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;
  if (!user || !valid) return error("Email or password not recognised.", 401);
  await createSession({ id: user.id, displayName: user.displayName, initials: user.displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(), role: user.role });
  return ok({ user: { displayName: user.displayName, email: user.email } });
}
