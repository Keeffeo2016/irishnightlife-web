'use client'

import { Calendar, Compass, RotateCcw, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  categoryOptionLabel,
  formatDateFilterLabel,
  type DublinDateOption,
  type EventsFiltersState,
} from '@/components/events/events-discovery-utils'

export function EventsSkeletonGrid() {
  return (
    <div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
      aria-busy="true"
      aria-live="polite"
    >
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card/80 animate-pulse motion-reduce:animate-none"
        >
          <div className="aspect-video w-full bg-muted/60" />
          <div className="space-y-3 p-5">
            <div className="h-5 w-3/4 rounded-md bg-muted" />
            <div className="h-4 w-1/2 rounded-md bg-muted/80" />
            <div className="h-4 w-full rounded-md bg-muted/60" />
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5">
              <div className="h-4 w-20 rounded-md bg-muted/80" />
              <div className="h-4 w-24 rounded-md bg-muted/80" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading matching events</span>
    </div>
  )
}

interface EventsEmptyStateProps {
  filters: EventsFiltersState
  dateOptions: readonly DublinDateOption[]
  hasActiveFilters: boolean
  onClearDate: () => void
  onSelectCounty: (county: string) => void
  onResetAll: () => void
}

export function EventsEmptyState({
  filters,
  dateOptions,
  hasActiveFilters,
  onClearDate,
  onSelectCounty,
  onResetAll,
}: EventsEmptyStateProps) {
  const dateLabel = formatDateFilterLabel(filters.date, dateOptions)
  const countyText = filters.county === 'All' ? 'across Ireland' : `in ${filters.county}`
  const categoryText =
    filters.type === 'All' ? 'events' : categoryOptionLabel(filters.type).toLowerCase()

  let heading = 'No upcoming events found'
  if (filters.q) {
    heading = `No events matching "${filters.q}" ${countyText}`
  } else if (filters.date === 'tonight') {
    heading = `No ${categoryText} found for tonight ${countyText}`
  } else if (filters.date === 'tomorrow') {
    heading = `No ${categoryText} found for tomorrow ${countyText}`
  } else if (filters.date !== 'all') {
    heading = `No ${categoryText} found for ${dateLabel} ${countyText}`
  } else if (filters.county !== 'All') {
    heading = `No upcoming ${categoryText} listed in ${filters.county}`
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-mint/25 bg-mint/10">
        <SearchX className="h-7 w-7 text-mint" aria-hidden="true" />
      </div>

      <h3 className="mx-auto max-w-lg text-xl font-bold text-foreground sm:text-2xl">
        {heading}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
        Verified venues add new line-ups throughout the week. Try viewing all upcoming dates,
        clearing a filter, or exploring another county.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {filters.date !== 'all' ? (
          <Button
            type="button"
            variant="brand"
            onClick={onClearDate}
            className="min-h-10 gap-2 px-4"
          >
            <Calendar className="h-4 w-4" aria-hidden="true" />
            View all upcoming dates
          </Button>
        ) : null}

        {hasActiveFilters ? (
          <Button
            type="button"
            variant={filters.date !== 'all' ? 'brand-outline' : 'brand'}
            onClick={onResetAll}
            className="min-h-10 gap-2 px-4"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Clear all filters
          </Button>
        ) : null}

        {filters.county !== 'All' && filters.county !== 'Cork' ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onSelectCounty('Cork')}
            className="min-h-10 gap-2 px-4"
          >
            <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
            Explore Cork
          </Button>
        ) : null}

        {filters.county !== 'All' ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => onSelectCounty('All')}
            className="min-h-10 gap-2 px-4"
          >
            <Compass className="h-4 w-4 text-primary" aria-hidden="true" />
            Browse All Ireland
          </Button>
        ) : null}
      </div>
    </div>
  )
}
