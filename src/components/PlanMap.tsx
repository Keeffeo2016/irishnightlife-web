'use client'

import dynamic from 'next/dynamic'

const PlanMapDynamic = dynamic(() => import('./PlanMapInner'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
      <h3 className="text-xl font-bold text-gray-900 mb-2">Loading map...</h3>
      <p className="text-gray-600">Preparing your route</p>
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
}

export default function PlanMap({ venues }: PlanMapProps) {
  if (venues.length === 0) {
    return null
  }

  return <PlanMapDynamic venues={venues} />
}
