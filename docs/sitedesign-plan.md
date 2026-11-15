# Site design refresh plan

Owner decisions, 14 Nov 2026. Defaults from this plan:

1. Shamrock `#13E09D` is the Tonight, Live, and Free colour. `--color-mint` stays pink.
2. Map tiles stay on OpenStreetMap, darkened with a CSS filter. CARTO waits on terms.
3. Headings use Bricolage Grotesque only. No Anton.
4. A venue can still be created with no photo. Phase 2.
5. The homepage photo, when built, uses the first featured event, then the venue image, then fallback art. No video.
6. The Tonight rail, when built, does not autoplay.
7. Every solid pink fill uses Night Ink text.

Phase 1 is the implementation that follows. Phase 2 is still a plan.

Plan only. No visual changes ship with this file.

The owner’s note is that the site looks very flat. Checked against `main` at `01e61ae`. The research report’s contrast maths hold. A few of its “missing” features are already built, and its proposed surface steps are as flat as the colours they replace. This plan follows the code.

Stack the work as Phase 1 (tokens, bands, cards, type, contrast, fallback art, maps), then Phase 2 (hero photo, Tonight rail, photos at venue create, event detail). Leave Supabase schema, RLS, auth, and the planner API alone.

## What the code actually does

| Claim in the report | In the repo |
|---|---|
| Page `#13121c`, card `#1f1f28`, border `#2f2e4d`, primary `#ff3d81`, secondary `#571bc1`. Stitch comment names RA, Spotify, and DICE. | Matches `:root` and `.dark` in `src/app/globals.css`. `<html>` has no `dark` class (`src/app/layout.tsx`). Edit both token blocks. `dark:` utilities do not apply today. |
| Hero stops `#0b0b14` → `#171629` are 1.10:1. Card on page is 1.14:1. White on `#FF3D81` is 3.37:1. | Recomputed. The CSS comment’s “~4.6:1” for white on pink is wrong (it is 3.37:1). Dark `#13121c` on the same pink is already 5.51:1. |
| Outfit headings, Geist body, Geist Mono loaded. Home section titles are `text-2xl md:text-3xl`. | True for `CategoryBrowse`, `HomeEventSection`, `DiscoverVenues`, `PlannerPromo`, `CountyExplore`. Those classes override `--text-h2`. Home and page heroes are already larger (`HomeHero` clamp, `PageHero` `text-4xl md:text-5xl`). |
| Cards: `rounded-2xl`, 1px border, 16:9, pink border and `shadow-black/25` on hover, image scale 1.03. | `EventCard.tsx` line 198, `VenueCard.tsx` line 105. |
| Homepage order: hero, categories, three event sections, venues, planner promo, counties, each with a hairline. | `HomePageClient.tsx`. Featured renders only when `is_featured` events exist. The “22 files with `border-b border-border`” count is real and includes tables, forms, and the navbar. The homepage hairlines are six components: `HomeHero`, `CategoryBrowse`, `HomeEventSection`, `DiscoverVenues`, `PlannerPromo`, `CountyExplore`. |
| Imageless cards share one icon tile. | The chrome is one pink tile. The icon already changes (`Music`, `Disc3`, `Mic2`, `HelpCircle`, `Trophy`, `Tag`, and the venue set). There is no `trad` event type. Types are `live_music`, `dj`, `comedy`, `quiz`, `sports`, `special_offer` (`src/lib/venue-profile.ts`). |
| Maps use light OSM tiles. | `EventsMapInner.tsx` line 414, `PlanMapInner.tsx` line 217, `EventLocationMapInner.tsx` line 36. |
| `.glow-pink`, `.glow-violet`, `.glow-teal`, `.glass-elevated` are unused. | True as class names. `.glow-pink-sm` and `.glow-violet-sm` are unused too. Brand buttons already inline the same pink glow (`src/components/ui/button.tsx`). `.glass` is the navbar. |
| Violet and teal are almost unused. `--color-mint` is the old green. | Violet appears once (`bg-violet/10` in `HomeHero`). Teal is unused in components. `--color-mint` is already `#ff3d81`. Emerald is still used: `accent-emerald-400` on two checkboxes in `CreateEventForm.tsx`. |
| `tw-animate-css` is barely used. Motion is hover and skeletons only. | The package drives `animate-in` on dialog, dropdown, select, tooltip, and the planner. Skeletons use `animate-pulse` and respect `motion-reduce`. A global `prefers-reduced-motion` rule already zeroes animation and transition duration. |
| Public nav active state is pink. | Pink active styles apply to venue-owner links only (`Navbar.tsx`, `isVenue && isVenueLinkActive`). Public links do not show the current page. |
| Event detail still needs a ticket bar, map, and related events. | `src/app/events/[slug]/page.tsx` already has the photo header, date, map, related events, desktop ticket card, and a sticky mobile “Get tickets” bar when `ticket_url` is set. |
| Venue create asks for no photo. | `CompleteVenueForm.tsx` collects name and address only. Uploads already exist later, on `VenueProfileForm.tsx` (bucket `venue-images`, max 6, 5 MB, jpeg/png/webp/gif). `CreateEventForm.tsx` does not upload; it copies `venue.images?.[0]` into `image_url`. |
| Opening hours, gallery, and vibe chips are absent. | `opening_hours` is on the `Venue` type and is not shown or edited. The venue page already has a photo gallery and atmosphere chips when the data exists. |

