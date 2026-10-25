'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
        query = query.eq('venue_type', selectedType.toLowerCase().replace(' ', '_'))
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-emerald-600">IrishNightlife</Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/events" className="text-gray-700 hover:text-emerald-600 font-medium">Events</Link>
              <Link href="/venues" className="text-emerald-600 font-medium">Venues</Link>
              <Link href="/for-venues" className="text-gray-700 hover:text-emerald-600 font-medium">For Venues</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
              Venues Across Ireland
            </h1>
            <p className="text-xl text-gray-600">
              Discover the best bars, clubs, and live music venues
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search venues..."
                className="pl-12 pr-4 py-6 text-lg border-gray-300 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">County</label>
                <select
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-900"
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
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Venue Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-900"
                >
                  {VENUE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                  <Card className="bg-white border-gray-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{venue.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
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
                          {venue.venue_type.replace('_', ' ')}
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
