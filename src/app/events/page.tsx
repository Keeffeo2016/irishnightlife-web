'use client'

import { Suspense, useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { EventCard, type EventCardEvent } from '@/components/EventCard'
import { PageHero, HeroAccent } from '@/components/layout/PageHero'
import { EVENT_TYPES } from '@/lib/venue-profile'

const supabase = createClient()

const GENRES = ['All', 'Live Music', 'DJ', 'Comedy', 'Sports', 'Quiz', 'Traditional Irish', 'Electronic', 'Rock', 'Jazz']
const CITIES = ['All', 'Cork', 'Kerry', 'Dublin', 'Galway', 'Limerick', 'Waterford', 'Kilkenny']
const TYPE_VALUES = ['All', ...EVENT_TYPES.map((type) => type.value)]

function typeChipLabel(value: string) {
  return EVENT_TYPES.find((type) => type.value === value)?.label ?? value
}

function initialCity(county: string | null) {
  if (!county || county === 'All' || county === 'All Ireland') return 'All'
  return county
}

function initialType(type: string | null) {
  if (type && EVENT_TYPES.some((item) => item.value === type)) return type
  return 'All'
}

function cityOptions(selectedCity: string) {
  if (selectedCity !== 'All' && !CITIES.includes(selectedCity)) {
    return ['All', selectedCity, ...CITIES.filter((city) => city !== 'All')]
  }
  return CITIES
}

function chipFadeStyle(fade: { left: boolean; right: boolean }) {
  if (!fade.left && !fade.right) return undefined

  const maskImage =
    fade.left && fade.right
      ? 'linear-gradient(to right, transparent, black 2.5rem, black calc(100% - 2.5rem), transparent)'
      : fade.right
        ? 'linear-gradient(to right, black calc(100% - 2.5rem), transparent)'
        : 'linear-gradient(to right, transparent, black 2.5rem)'

  return { maskImage, WebkitMaskImage: maskImage }
}

function FilterChips({
  label,
  options,
  selected,
  onSelect,
  optionLabel = (value) => value,
}: {
  label: string
  options: readonly string[]
  selected: string
  onSelect: (value: string) => void
  optionLabel?: (value: string) => string
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [fade, setFade] = useState({ left: false, right: false })

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    const updateFade = () => {
      const remaining = scroller.scrollWidth - scroller.clientWidth - scroller.scrollLeft
      setFade({
        left: scroller.scrollLeft > 1,
        right: remaining > 1,
      })
    }

    updateFade()
    const observer = new ResizeObserver(updateFade)
    observer.observe(scroller)
    scroller.addEventListener('scroll', updateFade, { passive: true })
    return () => {
      observer.disconnect()
      scroller.removeEventListener('scroll', updateFade)
    }
  }, [options])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const selectedButton = scroller.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
    if (!selectedButton) return

    const scrollerRect = scroller.getBoundingClientRect()
    const buttonRect = selectedButton.getBoundingClientRect()
    const padding = 8
    if (buttonRect.left < scrollerRect.left + padding) {
      scroller.scrollBy({ left: buttonRect.left - scrollerRect.left - padding, behavior: 'smooth' })
    } else if (buttonRect.right > scrollerRect.right - padding) {
      scroller.scrollBy({ left: buttonRect.right - scrollerRect.right + padding, behavior: 'smooth' })
    }
  }, [selected])

  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-sm font-medium text-gray-400">{label}:</span>
      <div className="relative min-w-0 flex-1">
        <div
          ref={scrollerRef}
          className="flex snap-x items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={chipFadeStyle(fade)}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              aria-pressed={selected === option}
              className={`shrink-0 snap-start rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                selected === option
                  ? 'border-mint bg-mint text-night'
                  : 'border-white/15 bg-white/5 text-gray-200 hover:border-mint hover:text-mint'
              }`}
            >
              {optionLabel(option)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <Suspense>
      <EventsBrowser />
    </Suspense>
  )
}

function EventsBrowser() {
  const searchParams = useSearchParams()
  const [selectedCity, setSelectedCity] = useState(() => initialCity(searchParams.get('county')))
  const [selectedType, setSelectedType] = useState(() => initialType(searchParams.get('type')))
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState<EventCardEvent[]>([])
  const [loading, setLoading] = useState(true)
  const cities = useMemo(() => cityOptions(selectedCity), [selectedCity])

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

      if (selectedCity !== 'All') {
        query = query.eq('venues.county', selectedCity)
      }

      if (selectedType !== 'All') {
        query = query.eq('event_type', selectedType)
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
  }, [selectedCity, selectedType, selectedGenre, searchQuery])

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
          <FilterChips label="City" options={cities} selected={selectedCity} onSelect={setSelectedCity} />
          <FilterChips
            label="Type"
            options={TYPE_VALUES}
            selected={selectedType}
            onSelect={setSelectedType}
            optionLabel={typeChipLabel}
          />
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
                  setSelectedType('All')
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
