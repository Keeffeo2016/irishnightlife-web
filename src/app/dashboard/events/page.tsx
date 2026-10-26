import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOwnerViewCounts, getVenueDashboard } from '@/lib/venue-dashboard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHero } from '@/components/layout/PageHero'
import { AwaitingApprovalNotice } from '@/components/AwaitingApprovalNotice'

export const instant = false

function formatWhen(value: string) {
  return new Date(value).toLocaleString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function VenueEventsPage() {
  const { venues } = await getVenueDashboard('/dashboard/events')
  const supabase = await createClient()
  const venueList = venues
  const approvedVenues = venueList.filter((venue) => venue.is_verified)
  const venueIds = venueList.map((venue) => venue.id)
  const venueNames = new Map(venueList.map((venue) => [venue.id, venue.name]))

  const { data } = venueIds.length
    ? await supabase
        .from('events')
        .select('id, title, slug, start_time, is_published, venue_id')
        .in('venue_id', venueIds)
        .order('start_time', { ascending: true })
    : { data: [] }

  const events = data ?? []
  const now = Date.now()
  const upcoming = events.filter((event) => new Date(event.start_time).getTime() >= now)
  const earlier = events.filter((event) => new Date(event.start_time).getTime() < now).reverse()
  const viewCounts = await getOwnerViewCounts(
    supabase,
    events.map((event) => `/events/${event.slug}`),
  )

  return (
    <div className="flex flex-col bg-background">
      <PageHero align="left" compact showMap={false} title="Events" subtitle="Events for your venues" />
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Upcoming</CardTitle>
              {approvedVenues.length > 0 ? (
                <Link href="/dashboard/events/new" className={buttonVariants({ variant: 'brand' })}>
                  Create event
                </Link>
              ) : venueList.length > 0 ? (
                <AwaitingApprovalNotice className="max-w-xs text-right text-sm text-amber-200" />
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {venueList.length === 0 ? (
              <p className="text-muted-foreground">
                No venue is linked to this account yet.{' '}
                <Link href="/auth/complete-venue" className="text-primary hover:underline">
                  Add your venue
                </Link>
              </p>
            ) : upcoming.length === 0 ? (
              <p className="text-muted-foreground">No upcoming events for your venues.</p>
            ) : (
              <EventList events={upcoming} venueNames={venueNames} viewCounts={viewCounts} />
            )}
          </CardContent>
        </Card>

        {earlier.length > 0 ? (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Earlier</CardTitle>
            </CardHeader>
            <CardContent>
              <EventList events={earlier} venueNames={venueNames} viewCounts={viewCounts} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

function EventList({
  events,
  venueNames,
  viewCounts,
}: {
  events: {
    id: string
    title: string
    slug: string
    start_time: string
    is_published: boolean
    venue_id: string
  }[]
  venueNames: Map<string, string>
  viewCounts: Map<string, number>
}) {
  return (
    <ul className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">{event.title}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatWhen(event.start_time)}
            </p>
            <p className="text-sm text-muted-foreground">
              {venueNames.get(event.venue_id) ?? 'Your venue'}
              {' · '}
              {(viewCounts.get(`/events/${event.slug}`) ?? 0).toLocaleString('en-IE')} views
            </p>
          </div>
          <Link href={`/events/${event.slug}`} className="text-sm text-primary hover:underline">
            {event.is_published ? 'Published' : 'Draft'}
          </Link>
        </li>
      ))}
    </ul>
  )
}
