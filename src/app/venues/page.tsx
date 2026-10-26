'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { PageHero, HeroAccent } from '@/components/layout/PageHero'

const supabase = createClient()

const VENUE_TYPES = ['All', 'Pub', 'Bar', 'Club', 'Live Music Venue', 'Restaurant']

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
}

export default function VenuesPage() {
  const [selectedCounty, setSelectedCounty] = useState<string>('All Ireland')
  const [selectedType, setSelectedType] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVenues() {
      setLoading(true)
      
      let query = supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true })

      if (selectedCounty !== 'All Ireland') {
        query = query.eq('county', selectedCounty)
      }

      if (selectedType !== 'All') {
        query = query.eq('venue_type', selectedType.toLowerCase().replace(/\s+/g, '_'))
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching venues:', error)
      } else {
        setVenues(data || [])
      }

      setLoading(false)
    }

    fetchVenues()
  }, [selectedCounty, selectedType, searchQuery])

  return (
    <div className="flex flex-col bg-gray-50">
      <PageHero
        title={<>Venues Across <HeroAccent>Ireland</HeroAccent></>}
        subtitle="Discover the best bars, clubs, and live music venues"
      >
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search venues or towns..."
            className="pl-12 pr-4 py-6 text-lg bg-white text-gray-900 border-gray-300 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-emerald-500 transition-colors">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <span className="sr-only">County</span>
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-medium text-gray-900 cursor-pointer"
            >
              <option value="All Ireland">All Ireland</option>
              {PROVINCES.map(province => (
                <optgroup key={province} label={province}>
                  {IRISH_COUNTIES
                    .filter(county => county.province === province)
                    .map(county => (
                      <option key={county.name} value={county.name}>{county.name}</option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-emerald-500 transition-colors">
            <Filter className="h-5 w-5 text-emerald-600" />
            <span className="sr-only">Venue type</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-medium text-gray-900 cursor-pointer"
            >
              {VENUE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>
      </PageHero>

      {/* Venues Grid */}
      <section className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading...' : `${venues.length} ${venues.length === 1 ? 'Venue' : 'Venues'}`}
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">⏳</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading venues...</h3>
            </div>
          ) : venues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => (
                <Link key={venue.id} href={`/venues/${venue.slug}`}>
                  <Card className="bg-white border-2 border-gray-200 hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer h-full group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{venue.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                            <span>{venue.city}, {venue.county}</span>
                          </div>
                        </div>
                        {venue.is_verified && (
                          <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {venue.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {venue.venue_type?.replaceAll('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          {venue.price_range}
                        </Badge>
                      </div>

                      {venue.music_genres && venue.music_genres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {venue.music_genres.slice(0, 3).map((genre, idx) => (
                            <span key={idx} className="text-xs text-gray-500">
                              {genre}{idx < Math.min(venue.music_genres.length - 1, 2) ? ' •' : ''}
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
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No venues found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
