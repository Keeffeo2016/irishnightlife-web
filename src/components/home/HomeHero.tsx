'use client'

import Image from 'next/image'
import { FormEvent, useId, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Search } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { HeroAccent } from '@/components/layout/PageHero'
import { IRISH_COUNTIES, PROVINCES } from '@/lib/counties'
import { EVENT_TYPES } from '@/lib/venue-profile'
import { eventsSearchHref } from '@/components/home/types'
import { cn } from 'cn'

const EVENT_TYPE_OPTIONS = [
  { value: 'All', label: 'All event types' },
  ...EVENT_TYPES.map((type) => ({ value: type.value, label: type.label })),
]

type HomeHeroProps = {
  county: string
  onCountyChange: (county: string) => void
}

export function HomeHero({ county, onCountyChange }: HomeHeroProps) {
  const router = useRouter()
  const keywordId = useId()
  const countyId = useId()
  const typeId = useId()
  const [keyword, setKeyword] = useState('')
  const [eventType, setEventType] = useState('All')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const q = String(data.get('q') ?? keyword).trim()
    const nextCounty = String(data.get('county') ?? county)
    const nextType = String(data.get('type') ?? eventType)
    router.push(
      eventsSearchHref({
        q,
        county: nextCounty,
        type: nextType,
      })
    )
  }

  return (
    <section className="relative z-20 overflow-hidden border-b border-border bg-gradient-to-br from-night via-night-soft to-forest">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15">
        <div
          aria-hidden
          className="h-full w-full max-w-4xl bg-mint"
          style={{
            maskImage: 'url(/ireland-map.svg)',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: 'contain',
          }}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-56 w-56 rounded-full bg-mint/10 blur-3xl motion-reduce:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-mint-light/10 blur-3xl motion-reduce:hidden"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-3 flex justify-center">
            <Image
              src="/brand/wordmark.png"
              alt="IrishNightlife"
              width={600}
              height={160}
              priority
              className="h-12 w-auto"
            />
          </div>
          <h1 className="mb-4 text-balance text-[clamp(2rem,6vw,3.75rem)] font-bold leading-[1.1] text-white">
            Find Your Next <HeroAccent>Night Out</HeroAccent>
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-base text-foreground/80 md:text-lg">
            Discover live music, pubs, clubs, comedy and events across Ireland.
          </p>
        </div>

        <form
          action="/events"
          method="get"
          onSubmit={handleSubmit}
          className="mx-auto mt-10 max-w-4xl rounded-2xl border border-input bg-card/90 p-4 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-5"
          role="search"
          aria-label="Search events"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-5">
              <label htmlFor={keywordId} className="mb-1.5 block text-sm font-medium text-foreground">
                Keyword
              </label>
              <div className="relative">
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
                  className="h-11 border-input bg-background pl-10 text-base"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label htmlFor={countyId} className="mb-1.5 block text-sm font-medium text-foreground">
                County
              </label>
              <div className="relative flex h-11 items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
                <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <select
                  id={countyId}
                  name="county"
                  value={county}
                  onChange={(e) => onCountyChange(e.target.value)}
                  className="h-full w-full min-w-0 bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  <option value="All Ireland">All Ireland</option>
                  {PROVINCES.map((province) => (
                    <optgroup key={province} label={province}>
                      {IRISH_COUNTIES.filter((item) => item.province === province).map((item) => (
                        <option key={item.name} value={item.name}>
                          {item.name}
                          {item.name === 'Cork' ? ' (default)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor={typeId} className="mb-1.5 block text-sm font-medium text-foreground">
                Event type
              </label>
              <select
                id={typeId}
                name="type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className={cn(buttonVariants({ variant: 'brand' }), 'h-11 w-full px-4 text-sm sm:text-base')}
              >
                Search Events
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
