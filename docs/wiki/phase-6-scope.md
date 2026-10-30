# Phase 6 scope — Night Planner Redesign

Approved 2026-10-26 (Phase 5 approved in the same message). Plan section: Phase 6 in [UI_REDESIGN_PLAN.md](../UI_REDESIGN_PLAN.md).

## Affected files (audited 2026-10-26)

- `src/app/planner/page.tsx` — 5-step planner wizard (`/planner`)
- `src/app/planner/plan/page.tsx` — Suspense wrapper for `/planner/plan`
- `src/app/planner/plan/PlanResultContent.tsx` — Itinerary results, Swap, Shuffle, Share, empty/error/loading states
- `src/components/PlanMap.tsx` & `src/components/PlanMapInner.tsx` — Leaflet itinerary map
- `src/lib/planner.ts` — Planner utility functions and option/query constants (preserve existing exports; add pure option/validation helpers for tests)

## Untouched by safeguard

- `src/app/api/planner/route.ts` — Do NOT modify API route, scoring rules, or response fields (`narrative`, `stops`, `alternates`, `total_cost`, `estimated_duration`).

## Key design & accessibility requirements

1. **Preserve contract:**
   - Inputs: `who` (`solo`, `date`, `friends`, `group`, `tourist`), `occasion` (`none`, `birthday`, `hen`, `stag`, `anniversary`, `leaving`), `vibe` (`chill`, `wild`, `cultural`, `romantic`, `surprise`), `budget` (`budget`, `moderate`, `splurge`), `tomorrow` (`nothing`, `early`, `hungover`).
   - Query params: `who`, `occasion`, `vibe`, `budget`, `tomorrow` (plus `from=planner` on detail links via `detailHrefFromPlan`).
2. **Planner landing (`/planner`):**
   - Heading: **Your Night. Your Way.**
   - Supporting text: `"Tell us what kind of night you're after and we'll help you find the right events."`
   - No AI / LLM claims.
   - Explicit **Back** and **Continue** controls on each step (no surprise auto-advance timer that steals focus from keyboard/screen-reader users; selecting an option marks it selected with a visible check badge + border/background change so selection never relies on colour alone, and users can either click **Continue** or click an already-selected card / use the step progress bar).
   - Replace giant emoji on option cards with clean Lucide icons in mint-accented containers.
   - Support pre-populating choices if the user navigates back from `/planner/plan?who=...` with query params.
3. **Planner results (`/planner/plan`):**
   - Heading: **Your Night, Planned.**
   - Display API `narrative`, `total_cost`, `estimated_duration` (recomputed accurately via `summarizeEvents` when stops are swapped/shuffled), and numbered itinerary cards.
   - Itinerary cards show: stop number, event title, venue name (linked with `detailHrefFromPlan`), location (address/city/county), Irish time (`Europe/Dublin`), honest price (`formatEventPrice`), why the event was recommended (`reasons`), `FavoriteButton`, and `View Event Details` / `View Venue` links preserving planner query params.
   - Preserve actions: **Swap** (`swapStop`), **Shuffle** (`shuffleStops`), **Fresh draw** (`fetchPlan`), **Share** (native Web Share API with clipboard fallback), **Adjust preferences / Back to planner** (`/planner?${queryKey}`), and per-stop **Sorted** check toggle.
4. **Planner map (`PlanMap` / `PlanMapInner`):**
   - Filter markers to stops whose venue has finite numeric `latitude` and `longitude` (`typeof v.latitude === 'number' && Number.isFinite(v.latitude)`), handling missing coordinates gracefully without crashing or inventing coordinates.
   - Numbered stop markers (`1`, `2`, `3`) matching the itinerary order, updating when stops are swapped or shuffled.
   - Eliminate the `react-hooks/set-state-in-effect` lint error in `PlanMapInner.tsx` by deriving `mapCenter` with `useMemo` instead of calling `setState` inside `useEffect`.

Related: [ui-redesign-goal.md](./ui-redesign-goal.md), [quality-gate.md](./quality-gate.md).
