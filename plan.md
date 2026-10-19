# Wella — implementation plan

## Product scope

Wella is a mobile-first SUG welfare issue tracker. Students can browse a public feed, register and log in with email/password, create and track welfare issues, vote once per issue, comment, report content, and keep votes anonymous when needed. Admins use a separate role-gated `/admin` workspace to review issues, change status, post official replies, moderate content, and see lightweight analytics.

The first release intentionally excludes OAuth and Manus Auth. The application uses a standard `DATABASE_URL` for PostgreSQL/Neon and can be run locally with ordinary Node.js tooling. The server is responsible for authentication, authorization, validation, vote privacy, rate limiting, and database access. No Manus application APIs, Manus database, Manus storage, or Manus-specific auth are used in the source.

## Implementation approach

- **Framework:** Next.js App Router with TypeScript, server-rendered public pages, and route handlers under `app/api/**` for the REST API.
- **Persistence:** PostgreSQL via Neon-compatible `DATABASE_URL`, Drizzle ORM, SQL migrations, and a seed script. The schema preserves deleted-user references as display snapshots and never returns anonymous voter identity from public endpoints.
- **Auth:** Email/password accounts with `bcryptjs` password hashing, signed HTTP-only session cookies using `jose`, explicit role checks, CSRF-safe same-origin mutations, and a small in-process rate limiter for auth endpoints. The cookie uses `SameSite=None; Secure` on public HTTPS Preview and remains plain HTTP-compatible for local development.
- **Validation:** `zod` schemas at every write boundary, normalized strings, strict length limits, category/status enums, safe URL/image metadata checks, and consistent JSON error envelopes.
- **Uploads:** MVP uses validated image metadata and an attachment URL field so the database contract is ready for S3-compatible storage without coupling the app to a storage provider. The API rejects unsupported image types and oversized payloads; a later storage adapter can provide signed uploads.
- **Realtime:** The UI updates vote/comment counts optimistically and supports refresh/polling. WebSockets are intentionally deferred as a fast-follow, matching the PRD’s availability requirement.
- **Frontend:** Mobile-first shell with a bottom navigation pattern on small screens, a compact top navbar on larger screens, reusable issue cards, skeleton states, toasts, an issue detail route, and a dedicated admin layout. The first pass includes functional auth, feed/search/profile/create/detail/admin flows against demo data when no database is configured, while preserving the real Postgres paths for local Neon use.
- **Project hygiene:** `.env.example`, `README.md`, migrations, seed data, API notes, a route manifest at `public/manus-routes.json`, and typed modules separated by domain rather than a single large page file.

## Project structure

```text
Wella/
├── app/
│   ├── (public)/page.tsx              # seven-section landing page
│   ├── (auth)/login/page.tsx          # email/password login
│   ├── (auth)/register/page.tsx       # account creation
│   ├── app/page.tsx                   # student feed shell
│   ├── app/search/page.tsx            # search and category filters
│   ├── app/profile/page.tsx            # own issues, votes, account controls
│   ├── issues/[id]/page.tsx            # issue detail and comments
│   ├── admin/page.tsx                  # role-gated dashboard
│   ├── api/auth/*/route.ts             # register, login, logout, session
│   ├── api/issues/route.ts             # list/create issues
│   ├── api/issues/[id]/*/route.ts      # detail, vote, comment, moderation
│   └── api/admin/*/route.ts            # admin summaries and mutations
├── components/                         # presentational UI and shared shell
├── lib/
│   ├── auth/                           # sessions, password hashing, role checks
│   ├── db/                             # Drizzle client, schema, queries, seed data
│   ├── validation/                     # zod request schemas and sanitizers
│   ├── rate-limit.ts                   # small dependency-free limiter
│   └── demo-data.ts                     # preview fallback only
├── db/migrations/                      # committed SQL migrations
├── public/                             # icons, social preview, route manifest
├── scripts/seed.ts                     # local seed command
├── app.config.ts                       # project logo metadata
├── plan.md
├── TODO.md
├── README.md
├── .env.example
├── package.json
└── tsconfig.json
```

## Design

### Three candidate styles

- **Civic editorial utility** — 0.06: high-contrast type, restrained surfaces, and a public-service sense of order.
- **Soft neo-brutalist noticeboard** — 0.08: bold labels, tactile cards, and friendly status accents without visual noise.
- **Quiet mobile command centre** — 0.04: calm white space, compact data density, and confident navigation for quick campus use.

