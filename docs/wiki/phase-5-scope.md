# Phase 5 scope — Venue Directory & Venue Profile Redesign

Approved 2026-10-26 (Phase 4 approved in the same message). Plan section: Phase 5 in [UI_REDESIGN_PLAN.md](../UI_REDESIGN_PLAN.md).

## Target files

- `src/components/VenueCard.tsx` (shared venue card used on `/venues` and optionally `DiscoverVenues`)
- `src/components/venues/venues-discovery-utils.ts` (URL parsing/building for `county`, `type`, `types=pub,bar`, `q`)
- `src/app/venues/page.tsx` (Venue directory redesign with reactive URL sync, horizontal category chips, county filter, active filter chips, skeletons, and contextual empty states)
- `src/app/venues/[slug]/page.tsx` (Photography-led venue profile with `generateMetadata`, JSON-LD, What's On reusing `EventCard`, Photos gallery, About, Location & Directions reusing `EventLocationMap` and `directionsHref`, Contact Info with validated `tel:` / `safeExternalUrl` / `mailto:`, and removal of dead social buttons)
- `src/lib/venue-jsonld.ts` (Honest `LocalBusiness` / `BarOrPub` / `NightClub` / `Restaurant` / `MusicVenue` JSON-LD builder with zero fabricated ratings, reviews, or opening hours)

## Key safeguards

- Continue on `feature/ui-redesign` from checkpoint `14b05f1`, preserving uncommitted Phase 4 changes.
- Preserve `/venues?types=pub,bar` homepage category deep link.
- Filter upcoming events on `/venues/[slug]` to `event.is_published === true` and `start_time >= now` and render them with shared `EventCard` (preserving planner query via `preservePlannerOrigin`).
- Reuse Phase 4 `FavoriteButton` (generation-isolated snapshot cache) on both `VenueCard` (`variant="icon"`) and `/venues/[slug]`.
- Remove non-functional "Get Directions", "Facebook", and "Twitter" placebo buttons on `/venues/[slug]`; wire real directions via `directionsHref(venue)`.

Related: [events-url-params.md](./events-url-params.md), [phase-4-implementation.md](./phase-4-implementation.md), [quality-gate.md](./quality-gate.md).
