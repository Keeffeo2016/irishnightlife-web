'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, ChevronDown, Filter, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { EVENT_TYPES } from '@/lib/venue-profile'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import EventsMap from '@/components/EventsMap'
import { EventCard, EVENT_EMOJI } from '@/components/EventCard'

const supabase = createClient()

const GENRES = ['All', 'Live Music', 'DJ', 'Comedy', 'Sports', 'Quiz', 'Traditional Irish', 'Electronic', 'Rock', 'Jazz']
const LATER_SECTION_CAP = 3

function isSameLocalDay(startTime: string) {
  return new Date(startTime).toDateString() === new Date().toDateString()
}

function eventsPageHref(county: string, type: string) {
  const params = new URLSearchParams({ type })
  if (county !== 'All Ireland') params.set('county', county)
  return `/events?${params.toString()}`
}

function EventGrid({ events }: { events: Event[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

type LaterSection = {
  key: string
  label: string
  emoji: string
  events: Event[]
  seeAllHref: string | null
}

function laterSections(events: Event[], county: string) {
  const known = new Set<string>(EVENT_TYPES.map((type) => type.value))
  const sections: LaterSection[] = EVENT_TYPES.flatMap((type) => {
    const matches = events.filter((event) => event.event_type === type.value)
    if (matches.length === 0) return []
    return [{
      key: type.value,
      label: type.label,
      emoji: EVENT_EMOJI[type.value] ?? '🎉',
      events: matches.slice(0, LATER_SECTION_CAP),
      seeAllHref: matches.length > LATER_SECTION_CAP ? eventsPageHref(county, type.value) : null,
    }]
  })

  const other = events.filter((event) => !known.has(event.event_type))
  if (other.length > 0) {
    sections.push({
      key: 'other',
      label: 'Other',
      emoji: '🎉',
      events: other.slice(0, LATER_SECTION_CAP),
      seeAllHref: null,
    })
  }

  return sections
}

function EventSections({ events, county }: { events: Event[]; county: string }) {
  const tonight = events.filter((event) => isSameLocalDay(event.start_time))
  const sections = laterSections(
    events.filter((event) => !isSameLocalDay(event.start_time)),
    county,
  )

  return (
    <div className="space-y-12">
      {tonight.length > 0 && (
        <section aria-labelledby="tonight-heading">
          <h3 id="tonight-heading" className="mb-4 text-xl font-bold text-gray-900">
            Tonight
          </h3>
          <EventGrid events={tonight} />
        </section>
      )}
      {sections.map((section) => (
        <section key={section.key} aria-labelledby={`section-${section.key}`}>
          <div className="mb-4 flex items-end justify-between gap-4">
            <h3 id={`section-${section.key}`} className="text-xl font-bold text-gray-900">
              <span aria-hidden="true">{section.emoji} </span>
              {section.label}
            </h3>
            {section.seeAllHref && (
              <Link href={section.seeAllHref} className="text-sm font-semibold text-emerald-700 hover:underline">
                See all
              </Link>
            )}
          </div>
          <EventGrid events={section.events} />
        </section>
      ))}
    </div>
  )
}

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
          venues!inner (
            name,
            slug,
            county,
            city
          )
        `)
        .eq('is_published', true)
        .eq('venues.is_verified', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(50)

      if (selectedCounty !== 'All Ireland') {
        query = query.eq('venues.county', selectedCounty)
      }

      // Apply genre filter
      if (selectedGenre !== 'All') {
        query = query.eq('music_genre', selectedGenre)
      }

      // Apply search filter
      const safeSearch = searchQuery.replace(/[,()]/g, ' ').trim()
      if (safeSearch) {
        query = query.or(`title.ilike.%${safeSearch}%,venues.name.ilike.%${safeSearch}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching events:', error)
        setEvents([])
        setTonightCount(0)
      } else {
        const rows = (data || []).filter((event) => event.venues?.name)
        setEvents(rows)
        setTonightCount(rows.length)
      }

      setLoading(false)
    }

    fetchEvents()
  }, [selectedCounty, selectedGenre, searchQuery])

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-night via-night-soft to-forest border-b border-white/10 overflow-hidden">
        {/* Ireland Map Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none">
          <div
            aria-hidden
            className="w-full h-full max-w-4xl bg-mint"
            style={{
              maskImage: 'url(/ireland-map.svg)',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              maskSize: 'contain',
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <span className="text-6xl">🇮🇪</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              What&apos;s Happening{' '}
              <span className="bg-gradient-to-r from-mint-light to-mint bg-clip-text text-transparent">Tonight</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-2 font-medium">
              {tonightCount} events {selectedCounty !== 'All Ireland' ? `in ${selectedCounty}` : 'across Ireland'}
            </p>
            <p className="text-sm text-gray-400 mb-8">
              {userLocation ? `📍 Detected location: ${userLocation}` : '📍 Enable location for personalized recommendations'}
            </p>
            <Link href="/planner">
              <Button variant="brand" className="px-10 py-7 text-lg">
                <Sparkles className="mr-2 h-6 w-6" />
                Plan My Night
              </Button>
            </Link>
            <p className="text-sm text-gray-300 mt-4 font-medium">
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
                className="pl-12 pr-4 py-6 text-lg bg-white text-gray-900 border-gray-300 rounded-xl"
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
            selectedGenre === 'All' && searchQuery.trim() === '' ? (
              <EventSections events={events} county={selectedCounty} />
            ) : (
              <EventGrid events={events} />
            )
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-600 mb-6">
                {selectedCounty === 'All Ireland'
                  ? 'Nothing is listed from tonight onward. Check back after the next week of listings is added.'
                  : `Nothing is listed in ${selectedCounty} from tonight onward. Try Cork, or check back after the next week of listings.`}
              </p>
              <Button
                onClick={() => {
                  setSelectedCounty('Cork')
                  setSelectedGenre('All')
                  setSearchQuery('')
                }}
                variant="brand-outline"
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
              {['Kerry', 'Dublin', 'Galway', 'Limerick', 'Waterford', 'Kilkenny'].map((city) => (
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
    </div>
  )
}
