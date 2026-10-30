# Phase 3 scope — Events Discovery & EventCard

Approved 2026-10-26 (Phase 2 approved in the same message). Plan section: Phase 3 in [UI_REDESIGN_PLAN.md](../UI_REDESIGN_PLAN.md).

## Target files

- `src/app/events/page.tsx` (and extracted discovery subcomponents if appropriate)
- `src/components/EventCard.tsx`
- Map components (`src/components/EventsMap.tsx`, `src/components/EventsMapInner.tsx`) only if safe to align with active filters

## Requirements (2026-10-26 approval)

1. **Desktop layout:** page title + location context, search bar, date navigation, category filters (`event_type`), filter sidebar (supported filters only: county, event_type, music_genre, free/price or date), ~3-column event grid, results count (honest about 50-event cap if reached), optional map/list view.
2. **Mobile (390px):** compact page heading, search field, horizontal date navigation, scrollable category chips, Filters button opening accessible mobile filter dialog/bottom sheet (`src/components/ui/dialog.tsx`), responsive cards, no horizontal overflow.
3. **`EventCard` redesign:**
   - Image hierarchy: `events.image_url` → linked `venues.images[0]` fallback → neutral branded placeholder (no stock photos).
   - Fields: title, date, start time, venue name, county/city where available, event type, music genre where applicable, honest price (`Free` only when `is_free`, numeric `€` only when valid, never `€null`/`€undefined`).
   - Save event action using existing `FavoriteButton` / favourites functionality, separately accessible from the card link (no nested interactive `<a>` inside `<button>` or vice versa).
4. **URL synchronisation & parameters:**
   - Support `county`, `type`, `q`, `genre`, `date` (and optional `view=map`).
   - Preserve homepage → `/events?q=…&county=…&type=…` journey.
   - Synchronise URL on filter change; support refresh, back/forward (`useSearchParams` reactive sync), clear individual filters, reset all filters.
   - Keep `event_type` and `music_genre` distinct.
5. **Date navigation:**
   - `All Upcoming` (default unless specified), `Tonight`, `Tomorrow`, plus upcoming days derived from actual event dates or local calendar window.
   - Use `Europe/Dublin` local date boundaries (including DST).
   - Keep date selection in URL (`?date=tonight`, `?date=tomorrow`, `?date=YYYY-MM-DD`, or omitted/`all`).
6. **Map experience:**
   - Review `EventsMap` / `EventsMapInner`. Provide map/list toggle or panel if it can safely show filtered events with real venue coordinates; otherwise document and defer.
7. **Loading, empty states & 50-row cap:**
   - Polished loading skeletons.
   - Helpful empty state (e.g., "No events found for tonight in Cork.") with quick actions: change date, clear filters, explore other counties, view all upcoming events.
   - Report 50-event query cap honestly (e.g., "Showing first 50 matching events" when 50 rows returned).
8. **Accessibility:** WCAG 2.2 AA, explicit labels, `aria-pressed`, `aria-live` results summary, keyboard-operable dialog, 44px touch targets where practical, reduced-motion support.

## Pre-edit technical audit findings (2026-10-26, agent `7d42fe29-f0ce-46b3-ad43-103a3591ad75`)

1. **`FavoriteButton` N+1 trap:** Each `FavoriteButton` previously ran its own `supabase.auth.getUser()` + `user_favorites` query on mount. Rendering `FavoriteButton` on 50 `EventCard`s would trigger 50–100 network calls. Must use a shared module-level batch loader/cache inside `FavoriteButton.tsx` (fetching user + all `user_favorites` once per session/auth state) and preserve `window.location.search` on login redirect.
2. **Interactive nesting:** `EventCard` cannot wrap `<FavoriteButton>` inside `<Link>`. Use a relative card container with separate `<Link>` and elevated `<FavoriteButton>` sibling.
3. **`EventCardEvent` backward compatibility:** `src/app/page.tsx` constructs `venues: { name, county }`. New venue fields on `EventCardEvent` (`city?`, `slug?`, `images?`, `latitude?`, `longitude?`, `address?`, `id?`) must be optional (`?`). Also update `src/app/page.tsx` select to include `images` and `city` on `venues` so homepage cards also get venue fallback photos and city names.
4. **`GENRES` vs `EVENT_TYPES`:** Remove event-type labels (`Live Music`, `DJ`, `Comedy`, `Sports`, `Quiz`) from the `music_genre` filter list on `/events` so `event_type` and `music_genre` are never conflated, while also deriving any additional real `music_genre` values present in loaded events.
5. **50-event query cap vs date filtering:** Applying `.gte('start_time', startIso)` and `.lt('start_time', endIso)` directly in the Supabase query for `Tonight`, `Tomorrow`, and specific `YYYY-MM-DD` dates prevents the 50-row cap from hiding events on a chosen date! And when 50 rows are returned, display a clear note ("Showing first 50 matching events").
6. **`EventsMap` alignment:** Pass the already-filtered `events` into `EventsMap` / `EventsMapInner` so the map view reflects active filters without an unaligned 48h query.

Related: [events-url-params.md](./events-url-params.md), [ui-redesign-goal.md](./ui-redesign-goal.md), [quality-gate.md](./quality-gate.md).
