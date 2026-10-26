# Phase 5 implementation — Venue Directory & Venue Profile Redesign

Dated 2026-10-26. Branch `feature/ui-redesign`. Uncommitted on top of checkpoint `14b05f1` (preserving uncommitted Phase 4 changes).

## What shipped

1. **Shared `VenueCard` (`src/components/VenueCard.tsx` & `src/components/home/DiscoverVenues.tsx`):**
   - 16:9 `aspect-video` header displaying the first valid image from `venue.images`, or a branded dark `from-night via-night-soft to-forest` fallback with a Lucide icon matched to `venue_type` (`Beer`, `Wine`, `Disc3`, `Music`, `Utensils`, `Sparkles`). Zero stock photos, zero emoji.
   - Stretched-link heading (`after:absolute after:inset-0`) linking to `/venues/[slug]` while keeping `<FavoriteButton venueId={venue.id} variant="icon" label={venue.name} />` elevated in `z-20` outside the `<a>` element.
   - Displays venue type badge, `CheckCircle2` + `"Verified"` badge (not relying on colour alone), deduplicated city/county (`"Cork"` when `city === county`, `"City, Co. County"` otherwise), price range, 2-line description clamp, and up to 3 music genre / atmosphere tags.
   - Reused in `DiscoverVenues` so homepage and `/venues` share the exact same venue card component.

2. **Venue Directory (`src/components/venues/venues-discovery-utils.ts` & `src/app/venues/page.tsx`):**
   - Reactive URL state (`useSearchParams` + `router.replace(..., { scroll: false })`) supporting `county`, `type`, `types=pub,bar`, and `q` (with 250ms debounce and PostgREST delimiter sanitization).
   - Preserves `/venues?types=pub,bar` round-trip to `pubs_bars` (`Pubs & Bars`) and `.in('venue_type', ['pub', 'bar'])`.
   - Compact left-aligned `PageHero` with dynamic category/county heading, accessible search input with clear button, 32-county selector grouped by province, horizontal scrollable category chips (`All Venues`, `Pubs & Bars`, `Pubs`, `Bars`, `Nightclubs`, `Live Music Venues`, `Restaurants`), and popular county quick chips.
   - Results section with `aria-live="polite"` count heading, removable active filter pills + `Clear all`, 6-card `aspect-video` loading skeleton grid, and contextual empty state with recovery actions (*Clear all filters*, *Explore Cork*, *View All Ireland*).

3. **Venue Profile & JSON-LD (`src/lib/venue-jsonld.ts` & `src/app/venues/[slug]/page.tsx`):**
   - `buildVenueJsonLd` outputs honest Schema.org `BarOrPub` / `NightClub` / `Restaurant` / `MusicVenue` / `LocalBusiness` structured data with `PostalAddress` (`addressCountry: 'IE'`) and `GeoCoordinates` (only when finite numeric coordinates exist). Never fabricates `aggregateRating`, `review`, or `openingHoursSpecification`.
   - `generateMetadata` populates canonical URL, description, and OpenGraph image for verified venues.
   - Photography-led hero with first valid `venue.images[0]` or branded gradient fallback, venue type badge, `CheckCircle2` + `"Verified Venue"` badge, `<h1>`, location, and price range.
   - Two-column desktop / single-column mobile layout (`lg:grid-cols-3`):
     - **About the venue:** description, venue type, price range, age policy, hen/stag suitability (`accepts_hen_stag`), music genres, and atmosphere badges.
     - **What’s On:** filters nested `venue.events` to `is_published === true` and `start_time >= now`, sorted ascending, rendered with `<EventCard>` and `preservePlannerOrigin`, plus a clean empty state linking to `/events?county=...`.
     - **Photos:** responsive `aspect-video` gallery rendered only when `venue.images` has valid URLs.
     - **Location and directions:** formatted address, `<EventLocationMap>` when finite coordinates exist, and external OpenStreetMap directions link via `directionsHref(venue)`.
     - **Contact & Actions sidebar:** `<FavoriteButton venueId={venue.id} />`, working **Get directions** link, validated **Visit website** link (`safeExternalUrl`), working `tel:` and `mailto:` links, and social links only when stored on the record (placeholder Facebook/Twitter buttons removed).

## Verification

- `npm test`: 7/7 tests passing in `src/lib/phase4-gate.test.ts` (including multi-hop favourites generation isolation, `/venues?types=pub,bar` round-trip, and `buildVenueJsonLd`).
- `npx eslint`: 0 errors, 0 warnings across all Phase 5 files.
- `npx tsc --noEmit`: 0 errors.
- `npm run build`: succeeded cleanly.
