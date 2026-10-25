'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

interface Venue {
  id: string
  name: string
  slug: string
  address: string
  city: string
  latitude: number
  longitude: number
}

interface PlanMapProps {
  venues: Venue[]
}

export default function PlanMap({ venues }: PlanMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.8985, -8.4736]) // Default to Cork
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Calculate center based on venues
    if (venues.length > 0) {
      const avgLat = venues.reduce((sum, v) => sum + v.latitude, 0) / venues.length
      const avgLng = venues.reduce((sum, v) => sum + v.longitude, 0) / venues.length
      setMapCenter([avgLat, avgLng])
    }
  }, [venues])

  if (venues.length === 0) {
    return null
  }

  // Don't render map during SSR
  if (!mounted) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Loading map...</h3>
        <p className="text-gray-600">Preparing your route</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-lg">
      {/* Map Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white p-6">
        <h3 className="text-2xl font-bold mb-2">
          🗺️ Your Route Tonight
        </h3>
        <p className="text-emerald-50">
          {venues.length} {venues.length === 1 ? 'venue' : 'venues'} in your plan
        </p>
      </div>

      {/* Map Container */}
      <div className="relative" style={{ height: '400px' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {venues.map((venue, index) => (
            <Marker
              key={venue.id}
              position={[venue.latitude, venue.longitude]}
              icon={venueIcon}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <h4 className="font-bold text-gray-900">{venue.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    <span>{venue.address}</span>
                  </div>
                  <Link href={`/venues/${venue.slug}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                      View Venue
                    </Button>
                  </Link>
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
            <span className="text-gray-700">Venue in your plan</span>
          </div>
          <div className="text-gray-600">
            Click pins to see venue details
          </div>
        </div>
      </div>
    </div>
  )
}
