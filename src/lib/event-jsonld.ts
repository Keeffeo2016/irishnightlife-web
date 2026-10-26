export interface EventJsonLdInput {
  name: string
  description?: string | null
  startDate: string
  endDate?: string | null
  url: string
  image?: string | null
  venueName: string
  streetAddress?: string | null
  addressLocality?: string | null
  addressRegion?: string | null
}

export function buildEventJsonLd(input: EventJsonLdInput): Record<string, unknown> | null {
  if (!input.name.trim() || !input.startDate || !input.venueName.trim() || !input.url) {
    return null
  }

  const start = new Date(input.startDate)
  if (Number.isNaN(start.getTime())) return null

  const location: Record<string, unknown> = {
    '@type': 'Place',
    name: input.venueName,
  }

  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressCountry: 'IE',
  }
  if (input.streetAddress?.trim()) address.streetAddress = input.streetAddress.trim()
  if (input.addressLocality?.trim()) address.addressLocality = input.addressLocality.trim()
  if (input.addressRegion?.trim()) address.addressRegion = input.addressRegion.trim()
  if (Object.keys(address).length > 2) {
    location.address = address
  }

  const event: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: input.name.trim(),
    startDate: input.startDate,
    url: input.url,
    location,
  }

  if (input.description?.trim()) event.description = input.description.trim()
  if (input.image?.trim()) event.image = input.image.trim()
  if (input.endDate) {
    const end = new Date(input.endDate)
    if (!Number.isNaN(end.getTime())) event.endDate = input.endDate
  }

  return event
}