`PageHero` is a map mask at 10% opacity and no blobs. `HomeHero` is the same mask at 15%, plus two blobs at 10% opacity. The report describes both heroes as having the blobs.

## Tokens

Keep Neon Rose `#FF3D81`. Give each accent one job. Put the ladder on semantic tokens and point the legacy night stops at the same values, so existing `from-night via-night-soft to-forest` gradients follow along. Leave `--color-mint` mapped to pink so nothing green-washes by surprise. Add `--color-shamrock` as a new token.

The report’s Surface `#16141F` on Night Ink `#0B0A12` is **1.08:1**, and Raised `#211E2D` on Surface is **1.12:1**. Today’s card-on-page step is 1.14:1. Swapping those hexes does not create depth. Pink text also caps how light a card can go: `#FF3D81` on `#211E2D` is 4.84:1, and on `#2A2638` it falls to 4.35:1 (fails AA). Depth in Phase 1 comes from a darker page, a tinted band, a lighter top edge, and a coloured glow.

| Token | Hex | Job | Contrast to hit |
|---|---|---|---|
| `--background`, `--color-night` | `#0B0A12` | Page | Text `#F5F3FA` 17.9:1 |
| `--surface`, `--color-night-soft` | `#16141F` | Section bands, under a tint wash | Text 16.5:1. Muted `#A39FB5` 7.1:1. Rose text 5.4:1 |
| `--card`, `--popover`, `--color-forest` | `#211E2D` | Cards and panels | Text 14.8:1. Muted 6.4:1. Rose text 4.84:1 |
| `--foreground` | `#F5F3FA` | Body and headings | ≥ 7:1 on page, band, and card |
| `--muted-foreground` | `#A39FB5` | Meta text | ≥ 4.5:1 on page, band, and card |
| `--border` | `#3A3552` | Edges | 1.41:1 on Raised. Stronger than the report’s `#2E2A40` (1.18:1). This is not a 3:1 non-text boundary; the top highlight and the glow carry the edge |
| `--primary` | `#FF3D81` | CTA fill, focus ring | Ring on Raised is 4.84:1 (clears the 3:1 non-text target) |
| `--primary-foreground` | `#0B0A12` | Text on pink fills | 5.85:1 on `#FF3D81`, 7.37:1 on hover `#FF6BA0` |
| `--secondary` | `#571BC1` | Planner fill. Keep. | `#F7F7FA` on it is 8.42:1 |
| `--color-violet` | `#8B5CF6` | Planner icons on Night Ink only | 4.65:1 on Night Ink. 4.30:1 on Surface and 3.85:1 on Raised: do not use for text there |
| `--color-shamrock` | `#13E09D` | Tonight, live, free | 11.4:1 as text on Night Ink. As a fill, label it with Night Ink (11.4:1). White on it is 1.72:1 |
| `--color-amber` | `#FFB547` | Featured | 11.2:1 as text on Night Ink, or Night Ink text on an amber fill. White on it is 1.76:1 |

