import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Clock, ExternalLink, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { viewerManagesVenue } from '@/lib/venue-access'
import { BackToPlanner } from '@/components/BackToPlanner'
import { plannerPlanHref, preservePlannerOrigin } from '@/lib/planner'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { FavoriteButton } from '@/components/FavoriteButton'
import { ShareEventButtons } from '@/components/ShareEventButtons'
import { EventCard, eventTypeLabel, formatEventPrice, formatEventTime, type EventCardEvent } from '@/components/EventCard'
import { EventLocationMap } from '@/components/events/EventLocationMap'
import { buildEventJsonLd } from '@/lib/event-jsonld'
import { directionsHref, safeExternalUrl } from '@/lib/safe-external-url'
import { venueTypeLabel } from '@/lib/venue-profile'
import { cn } from 'cn'

export const instant = false

interface EventPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

interface VenueRow {
  id: string
  name: string
  slug: string
  owner_id: string | null
  is_verified: boolean
  description: string | null
  venue_type: string | null
  address: string | null
  city: string | null
  county: string | null
  postcode: string | null
  latitude: number | null
  longitude: number | null
  images: string[] | null
  price_range: string | null
}

interface EventRow {
  id: string
  title: string
  slug: string
  description: string | null
  event_type: string | null
  start_time: string
  end_time: string | null
  price_min: number | null
  price_max: number | null
  is_free: boolean
  image_url: string | null
  ticket_url: string | null
  age_restriction: string | null
  music_genre: string | null
  is_published: boolean
  venue_id: string
  venues: VenueRow | VenueRow[] | null
}

function oneVenue(venues: EventRow['venues']): VenueRow | null {
  if (!venues) return null
  return Array.isArray(venues) ? venues[0] ?? null : venues
}

function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000'
  try {
    return new URL(raw).origin
  } catch {
    return 'http://localhost:3000'
  }
}

function pickImage(imageUrl: string | null, images: string[] | null | undefined) {
  const direct = imageUrl?.trim()
  if (direct) return direct
  if (!Array.isArray(images)) return null
  const venueImage = images.find((image) => typeof image === 'string' && image.trim().length > 0)
  return venueImage?.trim() ?? null
}

function absoluteImage(src: string | null) {
  if (!src) return null
  try {
    return new URL(src, siteOrigin()).toString()
  } catch {
    return null
  }
}

function formatLongDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-IE', {
    timeZone: 'Europe/Dublin',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function locationLabel(venue: VenueRow) {
  const city = venue.city?.trim()
  const county = venue.county?.trim()
  if (city && county && city.toLowerCase() !== county.toLowerCase()) {
    return `${city}, Co. ${county}`
  }
  return city || county || ''
}

