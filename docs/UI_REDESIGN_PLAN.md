# IrishNightlife.ie UI redesign plan

Phase 0 audit. No application code was changed to produce this document.

The application lives in `web/`. That directory is the Git repository. This plan is `web/docs/UI_REDESIGN_PLAN.md`.

**Status:** awaiting approval before Phase 1.

## Current application architecture

### Stack

| Layer | What is actually in the repo |
|---|---|
| App | Next.js 16.4.3 App Router, React 19.3, TypeScript (`strict`) |
| Styling | Tailwind CSS 4, tokens in `src/app/globals.css`, no separate `tailwind.config` |
| Components | shadcn (`base-nova`) on Base UI (`@base-ui/react`), `class-variance-authority`, `cn` |
| Icons | `lucide-react` |
| Fonts | Geist Sans and Geist Mono via `next/font/google` |
| Data | Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Postgres, RLS |
| Maps | Leaflet + react-leaflet, OpenStreetMap tiles, loaded with `ssr: false` |
| Auth | Supabase Auth: email/password API routes, Google and Apple OAuth |
| Hosting config | `next.config.ts` sets `cacheComponents: true` and `partialPrefetching: true` |

`README.md` still describes Next.js 15 and lists the planner, maps, and reviews as future work. The code has moved past that. Treat the source, not the README, as the source of truth.

There is no global client state library. Discovery pages keep filters in React state. Detail, dashboard, admin, and profile pages are server components that query Supabase directly. The browser client is used for the homepage, event list, venue list, favorites, page views, and OAuth.

### Repository layout

```
web/
├── public/brand/          # Raster logos only
├── public/ireland-map.svg
├── src/app/               # Routes, layouts, API routes
├── src/components/        # Navbar, cards, maps, shadcn/ui
├── src/lib/               # Supabase, planner, counties, venue access
├── src/types/database.ts
└── supabase/              # SQL applied by hand in the Supabase editor
```

About 76 TypeScript/TSX source files. No `src/hooks`. No automated tests.

### Routing

Public:

| Route | Role |
|---|---|
| `/` | Homepage discovery |
| `/events` | Event browser. Reads `?county=` and `?type=` on first load |
| `/events/[slug]` | Event detail |
| `/venues` | Venue directory |
| `/venues/[slug]` | Venue profile |
| `/planner` | Five-step night planner |
| `/planner/plan` | Plan result. Query: `who`, `occasion`, `vibe`, `budget`, `tomorrow` |
| `/for-venues` | Venue marketing page |
| `/auth/login`, `/auth/signup` | Email and social auth |
| `/auth/callback` | OAuth callback |
| `/auth/complete-venue` | Venue setup after owner signup |

Authenticated:

| Route | Who | How it is protected |
|---|---|---|
| `/profile` | Signed-in user | Page redirect to `/auth/login?next=/profile` |
| `/dashboard` | `venue_owner` or `admin` | Middleware plus `getVenueDashboard()` |
| `/dashboard/events` | Same | Same |
| `/dashboard/events/new` | Same, and only verified venues can create | Same |
| `/dashboard/profile` | Same | Same |
| `/admin` | `admin` | Middleware plus a role check on the page |

There is no `/contact` page. The Enterprise card on `/for-venues` links there. There is no `not-found.tsx`, `error.tsx`, or `loading.tsx`.

### Data and API surface

Browser and server code talk to Supabase tables directly. Custom HTTP routes are small:

| Route | Purpose |
|---|---|
| `POST /api/auth/login` | Email/password sign-in, returns role |
| `POST /api/auth/signup` | Consumer or venue-owner signup |
| `POST /api/auth/venue` | Completes a venue record |
| `GET /auth/callback` | OAuth code exchange |
| `POST /api/planner` | Scores published events in the next 48 hours |

`POST /api/planner` is not a call to an external model. It loads verified, published events from Supabase, scores them with fixed vibe, occasion, budget, and end-time rules in `src/app/api/planner/route.ts`, and returns real event records plus a template narrative. `src/lib/planner.ts` handles cost summary, stop order, swap, and shuffle. There is no prompt, model name, or AI SDK in the repo.

