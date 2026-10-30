import Link from 'next/link'
import { EventCard } from '@/components/EventCard'
import { buttonVariants } from '@/components/ui/button'
import type { HomeEvent } from '@/components/home/types'
import { cn } from 'cn'

type HomeEventSectionProps = {
  id: string
  title: string
  description?: string
  events: HomeEvent[]
  loading?: boolean
  emptyTitle: string
  emptyDescription: string
  emptyActionHref?: string
  emptyActionLabel?: string
  seeAllHref?: string | null
  seeAllLabel?: string
}

export function HomeEventSection({
  id,
  title,
  description,
  events,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  seeAllHref,
  seeAllLabel = 'See all',
}: HomeEventSectionProps) {
  const headingId = `${id}-heading`

  if (!loading && events.length === 0 && !emptyActionHref) {
    return null
  }

  return (
    <section aria-labelledby={headingId} className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 id={headingId} className="text-2xl font-bold text-foreground md:text-3xl">
              {title}
            </h2>
            {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
          </div>
          {seeAllHref ? (
            <Link
              href={seeAllHref}
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 rounded-sm"
            >
              {seeAllLabel}
            </Link>
          ) : null}
        </div>

        {loading ? (
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            aria-busy="true"
            aria-live="polite"
          >
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-xl border border-border bg-card/70 motion-reduce:animate-none"
              />
            ))}
            <span className="sr-only">Loading events</span>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 px-6 py-12 text-center">
            <h3 className="text-xl font-bold text-foreground">{emptyTitle}</h3>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">{emptyDescription}</p>
            {emptyActionHref && emptyActionLabel ? (
              <Link
                href={emptyActionHref}
                className={cn(buttonVariants({ variant: 'brand-outline' }), 'mt-6 inline-flex')}
              >
                {emptyActionLabel}
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
