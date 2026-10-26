# Phase 7 implementation — Mobile Bottom Navigation

Dated **2026-10-26**. Branch `feature/ui-redesign` (uncommitted on top of checkpoint `14b05f1`). Scope: [phase-7-scope.md](./phase-7-scope.md).

## What shipped

1. **Pure Navigation Helpers (`src/lib/mobile-nav.ts`):**
   - `MOBILE_NAV_ITEMS`: 5 destinations (`Home` `/`, `Events` `/events`, `Explore` `/venues`, `Planner` `/planner`, `Profile` `/profile`).
   - `shouldShowMobileNav(pathname)`: returns `false` on `/dashboard` (and `/dashboard/*`), `/admin` (and `/admin/*`), and `/auth` (and `/auth/*`), and `true` on consumer routes.
   - `isMobileNavItemActive(pathname, href)` & `activeMobileNavHref(pathname)`: highlights `/` only at exact `/`, matches nested routes (`/events/[slug]` → Events, `/venues/[slug]` → Explore, `/planner/plan` → Planner), and never highlights Profile on `/auth/*`.

2. **Mobile Bottom Bar (`src/components/layout/MobileNav.tsx` & `src/app/layout.tsx`):**
   - Fixed bottom bar (`fixed inset-x-0 bottom-0 z-40 md:hidden`) with `pb-[env(safe-area-inset-bottom)]`, `<nav aria-label="Mobile primary navigation">`, and `aria-current="page"` on the active link.
   - Uses Lucide `House`, `CalendarDays`, `Compass`, `Sparkles`, and `UserRound`.
   - Active indicator does not rely on colour alone: combines a top mint indicator bar (`h-0.5 w-8 bg-primary`), a pill highlight around the icon (`bg-primary/15`), heavier icon stroke (`stroke-[2.25]`), and bold label weight.
   - Touch targets exceed 44×44px (`min-h-16 min-w-11`).

3. **Safe-Area, Footer, and Ticket Bar Coordination (`src/components/layout/Footer.tsx`, `src/app/events/[slug]/page.tsx`):**
   - `Footer.tsx`: adds `pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0` when `shouldShowMobileNav(pathname)` is true so the footer copyright is never covered by `MobileNav`. Also removed the synchronous `setState` in `useEffect` lint error in `Footer.tsx`.
   - `src/app/events/[slug]/page.tsx`: positioned the optional mobile sticky ticket bar at `bottom-[calc(4rem+env(safe-area-inset-bottom))]` above `MobileNav` so both coexist cleanly without overlapping.

## Phase 8 follow-up mobile checks (2026-10-26)

- **320px bottom nav:** five items fit (`Home`, `Events`, `Explore`, `Planner`, `Profile`), Home is current, `scrollWidth === 320`, no page overflow. Consumer bar is hidden on `/auth/login` and `/dashboard*` (redirect).
- **Ticket sticky bar:** no published events currently have `ticket_url`. Event detail (`/events/ceili-by-the-lee`) shows “Tickets are not sold on IrishNightlife” and **zero** Get tickets links, with MobileNav still visible.
- **Filter dialog layering:** Dialog overlay is `z-50`, MobileNav is `z-40`. Automated open of the Base UI sheet at 320px did not toggle `aria-expanded` in the emulated viewport; confirm overlay vs nav in a real device/session.
