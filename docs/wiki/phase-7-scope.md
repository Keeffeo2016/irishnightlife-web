# Phase 7 scope — Mobile Bottom Navigation

Approved 2026-10-26 (Phase 6 approved in the same message). Plan section: Phase 7 in [UI_REDESIGN_PLAN.md](../UI_REDESIGN_PLAN.md).

## Target files

- `src/lib/mobile-nav.ts` — Pure visibility and active-route helpers (`MOBILE_NAV_ITEMS`, `shouldShowMobileNav`, `isMobileNavItemActive`, `activeMobileNavHref`)
- `src/components/layout/MobileNav.tsx` — Fixed consumer bottom navigation below `md` breakpoint (`md:hidden`)
- `src/app/layout.tsx` — Mounts `<MobileNav />` beside `<Navbar />` and `<Footer />`
- `src/components/layout/Footer.tsx` — Adds safe-area bottom clearance (`pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-0`) when `shouldShowMobileNav(pathname)` is true, and removes the synchronous `setState` in `useEffect` lint error
- `src/app/events/[slug]/page.tsx` — Coordinates the optional mobile sticky ticket bar with `MobileNav` (`bottom-[calc(4.25rem+env(safe-area-inset-bottom))]`) so the two bars never overlap

## Five destinations

| Label | Route | Icon | Active match rule |
|---|---|---|---|
| Home | `/` | `House` | Exact `pathname === '/'` only |
| Events | `/events` | `CalendarDays` | `/events` or `/events/*` |
| Explore | `/venues` | `Compass` | `/venues` or `/venues/*` |
| Planner | `/planner` | `Sparkles` | `/planner` or `/planner/*` |
| Profile | `/profile` | `UserRound` | `/profile` or `/profile/*` (never `/auth/*`) |

## Visibility rules

Hidden on:
- `/dashboard` and `/dashboard/*`
- `/admin` and `/admin/*`
- `/auth` and `/auth/*`

Desktop navigation (`Navbar.tsx`) remains untouched.
