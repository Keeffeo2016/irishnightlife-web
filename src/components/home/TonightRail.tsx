'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EventCard } from '@/components/EventCard'
import { buttonVariants } from '@/components/ui/button'
import type { HomeEvent } from '@/components/home/types'
import { cn } from 'cn'

type TonightRailProps = {
  events: HomeEvent[]
  loading?: boolean
  countyLabel: string
  emptyTitle: string
  emptyDescription: string
  emptyActionHref?: string
  emptyActionLabel?: string
  seeAllHref?: string | null
}

export function TonightRail({
  events,
  loading = false,
  countyLabel,
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  seeAllHref,
}: TonightRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollByCard(direction: -1 | 1) {
    const node = scrollerRef.current
    if (!node) return
    const amount = Math.min(320, node.clientWidth * 0.85)
    node.scrollBy({
      left: direction * amount,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  return (
    <section aria-labelledby="tonight-heading" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center rounded-md bg-shamrock px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-night">
              Happening Tonight
            </p>
            <h2 id="tonight-heading" className="text-3xl font-bold text-foreground md:text-4xl">
              Tonight {countyLabel}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Nights starting today - scroll for more, or open the full list.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {events.length > 0 ? (
              <div className="hidden items-center gap-1 sm:flex">
                <button
                  type="button"
                  aria-label="Scroll tonight list left"
                  onClick={() => scrollByCard(-1)}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <ChevronLeft className="size-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll tonight list right"
                  onClick={() => scrollByCard(1)}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <ChevronRight className="size-5" aria-hidden="true" />
                </button>
              </div>
            ) : null}
            {seeAllHref ? (
              <Link
                href={seeAllHref}
                className="rounded-sm text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                See all
              </Link>
            ) : null}
          </div>
        </div>

        {loading ? (
          <div
            className="flex gap-4 overflow-hidden"
            aria-busy="true"
            aria-live="polite"
          >
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-80 w-[min(72vw,16rem)] shrink-0 animate-pulse rounded-2xl border border-border bg-card/70 motion-reduce:animate-none"
              />
            ))}
            <span className="sr-only">Loading tonight&apos;s events</span>
          </div>
        ) : events.length > 0 ? (
          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] motion-reduce:scroll-auto [&::-webkit-scrollbar]:hidden"
          >
            {events.map((event) => (
              <div
                key={event.id}
                className="w-[min(72vw,16rem)] shrink-0 snap-start sm:w-64"
              >
                <EventCard event={event} variant="poster" />
              </div>
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
