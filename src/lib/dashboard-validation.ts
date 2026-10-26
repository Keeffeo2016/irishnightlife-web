import { safeExternalUrl } from '@/lib/safe-external-url'

export const AWAITING_APPROVAL_MESSAGE =
  'Awaiting approval. Once completed, you can continue creating events.'

export const DASHBOARD_GENERIC_LOAD_ERROR =
  'Could not load your events. Refresh the page to try again.'

export const DASHBOARD_GENERIC_SAVE_ERROR =
  'Something went wrong while saving. Please try again.'

export const DASHBOARD_GENERIC_CREATE_ERROR =
  'Could not create the event. Please try again.'

export const DASHBOARD_GENERIC_UPLOAD_ERROR =
  'Could not upload that photo. Please try again.'

export type DashboardNavRoute =
  | '/dashboard'
  | '/dashboard/events'
  | '/dashboard/events/new'
  | '/dashboard/profile'

export interface DashboardNavItem {
  label: 'Overview' | 'Events' | 'Add Event' | 'Venue Profile'
  href: DashboardNavRoute
}

export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Events', href: '/dashboard/events' },
  { label: 'Add Event', href: '/dashboard/events/new' },
  { label: 'Venue Profile', href: '/dashboard/profile' },
] as const

export function normalizeDashboardPathname(pathname: string | null | undefined): string {
  const raw = pathname?.trim() || '/'
  const withoutQuery = raw.split('?')[0]?.split('#')[0] || '/'
  if (withoutQuery === '/') return '/'
  return withoutQuery.endsWith('/') ? withoutQuery.slice(0, -1) : withoutQuery
}

export function isDashboardNavItemActive(
  pathname: string | null | undefined,
  href: DashboardNavRoute
): boolean {
  if (!pathname || !pathname.trim()) return false
  const clean = normalizeDashboardPathname(pathname)

  switch (href) {
    case '/dashboard':
      return clean === '/dashboard'
    case '/dashboard/events':
      return clean === '/dashboard/events'
    case '/dashboard/events/new':
      return clean === '/dashboard/events/new' || clean.startsWith('/dashboard/events/new/')
    case '/dashboard/profile':
      return clean === '/dashboard/profile' || clean.startsWith('/dashboard/profile/')
    default: {
      const _exhaustive: never = href
      return _exhaustive
    }
  }
}

export interface DashboardEventSummaryShape {
  start_time: string
  is_published: boolean
}

export interface DashboardEventMetrics<T extends DashboardEventSummaryShape> {
  total: number
  upcomingCount: number
  earlierCount: number
  publishedCount: number
  draftCount: number
  upcoming: T[]
  earlier: T[]
}

export function computeDashboardEventMetrics<T extends DashboardEventSummaryShape>(
  events: readonly T[],
  nowIso: string
): DashboardEventMetrics<T> {
  const nowMs = new Date(nowIso).getTime()
  const validNowMs = Number.isFinite(nowMs) ? nowMs : 0

  const upcoming: T[] = []
  const earlier: T[] = []
  let publishedCount = 0
  let draftCount = 0

  for (const event of events) {
    if (event.is_published) {
      publishedCount += 1
    } else {
      draftCount += 1
    }

    const startMs = new Date(event.start_time).getTime()
    if (Number.isFinite(startMs) && startMs >= validNowMs) {
      upcoming.push(event)
    } else {
      earlier.push(event)
    }
  }

  upcoming.sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  )
  earlier.sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  )

  return {
    total: events.length,
    upcomingCount: upcoming.length,
    earlierCount: earlier.length,
    publishedCount,
    draftCount,
    upcoming,
    earlier,
  }
}

export interface ValidateVenueProfileInput {
  description: string
  venueType: string
  priceRange: string
}

export type ValidateVenueProfileResult =
  | { ok: true; description: string }
  | { ok: false; error: string }

