'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Compass,
  Euro,
  MapPin,
  RefreshCw,
  Share2,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import {
  eventTypeLabel,
  formatEventDate,
  formatEventPrice,
  formatEventTime,
} from '@/components/EventCard'
import { FavoriteButton } from '@/components/FavoriteButton'
import PlanMap, { type PlanMapVenue } from '@/components/PlanMap'
import { HeroAccent, PageHero } from '@/components/layout/PageHero'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  bestAlternate,
  buildPlannerWizardHref,
  canShuffleStops,
  detailHrefFromPlan,
  parsePlannerSearchParams,
  shuffleStops,
  sortStopsByStart,
  summarizeEvents,
  swapStop,
} from '@/lib/planner'

interface Venue {
  id: string
  name: string
  slug: string
  description?: string | null
  address?: string | null
  city?: string | null
  county?: string | null
  latitude?: number | null
  longitude?: number | null
  price_range?: string | null
  music_genres?: string[] | null
  atmosphere?: string[] | null
}

interface Event {
  id: string
  title: string
  slug: string
  description?: string | null
  event_type?: string | null
  start_time: string
  end_time: string
  price_min: number | null
  price_max: number | null
  is_free: boolean
  music_genre?: string | null
  atmosphere?: string | null
  venues: Venue
}

interface ScoredStop {
  event: Event
  reasons: string[]
}

type ShareState = 'idle' | 'copied' | 'shared' | 'failed'

const LOADING_LINES = [
  "Checking what's on across verified venues…",
  'Matching the atmosphere and music to your choices…',
  'Pacing the stops for your tomorrow morning plan…',
  'Putting together your route for the night…',
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
    if (!stop?.event?.id || !stop?.event?.venues) return []
    const reasons = Array.isArray(stop.reasons)
      ? stop.reasons.filter((reason): reason is string => typeof reason === 'string' && reason.trim().length > 0)
      : []
    return [{ event: stop.event, reasons }]
  })
}

function shareLabel(state: ShareState): string {
  switch (state) {
    case 'idle':
      return 'Share plan'
    case 'copied':
      return 'Link copied'
    case 'shared':
      return 'Plan shared'
    case 'failed':
      return "Couldn't copy"
    default: {
      const unexpected: never = state
      return unexpected
    }
  }
}

function formatStopLocation(venue: Venue): string {
  const address = venue.address?.trim()
  const city = venue.city?.trim()
  const county = venue.county?.trim()

  const parts: string[] = []
  if (address) parts.push(address)
  if (city) parts.push(city)
  if (county && (!city || city.toLowerCase() !== county.toLowerCase())) {
    parts.push(`Co. ${county}`)
  }

  return parts.join(', ') || 'Ireland'
}

function formatStopTimeRange(startIso: string, endIso: string): string {
  const startDateLabel = formatEventDate(startIso)
  const startTimeLabel = formatEventTime(startIso)
  const endTimeLabel = formatEventTime(endIso)

  if (!startDateLabel && !startTimeLabel) return 'Time TBA'
  if (startTimeLabel && endTimeLabel) {
    return `${startDateLabel} · ${startTimeLabel}–${endTimeLabel}`
  }
  if (startTimeLabel) {
    return `${startDateLabel} · ${startTimeLabel}`
  }
  return startDateLabel
}

function shouldShowGenreBadge(eventType: string | null | undefined, musicGenre: string | null | undefined): boolean {
  const trimmed = musicGenre?.trim()
  if (!trimmed) return false
  const lower = trimmed.toLowerCase()
  const typeLower = (eventType ?? '').trim().toLowerCase()
  const labelLower = eventTypeLabel(eventType).toLowerCase()
  return lower !== typeLower && lower !== labelLower && lower !== typeLower.replaceAll('_', ' ')
}

