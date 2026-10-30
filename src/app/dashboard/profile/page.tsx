import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOwnerViewCounts, getVenueDashboard } from '@/lib/venue-dashboard'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { VenueProfileForm } from '../VenueProfileForm'

export const instant = false

export default async function VenueProfilePage() {
  const { user, profile, venues } = await getVenueDashboard('/dashboard/profile')
  const supabase = await createClient()
  const viewCounts = await getOwnerViewCounts(
    supabase,
    venues.map((venue) => `/venues/${venue.slug}`)
  )
  const heading = venues[0]?.name ?? profile?.full_name ?? 'Your venue'

  return (
    <DashboardShell
      title="Venue profile"
      subtitle={`Manage public listing details, policies, and photography for ${heading}`}
    >
      {venues.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-6 text-center sm:p-8">
            <Building2 className="mx-auto h-8 w-8 text-mint" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-semibold text-foreground">
              No venue is linked to this account yet
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your venue details to create your public profile on IrishNightlife.
            </p>
            <Link
              href="/auth/complete-venue"
              className={`${buttonVariants({ variant: 'brand' })} mt-4 inline-flex`}
            >
              Add your venue
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {venues.map((venue) => (
            <VenueProfileForm
              key={venue.id}
              venue={venue}
              ownerId={user.id}
              viewCount={viewCounts.get(`/venues/${venue.slug}`) ?? 0}
            />
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
