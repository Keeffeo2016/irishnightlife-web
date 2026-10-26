-- Venue profile photos, and an explicit write check so owners can create events
-- only for venues they own that a superadmin has approved. Run in the Supabase
-- SQL editor if this migration has not already been applied.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'venue-images',
  'venue-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view venue images" on storage.objects;
create policy "Public can view venue images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'venue-images');

drop policy if exists "Venue owners can upload venue images" on storage.objects;
create policy "Venue owners can upload venue images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'venue-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Venue owners can update venue images" on storage.objects;
create policy "Venue owners can update venue images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'venue-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'venue-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Venue owners can delete venue images" on storage.objects;
create policy "Venue owners can delete venue images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'venue-images'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

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
