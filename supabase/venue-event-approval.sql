-- Block event creation until a superadmin approves the venue.
-- Owners can still read, edit, and delete events they already have.
-- Run in the Supabase SQL editor. Safe to run more than once.

drop policy if exists "Venue owners can manage own events" on public.events;
drop policy if exists "Venue owners can read own events" on public.events;
drop policy if exists "Venue owners can update own events" on public.events;
drop policy if exists "Venue owners can delete own events" on public.events;
drop policy if exists "Venue owners can create events for approved venues" on public.events;

create policy "Venue owners can read own events"
on public.events
for select
to authenticated
using (
  exists (
    select 1 from public.venues
    where venues.id = events.venue_id
      and venues.owner_id = (select auth.uid())
  )
);

create policy "Venue owners can update own events"
on public.events
for update
to authenticated
using (
  exists (
    select 1 from public.venues
    where venues.id = events.venue_id
      and venues.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.venues
    where venues.id = events.venue_id
      and venues.owner_id = (select auth.uid())
  )
);

create policy "Venue owners can delete own events"
on public.events
for delete
to authenticated
using (
  exists (
    select 1 from public.venues
    where venues.id = events.venue_id
      and venues.owner_id = (select auth.uid())
  )
);

create policy "Venue owners can create events for approved venues"
on public.events
for insert
to authenticated
with check (
  exists (
    select 1 from public.venues
    where venues.id = events.venue_id
      and venues.owner_id = (select auth.uid())
      and venues.is_verified = true
  )
);
