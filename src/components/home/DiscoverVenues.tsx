import Link from 'next/link'
import { VenueCard, type VenueCardVenue } from '@/components/VenueCard'

type DiscoverVenuesProps = {
  venues: VenueCardVenue[]
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
            className="rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Browse venues
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/80 animate-pulse motion-reduce:animate-none"
              >
                <div className="aspect-video w-full bg-muted/60" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-3/4 rounded-md bg-muted" />
                  <div className="h-4 w-1/2 rounded-md bg-muted/80" />
                </div>
              </div>
            ))}
            <span className="sr-only">Loading venues</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={{ ...venue, is_verified: venue.is_verified ?? true }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
