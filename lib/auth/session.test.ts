import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock next/headers cookies before importing session module.
// The mock keeps a real in-memory cookie jar so createSession() -> getSession()
// round-trips a genuinely signed JWT.
const jar = new Map<string, string>();
const mockCookies = {
  get: vi.fn((name: string) => {
    const value = jar.get(name);
    return value === undefined ? undefined : { name, value };
  }),
  set: vi.fn((name: string, value: string) => {
    jar.set(name, value);
  }),
};
vi.mock("next/headers", () => ({
  cookies: () => mockCookies,
}));

import { getSession, requireSession, createSession, clearSession } from "./session";
import { signSessionToken } from "./token";

const SECRET = "test-secret-at-least-32-chars-long";

describe("lib/auth/session", () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = SECRET;
    jar.clear();
    mockCookies.get.mockClear();
    mockCookies.set.mockClear();
  });

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
  });

  it("getSession returns null when no cookie", async () => {
    expect(await getSession()).toBeNull();
  });

  it("getSession returns null on invalid token", async () => {
    jar.set("wella_session", "invalid.token.here");
    expect(await getSession()).toBeNull();
  });

  it("getSession returns null for a token signed with a different secret", async () => {
    const token = await signSessionToken(
      { userId: "u1", displayName: "Student", initials: "ST", role: "student" },
      "a-completely-different-secret-value",
    );
    jar.set("wella_session", token);
    expect(await getSession()).toBeNull();
  });

  it("getSession returns null for a well-signed token missing required claims", async () => {
    const token = await signSessionToken(
      { userId: "u1", displayName: "Student", initials: "ST", role: "student" },
      SECRET,
    );
    // Tamper the payload while keeping a valid signature shape -> verify fails.
    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    delete payload.userId;
    parts[1] = Buffer.from(JSON.stringify(payload)).toString("base64url");
    jar.set("wella_session", parts.join("."));
    expect(await getSession()).toBeNull();
  });

  it("createSession stores an httpOnly cookie and getSession reads it back", async () => {
    await createSession({ id: "u1", displayName: "Student", initials: "ST", role: "student" });
    expect(mockCookies.set).toHaveBeenCalledTimes(1);
    const [name, , options] = mockCookies.set.mock.calls[0] as [string, string, { httpOnly?: boolean; path?: string; expires?: Date }?];
    expect(name).toBe("wella_session");
    expect(options).toMatchObject({ httpOnly: true, path: "/" });

    const session = await getSession();
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("u1");
    expect(session?.displayName).toBe("Student");
    expect(session?.initials).toBe("ST");
    expect(session?.role).toBe("student");
  });

  it("createSession defaults role to student when omitted", async () => {
    await createSession({ id: "u2", displayName: "No Role", initials: "NR" });
    const session = await getSession();
    expect(session?.role).toBe("student");
  });

  it("createSession preserves the admin role", async () => {
    await createSession({ id: "a1", displayName: "Admin", initials: "AD", role: "admin" });
    const session = await getSession();
    expect(session?.role).toBe("admin");
  });

  it("clearSession expires the cookie", async () => {
    await createSession({ id: "u1", displayName: "Student", initials: "ST", role: "student" });
    await clearSession();
    const [name, value, options] = mockCookies.set.mock.calls.at(-1)! as [string, string, { expires?: Date }?];
    expect(name).toBe("wella_session");
    expect(value).toBe("");
    expect(options?.expires).toBeInstanceOf(Date);
  });

  it("requireSession returns 401 when no session", async () => {
    const result = await requireSession();
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
    expect(result.message).toBe("Please log in to continue.");
  });

  it("requireSession returns 401 for an invalid token", async () => {
    jar.set("wella_session", "not-a-jwt");
    const result = await requireSession();
    expect(result.ok).toBe(false);
    expect(result.status).toBe(401);
  });

  it("requireSession allows a student session", async () => {
    await createSession({ id: "u1", displayName: "Student", initials: "ST", role: "student" });
    const result = await requireSession();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.session.userId).toBe("u1");
  });

  it("requireSession returns 403 for a student on an admin route", async () => {
    await createSession({ id: "u1", displayName: "Student", initials: "ST", role: "student" });
    const result = await requireSession("admin");
    expect(result.ok).toBe(false);
    expect(result.status).toBe(403);
    expect(result.message).toBe("You do not have access to this workspace.");
  });

  it("requireSession allows an admin session on an admin route", async () => {
    await createSession({ id: "a1", displayName: "Admin", initials: "AD", role: "admin" });
    const result = await requireSession("admin");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.session.role).toBe("admin");
  });
});
