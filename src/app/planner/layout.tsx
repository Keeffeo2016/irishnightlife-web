import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Night Planner — IrishNightlife.ie',
  description:
    'Plan your night out in Ireland. Answer a few questions and get a real itinerary from live events.',
  alternates: { canonical: '/planner' },
}

export default function PlannerLayout({ children }: { children: ReactNode }) {
  return children
}
