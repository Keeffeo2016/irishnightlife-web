'use client'

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Clock, Euro, Sparkles, RefreshCw, Share2, Check, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import PlanMap from '@/components/PlanMap'
import { PageHero, HeroAccent } from '@/components/layout/PageHero'
import {
  bestAlternate,
  canShuffleStops,
  detailHrefFromPlan,
  shuffleStops,
  summarizeEvents,
  sortStopsByStart,
  swapStop,
} from '@/lib/planner'

interface Venue {
  id: string
  name: string
  slug: string
  description: string
  address: string
  city: string
  county: string
  latitude: number
  longitude: number
  price_range: string
  music_genres: string[]
  atmosphere: string[]
}

interface Event {
  id: string
  title: string
  slug: string
  description: string
  start_time: string
  end_time: string
  price_min: number
  price_max: number | null
  is_free: boolean
  music_genre: string
  atmosphere: string
  venues: Venue
}

interface ScoredStop {
  event: Event
  reasons: string[]
}

type ShareState = 'idle' | 'copied' | 'failed'

const LOADING_LINES = [
  "Checking who's on tonight…",
  'Leaving room for a late one…',
  'Matching the vibe to the room…',
  'Keeping tomorrow morning in mind…',
]

function checksKey(query: string): string {
  return `irishnightlife:planner-checks:${query}`
}

function readChecks(query: string): string[] {
  try {
    const raw = window.localStorage.getItem(checksKey(query))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

function withReasons(stops: ScoredStop[] | undefined): ScoredStop[] {
  if (!Array.isArray(stops)) return []
  return stops.flatMap(stop => {
    if (!stop?.event?.id) return []
    const reasons = Array.isArray(stop.reasons)
      ? stop.reasons.filter((reason): reason is string => typeof reason === 'string')
      : []
    return [{ event: stop.event, reasons }]
  })
}

function shareLabel(state: ShareState): string {
  switch (state) {
    case 'idle':
      return 'Share Plan'
    case 'copied':
      return 'Copied'
    case 'failed':
      return "Couldn't copy"
    default: {
      const unexpected: never = state
      return unexpected
    }
  }
}

export function PlannerLoading() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex(current => (current + 1) % LOADING_LINES.length)
    }, 1600)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col bg-background">
      <main className="flex flex-1 items-center justify-center py-24">
        <div className="text-center">
          <Sparkles className="mx-auto mb-4 h-16 w-16 animate-pulse text-primary" />
          <h2 className="mb-2 text-2xl font-bold text-foreground">Crafting your perfect night...</h2>
          <p className="text-muted-foreground">{LOADING_LINES[index]}</p>
        </div>
      </main>
    </div>
  )
}

