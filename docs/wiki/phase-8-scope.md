# Phase 8 scope & pre-edit audit — Venue Owner Dashboard Redesign

Approved 2026-10-26 (Phase 7 approved in the same message). Plan section: Phase 8 in [UI_REDESIGN_PLAN.md](../UI_REDESIGN_PLAN.md).

## 1. Pre-edit audit findings (2026-10-26)

### Routes & authentication/ownership boundaries
- **Middleware (`src/lib/supabase/middleware.ts`)** + **Server guard (`getVenueDashboard` in `src/lib/venue-dashboard.ts`)**:
  - Unauthenticated requests to `/dashboard*` redirect to `/auth/login?next=<encoded path>`.
  - Authenticated users whose `users.role` is not `venue_owner` or `admin` redirect to `/for-venues`.
  - `getVenueDashboard()` queries `venues` with `.eq('owner_id', user.id)`.
- **Supabase RLS (`supabase/schema.sql` & `supabase/admin-overview.sql`)**:
  - `venues`: `Owners can read own venues` (`auth.uid() = owner_id`), `Venue owners can update own venues` (`auth.uid() = owner_id`), plus `protect_venue_verification` trigger preventing non-admins from changing `is_verified`.
  - `events`: `Venue owners can read/update/delete own events` (via `venues.owner_id = auth.uid()`), `Venue owners can create events for approved venues` (`venues.owner_id = auth.uid() AND venues.is_verified = true`).
  - No authorisation weaknesses found.

### What currently works
1. **Overview (`/dashboard` — `src/app/dashboard/page.tsx`)**:
   - Displays venue count, upcoming event count, venue page views, and event page views (via `owner_page_view_counts` RPC), pending approval notice when `!venue.is_verified`, and upcoming events list.
   - Note: Currently executes two separate `events` queries (`upcomingResult` and `eventSlugResult`). Fetching all events for `venueIds` in a single query (`id, title, slug, start_time, end_time, event_type, is_published, venue_id`) provides **Total events**, **Upcoming events**, **Published events**, **Draft events**, and all event slugs for `getOwnerViewCounts` in **1 query instead of 2**!
2. **Events (`/dashboard/events` — `src/app/dashboard/events/page.tsx`)**:
   - Lists `Upcoming` and `Earlier` events with title, date/time, venue name, view count, and `Published` / `Draft` link to `/events/[slug]`.
   - Fix needed: line 39 calls `const now = Date.now()` directly during render, which triggers the `react-hooks/purity` ESLint error (`Error: Cannot call impure function during render`).
3. **Create Event (`/dashboard/events/new` — `page.tsx` & `CreateEventForm.tsx`)**:
   - Blocks creation when `venues.length === 0` or `awaitingApproval` (`!venue.is_verified`).
   - Pre-fills venue `description`, `venue_type`, and `price_range`, updates the venue record on submit, and inserts the new event into `public.events` with `slugify(title)`.
   - Enhancement needed: validate optional `ticket_url` using `safeExternalUrl` (`http:` / `https:` only, rejecting `javascript:` or malformed URLs) before submitting, while keeping empty `ticket_url` allowed (`null`).
4. **Venue Profile (`/dashboard/profile` — `page.tsx`, `VenueProfileForm.tsx`, `HenStagSelect.tsx`)**:
   - Edits `description`, `venue_type`, `price_range`, `accepts_hen_stag` (`HenStagSelect`), and uploads/removes up to 6 photos (`MAX_VENUE_IMAGES = 6`, `MAX_VENUE_IMAGE_BYTES = 5 MB`, `JPEG/PNG/WebP/GIF`) in the `venue-images` Supabase Storage bucket.
   - Displays read-only venue `name` and formatted `address` (`address, city, county, postcode`).

### What is NOT implemented (and must not be fabricated)
- Event Edit, Delete, Duplicate, or in-place Publish/Unpublish buttons on `/dashboard/events` do not exist in the UI (only viewing the event at `/events/[slug]` and creating new events at `/dashboard/events/new`). Do not add non-functional action buttons.
- Ticket sales, revenue, impressions, conversion rates, or billing/subscription management do not exist. Only real event counts and real `owner_page_view_counts` page views exist.

## 2. Phase 8 Redesign Plan
- Create `src/lib/dashboard-validation.ts` with pure, testable helpers for:
  - Dashboard navigation items (`DASHBOARD_NAV_ITEMS`: Overview `/dashboard`, Events `/dashboard/events`, Add Event `/dashboard/events/new`, Venue Profile `/dashboard/profile`) and active-state matching.
  - Event summary metrics computation (`computeDashboardEventMetrics`: `total`, `upcoming`, `earlier`, `published`, `drafts`) without impure `Date.now()` in render.
  - Create-event form validation (`validateCreateEventInput`), including `safeExternalUrl` validation for optional `ticketUrl`.
  - Venue profile form validation (`validateVenueProfileInput`) and profile completeness check.
- Create `src/components/dashboard/DashboardShell.tsx` (or `DashboardNav.tsx`) providing:
  - Consistent header + persistent navigation bar across `/dashboard`, `/dashboard/events`, `/dashboard/events/new`, and `/dashboard/profile` with active state (`aria-current="page"`), quick link to **Return to public site** (`/`), and **Sign out** control.
  - Responsive mobile & desktop layout with zero horizontal overflow at 320px–430px.
- Redesign `/dashboard`, `/dashboard/events`, `/dashboard/events/new` (`CreateEventForm.tsx`), and `/dashboard/profile` (`VenueProfileForm.tsx` & `HenStagSelect.tsx`) using the dark + mint token system, non-colour-only status badges (`CheckCircle2` + `Published` / `Verified`, `Clock` / `FileText` + `Draft` / `Awaiting approval`), explicit labels, and `role="status"` / `role="alert"` feedback.
