import Link from 'next/link'
import { Building2, Clock } from 'lucide-react'
import { getVenueDashboard } from '@/lib/venue-dashboard'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { buttonVariants } from '@/components/ui/button'
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
    <DashboardShell
      title="Create an event"
      subtitle="The venue name, address, price range, type, and about section are filled from your profile."
      actions={
        <Link
          href="/dashboard/events"
          className={buttonVariants({ variant: 'brand-outline-dark' })}
        >
          Cancel
        </Link>
      }
    >
      <div className="mx-auto w-full max-w-3xl">
        {venues.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center sm:p-8">
              <Building2 className="mx-auto h-8 w-8 text-mint" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-semibold text-foreground">
                Add your venue before creating an event
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Register your venue profile first so events can be linked to your location.
              </p>
              <Link
                href="/auth/complete-venue"
                className={`${buttonVariants({ variant: 'brand' })} mt-4 inline-flex`}
              >
                Add your venue
              </Link>
            </CardContent>
          </Card>
        ) : awaitingApproval ? (
          <Card className="border-amber-500/40 bg-card">
            <CardContent className="p-6">
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/15 p-4"
              >
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
                <div>
                  <AwaitingApprovalNotice className="text-sm font-medium text-amber-100" />
                  <p className="mt-1 text-xs text-amber-200/90">
                    You can still update your venue details and upload photos while your venue
                    awaits administrator approval.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <Link href="/dashboard" className="font-medium text-primary hover:underline">
                      Back to dashboard
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="font-medium text-amber-200 hover:underline"
                    >
                      Edit venue profile
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <CreateEventForm venues={approvedVenues} initialVenueId={venueId} />
        )}
      </div>
    </DashboardShell>
  )
}
