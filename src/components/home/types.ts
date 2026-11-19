import type { EventCardEvent } from '@/components/EventCard'
import { formatDublinDateKey } from '@/lib/dublin-time'

export type HomeEvent = EventCardEvent & {
  is_featured: boolean
  end_time?: string | null
}

export type HomeVenue = {
  id: string
  name: string
  slug: string
  city: string
  county: string
  venue_type: string | null
  images: string[] | null
}

export function isSameLocalDay(startTime: string) {
  const event = new Date(startTime)
  if (Number.isNaN(event.getTime())) return false
  return formatDublinDateKey(event) === formatDublinDateKey(new Date())
}

export function resolveEventImageUrl(event: Pick<EventCardEvent, 'image_url' | 'venues'>): string | null {
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

/** Brand fallback when no listed event/venue photo is available. */
export const DEFAULT_HERO_IMAGE = '/home/hero-nightlife.jpg'

/** Featured first, then any event with a photo - for cinematic hero backdrop. */
export function resolveHeroBackdrop(events: HomeEvent[]): {
  imageUrl: string
  eventType: string | null
  label: string
} {
  const featuredWithImage = events.find(
    (event) => event.is_featured && resolveEventImageUrl(event)
  )
  if (featuredWithImage) {
    return {
      imageUrl: resolveEventImageUrl(featuredWithImage)!,
      eventType: featuredWithImage.event_type,
      label: featuredWithImage.venues.name,
    }
  }

  const anyWithImage = events.find((event) => resolveEventImageUrl(event))
  if (anyWithImage) {
    return {
      imageUrl: resolveEventImageUrl(anyWithImage)!,
      eventType: anyWithImage.event_type,
      label: anyWithImage.venues.name,
    }
  }

  const featured = events.find((event) => event.is_featured)
  if (featured) {
    return {
      imageUrl: DEFAULT_HERO_IMAGE,
      eventType: featured.event_type,
      label: featured.venues.name,
    }
  }

  const first = events[0]
  if (first) {
    return {
      imageUrl: DEFAULT_HERO_IMAGE,
      eventType: first.event_type,
      label: first.venues.name,
    }
  }

  return { imageUrl: DEFAULT_HERO_IMAGE, eventType: null, label: 'IrishNightlife' }
}

export function eventsSearchHref(opts: {
  q?: string
  county?: string
  type?: string
}) {
  const params = new URLSearchParams()
  const q = opts.q?.trim()
  if (q) params.set('q', q)
  if (opts.county && opts.county !== 'All Ireland' && opts.county !== 'All') {
    params.set('county', opts.county)
  }
  if (opts.type && opts.type !== 'All') {
    params.set('type', opts.type)
  }
  const qs = params.toString()
  return qs ? `/events?${qs}` : '/events'
}
