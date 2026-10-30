'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'
import type { PlanMapProps, PlanMapVenue } from './PlanMapInner'

const PlanMapDynamic = dynamic(() => import('./PlanMapInner'), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      aria-live="polite"
      className="overflow-hidden rounded-2xl border border-border bg-card p-8 text-center shadow-lg"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-mint/25 bg-mint/10 text-mint">
        <MapPin className="h-6 w-6 animate-pulse motion-reduce:animate-none" aria-hidden="true" />
      </div>
      <h3 className="mb-1 text-lg font-bold text-foreground">Loading route map…</h3>
      <p className="text-sm text-muted-foreground">Plotting your planned stops</p>
    </div>
  ),
})

export type { PlanMapProps, PlanMapVenue }

export default function PlanMap({ venues, detailQuery }: PlanMapProps) {
  if (venues.length === 0) {
    return null
  }

  return <PlanMapDynamic venues={venues} detailQuery={detailQuery} />
}
