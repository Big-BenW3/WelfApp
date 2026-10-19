# Wella

Wella is a mobile-first SUG welfare issue tracker. Students can raise issues across hostel, academic, sports, health, and SUG matters; vote and comment; keep votes anonymous; and follow visible status updates. Welfare staff have a separate role-gated admin workspace.

The source is intentionally portable. It uses Next.js App Router, route handlers, PostgreSQL through a standard `DATABASE_URL`, and self-managed email/password sessions. It does not use Manus Auth, Manus database, Manus storage, OAuth, or provider-specific application APIs.

## Local setup

Use Node.js 20+ and pnpm 10+.

```bash
pnpm install
cp .env.example .env.local
# Set DATABASE_URL and SESSION_SECRET in .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`. `DATABASE_URL` is required — Wella no longer has a demo fallback and will fail fast without a database.

## Neon

Create a Neon PostgreSQL database, copy its pooled connection string into `DATABASE_URL`, and keep `sslmode=require` in the URL. Run the committed migration before starting the app. `pnpm db:seed` adds a student demo account, an admin demo account, and sample issues. Change the seeded passwords before any real deployment.

## Routes

- `/` — seven-section public landing page
- `/login`, `/register` — email/password auth
- `/app` — trending feed and create-issue entry point
- `/app/search` — keyword and category search
- `/app/profile` — own issues, votes, and session controls
- `/issues/:id` — detail, votes, comments, reports, and official replies
- `/admin` — role-gated welfare dashboard
- `/api/*` — JSON API route handlers

## API notes

Every write endpoint validates with zod and returns `{ "error": "..." }` for failures. Passwords are hashed with bcrypt. Sessions are signed with `SESSION_SECRET` and stored in an HTTP-only cookie. Anonymous vote records retain an internal user ID only for uniqueness; public issue projections return counts and never the anonymous voter identity. The database also enforces a unique `(issue_id, user_id)` vote key.

The MVP uses optimistic UI updates plus refresh/polling rather than WebSockets. Image uploads are represented by validated URLs and metadata until an S3-compatible storage adapter is selected; no storage provider is hard-coded into the application.

## Design assets

The landing page uses local SVG files downloaded from the official unDraw CDN with the Wella dark-blue color parameter. The source pages are Project feedback, Design community, and Analytics. Their license is documented at <https://undraw.co/license>. The visual direction is original to Wella and uses clean mobile patterns rather than copying any specific gallery or app.

## Commands

```bash
pnpm dev        # local development
pnpm typecheck  # TypeScript diagnostics
pnpm lint       # Next lint
pnpm build      # production build
pnpm db:migrate # apply committed SQL migrations
pnpm db:seed    # seed demo data
```