Tables that the UI actually uses: `users`, `venues`, `events`, `user_favorites`, `page_views`, plus the `owner_page_view_counts` RPC.

Tables or columns that exist in schema and types but have no consumer UI yet: `venue_reviews`, `live_updates`, `user_preferences`, `opening_hours`, `subscription_tier` beyond a default of `free`, `is_featured` as a homepage query, and `ticket_url` on the public event page.

Public listings require `events.is_published` and `venues.is_verified`. Owners and admins can still open their own unpublished or unverified records. Event and venue queries are capped (homepage and `/events` at 50, planner at 20, map window at 48 hours).

### Auth and roles

Roles are `consumer`, `venue_owner`, and `admin`.

- Middleware refreshes the Supabase session on almost every request.
- `/dashboard` requires `venue_owner` or `admin`. Others go to `/for-venues`.
- `/admin` requires `admin`. Others go to `/`.
- A signed-in venue owner who hits `/auth/login` is sent to `/dashboard`.
- `safeNextPath` rejects protocol-relative and backslash paths.
- Navbar swaps consumer links for Dashboard / Events / Profile when the role is `venue_owner`, and adds Admin for `admin`.
- Favorites require a signed-in user. `FavoriteButton` sends anonymous users to login.

### Styling today

The shell is split in two. `Navbar` and `Footer` are near-black (`#010302`) with mint links. Page bodies are `bg-gray-50` with white cards, emerald and cyan gradients, and large emoji. Heroes reuse `PageHero`: night-to-forest gradient plus a masked Ireland map.

Brand tokens already exist beside the default shadcn palette:

| Token | Hex | Use |
|---|---|---|
| `--color-night` | `#010302` | Nav, heroes |
| `--color-night-soft` | `#0a1410` | Hero gradient |
| `--color-mint` | `#13e09d` | Buttons, active links |
| `--color-mint-light` | `#54f2b5` | Hover |
| `--color-forest` | `#003025` | Hero gradient end |

shadcn semantic tokens (`--background`, `--primary`, and so on) are still the default light theme. The root layout does not set `class="dark"`. Body text is `text-gray-900` on gray, so a token swap alone will not restyle the pages. Many components hardcode `gray-*`, `emerald-*`, and `white`.

`Button` already has `brand`, `brand-outline`, and `brand-outline-dark`. Default shadcn sizes are small (`h-8`). Several screens override them with `py-6` / `py-7`.

## Existing functionality inventory

### Homepage (`src/app/page.tsx`)

Client page. Default county is Cork. Geolocation is requested, then the county is still set to Cork. The hero count is the size of the fetched list, which is upcoming events, not only tonight.

Filters, all client-side and not written to the URL:

- Text search on event title and venue name
- County dropdown from `IRISH_COUNTIES`, grouped by province, plus All Ireland
- Genre `<select>`: All, Live Music, DJ, Comedy, Sports, Quiz, Traditional Irish, Electronic, Rock, Jazz

The genre control filters `events.music_genre` with those labels. Event type is a different field (`live_music`, `dj`, `comedy`, `quiz`, `sports`, `special_offer`). A "Live Music" chip does not mean `event_type = live_music`.

When genre is All and search is empty, results split into Tonight and later sections capped at three cards per event type, with "See all" links to `/events?type=&county=`. Otherwise it is a flat grid. Empty state resets to Cork. A county shortcut row and `EventsMap` sit below the list. The map shows venues with coordinates and a published event in the next 48 hours.

### Events (`/events`, `/events/[slug]`)

`/events` reads `county` and `type` once from the query string. Changing chips does not update the URL, so shared links only match the first paint. Chips cover a short city list (actually counties), event type, and the same genre list as the homepage. Search is debounced only by effect re-run, with no explicit debounce.

`EventCard` shows emoji, genre badge, title, description, venue name, county, relative date, time, and a price string. It does not show `image_url`, city, or a save control. Price is omitted from the card type's required honesty only when `is_free` or `price_min` is present; a null price still renders as `€null` if `is_free` is false. That should be guarded during the card redesign.

