# Phase 3 implementation note — Events Discovery & EventCard Redesign

Dated **2026-10-26**. Branch `feature/ui-redesign` (uncommitted). Scope: [phase-3-scope.md](./phase-3-scope.md).

## What shipped

### 1. `FavoriteButton` N+1 fix & login redirect preservation (`src/components/FavoriteButton.tsx`)
- Replaced per-card `supabase.auth.getUser()` + `user_favorites` queries with a module-level shared snapshot cache (`cachedSnapshot` + `inflightSnapshot` + `supabase.auth.onAuthStateChange` invalidation + subscriber notifications).
- Mounting 50 `EventCard`s now issues **1** auth check and **1** `SELECT id, event_id, venue_id FROM user_favorites WHERE user_id = user.id` query when signed in (or 0 `user_favorites` queries when signed out).
- Toggling a favourite updates the shared cache and notifies all mounted `FavoriteButton` subscribers so duplicate cards for the same event/venue stay in sync.
- Unauthenticated save clicks preserve `window.location.search` (`next = window.location.pathname + window.location.search`) when redirecting to `/auth/login`.
- Added `variant="icon"` / `compact` support (`min-h-10 min-w-10` 40×40px accessible button with `aria-pressed` and descriptive `aria-label`) for cards, while keeping the default labelled button (`Save` / `Saved`) on `/events/[slug]` and `/venues/[slug]`.

### 2. `EventCard` redesign (`src/components/EventCard.tsx` & `src/app/page.tsx`)
- Extended `EventCardEvent.venues` backward-compatibly with optional `id`, `slug`, `city`, `address`, `latitude`, `longitude`, and `images`.
- Updated `src/app/page.tsx` event query and mapper to pass `venues.slug`, `venues.city`, and `venues.images` so homepage event cards also use venue fallback imagery and city/county formatting.
- Implemented strict 3-tier image hierarchy inside a 16:9 `aspect-video` header:
  1. `event.image_url` (when non-empty)
  2. `event.venues.images[0]` (first non-empty venue photo)
  3. Branded dark night-to-forest gradient header with Lucide category icon and venue name (no stock photos or giant emoji).
- Formatted date (`Tonight`, `Tomorrow`, or `EEE d MMM`) and start time in `Europe/Dublin` timezone.
- Displayed event type badge (`eventTypeLabel`), distinct `music_genre` badge (omitted when redundant with event type), venue name + city/county (without duplicating when `city === county`), and honest price via `formatEventPrice` (`Free` only when `is_free`, numeric euro when valid, never `€null`).
- Eliminated interactive nesting: `EventCard` uses a stretched `<Link>` on the card heading (`after:absolute after:inset-0`) while `<FavoriteButton variant="icon" />` sits in an elevated `z-20` container in the top-right corner.

### 3. `/events` discovery redesign (`src/app/events/page.tsx` & `src/components/events/*`)
- Extracted modular helpers and components:
  - `src/components/events/events-discovery-utils.ts` — URL parameter parsing/serialization (`county`, `type`, `genre`, `date`, `q`, `free`, `view`), `Europe/Dublin` date strip generator (`All Upcoming`, `Tonight`, `Tomorrow`, plus next 5 calendar days), and DST-safe `Europe/Dublin` wall-clock to UTC range conversion (`resolveDublinDateRangeUtc`).
  - `src/components/events/EventsFilterSidebar.tsx` — Sticky desktop filter sidebar (`lg:col-span-3`) with 32-county `<select>` grouped by `PROVINCES`, quick popular county pills, date select, event category select, music genre select, and Free Entry toggle, plus `EventsMobileFilterSheet` using `@/components/ui/dialog` for 390px viewports.
  - `src/components/events/EventsEmptyState.tsx` — 6-card `aspect-video` loading skeleton grid (`EventsSkeletonGrid`) and context-aware `EventsEmptyState` with recovery actions (view all upcoming dates, clear all filters, explore Cork, browse All Ireland).
- Applied `.gte('start_time', startIso)` and `.lte('start_time', endIso)` directly in the Supabase query for selected `Europe/Dublin` dates so the 50-row query cap applies to the chosen date rather than truncating later dates.
- Added an honest 50-event query cap status banner when 50 events are returned.
- Separated `event_type` categories (`All Events`, `Live Music`, `DJs & Club Nights`, `Comedy`, `Pub Quiz`, `Live Sport`, `Special Offers`) from `music_genre` (`Traditional Irish`, `Electronic`, `Rock`, `Jazz`, `Pop`, `Indie`, `Hip Hop`, `Folk`, `Country`, plus distinct non-type genres from loaded events).
- Synchronised all filters with the URL (`useSearchParams` + `router.replace(..., { scroll: false })`), supporting initial deep links from the homepage (`/events?q=…&county=…&type=…`), browser Back/Forward navigation, individual active filter chip removal, and full reset.

### 4. Map view alignment (`src/components/EventsMap.tsx` & `src/components/EventsMapInner.tsx`)
- Updated `EventsMap` and `EventsMapInner` to accept optional `events?: EventCardEvent[]` and `loading?: boolean`.
- When rendered on `/events?view=map`, `EventsMapInner` groups the active filtered events by venue (for venues with numeric `latitude` and `longitude`), computes viewport center/zoom from matching venues (falling back to county/Ireland center), and formats prices with `formatEventPrice` so `€null` never appears.

## Quality gate (2026-10-26)

- Phase 3 ESLint check (`npx eslint src/app/events/page.tsx src/components/EventCard.tsx src/components/FavoriteButton.tsx src/components/EventsMap.tsx src/components/EventsMapInner.tsx src/app/page.tsx src/components/events/events-discovery-utils.ts src/components/events/EventsFilterSidebar.tsx src/components/events/EventsEmptyState.tsx`): **0 errors**, 1 intentional `<img>` warning in `EventCard.tsx`.
- Full repo `npm run lint`: reduced pre-existing repo errors from 27 to 20 by cleaning up `EventsMapInner.tsx`.
- `npx tsc --noEmit`: **0 errors** (pass).
- `npm run build`: **pass** (all static, dynamic, and partial-prerender routes compiled cleanly).