export default function PlanResultContent() {
  const searchParams = useSearchParams()
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [narrative, setNarrative] = useState('')
  const [catalog, setCatalog] = useState<ScoredStop[]>([])
  const [stops, setStops] = useState<ScoredStop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openWhyId, setOpenWhyId] = useState<string | null>(null)
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [shareState, setShareState] = useState<ShareState>('idle')

  const who = searchParams.get('who') || ''
  const occasion = searchParams.get('occasion') || ''
  const vibe = searchParams.get('vibe') || ''
  const budget = searchParams.get('budget') || ''
  const tomorrow = searchParams.get('tomorrow') || ''
  const queryKey = searchParams.toString()

  const fetchPlan = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ who, occasion, vibe, budget, tomorrow }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to generate plan')
      }

      const nextStops = withReasons(data?.stops)
      const nextAlternates = withReasons(data?.alternates)
      setNarrative(typeof data?.narrative === 'string' ? data.narrative : '')
      setCatalog([...nextStops, ...nextAlternates])
      setStops(sortStopsByStart(nextStops))
      setOpenWhyId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [who, occasion, vibe, budget, tomorrow])

  useEffect(() => {
    void fetchPlan()
  }, [fetchPlan])

  useEffect(() => {
    setCheckedIds(readChecks(queryKey))
  }, [queryKey])

  useEffect(() => {
    return () => {
      if (shareTimer.current) clearTimeout(shareTimer.current)
    }
  }, [])

  const mapVenues = useMemo(
    () =>
      stops.map(stop => ({
        id: stop.event.venues.id,
        name: stop.event.venues.name,
        slug: stop.event.venues.slug,
        address: stop.event.venues.address,
        city: stop.event.venues.city,
        latitude: stop.event.venues.latitude,
        longitude: stop.event.venues.longitude,
      })),
    [stops]
  )

  const toggleChecked = (eventId: string) => {
    setCheckedIds(current => {
      const next = current.includes(eventId)
        ? current.filter(id => id !== eventId)
        : [...current, eventId]
      try {
        window.localStorage.setItem(checksKey(queryKey), JSON.stringify(next))
      } catch {
        // The stamp still updates if storage is unavailable.
      }
      return next
    })
  }

  const handleShare = async () => {
    if (shareTimer.current) clearTimeout(shareTimer.current)
    try {
      const wrote = navigator.clipboard.writeText(window.location.href)
      const timedOut = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('clipboard timeout')), 1500)
      })
      await Promise.race([wrote, timedOut])
      setShareState('copied')
    } catch {
      setShareState('failed')
    }
    shareTimer.current = setTimeout(() => setShareState('idle'), 2000)
  }

  const formatWhen = (dateString: string) => {
    const date = new Date(dateString)
    const time = date.toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit',
    })
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const day = new Date(date)
    day.setHours(0, 0, 0, 0)
    const dayOffset = Math.round((day.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (dayOffset === 0) return time
    if (dayOffset === 1) return `Tomorrow ${time}`
    if (dayOffset === -1) return `Yesterday ${time}`
    return `${date.toLocaleDateString('en-IE', { weekday: 'short' })} ${time}`
  }

  const formatRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const sameDay = startDate.toDateString() === endDate.toDateString()
    if (sameDay) {
      const startLabel = formatWhen(start)
      const endTime = endDate.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
      return `${startLabel} - ${endTime}`
    }
    return `${formatWhen(start)} - ${formatWhen(end)}`
  }

  const formatPrice = (event: Event) => {
    if (event.is_free) return 'Free'
    if (event.price_max == null || event.price_min === event.price_max) return `€${event.price_min}`
    return `€${event.price_min}-€${event.price_max}`
  }

  if (loading) return <PlannerLoading />

  if (error) {
    return (
      <div className="flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="brand">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (stops.length === 0) {
    return (
      <div className="flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Nothing lined up</h2>
            <p className="text-muted-foreground mb-4">No events matched this night. Start over and try a different vibe.</p>
            <Link href="/planner">
              <Button variant="brand">Start Over</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const totals = summarizeEvents(stops.map(stop => stop.event))
  const shuffleReady = canShuffleStops(catalog, stops)
  const nightSorted = stops.every(stop => checkedIds.includes(stop.event.id))

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        eyebrow={<Sparkles className="h-10 w-10 text-mint mx-auto" />}
        title={<>Your Perfect <HeroAccent>Night</HeroAccent></>}
        subtitle={<span className="italic">&ldquo;{narrative}&rdquo;</span>}
      >
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-mint" />
            <span>Estimated cost: {totals.total_cost}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-mint" />
            <span>Duration: {totals.estimated_duration}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            onClick={() => setStops(current => shuffleStops(catalog, current))}
            variant="brand"
            disabled={!shuffleReady}
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Shuffle the night
          </Button>
          <Button onClick={() => void fetchPlan()} variant="brand-outline-dark">
            <RefreshCw className="mr-2 h-4 w-4" />
            Fresh draw
          </Button>
          <Button onClick={() => void handleShare()} variant="brand-outline-dark">
            <Share2 className="mr-2 h-4 w-4" />
            {shareLabel(shareState)}
          </Button>
        </div>
      </PageHero>

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ol className="relative space-y-6">
            {stops.length > 1 && (
              <div aria-hidden className="absolute top-10 bottom-10 left-5 w-px -translate-x-1/2 bg-primary/40" />
            )}
            {stops.map((stop, index) => {
              const event = stop.event
              const checked = checkedIds.includes(event.id)
              const replacement = bestAlternate(catalog, stops, index)
              const whyOpen = openWhyId === event.id
              const reasons = stop.reasons.length > 0 ? stop.reasons : ['It lined up with your night.']

              return (
                <li key={event.id} className="relative flex gap-3 sm:gap-4">
                  <div
                    className={`relative z-10 mt-6 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                      checked
                        ? 'bg-primary/15 text-primary ring-2 ring-primary'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <Card
                    className={`relative min-w-0 flex-1 transition-all ${
                      checked
                        ? 'border-primary/40 bg-primary/10/60 opacity-80'
                        : 'border-border bg-card hover:border-primary'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="animate-in fade-in-0 duration-300" key={event.id}>
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div>
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-bold text-foreground">{event.title}</h3>
                              {checked && (
                                <span className="rotate-[-8deg] rounded-md border-2 border-primary px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-primary">
                                  Sorted
                                </span>
                              )}
                            </div>
                            <Link
                              href={detailHrefFromPlan(`/venues/${event.venues.slug}`, queryKey)}
                              className="font-medium text-primary hover:text-primary"
                            >
                              {event.venues.name}
                            </Link>
                          </div>
                          <button
                            type="button"
                            aria-pressed={checked}
                            aria-label={checked ? 'Mark this stop as not sorted' : 'Mark this stop as sorted'}
                            onClick={() => toggleChecked(event.id)}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              checked
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-primary'
                            }`}
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        </div>

                        {event.music_genre && (
                          <Badge className="mb-3 bg-primary/15 text-primary">{event.music_genre}</Badge>
                        )}

                        <p className="mb-4 text-muted-foreground">{event.description}</p>

                        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatRange(event.start_time, event.end_time)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.venues.address}, {event.venues.city}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Euro className="h-4 w-4" />
                            <span>{formatPrice(event)}</span>
                          </div>
                        </div>

                        <div className="mb-4 flex flex-wrap gap-2">
                          {(event.venues.atmosphere ?? []).slice(0, 3).map(atm => (
                            <Badge key={atm} variant="outline" className="border-border text-foreground/90">
                              {atm}
                            </Badge>
                          ))}
                        </div>

                        {whyOpen && (
                          <div className="mb-4 flex animate-in fade-in-0 flex-wrap gap-2">
                            {reasons.map(reason => (
                              <Badge key={reason} className="bg-primary/10 text-mint-light">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-3">
                          <Button variant="brand-outline" onClick={() => setOpenWhyId(whyOpen ? null : event.id)}>
                            {whyOpen ? 'Hide why' : 'Why this'}
                          </Button>
                          <Button
                            variant="outline"
                            className="border-border text-foreground/90 hover:bg-background"
                            disabled={!replacement}
                            onClick={() => {
                              const next = swapStop(catalog, stops, index)
                              if (next) setStops(next)
                            }}
                          >
                            {replacement ? 'Swap' : "That's the only match"}
                          </Button>
                          <Link href={detailHrefFromPlan(`/events/${event.slug}`, queryKey)}>
                            <Button variant="brand-outline">View Event Details</Button>
                          </Link>
                          <Link href={detailHrefFromPlan(`/venues/${event.venues.slug}`, queryKey)}>
                            <Button variant="outline" className="border-border text-foreground/90 hover:bg-background">
                              View Venue
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ol>

          {nightSorted && (
            <p className="mt-8 text-center text-lg font-medium text-primary">That&apos;s the night, sorted.</p>
          )}

          <div className="mt-8">
            <Suspense fallback={
              <div className="bg-card rounded-2xl border-2 border-border p-8 text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Loading map...</h3>
                <p className="text-muted-foreground">Preparing your route</p>
              </div>
            }>
              <PlanMap venues={mapVenues} detailQuery={queryKey} />
            </Suspense>
          </div>

          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Not quite right?</h2>
            <p className="text-muted-foreground mb-6">Shuffle a new route, draw again, or start over</p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={() => setStops(current => shuffleStops(catalog, current))}
                variant="brand"
                disabled={!shuffleReady}
              >
                <Shuffle className="mr-2 h-4 w-4" />
                Shuffle
              </Button>
              <Button onClick={() => void fetchPlan()} variant="brand-outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Fresh draw
              </Button>
              <Link href="/planner">
                <Button variant="brand-outline">Start Over</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
