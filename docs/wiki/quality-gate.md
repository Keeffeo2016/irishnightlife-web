# Quality gate

After each phase (plan Phase 10 checklist), run from `web/`:

1. `npm run lint`
2. `npx tsc --noEmit`
3. `npm run build`

Manual: desktop and 390px for touched routes. Report pre-existing lint errors separately from new ones. Do not disable lint rules.

Phase 2 also requires verifying category links, keyword search + county filtering, empty states, and no regressions on `/events` and `/venues`.

Related: [ui-redesign-goal.md](./ui-redesign-goal.md).
