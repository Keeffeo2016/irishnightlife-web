# Phase 6 implementation — Night Planner Redesign

Dated 2026-10-26. Branch `feature/ui-redesign`. Uncommitted on top of checkpoint `14b05f1` (preserving uncommitted Phase 4 & 5 changes).

## What shipped

1. **Planner Contract & Option Helpers (`src/lib/planner.ts`):**
   - Preserved all existing exports (`PlanSummary`, `summarizeEvents`, `sortStopsByStart`, `bestAlternate`, `swapStop`, `shuffleStops`, `canShuffleStops`, `detailHrefFromPlan`, `plannerPlanHref`, `preservePlannerOrigin`).
   - Added canonical option lists and query helpers (`PLANNER_FIELD_KEYS`, `PLANNER_OPTION_IDS`, `isValidPlannerOption`, `parsePlannerSearchParams`, `buildPlannerResultHref`, `buildPlannerWizardHref`, `isPlannerComplete`) so the wizard, itinerary results page, and automated test suite share a single source of truth for the `/api/planner` contract.

2. **5-Step Night Planner Wizard (`src/app/planner/page.tsx`):**
   - Wrapped in `<Suspense>` so `useSearchParams()` + `parsePlannerSearchParams` prefill answers when returning via **Adjust preferences** from `/planner/plan`.
   - Compact `PageHero` with `"NIGHT PLANNER"` eyebrow, `Your Night. Your Way.` heading, and `"Tell us what kind of night you're after and we'll help you find the right events."` subtitle (zero AI/LLM claims).
   - Accessible 5-step progress indicator (`<nav aria-label="Planner progress">`) displaying `Step X of 5`, `Check` icons on completed steps (not relying on colour alone), and keyboard-accessible step jumping (`aria-current="step"`).
   - Replaced emoji on option cards with Lucide icons in mint-accented containers (`User`, `Heart`, `Users`, `UsersRound`, `Compass`, `Beer`, `Cake`, `Crown`, `Trophy`, `Gem`, `HandMetal`, `Coffee`, `Flame`, `Music`, `Sparkles`, `Wallet`, `Banknote`, `Moon`, `AlarmClock`, `Sunrise`).
   - Removed the auto-advance timer; selecting an option immediately sets `aria-pressed={active}`, renders a visible `"Selected"` pill with a `Check` icon, announces the reaction copy in an `aria-live="polite"` banner, and provides explicit **Previous step**, **Continue to …**, and **Build My Night Plan** buttons plus interactive summary chips and a **Reset** action.

3. **Planner Itinerary Results (`src/app/planner/plan/PlanResultContent.tsx`):**
   - Compact left-aligned `PageHero` with `"NIGHT PLANNER ITINERARY"` eyebrow, `Your Night, Planned.` heading, narrative callout card, live summary pills (`stops`, `Estimated tickets`, `Duration` recomputed via `summarizeEvents`), and action toolbar (**Shuffle route**, **Fresh draw**, **Share plan** using Web Share API with clipboard fallback, and **Adjust preferences** linking back to `/planner?...` with choices preserved).
   - Ordered itinerary stop cards (`<ol aria-label="Planned itinerary stops">`) displaying `Stop X`, `eventTypeLabel`, `music_genre`, `<FavoriteButton>`, accessible `"Sorted"` toggle (`aria-pressed`, `Check` badge), linked event title and venue name (`detailHrefFromPlan`), Irish time (`Europe/Dublin`), formatted address/city/county, honest ticket price (`formatEventPrice`), visible recommendation reasons (`"Why this stop was recommended"`), and **Swap stop** (`swapStop`).
   - Branded skeleton loading state (`PlannerLoading`), graceful empty state for HTTP `404` / 0 matching events (*Try different preferences*, *View all upcoming events*, *Start fresh*), and error recovery state (*Try again*, *Adjust preferences*, *Browse all events*).

4. **Planner Route Map (`src/components/PlanMap.tsx` & `src/components/PlanMapInner.tsx`):**
   - Filtered stops to those with finite numeric `latitude` and `longitude`, showing partial-coordinate notices or a graceful fallback when coordinates are missing.
   - Created numbered SVG pins (`1`, `2`, `3`) matching the stop's itinerary index (`stopNumber`).
   - Eliminated the `react-hooks/set-state-in-effect` ESLint error in `PlanMapInner.tsx` by deriving `mapCenter` and `mapZoom` with `useMemo` and removing redundant `mounted` state inside the `ssr: false` dynamic component.
   - Added an accessible text list of route stops and venue locations below the map canvas.

## Verification

- `npm test`: 10/10 tests passing in `src/lib/phase4-gate.test.ts` (including planner option IDs, URL round-trips, origin links, and `summarizeEvents`/`sortStopsByStart`/`bestAlternate`/`swapStop`/`shuffleStops`).
- `npx eslint src/app/planner/page.tsx src/app/planner/plan/page.tsx src/app/planner/plan/PlanResultContent.tsx src/components/PlanMap.tsx src/components/PlanMapInner.tsx src/lib/planner.ts`: 0 errors, 0 warnings.
- `npx tsc --noEmit`: 0 errors.
- `npm run build`: succeeded cleanly.
