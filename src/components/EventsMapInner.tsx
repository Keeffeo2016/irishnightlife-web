'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import { Calendar, Clock, Euro, MapPin } from 'lucide-react'
import { syncLeafletView } from '@/lib/leaflet-map'
import { createClient } from '@/lib/supabase/client'
import {
  eventTypeLabel,
  formatEventDate,
  formatEventPrice,
  formatEventTime,
  type EventCardEvent,
} from '@/components/EventCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const createCustomIcon = (color: string) =>
  new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="${color}"/>
        <circle cx="16" cy="16" r="8" fill="#0d1518"/>
      </svg>
    `)}`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  })

const venueIcon = createCustomIcon('#10b981')

interface MapEventItem {
  id: string
  title: string
  slug: string
  event_type: string
  start_time: string
  end_time?: string | null
  price_min: number | null
  price_max: number | null
  is_free: boolean
  music_genre: string
}

interface VenueWithEvents {
  id: string
  name: string
  slug: string
  latitude: number
  longitude: number
  address: string
  city: string
  county: string
  events: MapEventItem[]
}

interface RawVenueRow {
  id: string
  name: string
  slug: string
  latitude: number | null
  longitude: number | null
  address: string | null
  city: string | null
  county: string
  events: Array<{
    id: string
    title: string
    slug: string
    event_type?: string | null
    start_time: string
    end_time?: string | null
    price_min: number | null
    price_max: number | null
    is_free: boolean
    music_genre: string | null
    is_published: boolean
  }> | null
}

const COUNTY_CENTERS: Record<string, [number, number]> = {
  Cork: [51.8985, -8.4736],
  Kerry: [52.0594, -9.5044],
  Dublin: [53.3498, -6.2603],
  Galway: [53.2707, -9.0568],
  Limerick: [52.6638, -8.6267],
  Waterford: [52.2593, -7.1101],
  Kilkenny: [52.6541, -7.2448],
  Clare: [52.8436, -8.9864],
  Wexford: [52.3369, -6.4633],
  Sligo: [54.2766, -8.4761],
  Mayo: [53.8544, -9.2988],
  Donegal: [54.6549, -8.1096],
  'All Ireland': [53.4125, -7.9833],
  All: [53.4125, -7.9833],
}

function hasValidCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined
): lat is number {
  return (
    typeof lat === 'number' &&
    Number.isFinite(lat) &&
    typeof lng === 'number' &&
    Number.isFinite(lng)
  )
}

function groupEventsByVenue(events: EventCardEvent[]): VenueWithEvents[] {
  const byVenue = new Map<string, VenueWithEvents>()

  for (const event of events) {
    const venue = event.venues
    if (!venue?.name) continue
    const lat = venue.latitude
    const lng = venue.longitude
    if (!hasValidCoordinates(lat, lng) || typeof lng !== 'number') continue

    const key = venue.id || venue.slug || `${venue.name}-${venue.county}`
    const existing = byVenue.get(key)

    const item: MapEventItem = {
      id: event.id,
      title: event.title,
      slug: event.slug,
      event_type: event.event_type,
      start_time: event.start_time,
      end_time: event.end_time,
      price_min: event.price_min,
      price_max: event.price_max,
      is_free: event.is_free,
      music_genre: event.music_genre,
    }

    if (existing) {
      existing.events.push(item)
    } else {
      byVenue.set(key, {
        id: venue.id || key,
        name: venue.name,
        slug: venue.slug || '',
        latitude: lat,
        longitude: lng,
        address: venue.address || [venue.city, venue.county].filter(Boolean).join(', '),
        city: venue.city || '',
        county: venue.county,
        events: [item],
      })
    }
  }

  return Array.from(byVenue.values())
}

