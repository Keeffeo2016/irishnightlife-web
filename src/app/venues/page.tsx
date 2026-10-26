'use client'

import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MapPin, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { VENUE_TYPES as VENUE_TYPE_DEFS, venueTypeLabel } from '@/lib/venue-profile'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PageHero, HeroAccent } from '@/components/layout/PageHero'

const supabase = createClient()

const VALID_VENUE_TYPE_VALUES = VENUE_TYPE_DEFS.map((type) => type.value)
const PUBS_BARS_KEY = 'pubs_bars'

const TYPE_SELECT_OPTIONS = [
  { value: 'All', label: 'All types' },
  { value: PUBS_BARS_KEY, label: 'Pubs & Bars' },
  ...VENUE_TYPE_DEFS.map((type) => ({ value: type.value, label: type.label })),
]

interface Venue {
  id: string
  name: string
  slug: string
  description: string
  address: string
  city: string
  county: string
  venue_type: string
  price_range: string
  music_genres: string[]
  atmosphere: string[]
  is_verified: boolean
  is_featured: boolean
  images: string[] | null
}

function normalizeVenueTypeParam(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, '_')
}

function parseTypeFilter(searchParams: URLSearchParams): string {
  const typesParam = searchParams.get('types')
  if (typesParam) {
    const values = typesParam
      .split(',')
      .map(normalizeVenueTypeParam)
      .filter((value) => VALID_VENUE_TYPE_VALUES.includes(value as (typeof VALID_VENUE_TYPE_VALUES)[number]))
    const unique = [...new Set(values)]
    if (unique.length === 2 && unique.includes('pub') && unique.includes('bar')) {
      return PUBS_BARS_KEY
    }
    if (unique.length === 1) return unique[0]
  }

  const typeParam = searchParams.get('type')
  if (!typeParam) return 'All'

  const normalized = normalizeVenueTypeParam(typeParam)
  if (normalized === PUBS_BARS_KEY || normalized === 'pubs_and_bars') return PUBS_BARS_KEY
  if (VALID_VENUE_TYPE_VALUES.includes(normalized as (typeof VALID_VENUE_TYPE_VALUES)[number])) {
    return normalized
  }

  // Title Case from older UI labels, e.g. "Live Music Venue"
  const fromLabel = VENUE_TYPE_DEFS.find(
    (type) => type.label.toLowerCase() === typeParam.trim().toLowerCase()
  )
  return fromLabel?.value ?? 'All'
}

function initialCounty(county: string | null) {
  if (!county || county === 'All' || county === 'All Ireland') return 'All Ireland'
  return county
}

function venueTypesForFilter(selectedType: string): string[] | null {
  if (selectedType === 'All') return null
  if (selectedType === PUBS_BARS_KEY) return ['pub', 'bar']
  return [selectedType]
}

export default function VenuesPage() {
  return (
    <Suspense>
      <VenuesBrowser />
    </Suspense>
  )
}

function VenuesBrowser() {
  const searchParams = useSearchParams()
  const [selectedCounty, setSelectedCounty] = useState(() => initialCounty(searchParams.get('county')))
  const [selectedType, setSelectedType] = useState(() => parseTypeFilter(searchParams))
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get('q')?.trim() ?? ''
  )
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  const resultsHeading = useMemo(() => {
    if (selectedType === PUBS_BARS_KEY) return 'Pubs & Bars'
    if (selectedType !== 'All') return venueTypeLabel(selectedType) || selectedType
    return null
  }, [selectedType])

  useEffect(() => {
    async function fetchVenues() {
      setLoading(true)

      let query = supabase
        .from('venues')
        .select('*')
        .eq('is_verified', true)
        .order('name', { ascending: true })

      if (selectedCounty !== 'All Ireland') {
        query = query.eq('county', selectedCounty)
      }

      const typeFilter = venueTypesForFilter(selectedType)
      if (typeFilter?.length === 1) {
        query = query.eq('venue_type', typeFilter[0])
      } else if (typeFilter && typeFilter.length > 1) {
        query = query.in('venue_type', typeFilter)
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching venues:', error)
        setVenues([])
      } else {
        setVenues(data || [])
      }

      setLoading(false)
    }

    fetchVenues()
  }, [selectedCounty, selectedType, searchQuery])

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        title={
          resultsHeading ? (
            <>
              {resultsHeading} Across <HeroAccent>Ireland</HeroAccent>
            </>
          ) : (
            <>
              Venues Across <HeroAccent>Ireland</HeroAccent>
            </>
          )
        }
        subtitle={
          selectedType === PUBS_BARS_KEY
            ? 'Browse verified pubs and bars — not clubs or restaurants'
            : 'Discover the best bars, clubs, and live music venues'
        }
      >
        <div className="relative mb-4">
          <label htmlFor="venues-search" className="sr-only">
            Search venues
          </label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
          <Input
            id="venues-search"
            placeholder="Search venues or towns..."
            className="pl-12 pr-4 py-6 text-lg bg-card text-foreground border-input rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 px-4 py-3 bg-card border border-input rounded-xl hover:border-primary transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="sr-only">County</span>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-medium text-foreground cursor-pointer"
            >
              <option value="All Ireland">All Ireland</option>
              {PROVINCES.map((province) => (
                <optgroup key={province} label={province}>
                  {IRISH_COUNTIES.filter((county) => county.province === province).map((county) => (
                    <option key={county.name} value={county.name}>
                      {county.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 px-4 py-3 bg-card border border-input rounded-xl hover:border-primary transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
            <Filter className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="sr-only">Venue type</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-medium text-foreground cursor-pointer"
            >
              {TYPE_SELECT_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PageHero>

      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {loading ? 'Loading...' : `${venues.length} ${venues.length === 1 ? 'Venue' : 'Venues'}`}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4" aria-hidden="true">
                ⏳
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Loading venues...</h3>
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Link key={venue.id} href={`/venues/${venue.slug}`} className="block h-full focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-xl">
                  <Card className="bg-card border-2 border-border hover:border-primary hover:shadow-2xl transition-all cursor-pointer h-full group overflow-hidden">
                    {venue.images?.[0] ? (
                      <div className="relative aspect-[16/9] w-full bg-muted">
                        <img
                          src={venue.images[0]}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                            {venue.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                            <span>
                              {venue.city}, {venue.county}
                            </span>
                          </div>
                        </div>
                        {venue.is_verified && (
                          <Badge className="bg-primary/15 text-primary">Verified</Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{venue.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="border-border text-foreground/90">
                          {venueTypeLabel(venue.venue_type) || venue.venue_type?.replaceAll('_', ' ')}
                        </Badge>
                        {venue.price_range ? (
                          <Badge variant="outline" className="border-border text-foreground/90">
                            {venue.price_range}
                          </Badge>
                        ) : null}
                      </div>

                      {venue.music_genres && venue.music_genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {venue.music_genres.slice(0, 3).map((genre, idx) => (
                            <span key={idx} className="text-xs text-muted-foreground">
                              {genre}
                              {idx < Math.min(venue.music_genres.length - 1, 2) ? ' •' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4" aria-hidden="true">
                🔍
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">No venues found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
