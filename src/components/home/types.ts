import type { EventCardEvent } from '@/components/EventCard'

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
  return new Date(startTime).toDateString() === new Date().toDateString()
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
