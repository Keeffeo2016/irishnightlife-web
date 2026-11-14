export type FallbackKind = 'event' | 'venue'

export type FallbackStops = {
  from: string
  to: string
  className: string
}

const PAIRS = {
  violetRose: {
    from: 'violet',
    to: 'rose',
    className: 'bg-gradient-to-br from-violet to-hotpink',
  },
  shamrockAmber: {
    from: 'shamrock',
    to: 'amber',
    className: 'bg-gradient-to-br from-shamrock to-amber',
  },
  amberRose: {
    from: 'amber',
    to: 'rose',
    className: 'bg-gradient-to-br from-amber to-hotpink',
  },
  violetShamrock: {
    from: 'violet',
    to: 'shamrock',
    className: 'bg-gradient-to-br from-violet to-shamrock',
  },
  roseAmber: {
    from: 'rose',
    to: 'amber',
    className: 'bg-gradient-to-br from-hotpink to-amber',
  },
  inkRaised: {
    from: 'night',
    to: 'raised',
    className: 'bg-gradient-to-br from-night to-forest',
  },
} as const satisfies Record<string, FallbackStops>

const EVENT_TYPES = {
  dj: 'violetRose',
  live_music: 'shamrockAmber',
  comedy: 'amberRose',
  special_offer: 'amberRose',
  quiz: 'violetShamrock',
  sports: 'roseAmber',
} as const

const VENUE_TYPES = {
  club: 'violetRose',
  live_music_venue: 'shamrockAmber',
  pub: 'shamrockAmber',
  restaurant: 'amberRose',
  bar: 'roseAmber',
} as const

export function fallbackStops(
  kind: FallbackKind,
  type: string | null | undefined
): FallbackStops {
  const key = (type ?? '').trim().toLowerCase()
  if (kind === 'event') {
    const pair = EVENT_TYPES[key as keyof typeof EVENT_TYPES]
    return PAIRS[pair ?? 'inkRaised']
  }
  if (kind === 'venue') {
    const pair = VENUE_TYPES[key as keyof typeof VENUE_TYPES]
    return PAIRS[pair ?? 'inkRaised']
  }
  const unreachable: never = kind
  return unreachable
}
