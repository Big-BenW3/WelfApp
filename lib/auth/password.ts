// ─── Password hashing (bcrypt, cost 12) ─────────────────────────────────────
// hashPassword() at register/seed · verifyPassword() at login. Never store raw.
import bcrypt from "bcryptjs";

export function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