Event detail is a server page. It shows description, date, time, price, genre, venue blurb, first venue image, and `ShareEventButtons` (Facebook, X, Instagram-with-copy). `FavoriteButton` saves the event. `ticket_url` is stored by the create-event form and is not read here. The sidebar button labelled "Get Tickets" has no `href`, and the line "Secure checkout • Instant confirmation" describes a checkout that does not exist. The share icon in the hero is a separate button with no handler. There is no map, no related events, and no hero photograph of the event.

Detail links can carry `from=planner` plus the plan fields so Back to Planner works.

### Venues (`/venues`, `/venues/[slug]`)

Directory filters: search, county (real `<select>` with provinces), venue type (`pub`, `bar`, `club`, `live_music_venue`, `restaurant`). Cards are text-only even when `images` exist. Verified badge, type, price range, and up to three genres.

Profile shows description, photo grid (up to the stored images), type, price range, genres, atmosphere, phone, website, and up to six upcoming events. `FavoriteButton` saves the venue. "Get Directions" does nothing. Facebook and Twitter buttons in the sidebar do nothing. Opening hours, facilities, accessibility, ratings, and a map are not rendered. `opening_hours` can exist in the database; the profile form does not edit it.

### AI Night Planner

`/planner` is a five-step chooser: who, occasion, vibe, budget, tomorrow. Choices auto-advance after a short reaction. Generate navigates to `/planner/plan` with those five query params. There is no city or date input. Occasion includes hen and stag, which the API uses with `venues.accepts_hen_stag`.

`/planner/plan` posts that context to `/api/planner`, then renders an itinerary of real stops, "Why this", swap, shuffle, cost and duration from ticket price fields, share, and `PlanMap`. Empty and error states exist. Copy such as "hand-picked" and "amazing spots" is generated from templates, not from a model. Recommendations are limited to the next 48 hours and are not tied to a chosen city.

Do not change the scoring maps, the POST body, or the JSON shape (`narrative`, `stops`, `alternates`, `total_cost`, `estimated_duration`) without approval. A visual redesign can send the same payload.

### Accounts

`/profile` lists saved venues and saved events and can remove them. Sign out is a button. No preference editor, even though `user_preferences` exists.

Login and signup support email/password, Google, and Apple. Venue signup can continue into `/auth/complete-venue`.

### Venue dashboard

Same site chrome as the consumer site (navbar and footer from the root layout).

- Overview: venue count, upcoming event count, venue page views, event page views, upcoming list, create-event link
- Events: upcoming and earlier lists, view counts, link to the public event. No edit or delete UI
- Create event: title, type, times, price, ticket URL, description, genre, atmosphere, age, recurring flag. Image is copied from the venue's first photo. Publish is tied to the existing insert path
- Profile: description, type, price range, hen/stag preference, up to six photos in the `venue-images` bucket (JPEG, PNG, WebP, GIF, 5 MB)

Unverified venues stay off the public site and cannot create events until an admin approves them. View counts come from `page_views` through `owner_page_view_counts`. There is no reviews, promotions, or subscription-management screen. `/for-venues` advertises Free / €29 / Custom tiers and a five-event cap. Signup always writes `subscription_tier: 'free'`. Stripe is not integrated. Those marketing claims are out of scope for a visual pass unless you approve copy changes.

### Admin

`/admin` loads users, venues, events, and 14 days of page views (max 5,000 rows). `AdminBoard` has Venues, Events, and Users sections, approval toggle, filters, and charts built from that data. It does not show revenue, uptime, or moderation queues. The README's super-admin feature list is ahead of the UI.

### Analytics

`PageViewTracker` inserts one `page_views` row per path per 30 seconds in the session. It skips `/admin`, `/auth`, and `/api`.

### Brand assets

