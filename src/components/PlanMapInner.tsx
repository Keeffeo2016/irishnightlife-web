'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { ExternalLink, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { syncLeafletView } from '@/lib/leaflet-map'
import { detailHrefFromPlan } from '@/lib/planner'

export interface PlanMapVenue {
  id: string
  name: string
  slug: string
  address?: string | null
  city?: string | null
  county?: string | null
  latitude?: number | null
  longitude?: number | null
  stopNumber?: number
  eventTitle?: string
  eventSlug?: string
}

export interface PlanMapProps {
  venues: PlanMapVenue[]
  detailQuery?: string
}

interface MappedPlanVenue extends PlanMapVenue {
  latitude: number
  longitude: number
  resolvedStopNumber: number
}

const DEFAULT_CORK_CENTER: [number, number] = [51.8985, -8.4736]

function hasValidCoordinates(venue: PlanMapVenue, stopNumber: number): MappedPlanVenue | null {
  const { latitude, longitude } = venue
  if (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude)
  ) {
    return {
      ...venue,
      latitude,
      longitude,
      resolvedStopNumber: stopNumber,
    }
  }
  return null
}

function createNumberedStopIcon(stopNumber: number): Icon {
  const safeNum = Math.max(1, Math.min(99, Math.trunc(stopNumber)))
  const svg = `<svg width="36" height="46" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 1C8.61 1 1 8.61 1 18c0 12.2 17 26.8 17 26.8S35 30.2 35 18C35 8.61 27.39 1 18 1z" fill="#64f4c2" stroke="#0b1114" stroke-width="2"/>
    <circle cx="18" cy="18" r="11" fill="#0b1114"/>
    <text x="18" y="22" text-anchor="middle" fill="#64f4c2" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800">${safeNum}</text>
  </svg>`

  return new Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -42],
  })
}

function formatStopLocation(venue: PlanMapVenue): string {
  const address = venue.address?.trim()
  const city = venue.city?.trim()
  const county = venue.county?.trim()

  const parts: string[] = []
  if (address) parts.push(address)
  if (city) parts.push(city)
  if (county && (!city || city.toLowerCase() !== county.toLowerCase())) {
    parts.push(`Co. ${county}`)
  }

  return parts.join(', ') || 'Ireland'
}

function computeRouteViewport(venues: MappedPlanVenue[]): {
  center: [number, number]
  zoom: number
} {
  if (venues.length === 0) {
    return { center: DEFAULT_CORK_CENTER, zoom: 13 }
  }

  if (venues.length === 1) {
    return {
      center: [venues[0].latitude, venues[0].longitude],
      zoom: 14,
    }
  }

  let minLat = venues[0].latitude
  let maxLat = venues[0].latitude
  let minLng = venues[0].longitude
  let maxLng = venues[0].longitude

  for (const venue of venues) {
    if (venue.latitude < minLat) minLat = venue.latitude
    if (venue.latitude > maxLat) maxLat = venue.latitude
    if (venue.longitude < minLng) minLng = venue.longitude
    if (venue.longitude > maxLng) maxLng = venue.longitude
  }

  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2
  const span = Math.max(maxLat - minLat, maxLng - minLng)

  let zoom = 13
  if (span > 1.5) zoom = 7
  else if (span > 0.5) zoom = 10
  else if (span > 0.12) zoom = 12

  return {
    center: [centerLat, centerLng],
    zoom,
  }
}

function MapViewport({
  center,
  zoom,
  onUnavailable,
}: {
  center: [number, number]
  zoom: number
  onUnavailable: () => void
}) {
  const map = useMap()
  const reported = useRef(false)

  useEffect(() => {
    if (syncLeafletView(map, center, zoom)) return
    if (reported.current) return
    reported.current = true
    onUnavailable()
  }, [map, center, zoom, onUnavailable])

  return null
}

