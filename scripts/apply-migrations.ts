/**
 * Applies every SQL file in db/migrations in filename order.
 * Idempotent by design: each migration uses IF NOT EXISTS guards.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/apply-migrations.ts
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const migrationsDir = join(process.cwd(), "db", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const sql = postgres(url, { prepare: false });

async function main() {
  for (const file of files) {
    const raw = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`--> applying ${file}`);
    try {
      await sql.unsafe(raw);
      console.log(`    OK ${file}`);
    } catch (error) {
      console.error(`    FAILED ${file}:`, (error as Error).message);
      process.exitCode = 1;
      break;
    }
  }
  await sql.end();
}

main();
