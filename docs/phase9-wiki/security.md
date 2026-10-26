# Phase 9 security findings

Ingested 2026-10-26 from [Security audit](5f606d56-619b-4141-9710-8219a4a6f821) at commit `aa94049`. Do not print secret values.

## Pre-implementation blockers

| # | Severity | Issue | Phase 9 action |
|---|----------|--------|----------------|
| C1 | Critical | Base UPDATE policies allow role/self-verify unless `admin-overview.sql` triggers live | **Stop** — human must confirm applied SQL; no RLS edits yet |
| C2 | Critical | Base SELECT allows all venues / published events without verified gate | **Stop** — same verification |
| C3 | Critical | Local `setup-database.mjs` hardcoded service-role fallback (gitignored, not in commit) | Safe: strip fallbacks; human: **rotate key** |
| H1 | High | `/api/auth/login` returns full `session` tokens | Safe: remove from JSON |
| H2 | High | JSON-LD `dangerouslySetInnerHTML` + `JSON.stringify` script breakout | Safe: escape `<` → `\u003c` helper |
| H3 | High | Seed scripts weak hardcoded passwords (gitignored) | Document; refuse prod; do not run against prod |
| H4 | High | Signup/venue service-role insert / role promotion | **Stop** — architectural; report only |

## Auth & authorisation (summary)

- Middleware + page checks for dashboard/admin are sound **if** env present; missing Supabase env fails open (Medium) — fail closed in prod preferred.
- Favourites isolation: good (generation cache + RLS).
- `safeExternalUrl` / `safeNextPath` / ticket validation: good.
- Planner API public by design (Low); rate-limit later.
- Auth APIs lack rate limiting (Medium).

## Input / URL

- Social URLs: any https accepted before handle fallback (Medium) — allowlist hosts.
- Image URLs not validated as https (Low–Medium).
- `tel:`/`mailto:` weakly validated (Low).
- Uploads + storage policies: sound.
- No CSP / security headers (Medium).

## Secrets

- `.env*` gitignored — good.
- Rotate service-role key that lived in setup script; scrub local file.
- Confirm seed demo users absent from production.

## Positive controls

Middleware role gates; admin action re-check; favourites RLS; storage owner folders; `rel="noopener noreferrer"`; ticket URL sanitize on write/read.

## Recommended order

1. Rotate service-role key; strip setup fallbacks.
2. Verify live DB has `admin-overview.sql` (+ related).
3. Stop returning login `session`.
4. Harden JSON-LD serialization.
5. Rate limits, CSP, social host allowlists (may defer).
6. Confirm no seed users in production.
