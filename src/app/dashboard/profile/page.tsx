import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOwnerViewCounts, getVenueDashboard } from '@/lib/venue-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHero } from '@/components/layout/PageHero'
import { SignOutButton } from '@/app/profile/SignOutButton'
import { VenueProfileForm } from '../VenueProfileForm'

export const instant = false

export default async function VenueProfilePage() {
  const { user, profile, venues } = await getVenueDashboard('/dashboard/profile')
  const supabase = await createClient()
  const viewCounts = await getOwnerViewCounts(
    supabase,
    venues.map((venue) => `/venues/${venue.slug}`),
  )
  const heading = venues[0]?.name ?? profile?.full_name ?? 'Your venue'

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        align="left"
        compact
        showMap={false}
        title="Venue profile"
        subtitle={heading}
        actions={<SignOutButton />}
      />
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Your venues</CardTitle>
          </CardHeader>
          <CardContent>
            {venues.length === 0 ? (
              <p className="text-muted-foreground">
                No venue is linked to this account yet.{' '}
                <Link href="/auth/complete-venue" className="text-primary hover:underline">
                  Add your venue
                </Link>
              </p>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
