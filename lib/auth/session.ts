// ─── Auth session (httpOnly JWT cookie) ─────────────────────────────────────
// Used by: API routes via requireSession() · pages via getSession().
// Roles: "student" (default) vs "admin" (Welfare office). Admin routes pass "admin".
import { cookies } from "next/headers";
import type { PublicUser } from "../types";
import { signSessionToken, verifySessionToken, type SessionClaims } from "./token";

const COOKIE_NAME = "wella_session";
const sessionSecret = process.env.SESSION_SECRET ?? "test-session-secret-for-dev-only";
const secret = sessionSecret;

export type { SessionClaims };

export async function createSession(user: PublicUser & { role?: string }) {
  const token = await signSessionToken(
    {
      userId: user.id,
      displayName: user.displayName,
      initials: user.initials,
      role: user.role ?? "student",
    },
    secret,
  );

  const store = await cookies();
  const isPreview =
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ||
    process.env.NODE_ENV === "production";
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isPreview,
    sameSite: isPreview ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export async function getSession(): Promise<SessionClaims | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token, secret);
}

export async function requireSession(role?: "admin") {
  const session = await getSession();
  if (!session) return { ok: false as const, status: 401, message: "Please log in to continue." };
  if (role === "admin" && session.role !== "admin")
    return {
      ok: false as const,
      status: 403,
      message: "You do not have access to this workspace.",
    };
  return { ok: true as const, session };
}
