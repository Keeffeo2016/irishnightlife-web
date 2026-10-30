'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

const EventLocationMapInner = dynamic(() => import('./EventLocationMapInner'), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-64 items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground"
      aria-busy="true"
    >
      <MapPin className="mr-2 h-4 w-4 text-mint" aria-hidden="true" />
      Loading map
    </div>
  ),
})

export function EventLocationMap({
  latitude,
  longitude,
  name,
}: {
  latitude: number
  longitude: number
  name: string
}) {
  return <EventLocationMapInner latitude={latitude} longitude={longitude} name={name} />
}
