'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FormEvent, useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HeroAccent } from '@/components/layout/PageHero'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { eventsSearchHref } from '@/components/home/types'
import { cn } from 'cn'

type HomeHeroProps = {
  county: string
  onCountyChange: (county: string) => void
  tonightCount: number
  heroImageUrl: string
  eventsLoading?: boolean
}

export function HomeHero({
  county,
  onCountyChange,
  tonightCount,
  heroImageUrl,
  eventsLoading = false,
}: HomeHeroProps) {
  const router = useRouter()
  const keywordId = useId()
  const countyId = useId()
  const [keyword, setKeyword] = useState('')

  const locationLabel = county === 'All Ireland' ? 'Ireland' : county
  const tonightHref = eventsSearchHref({ county })
  // Keep this stable on first paint (avoid loading-copy hydration mismatches under PPR).
  const tonightLine =
    !eventsLoading && tonightCount > 0
      ? `${tonightCount} night${tonightCount === 1 ? '' : 's'} listed tonight in ${locationLabel}`
      : `Tonight in ${locationLabel}`

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const q = String(data.get('q') ?? keyword).trim()
    const nextCounty = String(data.get('county') ?? county)
    router.push(
      eventsSearchHref({
        q,
        county: nextCounty,
      })
    )
  }

  return (
    <section className="relative z-20 overflow-hidden bg-night">
      {/* Full-bleed cinematic plane */}
      <div className="absolute inset-0">
        <Image
          src={heroImageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover hero-cinematic-media"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/40"
        />
        <div aria-hidden className="hero-cinematic-wash pointer-events-none absolute inset-0" />
      </div>

      <div className="relative mx-auto flex min-h-[min(88vh,44rem)] max-w-7xl flex-col justify-end px-4 pb-10 pt-20 sm:px-6 md:pb-14 md:pt-24 lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium tracking-wide text-shamrock md:text-base">
            {tonightLine}
          </p>

          <h1 className="mb-4 text-balance text-[clamp(2.25rem,6.5vw,4rem)] font-bold leading-[1.05] text-white">
            Find Your Next <HeroAccent>Night Out</HeroAccent>
          </h1>

          <p className="max-w-xl text-pretty text-base text-foreground/85 md:text-lg">
            Live music, clubs, comedy and pubs across Ireland - curated for tonight.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={tonightHref}
              className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'px-7')}
            >
              Browse Tonight
            </Link>
            <Link
              href="/planner"
              className={cn(
                buttonVariants({ variant: 'brand-outline', size: 'lg' }),
                'inline-flex gap-2 px-7'
              )}
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Plan My Night
            </Link>
          </div>
        </div>

        {/* Slim search strip - below the hero CTA group, not a hero card */}
        <form
          action="/events"
          method="get"
          onSubmit={handleSubmit}
          className="mt-10 w-full max-w-3xl"
          role="search"
          aria-label="Search events"
        >
          <div className="flex flex-col gap-2 rounded-xl border border-white/15 bg-night/70 p-2 backdrop-blur-md sm:flex-row sm:items-stretch sm:gap-2 sm:p-2">
            <div className="relative min-w-0 flex-1">
              <label htmlFor={keywordId} className="sr-only">
                Keyword
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={keywordId}
                name="q"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Artist, venue, or night…"
                className="h-11 border-0 bg-transparent pl-10 text-base shadow-none focus-visible:ring-0"
                autoComplete="off"
              />
            </div>

            <div className="relative flex h-11 min-w-[10rem] items-center gap-2 border-t border-white/10 px-3 sm:border-t-0 sm:border-l sm:border-white/10">
              <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <label htmlFor={countyId} className="sr-only">
                County
              </label>
              <select
                id={countyId}
                name="county"
                value={county}
                onChange={(e) => onCountyChange(e.target.value)}
                className="h-full w-full min-w-0 bg-transparent text-sm font-medium text-foreground outline-none scheme-dark [&_option]:bg-night [&_option]:text-foreground [&_optgroup]:bg-night [&_optgroup]:text-foreground"
              >
                <option value="All Ireland">All Ireland</option>
                {PROVINCES.map((province) => (
                  <optgroup key={province} label={province}>
                    {IRISH_COUNTIES.filter((item) => item.province === province).map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className={cn(
                buttonVariants({ variant: 'brand' }),
                'h-11 shrink-0 px-5 text-sm sm:text-base'
              )}
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
