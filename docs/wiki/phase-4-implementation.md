# Phase 4 implementation — Event detail

Dated 2026-10-26. Branch `feature/ui-redesign`. Uncommitted on top of checkpoint `14b05f1`.

## Pre-implementation gate

- Favourites cache: in-memory snapshot was not generation-guarded. A slower fetch from the previous session could overwrite the next user's saved-state in the same tab. RLS (`auth.uid() = user_id` on `user_favorites`) still blocks cross-user reads and writes. Fixed before the detail layout by ignoring stale commits (`shouldCommitFavoritesSnapshot`) and only mutating the cache when `cachedSnapshot.userId` matches the actor. Save/remove still notifies every mounted `FavoriteButton`.
- Irish DST: `dublinWallTimeToUtc` checked for 2026-01-15 (GMT), 2026-07-15 (IST), spring-forward 2026-03-29, and fall-back 2026-10-25. Passed.
- URL round trip for `county`, `type`, `genre`, `date`, and `q` passed.
- 50-event cap remains `QUERY_CAP = 50` on `/events`, with the on-page notice when 50 rows return. Documented in [phase-3-implementation.md](./phase-3-implementation.md).

## What shipped

Photography-led `/events/[slug]`: hero image order is `image_url`, then venue image, then a branded fallback. Sidebar tickets use `safeExternalUrl` (`http`/`https` only). Missing or unsafe ticket URLs do not render a checkout button or the old “secure checkout” line. A mobile sticky ticket bar renders only for a valid external URL. Share reuses `ShareEventButtons` plus Web Share, with clipboard fallback. The decorative hero share icon was removed. Directions use stored coordinates or address via OpenStreetMap. Related events prefer the same verified venue, then the same county, and keep planner query params. `generateMetadata` and Event JSON-LD use published records and omit offers and ratings.

## Tests

`npm test` runs `src/lib/phase4-gate.test.ts` (Node’s test runner). Playwright was not added; a browser install would be a new toolchain. The node suite covers the ticket, DST, favourites-generation, URL, directions, and JSON-LD rules.
