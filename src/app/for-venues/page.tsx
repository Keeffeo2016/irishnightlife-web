import type { Metadata } from 'next'
import ForVenuesPage from './ForVenuesPageClient'

export const metadata: Metadata = {
  title: 'For Venues — IrishNightlife.ie',
  description:
    'List your venue on IrishNightlife.ie. Reach nightlife enthusiasts across Ireland, get discovered, and grow footfall.',
  alternates: { canonical: '/for-venues' },
}

export default function Page() {
  return <ForVenuesPage />
}
