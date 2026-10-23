// ─── Session token primitives ───────────────────────────────────────────────
// Pure JWT helpers with no Next.js imports, so they can be unit-tested
// without a request context and reused by API routes and server actions.
import { SignJWT, jwtVerify } from "jose";

export type SessionClaims = {
  userId: string;
  displayName: string;
  initials: string;
  role: string;
};

const encoder = new TextEncoder();

export async function signSessionToken(claims: SessionClaims, secret: string) {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encoder.encode(secret));
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(secret));
    if (!payload || typeof payload !== "object") return null;
    // Reject tokens missing the fields the app relies on, so a forged-but-
    // signed payload can never surface as an undefined user id.
    if (
      typeof payload.userId !== "string" ||
      typeof payload.displayName !== "string" ||
      typeof payload.initials !== "string"
    ) {
      return null;
    }
    return {
      userId: payload.userId,
      displayName: payload.displayName,
      initials: payload.initials,
      role: typeof payload.role === "string" ? payload.role : "student",
    };
  } catch {
    return null;
  }
}
