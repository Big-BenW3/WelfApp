# Wella delivery checklist

## 1. Portable project foundation

- [ ] The project lives in a folder named `Wella` and runs as an ordinary local Next.js application.
- [ ] The source does not depend on Manus Auth, Manus database, Manus storage, or other Manus-tied application services.
- [ ] The project includes a useful README, `.env.example`, typed configuration, clean module boundaries, and documented local commands.
- [ ] The project uses a standard `DATABASE_URL` compatible with Neon PostgreSQL, committed SQL migrations, and a seed script.
- [ ] `public/manus-routes.json` declares every page route and excludes APIs/assets/system endpoints.

## 2. Public landing experience

- [ ] The `/` route is a polished seven-section landing page with a clear navbar, Login/Register CTAs, and a direct path into the student app.
- [ ] The visual system is light mode, minimalistic, smooth, and bold with white and dark blue as the primary colors.
- [ ] Green and red are reserved for success and error states.
- [ ] The layout is mobile-first and smooth on narrow screens; desktop remains simple and readable.
- [ ] The landing page uses tasteful, properly attributed illustration assets inspired by unDraw and avoids generic AI-slop visuals.
- [ ] Public HTML includes meaningful content, route metadata, Open Graph/Twitter metadata, and a canonical strategy that does not guess an internal URL.

## 3. Student auth and privacy

- [ ] Students can register and log in with email and password; OAuth is not included in this release.
- [ ] Passwords are hashed and auth endpoints are rate-limited.
- [ ] Sessions use HTTP-only cookies and work on local HTTP as well as public HTTPS Preview.
- [ ] Invalid email, weak password, duplicate email, expired session, and generic server-error states are handled clearly.
- [ ] Anonymous votes never expose voter identity through public UI or API responses.
- [ ] A student's own vote view can show their anonymous votes while other users see aggregate counts only.

## 4. Student issue workflow

- [ ] Students can create issues with title, description, required category, optional validated image metadata, and optional anonymous-posting toggle.
- [ ] Categories are Hostel, Academic, Sports, Health, and SUG.
- [ ] Issue cards show title, excerpt, category, vote counts, comment count, status, and timestamp.
- [ ] Home supports Trending, Newest, and Most Commented sorting with pagination or infinite-scroll-ready loading.
- [ ] Students can upvote/downvote each issue once, change or retract the vote, and toggle anonymity.
- [ ] Students can open issue detail, read official replies/comments, comment, report content, and see status changes.
- [ ] Search supports keyword search and category filter chips with useful empty states.
- [ ] Profile shows display name/email, own issues, own votes, account settings, logout, and delete-account affordance.
- [ ] Loading uses skeletons; optimistic votes roll back with a clear retry toast when a request fails.

## 5. Admin workflow

- [ ] `/admin` is role-gated and redirects or returns an appropriate unauthorized state for non-admin users.
- [ ] Admin dashboard shows open issues, resolved-this-week, top category, and a trending list.
- [ ] Admin can filter and manage issues by status, category, and date.
- [ ] Admin can move issues through Under Review, Seen, In Progress, Resolved, Rejected, and Duplicate.
- [ ] Admin can post official replies and moderate/hide comments or images.
- [ ] Admin mutations handle stale updates with a clear refresh message.

## 6. Security and maintainability

- [ ] Every write API validates and sanitizes input at the server boundary with explicit limits.
- [ ] Vote uniqueness is enforced at the database level with a unique user/issue key.
- [ ] Image payloads validate type/size metadata and fail inline without blocking issue text submission.
- [ ] API responses use consistent safe error envelopes and do not leak secrets or private identifiers.
- [ ] The code is readable, documented where behavior is non-obvious, and split into focused modules.

## 7. Validation and handoff

- [ ] TypeScript diagnostics, lint, and production build pass.
- [ ] The app listens on the configured port 3000 and key routes render in Preview.
- [ ] The route manifest responds with HTTP 200 and valid JSON.
- [ ] Local setup instructions cover `npm/pnpm install`, `.env.local`, migrations, seed, and `npm run dev`.
- [ ] The source is committed to the Wella project checkpoint without auto-publishing.
