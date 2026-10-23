
import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;

  if (!url) {
    throw new Error("DATABASE_URL is missing");
  }

  const sql = postgres(url, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
  });

  try {
    console.log("Testing database connection...");

    const result = await sql`
      SELECT
        now() AS server_time,
        current_database() AS database_name,
        current_user AS database_user
    `;

    console.log("Database connection successful:", result[0]);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});