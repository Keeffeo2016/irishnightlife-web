'use client'

import { useId, useState } from 'react'
import { Calendar, Filter, MapPin, Music2, RotateCcw, Sparkles, Ticket } from 'lucide-react'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  EVENT_CATEGORY_OPTIONS,
  POPULAR_COUNTIES,
  type DublinDateOption,
  type EventsFiltersState,
} from '@/components/events/events-discovery-utils'

export interface EventsFilterControlsProps {
  filters: EventsFiltersState
  dateOptions: readonly DublinDateOption[]
  genreOptions: readonly string[]
  activeFilterCount: number
  onUpdateFilters: (patch: Partial<EventsFiltersState>) => void
  onResetAll: () => void
}

function FilterControlFields({
  idPrefix,
  filters,
  dateOptions,
  genreOptions,
  onUpdateFilters,
}: {
  idPrefix: string
  filters: EventsFiltersState
  dateOptions: readonly DublinDateOption[]
  genreOptions: readonly string[]
  onUpdateFilters: (patch: Partial<EventsFiltersState>) => void
}) {
  const countySelectId = `${idPrefix}-county-select`
  const dateSelectId = `${idPrefix}-date-select`
  const typeSelectId = `${idPrefix}-type-select`
  const genreSelectId = `${idPrefix}-genre-select`

  return (
    <div className="space-y-6">
      {/* County Filter */}
      <div>
        <label
          htmlFor={countySelectId}
          className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground"
        >
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          County
        </label>
        <select
          id={countySelectId}
          value={filters.county}
          onChange={(e) => onUpdateFilters({ county: e.target.value })}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="All">All Ireland (32 counties)</option>
          {PROVINCES.map((province) => (
            <optgroup key={province} label={province}>
              {IRISH_COUNTIES.filter((county) => county.province === province).map((county) => (
                <option key={county.name} value={county.name}>
                  {county.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Quick County Pills */}
        <div className="mt-2.5 flex flex-wrap gap-1.5" role="group" aria-label="Popular counties">
          {POPULAR_COUNTIES.map((county) => {
            const active = filters.county === county
            return (
              <button
                key={county}
                type="button"
                onClick={() => onUpdateFilters({ county })}
                aria-pressed={active}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'border-mint bg-mint text-night'
                    : 'border-border bg-foreground/5 text-foreground/80 hover:border-mint/60 hover:text-mint'
                }`}
              >
                {county === 'All' ? 'All Ireland' : county}
              </button>
            )
          })}
        </div>
      </div>

      {/* Date Filter */}
      <div>
        <label
          htmlFor={dateSelectId}
          className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground"
        >
          <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Date (Irish Time)
        </label>
        <select
          id={dateSelectId}
          value={filters.date}
          onChange={(e) => onUpdateFilters({ date: e.target.value })}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {dateOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Event Type Filter */}
      <div>
        <label
          htmlFor={typeSelectId}
          className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Event Category
        </label>
        <select
          id={typeSelectId}
          value={filters.type}
          onChange={(e) => onUpdateFilters({ type: e.target.value })}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {EVENT_CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Music Genre Filter */}
      <div>
        <label
          htmlFor={genreSelectId}
          className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-muted-foreground"
        >
          <Music2 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Music Genre
        </label>
        <select
          id={genreSelectId}
          value={filters.genre}
          onChange={(e) => onUpdateFilters({ genre: e.target.value })}
          className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {genreOptions.map((genre) => (
            <option key={genre} value={genre}>
              {genre === 'All' ? 'All music genres' : genre}
            </option>
          ))}
        </select>
      </div>

      {/* Free Entry Toggle */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onUpdateFilters({ free: !filters.free })}
          aria-pressed={filters.free}
          className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
            filters.free
              ? 'border-mint bg-mint/15 text-mint'
              : 'border-border bg-background/60 text-foreground/90 hover:border-mint/50'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" aria-hidden="true" />
            <span>Free entry only</span>
          </span>
          <span
            aria-hidden="true"
            className={`inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
              filters.free ? 'bg-mint justify-end' : 'bg-muted justify-start'
            }`}
          >
            <span
              className={`h-4 w-4 rounded-full ${
                filters.free ? 'bg-night' : 'bg-muted-foreground/70'
              }`}
            />
          </span>
        </button>
      </div>
    </div>
  )
}

export function EventsFilterSidebar({
  filters,
  dateOptions,
  genreOptions,
  activeFilterCount,
  onUpdateFilters,
  onResetAll,
}: EventsFilterControlsProps) {
  const sidebarId = useId()

  return (
    <aside
      aria-label="Event filters"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-24"
    >
      <div className="mb-5 flex items-center justify-between border-b border-border pb-3.5">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">Filters</h2>
          {activeFilterCount > 0 ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-mint px-1.5 text-xs font-bold text-night">
              {activeFilterCount}
            </span>
          ) : null}
        </div>
        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={onResetAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Reset
          </button>
        ) : null}
      </div>

      <FilterControlFields
        idPrefix={`desktop-${sidebarId}`}
        filters={filters}
        dateOptions={dateOptions}
        genreOptions={genreOptions}
        onUpdateFilters={onUpdateFilters}
      />
    </aside>
  )
}

export function EventsMobileFilterSheet({
  filters,
  dateOptions,
  genreOptions,
  activeFilterCount,
  onUpdateFilters,
  onResetAll,
}: EventsFilterControlsProps) {
  const [open, setOpen] = useState(false)
  const sheetId = useId()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="min-h-10 gap-2 rounded-xl border-border bg-card px-3.5 text-sm font-medium text-foreground hover:border-primary"
          />
        }
      >
        <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
        <span>Filters</span>
        {activeFilterCount > 0 ? (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-mint px-1.5 text-xs font-bold text-night">
            {activeFilterCount}
          </span>
        ) : null}
      </DialogTrigger>

      <DialogContent className="max-h-[88vh] overflow-y-auto rounded-2xl border border-border bg-card p-5 text-foreground sm:max-w-md">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold text-foreground">
            Filter Events
          </DialogTitle>
          <DialogDescription>
            Refine by county, date, category, music genre, or free entry.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <FilterControlFields
            idPrefix={`mobile-${sheetId}`}
            filters={filters}
            dateOptions={dateOptions}
            genreOptions={genreOptions}
            onUpdateFilters={onUpdateFilters}
          />
        </div>

        <DialogFooter className="mt-2 flex-row items-center justify-between gap-2 border-t border-border bg-card pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onResetAll()
            }}
            disabled={activeFilterCount === 0}
            className="min-h-10"
          >
            Reset all
          </Button>
          <DialogClose
            render={
              <Button
                type="button"
                variant="brand"
                className="min-h-10 flex-1 sm:flex-initial"
              />
            }
          >
            Show results
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
