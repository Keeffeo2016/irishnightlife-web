'use client'

import { Suspense, useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar,
  Info,
  LayoutGrid,
  Map as MapIcon,
  Search,
  X,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { EventCard, type EventCardEvent } from '@/components/EventCard'
import EventsMap from '@/components/EventsMap'
import { HeroAccent, PageHero } from '@/components/layout/PageHero'
import { Input } from '@/components/ui/input'
import {
  buildEventsHref,
  buildMusicGenreOptions,
  categoryOptionLabel,
  clearSingleFilter,
  EVENT_CATEGORY_OPTIONS,
  formatDateFilterLabel,
  getDublinDateOptions,
  parseEventsSearchParams,
  resolveDublinDateRangeUtc,
  type EventsFilterKey,
  type EventsFiltersState,
  type EventsViewMode,
} from '@/components/events/events-discovery-utils'
import {
  EventsFilterSidebar,
  EventsMobileFilterSheet,
} from '@/components/events/EventsFilterSidebar'
import {
  EventsEmptyState,
  EventsSkeletonGrid,
} from '@/components/events/EventsEmptyState'

const QUERY_CAP = 50

interface RawEventRow {
  id: string
  title: string
  slug: string
  description: string | null
  event_type: string | null
  start_time: string
  end_time: string | null
  price_min: number | null
  price_max: number | null
  is_free: boolean
  music_genre: string | null
  image_url: string | null
  venues:
    | {
        id: string
        name: string
        slug: string
        county: string
        city: string | null
        address: string | null
        latitude: number | null
        longitude: number | null
        images: string[] | null
      }
    | Array<{
        id: string
        name: string
        slug: string
        county: string
        city: string | null
        address: string | null
        latitude: number | null
        longitude: number | null
        images: string[] | null
      }>
    | null
}

function ViewModeToggle({
  view,
  onChange,
}: {
  view: EventsViewMode
  onChange: (next: EventsViewMode) => void
}) {
  return (
    <div
      role="group"
      aria-label="Results view mode"
      className="inline-flex items-center rounded-xl border border-border bg-card p-1"
    >
      <button
        type="button"
        onClick={() => onChange('grid')}
        aria-pressed={view === 'grid'}
        className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
          view === 'grid'
            ? 'bg-mint text-night shadow-xs'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Grid</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('map')}
        aria-pressed={view === 'map'}
        className={`inline-flex min-h-8 items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
          view === 'map'
            ? 'bg-mint text-night shadow-xs'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Map</span>
      </button>
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchInputId = useId()

  const filters = useMemo(
    () => parseEventsSearchParams(searchParams),
    [searchParams]
  )

  const dateOptions = useMemo(() => getDublinDateOptions(), [])

  const [draftQuery, setDraftQuery] = useState<{ baseUrlQ: string; value: string }>(() => ({
    baseUrlQ: filters.q,
    value: filters.q,
  }))
  const searchInput = draftQuery.baseUrlQ === filters.q ? draftQuery.value : filters.q

  const [events, setEvents] = useState<EventCardEvent[]>([])
  const [loading, setLoading] = useState(true)

  const updateFilters = useCallback(
    (patch: Partial<EventsFiltersState>) => {
      const next: EventsFiltersState = {
        ...filters,
        ...patch,
      }
      if (patch.q !== undefined) {
        setDraftQuery({ baseUrlQ: patch.q, value: patch.q })
      }
      router.replace(buildEventsHref(next), { scroll: false })
    },
    [filters, router]
  )

  const handleResetAll = useCallback(() => {
    setDraftQuery({ baseUrlQ: '', value: '' })
    router.replace(
      buildEventsHref({
        county: 'All',
        type: 'All',
        genre: 'All',
        date: 'all',
        q: '',
        free: false,
        view: filters.view,
      }),
      { scroll: false }
    )
  }, [filters.view, router])

  const handleClearSingle = useCallback(
    (key: EventsFilterKey) => {
      if (key === 'q') {
        setDraftQuery({ baseUrlQ: '', value: '' })
      }
      const next = clearSingleFilter(filters, key)
      router.replace(buildEventsHref(next), { scroll: false })
    },
    [filters, router]
  )

  // Debounced URL sync as user types in search box
  useEffect(() => {
    const trimmed = searchInput.trim()
    if (trimmed === filters.q) return

    const timer = window.setTimeout(() => {
      router.replace(buildEventsHref({ ...filters, q: trimmed }), { scroll: false })
    }, 250)

    return () => window.clearTimeout(timer)
  }, [searchInput, filters, router])

  // Fetch events whenever reactive URL filters change
  useEffect(() => {
    let active = true

    async function fetchEvents() {
      setLoading(true)
      const supabase = createClient()

      const { startIso, endIso } = resolveDublinDateRangeUtc(filters.date)

      let query = supabase
        .from('events')
        .select(`
          id,
          title,
          slug,
          description,
          event_type,
          start_time,
          end_time,
          price_min,
          price_max,
          is_free,
          music_genre,
          image_url,
          venues!inner (
            id,
            name,
            slug,
            county,
            city,
            address,
            latitude,
            longitude,
            images
          )
        `)
        .eq('is_published', true)
        .eq('venues.is_verified', true)
        .gte('start_time', startIso)
        .order('start_time', { ascending: true })
        .limit(QUERY_CAP)

      if (endIso) {
        query = query.lte('start_time', endIso)
      }

      if (filters.county !== 'All') {
        query = query.eq('venues.county', filters.county)
      }

      if (filters.type !== 'All') {
        query = query.eq('event_type', filters.type)
      }

      if (filters.genre !== 'All') {
        query = query.eq('music_genre', filters.genre)
      }

      if (filters.free) {
        query = query.eq('is_free', true)
      }

      const safeSearch = filters.q.replace(/[,()]/g, ' ').trim()
      if (safeSearch) {
        query = query.or(`title.ilike.%${safeSearch}%,venues.name.ilike.%${safeSearch}%`)
      }

      const { data, error } = await query

      if (!active) return

      if (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } else {
        const mapped: EventCardEvent[] = ((data ?? []) as RawEventRow[]).flatMap((row) => {
          const venueRel = row.venues
          const venue = Array.isArray(venueRel) ? venueRel[0] : venueRel
          if (!venue?.name) return []
          return [
            {
              id: row.id,
              title: row.title,
              slug: row.slug,
              description: row.description ?? '',
              event_type: row.event_type ?? 'live_music',
              start_time: row.start_time,
              end_time: row.end_time,
              price_min: row.price_min,
              price_max: row.price_max,
              is_free: row.is_free,
              music_genre: row.music_genre ?? '',
              image_url: row.image_url,
              venues: {
                id: venue.id,
                name: venue.name,
                slug: venue.slug,
                county: venue.county,
                city: venue.city,
                address: venue.address,
                latitude: venue.latitude,
                longitude: venue.longitude,
                images: venue.images,
              },
            },
          ]
        })
        setEvents(mapped)
      }

      setLoading(false)
    }

    void fetchEvents()

    return () => {
      active = false
    }
  }, [filters.county, filters.type, filters.genre, filters.date, filters.q, filters.free])

  const genreOptions = useMemo(
    () =>
      buildMusicGenreOptions(
        events.map((event) => event.music_genre),
        filters.genre
      ),
    [events, filters.genre]
  )

  const activeChips = useMemo(() => {
    const chips: Array<{ key: EventsFilterKey; label: string }> = []
    if (filters.county !== 'All') {
      chips.push({ key: 'county', label: `County: ${filters.county}` })
    }
    if (filters.date !== 'all') {
      chips.push({
        key: 'date',
        label: `Date: ${formatDateFilterLabel(filters.date, dateOptions)}`,
      })
    }
    if (filters.type !== 'All') {
      chips.push({ key: 'type', label: categoryOptionLabel(filters.type) })
    }
    if (filters.genre !== 'All') {
      chips.push({ key: 'genre', label: `Genre: ${filters.genre}` })
    }
    if (filters.free) {
      chips.push({ key: 'free', label: 'Free entry' })
    }
    if (filters.q) {
      chips.push({ key: 'q', label: `"${filters.q}"` })
    }
    return chips
  }, [filters, dateOptions])

  const activeSidebarFilterCount = useMemo(() => {
    let count = 0
    if (filters.county !== 'All') count += 1
    if (filters.date !== 'all') count += 1
    if (filters.type !== 'All') count += 1
    if (filters.genre !== 'All') count += 1
    if (filters.free) count += 1
    return count
  }, [filters])

  const heroHeading = useMemo(() => {
    const categoryText =
      filters.type === 'All' ? 'Events' : categoryOptionLabel(filters.type)
    const locationAccent =
      filters.county === 'All' ? 'Across Ireland' : `in ${filters.county}`
    return (
      <>
        {categoryText} <HeroAccent>{locationAccent}</HeroAccent>
      </>
    )
  }, [filters.county, filters.type])

  return (
    <div className="flex flex-col overflow-x-hidden bg-background">
      <PageHero
        compact
        align="left"
        title={heroHeading}
        subtitle="Verified live music, club nights, comedy, pub quizzes and gigs across Ireland."
      >
        <div className="space-y-4">
          {/* Search Input */}
          <form
            role="search"
            aria-label="Filter events by keyword"
            onSubmit={(e) => {
              e.preventDefault()
              updateFilters({ q: searchInput.trim() })
            }}
            className="relative"
          >
            <label htmlFor={searchInputId} className="sr-only">
              Search events or venues
            </label>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={searchInputId}
              type="search"
              placeholder="Search artists, events, or venues…"
              value={searchInput}
              onChange={(e) =>
                setDraftQuery({ baseUrlQ: filters.q, value: e.target.value })
              }
              className="h-12 rounded-xl border-input bg-card/95 pl-12 pr-11 text-base text-foreground shadow-lg"
              autoComplete="off"
            />
            {searchInput ? (
              <button
                type="button"
                onClick={() => handleClearSingle('q')}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </form>

          {/* Horizontal Date Strip (Europe/Dublin) */}
          <div className="flex items-center gap-2">
            <span className="hidden shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline-flex">
              <Calendar className="h-3.5 w-3.5 text-mint" aria-hidden="true" />
              When:
            </span>
            <div
              role="group"
              aria-label="Filter by date"
              className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {dateOptions.map((option) => {
                const active = filters.date === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateFilters({ date: option.value })}
                    aria-pressed={active}
                    className={`min-h-9 shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                      active
                        ? 'border-mint bg-mint text-night shadow-sm'
                        : 'border-border bg-card/80 text-foreground/85 hover:border-mint/60 hover:text-mint'
                    }`}
                  >
                    {option.shortLabel}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Horizontal Event Category Strip */}
          <div
            role="group"
            aria-label="Filter by event category"
            className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {EVENT_CATEGORY_OPTIONS.map((category) => {
              const active = filters.type === category.value
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => updateFilters({ type: category.value })}
                  aria-pressed={active}
                  className={`min-h-9 shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                    active
                      ? 'border-primary bg-primary/20 font-semibold text-mint'
                      : 'border-border/80 bg-night/60 text-foreground/80 hover:border-mint/50 hover:text-foreground'
                  }`}
                >
                  {category.label}
                </button>
              )
            })}
          </div>
        </div>
      </PageHero>

      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* Mobile Action Bar (Filters Sheet + Grid/Map Toggle) */}
          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <EventsMobileFilterSheet
              filters={filters}
              dateOptions={dateOptions}
              genreOptions={genreOptions}
              activeFilterCount={activeSidebarFilterCount}
              onUpdateFilters={updateFilters}
              onResetAll={handleResetAll}
            />
            <ViewModeToggle
              view={filters.view}
              onChange={(view) => updateFilters({ view })}
            />
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Desktop Sticky Sidebar */}
            <div className="hidden lg:col-span-3 lg:block">
              <EventsFilterSidebar
                filters={filters}
                dateOptions={dateOptions}
                genreOptions={genreOptions}
                activeFilterCount={activeSidebarFilterCount}
                onUpdateFilters={updateFilters}
                onResetAll={handleResetAll}
              />
            </div>

            {/* Results Column */}
            <div className="min-w-0 lg:col-span-9">
              {/* Results Count + Desktop View Mode Toggle */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div aria-live="polite" className="flex flex-wrap items-baseline gap-2">
                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                    {loading
                      ? 'Finding events…'
                      : `${events.length}${events.length === QUERY_CAP ? '+' : ''} ${
                          events.length === 1 ? 'Event' : 'Events'
                        }`}
                  </h2>
                  {!loading ? (
                    <span className="text-sm text-muted-foreground">
                      {filters.county === 'All' ? 'across Ireland' : `in ${filters.county}`}
                      {filters.date !== 'all'
                        ? ` · ${formatDateFilterLabel(filters.date, dateOptions)}`
                        : ''}
                    </span>
                  ) : null}
                </div>

                <div className="hidden lg:block">
                  <ViewModeToggle
                    view={filters.view}
                    onChange={(view) => updateFilters({ view })}
                  />
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeChips.length > 0 ? (
                <div
                  className="mb-5 flex flex-wrap items-center gap-2"
                  aria-label="Active filters"
                >
                  {activeChips.map((chip) => (
                    <span
                      key={chip.key}
                      className="inline-flex items-center gap-1.5 rounded-full border border-mint/35 bg-mint/10 py-1 pl-3 pr-2 text-xs font-medium text-mint"
                    >
                      <span>{chip.label}</span>
                      <button
                        type="button"
                        onClick={() => handleClearSingle(chip.key)}
                        aria-label={`Remove ${chip.label} filter`}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-mint/25"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="ml-1 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              ) : null}

              {/* Honest 50-Event Query Cap Notice */}
              {!loading && events.length === QUERY_CAP ? (
                <div
                  role="status"
                  className="mb-6 flex items-center gap-2.5 rounded-xl border border-mint/25 bg-mint/10 px-4 py-3 text-xs text-foreground/90 sm:text-sm"
                >
                  <Info className="h-4 w-4 shrink-0 text-mint" aria-hidden="true" />
                  <span>
                    Showing the first {QUERY_CAP} matching events ordered by start time. Choose a
                    specific date or county to narrow results further.
                  </span>
                </div>
              ) : null}

              {/* Main View: Map or Grid */}
              {filters.view === 'map' ? (
                <EventsMap
                  selectedCounty={filters.county}
                  events={events}
                  loading={loading}
                />
              ) : loading ? (
                <EventsSkeletonGrid />
              ) : events.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <EventsEmptyState
                  filters={filters}
                  dateOptions={dateOptions}
                  hasActiveFilters={activeChips.length > 0}
                  onClearDate={() => handleClearSingle('date')}
                  onSelectCounty={(county) => updateFilters({ county })}
                  onResetAll={handleResetAll}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