export function validateVenueProfileInput(
  input: ValidateVenueProfileInput
): ValidateVenueProfileResult {
  const trimmed = input.description.trim()
  if (!trimmed || !input.venueType.trim() || !input.priceRange.trim()) {
    return {
      ok: false,
      error: 'Add a short description, a venue type, and a price range.',
    }
  }
  return { ok: true, description: trimmed }
}

export interface ValidateCreateEventInput {
  about: string
  venueType: string
  priceRange: string
  title: string
  startTime: string
  endTime: string
  isFree: boolean
  priceMin: string
  priceMax: string
  ticketUrl: string
  isVerified: boolean
}

export type ValidateCreateEventResult =
  | {
      ok: true
      aboutText: string
      titleText: string
      startIso: string
      endIso: string | null
      minPrice: number
      maxPrice: number | null
      normalizedTicketUrl: string | null
    }
  | {
      ok: false
      error: string
    }

export function validateCreateEventInput(
  input: ValidateCreateEventInput
): ValidateCreateEventResult {
  const aboutText = input.about.trim()
  if (!aboutText || !input.venueType.trim() || !input.priceRange.trim()) {
    return {
      ok: false,
      error: 'The event template needs the venue type, price range, and a section about the venue.',
    }
  }

  const titleText = input.title.trim()
  if (!titleText || !input.startTime.trim()) {
    return {
      ok: false,
      error: 'Add an event title and a start time.',
    }
  }

  const start = new Date(input.startTime)
  const end = input.endTime.trim() ? new Date(input.endTime) : null
  if (Number.isNaN(start.getTime()) || (end && Number.isNaN(end.getTime()))) {
    return {
      ok: false,
      error: 'Enter a valid start and end time.',
    }
  }
  if (end && end <= start) {
    return {
      ok: false,
      error: 'The end time has to be after the start time.',
    }
  }

  const min = input.isFree ? 0 : Number(input.priceMin)
  const hasPriceMin = input.isFree || input.priceMin.trim() !== ''
  const max = input.priceMax.trim() ? Number(input.priceMax) : null

  if (!input.isFree && (!hasPriceMin || !Number.isFinite(min) || min < 0)) {
    return {
      ok: false,
      error: 'Enter a ticket price, or mark the event as free.',
    }
  }
  if (!input.isFree && max != null && (!Number.isFinite(max) || max < min)) {
    return {
      ok: false,
      error: 'The top price has to be at least the starting price.',
    }
  }

  const rawTicketUrl = input.ticketUrl.trim()
  let normalizedTicketUrl: string | null = null
  if (rawTicketUrl) {
    const safeUrl = safeExternalUrl(rawTicketUrl)
    if (!safeUrl) {
      return {
        ok: false,
        error: 'Enter a valid http:// or https:// ticket link, or leave it blank.',
      }
    }
    normalizedTicketUrl = safeUrl
  }

  if (!input.isVerified) {
    return {
      ok: false,
      error: AWAITING_APPROVAL_MESSAGE,
    }
  }

  return {
    ok: true,
    aboutText,
    titleText,
    startIso: start.toISOString(),
    endIso: end ? end.toISOString() : null,
    minPrice: min,
    maxPrice: input.isFree ? null : max,
    normalizedTicketUrl,
  }
}

export function isVenueProfileComplete(venue: {
  description?: string | null
  venue_type?: string | null
  price_range?: string | null
  images?: string[] | null
}): { complete: boolean; missing: string[] } {
  const missing: string[] = []
  if (!venue.description?.trim()) missing.push('About description')
  if (!venue.venue_type?.trim()) missing.push('Venue type')
  if (!venue.price_range?.trim()) missing.push('Price range')
  if (!venue.images || venue.images.length === 0) missing.push('Venue photos')
  return {
    complete: missing.length === 0,
    missing,
  }
}

export function formatDashboardDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-IE', {
    timeZone: 'Europe/Dublin',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
