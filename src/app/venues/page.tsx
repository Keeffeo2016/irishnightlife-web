'use client'

import { Suspense, useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Compass, MapPin, RotateCcw, Search, SearchX, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { HeroAccent, PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VenueCard, type VenueCardVenue } from '@/components/VenueCard'
import {
  buildVenuesHref,
  clearSingleVenueFilter,
  parseVenuesSearchParams,
  POPULAR_VENUE_COUNTIES,
  PUBS_BARS_KEY,
  sanitizeVenueSearchQuery,
  VENUE_CATEGORY_OPTIONS,
  venueCategoryLabel,
  venueTypesForFilter,
  type VenuesFilterKey,
  type VenuesFiltersState,
} from '@/components/venues/venues-discovery-utils'

const supabase = createClient()

function VenuesSkeletonGrid() {
  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/80 animate-pulse motion-reduce:animate-none"
        >
          <div className="aspect-video w-full bg-muted/60" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 rounded-md bg-muted" />
            <div className="h-4 w-1/2 rounded-md bg-muted/80" />
            <div className="h-4 w-full rounded-md bg-muted/60" />
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5">
              <div className="h-4 w-20 rounded-md bg-muted/80" />
              <div className="h-4 w-24 rounded-md bg-muted/80" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading matching venues</span>
    </div>
  )
}

export default function VenuesPage() {
  return (
    <Suspense>
      <VenuesBrowser />
    </Suspense>
  )
}

