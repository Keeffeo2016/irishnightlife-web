import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Music,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react'
import { cn } from 'cn'
import { createClient } from '@/lib/supabase/server'
import { viewerManagesVenue } from '@/lib/venue-access'
import { BackToPlanner } from '@/components/BackToPlanner'
import { plannerPlanHref, preservePlannerOrigin } from '@/lib/planner'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { FavoriteButton } from '@/components/FavoriteButton'
import { EventCard, type EventCardEvent } from '@/components/EventCard'
import { EventLocationMap } from '@/components/events/EventLocationMap'
import { directionsHref, safeExternalUrl } from '@/lib/safe-external-url'
import { formatVenueAddress, venueTypeLabel } from '@/lib/venue-profile'
import { serializeJsonLd } from '@/lib/safe-json-ld'
import { buildVenueJsonLd } from '@/lib/venue-jsonld'

export const instant = false

interface VenuePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

interface VenueEventRow {
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
  music_genre: string | null
  image_url: string | null
  is_published: boolean
}

interface VenueDetailRow {
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
  phone: string | null
  email: string | null
  website: string | null
  instagram?: string | null
  facebook?: string | null
  price_range: string | null
  age_restriction: string | null
  accepts_hen_stag: boolean | null
  music_genres: string[] | null
  atmosphere: string[] | null
  images: string[] | null
  events: VenueEventRow[] | null
}

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000'
  try {
    return new URL(raw).origin
  } catch {
    return 'http://localhost:3000'
  }
}

function extractValidImages(images: string[] | null | undefined): string[] {
  if (!Array.isArray(images)) return []
  return images
    .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
    .map((img) => img.trim())
}

function absoluteImage(src: string | null | undefined): string | null {
  if (!src) return null
  try {
    return new URL(src, siteOrigin()).toString()
  } catch {
    return null
  }
}

function formatLocationLabel(venue: Pick<VenueDetailRow, 'city' | 'county'>): string {
  const city = venue.city?.trim()
  const county = venue.county?.trim()
  if (city && county && city.toLowerCase() !== county.toLowerCase()) {
    return `${city}, Co. ${county}`
  }
  return city || county || ''
}

function resolveSocialUrl(
  raw: string | null | undefined,
  platform: 'instagram' | 'facebook'
): string | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null
  const direct = safeExternalUrl(trimmed)
  if (direct) return direct
  const handle = trimmed.replace(/^@+/, '').replace(/^\/+|\/+$/g, '')
  if (!handle || /\s/.test(handle)) return null
  return platform === 'instagram'
    ? `https://www.instagram.com/${encodeURIComponent(handle)}`
    : `https://www.facebook.com/${encodeURIComponent(handle)}`
}

