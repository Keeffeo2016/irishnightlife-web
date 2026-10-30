# Phase 9 accessibility, images, performance

Ingested 2026-10-26 from explore audit at commit `aa94049`. Not a WCAG compliance claim.

## Images

- No `remotePatterns` yet — add Supabase storage host before migrating remote `<img>`
- 7 native `<img>` sites; cards + detail heroes are P1; dashboard blob previews may stay `<img>` or `unoptimized`

## A11y P0 / P1

- Auth labels missing `htmlFor`/`id`
- Filter chip remove targets too small (`h-4 w-4`)
- Leaflet keyboard/AT gaps — mark unverified without claiming pass
- Skip link missing
- Navbar mobile menu: no focus trap / Escape
- Password toggle missing accessible name

## Performance / limits

- Events `.limit(50)` disclosed in UI — OK; propose additive pagination, do not silently raise cap
- Home uses same 50-pool then slices — featured can silently miss (document; separate queries need approval)
- Venues discovery unbounded — document as debt
- Leaflet CSS on root layout — move with map modules if low risk

## Manual AT required

Keyboard-only maps/filters/planner/auth/dashboard; VoiceOver/TalkBack MobileNav; contrast on mint overlays; dialog focus.