Update the contrast comment in `globals.css` to these measured ratios. Set `themeColor` in `layout.tsx` to `#0B0A12`.

Accent roles, applied where Phase 1 already touches the markup:

- Pink: primary buttons, the focus ring, the current-page or pressed fill.
- Shamrock: “Tonight”, “Free”, and any live label.
- Violet: planner iconography on Night Ink. Filled planner buttons stay `--secondary`.
- Amber: featured.
- Card chrome icons (map pin, type icon) use `--muted-foreground`.

## Phase 1

Each item is done when its acceptance checks pass. Screenshot the routes in [Verification](#verification) before editing, and again after the phase.

### 1. Colour layering and tokens

**Files:** `src/app/globals.css` (`:root` and `.dark`, `@theme` night/forest aliases, contrast comment, new `.band-wash` and `.card-lift` utilities), `src/app/layout.tsx` (`themeColor`).

**Change:** apply the token table. Add `.band-wash`: Surface fill plus two radials, rose at 16% and violet at 12%, fading to transparent. Add `.card-lift`: `inset 0 1px 0 rgba(255,255,255,0.06)`, and on hover the same inset plus `0 0 24px rgba(255,61,129,0.28)`.

Hero washes live here too, because the flat gradient is a token problem. In `HomeHero.tsx` and `PageHero.tsx`, keep the Ireland mask and replace the 10% blobs with two large radials (rose and violet) at the same 16% / 12%. `PageHero` has no blobs today; add the radials there. Gate any drift animation with `motion-reduce:`. The global reduced-motion rule already collapses animation duration; still skip the animation in the reduced-motion stylesheet so it does not flash.

Raise the wash only if a screenshot still looks flat and the hero text still clears the contrast checks. The report’s 25–35% is the ceiling, not the starting point.

**Done when:**

- Page, band, and card use the three surface hexes, and `:root` matches `.dark`.
- `#F5F3FA` is ≥ 7:1 on all three. `#A39FB5` is ≥ 4.5:1 on all three. `#FF3D81` text is ≥ 4.5:1 on page, band, and card.
- Hero `h1` and the search labels in `HomeHero` are ≥ 4.5:1 against the pixels behind them.
- Focus ring stays ≥ 3:1 against the control’s own background.
- Auth pages and the dashboard header, which reuse `from-night … to-forest`, pick up the new stops without a rewrite.

### 2. Section bands

**Files:** `src/components/home/CategoryBrowse.tsx`, `DiscoverVenues.tsx`, `CountyExplore.tsx`, `HomeEventSection.tsx`, `PlannerPromo.tsx`, `HomeHero.tsx`.

**Change:** remove `border-b border-border` from those six. Paint `CategoryBrowse`, `DiscoverVenues`, and `CountyExplore` with `.band-wash`. Leave `HomeEventSection` and `PlannerPromo` on the page colour. `PlannerPromo` already has a raised inner card (`from-night-soft via-card to-forest`); retint that card to Raised plus a rose wash so it sits clearly on the page. Do not band every event section. Featured is often absent, and banding Featured, Tonight, and Upcoming would stack three bands.

**Done when:** on the homepage, categories, venues, and counties read as separate bands, and the event grids sit on the page colour between them. With no featured events, two bands still do not touch. Section headings stay ≥ 4.5:1 on both grounds. Keyboard focus rings are visible on category links and county buttons.

### 3. Card glows and hovers

**Files:** `src/components/EventCard.tsx` (line 198), `src/components/VenueCard.tsx` (line 105), `src/components/ui/card.tsx`.

**Change:** add `.card-lift` to both discovery cards and drop `hover:shadow-xl hover:shadow-black/25`. On hover, move the card up 2px (`-translate-y-0.5`) and keep `hover:border-primary/70`. Add `motion-reduce:transform-none`. Put the inset highlight on the base `Card` only if it can share `.card-lift` without fighting `shadow-none`. `overflow-hidden` on these cards does not clip their own box-shadow.

Use one utility rather than `.glow-pink-sm`. A second shadow class replaces the inset highlight.

**Done when:** hover shows a pink glow and a 2px lift on event and venue cards; the image still scales to 1.03 and does not scale under reduced motion; the focus-within ring remains; unhovered cards still show the 1px top highlight.

### 4. Heading font

**Files:** `src/app/layout.tsx`, `src/app/globals.css` (`--font-heading`, `h1`/`h2` tracking), the five home section components above.

**Change:** load Bricolage Grotesque (600, 700, 800) with `next/font/google`, assign it to `--font-heading`, and remove Outfit. Keep Geist and Geist Mono. Set heading tracking to `-0.03em`. Change those five home `h2`s from `text-2xl md:text-3xl` to `text-3xl md:text-4xl`. Leave detail-page `h2`s at `text-2xl` so the homepage is the display moment. Do not add Anton in this phase.

**Done when:** computed style of a homepage `h2` is Bricolage Grotesque at the new size, body copy is still Geist, and the hero wordmark image is unchanged.

### 5. Button contrast

White label text on `#FF3D81` is 3.37:1. These controls are `text-sm` (14px), including the semibold ones, so the AA bar is **4.5:1**, not the large-text 3:1. Setting `--primary-foreground` fixes `button.tsx` (`default`, `brand`) and the default `badge.tsx` variant. It does not fix hardcoded `bg-hotpink text-white`.

**Files:**

- `src/app/globals.css` (`--primary-foreground` in both blocks)
- `src/components/layout/Navbar.tsx` lines 128 and 190 (hover `#FF6BA0` too)
- `src/components/EventCard.tsx` line 273 (Free pill)
- `src/components/home/CountyExplore.tsx` lines 43 and 61
- `src/app/events/page.tsx` lines 101, 114, and 455
- `src/app/venues/page.tsx` line 332
- `src/components/events/EventsFilterSidebar.tsx` line 92
- `src/app/planner/page.tsx` line 545
- `src/app/planner/plan/PlanResultContent.tsx` lines 686 and 703
- `src/app/auth/signup/page.tsx` lines 109 and 120

**Change:** pink fills use Night Ink text. Outline and link styles that are pink text on a dark surface already pass (5.5:1 on today’s page, 5.85:1 on Night Ink) and stay as they are. Leave secondary fills on `#571BC1` with light text.

**Done when:** every pink fill listed above, and the brand button, measures ≥ 4.5:1 for its label. Hover `#FF6BA0` with Night Ink text is 7.37:1. Pressed county, date, and view-mode controls are still obvious.

### 6. Fallback art for imageless cards

**Files:** `src/components/EventCard.tsx` (the empty branch around line 220), `src/components/VenueCard.tsx` (around line 128). Extract the gradient map to `src/lib/fallback-art.ts` and add that file to the `test` script in `package.json`.

**Change:** one gradient per real type, a large muted icon, and a light grain (a CSS repeating-gradient or the existing map SVG at low opacity). Suggested pairs, all using the accent tokens:

| Type | Stops |
|---|---|
| `dj`, `club` | violet → rose |
| `live_music`, `live_music_venue`, `pub` | shamrock → amber |
| `comedy`, `special_offer`, `restaurant` | amber → rose |
| `quiz` | violet → shamrock |
| `sports`, `bar` | rose → amber |
| unknown | Night Ink → Raised, muted icon |

Reuse the same helper on the empty hero of `events/[slug]/page.tsx` and `venues/[slug]/page.tsx` so a missing photo matches the card.

**Done when:** two imageless events of different types render different gradients; an event with `image_url` or a first venue image still shows the photo; a unit test locks the type-to-gradient map; text on the tile (venue name, type label) is ≥ 4.5:1.

### 7. Dark map tiles

**Files:** `src/components/EventsMapInner.tsx`, `src/components/PlanMapInner.tsx`, `src/components/events/EventLocationMapInner.tsx`. Add `src/lib/map-tiles.ts` and import it from all three. `src/lib/leaflet-map.ts` stays the Leaflet lifecycle guard; do not mix tile URLs into that file.

**Change:** one shared tile constant. Preferred tiles are CARTO Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) with OSM and CARTO attribution in the existing Leaflet attribution control. Ship that only after the owner accepts CARTO’s basemap terms for a commercial site (open question). Until then, keep the OSM URL and darken the tile pane with a CSS filter (`invert(1) hue-rotate(180deg)` plus a slight brightness cut) on `.leaflet-tile-pane`. Same look on all three maps. No new host, no new terms.

