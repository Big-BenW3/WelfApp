// ─── Seed script (local/dev only) ───────────────────────────────────────────
// pnpm db:seed - needs DATABASE_URL. Creates demo student + admin and three
// sample issues. Safe to re-run (upserts on email conflict).
import bcrypt from "bcryptjs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required to seed Wella.");
  process.exit(1);
}

const sql = postgres(url, { prepare: false });
const studentHash = await bcrypt.hash("wella-student-demo", 12);
const adminHash = await bcrypt.hash("wella-admin-demo", 12);
const [student] =
  await sql`insert into users (email, password_hash, display_name, role) values ('student@wella.local', ${studentHash}, 'Demo Student', 'student') on conflict (email) do update set display_name = excluded.display_name returning id`;
const [admin] =
  await sql`insert into users (email, password_hash, display_name, role) values ('admin@wella.local', ${adminHash}, 'Welfare Admin', 'admin') on conflict (email) do update set display_name = excluded.display_name returning id`;
await sql`insert into issues (title, description, category, status, author_id, author_name_snapshot) values
  ('Water pressure keeps dropping in Amina Hall', 'The upper floors have had unreliable water pressure for almost two weeks. It is worst between 6pm and 9pm.', 'Hostel', 'In Progress', ${student.id}, 'Demo Student'),
  ('Can we get a quiet study room open after 10pm?', 'The library closes before many students finish group work. A supervised late room would help during assessment weeks.', 'Academic', 'Seen', ${student.id}, 'Demo Student'),
  ('Publish a monthly welfare action update', 'A short update on issues being worked on would make it easier for students to follow progress.', 'SUG', 'Under Review', ${admin.id}, 'Welfare Admin')
  on conflict do nothing`;
await sql.end();
console.log(
  "Wella seed complete. Demo student: student@wella.local / wella-student-demo. Demo admin: admin@wella.local / wella-admin-demo.",
);
