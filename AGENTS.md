<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Cursor Cloud specific instructions

The app is the Next.js project at the repository root. Use `npm ci` to install. `npm test` runs the Node test runner and does not need a database. `npm run lint` runs ESLint. `npx tsc --noEmit` typechecks. `npm run build` produces a production build. The dev server is `npm run dev -- --hostname 0.0.0.0 --port 3000` (http://localhost:3000).

Cloud Agent boot starts a local Supabase stack with the CLI native runtime and writes `.env.local` from that stack. Hosted Supabase credentials are not required. The API URL and keys are assigned when the stack starts, so read `.env.local` instead of hard-coding ports. `.env.local` is gitignored.

`supabase/schema.sql` is applied when `public.venues` is missing. `supabase/migrations/create-venue-for-owner.sql` is applied on boot. PostgREST exposes `public`, so boot also creates `public.create_venue_for_owner`, a wrapper around `private.create_venue_for_owner`, and grants `authenticated` usage on `private`. Other SQL files under `supabase/` (admin overview, page views, analytics) are not applied automatically.

A verified Cork venue, The Oliver Plunkett, and a featured event, Cloud Agent Trad Session, are seeded so the homepage and `/venues` have a listing. Consumer signup is `POST /api/auth/signup` with `accountType` set to `consumer`. Venue signup uses the same route with `accountType` set to `venue` and a valid Eircode such as `T12 W8RP`. New venues stay unverified until an admin approves them, so they do not appear on the public homepage.

Opening `/profile` in development logs a prerender warning about `Date.now()`. `npm run build` still completes.