| File | What it is |
|---|---|
| `public/brand/logo-nav.png` | IN monogram plus wordmark, no tagline. Used in the navbar. Black background |
| `public/brand/logo.png` | Same lockup plus "DISCOVER WHAT'S HAPPENING TONIGHT". Used in the footer |
| `public/brand/logo-original.jpg` | Open Graph image referenced in the root metadata |
| `public/ireland-map.svg` | Map silhouette used as a CSS mask |

There is no standalone monogram SVG and no transparent logo. The raster files are designed for dark backgrounds. Do not generate a replacement. On a dark UI they can stay as `<Image>` assets. Spacing should keep the wordmark readable at the current navbar height (`h-11`).

### SEO and metadata

Root metadata only: title "IrishNightlife.ie — Find Your Night", one description, one Open Graph image. No per-route `generateMetadata`, canonical tags, JSON-LD, `sitemap.ts`, or `robots.ts`. URLs are already clean (`/events/[slug]`, `/venues/[slug]`). Preserving those paths is the SEO constraint. Adding real metadata later is additive. Do not invent `AggregateRating` or `Offer` availability.

### Accessibility and responsive behaviour

What already works:

- `lang="en"` on `<html>`
- Mobile nav button has `aria-expanded` and an accessible name
- Event filter chips use `aria-pressed` and scroll the selected chip into view
- Planner choices use `aria-pressed` and visible focus rings
- shadcn buttons ship a focus ring
- Some selects have `sr-only` labels (venue directory)
- Venue phone and website are real links

Gaps to fix inside the redesign, without changing behaviour unless called out:

- Homepage search and county menu are pointer-first. The county list is not a listbox, and search fields rely on placeholders
- Hero share control, venue share buttons, and Get Directions are unlabelled or non-functional controls
- Event cards communicate category with emoji and no text alternative beyond the genre badge
- Loading and empty states are emoji plus a heading, not skeletons or `aria-live` regions
- Touch targets on chips are `py-1`. Several icon buttons use the default `size-8` (32px)
- `gray-400` on the night hero is used for small helper text and is a likely contrast failure
- No `prefers-reduced-motion` handling. Planner reactions and card hover scale should respect it
- Root layout always renders the footer. A future mobile bar must not cover it or the sticky ticket area
- Dashboard tables in admin can overflow on small screens

### Tests, lint, and build

| Command | Exists |
|---|---|
| `npm run dev` | Yes. `next dev` |
| `npm run lint` | Yes. ESLint 9 with `eslint-config-next` core-web-vitals and TypeScript |
| `npm run build` | Yes. `next build` |
| `npm test` or Playwright | No project tests |
| `tsc --noEmit` | Available through the existing `tsconfig.json`. No npm script |

Phase 10 cannot report a test suite result beyond lint, `tsc --noEmit`, and `next build`, plus manual route checks.

### Git status

Checked in `web/` on 26 October 2026.

- Branch: `main`, tracking `origin/main`, **ahead by 1 commit**
- Latest local commit: `064a9bb` `done`
- Working tree: clean. No staged or unstaged changes
- This plan is the first uncommitted file after the audit

Do not reset, amend, or overwrite `064a9bb`. Later redesign work should be new commits only when you ask for them.

## Current UI/UX weaknesses

1. **Two products in one skin.** Dark branded chrome, light gray content, emoji-led cards. It does not read as one nightlife platform, and it does not match the photography-led direction.
2. **Discovery is county-and-genre, not the search model in the brief.** There is no date control. "Tonight" is a heading, not a default date. City chips are counties. Homepage filters are not shareable.
3. **Cards hide the photographs the product already stores.** `events.image_url` and `venues.images` are unused on listing cards. Category is an emoji.
4. **Several controls promise actions the app does not perform.** Get Tickets, secure checkout copy, Get Directions, venue social buttons, and the event hero share icon. A redesign must not make those look more finished.
5. **Taxonomy does not match the proposed category row.** Live music, DJ, comedy, quiz, sports, and special offer are the event types. Pubs, nightclubs, and restaurants are venue types. Festivals and food-and-drink events are not types. Nightclubs are not a filter today.
6. **The planner is a Cork-centric vibe wizard, not a city and date planner.** It is valuable and backed by real events. The inputs do not match the brief, and the API ignores city.
7. **Homepage location is hardcoded.** The geolocation callback discards the coordinates and sets Cork. The hero can say a location was detected when it was not.
8. **Featured, popular, and tonight modules are not separate data queries.** `is_featured` is unused in the UI. "Popular venues" has no ranking besides page views, which are owner/admin data.
9. **Dashboard and admin share the consumer header, footer, and light cards.** Metrics that do exist (counts and page views) are real. Reviews, promotions, and revenue are not.
10. **SEO is a single default title.** Event and venue pages are the indexable records and have no unique metadata.
11. **README and `/for-venues` over-claim** relative to payments, review counts, crowd levels, and subscription enforcement. Visual work should not repeat those claims in new components.

