import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("lib/auth/password", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("StrongPass123!");
    expect(typeof hash).toBe("string");
    expect(hash.length).toBeGreaterThan(0);
    expect(await verifyPassword("StrongPass123!", hash)).toBe(true);
  });
  it("rejects wrong password", async () => {
    const hash = await hashPassword("StrongPass123!");
    expect(await verifyPassword("WrongPass123!", hash)).toBe(false);
  });
  it("produces different hashes for same password (bcrypt salt)", async () => {
    const h1 = await hashPassword("SamePassword123");
    const h2 = await hashPassword("SamePassword123");
    expect(h1).not.toBe(h2);
  });
});
