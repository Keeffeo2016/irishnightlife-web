import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { viewerManagesVenue } from '@/lib/venue-access'
import { BackToPlanner } from '@/components/BackToPlanner'
import { plannerPlanHref, preservePlannerOrigin } from '@/lib/planner'

export const instant = false
import { MapPin, Clock, Phone, Globe, Star, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FavoriteButton } from '@/components/FavoriteButton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'

interface VenuePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function VenuePage({ params, searchParams }: VenuePageProps) {
  const { slug } = await params
  const query = await searchParams
  const planHref = plannerPlanHref(query)
  const supabase = await createClient()

  const { data: venue, error } = await supabase
    .from('venues')
    .select(`
      *,
      events (
        id,
        title,
        slug,
        start_time,
        end_time,
        price_min,
        price_max,
        is_free,
        music_genre,
        event_type
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !venue) {
    notFound()
  }

  if (!venue.is_verified && !(await viewerManagesVenue(supabase, venue.owner_id))) {
    notFound()
  }

  // Filter only upcoming events
  const upcomingEvents = venue.events
    .filter((event: any) => new Date(event.start_time) > new Date())
    .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 6)

  const formatPrice = (event: any) => {
    if (event.is_free) return 'Free'
    if (event.price_max == null || event.price_min === event.price_max) return `€${event.price_min}`
    return `€${event.price_min} - €${event.price_max}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
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
          venue.is_verified && (
            <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md">
              Verified Venue
            </Badge>
          )
        }
        title={venue.name}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-5 w-5 text-mint" />
            {venue.address}, {venue.city}, {venue.county}{venue.postcode ? `, ${venue.postcode}` : ''}
          </span>
        }
        actions={<FavoriteButton venueId={venue.id} />}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl ring-1 ring-foreground/10 p-8 mb-6">
              {venue.images?.length ? (
                <div className="mb-6 grid grid-cols-2 gap-3">
                  {venue.images.map((src: string) => (
                    <img
                      key={src}
                      src={src}
                      alt={`${venue.name} photo`}
                      className="h-44 w-full rounded-xl object-cover"
                    />
                  ))}
                </div>
              ) : null}
              <p className="text-gray-700 text-lg mb-6">
                {venue.description || 'This venue has not added a description yet.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Music className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-semibold text-gray-900">{venue.venue_type?.replaceAll('_', ' ') ?? 'Venue'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Star className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price Range</p>
                    <p className="font-semibold text-gray-900">{venue.price_range}</p>
                  </div>
                </div>
              </div>

              {/* Music Genres */}
              {venue.music_genres && venue.music_genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Music Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {venue.music_genres.map((genre: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="border-emerald-600 text-emerald-700">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Atmosphere */}
              {venue.atmosphere && venue.atmosphere.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Atmosphere</h3>
                  <div className="flex flex-wrap gap-2">
                    {venue.atmosphere.map((atm: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="border-gray-300 text-gray-700">
                        {atm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {venue.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${venue.phone}`} className="hover:text-emerald-600">{venue.phone}</a>
                    </div>
                  )}
                  {venue.website && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Globe className="h-4 w-4" />
                      <a href={venue.website} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">
                        {venue.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event: any) => (
                      <Link key={event.id} href={preservePlannerOrigin(`/events/${event.slug}`, query)}>
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-500 transition-colors">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDate(event.start_time)} at {formatTime(event.start_time)}
                              </span>
                              <Badge className="bg-emerald-100 text-emerald-700">
                                {event.music_genre}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{formatPrice(event)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No upcoming events at this venue.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white border-gray-200 sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {venue.website && (
                    <a href={venue.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="brand" className="w-full">
                        Visit Website
                      </Button>
                    </a>
                  )}
                  {venue.phone && (
                    <a href={`tel:${venue.phone}`}>
                      <Button variant="brand-outline" className="w-full">
                        Call Venue
                      </Button>
                    </a>
                  )}
                  <Button variant="outline" className="w-full">
                    Get Directions
                  </Button>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Share this venue</h4>
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
