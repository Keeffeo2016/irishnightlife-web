# Phase 9 SEO audit

Ingested 2026-10-26 from explore audit at commit `aa94049`.

## Verdict

Detail pages (`/events/[slug]`, `/venues/[slug]`) largely pass. Site-wide crawl controls and listing metadata fail.

## Failures to remediate in Phase 9

1. Set `metadataBase` from `NEXT_PUBLIC_APP_URL`
2. Add `robots.ts` (disallow dashboard, admin, profile, auth, api; consider `/planner/plan`)
3. Add `sitemap.ts` for static public routes first (slugs optional later — do not invent)
4. `robots: { index: false }` on private/auth routes and `/planner/plan`
5. Route-specific `generateMetadata` for `/`, `/events`, `/venues`, `/planner`, `/for-venues`
6. Listing canonicals to clean paths (strip filter params for indexing)

## Pass

- Honest JSON-LD (no offers/ratings/hours invented)
- Event/venue detail titles, canonicals, OG when publicly visible
- Unpublished/unverified → notFound for public

## Gaps (may defer)

- Client-fetched listings reduce crawlable HTML on home/events/venues
- Nested `<main>` on planner plan
- Footer links to dashboard/auth without noindex (fixed once robots/metadata land)
