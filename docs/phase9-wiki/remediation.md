# Phase 9 remediations

## 2026-10-26 — [Safe fixes](fef638f6-609c-4262-ada5-65c1a5c70bee)

Landed: setup-database env-only secrets; login body without `session`; ESLint 10 errors cleared; robots/sitemap/noindex layouts; metadataBase; next/image + remotePatterns; forgot-password muted; homepage 50-cap note; phase9-gate tests. Quality gate then: 25 tests, 0 lint errors, build OK. Not committed.

**Correction:** service-role JWT was **not** in git history (gitignored local file only). Still rotate the key that lived on disk.

## 2026-10-26 — parent follow-up

- JSON-LD `serializeJsonLd` on event/venue detail + unit test
- A11y P0: skip link, auth `htmlFor`/`id`, password toggle names, filter chip 44px targets
- SEO: `/planner/plan` noindex + robots disallow; removed from sitemap; route metadata for `/`, `/events`, `/venues`, `/planner`, `/for-venues`
