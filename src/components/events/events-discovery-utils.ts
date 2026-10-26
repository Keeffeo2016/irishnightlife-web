import { IRISH_COUNTIES } from '@/lib/counties'
import { EVENT_TYPES } from '@/lib/venue-profile'

export type EventsViewMode = 'grid' | 'map'

export type EventsFilterKey =
  | 'county'
  | 'type'
  | 'genre'
  | 'date'
  | 'q'
  | 'free'

export interface EventsFiltersState {
  county: string
  type: string
  genre: string
  date: string
  q: string
  free: boolean
  view: EventsViewMode
}

export interface DublinDateOption {
  value: string
  label: string
  shortLabel: string
  dateKey: string | null
}

export const POPULAR_COUNTIES = [
  'All',
  'Cork',
  'Dublin',
  'Galway',
  'Kerry',
  'Limerick',
  'Waterford',
  'Kilkenny',
] as const

export const EVENT_CATEGORY_OPTIONS = [
  { value: 'All', label: 'All Events' },
  { value: 'live_music', label: 'Live Music' },
  { value: 'dj', label: 'DJs & Club Nights' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'quiz', label: 'Pub Quiz' },
  { value: 'sports', label: 'Live Sport' },
  { value: 'special_offer', label: 'Special Offers' },
] as const

export const BASE_MUSIC_GENRES = [
  'All',
  'Traditional Irish',
  'Electronic',
  'Rock',
  'Jazz',
  'Pop',
  'Indie',
  'Hip Hop',
  'Folk',
  'Country',
] as const

const EVENT_TYPE_DISALLOWED_IN_GENRE = new Set([
  'live music',
  'live_music',
  'dj',
  'djs & club nights',
  'dj & club night',
  'comedy',
  'quiz',
  'pub quiz',
  'sports',
  'live sport',
  'special offer',
  'special offers',
  'special_offer',
])

export function isDisallowedGenreLabel(value: string): boolean {
  return EVENT_TYPE_DISALLOWED_IN_GENRE.has(value.trim().toLowerCase())
}

export function buildMusicGenreOptions(
  eventGenres: readonly (string | null | undefined)[],
  selectedGenre: string
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  const addGenre = (genre: string) => {
    const trimmed = genre.trim()
    if (!trimmed) return
    if (trimmed !== 'All' && isDisallowedGenreLabel(trimmed)) return
    const key = trimmed.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    result.push(trimmed)
  }

  for (const base of BASE_MUSIC_GENRES) {
    addGenre(base)
  }

  if (selectedGenre && selectedGenre !== 'All') {
    addGenre(selectedGenre)
  }

  for (const raw of eventGenres) {
    if (raw) addGenre(raw)
  }

  return result
}

export function categoryOptionLabel(value: string): string {
  const match = EVENT_CATEGORY_OPTIONS.find((item) => item.value === value)
  if (match) return match.label
  const fallback = EVENT_TYPES.find((item) => item.value === value)
  return fallback?.label ?? value
}

export function normalizeCountyParam(raw: string | null | undefined): string {
  const trimmed = raw?.trim()
  if (!trimmed || trimmed.toLowerCase() === 'all' || trimmed.toLowerCase() === 'all ireland') {
    return 'All'
  }
  const canonical = IRISH_COUNTIES.find(
    (county) => county.name.toLowerCase() === trimmed.toLowerCase()
  )
  return canonical ? canonical.name : trimmed
}

export function normalizeTypeParam(raw: string | null | undefined): string {
  const trimmed = raw?.trim().toLowerCase()
  if (!trimmed || trimmed === 'all') return 'All'
  const valid = EVENT_TYPES.find((item) => item.value === trimmed)
  return valid ? valid.value : 'All'
}

export function normalizeGenreParam(raw: string | null | undefined): string {
  const trimmed = raw?.trim()
  if (!trimmed || trimmed.toLowerCase() === 'all') return 'All'
  if (isDisallowedGenreLabel(trimmed)) return 'All'
  return trimmed
}

export function normalizeDateParam(raw: string | null | undefined): string {
  const trimmed = raw?.trim().toLowerCase()
  if (!trimmed || trimmed === 'all') return 'all'
  if (trimmed === 'tonight' || trimmed === 'today') return 'tonight'
  if (trimmed === 'tomorrow') return 'tomorrow'
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  return 'all'
}

export function normalizeViewParam(raw: string | null | undefined): EventsViewMode {
  const trimmed = raw?.trim().toLowerCase()
  return trimmed === 'map' ? 'map' : 'grid'
}

export function parseEventsSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>
): EventsFiltersState {
  const freeRaw = searchParams.get('free')?.trim().toLowerCase()
  return {
    county: normalizeCountyParam(searchParams.get('county')),
    type: normalizeTypeParam(searchParams.get('type')),
    genre: normalizeGenreParam(searchParams.get('genre')),
    date: normalizeDateParam(searchParams.get('date')),
    q: searchParams.get('q')?.trim() ?? '',
    free: freeRaw === 'true' || freeRaw === '1',
    view: normalizeViewParam(searchParams.get('view')),
  }
}

export function buildEventsHref(filters: Partial<EventsFiltersState>): string {
  const params = new URLSearchParams()

  const q = filters.q?.trim()
  if (q) params.set('q', q)

  if (filters.county && filters.county !== 'All' && filters.county !== 'All Ireland') {
    params.set('county', filters.county)
  }

  if (filters.type && filters.type !== 'All') {
    params.set('type', filters.type)
  }

  if (filters.genre && filters.genre !== 'All') {
    params.set('genre', filters.genre)
  }

  if (filters.date && filters.date !== 'all') {
    params.set('date', filters.date)
  }

  if (filters.free) {
    params.set('free', 'true')
  }

  if (filters.view === 'map') {
    params.set('view', 'map')
  }

  const query = params.toString()
  return query ? `/events?${query}` : '/events'
}

