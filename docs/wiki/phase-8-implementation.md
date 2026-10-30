# Phase 8 implementation — Venue Owner Dashboard Redesign

Dated **2026-10-26**. Branch `feature/ui-redesign` (uncommitted on top of checkpoint `14b05f1`). Scope: [phase-8-scope.md](./phase-8-scope.md).

Quality-gate results and screenshots are recorded in the Phase 8 completion report in chat. This page captures the implementation contract.

## What shipped

1. **Dashboard shell** (`src/components/dashboard/DashboardShell.tsx`): shared header, public-site link, sign out, and dashboard-only nav (Overview, Events, Add Event, Venue Profile). Consumer `MobileNav` stays hidden on `/dashboard*`.
2. **Overview / events / create / profile** restyle using existing queries, ownership checks, and form payloads. No Edit/Delete/Duplicate/Publish list actions were added because they did not exist.
3. **Honest metrics**: total / upcoming / published / draft from the owner’s events query, plus existing `owner_page_view_counts`. No ticket sales, revenue, or impression fabrication.
4. **Validation helpers** (`src/lib/dashboard-validation.ts`): nav matching, event metrics, create-event and venue-profile validation, including `safeExternalUrl` for optional ticket links.
5. **Generic save/load errors**: Supabase error strings are not shown to the client.

## Quality gate (2026-10-26)

- `npm test`: 17 passed, 0 failed.
- `npx tsc --noEmit`: clean.
- `npm run build`: succeeded (Next.js 16.4.3).
- `npm run lint`: 10 errors / 15 warnings, all in pre-existing untouched files plus `no-img-element` warnings (Phase 9). No new errors on dashboard files.

## Not implemented (and not added)

- Event edit, delete, duplicate, or in-place publish/unpublish.
- Editing venue name, address, contact, website, social, music genres, or atmosphere (not in the previous owner form).
- Payments or subscription management.
- Schema, RLS, or middleware changes.

## Manual verification still needed

Authenticated venue-owner session for `/dashboard`, `/dashboard/events`, `/dashboard/events/new`, and `/dashboard/profile` (anonymous requests correctly redirect to `/auth/login?next=…`). No published events currently have `ticket_url`, so the live ticket sticky bar needs an event that already has a real ticket link.
