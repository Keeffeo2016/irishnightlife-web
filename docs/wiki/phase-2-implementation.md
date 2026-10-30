# Phase 2 implementation note

Dated **2026-10-26**. Branch `feature/ui-redesign` (uncommitted). Scope: [phase-2-scope.md](./phase-2-scope.md).

## What shipped

Premium mobile-first homepage on `src/app/page.tsx` with presentational sections under `src/components/home/*`:

1. Hero — “Find Your Next Night Out”, night gradient + Ireland map, no detected-location copy  
2. Working search → `/events` with `q` / `county` / `type` (`action="/events" method="get"` + client `router.push`)  
3. Category browse (supported types only)  
4. Featured (`is_featured`, omitted when empty)  
5. Happening Tonight (`isSameLocalDay`) with empty → upcoming CTA  
6. Upcoming (excludes featured IDs; non-tonight)  
7. Discover venues (verified; no popularity labels)  
8. Night Planner promo → `/planner` (no external-AI claim)  
9. Explore Ireland by county (Cork labelled default)  
10. Existing layout navbar/footer  

## Deep links

| Surface | Change |
|---|---|
| `/events` | Seeds `searchQuery` from `q` (preserves `county`, `type`) |
| `/venues` | Seeds from `type` (single) or `types=pub,bar` (Pubs & Bars via `.in()`); optional `county`, `q` |

Pubs & Bars category → `/venues?types=pub,bar` with page title “Pubs & Bars” and copy that excludes clubs/restaurants.

## EventCard

Optional `image_url` (16:9 when present); `formatEventPrice` skips `€null` (only free or numeric prices).

## A11y / tokens

- `--input` raised to `#4a6368` for WCAG 2.2 AA non-text contrast on night surfaces  
- Visible labels on homepage search; native selects for county/type; `aria-pressed` on county chips; `prefers-reduced-motion` respected  

## Quality gate (2026-10-26)

- `npm run lint` — **pre-existing** repo errors remain (admin, planner, maps, auth copy, etc.). Phase 2 files: **0 errors**, warnings only for intentional `<img>` (no `remotePatterns` yet).  
- `npx tsc --noEmit` — pass  
- `npm run build` — pass  

Map (`EventsMap`) omitted from homepage to keep the premium section stack uncluttered; component unchanged.

## Parent verification (2026-10-26, after implementer)

Chief-of-staff re-checked on local `http://127.0.0.1:3000/`:

- Homepage a11y tree: hero “Find Your Next Night Out”, labelled Keyword/County/Event type, category regions, tonight/upcoming/venues/planner/county; Cork labelled “(default)”; no “Detected location”.
- `/venues?types=pub,bar` → H1 “Pubs & Bars Across Ireland”, type select “Pubs & Bars”, subtitle excludes clubs/restaurants.
- `/events?q=trad&county=Cork` → search input value `trad`, Cork chip pressed.
- Phase 2 eslint scope: 0 errors, 3 intentional `<img>` warnings.
- `npx tsc --noEmit`: pass.

## Outstanding

- Homepage Featured omitted when no `is_featured` rows (by design).  
- Native search may include `type=All` in the query string; `/events` treats it as All.  
- No `next/image` remote hosts configured yet (Phase 9).  
- Do not start Phase 3 until approved.  
- Uncommitted on `feature/ui-redesign` — no commit/push without approval.
