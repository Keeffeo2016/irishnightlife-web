'use client'

import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { eventsSearchHref } from '@/components/home/types'
import { cn } from 'cn'

const FEATURED_COUNTIES = ['Cork', 'Dublin', 'Galway', 'Limerick', 'Kerry', 'Waterford', 'Kilkenny'] as const

type CountyExploreProps = {
  selectedCounty: string
  onSelectCounty: (county: string) => void
}

export function CountyExplore({ selectedCounty, onSelectCounty }: CountyExploreProps) {
  return (
    <section aria-labelledby="explore-counties-heading" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 id="explore-counties-heading" className="text-2xl font-bold text-foreground md:text-3xl">
            Explore Ireland by county
          </h2>
          <p className="mt-2 text-muted-foreground">
            Cork is the default starting point — pick any county to refresh what&apos;s listed below.
          </p>
        </div>

        <div
          role="group"
          aria-label="Featured counties"
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {FEATURED_COUNTIES.map((county) => {
            const selected = selectedCounty === county
            return (
              <button
                key={county}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelectCounty(county)}
                className={cn(
                  'min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  selected
                    ? 'border-mint bg-mint text-night'
                    : 'border-primary/40 text-primary hover:border-primary hover:bg-primary/10'
                )}
              >
                {county}
                {county === 'Cork' ? (
                  <span className="ml-1 text-xs font-medium opacity-80">(default)</span>
                ) : null}
              </button>
            )
          })}
          <button
            type="button"
            aria-pressed={selectedCounty === 'All Ireland'}
            onClick={() => onSelectCounty('All Ireland')}
            className={cn(
              'min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              selectedCounty === 'All Ireland'
                ? 'border-mint bg-mint text-night'
                : 'border-primary/40 text-primary hover:border-primary hover:bg-primary/10'
            )}
          >
            All Ireland
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PROVINCES.map((province) => (
            <div key={province}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {province}
              </h3>
              <ul className="space-y-1">
                {IRISH_COUNTIES.filter((county) => county.province === province).map((county) => {
                  const selected = selectedCounty === county.name
                  return (
                    <li key={county.name}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelectCounty(county.name)}
                        className={cn(
                          'w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                          selected
                            ? 'bg-primary/15 font-semibold text-primary'
                            : 'text-foreground/90 hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {county.name}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Prefer a shareable link?{' '}
          <a
            href={eventsSearchHref({ county: selectedCounty })}
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-sm"
          >
            Open events
            {selectedCounty !== 'All Ireland' ? ` in ${selectedCounty}` : ''}
          </a>
        </p>
      </div>
    </section>
  )
}
