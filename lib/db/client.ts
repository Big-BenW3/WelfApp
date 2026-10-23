// ─── DB client (lazy singleton) ─────────────────────────────────────────────
// getDatabase() returns null when DATABASE_URL is unset (store.ts then throws
// a clear error). hasDatabase() is the cheap check for guards. Uses `postgres`
// with prepare:false for Neon/pooler compatibility.
// lib/db/client.ts

import postgres, { type Sql } from "postgres";

let client: Sql | null = null;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function getDatabase(): Sql | null {
  const url = process.env.DATABASE_URL;

  if (!url) {
    return null;
  }

  if (!client) {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error("DATABASE_URL is not a valid URL");
    }

    if (!["postgres:", "postgresql:"].includes(parsedUrl.protocol)) {
      throw new Error("DATABASE_URL must use the PostgreSQL protocol");
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        client = postgres(url, {
          max: 5,
          prepare: false,
          idle_timeout: 20,
          connect_timeout: 30,
          onnotice: () => {},
          onclose: () => {
            console.warn("[db] Database connection closed");
          },
        });
        return client;
      } catch (error) {
        lastError = error;
        if (attempt < 3) {
          // tiny backoff for cold Neon wake-up; avoids hard fail on first call
          const waitMs = 250 * attempt;
          setTimeout(() => undefined, waitMs);
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Unable to connect to the database");
  }

  return client;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
