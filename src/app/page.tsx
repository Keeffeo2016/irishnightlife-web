import type { Metadata } from 'next'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = {
  title: 'IrishNightlife.ie — Find Your Night',
  description:
    "Ireland's nightlife discovery platform. Find live music, events, and the best nights out in Dublin, Cork, Galway and beyond.",
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return <HomePageClient />
}
