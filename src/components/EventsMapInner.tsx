'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { MapPin, Clock, Euro } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const supabase = createClient()

// Custom marker icon
const createCustomIcon = (color: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="16" r="8" fill="white"/>
      </svg>
    `)}`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  })
}

const venueIcon = createCustomIcon('#10b981') // Emerald green

interface VenueWithEvents {
  id: string
  name: string
  slug: string
  latitude: number
  longitude: number
  address: string
  city: string
  county: string
  events: Array<{
    id: string
    title: string
    slug: string
    start_time: string
    end_time: string
    price_min: number
    price_max: number
    is_free: boolean
    music_genre: string
  }>
}

interface EventsMapInnerProps {
  selectedCounty?: string
}

export default function EventsMapInner({ selectedCounty = 'Cork' }: EventsMapInnerProps) {
  const [venues, setVenues] = useState<VenueWithEvents[]>([])
  const [loading, setLoading] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.8985, -8.4736]) // Default to Cork
  const [mapZoom, setMapZoom] = useState(13)

  // County centers for map positioning
  const countyCenters: Record<string, [number, number]> = {
    'Cork': [51.8985, -8.4736],
    'Dublin': [53.3498, -6.2603],
    'Galway': [53.2707, -9.0568],
    'Limerick': [52.6638, -8.6267],
    'Waterford': [52.2593, -7.1101],
    'Kilkenny': [52.6541, -7.2448],
    'All Ireland': [53.4125, -7.9833],
  }

  useEffect(() => {
    // Update map center when county changes
    if (countyCenters[selectedCounty]) {
      setMapCenter(countyCenters[selectedCounty])
      setMapZoom(selectedCounty === 'All Ireland' ? 7 : 12)
    }
  }, [selectedCounty])

  useEffect(() => {
    async function fetchVenuesWithEvents() {
      setLoading(true)

      // Get upcoming events (next 48 hours)
      const now = new Date()
      const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000)

      // Fetch venues with upcoming events
      let query = supabase
        .from('venues')
        .select(`
          *,
          events (
            id,
            title,
            slug,
            start_time,
            end_time,
            price_min,
            price_max,
            is_free,
            music_genre
          )
        `)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      // Filter by county if not "All Ireland"
      if (selectedCounty !== 'All Ireland') {
        query = query.eq('county', selectedCounty)
      }

      const { data: venuesData, error } = await query

      if (error) {
        console.error('Error fetching venues:', error)
        setLoading(false)
        return
      }

      // Filter venues to only those with upcoming events
      const venuesWithUpcomingEvents = venuesData
        ?.map((venue: any) => ({
          ...venue,
          events: venue.events.filter((event: any) => {
            const eventStart = new Date(event.start_time)
            return eventStart >= now && eventStart <= fortyEightHoursLater
          }),
        }))
        .filter((venue: any) => venue.events.length > 0) || []

      setVenues(venuesWithUpcomingEvents)
      setLoading(false)
    }

    fetchVenuesWithEvents()
  }, [selectedCounty])

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (event: any) => {
    if (event.is_free) return 'Free'
    if (event.price_min === event.price_max) return `€${event.price_min}`
    return `€${event.price_min}-€${event.price_max}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Loading map...</h3>
        <p className="text-gray-600">Finding venues with events today</p>
      </div>
    )
  }

  if (venues.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">📍</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No upcoming events</h3>
        <p className="text-gray-600 mb-4">
          {selectedCounty !== 'All Ireland'
            ? `No venues with upcoming events in ${selectedCounty}`
            : 'No venues with upcoming events'}
        </p>
        <p className="text-sm text-gray-500">
          Try selecting a different county or check back later
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-lg">
      {/* Map Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          🗺️ Live Events Map
        </h2>
        <p className="text-emerald-50">
          {venues.length} {venues.length === 1 ? 'venue' : 'venues'} with upcoming events in {selectedCounty}
        </p>
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height: '500px' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {venues.map((venue) => (
            <Marker
              key={venue.id}
              position={[venue.latitude, venue.longitude]}
              icon={venueIcon}
            >
              <Popup>
                <div className="p-2 min-w-[280px]">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {venue.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>{venue.address}</span>
                  </div>

                  {/* Events List */}
                  <div className="space-y-3 mb-4">
                    {venue.events.map((event) => (
                      <div key={event.id} className="border-l-4 border-emerald-500 pl-3">
                        <Link href={`/events/${event.slug}`} className="block">
                          <h4 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                            {event.title}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(event.start_time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            <span>{formatPrice(event)}</span>
                          </div>
                        </div>
                        <Badge className="mt-1 bg-emerald-100 text-emerald-700 text-xs">
                          {event.music_genre}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link href={`/venues/${venue.slug}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                      >
                        View Venue
                      </Button>
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="bg-gray-50 border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-gray-700">Venue with events today</span>
          </div>
          <div className="text-gray-600">
            Click pins to see event details
          </div>
        </div>
      </div>
    </div>
  )
}
