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
