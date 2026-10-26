import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { viewerManagesVenue } from '@/lib/venue-access'
import { BackToPlanner } from '@/components/BackToPlanner'
import { plannerPlanHref, preservePlannerOrigin } from '@/lib/planner'

export const instant = false
import { MapPin, Calendar, Clock, Euro, Music, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from '@/components/FavoriteButton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'

interface EventPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { slug } = await params
  const query = await searchParams
  const planHref = plannerPlanHref(query)
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      venues (
        *,
        owner:users(*)
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !event?.venues) {
    notFound()
  }

  if ((!event.venues.is_verified || !event.is_published) && !(await viewerManagesVenue(supabase, event.venues.owner_id))) {
    notFound()
  }

  const formatPrice = () => {
    if (event.is_free) return 'Free Entry'
    if (event.price_max == null || event.price_min === event.price_max) return `€${event.price_min}`
    return `€${event.price_min} - €${event.price_max}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col bg-gray-50">
      <BackToPlanner href={planHref} />
      <PageHero
        align="left"
        showMap={false}
        eyebrow={
          <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md">
            {event.music_genre}
          </Badge>
        }
        title={event.title}
        subtitle={
          <>
            at{' '}
            <Link href={preservePlannerOrigin(`/venues/${event.venues.slug}`, query)} className="text-mint hover:text-mint-light">
              {event.venues.name}
            </Link>
          </>
        }
        actions={
          <>
            <FavoriteButton eventId={event.id} venueId={event.venues.id} />
            <Button variant="outline" size="icon" aria-label="Share">
              <Share2 className="h-5 w-5" />
            </Button>
          </>
        }
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl ring-1 ring-foreground/10 p-8 mb-6">
              <p className="text-gray-700 text-lg mb-6">{event.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(event.start_time)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-gray-900">{formatTime(event.start_time)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Euro className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price</p>
                    <p className="font-semibold text-gray-900">{formatPrice()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Music className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Genre</p>
                    <p className="font-semibold text-gray-900">{event.music_genre}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue Info */}
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the venue</h2>
                {event.venues.images?.[0] ? (
                  <img
                    src={event.venues.images[0]}
                    alt={`${event.venues.name} photo`}
                    className="mb-4 h-48 w-full rounded-xl object-cover"
                  />
                ) : null}
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.venues.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venues.address}, {event.venues.city}, {event.venues.county}{event.venues.postcode ? `, ${event.venues.postcode}` : ''}</span>
                    </div>
                    <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-700">
                      <span>
                        <span className="text-gray-500">Type </span>
                        {event.venues.venue_type?.replaceAll('_', ' ') || 'Venue'}
                      </span>
                      <span>
                        <span className="text-gray-500">Price range </span>
                        {event.venues.price_range || 'Not set'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {event.venues.description || 'This venue has not added a description yet.'}
                    </p>
                    <Link href={preservePlannerOrigin(`/venues/${event.venues.slug}`, query)}>
                      <Button variant="brand-outline">
                        View Venue
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-gray-200 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Get Tickets</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price</span>
                    <span className="text-2xl font-bold text-gray-900">{formatPrice()}</span>
                  </div>
                  <Button variant="brand" className="w-full py-6 text-lg">
                    Get Tickets
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Secure checkout • Instant confirmation
                  </p>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Share this event</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Twitter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