export function PlannerLoading() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex(current => (current + 1) % LOADING_LINES.length)
    }, 1800)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        eyebrow={
          <Badge className="border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-mint">
            NIGHT PLANNER ITINERARY
          </Badge>
        }
        title={
          <>
            Your Night, <HeroAccent>Planned.</HeroAccent>
          </>
        }
        subtitle="Putting together a route based on your preferences."
        align="left"
        showMap={false}
        compact
      />

      <main className="flex-1">
        <div
          role="status"
          aria-live="polite"
          className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8"
        >
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-mint/30 bg-mint/10 px-5 py-4">
            <Sparkles
              className="h-5 w-5 shrink-0 animate-pulse text-mint motion-reduce:animate-none"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-white">Building your night plan…</p>
              <p className="text-xs text-muted-foreground">{LOADING_LINES[index]}</p>
            </div>
          </div>

          <div className="space-y-5">
            {[1, 2, 3].map(stopNum => (
              <div
                key={stopNum}
                className="rounded-2xl border border-border bg-card p-6 animate-pulse motion-reduce:animate-none"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-8 w-20 rounded-full bg-muted" />
                  <div className="h-6 w-24 rounded-full bg-muted" />
                </div>
                <div className="mb-2 h-7 w-2/3 rounded-lg bg-muted" />
                <div className="mb-4 h-4 w-1/3 rounded-lg bg-muted" />
                <div className="mb-4 h-16 w-full rounded-xl bg-muted/70" />
                <div className="flex gap-3">
                  <div className="h-9 w-28 rounded-lg bg-muted" />
                  <div className="h-9 w-36 rounded-lg bg-muted" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 h-72 rounded-2xl border border-border bg-card animate-pulse motion-reduce:animate-none" />
        </div>
      </main>
    </div>
  )
}

export default function PlanResultContent() {
  const searchParams = useSearchParams()
  const queryKey = searchParams.toString()

  return <PlanResultView key={queryKey} queryKey={queryKey} />
}

function PlanResultView({ queryKey }: { queryKey: string }) {
  const searchParams = useSearchParams()
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [narrative, setNarrative] = useState('')
  const [apiTotals, setApiTotals] = useState<{ total_cost?: string; estimated_duration?: string }>({})
  const [catalog, setCatalog] = useState<ScoredStop[]>([])
  const [stops, setStops] = useState<ScoredStop[]>([])
  const [loading, setLoading] = useState(true)
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checkedIds, setCheckedIds] = useState<string[]>(() => readChecks(queryKey))
  const [shareState, setShareState] = useState<ShareState>('idle')
  const [drawCount, setDrawCount] = useState(0)

  const parsedPrefs = useMemo(
    () => parsePlannerSearchParams(searchParams),
    [searchParams]
  )
  const who = searchParams.get('who') || ''
  const occasion = searchParams.get('occasion') || ''
  const vibe = searchParams.get('vibe') || ''
  const budget = searchParams.get('budget') || ''
  const tomorrow = searchParams.get('tomorrow') || ''
  const adjustPrefsHref = useMemo(
    () => buildPlannerWizardHref(parsedPrefs),
    [parsedPrefs]
  )

  const requestFreshDraw = useCallback(() => {
    setLoading(true)
    setError(null)
    setEmptyMessage(null)
    setDrawCount(count => count + 1)
  }, [])

  useEffect(() => {
    let active = true

    async function loadPlan() {
      try {
        const response = await fetch('/api/planner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ who, occasion, vibe, budget, tomorrow }),
        })

        const data = await response.json().catch(() => null)
        if (!active) return

        if (response.status === 404) {
          setStops([])
          setCatalog([])
          setEmptyMessage(
            typeof data?.error === 'string'
              ? data.error
              : 'No events matched your preferences in the next 48 hours.'
          )
          setLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error(data?.error || 'Failed to generate plan')
        }

        const nextStops = withReasons(data?.stops)
        const nextAlternates = withReasons(data?.alternates)
        setNarrative(typeof data?.narrative === 'string' ? data.narrative : '')
        setApiTotals({
          total_cost: typeof data?.total_cost === 'string' ? data.total_cost : undefined,
          estimated_duration:
            typeof data?.estimated_duration === 'string' ? data.estimated_duration : undefined,
        })
        setCatalog([...nextStops, ...nextAlternates])
        setStops(sortStopsByStart(nextStops))
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unable to load your night plan right now.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadPlan()

    return () => {
      active = false
    }
  }, [who, occasion, vibe, budget, tomorrow, drawCount])

  useEffect(() => {
    return () => {
      if (shareTimer.current) clearTimeout(shareTimer.current)
    }
  }, [])

  const mapVenues: PlanMapVenue[] = useMemo(
    () =>
      stops.map((stop, index) => ({
        id: stop.event.venues.id,
        name: stop.event.venues.name,
        slug: stop.event.venues.slug,
        address: stop.event.venues.address,
        city: stop.event.venues.city,
        county: stop.event.venues.county,
        latitude: stop.event.venues.latitude,
        longitude: stop.event.venues.longitude,
        stopNumber: index + 1,
        eventTitle: stop.event.title,
        eventSlug: stop.event.slug,
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
        // State still updates in memory if localStorage is unavailable.
      }
      return next
    })
  }

  const handleShare = async () => {
    if (shareTimer.current) clearTimeout(shareTimer.current)
    const shareUrl = window.location.href

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({
          title: 'My Night Plan — IrishNightlife.ie',
          text: narrative || 'Check out this night plan on IrishNightlife.ie',
          url: shareUrl,
        })
        setShareState('shared')
        shareTimer.current = setTimeout(() => setShareState('idle'), 2500)
        return
      }
    } catch (shareErr) {
      if (shareErr instanceof Error && shareErr.name === 'AbortError') {
        return
      }
      // Fall through to clipboard copy if navigator.share failed
    }

    try {
      const wrote = navigator.clipboard.writeText(shareUrl)
      const timedOut = new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('clipboard timeout')), 1500)
      })
      await Promise.race([wrote, timedOut])
      setShareState('copied')
    } catch {
      setShareState('failed')
    }
    shareTimer.current = setTimeout(() => setShareState('idle'), 2500)
  }

  if (loading) return <PlannerLoading />

  if (error) {
    return (
      <div className="flex flex-col bg-background">
        <PageHero
          eyebrow={
            <Badge className="border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-mint">
              NIGHT PLANNER ITINERARY
            </Badge>
          }
          title={
            <>
              Your Night, <HeroAccent>Planned.</HeroAccent>
            </>
          }
          subtitle="We hit a snag while putting your itinerary together."
          align="left"
          showMap={false}
          compact
        />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
            <Card className="border-border bg-card shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
                  <AlertCircle className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  Couldn&apos;t generate your night plan
                </h2>
                <p className="mb-6 text-sm text-muted-foreground">{error}</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Button type="button" onClick={requestFreshDraw} variant="brand">
                    <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Try again
                  </Button>
                  <Link href={adjustPrefsHref}>
                    <Button type="button" variant="outline">
                      <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
                      Adjust preferences
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button type="button" variant="outline">
                      Browse all events
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (emptyMessage || stops.length === 0) {
    return (
      <div className="flex flex-col bg-background">
        <PageHero
          eyebrow={
            <Badge className="border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-mint">
              NIGHT PLANNER ITINERARY
            </Badge>
          }
          title={
            <>
              Your Night, <HeroAccent>Planned.</HeroAccent>
            </>
          }
          subtitle="No matching events were lined up for this combination in the next 48 hours."
          align="left"
          showMap={false}
          compact
        />
        <main className="flex-1">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
            <Card className="border-border bg-card shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-mint/25 bg-mint/10 text-mint">
                  <Compass className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-foreground">
                  No matching events right now
                </h2>
                <p className="mb-2 text-base font-medium text-foreground/90">
                  {emptyMessage ?? 'No events matched this combination tonight.'}
                </p>
                <p className="mb-6 text-sm text-muted-foreground">
                  The planner looks at verified events starting within the next 48 hours. You can tweak your preferences or browse all upcoming events across Ireland.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link href={adjustPrefsHref}>
                    <Button type="button" variant="brand">
                      <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
                      Try different preferences
                    </Button>
                  </Link>
                  <Link href="/events">
                    <Button type="button" variant="brand-outline">
                      View all upcoming events
                    </Button>
                  </Link>
                  <Link href="/planner">
                    <Button type="button" variant="outline">
                      Start fresh
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  const computedTotals = summarizeEvents(stops.map(stop => stop.event))
  const totalCostLabel = computedTotals.total_cost || apiTotals.total_cost || 'Free'
  const durationLabel = computedTotals.estimated_duration || apiTotals.estimated_duration || '1 hour'
  const shuffleReady = canShuffleStops(catalog, stops)
  const nightSorted = stops.every(stop => checkedIds.includes(stop.event.id))

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        eyebrow={
          <Badge className="border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-mint">
            NIGHT PLANNER ITINERARY
          </Badge>
        }
        title={
          <>
            Your Night, <HeroAccent>Planned.</HeroAccent>
          </>
        }
        subtitle="A curated run of stops ordered by start time. Swap any stop or shuffle the route to make it yours."
        align="left"
        showMap={false}
        compact
      >
        <div className="space-y-5">
          {narrative ? (
            <div className="rounded-2xl border border-mint/25 bg-night/75 p-4 sm:p-5 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-mint" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-foreground/95 sm:text-base">
                  {narrative}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            {/* Summary Pills */}
            <div className="flex flex-wrap items-center gap-2.5 text-sm">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-night/80 px-3.5 py-1.5 text-foreground">
                <MapPin className="h-4 w-4 text-mint" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-white">{stops.length}</strong>{' '}
                  {stops.length === 1 ? 'stop' : 'stops'}
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-night/80 px-3.5 py-1.5 text-foreground">
                <Euro className="h-4 w-4 text-mint" aria-hidden="true" />
                <span>
                  Estimated tickets: <strong className="font-semibold text-white">{totalCostLabel}</strong>
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-night/80 px-3.5 py-1.5 text-foreground">
                <Clock className="h-4 w-4 text-mint" aria-hidden="true" />
                <span>
                  Duration: <strong className="font-semibold text-white">{durationLabel}</strong>
                </span>
              </div>
            </div>

            {/* Itinerary Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                onClick={() => setStops(current => shuffleStops(catalog, current))}
                variant="brand"
                disabled={!shuffleReady}
              >
                <Shuffle className="mr-2 h-4 w-4" aria-hidden="true" />
                Shuffle route
              </Button>
              <Button
                type="button"
                onClick={requestFreshDraw}
                variant="brand-outline-dark"
              >
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Fresh draw
              </Button>
              <Button
                type="button"
                onClick={() => void handleShare()}
                variant="brand-outline-dark"
                aria-live="polite"
              >
                <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                {shareLabel(shareState)}
              </Button>
              <Link href={adjustPrefsHref}>
                <Button type="button" variant="outline" className="border-border bg-night/60">
                  <SlidersHorizontal className="mr-2 h-4 w-4" aria-hidden="true" />
                  Adjust preferences
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </PageHero>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                Itinerary Stops
              </h2>
              <p className="text-sm text-muted-foreground">
                Ordered chronologically in Irish time (Europe/Dublin)
              </p>
            </div>
            {nightSorted ? (
              <Badge className="border border-mint/40 bg-mint/15 px-3 py-1 text-xs font-semibold text-mint">
                <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                All stops marked sorted
              </Badge>
            ) : null}
          </div>

          <ol aria-label="Planned itinerary stops" className="relative space-y-6">
            {stops.length > 1 ? (
              <div
                aria-hidden="true"
                className="absolute top-12 bottom-12 left-5 hidden w-px -translate-x-1/2 bg-primary/35 sm:block"
              />
            ) : null}

            {stops.map((stop, index) => {
              const event = stop.event
              const checked = checkedIds.includes(event.id)
              const replacement = bestAlternate(catalog, stops, index)
              const reasons =
                stop.reasons.length > 0
                  ? stop.reasons
                  : ['Matches your selected preferences for tonight']
              const priceLabel = formatEventPrice(event)
              const typeBadgeLabel = eventTypeLabel(event.event_type)
              const showGenreBadge = shouldShowGenreBadge(event.event_type, event.music_genre)
              const eventDetailHref = detailHrefFromPlan(`/events/${event.slug}`, queryKey)
              const venueDetailHref = detailHrefFromPlan(`/venues/${event.venues.slug}`, queryKey)
              const locationString = formatStopLocation(event.venues)

              return (
                <li key={event.id} className="relative flex flex-col gap-3 sm:flex-row sm:gap-5">
                  {/* Stop Number Circle on Desktop */}
                  <div
                    aria-hidden="true"
                    className={`relative z-10 mt-6 hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold transition-colors sm:flex ${
                      checked
                        ? 'bg-primary/20 text-primary ring-2 ring-primary'
                        : 'bg-mint text-night shadow-md shadow-mint/20'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <Card
                    className={`relative min-w-0 flex-1 overflow-hidden rounded-2xl border transition-all motion-reduce:transition-none ${
                      checked
                        ? 'border-primary/50 bg-card/85'
                        : 'border-border bg-card hover:border-primary/60'
                    }`}
                  >
                    <CardContent className="p-5 sm:p-6">
                      {/* Top Bar: Stop Badge, Event Type, Genre, and Sorted Toggle */}
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="bg-mint text-night font-bold">
                            Stop {index + 1}
                          </Badge>
                          <Badge className="border border-mint/30 bg-mint/10 text-mint">
                            {typeBadgeLabel}
                          </Badge>
                          {showGenreBadge ? (
                            <Badge variant="outline" className="border-border text-foreground/90">
                              {event.music_genre}
                            </Badge>
                          ) : null}
                          {checked ? (
                            <Badge className="border border-primary/50 bg-primary/15 text-mint-light">
                              <Check className="mr-1 h-3 w-3" aria-hidden="true" />
                              Sorted
                            </Badge>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2">
                          <FavoriteButton
                            eventId={event.id}
                            variant="icon"
                            label={event.title}
                          />
                          <button
                            type="button"
                            aria-pressed={checked}
                            aria-label={
                              checked ? 'Mark stop as not sorted' : 'Mark stop as sorted'
                            }
                            onClick={() => toggleChecked(event.id)}
                            className={`inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              checked
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-night/60 text-muted-foreground hover:border-primary/60 hover:text-foreground'
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{checked ? 'Sorted' : 'Mark sorted'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Event Title & Venue Link */}
                      <div className="mb-3">
                        <h3 className="mb-1 text-xl font-bold text-foreground sm:text-2xl">
                          <Link
                            href={eventDetailHref}
                            className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:underline"
                          >
                            {event.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Hosted at{' '}
                          <Link
                            href={venueDetailHref}
                            className="font-semibold text-primary hover:underline"
                          >
                            {event.venues.name}
                          </Link>
                        </p>
                      </div>

                      {/* Metadata Row: Time, Location, Price */}
                      <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl border border-border/70 bg-night/50 p-3.5 text-sm sm:grid-cols-3">
                        <div className="flex items-center gap-2 text-foreground/90">
                          <Calendar className="h-4 w-4 shrink-0 text-mint" aria-hidden="true" />
                          <span>{formatStopTimeRange(event.start_time, event.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground/90">
                          <MapPin className="h-4 w-4 shrink-0 text-mint" aria-hidden="true" />
                          <span className="truncate" title={locationString}>
                            {locationString}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-foreground/90">
                          <Euro className="h-4 w-4 shrink-0 text-mint" aria-hidden="true" />
                          <span className="font-semibold text-white">
                            {priceLabel
                              ? priceLabel === 'Free'
                                ? 'Free entry'
                                : priceLabel
                              : 'Check venue for entry'}
                          </span>
                        </div>
                      </div>

                      {event.description ? (
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                          {event.description}
                        </p>
                      ) : null}

                      {/* Why This Stop Fits Your Night (Visible by default per Phase 6 §6) */}
                      <div className="mb-5 rounded-xl border border-mint/25 bg-mint/8 p-3.5">
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-mint">
                          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                          Why this stop was recommended
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {reasons.map(reason => (
                            <Badge
                              key={reason}
                              className="border border-mint/30 bg-night/80 text-xs font-medium text-mint-light"
                            >
                              {reason}
                            </Badge>
                          ))}
                          {(event.venues.atmosphere ?? []).slice(0, 3).map(atm => (
                            <Badge
                              key={atm}
                              variant="outline"
                              className="border-border/80 bg-night/50 text-xs text-muted-foreground"
                            >
                              {atm}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <Link href={eventDetailHref}>
                            <Button type="button" variant="brand" size="sm">
                              View event details
                            </Button>
                          </Link>
                          <Link href={venueDetailHref}>
                            <Button type="button" variant="brand-outline" size="sm">
                              View venue
                            </Button>
                          </Link>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!replacement}
                          onClick={() => {
                            const next = swapStop(catalog, stops, index)
                            if (next) setStops(next)
                          }}
                          className="gap-1.5"
                        >
                          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            {replacement ? 'Swap stop' : 'Only match for this slot'}
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              )
            })}
          </ol>

          {/* Route Map */}
          <div className="mt-10">
            <Suspense
              fallback={
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                  <h3 className="mb-1 text-lg font-bold text-foreground">Loading route map…</h3>
                  <p className="text-sm text-muted-foreground">Plotting your planned stops</p>
                </div>
              }
            >
              <PlanMap venues={mapVenues} detailQuery={queryKey} />
            </Suspense>
          </div>

          {/* Bottom Callout: Adjust or Re-roll */}
          <Card className="mt-10 border-border bg-card/70">
            <CardContent className="flex flex-col items-center justify-between gap-4 p-6 text-center sm:flex-row sm:text-left">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Want to take the night in a different direction?
                </h2>
                <p className="text-sm text-muted-foreground">
                  Shuffle a new combination of stops, draw a fresh plan, or tweak your answers.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <Button
                  type="button"
                  onClick={() => setStops(current => shuffleStops(catalog, current))}
                  variant="brand"
                  disabled={!shuffleReady}
                >
                  <Shuffle className="mr-2 h-4 w-4" aria-hidden="true" />
                  Shuffle route
                </Button>
                <Button type="button" onClick={requestFreshDraw} variant="brand-outline">
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Fresh draw
                </Button>
                <Link href={adjustPrefsHref}>
                  <Button type="button" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    Adjust preferences
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
