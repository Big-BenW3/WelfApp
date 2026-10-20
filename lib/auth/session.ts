// ─── Auth session (httpOnly JWT cookie) ─────────────────────────────────────
// Used by: API routes via requireSession() · pages via getSession().
// Roles: "student" (default) vs "admin" (Welfare office). Admin routes pass "admin".
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { PublicUser } from "../types";

const COOKIE_NAME = "wella_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "local-development-secret-change-me");

export async function createSession(user: PublicUser & { role?: string }) {
  const token = await new SignJWT({
    userId: user.id,
    displayName: user.displayName,
    initials: user.initials,
    role: user.role ?? "student",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const store = await cookies();
  const isPreview = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") || process.env.NODE_ENV === "production";
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

export async function getSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: String(payload.userId),
      displayName: String(payload.displayName),
      initials: String(payload.initials),
      role: String(payload.role ?? "student"),
    };
  } catch {
    return null;
  }
}

export async function requireSession(role?: "admin") {
  const session = await getSession();
  if (!session) return { ok: false as const, status: 401, message: "Please log in to continue." };
  if (role === "admin" && session.role !== "admin") return { ok: false as const, status: 403, message: "You do not have access to this workspace." };
  return { ok: true as const, session };
}