## Proposed design architecture

Keep the App Router, routes, Supabase clients, and shadcn/Base UI. Do not add a second component library.

### Tokens

Retheme the existing CSS variables rather than introducing a parallel palette. Proposed starting values, mapped onto tokens the app already uses:

| Proposed | Hex | Suggested token |
|---|---|---|
| Background | `#0B1114` | `--background`, and align `--color-night` |
| Surface | `#152124` | `--card`, `--popover` |
| Primary mint | `#64F4C2` | `--primary`, `--color-mint` |
| Primary hover | `#49D9A7` | `--color-mint-light` (name stays, value becomes the hover mint) |
| Primary text | `#F4F7F6` | `--foreground` |
| Secondary text | `#9AABB0` | `--muted-foreground` |
| Border | `#283A3D` | `--border`, `--input` |

Consumer pages should use these semantic utilities (`bg-background`, `text-foreground`, `bg-primary`) so a later tweak does not require another class sweep. Dashboard and admin can share the same tokens with a quieter surface and no photography, still distinct by layout: sidebar or simple section nav, data tables, no hero photograph.

Rough contrast of the proposed pairs is in the WCAG AA range for body text (mint on `#0B1114` is very high; `#9AABB0` on `#0B1114` and on `#152124` is roughly 7:1). Phase 1 still has to measure small text, mint buttons with dark labels, placeholders, and `disabled:opacity-50`. If a pair fails, adjust the token, not a one-off hex in a component.

### Typography

Geist is already loaded and is a contemporary grotesque. Keep it for Phase 1 unless you specifically want Inter. Add a documented scale on top of the current ad-hoc `text-4xl` / `text-xl` usage: display, h1, h2, body, and meta. Respect users who prefer reduced motion.

### Photography

Use `image_url` and `venues.images` when they are real URLs. Where they are missing, use a calm surface and the category label. Do not drop in stock nightlife photos that imply a specific event or venue. The homepage hero may use one existing brand-suitable asset if we have one; the repo currently has logos and `ireland-map.svg` only. A hero photo is a content decision, not something to invent in code.

### Layout

- Consumer: dark page background, existing navbar, existing footer, optional mobile bar only below the `md` breakpoint.
- Mobile bar destinations that exist today: Home `/`, Events `/events`, Explore `/venues`, AI Planner `/planner`, Profile `/profile`. Profile already sends anonymous users through login. Do not add a route for "Explore" if `/venues` is the destination. Hide the bar on `/dashboard`, `/admin`, and `/auth/*` so venue tools are not mixed into the consumer tab set.
- Safe area: `padding-bottom` on `main` using `env(safe-area-inset-bottom)`, and the same inset on the bar. The footer remains reachable.
- Dashboard: keep routes. Restyle the existing overview, event list, create form, and profile form. Do not add Analytics, Reviews, Promotions, or Settings routes until those features exist.

### Category mapping (needs your confirmation)

Proposed chips should hit existing filters, not new enums.

| Chip | Honest target with today's data |
|---|---|
| Live Music | `/events?type=live_music` |
| Comedy | `/events?type=comedy` |
| All Events | `/events` |
| Nightclubs | `/venues` with type Club, unless you want this to mean `event_type=dj` |
| Pubs & Bars | `/venues` with type Pub or Bar. The venue page filter is a single type, so this may be two chips or a small query change |
| Food & Drink | No event type. Closest existing filter is venue type Restaurant |
| Festivals | No type, no route. Omit until data exists, or show an empty state. Do not invent festival records |

