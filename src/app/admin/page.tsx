import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHero } from '@/components/layout/PageHero'
import { AdminBoard, type BoardEvent, type BoardUser, type BoardVenue, type BoardView } from './AdminBoard'

export const instant = false

type VenueOwner = {
  full_name: string | null
  email: string | null
}

type VenueRow = {
  id: string
  name: string
  slug: string
  address: string
  postcode: string | null
  city: string
  county: string
  is_verified: boolean
  created_at: string
  owner: VenueOwner | VenueOwner[] | null
}

type EventRow = {
  id: string
  title: string
  slug: string
  start_time: string
  is_published: boolean
  venue_id: string
  venues: { name: string; is_verified: boolean } | { name: string; is_verified: boolean }[] | null
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/admin')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const [usersResult, venuesResult, eventsResult, viewsResult] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('venues')
      .select('id, name, slug, address, postcode, city, county, is_verified, created_at, owner:users!venues_owner_id_fkey(full_name, email)')
      .order('name'),
    supabase
      .from('events')
      .select('id, title, slug, start_time, is_published, venue_id, venues(name, is_verified)')
      .order('start_time', { ascending: false }),
    supabase
      .from('page_views')
      .select('path, created_at')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(5000),
  ])

  const users = (usersResult.data ?? []) as BoardUser[]
  const venueRows = (venuesResult.data ?? []) as VenueRow[]
  const eventRows = (eventsResult.data ?? []) as EventRow[]
  const views = (viewsResult.data ?? []) as BoardView[]
  const loadError = usersResult.error?.message || venuesResult.error?.message || eventsResult.error?.message || viewsResult.error?.message

  const eventCountByVenue = new Map<string, number>()
  for (const event of eventRows) {
    eventCountByVenue.set(event.venue_id, (eventCountByVenue.get(event.venue_id) ?? 0) + 1)
  }

  const venues: BoardVenue[] = venueRows.map((venue) => {
    const owner = one(venue.owner)
    return {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      address: venue.address,
      postcode: venue.postcode,
      city: venue.city,
      county: venue.county,
      is_verified: venue.is_verified,
      created_at: venue.created_at,
      eventCount: eventCountByVenue.get(venue.id) ?? 0,
      ownerName: owner?.full_name ?? null,
      ownerEmail: owner?.email ?? null,
    }
  })

  const events: BoardEvent[] = eventRows.map((event) => {
    const venue = one(event.venues)
    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      start_time: event.start_time,
      is_published: event.is_published,
      venueName: venue?.name ?? null,
      venueVerified: venue?.is_verified ?? false,
    }
  })

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        align="left"
        compact
        showMap={false}
        title="Admin"
        subtitle="Traffic, venues, and events. Approve new venue setups before they appear on the site."
      />
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {loadError ? (
          <div className="mb-8 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {loadError}. If the charts look empty, run supabase/admin-overview.sql and supabase/page-views.sql in the Supabase SQL editor.
          </div>
        ) : null}
        <AdminBoard users={users} venues={venues} events={events} views={views} />
      </div>
    </div>
  )
}