**Chosen direction: Civic editorial utility.** Wella should feel trustworthy and direct rather than decorative. It borrows the clarity of modern civic-service products and the calm density of polished mobile dashboards.

### Design movement

A contemporary civic editorial interface: oversized typographic statements, narrow content rails, quiet borders, and restrained card surfaces. The hierarchy should feel designed in type first, with illustration used as supporting evidence rather than hero decoration.

### Core principles

1. **Make action obvious:** every screen has one clear next step, especially “Create an issue”.
2. **Show the public record:** status, vote totals, comment activity, and official replies are easy to scan.
3. **Protect the person:** anonymous voting and posting are visually understandable without exposing identities.
4. **Design for the thumb:** controls are large, reachable, and forgiving on narrow screens.

### Color philosophy

White is the working canvas. Dark blue is the Wella signature: serious enough for welfare operations, warm enough to avoid institutional grey. Green and red only communicate outcomes and errors, never decoration. Use a soft blue-tinted border/surface for grouping without adding a third dominant brand color.

- Ink: `#102A43`
- Deep ink: `#0B1F33`
- Canvas: `#FFFFFF`
- Soft wash: `#F4F8FC`
- Line: `#D7E2ED`
- Success: `#18864B`
- Error: `#C83E4D`

### Layout paradigm

Use a left-aligned content rail with wide breathing room instead of centered marketing grids. On mobile, the rail becomes a single column with a fixed bottom navigation and a floating create action. On desktop, a simple two-column reading frame supports the issue feed without trying to fill every pixel.

### Signature elements

- A compact blue “signal mark” made from three rising bars, used in the wordmark and status accents.
- Thin ruled dividers and numbered section labels that make the landing page feel editorial.
- Rounded issue cards with a single blue edge or status stripe instead of noisy multi-color badges.

### Interaction philosophy

Interactions should feel immediate and dependable. Votes update optimistically, then confirm silently. Forms validate close to the field and preserve drafts when auth expires. Status changes and official replies use inline confirmation banners, not disruptive modal stacks. Focus rings are always visible, and touch targets are at least thumb-sized.

### Animation

Use short 160–220ms ease-out transitions for hover, focus, card lift, and sheet entry. Skeletons use a very light opacity shimmer only while data is loading. Avoid scroll-jacking, parallax, bouncing counters, or decorative animation that competes with issue content. Respect `prefers-reduced-motion` by removing transforms and shimmer.

### Typography system

Use `Inter` for utility text and `DM Sans` for the wordmark/large display copy when available, with a system fallback stack for offline local execution. Headlines use tight tracking and strong weight, body copy stays at a comfortable 1.55 line-height, and metadata uses compact 12–13px labels with generous contrast. The main landing H1 should be two or three lines on mobile, never a wall of text.

### Brand essence

**Wella turns scattered welfare complaints into a visible, accountable queue the student community can move together.** Personality: clear, protective, action-oriented.

### Brand voice

Headlines are plainspoken and active. CTAs are specific and reassuring.

- “Raise what needs fixing.”
- “See what the union is acting on.”

### Wordmark and logo

The Wella wordmark is set in a bold rounded sans with a three-bar signal mark replacing the cross-stroke of the first “l”. The mark can stand alone in the mobile navbar as three ascending blue bars inside a soft square.

### Signature brand color

`#102A43` — Wella Blue. It owns the interface, anchors navigation, and remains legible on white without relying on black.

## Build workflow

1. Scaffold the Next.js TypeScript project and install only the reviewed dependencies.
2. Add the route manifest, project metadata, environment example, database schema/migrations, and seed data before the first dev-server start.
3. Build the landing page and public shell first, then the auth flows, issue feed/detail/search/profile, and admin route.
4. Wire all write paths through zod validation and role/session guards; keep demo fallback data explicit and isolated.
5. Run typecheck/lint/build, verify the route manifest over HTTP, and inspect the public landing HTML and metadata.
6. Start the configured preview server on port 3000, validate key routes at mobile and desktop widths, and resolve any actionable diagnostics.
7. Commit the complete portable source to the project checkpoint without publishing; the user can clone or copy the Wella folder and run it locally with Neon.

## Scope boundary

OAuth, WebSockets, production object-storage uploads, email delivery for password reset, and advanced analytics are deliberately staged after the MVP. The code will leave clear extension points for each without introducing provider lock-in now.