export default function PlanMapInner({ venues, detailQuery = '' }: PlanMapProps) {
  const [mapEpoch, setMapEpoch] = useState(0)
  const rebuildMap = useCallback(() => {
    setMapEpoch(epoch => epoch + 1)
  }, [])

  const validVenues = useMemo(
    () =>
      venues.flatMap((venue, index) => {
        const stopNum = venue.stopNumber ?? index + 1
        const mapped = hasValidCoordinates(venue, stopNum)
        return mapped ? [mapped] : []
      }),
    [venues]
  )

  const { center: mapCenter, zoom: mapZoom } = useMemo(
    () => computeRouteViewport(validVenues),
    [validVenues]
  )

  if (venues.length === 0) {
    return null
  }

  const partialCoordinates = validVenues.length > 0 && validVenues.length < venues.length

  return (
    <section
      aria-label="Planned route map"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg"
    >
      {/* Map Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-night via-night-soft to-forest px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-white">Your Route Tonight</h2>
          <p className="text-sm text-muted-foreground">
            {validVenues.length === 0
              ? 'Map coordinates are not listed for these stops yet — see venue addresses below.'
              : partialCoordinates
                ? `Showing ${validVenues.length} of ${venues.length} stops with map coordinates`
                : `${validVenues.length} ${validVenues.length === 1 ? 'stop' : 'stops'} plotted in itinerary order`}
          </p>
        </div>
        {validVenues.length > 0 ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-night/70 px-3 py-1 text-xs font-medium text-mint">
            <span className="h-2 w-2 rounded-full bg-mint" aria-hidden="true" />
            <span>Select a numbered pin for details</span>
          </div>
        ) : null}
      </div>

      {/* Interactive Map when coordinates are present */}
      {validVenues.length > 0 ? (
        <div className="relative h-[380px] w-full sm:h-[420px]">
          <MapContainer
            key={mapEpoch}
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <MapViewport center={mapCenter} zoom={mapZoom} onUnavailable={rebuildMap} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {validVenues.map(venue => {
              const venueHref = detailHrefFromPlan(`/venues/${venue.slug}`, detailQuery)
              const eventHref = venue.eventSlug
                ? detailHrefFromPlan(`/events/${venue.eventSlug}`, detailQuery)
                : null

              return (
                <Marker
                  key={`${venue.id}-${venue.resolvedStopNumber}`}
                  position={[venue.latitude, venue.longitude]}
                  icon={createNumberedStopIcon(venue.resolvedStopNumber)}
                >
                  <Popup>
                    <div className="min-w-[220px] max-w-[260px] p-1">
                      <div className="mb-1.5 flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {venue.resolvedStopNumber}
                        </span>
                        <h3 className="text-sm font-bold text-foreground">{venue.name}</h3>
                      </div>

                      {venue.eventTitle ? (
                        <p className="mb-1.5 text-xs font-semibold text-primary">
                          {venue.eventTitle}
                        </p>
                      ) : null}

                      <div className="mb-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                        <span>{formatStopLocation(venue)}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {eventHref ? (
                          <Link href={eventHref} className="flex-1">
                            <Button variant="brand" size="sm" className="w-full text-xs">
                              Event
                            </Button>
                          </Link>
                        ) : null}
                        <Link href={venueHref} className="flex-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-primary text-xs text-primary hover:bg-primary/10"
                          >
                            Venue
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      ) : null}

      {/* Accessible Text List of Route Stops */}
      <div className="border-t border-border bg-background/60 p-4 sm:px-5">
        <p className="mb-2.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
          Route stops &amp; venue locations
        </p>
        <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue, index) => {
            const stopNumber = venue.stopNumber ?? index + 1
            const locationText = formatStopLocation(venue)
            const hasCoords = Boolean(hasValidCoordinates(venue, stopNumber))

            return (
              <li
                key={`${venue.id}-${stopNumber}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/80 bg-card p-3 text-xs"
              >
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mint text-[11px] font-bold text-night">
                    {stopNumber}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={detailHrefFromPlan(`/venues/${venue.slug}`, detailQuery)}
                      className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary"
                    >
                      <span className="truncate">{venue.name}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                    <p className="mt-0.5 truncate text-muted-foreground">{locationText}</p>
                    {!hasCoords ? (
                      <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                        Address listed (no map pin)
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