Genre chips and event-type chips must not be wired to each other. The homepage "Live Music" genre bug should be fixed only if you approve that behaviour change. The visual category row can link to `type=` without changing the old genre `<select>` until Phase 3.

### Search contract

Preserve:

- `/events?county=<County>&type=<event_type>`
- Planner query fields and `from=planner` on detail links
- County names from `src/lib/counties.ts`, including All Ireland

Phase 2 search can be city-labelled in the UI only if it still writes `county`. A free-text city search against `venues.city` would be new query behaviour and needs approval. Date defaulting to Tonight matches data the homepage already computes with `isSameLocalDay`, but a date navigator that filters other days is new client behaviour on top of the same `start_time` query. Recommend it in Phase 3, still without new API routes.

## Component reuse opportunities

Reuse and restyle:

| Existing | Reuse for |
|---|---|
| `Navbar`, `Footer` | Phase 1–2 chrome. Add mobile bar beside them, do not replace the route list |
| `PageHero` | Secondary pages until each page gets its own header. Homepage hero can be a sibling, not a fork of every page |
| `Button` brand variants | Primary and ghost actions. Point them at the new mint tokens |
| `Input`, `Textarea`, `Select`, `Badge`, `Card` | Forms, filters, cards |
| `EventCard` | All event grids, including homepage sections and related events |
| `FavoriteButton` | Detail pages now; cards in Phase 3 if the card stays a link and the button stops propagation |
| `FilterChips` in `events/page.tsx` | Extract only when a second page needs them. Until then, restyle in place |
| `EventsMap` / `PlanMap` | Map views. Keep dynamic import and the Leaflet CSS import in the root layout |
| `ShareEventButtons` | Event detail sharing. Do not duplicate a second share widget |
| `dialog.tsx` | Unused today. Prefer it for desktop filter dialogs before adding a library. A bottom sheet can be the same dialog with a mobile style |
| Dashboard `Card` stats | Overview metrics already bound to real counts |

Build only where nothing exists: skeleton, empty state, error notice, mobile tab bar, date strip. Keep them in `src/components` and style them with tokens.

Leave unused shadcn files (`avatar`, `tabs`, `tooltip`, `dropdown-menu`, `separator`) in place. Use `tabs` on the venue page only if the sections are the content already on the page.

Do not add Framer Motion, a new icon set, or another CSS framework.

## Risks and dependencies

| Risk | Why it matters | Mitigation |
|---|---|---|
| `cacheComponents: true` | Server pages (`events/[slug]`, `venues/[slug]`, dashboard, admin) may cache more aggressively than a typical Next app | Do not change data fetching to "fix" a stale UI during a visual pass. Verify a published event edit shows up after redesign |
| Homepage is a client island | County, search, and genre state live in one 440-line file | Restyle in place first. Extract sections only when the file is being edited anyway |
| Filter URL drift | `/events` hydrates from the query, then ignores it | Phase 3 should write `county` and `type` back with `router.replace` so existing inbound links keep working |
| Category mismatch | Brief chips are not all event types | Use the mapping table above. Omit festivals rather than hardcode examples |
| Dead ticket button | Making it look premium without a destination is worse | If `ticket_url` is set, link out with a clear "leaves IrishNightlife.ie" notice. If it is null, show the price and no checkout claim. This is a behaviour fix; call it out in the Phase 4 approval |
| Logo background | PNG/JPG are opaque black | Use them on dark surfaces only. Do not place them on mint or on white cards |
| Planner copy sounds like an LLM | Template narrative can imply certainty | Keep the API. Soften only the visible wording so it stays tied to returned events. No new fake stops |
| Hen/stag and 48-hour window | Easy to break by adding a city dropdown that the API drops | New planner fields are out of scope until you approve an API change |
| Mobile bar vs venue navbar | Owners currently lose consumer links | Show the consumer tab bar only for non-owner sessions, or hide it on dashboard routes. Confirm in Phase 7 |
| No tests | Regressions will be manual | Lint, `tsc --noEmit`, production build, and a fixed route checklist after every phase |
| Unpushed commit | `main` is 1 commit ahead of origin | Branch from current `main` when implementation starts. Do not rebase that commit unless you ask |
| Marketing pages | `/for-venues` states prices and limits the product does not enforce | Restyle later, and do not spread those claims into the new homepage |
| Secrets | `.env*` is gitignored | No env or key changes in any UI phase |

