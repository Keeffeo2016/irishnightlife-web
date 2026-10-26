# IrishNightlife - Development TODO List

**Last Updated:** 2026-10-25

The old list still asked to scrape Cork and build pages that already exist. This file matches the app.

---

## Done

### Browse
- [x] Homepage reads published upcoming events from Supabase
- [x] County filter uses an inner join so missing venues do not crash the page
- [x] Empty state when nothing is upcoming
- [x] Venue listing, venue detail, event listing, event detail
- [x] Venue type filter matches multi-word types (`live_music_venue`)
- [x] Leaflet map stays mounted when the county changes
- [x] Plan map loads in the browser only
- [x] One shared light header and footer, with working Sign In and Get Started links on mobile

### Planner and data
- [x] Tonight Planner wizard and plan result page
- [x] Planner API with deterministic scoring
- [x] 24 Cork venues and 35 events reseeded on a rolling 7-day window

### Accounts
- [x] Login and signup pages
- [x] For Venues landing page
- [x] Venue signup writes slug, address, city, and county, and returns the database error if the insert fails
- [x] New venue accounts get `venue_owner` from the signup trigger
- [x] Owners can insert their own venue row
- [x] Unconfirmed email is called out on the login page
- [x] `/dashboard` requires a venue owner or admin
- [x] `/admin` requires an admin and shows live counts, not fake revenue
- [x] Venue dashboard lists that owner's venues and upcoming events
- [x] Save and unsave on venue and event pages

### Deploy
- [x] Production is live at https://irishnightlife.vercel.app
- [x] Homepage, planner, and login respond on that URL
- [x] Signed-out `/dashboard` redirects to login

---

## Next

1. Record the planner flow from `LINKEDIN_DRAFT.md` and post it
2. Add venue photos

---

## Later

Do not start these until the Cork demo is live.

- Dublin, Galway, and the other counties
- Stripe, bookings, reviews, live crowd updates, weekly email, image upload
- Tighten planner scoring before any LLM: clock time, county, and drop the random bonus
- Admin revenue and moderation once those records exist

---

## Launch goals

- [ ] 100+ venues listed
- [ ] 500+ events in the database
- [x] Deployed public URL — https://irishnightlife.vercel.app
- [ ] Page load under 2 seconds on the homepage
- [ ] No crash on county change, map, or empty nights
