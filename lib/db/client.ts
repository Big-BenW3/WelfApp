// ─── DB client (lazy singleton) ─────────────────────────────────────────────
// getDatabase() returns null when DATABASE_URL is unset (store.ts then throws
// a clear error). hasDatabase() is the cheap check for guards. Uses `postgres`
// with prepare:false for Neon/pooler compatibility.
import postgres, { type Sql } from "postgres";

let client: Sql | null = null;

export function getDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!client) {
    client = postgres(url, {
      max: 5,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return client;
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}
