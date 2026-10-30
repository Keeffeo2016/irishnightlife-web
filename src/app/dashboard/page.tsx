import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Image as ImageIcon,
  MapPin,
  PlusCircle,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOwnerViewCounts, getVenueDashboard } from '@/lib/venue-dashboard'
import {
  computeDashboardEventMetrics,
  DASHBOARD_GENERIC_LOAD_ERROR,
  formatDashboardDateTime,
  isVenueProfileComplete,
} from '@/lib/dashboard-validation'
import { MAX_VENUE_IMAGES, formatVenueAddress, venueTypeLabel } from '@/lib/venue-profile'
import { eventTypeLabel, formatEventPrice } from '@/components/EventCard'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { AwaitingApprovalNotice } from '@/components/AwaitingApprovalNotice'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const instant = false

interface DashboardEventRow {
  id: string
  title: string
  slug: string
  event_type: string
  start_time: string
  end_time: string | null
  price_min: number | null
  price_max: number | null
  is_free: boolean
  is_published: boolean
  venue_id: string
}

async function getCurrentIsoTimestamp(): Promise<string> {
  return new Date().toISOString()
}

export default async function VenueDashboard() {
  const { profile, venues } = await getVenueDashboard()
  const supabase = await createClient()
  const venueList = venues
  const pendingVenues = venueList.filter((venue) => !venue.is_verified)
  const approvedVenues = venueList.filter((venue) => venue.is_verified)
  const venueIds = venueList.map((venue) => venue.id)
  const venueNames = new Map(venueList.map((venue) => [venue.id, venue.name]))

  const [eventsResult, nowIso] = await Promise.all([
    venueIds.length > 0
      ? supabase
          .from('events')
          .select(
            'id, title, slug, event_type, start_time, end_time, price_min, price_max, is_free, is_published, venue_id'
          )
          .in('venue_id', venueIds)
          .order('start_time', { ascending: true })
      : Promise.resolve({ data: [] as DashboardEventRow[] }),
    getCurrentIsoTimestamp(),
  ])

  const eventsLoadFailed =
    venueIds.length > 0 && 'error' in eventsResult && Boolean(eventsResult.error)
  const allEvents = eventsLoadFailed ? [] : ((eventsResult.data ?? []) as DashboardEventRow[])
  const metrics = computeDashboardEventMetrics(allEvents, nowIso)

  const viewPaths = [
    ...venueList.map((venue) => `/venues/${venue.slug}`),
    ...allEvents.map((event) => `/events/${event.slug}`),
  ]
  const viewCounts = await getOwnerViewCounts(supabase, viewPaths)
  const venueViews = venueList.reduce(
    (total, venue) => total + (viewCounts.get(`/venues/${venue.slug}`) ?? 0),
    0
  )
  const eventViews = allEvents.reduce(
    (total, event) => total + (viewCounts.get(`/events/${event.slug}`) ?? 0),
    0
  )
  const heading = venueList[0]?.name ?? profile?.full_name ?? 'Your venue'

  return (
    <DashboardShell
      title="Venue dashboard"
      subtitle={heading}
      actions={
        approvedVenues.length > 0 ? (
          <Link
            href="/dashboard/events/new"
            className={cn(buttonVariants({ variant: 'brand' }), 'gap-1.5')}
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span>Add event</span>
          </Link>
        ) : null
      }
    >
      <div className="space-y-8">
        {pendingVenues.length > 0 ? (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100"
          >
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <p className="font-semibold text-amber-200">
                Verification in progress for{' '}
                {pendingVenues.map((venue) => venue.name).join(', ')}
              </p>
              <p className="mt-1 text-amber-100/90">
                {pendingVenues.length === 1 ? 'This venue stays' : 'These venues stay'} off the
                public directory and cannot publish events until approved by an administrator. You
                can still complete your venue profile and upload photos in the meantime.
              </p>
            </div>
          </div>
        ) : null}

        {venueList.length === 0 ? (
          <Card className="border-primary/30 bg-card/90">
            <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-mint">
                  GET STARTED
                </p>
                <h2 className="text-xl font-bold text-foreground">
                  No venue is linked to your account yet
                </h2>
                <p className="text-sm text-muted-foreground">
                  Register your venue details so our team can verify your listing and enable event
                  publishing.
                </p>
              </div>
              <Link
                href="/auth/complete-venue"
                className={cn(buttonVariants({ variant: 'brand' }), 'shrink-0 gap-1.5')}
              >
                <Building2 className="h-4 w-4" aria-hidden="true" />
                <span>Register your venue</span>
              </Link>
            </CardContent>
          </Card>
        ) : null}

        {eventsLoadFailed ? (
          <div
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
          >
            {DASHBOARD_GENERIC_LOAD_ERROR}
          </div>
        ) : null}

        <section aria-label="Dashboard summary metrics">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {eventsLoadFailed ? null : (
              <>
            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Upcoming events
                  </p>
                  <Calendar className="h-4 w-4 text-mint" aria-hidden="true" />
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {metrics.upcomingCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metrics.total} total {metrics.total === 1 ? 'event' : 'events'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Published events
                  </p>
                  <CheckCircle2 className="h-4 w-4 text-mint" aria-hidden="true" />
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {metrics.publishedCount}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metrics.draftCount} {metrics.draftCount === 1 ? 'draft' : 'drafts'}
                </p>
              </CardContent>
            </Card>
              </>
            )}

            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Venue profile views
                  </p>
                  <Building2 className="h-4 w-4 text-mint" aria-hidden="true" />
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {venueViews.toLocaleString('en-IE')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Across {venueList.length} {venueList.length === 1 ? 'venue' : 'venues'}
                </p>
              </CardContent>
            </Card>

            {eventsLoadFailed ? null : (
            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Event page views
                  </p>
                  <Eye className="h-4 w-4 text-mint" aria-hidden="true" />
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {eventViews.toLocaleString('en-IE')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Recorded on public event pages
                </p>
              </CardContent>
            </Card>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Upcoming events</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Scheduled nights across your managed venues (Europe/Dublin time)
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/dashboard/events"
                      className={cn(
                        buttonVariants({ variant: 'brand-outline', size: 'sm' }),
                        'gap-1'
                      )}
                    >
                      <span>View all events</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                    {approvedVenues.length > 0 ? (
                      <Link
                        href="/dashboard/events/new"
                        className={cn(buttonVariants({ variant: 'brand', size: 'sm' }), 'gap-1')}
                      >
                        <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Create event</span>
                      </Link>
                    ) : null}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5">
                {venueList.length > 0 && approvedVenues.length === 0 ? (
                  <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5">
                    <AwaitingApprovalNotice className="text-xs text-amber-200" />
                  </div>
                ) : null}

                {eventsLoadFailed ? (
                  <p className="text-sm text-muted-foreground">{DASHBOARD_GENERIC_LOAD_ERROR}</p>
                ) : metrics.upcoming.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                    <Sparkles className="mx-auto h-7 w-7 text-mint/70" aria-hidden="true" />
                    <p className="mt-2 font-semibold text-foreground">
                      No upcoming events for your venues
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {approvedVenues.length > 0
                        ? 'Publish your next gig, DJ set, pub quiz, or special night so visitors can discover it.'
                        : 'Once your venue is verified, you can start creating events from here.'}
                    </p>
                    {approvedVenues.length > 0 ? (
                      <Link
                        href="/dashboard/events/new"
                        className={cn(
                          buttonVariants({ variant: 'brand' }),
                          'mt-4 inline-flex gap-1.5'
                        )}
                      >
                        <PlusCircle className="h-4 w-4" aria-hidden="true" />
                        <span>Create your first event</span>
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {metrics.upcoming.map((event) => {
                      const price = formatEventPrice(event)
                      const views = viewCounts.get(`/events/${event.slug}`) ?? 0
                      const venueName = venueNames.get(event.venue_id) ?? 'Your venue'

                      return (
                        <li
                          key={event.id}
                          className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/events/${event.slug}`}
                                className="font-semibold text-foreground hover:text-mint hover:underline"
                              >
                                {event.title}
                              </Link>
                              {event.is_published ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-mint">
                                  <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                                  <span>Published</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-200">
                                  <FileText className="h-3 w-3 shrink-0" aria-hidden="true" />
                                  <span>Draft</span>
                                </span>
                              )}
                              <Badge
                                variant="outline"
                                className="border-border bg-background/60 text-xs text-muted-foreground"
                              >
                                {eventTypeLabel(event.event_type)}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-mint/80" aria-hidden="true" />
                                {formatDashboardDateTime(event.start_time)}
                              </span>
                              <span>·</span>
                              <span>{venueName}</span>
                              {price ? (
                                <>
                                  <span>·</span>
                                  <span className="font-medium text-foreground/90">{price}</span>
                                </>
                              ) : null}
                              <span>·</span>
                              <span>{views.toLocaleString('en-IE')} views</span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <Link
                              href={`/events/${event.slug}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                            >
                              <span>View event</span>
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </Link>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border/60 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-bold text-foreground">Managed venues</h2>
                  <Badge variant="outline" className="border-border text-xs text-muted-foreground">
                    {venueList.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-5">
                {venueList.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Once you register a venue, its verification status and profile completeness will
                    appear here.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {venueList.map((venue) => {
                      const completeness = isVenueProfileComplete(venue)
                      const photoCount = venue.images?.length ?? 0
                      const typeLabel = venueTypeLabel(venue.venue_type)
                      const views = viewCounts.get(`/venues/${venue.slug}`) ?? 0

                      return (
                        <div
                          key={venue.id}
                          className="rounded-xl border border-border bg-background/60 p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-foreground">{venue.name}</h3>
                            {venue.is_verified ? (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-mint">
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-200">
                                <Clock className="h-3 w-3" aria-hidden="true" />
                                <span>Awaiting approval</span>
                              </span>
                            )}
                          </div>

                          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <MapPin
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint/80"
                              aria-hidden="true"
                            />
                            <span>{formatVenueAddress(venue)}</span>
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {typeLabel ? (
                              <span className="rounded-md border border-border bg-card px-2 py-0.5 text-foreground/90">
                                {typeLabel}
                              </span>
                            ) : null}
                            {venue.price_range ? (
                              <span className="rounded-md border border-border bg-card px-2 py-0.5 text-foreground/90">
                                {venue.price_range}
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-0.5">
                              <ImageIcon className="h-3 w-3 text-mint/80" aria-hidden="true" />
                              <span>
                                {photoCount} / {MAX_VENUE_IMAGES} photos
                              </span>
                            </span>
                            <span>{views.toLocaleString('en-IE')} views</span>
                          </div>

                          <div className="rounded-lg border border-border/80 bg-card/70 px-3 py-2 text-xs">
                            {completeness.complete ? (
                              <p className="flex items-center gap-1.5 font-medium text-mint">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                <span>Profile complete</span>
                              </p>
                            ) : (
                              <div>
                                <p className="font-medium text-amber-200">
                                  Complete your profile ({completeness.missing.join(', ')})
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-medium">
                            <Link
                              href="/dashboard/profile"
                              className="text-primary hover:underline"
                            >
                              Edit venue profile
                            </Link>
                            <Link
                              href={`/venues/${venue.slug}`}
                              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline"
                            >
                              <span>View public profile</span>
                              <ExternalLink className="h-3 w-3" aria-hidden="true" />
                            </Link>
                            {venue.is_verified ? (
                              <Link
                                href={`/dashboard/events/new?venue=${venue.id}`}
                                className="text-mint hover:underline"
                              >
                                Add event
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
