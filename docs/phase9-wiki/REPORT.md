# Phase 9 — Production readiness report

**Date:** 2026-10-26  
**Branch:** `feature/ui-redesign` (uncommitted Phase 9 changes on top of `aa94049`)  
**Scope:** Production hardening only. No deploy, merge, or push.

---

## 1. Executive summary

Phase 9 audited security, SEO, accessibility, images, performance, query limits, timezone/tickets (automated), mobile chrome, and lint/build. Safe remediations were applied. **Release is blocked** on live RLS/trigger verification, service-role key rotation, and an authenticated venue-owner walkthrough. Client listing loads could not be confirmed in the Cursor IDE browser (effects inert there) though `/api/planner` responds 200 when called directly.

**Recommendation: NOT READY FOR RELEASE**

---

## 2. Security findings by severity

| Severity | IDs | Summary | Status |
|---|---|---|---|
| Critical | C1–C2 | Base schema UPDATE/SELECT insufficient without `admin-overview.sql` triggers/policies | **Stop** — human must confirm live DB |
| Critical | C3 | Local `setup-database.mjs` had hardcoded service-role fallback (gitignored; **not** in git history) | Fallback removed; **rotate key** still required |
| High | H1 | Login API returned full `session` tokens | **Fixed** — `{ success, user, role }` only |
| High | H2 | JSON-LD script breakout via `JSON.stringify` | **Fixed** — `serializeJsonLd` |
| High | H3 | Signup/venue service-role insert fallback | Untouched (architectural) |
| High | H4 | Privilege escalation if protect_* triggers missing | Same as C1 — verify live |
| Medium | — | Auth rate limits, CSP headers, social host allowlists, fail-open middleware if env missing | Debt |
| Low / Info | — | Favourites isolation + `safeExternalUrl`/`safeNextPath` sound; uploads sound | OK |

Full detail: [security.md](./security.md). Source audit: [Security audit](5f606d56-619b-4141-9710-8219a4a6f821).

---

## 3. SEO audit results

| Area | Result |
|---|---|
| Event/venue detail titles, canonicals, OG, honest JSON-LD | Pass |
| `metadataBase`, `robots.ts`, `sitemap.ts` | **Implemented** |
| Private/auth `noindex` + `/planner/plan` noindex/disallow | **Implemented** |
| Route metadata for `/`, `/events`, `/venues`, `/planner`, `/for-venues` | **Implemented** |
| Crawlable HTML on client-fetched listings | Gap (known) |
| Dynamic event/venue slugs in sitemap | Deferred (static routes only) |

---

## 4. Accessibility findings

P0 applied: skip link, auth `htmlFor`/`id`, password toggle names, 44px filter-chip remove targets. Remaining: Leaflet keyboard/AT, navbar focus trap, contrast sampling, full AT pass — **not claimed WCAG compliant**. See [a11y-perf.md](./a11y-perf.md).

---

## 5. Performance measurements

No Lighthouse run in this environment (not claimed). Code review: Leaflet dynamically imported; events disclose 50-cap; home 50-pool can silently miss featured (debt); venues discovery uncapped (debt). Additive pagination proposed, not implemented.

---

## 6. Image optimisation changes

`next.config.ts` `remotePatterns` from `NEXT_PUBLIC_SUPABASE_URL`; EventCard, VenueCard, detail heroes, dashboard previews migrated to `next/image`.

---

## 7. Authenticated dashboard test results

| Check | Result |
|---|---|
| Anonymous `/dashboard` → login | Pass |
| Venue-owner create/edit/upload walkthrough | **RELEASE BLOCKER — unverified** (no non-prod credentials) |

---

## 8. Mobile regression results

See [mobile-regression.md](./mobile-regression.md). MobileNav @320, footer clearance, overflow sampled: Pass. Ticket sticky bar: Unverified (no `ticket_url` fixtures). Listing/planner client loads: Unverified in Cursor browser after investigation. Filter dialog live open: Unverified.

---

## 9. Timezone and ticket test results

Automated (`phase4` + `phase9` gates): Dublin DST spring/fall, ticket URL http(s) allow / unsafe reject, directions honesty — **Pass**. Live sticky ticket bar with real URL: Unverified (no fixture).

---

## 10. Remaining technical debt

- Confirm/apply `admin-overview.sql` on live project; rotate service-role key
- Signup service-role bypass redesign
- CSP / rate limits / social host allowlists
- Home featured query split; venues pagination; Leaflet CSS off root layout
- Password reset flow; Playwright (needs approval)
- Manual AT + real-device mobile re-check of client listings
- Seed script unused-var lint warnings (gitignored scripts)

---

## 11. Modified files (Phase 9)

Representative set: login response hardening; `safe-json-ld`; SEO robots/sitemap/layouts/metadata; next/image + remotePatterns; admin/planner lint fixes; auth a11y; lazy supabase browser client; `phase9-gate.test.ts`; wiki under `docs/phase9-wiki/`. Working tree unclean — **not committed**.

---

## 12. Automated test results

`npm test`: **25 pass / 0 fail** (phase4 + phase9).

---

## 13. Lint, TypeScript and build results

| Gate | Result |
|---|---|
| `npm run lint` | **0 errors**, 7 warnings (seed/check scripts) |
| `npx tsc --noEmit` | Clean |
| `npm run build` | Success; `robots.txt` + `sitemap.xml` generated |

Baseline at `aa94049` was 10 lint errors / 17 tests.

---

## 14. Release blockers

1. Confirm live Supabase has `admin-overview.sql` (verified-venue RLS + protect role/verification triggers).
2. Rotate service-role key that lived in local `setup-database.mjs`.
3. Authenticated non-production venue-owner dashboard walkthrough.
4. Human re-check of `/events`, `/venues`, `/planner/plan` in real mobile browsers.

---

## 15. Recommended remediation priorities

1. Rotate key + verify live RLS/triggers (Critical).
2. Venue-owner staging walkthrough + ticket fixture for sticky bar.
3. Real-device client listing/planner confirmation.
4. Defer: CSP, rate limits, pagination, Playwright, service-role signup redesign (with approval).

---

## Recommendation

# NOT READY FOR RELEASE

Evidence: Critical RLS/trigger verification outstanding; service-role rotation outstanding; authenticated dashboard unverified; client listing UX unverified outside automation environment. Safe code hardening and quality gates are otherwise green (25 tests, 0 lint errors, build OK).
