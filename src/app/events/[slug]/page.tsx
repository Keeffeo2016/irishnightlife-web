import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, Clock, Euro, Music, Share2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

interface EventPageProps {
  params: Promise<{ slug: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
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
    .eq('is_published', true)
    .single()

  if (error || !event) {
    notFound()
  }

  const formatPrice = () => {
    if (event.is_free) return 'Free Entry'
    if (event.price_min === event.price_max) return `€${event.price_min}`
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-emerald-600">IrishNightlife</Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/events" className="text-emerald-600 font-medium">Events</Link>
              <Link href="/venues" className="text-gray-700 hover:text-emerald-600 font-medium">Venues</Link>
              <Link href="/for-venues" className="text-gray-700 hover:text-emerald-600 font-medium">For Venues</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Event Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Event Header */}
            <div className="bg-white rounded-2xl p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <Badge className="bg-emerald-100 text-emerald-700 mb-4">
                    {event.music_genre}
                  </Badge>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{event.title}</h1>
                  <p className="text-gray-600 text-lg">at {event.venues.name}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Venue Information</h2>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.venues.name}</h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{event.venues.address}, {event.venues.city}, {event.venues.county}</span>
                    </div>
                    <p className="text-gray-600 mb-4">{event.venues.description}</p>
                    <Link href={`/venues/${event.venues.slug}`}>
                      <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
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
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg">
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
