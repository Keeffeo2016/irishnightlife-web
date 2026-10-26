'use client'

import dynamic from 'next/dynamic'

const PlanMapDynamic = dynamic(() => import('./PlanMapInner'), {
  ssr: false,
  loading: () => (
    <div className="bg-card rounded-2xl border-2 border-border p-8 text-center">
      <h3 className="text-xl font-bold text-foreground mb-2">Loading map...</h3>
      <p className="text-muted-foreground">Preparing your route</p>
    </div>
  ),
})

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
  detailQuery?: string
}

export default function PlanMap({ venues, detailQuery }: PlanMapProps) {
  if (venues.length === 0) {
    return null
  }

  return <PlanMapDynamic venues={venues} detailQuery={detailQuery} />
}
