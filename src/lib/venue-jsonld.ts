export interface VenueJsonLdInput {
  name: string
  description?: string | null
  url: string
  venueType?: string | null
  image?: string | string[] | null
  telephone?: string | null
  priceRange?: string | null
  streetAddress?: string | null
  addressLocality?: string | null
  addressRegion?: string | null
  postalCode?: string | null
  latitude?: number | null
  longitude?: number | null
}

export function schemaVenueType(venueType: string | null | undefined): string {
  const normalized = (venueType ?? '').trim().toLowerCase()
  switch (normalized) {
    case 'pub':
    case 'bar':
      return 'BarOrPub'
    case 'club':
      return 'NightClub'
    case 'restaurant':
      return 'Restaurant'
    case 'live_music_venue':
      return 'MusicVenue'
    default:
      return 'LocalBusiness'
  }
}

export function buildVenueJsonLd(
  input: VenueJsonLdInput
): Record<string, unknown> | null {
  const name = input.name?.trim()
  const url = input.url?.trim()
  if (!name || !url) {
    return null
  }

  const venue: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaVenueType(input.venueType),
    name,
    url,
  }

  if (input.description?.trim()) {
    venue.description = input.description.trim()
  }

  if (typeof input.image === 'string' && input.image.trim()) {
    venue.image = input.image.trim()
  } else if (Array.isArray(input.image)) {
    const validImages = input.image
      .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
      .map((img) => img.trim())
    if (validImages.length === 1) {
      venue.image = validImages[0]
    } else if (validImages.length > 1) {
      venue.image = validImages
    }
  }

  if (input.telephone?.trim()) {
    venue.telephone = input.telephone.trim()
  }

  if (input.priceRange?.trim()) {
    venue.priceRange = input.priceRange.trim()
  }

  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressCountry: 'IE',
  }
  if (input.streetAddress?.trim()) {
    address.streetAddress = input.streetAddress.trim()
  }
  if (input.addressLocality?.trim()) {
    address.addressLocality = input.addressLocality.trim()
  }
  if (input.addressRegion?.trim()) {
    address.addressRegion = input.addressRegion.trim()
  }
  if (input.postalCode?.trim()) {
    address.postalCode = input.postalCode.trim()
  }
  if (Object.keys(address).length > 2) {
    venue.address = address
  }

  if (
    typeof input.latitude === 'number' &&
    Number.isFinite(input.latitude) &&
    typeof input.longitude === 'number' &&
    Number.isFinite(input.longitude)
  ) {
    venue.geo = {
      '@type': 'GeoCoordinates',
      latitude: input.latitude,
      longitude: input.longitude,
    }
  }

  return venue
}