**Done when:** events map, planner map, and event-location map all use the same tile source; attribution is still visible; pan and zoom still work (the remove-guard in `leaflet-map.ts` must keep working); the map is no longer a bright rectangle on the page.

### Phase 1 leaves in place

Do not delete the emerald or cyan scales while `accent-emerald-400` is in `CreateEventForm.tsx`. Do not retarget `--color-mint`. Do not add a date-grouped feed, collections, or a new motion system in this phase.

## Phase 2

Depends on Phase 1 tokens, fallback art, and the pink-label fix. Scope is component size, not a schedule.

### 1. Photo-led hero

**Effort:** medium. `HomeHero.tsx`, and the featured-event pick already in `HomePageClient.tsx` (`image_url`, `is_featured`, venue `images`).

**Depends on:** Phase 1 hero washes (they become the scrim), and on a real photo. Use the featured event image, then the first venue image, then `fallback-art`. There is no video field; a looping clip is out of scope until one exists.

**Change:** full-bleed image, dark gradient scrim, a line such as “Tonight in Cork” using the county already selected in `HomePageClient` (default Cork) and the tonight count already computed there, search form kept as the glass panel it already is (`bg-card/90`). Headline and form labels ≥ 4.5:1 on the scrim.

### 2. Tonight carousel

**Effort:** medium. `HomeEventSection.tsx` or a new `src/components/home/TonightRail.tsx`, plus a poster variant on `EventCard`. Data is the existing `tonight` list (cap 6, Europe/Dublin via `isSameLocalDay`).