function computeViewport(
  venues: VenueWithEvents[],
  selectedCounty: string
): { center: [number, number]; zoom: number } {
  if (venues.length === 1) {
    return {
      center: [venues[0].latitude, venues[0].longitude],
      zoom: 13,
    }
  }

  if (venues.length > 1) {
    let minLat = venues[0].latitude
    let maxLat = venues[0].latitude
    let minLng = venues[0].longitude
    let maxLng = venues[0].longitude

    for (const v of venues) {
      if (v.latitude < minLat) minLat = v.latitude
      if (v.latitude > maxLat) maxLat = v.latitude
      if (v.longitude < minLng) minLng = v.longitude
      if (v.longitude > maxLng) maxLng = v.longitude
    }

    const centerLat = (minLat + maxLat) / 2
    const centerLng = (minLng + maxLng) / 2
    const span = Math.max(maxLat - minLat, maxLng - minLng)

    let zoom = 12
    if (span > 1.5) zoom = 7
    else if (span > 0.6) zoom = 9
    else if (span > 0.18) zoom = 11

    return {
      center: [centerLat, centerLng],
      zoom,
    }
  }

  const normalizedCounty =
    !selectedCounty || selectedCounty === 'All' ? 'All Ireland' : selectedCounty
  const fallbackCenter = COUNTY_CENTERS[normalizedCounty] ?? COUNTY_CENTERS['All Ireland']
  const fallbackZoom = normalizedCounty === 'All Ireland' ? 7 : 12

  return {
    center: fallbackCenter,
    zoom: fallbackZoom,
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

export interface EventsMapInnerProps {
  selectedCounty?: string
  events?: EventCardEvent[]
  loading?: boolean
}

export default function EventsMapInner({
  selectedCounty = 'Cork',
  events: providedEvents,
  loading: providedLoading,
}: EventsMapInnerProps) {
  const [fetchedVenues, setFetchedVenues] = useState<VenueWithEvents[]>([])
  const [internalLoading, setInternalLoading] = useState<boolean>(() => providedEvents === undefined)
  const [mapEpoch, setMapEpoch] = useState(0)

  const rebuildMap = useCallback(() => {
    setMapEpoch((epoch) => epoch + 1)
  }, [])

  useEffect(() => {
    if (providedEvents !== undefined) return

    let active = true

    async function fetchVenuesWithEvents() {
      setInternalLoading(true)
      const supabase = createClient()

      const now = new Date()
      const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000)

      let query = supabase
        .from('venues')
        .select(`
          id,
          name,
          slug,
          latitude,
          longitude,
          address,
          city,
          county,
          events (
            id,
            title,
            slug,
            event_type,
            start_time,
            end_time,
            price_min,
            price_max,
            is_free,
            music_genre,
            is_published
          )
        `)
        .eq('is_verified', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)

      if (selectedCounty !== 'All Ireland' && selectedCounty !== 'All') {
        query = query.eq('county', selectedCounty)
      }

      const { data: venuesData, error } = await query

      if (!active) return

      if (error) {
        console.error('Error fetching venues:', error)
        setFetchedVenues([])
        setInternalLoading(false)
        return
      }

      const rows = ((venuesData ?? []) as RawVenueRow[])
        .flatMap((venue): VenueWithEvents[] => {
          if (
            !hasValidCoordinates(venue.latitude, venue.longitude) ||
            typeof venue.longitude !== 'number'
          ) {
            return []
          }
          const matchingEvents = (venue.events ?? [])
            .filter((event) => {
              const eventStart = new Date(event.start_time)
              return (
                event.is_published &&
                eventStart >= now &&
                eventStart <= fortyEightHoursLater
              )
            })
            .map((event) => ({
              id: event.id,
              title: event.title,
              slug: event.slug,
              event_type: event.event_type ?? 'live_music',
              start_time: event.start_time,
              end_time: event.end_time,
              price_min: event.price_min,
              price_max: event.price_max,
              is_free: event.is_free,
              music_genre: event.music_genre ?? '',
            }))

          if (matchingEvents.length === 0) return []

          return [
            {
              id: venue.id,
              name: venue.name,
              slug: venue.slug,
              latitude: venue.latitude,
              longitude: venue.longitude,
              address: venue.address ?? [venue.city, venue.county].filter(Boolean).join(', '),
              city: venue.city ?? '',
              county: venue.county,
              events: matchingEvents,
            },
          ]
        })

      setFetchedVenues(rows)
      setInternalLoading(false)
    }

    void fetchVenuesWithEvents()

    return () => {
      active = false
    }
  }, [providedEvents, selectedCounty])

  const venues = useMemo(
    () => (providedEvents !== undefined ? groupEventsByVenue(providedEvents) : fetchedVenues),
    [providedEvents, fetchedVenues]
  )

  const isLoading = providedEvents !== undefined ? Boolean(providedLoading) : internalLoading

  const { center: mapCenter, zoom: mapZoom } = useMemo(
    () => computeViewport(venues, selectedCounty),
    [venues, selectedCounty]
  )

  const locationContext =
    !selectedCounty || selectedCounty === 'All' || selectedCounty === 'All Ireland'
      ? 'across Ireland'
      : `in ${selectedCounty}`

  const totalMappedEvents = useMemo(
    () => venues.reduce((sum, venue) => sum + venue.events.length, 0),
    [venues]
  )

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-night via-night-soft to-forest px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-white">Events Map</h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {isLoading
              ? `Finding mapped venues ${locationContext}…`
              : `${totalMappedEvents} ${totalMappedEvents === 1 ? 'event' : 'events'} across ${venues.length} ${venues.length === 1 ? 'venue' : 'venues'} ${locationContext}`}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-mint/25 bg-night/70 px-3 py-1 text-xs font-medium text-mint">
          <span className="h-2 w-2 rounded-full bg-mint" aria-hidden="true" />
          <span>Click a pin to view line-up</span>
        </div>
      </div>

      <div className="relative h-[460px] w-full sm:h-[520px]">
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

          {venues.map((venue) => (
            <Marker
              key={venue.id}
              position={[venue.latitude, venue.longitude]}
              icon={venueIcon}
            >
              <Popup>
                <div className="min-w-[260px] max-w-[300px] p-1">
                  <h3 className="mb-1 text-base font-bold text-foreground">
                    {venue.name}
                  </h3>
                  {venue.address ? (
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                      <span>{venue.address}</span>
                    </div>
                  ) : null}

                  <div className="mb-3 max-h-52 space-y-2.5 overflow-y-auto pr-1">
                    {venue.events.map((event) => {
                      const price = formatEventPrice(event)
                      return (
                        <div key={event.id} className="border-l-2 border-primary pl-2.5">
                          <Link
                            href={`/events/${event.slug}`}
                            className="block font-semibold text-foreground transition-colors hover:text-primary"
                          >
                            {event.title}
                          </Link>
                          <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" aria-hidden="true" />
                              {formatEventDate(event.start_time)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {formatEventTime(event.start_time)}
                            </span>
                            {price ? (
                              <span className="inline-flex items-center gap-0.5 font-medium text-primary">
                                <Euro className="h-3 w-3" aria-hidden="true" />
                                {price.replace(/^€/, '')}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge className="bg-primary/15 text-primary text-[11px]">
                              {eventTypeLabel(event.event_type)}
                            </Badge>
                            {event.music_genre &&
                            event.music_genre.toLowerCase() !==
                              eventTypeLabel(event.event_type).toLowerCase() ? (
                              <Badge variant="outline" className="text-[11px]">
                                {event.music_genre}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {venue.slug ? (
                    <Link href={`/venues/${venue.slug}`} className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-primary text-primary hover:bg-primary/10"
                      >
                        View Venue
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {!isLoading && venues.length === 0 ? (
        <div className="border-t border-border bg-card/80 p-6 text-center">
          <h3 className="mb-1 text-base font-bold text-foreground">
            {providedEvents && providedEvents.length > 0
              ? 'No map coordinates for matching events'
              : 'No mapped events match your filters'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {providedEvents && providedEvents.length > 0
              ? 'Switch back to Grid view to browse all matching events.'
              : `Try broadening your date, category, or county filters ${locationContext}.`}
          </p>
        </div>
      ) : null}
    </div>
  )
}