## Proposed implementation phases

Each phase starts with a short note of files, behaviour changes, and risks, then waits for approval. No schema, env, auth, or payment changes.

### Phase 1 — Tokens, type, and core controls

Files: `src/app/globals.css`, `src/app/layout.tsx` (font class and body background only), `src/components/ui/button.tsx`, `input.tsx`, `badge.tsx`, `card.tsx`.

Switch consumer surfaces to the dark semantic tokens. Keep Geist. Restyle brand button variants. Measure contrast, including disabled buttons. Do not redesign page layouts yet. Snapshot homepage, events, a venue, login, and dashboard so the token change is reviewed before layout work.

### Phase 2 — Homepage

Files: `src/app/page.tsx`, and small presentational components extracted from it if the file would otherwise mix layout and data.

Order: hero and search, category links, featured events, tonight, venues, planner promo, counties, footer.

Data rules:

- Featured: `is_featured = true` among the events already allowed on the homepage. Empty state if none.
- Tonight: existing local-day split.
- Popular venues: verified venues that have an upcoming event in the current result, or a simple verified list. Do not invent a popularity score. If that is too vague, ship the section only when `is_featured` venues exist.
- Categories: links from the mapping table. No festival chip until you add a type.
- Search button can keep the current instant filtering or submit into `/events` with `county` and the text query. Submitting to `/events` needs `/events` to honour a `q` param. That is a small additive parameter, not a new route. Flag it in the Phase 2 approval.
- Remove the "Detected location: Cork" line unless geolocation truly resolves a county. Leave coordinates unused rather than implying detection.

Hero: existing night gradient and Ireland mask if no approved photograph is available.

### Phase 3 — Events discovery

Files: `src/app/events/page.tsx`, `src/components/EventCard.tsx`, map components if the list page gains the existing map.

Desktop: title, date strip (Tonight plus upcoming days derived from loaded events, not a fake calendar), type chips, genre chips, grid, existing map. A left filter column only for filters that exist (county, type, genre, free text). Skip list/grid toggle unless it is cheap and does not add state bugs.

Mobile: chips stay horizontal. Filters that do not fit open the existing dialog as a bottom sheet. Map/list uses the current Leaflet map.

Cards: photo when `image_url` or a venue image is actually selected by the query, title, date, time, venue, city when `venues.city` is selected, category label, price only when `is_free` or a numeric price exists, save button that reuses `FavoriteButton`.

Write `county` and `type` back to the URL.

### Phase 4 — Event detail

Files: `src/app/events/[slug]/page.tsx`, `ShareEventButtons.tsx` if the hero share should call it.

Hero image when `image_url` or a venue image exists. Facts already on the page. Ticket action: external `ticket_url` with an off-site warning, or no button. Remove the secure-checkout sentence. Map only when the venue has latitude and longitude, reusing Leaflet. Related events: other upcoming published events at the same venue or in the same county, from a real query. Sticky mobile ticket bar only when a real ticket URL exists, with content padding so it does not cover the footer.

### Phase 5 — Venue pages

Files: `src/app/venues/page.tsx`, `src/app/venues/[slug]/page.tsx`.

Cover image from `images[0]` when present. What's on (existing upcoming events), About (description, type, price range, atmosphere, genres), Photos (existing gallery), Getting there (address, map when coordinates exist, website and phone). Render opening hours only when `opening_hours` is non-null. Do not add ratings. Wire or remove Get Directions and the dead share buttons in the same phase so the new page does not keep placebo controls. Directions can be an OpenStreetMap link from stored coordinates or address. That is a small behaviour fix to approve with the phase.