function VenuesBrowser() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchInputId = useId()
  const countySelectId = useId()

  const filters = useMemo(
    () => parseVenuesSearchParams(searchParams),
    [searchParams]
  )

  const [draftQuery, setDraftQuery] = useState<{ baseUrlQ: string; value: string }>(() => ({
    baseUrlQ: filters.q,
    value: filters.q,
  }))
  const searchInput = draftQuery.baseUrlQ === filters.q ? draftQuery.value : filters.q

  const [venues, setVenues] = useState<VenueCardVenue[]>([])
  const [loading, setLoading] = useState(true)

  const updateFilters = useCallback(
    (patch: Partial<VenuesFiltersState>) => {
      const next: VenuesFiltersState = {
        ...filters,
        ...patch,
      }
      if (patch.q !== undefined) {
        setDraftQuery({ baseUrlQ: patch.q, value: patch.q })
      }
      router.replace(buildVenuesHref(next), { scroll: false })
    },
    [filters, router]
  )

  const handleResetAll = useCallback(() => {
    setDraftQuery({ baseUrlQ: '', value: '' })
    router.replace(
      buildVenuesHref({
        county: 'All Ireland',
        type: 'All',
        q: '',
      }),
      { scroll: false }
    )
  }, [router])

  const handleClearSingle = useCallback(
    (key: VenuesFilterKey) => {
      if (key === 'q') {
        setDraftQuery({ baseUrlQ: '', value: '' })
      }
      const next = clearSingleVenueFilter(filters, key)
      router.replace(buildVenuesHref(next), { scroll: false })
    },
    [filters, router]
  )

  // Debounced URL sync as user types in search box
  useEffect(() => {
    const trimmed = searchInput.trim()
    if (trimmed === filters.q) return

    const timer = window.setTimeout(() => {
      router.replace(buildVenuesHref({ ...filters, q: trimmed }), { scroll: false })
    }, 250)

    return () => window.clearTimeout(timer)
  }, [searchInput, filters, router])

  // Fetch verified venues whenever reactive URL filters change
  useEffect(() => {
    let active = true

    async function fetchVenues() {
      setLoading(true)

      let query = supabase
        .from('venues')
        .select(
          'id, name, slug, description, address, city, county, venue_type, price_range, music_genres, atmosphere, is_verified, images'
        )
        .eq('is_verified', true)
        .order('name', { ascending: true })

      if (filters.county !== 'All Ireland') {
        query = query.eq('county', filters.county)
      }

      const typeFilter = venueTypesForFilter(filters.type)
      if (typeFilter?.length === 1) {
        query = query.eq('venue_type', typeFilter[0])
      } else if (typeFilter && typeFilter.length > 1) {
        query = query.in('venue_type', typeFilter)
      }

      const safeSearch = sanitizeVenueSearchQuery(filters.q)
      if (safeSearch) {
        query = query.or(`name.ilike.%${safeSearch}%,city.ilike.%${safeSearch}%`)
      }

      const { data, error } = await query

      if (!active) return

      if (error) {
        console.error('Error fetching venues:', error)
        setVenues([])
      } else {
        setVenues((data ?? []) as VenueCardVenue[])
      }

      setLoading(false)
    }

    void fetchVenues()

    return () => {
      active = false
    }
  }, [filters.county, filters.type, filters.q])

  const activeChips = useMemo(() => {
    const chips: Array<{ key: VenuesFilterKey; label: string }> = []
    if (filters.county !== 'All Ireland') {
      chips.push({ key: 'county', label: `County: ${filters.county}` })
    }
    if (filters.type !== 'All') {
      chips.push({ key: 'type', label: `Category: ${venueCategoryLabel(filters.type)}` })
    }
    if (filters.q) {
      chips.push({ key: 'q', label: `"${filters.q}"` })
    }
    return chips
  }, [filters])

  const heroHeading = useMemo(() => {
    const categoryText =
      filters.type === 'All' ? 'Venues' : venueCategoryLabel(filters.type)
    const locationAccent =
      filters.county === 'All Ireland' ? 'Across Ireland' : `in ${filters.county}`
    return (
      <>
        {categoryText} <HeroAccent>{locationAccent}</HeroAccent>
      </>
    )
  }, [filters.county, filters.type])

  const heroSubtitle = useMemo(() => {
    if (filters.type === PUBS_BARS_KEY) {
      return 'Browse verified pubs and bars across Ireland — real venues, no paid rankings.'
    }
    return 'Explore verified pubs, bars, nightclubs, live music stages, and restaurants across Ireland.'
  }, [filters.type])

  const emptyHeading = useMemo(() => {
    const categoryLabel =
      filters.type === 'All' ? 'venues' : venueCategoryLabel(filters.type)
    const locationText =
      filters.county === 'All Ireland' ? 'across Ireland' : `in ${filters.county}`

    if (filters.q) {
      return `No ${categoryLabel.toLowerCase()} matching "${filters.q}" ${locationText}.`
    }
    if (filters.type !== 'All' && filters.county !== 'All Ireland') {
      return `No ${categoryLabel} found in ${filters.county}.`
    }
    if (filters.county !== 'All Ireland') {
      return `No verified venues listed in ${filters.county} yet.`
    }
    return `No ${categoryLabel.toLowerCase()} found.`
  }, [filters])

  return (
    <div className="flex flex-col overflow-x-hidden bg-background">
      <PageHero
        compact
        align="left"
        title={heroHeading}
        subtitle={heroSubtitle}
      >
        <div className="space-y-4">
          {/* Search + County Selector Row */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <form
              role="search"
              aria-label="Filter venues by name or town"
              onSubmit={(e) => {
                e.preventDefault()
                updateFilters({ q: searchInput.trim() })
              }}
              className="relative md:col-span-8"
            >
              <label htmlFor={searchInputId} className="sr-only">
                Search venues or towns
              </label>
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={searchInputId}
                type="search"
                placeholder="Search venue name, town, or city…"
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

            <div className="md:col-span-4">
              <label
                htmlFor={countySelectId}
                className="flex h-12 items-center gap-2 rounded-xl border border-input bg-card/95 px-4 shadow-lg transition-colors hover:border-primary focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50"
              >
                <MapPin className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="sr-only">County</span>
                <select
                  id={countySelectId}
                  value={filters.county}
                  onChange={(e) => updateFilters({ county: e.target.value })}
                  className="min-w-0 flex-1 cursor-pointer bg-transparent font-medium text-foreground outline-none"
                >
                  <option value="All Ireland">All Ireland (32 Counties)</option>
                  {PROVINCES.map((province) => (
                    <optgroup key={province} label={province}>
                      {IRISH_COUNTIES.filter((county) => county.province === province).map(
                        (county) => (
                          <option key={county.name} value={county.name}>
                            {county.name}
                          </option>
                        )
                      )}
                    </optgroup>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Horizontal Venue Category Chips */}
          <div
            role="group"
            aria-label="Filter by venue category"
            className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {VENUE_CATEGORY_OPTIONS.map((category) => {
              const active = filters.type === category.value
              return (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => updateFilters({ type: category.value })}
                  aria-pressed={active}
                  className={`min-h-9 shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                    active
                      ? 'border-mint bg-mint text-night shadow-sm'
                      : 'border-border bg-card/80 text-foreground/85 hover:border-mint/60 hover:text-mint'
                  }`}
                >
                  {category.label}
                </button>
              )
            })}
          </div>

          {/* Popular County Quick Chips */}
          <div
            role="group"
            aria-label="Quick county selection"
            className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:inline-flex">
              <MapPin className="h-3.5 w-3.5 text-mint" aria-hidden="true" />
              County:
            </span>
            {POPULAR_VENUE_COUNTIES.map((countyName) => {
              const active = filters.county === countyName
              return (
                <button
                  key={countyName}
                  type="button"
                  onClick={() => updateFilters({ county: countyName })}
                  aria-pressed={active}
                  className={`min-h-8 shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary/20 font-semibold text-mint'
                      : 'border-border/80 bg-night/60 text-foreground/80 hover:border-mint/50 hover:text-foreground'
                  }`}
                >
                  {countyName}
                </button>
              )
            })}
          </div>
        </div>
      </PageHero>

      <section className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {/* Results Count Heading */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div aria-live="polite" className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                {loading
                  ? 'Finding venues…'
                  : `${venues.length} ${venues.length === 1 ? 'Venue' : 'Venues'}`}
              </h2>
              {!loading ? (
                <span className="text-sm text-muted-foreground">
                  {filters.county === 'All Ireland'
                    ? 'across Ireland'
                    : `in ${filters.county}`}
                  {filters.type !== 'All'
                    ? ` · ${venueCategoryLabel(filters.type)}`
                    : ''}
                </span>
              ) : null}
            </div>
          </div>

          {/* Active Filter Pills */}
          {activeChips.length > 0 ? (
            <div
              className="mb-6 flex flex-wrap items-center gap-2"
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
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-mint/25"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
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

          {/* Venues Grid / Loading Skeleton / Empty State */}
          {loading ? (
            <VenuesSkeletonGrid />
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {venues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-mint/25 bg-mint/10">
                <SearchX className="h-7 w-7 text-mint" aria-hidden="true" />
              </div>

              <h3 className="mx-auto max-w-lg text-xl font-bold text-foreground sm:text-2xl">
                {emptyHeading}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
                New verified venues are added regularly across Ireland. Try clearing a filter
                or exploring another county.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {activeChips.length > 0 ? (
                  <Button
                    type="button"
                    variant="brand"
                    onClick={handleResetAll}
                    className="min-h-10 gap-2 px-4"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Clear all filters
                  </Button>
                ) : null}

                {filters.county !== 'Cork' ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateFilters({ county: 'Cork' })}
                    className="min-h-10 gap-2 px-4"
                  >
                    <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
                    Explore Cork
                  </Button>
                ) : null}

                {filters.county !== 'All Ireland' ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateFilters({ county: 'All Ireland' })}
                    className="min-h-10 gap-2 px-4"
                  >
                    <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
                    View All Ireland
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