export function clearSingleFilter(
  current: EventsFiltersState,
  key: EventsFilterKey
): EventsFiltersState {
  switch (key) {
    case 'county':
      return { ...current, county: 'All' }
    case 'type':
      return { ...current, type: 'All' }
    case 'genre':
      return { ...current, genre: 'All' }
    case 'date':
      return { ...current, date: 'all' }
    case 'q':
      return { ...current, q: '' }
    case 'free':
      return { ...current, free: false }
    default: {
      const _exhaustive: never = key
      return _exhaustive
    }
  }
}

/**
 * Formats a Date into YYYY-MM-DD in Europe/Dublin timezone.
 */
export function formatDublinDateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Dublin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function addCalendarDaysToDateKey(dateKey: string, daysToAdd: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  utcNoon.setUTCDate(utcNoon.getUTCDate() + daysToAdd)
  return utcNoon.toISOString().slice(0, 10)
}

/**
 * Converts a local wall-clock time in Europe/Dublin (YYYY-MM-DD + hour:min:sec.ms)
 * into an exact UTC Date, accounting for GMT (UTC+0) and IST (UTC+1) DST rules.
 */
export function dublinWallTimeToUtc(
  dateKey: string,
  hour: number,
  minute: number,
  second: number,
  millisecond = 0
): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  const utcGuessMs = Date.UTC(year, month - 1, day, hour, minute, second, millisecond)

  const getOffsetMsAt = (timestampMs: number): number => {
    const parts = new Intl.DateTimeFormat('en-IE', {
      timeZone: 'Europe/Dublin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(timestampMs))

    const map: Record<string, number> = {}
    for (const part of parts) {
      if (part.type !== 'literal') {
        map[part.type] = Number(part.value)
      }
    }

    const dublinWallAsUtcMs = Date.UTC(
      map.year,
      (map.month || 1) - 1,
      map.day || 1,
      map.hour || 0,
      map.minute || 0,
      map.second || 0,
      millisecond
    )
    return dublinWallAsUtcMs - timestampMs
  }

  const firstOffset = getOffsetMsAt(utcGuessMs)
  const firstCandidate = utcGuessMs - firstOffset
  const secondOffset = getOffsetMsAt(firstCandidate)
  return new Date(utcGuessMs - secondOffset)
}

/**
 * Returns the upcoming date options in Europe/Dublin timezone:
 * All Upcoming, Tonight, Tomorrow, and the following 5 calendar days.
 */
export function getDublinDateOptions(now: Date = new Date()): DublinDateOption[] {
  const todayKey = formatDublinDateKey(now)
  const tomorrowKey = addCalendarDaysToDateKey(todayKey, 1)

  const options: DublinDateOption[] = [
    {
      value: 'all',
      label: 'All Upcoming',
      shortLabel: 'All Upcoming',
      dateKey: null,
    },
    {
      value: 'tonight',
      label: 'Tonight',
      shortLabel: 'Tonight',
      dateKey: todayKey,
    },
    {
      value: 'tomorrow',
      label: 'Tomorrow',
      shortLabel: 'Tomorrow',
      dateKey: tomorrowKey,
    },
  ]

  const dayFormatter = new Intl.DateTimeFormat('en-IE', {
    timeZone: 'Europe/Dublin',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  for (let offset = 2; offset <= 6; offset += 1) {
    const dateKey = addCalendarDaysToDateKey(todayKey, offset)
    const middayUtc = dublinWallTimeToUtc(dateKey, 12, 0, 0)
    const formatted = dayFormatter.format(middayUtc)
    options.push({
      value: dateKey,
      label: formatted,
      shortLabel: formatted,
      dateKey,
    })
  }

  return options
}

/**
 * Resolves a date filter ('all', 'tonight', 'tomorrow', or 'YYYY-MM-DD')
 * into exact UTC ISO bounds for the Supabase query.
 */
export function resolveDublinDateRangeUtc(
  dateFilter: string,
  now: Date = new Date()
): { startIso: string; endIso: string | null } {
  const normalized = normalizeDateParam(dateFilter)
  if (normalized === 'all') {
    return {
      startIso: now.toISOString(),
      endIso: null,
    }
  }

  const todayKey = formatDublinDateKey(now)
  let targetDateKey = normalized

  if (normalized === 'tonight') {
    targetDateKey = todayKey
  } else if (normalized === 'tomorrow') {
    targetDateKey = addCalendarDaysToDateKey(todayKey, 1)
  }

  const dayStartUtc = dublinWallTimeToUtc(targetDateKey, 0, 0, 0, 0)
  const dayEndUtc = dublinWallTimeToUtc(targetDateKey, 23, 59, 59, 999)

  // Never show already-past events from earlier today
  const effectiveStartMs = Math.max(now.getTime(), dayStartUtc.getTime())

  return {
    startIso: new Date(effectiveStartMs).toISOString(),
    endIso: dayEndUtc.toISOString(),
  }
}

export function formatDateFilterLabel(
  dateFilter: string,
  dateOptions: readonly DublinDateOption[]
): string {
  const match = dateOptions.find((opt) => opt.value === dateFilter)
  if (match) return match.label
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
    const midday = dublinWallTimeToUtc(dateFilter, 12, 0, 0)
    return new Intl.DateTimeFormat('en-IE', {
      timeZone: 'Europe/Dublin',
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(midday)
  }
  return 'All Upcoming'
}
