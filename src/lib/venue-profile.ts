export const VENUE_TYPES = [
  { value: 'pub', label: 'Pub' },
  { value: 'bar', label: 'Bar' },
  { value: 'club', label: 'Club' },
  { value: 'live_music_venue', label: 'Live music venue' },
  { value: 'restaurant', label: 'Restaurant' },
] as const

export const PRICE_RANGES = ['€', '€€', '€€€'] as const

export const EVENT_TYPES = [
  { value: 'live_music', label: 'Live music' },
  { value: 'dj', label: 'DJ' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'sports', label: 'Sports' },
  { value: 'special_offer', label: 'Special offer' },
] as const

export const VENUE_IMAGE_BUCKET = 'venue-images'
export const MAX_VENUE_IMAGES = 6
export const MAX_VENUE_IMAGE_BYTES = 5 * 1024 * 1024

const VENUE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export function venueTypeLabel(value: string | null | undefined) {
  return VENUE_TYPES.find((type) => type.value === value)?.label ?? (value ? value.replaceAll('_', ' ') : '')
}

export function formatVenueAddress(venue: {
  address: string
  city: string
  county: string
  postcode: string | null
}) {
  return [venue.address, venue.city, venue.county, venue.postcode].filter(Boolean).join(', ')
}

export function venueImagePath(url: string) {
  const marker = `/${VENUE_IMAGE_BUCKET}/`
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0] ?? '')
}

export function venueImageError(file: File) {
  if (!VENUE_IMAGE_TYPES.has(file.type)) return 'Use a JPEG, PNG, WebP, or GIF.'
  if (file.size > MAX_VENUE_IMAGE_BYTES) return 'Each photo must be 5 MB or smaller.'
  return null
}
