import Link from 'next/link'
import {
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileText,
  PlusCircle,
  Sparkles,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getOwnerViewCounts, getVenueDashboard } from '@/lib/venue-dashboard'
import {
  computeDashboardEventMetrics,
  DASHBOARD_GENERIC_LOAD_ERROR,
  formatDashboardDateTime,
} from '@/lib/dashboard-validation'
import { eventTypeLabel, formatEventPrice } from '@/components/EventCard'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { AwaitingApprovalNotice } from '@/components/AwaitingApprovalNotice'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const instant = false

interface VenueEventItem {
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

export default async function VenueEventsPage() {
  const { venues } = await getVenueDashboard('/dashboard/events')
  const supabase = await createClient()
  const venueList = venues
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
      : Promise.resolve({ data: [] as VenueEventItem[] }),
    getCurrentIsoTimestamp(),
  ])

  const eventsLoadFailed =
    venueIds.length > 0 && 'error' in eventsResult && Boolean(eventsResult.error)
  const events = eventsLoadFailed ? [] : ((eventsResult.data ?? []) as VenueEventItem[])
  const metrics = computeDashboardEventMetrics(events, nowIso)
  const viewCounts = await getOwnerViewCounts(
    supabase,
    events.map((event) => `/events/${event.slug}`)
  )

  return (
    <DashboardShell
      title="Events"
      subtitle="Manage upcoming and past events across your venues"
      actions={
        approvedVenues.length > 0 ? (
          <Link
            href="/dashboard/events/new"
            className={cn(buttonVariants({ variant: 'brand' }), 'gap-1.5')}
          >
            <PlusCircle className="h-4 w-4" aria-hidden="true" />
            <span>Create event</span>
          </Link>
        ) : null
      }
    >
      <div className="space-y-6">
        {eventsLoadFailed ? (
          <div
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
          >
            {DASHBOARD_GENERIC_LOAD_ERROR}
          </div>
        ) : (
        <div
          aria-label="Event summary counts"
          className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3"
        >
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
            <span>{metrics.total} Total</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-mint">
            <span>{metrics.upcomingCount} Upcoming</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground/90">
            <CheckCircle2 className="h-3.5 w-3.5 text-mint" aria-hidden="true" />
            <span>{metrics.publishedCount} Published</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-amber-200">
            <FileText className="h-3.5 w-3.5 text-amber-300" aria-hidden="true" />
            <span>{metrics.draftCount} Drafts</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span>{metrics.earlierCount} Past</span>
          </span>
        </div>
        )}

        <Card className="border-border bg-card">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">Upcoming events</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Events starting from now onwards (Europe/Dublin timezone)
                </p>
              </div>
              {approvedVenues.length > 0 ? (
                <Link
                  href="/dashboard/events/new"
                  className={cn(buttonVariants({ variant: 'brand', size: 'sm' }), 'gap-1.5')}
                >
                  <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Create event</span>
                </Link>
              ) : venueList.length > 0 ? (
                <AwaitingApprovalNotice className="max-w-xs text-right text-xs text-amber-200" />
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {eventsLoadFailed ? (
              <p className="text-sm text-muted-foreground">{DASHBOARD_GENERIC_LOAD_ERROR}</p>
            ) : venueList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-center">
                <Building2
                  className="mx-auto h-7 w-7 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-2 font-semibold text-foreground">
                  No venue is linked to this account yet
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your venue details first so you can publish events on IrishNightlife.
                </p>
                <Link
                  href="/auth/complete-venue"
                  className={cn(
                    buttonVariants({ variant: 'brand' }),
                    'mt-4 inline-flex gap-1.5'
                  )}
                >
                  <span>Add your venue</span>
                </Link>
              </div>
            ) : metrics.upcoming.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/50 p-8 text-center">
                <Sparkles className="mx-auto h-7 w-7 text-mint/70" aria-hidden="true" />
                <p className="mt-2 font-semibold text-foreground">
                  No upcoming events for your venues
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {approvedVenues.length > 0
                    ? 'Create an event to feature your next gig, club night, or special session.'
                    : 'Event creation will unlock as soon as your venue is verified.'}
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
              <EventList
                events={metrics.upcoming}
                venueNames={venueNames}
                viewCounts={viewCounts}
              />
            )}
          </CardContent>
        </Card>

        {metrics.earlier.length > 0 ? (
          <Card className="border-border bg-card">
            <CardHeader className="border-b border-border/60 pb-4">
              <h2 className="text-lg font-bold text-foreground">Past events</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Previously scheduled events (most recent first)
              </p>
            </CardHeader>
            <CardContent className="p-5">
              <EventList
                events={metrics.earlier}
                venueNames={venueNames}
                viewCounts={viewCounts}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </DashboardShell>
  )
}

function EventList({
  events,
  venueNames,
  viewCounts,
}: {
  events: VenueEventItem[]
  venueNames: Map<string, string>
  viewCounts: Map<string, number>
}) {
  return (
    <ul className="divide-y divide-border">
      {events.map((event) => {
        const price = formatEventPrice(event)
        const views = viewCounts.get(`/events/${event.slug}`) ?? 0
        const venueName = venueNames.get(event.venue_id) ?? 'Your venue'

        return (
          <li
            key={event.id}
            className="flex flex-col justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
          >
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/events/${event.slug}`}
                  className="text-base font-semibold text-foreground hover:text-mint hover:underline"
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
                <span className="font-medium text-foreground/90">{venueName}</span>
                {price ? (
                  <>
                    <span>·</span>
                    <span className="font-medium text-mint">{price}</span>
                  </>
                ) : null}
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  {views.toLocaleString('en-IE')} {views === 1 ? 'view' : 'views'}
                </span>
              </div>
            </div>

            <div className="shrink-0">
              <Link
                href={`/events/${event.slug}`}
                className={cn(
                  buttonVariants({ variant: 'brand-outline', size: 'sm' }),
                  'gap-1.5 text-xs'
                )}
              >
                <span>View event page</span>
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
