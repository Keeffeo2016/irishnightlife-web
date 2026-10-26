'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { EventCard, type EventCardEvent } from '@/components/EventCard'
import { PageHero, HeroAccent } from '@/components/layout/PageHero'

const supabase = createClient()

const GENRES = ['All', 'Live Music', 'DJ', 'Comedy', 'Sports', 'Quiz', 'Traditional Irish', 'Electronic', 'Rock', 'Jazz']
const CITIES = ['All', 'Cork', 'Dublin', 'Galway', 'Limerick', 'Waterford', 'Kilkenny']

function FilterChips({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string
  options: string[]
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-sm font-medium text-gray-400 mr-1">{label}:</span>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          aria-pressed={selected === option}
          className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
            selected === option
              ? 'border-mint bg-mint text-night'
              : 'border-white/15 bg-white/5 text-gray-200 hover:border-mint hover:text-mint'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export default function EventsPage() {
  const [selectedCity, setSelectedCity] = useState('All')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState<EventCardEvent[]>([])
  const [loading, setLoading] = useState(true)

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
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(50)

      if (selectedCity !== 'All') {
        query = query.eq('venues.county', selectedCity)
      }

      if (selectedGenre !== 'All') {
        query = query.eq('music_genre', selectedGenre)
      }

      const safeSearch = searchQuery.replace(/[,()]/g, ' ').trim()
      if (safeSearch) {
        query = query.or(`title.ilike.%${safeSearch}%,venues.name.ilike.%${safeSearch}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } else {
        setEvents((data || []).filter((event) => event.venues?.name))
      }

      setLoading(false)
    }

    fetchEvents()
  }, [selectedCity, selectedGenre, searchQuery])

  return (
    <div className="flex flex-col bg-gray-50">
      <PageHero
        title={<>Events <HeroAccent>Tonight</HeroAccent> &amp; Beyond</>}
        subtitle="What's happening across Ireland's nightlife scene"
      >
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search events or venues..."
            className="pl-12 pr-4 py-6 text-lg bg-white text-gray-900 border-gray-300 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="space-y-3">
          <FilterChips label="City" options={CITIES} selected={selectedCity} onSelect={setSelectedCity} />
          <FilterChips label="Genre" options={GENRES} selected={selectedGenre} onSelect={setSelectedGenre} />
        </div>
      </PageHero>

      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading...' : `${events.length} ${events.length === 1 ? 'Event' : 'Events'}`}
              {!loading && selectedCity !== 'All' && ` in ${selectedCity}`}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading events...</h3>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No upcoming events</h3>
              <p className="text-gray-600 mb-6">
                No upcoming events match those filters. Listings only include nights that have not started yet.
              </p>
              <Button
                variant="brand-outline"
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
      </section>
    </div>
  )
}
