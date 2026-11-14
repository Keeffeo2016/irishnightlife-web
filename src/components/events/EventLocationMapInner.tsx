'use client'

import { Icon } from 'leaflet'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { DARK_MAP_CLASS, MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from '@/lib/map-tiles'

const pin = new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 26 16 26s16-14 16-26C32 7.16 24.84 0 16 0z" fill="#64f4c2"/>
      <circle cx="16" cy="16" r="8" fill="#1a2428"/>
    </svg>
  `)}`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
})

export default function EventLocationMapInner({
  latitude,
  longitude,
  name,
}: {
  latitude: number
  longitude: number
  name: string
}) {
  return (
    <div className={`overflow-hidden rounded-xl border border-border ${DARK_MAP_CLASS}`} aria-label={`Map showing ${name}`}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={16}
        scrollWheelZoom={false}
        className="h-64 w-full"
      >
        <TileLayer
          attribution={MAP_TILE_ATTRIBUTION}
          url={MAP_TILE_URL}
        />
        <Marker position={[latitude, longitude]} icon={pin} title={name} />
      </MapContainer>
    </div>
  )
}
