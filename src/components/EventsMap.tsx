'use client'

import dynamic from 'next/dynamic'

// Dynamically import the map component with SSR disabled
const EventsMapDynamic = dynamic(() => import('./EventsMapInner'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">🗺️</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Loading map...</h3>
      <p className="text-gray-600">Finding venues with events today</p>
    </div>
  ),
})

interface EventsMapProps {
  selectedCounty?: string
}

export default function EventsMap({ selectedCounty = 'Cork' }: EventsMapProps) {
  return <EventsMapDynamic selectedCounty={selectedCounty} />
}