### Phase 6 — Planner

Files: `src/app/planner/page.tsx`, `src/app/planner/plan/PlanResultContent.tsx`. Do not edit `src/app/api/planner/route.ts` or the scoring tables.

Restyle the five steps and the itinerary as cards on the dark surface. Keep who, occasion, vibe, budget, and tomorrow. City, date, and group-size fields from the brief would change the API contract, so they wait. Preference chips in the brief (live music, clubbing, pubs, comedy, food, surprise) do not match the current vibe ids (`chill`, `wild`, `cultural`, `romantic`, `surprise`). Keep the current ids so the scorer still runs. Itinerary cards must link with `detailHrefFromPlan`. Empty state stays the API's "nothing in the next 48 hours" result.

### Phase 7 — Mobile navigation

Files: `src/components/layout/Navbar.tsx`, new `MobileNav.tsx`, `src/app/layout.tsx`.

Bottom bar as specified, only for destinations that exist, hidden on dashboard, admin, and auth. Keyboard and screen-reader labels, `aria-current`, 44px targets, safe-area padding, reduced motion. Do not remove the existing header menu in the same step until the bar is verified. Venue owners keep the current dashboard links in the header.

### Phase 8 — Venue dashboard

Files under `src/app/dashboard/`.

Dark, dense, consistent with tokens, visually quieter than the consumer homepage. Keep overview, events, create, and profile. Show only the four real stats. No charts that imply bookings or revenue. No new tables.

### Phase 9 — Accessibility, SEO, performance

- Labels, focus, contrast, reduced motion, alt text from event and venue names
- `generateMetadata` on event and venue pages from stored title, venue, and description
- Optional `sitemap.ts` built from published slugs. No fake schema
- `next/image` for logos and known Supabase image hosts, after remotePatterns is confirmed. Do not block the redesign on a config change if hosts are unknown; flag it
- Avoid new client components for data that is already fetched on the server

### Phase 10 — Quality gate after every approved phase

Run, and paste the result:

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run build`

There is no project test script to run. Then check, on a desktop width and a 390px width:

- `/`, `/events`, `/events/[slug]`, `/venues`, `/venues/[slug]`, `/planner`, `/planner/plan`
- `/auth/login` (do not complete a real signup unless you provide a test account)
- `/profile` redirect when signed out
- `/dashboard` and `/admin` redirect when signed out
- Keyboard path through the new controls
- An event with and without `ticket_url`, and a venue with and without photos

Do not disable lint rules or loosen TypeScript to get green.

## Testing and rollback strategy

- One phase per branch or per commit, starting from the current `main` tip (`064a9bb`). No force-push.
- The Git rollback is reverting that phase commit. Avoid mixing token changes with page rewrites in one commit so a bad homepage can be reverted without losing the palette.
- Database rollback is not required if we follow this plan: no SQL, no RLS edits, no new buckets.
- Before Phase 2, record the current homepage and `/events?county=Cork&type=live_music` behaviour (filters, empty copy, map). After the phase, those URLs must still open.
- Planner rollback is a visual revert only if `route.ts` stays untouched. A quick check is a plan URL such as `/planner/plan?who=friends&occasion=none&vibe=chill&budget=moderate&tomorrow=nothing` and confirming the POST body is unchanged.
- Auth rollback: middleware matchers and `src/lib/auth/redirect.ts` stay out of UI commits.
- If `next build` fails on `cacheComponents`, stop and report. Do not flip the flag off to get a green build.

## Approval needed before Phase 1

1. Proceed with Phase 1 (tokens and controls only) on the current `main` tip.
2. Keep Geist rather than adding Inter.
3. Accept the category mapping, including no Festivals chip until a real type exists.
4. Confirm the hero may ship on the existing night gradient and Ireland map until a photograph is supplied.
5. Confirm behaviour fixes (ticket links, directions, removing false checkout copy, URL sync) are allowed inside the phase that touches that screen, and that planner API fields stay as they are.

No application code has been modified.
