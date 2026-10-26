import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Venues Across Ireland — IrishNightlife.ie',
  description:
    'Discover pubs, clubs, and live music venues across Ireland. Filter by county and venue type.',
  alternates: { canonical: '/venues' },
}

export default function VenuesLayout({ children }: { children: ReactNode }) {
  return children
}
