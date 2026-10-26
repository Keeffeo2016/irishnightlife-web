import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { venueTypeLabel } from '@/lib/venue-profile'
import type { HomeVenue } from '@/components/home/types'

type DiscoverVenuesProps = {
  venues: HomeVenue[]
  loading?: boolean
  county: string
  seeAllHref: string
}

export function DiscoverVenues({ venues, loading = false, county, seeAllHref }: DiscoverVenuesProps) {
  if (!loading && venues.length === 0) return null

  return (
    <section aria-labelledby="discover-venues-heading" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id="discover-venues-heading" className="text-2xl font-bold text-foreground md:text-3xl">
              Discover venues
            </h2>
            <p className="mt-2 text-muted-foreground">
              Verified venues
              {county !== 'All Ireland' ? ` in ${county}` : ' across Ireland'}
              — real places, no fake rankings.
            </p>
          </div>
          <Link
            href={seeAllHref}
            className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-sm"
          >
            Browse venues
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-xl border border-border bg-card/70 motion-reduce:animate-none"
              />
            ))}
            <span className="sr-only">Loading venues</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => {
              const photo = venue.images?.[0] ?? null
              return (
                <Link
                  key={venue.id}
                  href={`/venues/${venue.slug}`}
                  className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Card className="group h-full overflow-hidden border-2 border-border bg-card transition-all hover:border-primary hover:shadow-2xl">
                    {photo ? (
                      <div className="relative aspect-[16/9] w-full bg-muted">
                        <img
                          src={photo}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                        />
                      </div>
                    ) : null}
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                          {venue.name}
                        </h3>
                        {venue.venue_type ? (
                          <Badge variant="outline" className="shrink-0 border-border capitalize text-foreground/90">
                            {venueTypeLabel(venue.venue_type) || venue.venue_type.replaceAll('_', ' ')}
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span>
                          {venue.city}, {venue.county}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