**Depends on:** Phase 1 cards and fallback art. Photos make it better. The rail can ship before uploads.

**Change:** horizontal 4:5 poster cards, date in Geist Mono, Shamrock “Tonight” label with Night Ink text if the label is a fill. Keep the empty state and the “See all” link. Arrow buttons and keyboard scroll. No autoplay. `motion-reduce` disables snap animation. Raise the cap only if the query already returns enough rows (it fetches 50).

### 3. Venue photo at create time

**Effort:** medium. `src/app/auth/complete-venue/CompleteVenueForm.tsx`, reusing `uploadPhotos` behaviour from `VenueProfileForm.tsx` and the checks in `src/lib/venue-profile.ts`. The venue row has to exist before a storage path can include its id, so the photo step comes after `POST /api/auth/venue` succeeds, on the same screen, before the dashboard redirect.

**Depends on:** the existing `venue-images` bucket and policies. No schema change. Skipping must stay possible until the owner says a photo is required (open question). `CreateEventForm.tsx` still copies the first venue image; an event-specific file input is a follow-on in the same form, using `events.image_url`, and is what makes the hero and the rail show artwork that is not the venue’s first photo.

**Done when:** a new venue can save one photo before reaching the dashboard, the photo appears on `VenueCard`, and a venue saved with no photo still gets fallback art.

