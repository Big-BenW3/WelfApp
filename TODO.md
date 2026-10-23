# Wella delivery checklist

## 1. Portable project foundation

- [x] The project lives in a folder named `Wella` and runs as an ordinary local Next.js application.
- [x] The source does not depend on Manus Auth, Manus database, Manus storage, or other Manus-tied application services.
- [x] The project includes a useful README, `.env.example`, typed configuration, clean module boundaries, and documented local commands.
- [x] The project uses a standard `DATABASE_URL` compatible with Neon PostgreSQL, committed SQL migrations, and a seed script.
- [x] `public/manus-routes.json` declares every page route and excludes APIs/assets/system endpoints.

## 2. Public landing experience

- [x] The `/` route is a polished seven-section landing page with a clear navbar, Login/Register CTAs, and a direct path into the student app.
- [x] The visual system is light mode, minimalistic, smooth, and bold with white and dark blue as the primary colors.
- [x] Green and red are reserved for success and error states.
- [x] The layout is mobile-first and smooth on narrow screens; desktop remains simple and readable.
- [x] The landing page uses tasteful, properly attributed illustration assets inspired by unDraw and avoids generic AI-slop visuals.
- [x] Public HTML includes meaningful content, route metadata, Open Graph/Twitter metadata, and a canonical strategy that does not guess an internal URL.

## 3. Student auth and privacy

- [x] Students can register and log in with email and password; OAuth is not included in this release.
- [x] Passwords are hashed and auth endpoints are rate-limited.
- [x] Sessions use HTTP-only cookies and work on local HTTP as well as public HTTPS Preview.
- [x] Invalid email, weak password, duplicate email, expired session, and generic server-error states are handled clearly.
- [x] Anonymous votes never expose voter identity through public UI or API responses.
- [x] A student's own vote view can show their anonymous votes while other users see aggregate counts only.

## 4. Student issue workflow

- [x] Students can create issues with title, description, required category, optional validated image metadata, and optional anonymous-posting toggle.
- [x] Categories are Hostel, Academic, Sports, Health, and SUG.
- [x] Issue cards show title, excerpt, category, vote counts, comment count, status, and timestamp.
- [x] Home supports Trending, Newest, and Most Commented sorting with pagination or infinite-scroll-ready loading.
- [x] Students can upvote/downvote each issue once, change or retract the vote, and toggle anonymity.
- [x] Students can open issue detail, read official replies/comments, comment, report content, and see status changes.
- [x] Search supports keyword search and category filter chips with useful empty states.
- [x] Profile shows display name/email, own issues, own votes, account settings, logout, and delete-account affordance.
- [x] Loading uses skeletons; optimistic votes roll back with a clear retry toast when a request fails.

## 5. Admin workflow

- [x] `/admin` is role-gated and redirects or returns an appropriate unauthorized state for non-admin users.
- [x] Admin dashboard shows open issues, resolved-this-week, top category, and a trending list.
- [x] Admin can filter and manage issues by status, category, and date.
- [x] Admin can move issues through Under Review, Seen, In Progress, Resolved, Rejected, and Duplicate.
- [x] Admin can post official replies and moderate/hide comments or images.
- [x] Admin mutations handle stale updates with a clear refresh message.

## 6. Security and maintainability

- [x] Every write API validates and sanitizes input at the server boundary with explicit limits.
- [x] Vote uniqueness is enforced at the database level with a unique user/issue key.
- [x] Image payloads validate type/size metadata and fail inline without blocking issue text submission.
- [x] API responses use consistent safe error envelopes and do not leak secrets or private identifiers.
- [x] The code is readable, documented where behavior is non-obvious, and split into focused modules.

## 7. Validation and handoff

- [x] TypeScript diagnostics, lint, and production build pass.
- [x] The app listens on the configured port 3000 and key routes render in Preview.
- [x] The route manifest responds with HTTP 200 and valid JSON.
- [x] Local setup instructions cover `npm/pnpm install`, `.env.local`, migrations, seed, and `npm run dev`.
- [x] The source is committed to the Wella project checkpoint without auto-publishing.
