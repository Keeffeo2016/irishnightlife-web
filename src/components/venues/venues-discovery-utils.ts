import { IRISH_COUNTIES } from '@/lib/counties'
import { VENUE_TYPES, venueTypeLabel } from '@/lib/venue-profile'

export type VenuesFilterKey = 'county' | 'type' | 'q'

export interface VenuesFiltersState {
  county: string
  type: string
  q: string
}

export const PUBS_BARS_KEY = 'pubs_bars'

export const POPULAR_VENUE_COUNTIES = [
  'All Ireland',
  'Cork',
  'Dublin',
  'Galway',
  'Kerry',
  'Limerick',
  'Waterford',
  'Kilkenny',
] as const

export const VENUE_CATEGORY_OPTIONS = [
  { value: 'All', label: 'All Venues' },
  { value: PUBS_BARS_KEY, label: 'Pubs & Bars' },
  { value: 'pub', label: 'Pubs' },
  { value: 'bar', label: 'Bars' },
  { value: 'club', label: 'Nightclubs' },
  { value: 'live_music_venue', label: 'Live Music Venues' },
  { value: 'restaurant', label: 'Restaurants' },
] as const

const VALID_VENUE_TYPE_VALUES = VENUE_TYPES.map((type) => type.value)

function normalizeVenueTypeToken(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, '_')
}

export function normalizeVenueCountyParam(raw: string | null | undefined): string {
  const trimmed = raw?.trim()
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'all' ||
    trimmed.toLowerCase() === 'all ireland'
  ) {
    return 'All Ireland'
  }
  const canonical = IRISH_COUNTIES.find(
    (county) => county.name.toLowerCase() === trimmed.toLowerCase()
  )
  return canonical ? canonical.name : trimmed
}

export function parseVenueTypeFilter(searchParams: Pick<URLSearchParams, 'get'>): string {
  const typesParam = searchParams.get('types')
  if (typesParam) {
    const values = typesParam
      .split(',')
      .map(normalizeVenueTypeToken)
      .filter((value) =>
        VALID_VENUE_TYPE_VALUES.includes(value as (typeof VALID_VENUE_TYPE_VALUES)[number])
      )
    const unique = [...new Set(values)]
    if (unique.length === 2 && unique.includes('pub') && unique.includes('bar')) {
      return PUBS_BARS_KEY
    }
    if (unique.length === 1) {
      return unique[0]
    }
  }

  const typeParam = searchParams.get('type')
  if (!typeParam) return 'All'

  const normalized = normalizeVenueTypeToken(typeParam)
  if (normalized === 'all') return 'All'
  if (normalized === PUBS_BARS_KEY || normalized === 'pubs_and_bars') {
    return PUBS_BARS_KEY
  }
  if (
    VALID_VENUE_TYPE_VALUES.includes(
      normalized as (typeof VALID_VENUE_TYPE_VALUES)[number]
    )
  ) {
    return normalized
  }

  const fromLabel = VENUE_TYPES.find(
    (type) => type.label.toLowerCase() === typeParam.trim().toLowerCase()
  )
  return fromLabel?.value ?? 'All'
}

export function sanitizeVenueSearchQuery(raw: string): string {
  return raw.replace(/[,()]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function parseVenuesSearchParams(
  searchParams: Pick<URLSearchParams, 'get'>
): VenuesFiltersState {
  return {
    county: normalizeVenueCountyParam(searchParams.get('county')),
    type: parseVenueTypeFilter(searchParams),
    q: searchParams.get('q')?.trim() ?? '',
  }
}

export function buildVenuesHref(filters: Partial<VenuesFiltersState>): string {
  const params = new URLSearchParams()

  const q = filters.q?.trim()
  if (q) {
    params.set('q', q)
  }

  if (
    filters.county &&
    filters.county !== 'All' &&
    filters.county !== 'All Ireland'
  ) {
    params.set('county', filters.county)
  }

  if (filters.type && filters.type !== 'All') {
    if (filters.type === PUBS_BARS_KEY) {
      params.set('types', 'pub,bar')
    } else {
      params.set('type', filters.type)
    }
  }

  const query = params.toString()
  return query ? `/venues?${query}` : '/venues'
}

export function clearSingleVenueFilter(
  current: VenuesFiltersState,
  key: VenuesFilterKey
): VenuesFiltersState {
  switch (key) {
    case 'county':
      return { ...current, county: 'All Ireland' }
    case 'type':
      return { ...current, type: 'All' }
    case 'q':
      return { ...current, q: '' }
    default: {
      const _exhaustive: never = key
      return _exhaustive
    }
  }
}

export function venueTypesForFilter(selectedType: string): string[] | null {
  if (!selectedType || selectedType === 'All') return null
  if (selectedType === PUBS_BARS_KEY) return ['pub', 'bar']
  return [selectedType]
}

export function venueCategoryLabel(selectedType: string): string {
  const match = VENUE_CATEGORY_OPTIONS.find((item) => item.value === selectedType)
  if (match) return match.label
  return venueTypeLabel(selectedType) || 'Venues'
}