async function loadVenue(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('venues')
    .select(`
      *,
      events (
        id,
        title,
        slug,
        description,
        event_type,
        start_time,
        end_time,
        price_min,
        price_max,
        is_free,
        music_genre,
        image_url,
        is_published
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  const venue = data as VenueDetailRow

  const publiclyVisible = Boolean(venue.is_verified)
  const managed = await viewerManagesVenue(supabase, venue.owner_id)
  if (!publiclyVisible && !managed) return null

  const validImages = extractValidImages(venue.images)
  const nowMs = Date.now()
  const upcomingEvents: EventCardEvent[] = (venue.events ?? [])
    .filter((event) => {
      if (!event.is_published) return false
      const startMs = new Date(event.start_time).getTime()
      return Number.isFinite(startMs) && startMs >= nowMs
    })
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description ?? '',
      event_type: event.event_type ?? 'live_music',
      start_time: event.start_time,
      end_time: event.end_time,
      price_min: event.price_min,
      price_max: event.price_max,
      is_free: event.is_free,
      music_genre: event.music_genre ?? '',
      image_url: event.image_url,
      venues: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        county: venue.county ?? '',
        city: venue.city,
        address: venue.address,
        latitude: venue.latitude,
        longitude: venue.longitude,
        images: validImages,
      },
    }))

  return { venue, publiclyVisible, validImages, upcomingEvents }
}

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const { slug } = await params
  const loaded = await loadVenue(slug)
  if (!loaded?.publiclyVisible) {
    return { title: 'Venue — IrishNightlife.ie' }
  }

  const { venue } = loaded
  const origin = siteOrigin()
  const canonical = `${origin}/venues/${venue.slug}`
  const place = formatLocationLabel(venue)
  const typeLabel = venueTypeLabel(venue.venue_type) || 'Venue'
  const description =
    venue.description?.trim() ||
    `${venue.name} — verified ${typeLabel.toLowerCase()}${place ? ` in ${place}` : ''} on IrishNightlife.ie.`
  const validImages = extractValidImages(venue.images)
  const firstImage = absoluteImage(validImages[0])

  return {
    title: `${venue.name} — IrishNightlife.ie`,
    description,
    alternates: { canonical },
    openGraph: {
      title: venue.name,
      description,
      url: canonical,
      type: 'website',
      images: firstImage ? [{ url: firstImage }] : undefined,
    },
  }
}

export default async function VenuePage({ params, searchParams }: VenuePageProps) {
  const { slug } = await params
  const query = await searchParams
  const loaded = await loadVenue(slug)
  if (!loaded) notFound()

  const { venue, publiclyVisible, validImages, upcomingEvents } = loaded
  const planHref = plannerPlanHref(query)
  const heroImage = validImages[0] ?? null
  const typeLabel = venueTypeLabel(venue.venue_type) || 'Venue'
  const place = formatLocationLabel(venue)
  const priceRange = venue.price_range?.trim() || null
  const ageRestriction = venue.age_restriction?.trim() || null

  const henStagLabel =
    venue.accepts_hen_stag === true
      ? 'Welcomes hen & stag parties'
      : venue.accepts_hen_stag === false
        ? 'Does not accept hen & stag parties'
        : null

  const musicGenres = (venue.music_genres ?? [])
    .filter((genre): genre is string => typeof genre === 'string' && genre.trim().length > 0)
    .map((genre) => genre.trim())

  const atmospheres = (venue.atmosphere ?? [])
    .filter((atm): atm is string => typeof atm === 'string' && atm.trim().length > 0)
    .map((atm) => atm.trim())

  const addressLine = formatVenueAddress({
    address: venue.address ?? '',
    city: venue.city ?? '',
    county: venue.county ?? '',
    postcode: venue.postcode ?? null,
  })

  const hasCoordinates =
    typeof venue.latitude === 'number' &&
    Number.isFinite(venue.latitude) &&
    typeof venue.longitude === 'number' &&
    Number.isFinite(venue.longitude)

  const directions = directionsHref(venue)
  const websiteUrl = safeExternalUrl(venue.website)
  const phoneDisplay = venue.phone?.trim() || null
  const telHref = phoneDisplay ? `tel:${phoneDisplay.replace(/\s+/g, '')}` : null
  const emailAddress = venue.email?.trim() || null
  const mailtoHref = emailAddress ? `mailto:${emailAddress}` : null
  const instagramUrl = resolveSocialUrl(venue.instagram, 'instagram')
  const facebookUrl = resolveSocialUrl(venue.facebook, 'facebook')

  const origin = siteOrigin()
  const jsonLd = publiclyVisible
    ? buildVenueJsonLd({
        name: venue.name,
        description: venue.description,
        url: `${origin}/venues/${venue.slug}`,
        venueType: venue.venue_type,
        image: validImages
          .map((src) => absoluteImage(src))
          .filter((src): src is string => Boolean(src)),
        telephone: phoneDisplay,
        priceRange,
        streetAddress: venue.address,
        addressLocality: venue.city,
        addressRegion: venue.county,
        postalCode: venue.postcode,
        latitude: venue.latitude,
        longitude: venue.longitude,
      })
    : null

  const browseEventsHref = venue.county
    ? `/events?county=${encodeURIComponent(venue.county)}`
    : '/events'

  return (
    <div className="bg-background">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      ) : null}
      <BackToPlanner href={planHref} />

      {/* Photography-led Hero */}
      <section className="border-b border-border bg-night">
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-night via-night-soft to-forest sm:aspect-[21/9]">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={venue.name}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-end p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-mint">
                  {typeLabel}
                </p>
              </div>
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-night/10"
              aria-hidden="true"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border border-mint/30 bg-night/85 text-mint">
                  {typeLabel}
                </Badge>
                {venue.is_verified ? (
                  <Badge
                    variant="outline"
                    className="inline-flex items-center gap-1.5 border-mint/40 bg-night/85 text-mint"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>Verified Venue</span>
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-3 max-w-3xl text-balance text-3xl font-bold text-white sm:text-5xl">
                {venue.name}
              </h1>

              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-foreground/85 sm:text-base">
                {place ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-mint" aria-hidden="true" />
                    <span>{place}</span>
                  </span>
                ) : null}
                {place && priceRange ? (
                  <span aria-hidden="true" className="text-muted-foreground">
                    ·
                  </span>
                ) : null}
                {priceRange ? (
                  <span className="font-semibold text-mint">{priceRange}</span>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Content */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-8 lg:col-span-2">
          {/* 1. About the Venue */}
          <section
            aria-labelledby="about-venue-heading"
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <h2 id="about-venue-heading" className="text-2xl font-bold text-foreground">
              About the venue
            </h2>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/90">
              {venue.description?.trim() ||
                'This venue has not added a description yet.'}
            </p>

            {/* Key Facts Grid */}
            <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border/70 pt-6 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mint/20 bg-mint/10">
                  <Sparkles className="h-5 w-5 text-mint" aria-hidden="true" />
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Venue type
                  </dt>
                  <dd className="mt-0.5 font-semibold text-foreground">{typeLabel}</dd>
                </div>
              </div>

              {priceRange ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mint/20 bg-mint/10">
                    <Tag className="h-5 w-5 text-mint" aria-hidden="true" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Price range
                    </dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{priceRange}</dd>
                  </div>
                </div>
              ) : null}

              {ageRestriction ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mint/20 bg-mint/10">
                    <ShieldCheck className="h-5 w-5 text-mint" aria-hidden="true" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Age policy
                    </dt>
                    <dd className="mt-0.5 font-semibold text-foreground">
                      {ageRestriction}
                    </dd>
                  </div>
                </div>
              ) : null}

              {henStagLabel ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-mint/20 bg-mint/10">
                    <Users className="h-5 w-5 text-mint" aria-hidden="true" />
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Group bookings
                    </dt>
                    <dd className="mt-0.5 font-semibold text-foreground">
                      {henStagLabel}
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>

            {/* Music Genres */}
            {musicGenres.length > 0 ? (
              <div className="mt-6 border-t border-border/70 pt-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Music className="h-4 w-4 text-mint" aria-hidden="true" />
                  <span>Music genres</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {musicGenres.map((genre) => (
                    <Badge
                      key={genre}
                      variant="outline"
                      className="border-mint/35 bg-mint/10 text-mint"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Atmosphere */}
            {atmospheres.length > 0 ? (
              <div className="mt-6 border-t border-border/70 pt-6">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Atmosphere
                </h3>
                <div className="flex flex-wrap gap-2">
                  {atmospheres.map((atm) => (
                    <Badge
                      key={atm}
                      variant="outline"
                      className="border-border text-foreground/90"
                    >
                      {atm}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          {/* 2. What's On (Upcoming Events) */}
          <section
            aria-labelledby="whats-on-heading"
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="whats-on-heading" className="text-2xl font-bold text-foreground">
                What’s On
              </h2>
              {upcomingEvents.length > 0 ? (
                <span className="text-sm text-muted-foreground">
                  {upcomingEvents.length} upcoming{' '}
                  {upcomingEvents.length === 1 ? 'event' : 'events'}
                </span>
              ) : null}
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    href={preservePlannerOrigin(`/events/${event.slug}`, query)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background/40 px-6 py-10 text-center">
                <Calendar
                  className="mx-auto mb-3 h-7 w-7 text-mint/80"
                  aria-hidden="true"
                />
                <p className="font-semibold text-foreground">
                  No upcoming events published for {venue.name} right now.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Check back soon or browse other upcoming nights{' '}
                  {venue.county ? `in ${venue.county}` : 'across Ireland'}.
                </p>
                <Link
                  href={browseEventsHref}
                  className={cn(
                    buttonVariants({ variant: 'brand-outline' }),
                    'mt-5 inline-flex min-h-10 gap-2'
                  )}
                >
                  Browse events{venue.county ? ` in ${venue.county}` : ''}
                </Link>
              </div>
            )}
          </section>

          {/* 3. Photos Gallery (only when valid images exist) */}
          {validImages.length > 0 ? (
            <section
              aria-labelledby="photos-heading"
              className="rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              <h2 id="photos-heading" className="mb-4 text-2xl font-bold text-foreground">
                Photos
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {validImages.map((src, index) => (
                  <div
                    key={`${src}-${index}`}
                    className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    <Image
                      src={src}
                      alt={`${venue.name} — photo ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* 4. Location and Directions */}
          <section
            aria-labelledby="location-heading"
            className="rounded-2xl border border-border bg-card p-6 sm:p-8"
          >
            <h2 id="location-heading" className="text-2xl font-bold text-foreground">
              Location and directions
            </h2>
            {addressLine ? (
              <p className="mt-4 flex items-start gap-2 text-foreground">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-mint" aria-hidden="true" />
                <span>{addressLine}</span>
              </p>
            ) : (
              <p className="mt-4 text-muted-foreground">
                This venue has not published a street address yet.
              </p>
            )}

            {hasCoordinates ? (
              <div className="mt-4">
                <EventLocationMap
                  latitude={venue.latitude as number}
                  longitude={venue.longitude as number}
                  name={venue.name}
                />
              </div>
            ) : null}

            {directions ? (
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'mt-4 inline-flex min-h-11 gap-2'
                )}
              >
                <Navigation className="h-4 w-4 text-mint" aria-hidden="true" />
                Get directions
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Opens OpenStreetMap in a new tab</span>
              </a>
            ) : null}
          </section>
        </div>

        {/* Sticky Sidebar: Contact & Actions */}
        <aside className="lg:col-span-1">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <h2 className="text-xl font-bold text-foreground">Contact & Actions</h2>

            <FavoriteButton
              venueId={venue.id}
              label={venue.name}
              className="w-full"
            />

            <div className="space-y-2.5 pt-1">
              {directions ? (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: 'brand' }),
                    'inline-flex min-h-11 w-full gap-2'
                  )}
                >
                  <Navigation className="h-4 w-4" aria-hidden="true" />
                  Get directions
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Opens OpenStreetMap in a new tab</span>
                </a>
              ) : null}

              {websiteUrl ? (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: directions ? 'brand-outline' : 'brand' }),
                    'inline-flex min-h-11 w-full gap-2'
                  )}
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  Visit website
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Opens venue website in a new tab</span>
                </a>
              ) : null}

              {telHref && phoneDisplay ? (
                <a
                  href={telHref}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'inline-flex min-h-11 w-full gap-2'
                  )}
                >
                  <Phone className="h-4 w-4 text-mint" aria-hidden="true" />
                  <span>Call {phoneDisplay}</span>
                </a>
              ) : null}

              {mailtoHref && emailAddress ? (
                <a
                  href={mailtoHref}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'inline-flex min-h-11 w-full gap-2'
                  )}
                >
                  <Mail className="h-4 w-4 text-mint" aria-hidden="true" />
                  <span className="truncate">Email venue</span>
                </a>
              ) : null}
            </div>

            {/* Direct Contact Details */}
            {addressLine || phoneDisplay || emailAddress || websiteUrl ? (
              <dl className="space-y-3 border-t border-border pt-4 text-sm">
                {addressLine ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Address
                    </dt>
                    <dd className="mt-0.5 text-foreground/90">{addressLine}</dd>
                  </div>
                ) : null}

                {phoneDisplay && telHref ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Phone
                    </dt>
                    <dd className="mt-0.5">
                      <a
                        href={telHref}
                        className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        {phoneDisplay}
                      </a>
                    </dd>
                  </div>
                ) : null}

                {emailAddress && mailtoHref ? (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Email
                    </dt>
                    <dd className="mt-0.5">
                      <a
                        href={mailtoHref}
                        className="break-all font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
                      >
                        {emailAddress}
                      </a>
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}

            {/* Social Links — only rendered when actually stored on the venue */}
            {instagramUrl || facebookUrl ? (
              <div className="border-t border-border pt-4">
                <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Social profiles
                </h3>
                <div className="flex flex-wrap gap-2">
                  {instagramUrl ? (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'inline-flex min-h-9 flex-1 gap-1.5'
                      )}
                    >
                      <span>Instagram</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : null}
                  {facebookUrl ? (
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: 'outline', size: 'sm' }),
                        'inline-flex min-h-9 flex-1 gap-1.5'
                      )}
                    >
                      <span>Facebook</span>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
