'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Clock, ChevronDown, Filter, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import EventsMap from '@/components/EventsMap'

const supabase = createClient()

const GENRES = ['All', 'Live Music', 'DJ', 'Comedy', 'Sports', 'Quiz', 'Traditional Irish', 'Electronic', 'Rock', 'Jazz']

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
  atmosphere: string
  is_published: boolean
  is_featured: boolean
  venues: {
    name: string
    slug: string
    county: string
    city: string
  }
}

export default function HomePage() {
  const [selectedCounty, setSelectedCounty] = useState<string>('Cork') // Default to Cork
  const [selectedGenre, setSelectedGenre] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [isCountyDropdownOpen, setIsCountyDropdownOpen] = useState(false)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<string | null>(null)
  const [tonightCount, setTonightCount] = useState(0)

  // Request geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // For now, default to Cork since we have the most data
          // In production, we'd reverse geocode these coordinates
          setUserLocation('Cork')
          setSelectedCounty('Cork')
        },
        (error) => {
          console.log('Geolocation error:', error)
          // Default to Cork if geolocation fails
          setUserLocation('Cork')
        }
      )
    }
  }, [])

  // Fetch events from Supabase
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

      // Apply county filter
      if (selectedCounty !== 'All Ireland') {
        query = query.eq('venues.county', selectedCounty)
      }

      // Apply genre filter
      if (selectedGenre !== 'All') {
        query = query.eq('music_genre', selectedGenre)
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,venues.name.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching events:', error)
      } else {
        setEvents(data || [])
        setTonightCount(data?.length || 0)
      }

      setLoading(false)
    }

    fetchEvents()
  }, [selectedCounty, selectedGenre, searchQuery])

  const formatPrice = (event: Event) => {
    if (event.is_free) return 'Free'
    if (event.price_min === event.price_max) return `€${event.price_min}`
    return `€${event.price_min} - €${event.price_max}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Tonight'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    return date.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-emerald-600">IrishNightlife</div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/events" className="text-gray-700 hover:text-emerald-600 font-medium">Events</Link>
              <Link href="/venues" className="text-gray-700 hover:text-emerald-600 font-medium">Venues</Link>
              <Link href="/for-venues" className="text-gray-700 hover:text-emerald-600 font-medium">For Venues</Link>
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                Sign In
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border-b border-gray-200 overflow-hidden">
        {/* Ireland Map Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <img 
            src="/ireland-map.svg" 
            alt="" 
            className="w-full h-full max-w-4xl object-contain"
            style={{ filter: 'hue-rotate(0deg) saturate(1.5)' }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <span className="text-6xl">🇮🇪</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              What's Happening <span className="text-emerald-600">Tonight</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-2 font-medium">
              {tonightCount} events {selectedCounty !== 'All Ireland' ? `in ${selectedCounty}` : 'across Ireland'}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              {userLocation ? `📍 Detected location: ${userLocation}` : '📍 Enable location for personalized recommendations'}
            </p>
            <Link href="/planner">
              <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white px-10 py-7 text-lg shadow-lg hover:shadow-xl transition-all">
                <Sparkles className="mr-2 h-6 w-6" />
                Plan My Night
              </Button>
            </Link>
            <p className="text-sm text-gray-600 mt-4 font-medium">
              ✨ AI-powered evening plans tailored to your vibe
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search events, venues, or genres..."
                className="pl-12 pr-4 py-6 text-lg border-gray-300 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* County Dropdown and Genre Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* County Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsCountyDropdownOpen(!isCountyDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-gray-900">{selectedCounty}</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isCountyDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isCountyDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
                    {/* All Ireland Option */}
                    <button
                      onClick={() => {
                        setSelectedCounty('All Ireland')
                        setIsCountyDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors border-b border-gray-100 ${
                        selectedCounty === 'All Ireland' ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-900'
                      }`}
                    >
                      All Ireland
                    </button>

                    {/* Counties by Province */}
                    {PROVINCES.map(province => (
                      <div key={province}>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {province}
                        </div>
                        {IRISH_COUNTIES
                          .filter(county => county.province === province)
                          .map(county => (
                            <button
                              key={county.name}
                              onClick={() => {
                                setSelectedCounty(county.name)
                                setIsCountyDropdownOpen(false)
                              }}
                              className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors ${
                                selectedCounty === county.name ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'text-gray-900'
                              }`}
                            >
                              {county.name}
                            </button>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Genre Filter */}
              <div className="relative">
                <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl">
                  <Filter className="h-5 w-5 text-emerald-600" />
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none font-medium text-gray-900 cursor-pointer"
                  >
                    {GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {loading ? 'Loading...' : `${events.length} ${events.length === 1 ? 'Event' : 'Events'}`}
                {!loading && selectedCounty !== 'All Ireland' && ` in ${selectedCounty}`}
              </h2>
              <p className="text-gray-600 mt-1">
                {!loading && (selectedCounty === 'All Ireland' ? 'Across all counties' : `In ${selectedCounty}`)}
              </p>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading events...</h3>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.slug}`}>
                  <Card className="bg-white border-2 border-gray-200 hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer h-full group">
                    <CardContent className="p-6">
                      {/* Event Header with Gradient Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="text-5xl group-hover:scale-110 transition-transform">
                          {event.event_type === 'dj' ? '🎧' :
                           event.event_type === 'live_music' ? '🎵' :
                           event.event_type === 'comedy' ? '🎤' :
                           event.event_type === 'sports' ? '🏉' :
                           event.event_type === 'quiz' ? '🧠' : '🎉'}
                        </div>
                        <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 shadow-md">
                          {event.music_genre}
                        </Badge>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {event.title}
                      </h3>

                      {/* Event Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Venue */}
                      <div className="flex items-center gap-2 text-gray-700 mb-3">
                        <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-medium">{event.venues.name}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                        <span className="font-medium text-emerald-700">{event.venues.county}</span>
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                          <Calendar className="h-4 w-4 text-emerald-600" />
                          <span className="font-medium text-emerald-700">{formatDate(event.start_time)}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-cyan-50 px-2 py-1 rounded-full">
                          <Clock className="h-4 w-4 text-cyan-600" />
                          <span className="font-medium text-cyan-700">{formatTime(event.start_time)}</span>
                        </div>
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                          {formatPrice(event)}
                        </span>
                        <Button className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-md group-hover:shadow-lg transition-all">
                          View Details →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or check back later
              </p>
              <Button
                onClick={() => {
                  setSelectedCounty('Cork')
                  setSelectedGenre('All')
                  setSearchQuery('')
                }}
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                Reset to Cork
              </Button>
            </div>
          )}

          {/* Explore Other Cities */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🗺️ Explore Other Cities
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {['Dublin', 'Galway', 'Limerick', 'Waterford', 'Kilkenny'].map((city) => (
                <Button
                  key={city}
                  variant="outline"
                  onClick={() => setSelectedCounty(city)}
                  className="border-2 border-emerald-200 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 font-semibold px-6 py-3 transition-all"
                >
                  {city}
                </Button>
              ))}
              <Button
                variant="outline"
                onClick={() => setSelectedCounty('All Ireland')}
                className="border-2 border-cyan-200 text-cyan-700 hover:border-cyan-500 hover:bg-cyan-50 hover:text-cyan-800 font-semibold px-6 py-3 transition-all"
              >
                🇮🇪 All Ireland
              </Button>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="mt-16">
            <EventsMap selectedCounty={selectedCounty} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-emerald-400 mb-3 text-lg">🇮🇪 IrishNightlife</h3>
              <p className="text-gray-300 text-sm">
                Ireland's nightlife intelligence platform. Find the perfect night out.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-400 mb-3">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/events" className="text-gray-300 hover:text-emerald-400 transition-colors">Events</Link></li>
                <li><Link href="/venues" className="text-gray-300 hover:text-emerald-400 transition-colors">Venues</Link></li>
                <li><Link href="/cities" className="text-gray-300 hover:text-emerald-400 transition-colors">Cities</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-400 mb-3">For Venues</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/for-venues" className="text-gray-300 hover:text-emerald-400 transition-colors">List Your Venue</Link></li>
                <li><Link href="/pricing" className="text-gray-300 hover:text-emerald-400 transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="text-gray-300 hover:text-emerald-400 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-emerald-400 mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-gray-300 hover:text-emerald-400 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-emerald-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
            <p>© 2026 IrishNightlife. All rights reserved.</p>
            <p className="mt-2 text-xs">Made with ❤️ in Ireland 🇮🇪</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
