import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Events Across Ireland — IrishNightlife.ie',
  description:
    'Browse live music, club nights, comedy, and more across Ireland. Filter by county, date, and vibe.',
  alternates: { canonical: '/events' },
}

export default function EventsLayout({ children }: { children: ReactNode }) {
  return children
}
