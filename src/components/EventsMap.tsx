'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import type { EventCardEvent } from '@/components/EventCard'

const EventsMapDynamic = dynamic(() => import('./EventsMapInner'), {
  ssr: false,
  loading: () => (
    <div
      className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-mint/20 bg-mint/10">
        <MapPin className="h-6 w-6 text-mint" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-lg font-bold text-foreground">Loading interactive map…</h3>
      <p className="text-sm text-muted-foreground">Preparing venue pins and event details</p>
    </div>
  ),
})

export interface EventsMapProps {
  selectedCounty?: string
  events?: EventCardEvent[]
  loading?: boolean
}

export default function EventsMap({
  selectedCounty = 'Cork',
  events,
  loading,
}: EventsMapProps) {
  return (
    <EventsMapDynamic
      selectedCounty={selectedCounty}
      events={events}
      loading={loading}
    />
  )
}
