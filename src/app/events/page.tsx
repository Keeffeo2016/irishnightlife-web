'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Clock, Euro } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const supabase = createClient()

const GENRES = ['All', 'Live Music', 'DJ', 'Comedy', 'Sports', 'Quiz', 'Traditional Irish', 'Electronic', 'Rock', 'Jazz']
const CITIES = ['All', 'Cork', 'Dublin', 'Galway', 'Limerick', 'Waterford', 'Kilkenny']

interface Event {
  id: string
  title: string
  slug: string
  description: string
  event_type: string
  start_time: string
  end_time: string
  price_min: number
  price_max: number
  is_free: boolean
  music_genre: string
  venues: {
    name: string
    slug: string
    county: string
    city: string
  }
}

export default function EventsPage() {
  const [selectedCity, setSelectedCity] = useState('All')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      
      let query = supabase
        .from('events')
        .select(`
          *,
          venues (
            name,
            slug,
            county,
            city
          )
        `)
        .eq('is_published', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(50)

      if (selectedCity !== 'All') {
        query = query.eq('venues.county', selectedCity)
      }

      if (selectedGenre !== 'All') {
        query = query.eq('music_genre', selectedGenre)
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,venues.name.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching events:', error)
      } else {
        setEvents(data || [])
      }

      setLoading(false)
    }

    fetchEvents()
  }, [selectedCity, selectedGenre, searchQuery])

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

  const formatPrice = (event: Event) => {
    if (event.is_free) return 'Free'
    if (event.price_min === event.price_max) return `€${event.price_min}`
    return `€${event.price_min}-€${event.price_max}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Events Tonight & Beyond</h1>
          <p className="text-gray-600 text-lg">What's happening across Ireland's nightlife scene</p>
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search events..."
              className="pl-10 bg-white border-gray-300 text-gray-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 self-center mr-2 font-medium">City:</span>
            {CITIES.map((city) => (
              <Badge
                key={city}
                variant={selectedCity === city ? 'default' : 'outline'}
                className={`cursor-pointer ${
                  selectedCity === city
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-600'
                }`}
                onClick={() => setSelectedCity(city)}
              >
                {city}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600 self-center mr-2 font-medium">Genre:</span>
            {GENRES.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? 'default' : 'outline'}
                className={`cursor-pointer ${
                  selectedGenre === genre
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border-gray-300 text-gray-700 hover:border-emerald-500 hover:text-emerald-600'
                }`}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading events...</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`}>
                <Card className="bg-white border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">
                        {event.event_type === 'dj' ? '🎧' :
                         event.event_type === 'live_music' ? '🎵' :
                         event.event_type === 'comedy' ? '🎤' :
                         event.event_type === 'sports' ? '🏉' :
                         event.event_type === 'quiz' ? '🧠' : '🎉'}
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white">
                        {event.music_genre}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
                    <p className="text-emerald-600 text-sm font-medium mb-2">{event.venues.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.venues.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(event.start_time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatTime(event.start_time)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                        {formatPrice(event)}
                      </span>
                      <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg mb-4">No events found matching your filters.</p>
            <Button 
              variant="outline" 
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              onClick={() => {
                setSelectedCity('All')
                setSelectedGenre('All')
                setSearchQuery('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
