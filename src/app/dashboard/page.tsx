import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOwnerViewCounts, getVenueDashboard } from '@/lib/venue-dashboard'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHero } from '@/components/layout/PageHero'
import { AwaitingApprovalNotice } from '@/components/AwaitingApprovalNotice'

export const instant = false

export default async function VenueDashboard() {
  const { profile, venues } = await getVenueDashboard()
  const supabase = await createClient()
  const venueList = venues
  const pendingVenues = venueList.filter((venue) => !venue.is_verified)
  const approvedVenues = venueList.filter((venue) => venue.is_verified)
  const venueIds = venueList.map((venue) => venue.id)

  const [upcomingResult, eventSlugResult] = venueIds.length
    ? await Promise.all([
        supabase
          .from('events')
          .select('id, title, slug, start_time, is_published, venue_id')
          .in('venue_id', venueIds)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true }),
        supabase
          .from('events')
          .select('slug')
          .in('venue_id', venueIds),
      ])
    : [{ data: [] }, { data: [] }]

  const upcoming = upcomingResult.data ?? []
  const viewPaths = [
    ...venueList.map((venue) => `/venues/${venue.slug}`),
    ...(eventSlugResult.data ?? []).map((event) => `/events/${event.slug}`),
  ]
  const viewCounts = await getOwnerViewCounts(supabase, viewPaths)
  const venueViews = venueList.reduce(
    (total, venue) => total + (viewCounts.get(`/venues/${venue.slug}`) ?? 0),
    0,
  )
  const eventViews = (eventSlugResult.data ?? []).reduce(
    (total, event) => total + (viewCounts.get(`/events/${event.slug}`) ?? 0),
    0,
  )
  const heading = venueList[0]?.name ?? profile?.full_name ?? 'Your venue'

  return (
    <div className="flex flex-col bg-gray-50">
      <PageHero align="left" compact showMap={false} title="Venue dashboard" subtitle={heading} />
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {pendingVenues.length > 0 ? (
          <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {pendingVenues.map((venue) => venue.name).join(', ')}{' '}
            {pendingVenues.length === 1 ? 'is' : 'are'} awaiting approval, so{' '}
            {pendingVenues.length === 1 ? 'it stays' : 'they stay'} off the public site for now.
          </div>
        ) : null}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Your venues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{venueList.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Upcoming events</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{upcoming.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Venue page views</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{venueViews.toLocaleString('en-IE')}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Event page views</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{eventViews.toLocaleString('en-IE')}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Upcoming events</CardTitle>
              {approvedVenues.length > 0 ? (
                <Link href="/dashboard/events/new" className={buttonVariants({ variant: 'brand' })}>
                  Create event
                </Link>
              ) : venueList.length > 0 ? (
                <AwaitingApprovalNotice className="max-w-xs text-right text-sm text-amber-800" />
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-gray-600">No upcoming events for your venues.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((event) => (
                  <li key={event.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.start_time).toLocaleString('en-IE', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(viewCounts.get(`/events/${event.slug}`) ?? 0).toLocaleString('en-IE')} views
                        </p>
                    </div>
                    <Link href={`/events/${event.slug}`} className="text-sm text-emerald-700 hover:underline">
                      {event.is_published ? 'Published' : 'Draft'}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