### 4. Event detail

**Effort:** medium, and smaller than the report suggests. `src/app/events/[slug]/page.tsx` only.

**Depends on:** Phase 1 fallback art and dark tiles. The sticky mobile ticket bar, the map, related events, and `ticket_url` stay. Do not rebuild them.

**Change:** when an image exists, use it as a blurred backdrop behind the current framed photo. Add a large Geist Mono date block. When it does not, use `fallback-art` instead of the plain type label. Point the location map at `map-tiles`. Ticket label contrast is covered by Phase 1.

## Later

Not in either phase: a Shotgun-style date-grouped `/events` feed, seasonal collections, scroll-driven card entrance, a venue opening-hours editor (`opening_hours` is stored and unused), and a second display face (Anton).

## Risks

- **Pink text on lighter cards.** Lightening Raised past `#211E2D` drops `#FF3D81` under 4.5:1. Stop at Raised.
- **Violet text on bands and cards** fails AA (4.30:1 and 3.85:1). Violet stays on Night Ink.
- **Shamrock and amber fills with white text** fail badly (1.72:1 and 1.76:1). Fills use Night Ink text.
- **CARTO terms.** Dark Matter is the better map. Shipping it on a commercial site needs the owner’s say-so. The OSM filter is the default until then.
- **Retargeting `--color-forest`** recolours every `to-forest` surface, including auth and the dashboard. That is intended. Check those screens in the after screenshots.
- **Hero wash vs headline contrast.** A stronger radial can push white headline text under 4.5:1. Measure before raising opacity.
- **Required photos** will block venues that have no artwork. Default the create step to skippable.
- **Leaflet.** Tile changes go through the three inner map components. Leave `guardLeafletRemove` in place and retest pan and zoom.
- **Font load.** Bricolage Grotesque is a new Google font request from `next/font`. Outfit can be removed in the same change so the page does not load both.

## Open questions

1. Bring back a green (Shamrock `#13E09D`) for Tonight, Live, and Free? The current `--color-mint` token was deliberately remapped to pink.
2. Dark maps: accept CARTO Dark Matter and its attribution, or ship the filtered OSM tiles?
3. Bricolage Grotesque for headings is the recommendation. Do you also want Anton on the hero or the event date, or is one new face enough?
4. May a venue be created with no photo, or is one photo required before publish?
5. Which event owns the homepage photo: the first `is_featured` event in the selected county, or a hand-picked slot? There is no video field, so a looping clip needs a new decision.
6. Should the Tonight rail autoplay? This plan leaves it manual.
7. Dark text on every pink fill, including county chips, date chips, and the grid/map toggle? This plan says yes, because they are all 3.37:1 today.

## Verification

Take the before shots on `main` and the after shots on the implementation branch, from `npm run dev`, at desktop (~1280) and mobile (~390).

| Shot | Route | What to look at |
|---|---|---|
| Home | `/` | Bands, hero wash, heading font, a card with a photo and one without |
| Counties | `/` county chips | Pressed chip text contrast |
| Events | `/events` | Date chip, grid/map toggle, map tiles |
| Event | `/events/[slug]` | Header, ticket button, map. Phase 2: backdrop and date block |
| Venue | `/venues/[slug]` | Hero fallback or photo, map |
| Planner | `/planner` | Pink controls, planner map |
| Sign up | `/auth/signup` | Role toggle and the night gradient |
| Navbar | any page, signed out | “Get Started” at rest and on hover |

Also hit an imageless card, a free event, and a featured badge. Toggle `prefers-reduced-motion` and confirm the card does not lift or scale and the hero wash does not drift.

Commands, from `package.json`:

- `npm run lint`
- `npm test` (the three gate files, plus `fallback-art` once that module exists)
- `npm run build`

Phase 1 is done when those three pass and the after shots match the acceptance checks above. Phase 2 repeats the same commands and replaces the home, Tonight, create-venue, and event-detail shots.
