import Link from 'next/link'
import { getVenueDashboard } from '@/lib/venue-dashboard'
import { buttonVariants } from '@/components/ui/button'
import { PageHero } from '@/components/layout/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { AwaitingApprovalNotice } from '@/components/AwaitingApprovalNotice'
import { CreateEventForm } from './CreateEventForm'

export const instant = false

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ venue?: string }>
}) {
  const { venue: venueId } = await searchParams
  const { venues } = await getVenueDashboard('/dashboard/events/new')
  const approvedVenues = venues.filter((venue) => venue.is_verified)
  const requestedVenue = venues.find((venue) => venue.id === venueId)
  const awaitingApproval =
    venues.length > 0 &&
    (approvedVenues.length === 0 || (requestedVenue != null && !requestedVenue.is_verified))

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        align="left"
        compact
        showMap={false}
        title="Create an event"
        subtitle="The venue name, address, price range, type, and about section are filled from your profile."
        actions={
          <Link href="/dashboard/events" className={buttonVariants({ variant: 'brand-outline-dark' })}>
            Cancel
          </Link>
        }
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            {venues.length === 0 ? (
              <p className="text-muted-foreground">
                Add your venue before creating an event.{' '}
                <Link href="/auth/complete-venue" className="text-primary hover:underline">
                  Add your venue
                </Link>
              </p>
            ) : awaitingApproval ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/15 px-4 py-3">
                <AwaitingApprovalNotice />
                <Link href="/dashboard" className="mt-3 inline-block text-sm text-primary hover:underline">
                  Back to dashboard
                </Link>
              </div>
            ) : (
              <CreateEventForm venues={approvedVenues} initialVenueId={venueId} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
