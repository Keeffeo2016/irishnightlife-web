import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FallbackArt } from '@/components/FallbackArt'
import { FavoriteButton } from '@/components/FavoriteButton'

export interface EventCardEvent {
  id: string
  title: string
  slug: string
  description: string
  event_type: string
  start_time: string
  end_time?: string | null
  price_min: number | null
  price_max: number | null
  is_free: boolean
  music_genre: string
  image_url?: string | null
  is_featured?: boolean
  venues: {
    id?: string
    name: string
    slug?: string
    county: string
    city?: string | null
    address?: string | null
    latitude?: number | null
    longitude?: number | null
    images?: string[] | null
  }
}

export const EVENT_EMOJI: Record<string, string> = {
  dj: '🎧',
  live_music: '🎵',
  comedy: '🎤',
  sports: '🏉',
  quiz: '🧠',
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  live_music: 'Live Music',
  dj: 'DJ & Club Night',
  comedy: 'Comedy',
  quiz: 'Pub Quiz',
  sports: 'Live Sport',
  special_offer: 'Special Offer',
}

export function eventTypeLabel(eventType: string | null | undefined): string {
  if (!eventType) return 'Event'
  const normalized = eventType.trim().toLowerCase()
  if (EVENT_TYPE_LABELS[normalized]) {
    return EVENT_TYPE_LABELS[normalized]
  }
  return eventType
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function hasNumericPrice(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function formatEventPrice(
  event: Pick<EventCardEvent, 'is_free' | 'price_min' | 'price_max'>
): string | null {
  if (event.is_free) return 'Free'
  if (!hasNumericPrice(event.price_min)) return null
  if (hasNumericPrice(event.price_max) && event.price_max > event.price_min) {
    return `€${event.price_min}–€${event.price_max}`
  }
  return `€${event.price_min}`
}

function dublinDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Dublin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatEventDate(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''

  const now = new Date()
  const todayKey = dublinDateKey(now)
  const tomorrowKey = dublinDateKey(new Date(now.getTime() + 24 * 60 * 60 * 1000))
  const eventKey = dublinDateKey(date)

  if (eventKey === todayKey) return 'Tonight'
  if (eventKey === tomorrowKey) return 'Tomorrow'

  return date.toLocaleDateString('en-IE', {
    timeZone: 'Europe/Dublin',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatEventTime(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleTimeString('en-IE', {
    timeZone: 'Europe/Dublin',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function resolveCardImage(event: EventCardEvent): string | null {
  const directImage = event.image_url?.trim()
  if (directImage) return directImage

  const venueImages = event.venues?.images
  if (Array.isArray(venueImages)) {
    const firstVenueImage = venueImages.find(
      (img) => typeof img === 'string' && img.trim().length > 0
    )
    if (firstVenueImage) return firstVenueImage.trim()
  }

  return null
}

function formatVenueLocation(venue: EventCardEvent['venues']): string {
  const city = venue.city?.trim()
  const county = venue.county?.trim()
  if (city && county) {
    if (city.toLowerCase() === county.toLowerCase()) {
      return county
    }
    return `${city}, Co. ${county}`
  }
  return city || county || 'Ireland'
}

function shouldShowMusicGenre(eventType: string, musicGenre: string | null | undefined): boolean {
  const trimmed = musicGenre?.trim()
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()
  const typeLower = (eventType || '').trim().toLowerCase()
  const labelLower = eventTypeLabel(eventType).toLowerCase()
  return (
    lower !== typeLower &&
    lower !== labelLower &&
    lower !== typeLower.replaceAll('_', ' ')
  )
}

export function EventCard({
  event,
  href,
  variant = 'default',
}: {
  event: EventCardEvent
  href?: string
  variant?: 'default' | 'poster'
}) {
  const price = formatEventPrice(event)
  const imageUrl = resolveCardImage(event)
  const typeLabel = eventTypeLabel(event.event_type)
  const showGenre = shouldShowMusicGenre(event.event_type, event.music_genre)
  const dateLabel = formatEventDate(event.start_time)
  const timeLabel = formatEventTime(event.start_time)
  const locationLabel = formatVenueLocation(event.venues)
  const detailHref = href ?? `/events/${event.slug}`

  if (variant === 'poster') {
    return (
      <Card className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/70 focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/50 motion-reduce:transform-none motion-reduce:transition-none">
        <div className="absolute right-2.5 top-2.5 z-20">
          <FavoriteButton eventId={event.id} variant="icon" label={event.title} />
        </div>

        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-night via-night-soft to-forest">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt=""
                fill
                sizes="(max-width: 768px) 72vw, 256px"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent"
              />
            </>
          ) : (
            <FallbackArt kind="event" type={event.event_type} label={event.venues.name} />
          )}

          <div className="absolute left-3 top-3 z-10">
            <Badge className="border border-shamrock/40 bg-shamrock text-night">Tonight</Badge>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 space-y-2 p-4">
            <p className="font-mono text-xs tracking-wide text-foreground/80">
              {timeLabel || dateLabel}
              {price ? ` · ${price}` : ''}
            </p>
            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-hotpink-light">
              <Link href={detailHref} className="outline-none after:absolute after:inset-0">
                {event.title}
              </Link>
            </h3>
            <p className="line-clamp-1 text-sm text-foreground/75">{event.venues.name}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="card-lift group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/50 motion-reduce:transform-none motion-reduce:transition-none">
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton eventId={event.id} variant="icon" label={event.title} />
      </div>

      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden border-b border-border/60 bg-gradient-to-br from-night via-night-soft to-forest">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent"
            />
          </>
        ) : (
          <FallbackArt kind="event" type={event.event_type} label={event.venues.name} />
        )}

        <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap items-center gap-1.5">
          <Badge className="border border-hotpink/30 bg-night/85 text-hotpink backdrop-blur-sm">
            {typeLabel}
          </Badge>
          {event.is_featured ? (
            <Badge className="border border-amber/40 bg-amber text-night">Featured</Badge>
          ) : null}
          {showGenre ? (
            <Badge
              variant="outline"
              className="border-border/80 bg-night/80 text-foreground/90 backdrop-blur-sm"
            >
              {event.music_genre}
            </Badge>
          ) : null}
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-night/85 px-2.5 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
            <span
              className={`inline-flex items-center gap-1 ${
                dateLabel === 'Tonight' ? 'text-shamrock' : 'text-muted-foreground'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {dateLabel}
            </span>
            {timeLabel ? (
              <>
                <span aria-hidden="true" className="text-muted-foreground">
                  ·
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-foreground/90">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  {timeLabel}
                </span>
              </>
            ) : null}
          </div>

          {price ? (
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${
                event.is_free
                  ? 'border border-shamrock/40 bg-shamrock text-night'
                  : 'border border-white/15 bg-night/90 text-foreground'
              }`}
            >
              {price}
            </span>
          ) : null}
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="mb-1.5 line-clamp-2 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            <Link href={detailHref} className="outline-none after:absolute after:inset-0">
              {event.title}
            </Link>
          </h3>

          <div className="mb-3 flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="line-clamp-1">
              <span className="font-medium text-foreground/90">{event.venues.name}</span>
              <span aria-hidden="true" className="mx-1.5 text-muted-foreground/70">
                ·
              </span>
              <span>{locationLabel}</span>
            </p>
          </div>

          {event.description ? (
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-3.5 text-sm">
          {price ? (
            <span className="font-semibold text-foreground">
              {price === 'Free' ? 'Free entry' : `Tickets ${price}`}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Check venue for entry details</span>
          )}
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-1 font-semibold text-primary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          >
            View details →
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
