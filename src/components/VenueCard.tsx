import Link from 'next/link'
import {
  Beer,
  CheckCircle2,
  Disc3,
  MapPin,
  Music,
  Sparkles,
  Utensils,
  Wine,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FavoriteButton } from '@/components/FavoriteButton'
import { venueTypeLabel } from '@/lib/venue-profile'

export interface VenueCardVenue {
  id: string
  name: string
  slug: string
  description?: string | null
  address?: string | null
  city: string
  county: string
  venue_type: string | null
  price_range?: string | null
  music_genres?: string[] | null
  atmosphere?: string[] | null
  is_verified?: boolean
  images?: string[] | null
}

function VenueTypeIcon({ venueType }: { venueType: string | null | undefined }) {
  const normalized = (venueType ?? '').trim().toLowerCase()
  switch (normalized) {
    case 'pub':
      return <Beer className="h-7 w-7 text-mint/80" aria-hidden="true" />
    case 'bar':
      return <Wine className="h-7 w-7 text-mint/80" aria-hidden="true" />
    case 'club':
      return <Disc3 className="h-7 w-7 text-mint/80" aria-hidden="true" />
    case 'live_music_venue':
      return <Music className="h-7 w-7 text-mint/80" aria-hidden="true" />
    case 'restaurant':
      return <Utensils className="h-7 w-7 text-mint/80" aria-hidden="true" />
    default:
      return <Sparkles className="h-7 w-7 text-mint/80" aria-hidden="true" />
  }
}

export function resolveVenueCardImage(images: string[] | null | undefined): string | null {
  if (!Array.isArray(images)) return null
  const firstValid = images.find((img) => typeof img === 'string' && img.trim().length > 0)
  return firstValid ? firstValid.trim() : null
}

export function formatVenueCardLocation(venue: Pick<VenueCardVenue, 'city' | 'county'>): string {
  const city = venue.city?.trim()
  const county = venue.county?.trim()
  if (city && county) {
    if (city.toLowerCase() === county.toLowerCase()) {
      return county
    }
    return `${city}, Co. ${county}`
  }
  return city || county || 'Ireland'
}

function pickVenueTags(venue: Pick<VenueCardVenue, 'music_genres' | 'atmosphere'>): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  const candidates = [
    ...(Array.isArray(venue.music_genres) ? venue.music_genres : []),
    ...(Array.isArray(venue.atmosphere) ? venue.atmosphere : []),
  ]
  for (const raw of candidates) {
    if (typeof raw !== 'string') continue
    const trimmed = raw.trim()
    if (!trimmed) continue
    const lower = trimmed.toLowerCase()
    if (seen.has(lower)) continue
    seen.add(lower)
    result.push(trimmed)
    if (result.length >= 3) break
  }
  return result
}

export function VenueCard({
  venue,
  href,
}: {
  venue: VenueCardVenue
  href?: string
}) {
  const imageUrl = resolveVenueCardImage(venue.images)
  const typeLabel = venueTypeLabel(venue.venue_type) || 'Venue'
  const locationLabel = formatVenueCardLocation(venue)
  const priceRange = venue.price_range?.trim() || null
  const description = venue.description?.trim() || null
  const tags = pickVenueTags(venue)

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/70 hover:shadow-xl hover:shadow-black/25 focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/50">
      {/* Save Button (elevated above stretched link, not nested inside <a>) */}
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton venueId={venue.id} variant="icon" label={venue.name} />
      </div>

      {/* 16:9 Media / Branded Header */}
      <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-border/60 bg-gradient-to-br from-night via-night-soft to-forest">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/20 to-transparent"
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div
              aria-hidden="true"
              className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-mint/20 bg-mint/10 shadow-inner"
            >
              <VenueTypeIcon venueType={venue.venue_type} />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-mint/75">
              {typeLabel}
            </span>
          </div>
        )}

        {/* Top-left badges over media */}
        <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-4.5rem)] flex-wrap items-center gap-1.5">
          <Badge className="border border-mint/30 bg-night/85 text-mint backdrop-blur-sm">
            {typeLabel}
          </Badge>
          {venue.is_verified ? (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 border-mint/35 bg-night/85 text-mint backdrop-blur-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Verified</span>
            </Badge>
          ) : null}
        </div>

        {/* Bottom-right price range badge over media */}
        {priceRange ? (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="rounded-lg border border-white/15 bg-night/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
              {priceRange}
            </span>
          </div>
        ) : null}
      </div>

      {/* Card Body */}
      <CardContent className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="mb-1.5 line-clamp-1 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            <Link
              href={href ?? `/venues/${venue.slug}`}
              className="outline-none after:absolute after:inset-0"
            >
              {venue.name}
            </Link>
          </h3>

          <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="line-clamp-1">{locationLabel}</span>
          </div>

          {description ? (
            <p className="mb-3.5 line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}

          {tags.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="border-border/80 bg-background/50 text-xs font-normal text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/70 pt-3.5 text-sm">
          <span className="text-xs text-muted-foreground">
            {priceRange ? `Price guide ${priceRange}` : typeLabel}
          </span>
          <span
            aria-hidden="true"
            className="inline-flex items-center gap-1 font-semibold text-primary transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          >
            View venue →
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
