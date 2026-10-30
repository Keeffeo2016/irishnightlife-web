'use client'

import { useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Sparkles,
  Ticket,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DASHBOARD_GENERIC_CREATE_ERROR,
  DASHBOARD_GENERIC_SAVE_ERROR,
  validateCreateEventInput,
} from '@/lib/dashboard-validation'
import { slugify } from '@/lib/slug'
import {
  EVENT_TYPES,
  PRICE_RANGES,
  VENUE_TYPES,
  formatVenueAddress,
  venueTypeLabel,
} from '@/lib/venue-profile'
import type { DashboardVenue } from '@/lib/venue-dashboard'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const selectFieldClass =
  'h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30'

export function CreateEventForm({
  venues,
  initialVenueId,
}: {
  venues: DashboardVenue[]
  initialVenueId?: string
}) {
  const router = useRouter()
  const startingId =
    venues.find((venue) => venue.id === initialVenueId)?.id ?? venues[0]?.id ?? ''

  const [venueId, setVenueId] = useState(startingId)
  const venue = useMemo(
    () => venues.find((item) => item.id === venueId) ?? venues[0],
    [venueId, venues]
  )

  const [about, setAbout] = useState(venue?.description ?? '')
  const [venueType, setVenueType] = useState(venue?.venue_type ?? '')
  const [priceRange, setPriceRange] = useState(venue?.price_range ?? '')
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState('live_music')
  const [description, setDescription] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [genre, setGenre] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [publish, setPublish] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const submittingRef = useRef(false)

  function selectVenue(nextId: string) {
    const next = venues.find((item) => item.id === nextId)
    setVenueId(nextId)
    setAbout(next?.description ?? '')
    setVenueType(next?.venue_type ?? '')
    setPriceRange(next?.price_range ?? '')
  }

  async function createEvent(event: React.FormEvent) {
    event.preventDefault()
    if (!venue || submittingRef.current) return
    submittingRef.current = true
    setSaving(true)
    setError(null)

    const validation = validateCreateEventInput({
      about,
      venueType,
      priceRange,
      title,
      startTime,
      endTime,
      isFree,
      priceMin,
      priceMax,
      ticketUrl,
      isVerified: venue.is_verified,
    })

    if (!validation.ok) {
      submittingRef.current = false
      setSaving(false)
      setError(validation.error)
      return
    }

    const supabase = createClient()
    const { error: venueError } = await supabase
      .from('venues')
      .update({
        description: validation.aboutText,
        venue_type: venueType,
        price_range: priceRange,
      })
      .eq('id', venue.id)

    if (venueError) {
      submittingRef.current = false
      setSaving(false)
      setError(DASHBOARD_GENERIC_SAVE_ERROR)
      return
    }

    const { data, error: eventError } = await supabase
      .from('events')
      .insert({
        venue_id: venue.id,
        title: validation.titleText,
        slug: slugify(validation.titleText),
        description: description.trim() || null,
        event_type: eventType,
        start_time: validation.startIso,
        end_time: validation.endIso,
        is_free: isFree,
        price_min: validation.minPrice,
        price_max: validation.maxPrice,
        music_genre: genre.trim() || null,
        ticket_url: validation.normalizedTicketUrl,
        image_url: venue.images?.[0] ?? null,
        is_published: publish,
      })
      .select('slug')
      .single()

    if (eventError || !data) {
      submittingRef.current = false
      setSaving(false)
      setError(DASHBOARD_GENERIC_CREATE_ERROR)
      return
    }

    router.push(`/events/${data.slug}`)
    router.refresh()
  }

  if (!venue) return null

  const photos = venue.images ?? []

  return (
    <form
      onSubmit={createEvent}
      className="space-y-6"
      noValidate
      aria-busy={saving}
      aria-describedby={error ? 'create-event-error' : undefined}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {saving ? 'Creating event' : ''}
      </p>
      {error ? (
        <div
          id="create-event-error"
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
          <div>
            <p className="font-semibold text-red-200">Please check the form</p>
            <p className="mt-0.5 text-red-200/90">{error}</p>
          </div>
        </div>
      ) : null}

      {/* Section 1: Venue Details */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-start gap-3 border-b border-border/60 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-mint">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              1. Venue details (saved to venue profile)
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Name, address, price range, and venue type come from your venue profile and are shown
              on the public event page.
            </p>
          </div>
        </div>

        {venues.length > 1 ? (
          <div>
            <label
              htmlFor="event-venue"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Hosting venue
            </label>
            <select
              id="event-venue"
              value={venue.id}
              onChange={(event) => selectVenue(event.target.value)}
              className={selectFieldClass}
            >
              {venues.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <dl className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-background/60 p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Venue name
            </dt>
            <dd className="mt-1 font-semibold text-foreground">{venue.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Registered address
            </dt>
            <dd className="mt-1 flex items-start gap-1.5 text-sm text-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mint" aria-hidden="true" />
              <span>{formatVenueAddress(venue)}</span>
            </dd>
          </div>
        </dl>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="template-type"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Type <span className="text-mint">*</span>
            </label>
            <select
              id="template-type"
              value={venueType}
              onChange={(event) => setVenueType(event.target.value)}
              className={selectFieldClass}
              required
            >
              <option value="">Choose a type</option>
              {VENUE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="template-price"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Price range <span className="text-mint">*</span>
            </label>
            <select
              id="template-price"
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
              className={selectFieldClass}
              required
            >
              <option value="">Choose a price range</option>
              {PRICE_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="template-about"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            About the venue <span className="text-mint">*</span>
          </label>
          <Textarea
            id="template-about"
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Tell people what this venue is like."
            className="min-h-28 border-border bg-background text-foreground"
            required
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Saved on {venue.name}
            {venueTypeLabel(venueType) ? ` · ${venueTypeLabel(venueType)}` : ''}
            {priceRange ? ` · ${priceRange}` : ''}.{' '}
            <Link href="/dashboard/profile" className="text-primary hover:underline">
              Edit the full profile
            </Link>
          </p>
        </div>

        {photos.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Venue photos (first photo is used as the event cover image)
            </p>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {photos.map((url, idx) => (
                <div key={url} className="relative shrink-0">
                  {/* Venue photos are Supabase public URLs (not blob: previews). */}
                  <Image
                    src={url}
                    alt={`${venue.name} photo ${idx + 1}`}
                    width={112}
                    height={80}
                    className="h-20 w-28 rounded-lg border border-border object-cover"
                  />
                  {idx === 0 ? (
                    <span className="absolute bottom-1 left-1 rounded bg-night/90 px-1.5 py-0.5 text-[10px] font-semibold text-mint">
                      Cover
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No venue photos yet.{' '}
            <Link href="/dashboard/profile" className="text-primary hover:underline">
              Upload them on your profile
            </Link>
            .
          </p>
        )}
      </section>

      {/* Section 2: Event Information & Category */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-start gap-3 border-b border-border/60 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-mint">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              2. Event information &amp; category
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Give your night a clear title, category, and line-up description.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="event-title"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Event title <span className="text-mint">*</span>
          </label>
          <Input
            id="event-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Friday trad session"
            className="h-11 border-border bg-background text-foreground"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="event-type"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Event type
            </label>
            <select
              id="event-type"
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              className={selectFieldClass}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="event-genre"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Music genre (optional)
            </label>
            <Input
              id="event-genre"
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              placeholder="Trad, house, indie…"
              className="h-11 border-border bg-background text-foreground"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="event-description"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            What&apos;s on / Description
          </label>
          <Textarea
            id="event-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Line-up, door time, anything specific to this night."
            className="min-h-24 border-border bg-background text-foreground"
          />
        </div>
      </section>

      {/* Section 3: Date & Time */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-start gap-3 border-b border-border/60 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-mint">
            <Calendar className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">3. Date &amp; time</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Enter start and optional finish times in local Irish time. If an end time is set, it
              must be after the start time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="event-start"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Starts <span className="text-mint">*</span>
            </label>
            <Input
              id="event-start"
              type="datetime-local"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="h-11 border-border bg-background text-foreground"
              required
            />
          </div>

          <div>
            <label
              htmlFor="event-end"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Ends (optional)
            </label>
            <Input
              id="event-end"
              type="datetime-local"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="h-11 border-border bg-background text-foreground"
            />
          </div>
        </div>
      </section>

      {/* Section 4: Tickets & Pricing */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-start gap-3 border-b border-border/60 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-mint">
            <Ticket className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">4. Tickets &amp; pricing</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Let visitors know if entry is free or paid, and add an optional external booking link.
            </p>
          </div>
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(event) => setIsFree(event.target.checked)}
            className="h-4 w-4 accent-emerald-400"
          />
          <span>Free entry (no cover charge)</span>
        </label>

        {isFree ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="price-min"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Price from (€) <span className="text-mint">*</span>
              </label>
              <Input
                id="price-min"
                type="number"
                min="0"
                step="0.01"
                value={priceMin}
                onChange={(event) => setPriceMin(event.target.value)}
                placeholder="10"
                className="h-11 border-border bg-background text-foreground"
                required
              />
            </div>

            <div>
              <label
                htmlFor="price-max"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Price to (€) (optional)
              </label>
              <Input
                id="price-max"
                type="number"
                min="0"
                step="0.01"
                value={priceMax}
                onChange={(event) => setPriceMax(event.target.value)}
                placeholder="15"
                className="h-11 border-border bg-background text-foreground"
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="ticket-url"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Ticket link (optional)
          </label>
          <Input
            id="ticket-url"
            type="url"
            value={ticketUrl}
            onChange={(event) => setTicketUrl(event.target.value)}
            placeholder="https://tickets.example.ie/your-event"
            className="h-11 border-border bg-background text-foreground"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Must start with <code className="text-foreground/90">https://</code> or{' '}
            <code className="text-foreground/90">http://</code>, or leave blank if tickets are on
            the door.
          </p>
        </div>
      </section>

      {/* Section 5: Publication Settings */}
      <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start gap-3 border-b border-border/60 pb-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-mint">
            {publish ? (
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FileText className="h-5 w-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">5. Publication settings</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Choose whether to publish immediately or save as a private draft.
            </p>
          </div>
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={publish}
            onChange={(event) => setPublish(event.target.checked)}
            className="h-4 w-4 accent-emerald-400"
          />
          <span>Publish this event immediately</span>
        </label>

        <p className="text-xs text-muted-foreground">
          Drafts remain private to you. Published events appear on IrishNightlife.ie once your
          venue is verified.
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button type="submit" variant="brand" disabled={saving} className="min-h-11 px-6">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Creating event…</span>
            </>
          ) : (
            <span>Create event</span>
          )}
        </Button>
        <Link
          href="/dashboard/events"
          className={buttonVariants({ variant: 'brand-outline' })}
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
