# Phase 2 scope — Premium homepage

Approved 2026-10-26. Plan section: Phase 2 in [UI_REDESIGN_PLAN.md](../UI_REDESIGN_PLAN.md).

## Section order

1. Sticky Navbar (existing)
2. Premium hero — "Find Your Next Night Out"
3. Prominent event search (keyword, county, event type) → working navigation
4. Browse by category
5. Featured events (`is_featured`, public visibility)
6. Happening Tonight (real local-day split)
7. Upcoming events
8. Discover venues (verified; no fake popularity)
9. Night Planner promo → `/planner`
10. Explore Ireland by county
11. Existing footer

## Hard rules (2026-10-26 approval)

- Keep mint-green IN branding and Phase 1 dark tokens.
- Hero: night gradient + Ireland map; no stock photos; no logo replacement.
- Categories only from supported data (no festivals).
- Search must work; if navigating to `/events`, add minimum `q` param support; preserve `county` and `type`.
- No date-picker or city DB model.
- No bottom nav (Phase 7).
- Cork may be a clear default selection, never presented as detected location.
- Mobile-first 390px; no horizontal overflow.
- Improve input border contrast (WCAG 2.2 AA non-text) and accessible search labels.

## Category mapping (user-approved list)

| Chip | Target |
|---|---|
| Live Music | `/events?type=live_music` |
| DJs & Club Nights | `/events?type=dj` (honest event-type filter) |
| Comedy | `/events?type=comedy` |
| Pubs & Bars | venue directory with supported filter / labelled destination |
| Restaurants | venue type Restaurant |
| All Events | `/events` |

Related: [homepage-discovery.md](./homepage-discovery.md), [events-url-params.md](./events-url-params.md).
