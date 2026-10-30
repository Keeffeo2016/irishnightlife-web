# Homepage discovery

Ingested 2026-10-26 from homepage research agent `768f4134-18c0-4030-ac18-bdc3b7a612ad`. Code as of uncommitted Phase 1 tree on `feature/ui-redesign`.

## Primary file

`src/app/page.tsx` — client island (~440 lines). Custom hero (not `PageHero`). No featured section, no venue cards, no category chip row. Map via `EventsMap`.

## Data rules (existing query shape)

- `events` with `venues!inner`, `is_published = true`, `venues.is_verified = true`, `start_time >= now`, limit 50.
- County via `venues.county` when not All Ireland.
- Keyword: `title.ilike` / `venues.name.ilike`.
- `is_featured` on local type but **unused** in UI as of that date.
- Tonight: `isSameLocalDay(start_time)` vs `toDateString()`.
- Later sections: group by `EVENT_TYPES`, cap 3, only when genre All and search empty.

## Landmines to fix in Phase 2

| Issue | Action |
|---|---|
| “Detected location: Cork” with unused coords | Cork as clear **default selection** only |
| Hero count = all rows | Use real tonight count or drop misleading count |
| Genre select → `music_genre` with type-like labels | Replace with event-type search + category links |
| No featured / venues / planner promo sections | Add per [phase-2-scope.md](./phase-2-scope.md) |
| `EventCard` emoji-only, no `image_url` | Featured may need photo slot; reuse card elsewhere |
| No shared skeleton/empty components | Inline premium empty/loading OK |

## Reuse

Navbar, Footer, `PageHero`/`HeroAccent`, `EventCard`, `isSameLocalDay`, published+verified query, `IRISH_COUNTIES`/`PROVINCES`, `EVENT_TYPES`/`VENUE_TYPES` from `venue-profile.ts`, `EventsMap` optional/relocate.

## Venues deep links

`/venues` has no URL params as of 2026-10-26. Pubs & Bars / Restaurants need labelled destination or additive `type` seed — see [events-url-params.md](./events-url-params.md).

Related: [phase-2-scope.md](./phase-2-scope.md), [quality-gate.md](./quality-gate.md).
