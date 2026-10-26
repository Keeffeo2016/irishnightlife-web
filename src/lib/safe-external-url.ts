const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

export function safeExternalUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

export function directionsHref(venue: {
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  city?: string | null
  county?: string | null
}): string | null {
  const latitude = venue.latitude
  const longitude = venue.longitude
  if (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude)
  ) {
    return `https://www.openstreetmap.org/directions?to=${encodeURIComponent(`${latitude},${longitude}`)}`
  }

  const parts = [venue.address, venue.city, venue.county]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))

  if (parts.length === 0) return null
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${parts.join(', ')}, Ireland`)}`
}