async function loadEvent(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      venues (
        id,
        name,
        slug,
        owner_id,
        is_verified,
        description,
        venue_type,
        address,
        city,
        county,
        postcode,
        latitude,
        longitude,
        images,
        price_range
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  const event = data as EventRow
  const venue = oneVenue(event.venues)
  if (!venue) return null

  const publiclyVisible = Boolean(venue.is_verified && event.is_published)
  const managed = await viewerManagesVenue(supabase, venue.owner_id)
  if (!publiclyVisible && !managed) return null

  return { event, venue, publiclyVisible, supabase }
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadEvent(slug)
  if (!loaded?.publiclyVisible) {
    return { title: 'Event — IrishNightlife.ie' }
  }

  const { event, venue } = loaded
  const origin = siteOrigin()
  const canonical = `${origin}/events/${event.slug}`
  const description =
    event.description?.trim() ||
    `${event.title} at ${venue.name}${venue.county ? ` in ${venue.county}` : ''}.`
  const image = absoluteImage(pickImage(event.image_url, venue.images))

  return {
    title: `${event.title} — IrishNightlife.ie`,
    description,
    alternates: { canonical },
    openGraph: {
      title: event.title,
      description,
      url: canonical,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
  }
}

function toCardEvent(row: EventRow, venue: VenueRow): EventCardEvent {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description ?? '',
    event_type: row.event_type ?? 'live_music',
    start_time: row.start_time,
    end_time: row.end_time,
    price_min: row.price_min,
    price_max: row.price_max,
    is_free: row.is_free,
    music_genre: row.music_genre ?? '',
    image_url: row.image_url,
    venues: {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      county: venue.county ?? '',
      city: venue.city,
      address: venue.address,
      latitude: venue.latitude,
      longitude: venue.longitude,
      images: venue.images,
    },
  }
}

async function relatedEvents(current: EventRow, venue: VenueRow) {
  const supabase = await createClient()
  const nowIso = new Date().toISOString()
  const select = `
    id, title, slug, description, event_type, start_time, end_time,
    price_min, price_max, is_free, music_genre, image_url,
    venues!inner (
      id, name, slug, county, city, address, latitude, longitude, images, is_verified
    )
  `

  const { data: sameVenue } = await supabase
    .from('events')
    .select(select)
    .eq('is_published', true)
    .eq('venues.is_verified', true)
    .eq('venue_id', current.venue_id || venue.id)
    .neq('id', current.id)
    .gte('start_time', nowIso)
    .order('start_time', { ascending: true })
    .limit(3)

  const primary = ((sameVenue ?? []) as EventRow[])
    .map((row) => {
      const rowVenue = oneVenue(row.venues)
      return rowVenue ? toCardEvent(row, rowVenue) : null
    })
    .filter((row): row is EventCardEvent => row !== null)

  if (primary.length >= 3 || !venue.county) return primary

  const exclude = new Set([current.id, ...primary.map((row) => row.id)])
  const { data: sameCounty } = await supabase
    .from('events')
    .select(select)
    .eq('is_published', true)
    .eq('venues.is_verified', true)
    .eq('venues.county', venue.county)
    .gte('start_time', nowIso)
    .order('start_time', { ascending: true })
    .limit(8)

  const extra = ((sameCounty ?? []) as EventRow[])
    .filter((row) => !exclude.has(row.id))
    .map((row) => {
      const rowVenue = oneVenue(row.venues)
      return rowVenue ? toCardEvent(row, rowVenue) : null
    })
    .filter((row): row is EventCardEvent => row !== null)
    .slice(0, 3 - primary.length)

  return [...primary, ...extra]
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { slug } = await params
  const query = await searchParams
  const loaded = await loadEvent(slug)
  if (!loaded) notFound()

  const { event, venue, publiclyVisible } = loaded
  const planHref = plannerPlanHref(query)
  const venueHref = preservePlannerOrigin(`/venues/${venue.slug}`, query)
  const image = pickImage(event.image_url, venue.images)
  const price = formatEventPrice(event)
  const ticketUrl = safeExternalUrl(event.ticket_url)
  const directions = directionsHref(venue)
  const hasCoordinates =
    typeof venue.latitude === 'number' &&
    Number.isFinite(venue.latitude) &&
    typeof venue.longitude === 'number' &&
    Number.isFinite(venue.longitude)
  const dateLabel = formatLongDate(event.start_time)
  const startLabel = formatEventTime(event.start_time)
  const endLabel = event.end_time ? formatEventTime(event.end_time) : ''
  const place = locationLabel(venue)
  const typeLabel = eventTypeLabel(event.event_type)
  const addressLine = [venue.address, venue.city, venue.county, venue.postcode].filter(Boolean).join(', ')
  const related = publiclyVisible ? await relatedEvents(event, venue) : []
  const origin = siteOrigin()
  const jsonLd = publiclyVisible
    ? buildEventJsonLd({
        name: event.title,
        description: event.description,
        startDate: event.start_time,
        endDate: event.end_time,
        url: `${origin}/events/${event.slug}`,
        image: absoluteImage(image),
        venueName: venue.name,
        streetAddress: venue.address,
        addressLocality: venue.city,
        addressRegion: venue.county,
      })
    : null

  return (
    <div className={cn('bg-background', ticketUrl && 'pb-28 md:pb-0')}>
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}
      <BackToPlanner href={planHref} />

      <section className="border-b border-border bg-night">
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-night via-night-soft to-forest sm:aspect-[21/9]">
            {image ? (
              <img
                src={image}
                alt={event.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-end p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">{typeLabel}</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/35 to-night/10" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <Badge className="border border-mint/30 bg-night/80 text-mint">{typeLabel}</Badge>
              <h1 className="mt-3 max-w-3xl text-balance text-3xl font-bold text-white sm:text-5xl">{event.title}</h1>
              <p className="mt-3 text-sm text-foreground/85 sm:text-base">
                {dateLabel}
                {startLabel ? ` · ${startLabel}` : ''}
                {place ? ` · ${place}` : ''}
              </p>
              <p className="mt-1 text-sm text-mint">
                <Link href={venueHref} className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  {venue.name}
                </Link>
                {price ? <span className="text-foreground/80"> · {price === 'Free' ? 'Free entry' : price}</span> : null}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-8 lg:col-span-2">
          <section aria-labelledby="about-heading" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 id="about-heading" className="text-2xl font-bold text-foreground">About this event</h2>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
              {event.description?.trim() || 'The organiser has not added a description yet.'}
            </p>
            {event.music_genre?.trim() ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Music genre <span className="font-medium text-foreground">{event.music_genre}</span>
              </p>
            ) : null}
            {event.age_restriction?.trim() ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Age <span className="font-medium text-foreground">{event.age_restriction}</span>
              </p>
            ) : null}
          </section>

          <section aria-labelledby="when-heading" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 id="when-heading" className="text-2xl font-bold text-foreground">Date and time</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <p className="flex items-start gap-3 text-foreground">
                <Calendar className="mt-0.5 h-5 w-5 text-mint" aria-hidden="true" />
                <span>
                  <span className="block text-sm text-muted-foreground">Date</span>
                  {dateLabel || 'Date to be confirmed'}
                </span>
              </p>
              <p className="flex items-start gap-3 text-foreground">
                <Clock className="mt-0.5 h-5 w-5 text-mint" aria-hidden="true" />
                <span>
                  <span className="block text-sm text-muted-foreground">Start time</span>
                  {startLabel || 'Time to be confirmed'}
                  {endLabel ? ` – ${endLabel}` : ''}
                  <span className="block text-xs text-muted-foreground">Irish time</span>
                </span>
              </p>
            </div>
          </section>

          <section aria-labelledby="venue-heading" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 id="venue-heading" className="text-2xl font-bold text-foreground">Venue</h2>
            {pickImage(null, venue.images) ? (
              <img
                src={pickImage(null, venue.images) ?? ''}
                alt={`${venue.name} photograph`}
                className="mt-4 aspect-video w-full rounded-xl object-cover"
              />
            ) : null}
            <h3 className="mt-4 text-xl font-semibold text-foreground">{venue.name}</h3>
            {place ? <p className="mt-1 text-muted-foreground">{place}</p> : null}
            <dl className="mt-4 space-y-2 text-sm">
              {venue.venue_type ? (
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="text-foreground">{venueTypeLabel(venue.venue_type)}</dd>
                </div>
              ) : null}
              {venue.price_range ? (
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Price range</dt>
                  <dd className="text-foreground">{venue.price_range}</dd>
                </div>
              ) : null}
            </dl>
            {venue.description?.trim() ? (
              <p className="mt-4 text-muted-foreground">{venue.description}</p>
            ) : null}
            <Link href={venueHref} className={cn(buttonVariants({ variant: 'brand-outline' }), 'mt-5 inline-flex min-h-11')}>
              View venue profile
            </Link>
          </section>

          <section aria-labelledby="location-heading" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 id="location-heading" className="text-2xl font-bold text-foreground">Location and directions</h2>
            {addressLine ? (
              <p className="mt-4 flex items-start gap-2 text-foreground">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-mint" aria-hidden="true" />
                <span>{addressLine}</span>
              </p>
            ) : (
              <p className="mt-4 text-muted-foreground">This venue has not published an address yet.</p>
            )}
            {hasCoordinates ? (
              <div className="mt-4">
                <EventLocationMap latitude={venue.latitude as number} longitude={venue.longitude as number} name={venue.name} />
              </div>
            ) : null}
            {directions ? (
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: 'outline' }), 'mt-4 inline-flex min-h-11 gap-2')}
              >
                Get directions
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Opens OpenStreetMap in a new tab</span>
              </a>
            ) : null}
          </section>

          {related.length > 0 ? (
            <section aria-labelledby="related-heading">
              <h2 id="related-heading" className="mb-4 text-2xl font-bold text-foreground">Related events</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {related.map((item) => (
                  <EventCard
                    key={item.id}
                    event={item}
                    href={preservePlannerOrigin(`/events/${item.slug}`, query)}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:col-span-1">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-foreground">Tickets</h2>
            {price ? (
              <p className="text-2xl font-bold text-foreground">{price === 'Free' ? 'Free entry' : price}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Price not listed.</p>
            )}
            {ticketUrl ? (
              <>
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'brand' }), 'inline-flex min-h-11 w-full gap-2')}
                >
                  Get tickets
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Opens the ticket provider in a new tab</span>
                </a>
                <p className="text-sm text-muted-foreground">
                  Booking happens on the ticket provider’s site, outside IrishNightlife.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tickets are not sold on IrishNightlife. Check the venue for how to get in.
              </p>
            )}
            <FavoriteButton eventId={event.id} label={event.title} className="w-full" />
            <div className="border-t border-border pt-4">
              <h2 className="mb-3 text-base font-semibold text-foreground">Share this event</h2>
              <ShareEventButtons title={event.title} venueName={venue.name} slug={event.slug} />
            </div>
          </div>
        </aside>
      </div>

      {ticketUrl ? (
        <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-night/95 px-4 py-3 backdrop-blur md:hidden">
          <a
            href={ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: 'brand' }), 'inline-flex min-h-11 w-full gap-2')}
          >
            Get tickets
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <p className="mt-1 text-center text-xs text-muted-foreground">Booked on the ticket provider’s site</p>
        </div>
      ) : null}
    </div>
  )
}
