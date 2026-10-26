import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const instant = false
import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHero } from '@/components/layout/PageHero'
import { HenStagSelect } from './HenStagSelect'

export default async function VenueDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/dashboard')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'venue_owner' && profile?.role !== 'admin') {
    redirect('/for-venues')
  }

  const { data: venues } = await supabase
    .from('venues')
    .select('id, name, slug, city, county, address, accepts_hen_stag')
    .eq('owner_id', user.id)
    .order('name')

  const venueList = venues ?? []
  const venueIds = venueList.map((venue) => venue.id)

  const { data: events } = venueIds.length
    ? await supabase
        .from('events')
        .select('id, title, slug, start_time, is_published, venue_id')
        .in('venue_id', venueIds)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
    : { data: [] }

  const upcoming = events ?? []
  const heading = venueList[0]?.name ?? profile?.full_name ?? 'Your venue'

  return (
    <div className="flex flex-col bg-gray-50">
      <PageHero align="left" compact showMap={false} title="Venue dashboard" subtitle={heading} />
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Venues</CardTitle>
            </CardHeader>
            <CardContent>
              {venueList.length === 0 ? (
                <p className="text-gray-600">
                  No venue is linked to this account yet.{' '}
                  <Link href="/auth/complete-venue" className="text-emerald-700 hover:underline">
                    Add your venue
                  </Link>
                </p>
              ) : (
                <ul className="space-y-3">
                  {venueList.map((venue) => (
                    <li key={venue.id} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">{venue.name}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {venue.address}, {venue.city}, {venue.county}
                        </p>
                        <HenStagSelect venueId={venue.id} value={venue.accepts_hen_stag} />
                      </div>
                      <Link href={`/venues/${venue.slug}`} className="text-sm text-emerald-700 hover:underline">
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle>Upcoming events</CardTitle>
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
    </div>
  )
}
