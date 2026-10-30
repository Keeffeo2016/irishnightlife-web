import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Your Night Plan — IrishNightlife.ie',
  description: 'A personalised night-out itinerary from the IrishNightlife planner.',
  robots: { index: false, follow: false },
}

export default function PlannerPlanLayout({ children }: { children: ReactNode }) {
  return children
}
