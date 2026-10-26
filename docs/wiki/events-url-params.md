# `/events` URL params

Ingested 2026-10-26 from events URL research agent `bddf1310-9762-43ee-b906-498dc247a0fa`.

As of 2026-10-26 on `feature/ui-redesign` (uncommitted Phase 1 tree), `src/app/events/page.tsx`:

## Read on first load

| Param | State | Behaviour |
|---|---|---|
| `county` | `selectedCity` | Missing / `All` / `All Ireland` → `'All'`; else raw string |
| `type` | `selectedType` | Only if matches `EVENT_TYPES.value`; else `'All'` |
| `q` | — | **Ignored** (search starts as `''`) |

Valid `type` values: `live_music`, `dj`, `comedy`, `quiz`, `sports`, `special_offer`.

Chip changes after load do **not** write back to the URL (Phase 3 territory).

## Keyword search fields

When `searchQuery` is non-empty: `title.ilike` OR `venues.name.ilike` (commas/parens stripped).

## Phase 2 minimum `q` support (approved)

Seed only:

```ts
const [searchQuery, setSearchQuery] = useState(
  () => searchParams.get('q')?.trim() ?? ''
)
```

Homepage can then navigate to `/events?q=…&county=…&type=…`.

## `/venues` (related)

Phase 2 (2026-10-26) added first-load URL seeding on `/venues`:

| Param | Behaviour |
|---|---|
| `type` | Single venue type: `pub`, `bar`, `club`, `restaurant`, `live_music_venue` (snake or Title Case label) |
| `types` | Comma list; `types=pub,bar` selects **Pubs & Bars** and queries `.in('venue_type', ['pub','bar'])` |
| `county` | Optional county seed (same spirit as events) |
| `q` | Optional venue name/city search seed |

Related: [phase-2-scope.md](./phase-2-scope.md), [homepage-discovery.md](./homepage-discovery.md), [phase-2-implementation.md](./phase-2-implementation.md), [phase-3-implementation.md](./phase-3-implementation.md).

## Phase 3 full URL synchronisation (2026-10-26)

`src/app/events/page.tsx` and `src/components/events/events-discovery-utils.ts` reactively parse and write back:

| Param | Values | Behaviour |
|---|---|---|
| `county` | County name or omitted | `'All'` when omitted / `All` / `All Ireland`; filters `venues.county` |
| `type` | `live_music`, `dj`, `comedy`, `quiz`, `sports`, `special_offer` | Filters `events.event_type` |
| `genre` | Music genre string | Filters `events.music_genre` (distinct from `event_type`) |
| `date` | `all` (default), `tonight`, `tomorrow`, `YYYY-MM-DD` | Queries exact `Europe/Dublin` day start/end in UTC (`.gte` + `.lte`) |
| `q` | Keyword string | Debounced (250ms) sync to URL; filters `title.ilike` OR `venues.name.ilike` |
| `free` | `true` | Filters `events.is_free = true` |
| `view` | `grid` (default) or `map` | Toggles between card grid and filtered `EventsMap` |
