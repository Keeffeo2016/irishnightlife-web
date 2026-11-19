'use client'

import { useId, useState } from 'react'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { eventsSearchHref } from '@/components/home/types'
import { cn } from 'cn'

const FEATURED_COUNTIES = [
  'Cork',
  'Dublin',
  'Galway',
  'Limerick',
  'Kerry',
  'Waterford',
  'Kilkenny',
] as const

type LocationSelectorProps = {
  selectedCounty: string
  onSelectCounty: (county: string) => void
}

export function LocationSelector({ selectedCounty, onSelectCounty }: LocationSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  const panelId = useId()
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="band-wash">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id={headingId} className="text-2xl font-bold text-foreground md:text-3xl">
              Where are you going out?
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
              Pick a county to refresh tonight&apos;s listings.
            </p>
          </div>
          <a
            href={eventsSearchHref({ county: selectedCounty })}
            className="rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            Open events
            {selectedCounty !== 'All Ireland' ? ` in ${selectedCounty}` : ''}
          </a>
        </div>

        <div
          role="group"
          aria-label="Featured counties"
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  'min-h-11 shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                  selected
                    ? 'border-hotpink bg-hotpink text-night'
                    : 'border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-card'
                )}
              >
                {county}
              </button>
            )
          })}
          <button
            type="button"
            aria-pressed={selectedCounty === 'All Ireland'}
            onClick={() => onSelectCounty('All Ireland')}
            className={cn(
              'min-h-11 shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
              selectedCounty === 'All Ireland'
                ? 'border-hotpink bg-hotpink text-night'
                : 'border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-card'
            )}
          >
            All Ireland
          </button>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((open) => !open)}
            className="min-h-11 shrink-0 rounded-lg border border-dashed border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {expanded ? 'Hide counties' : 'More counties'}
          </button>
        </div>

        {expanded ? (
          <div
            id={panelId}
            className="mt-6 grid gap-5 rounded-xl border border-border bg-card/40 p-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {PROVINCES.map((province) => (
              <div key={province}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {province}
                </h3>
                <ul className="flex flex-wrap gap-1.5">
                  {IRISH_COUNTIES.filter((county) => county.province === province).map((county) => {
                    const selected = selectedCounty === county.name
                    return (
                      <li key={county.name}>
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => {
                            onSelectCounty(county.name)
                            setExpanded(false)
                          }}
                          className={cn(
                            'rounded-md px-2.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
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
        ) : null}
      </div>
    </section>
  )
}
