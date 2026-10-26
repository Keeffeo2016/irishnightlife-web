'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/slug'
import {
  EVENT_TYPES,
  PRICE_RANGES,
  VENUE_TYPES,
  formatVenueAddress,
  venueTypeLabel,
} from '@/lib/venue-profile'
import type { DashboardVenue } from '@/lib/venue-dashboard'
import { AWAITING_APPROVAL_MESSAGE } from '@/components/AwaitingApprovalNotice'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const fieldClass = 'w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground'

export function CreateEventForm({
  venues,
  initialVenueId,
}: {
  venues: DashboardVenue[]
  initialVenueId?: string
}) {
  const router = useRouter()
  const startingId = venues.find((venue) => venue.id === initialVenueId)?.id ?? venues[0]?.id ?? ''

  const [venueId, setVenueId] = useState(startingId)
  const venue = useMemo(
    () => venues.find((item) => item.id === venueId) ?? venues[0],
    [venueId, venues],
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

  function selectVenue(nextId: string) {
    const next = venues.find((item) => item.id === nextId)
    setVenueId(nextId)
    setAbout(next?.description ?? '')
    setVenueType(next?.venue_type ?? '')
    setPriceRange(next?.price_range ?? '')
  }

  async function createEvent(event: React.FormEvent) {
    event.preventDefault()
    if (!venue) return
    setSaving(true)
    setError(null)

    const aboutText = about.trim()
    if (!aboutText || !venueType || !priceRange) {
      setSaving(false)
      setError('The event template needs the venue type, price range, and a section about the venue.')
      return
    }

    if (!title.trim() || !startTime) {
      setSaving(false)
      setError('Add an event title and a start time.')
      return
    }

    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : null
    if (Number.isNaN(start.getTime()) || (end && Number.isNaN(end.getTime()))) {
      setSaving(false)
      setError('Enter a valid start and end time.')
      return
    }
    if (end && end <= start) {
      setSaving(false)
      setError('The end time has to be after the start time.')
      return
    }

    const min = isFree ? 0 : Number(priceMin)
    const max = priceMax.trim() ? Number(priceMax) : null
    if (!isFree && (!Number.isFinite(min) || min < 0)) {
      setSaving(false)
      setError('Enter a ticket price, or mark the event as free.')
      return
    }
    if (max != null && (!Number.isFinite(max) || max < min)) {
      setSaving(false)
      setError('The top price has to be at least the starting price.')
      return
    }

    if (!venue.is_verified) {
      setSaving(false)
      setError(AWAITING_APPROVAL_MESSAGE)
      return
    }

    const supabase = createClient()
    const { error: venueError } = await supabase
      .from('venues')
      .update({
        description: aboutText,
        venue_type: venueType,
        price_range: priceRange,
      })
      .eq('id', venue.id)

    if (venueError) {
      setSaving(false)
      setError(venueError.message)
      return
    }

    const { data, error: eventError } = await supabase
      .from('events')
      .insert({
        venue_id: venue.id,
        title: title.trim(),
        slug: slugify(title),
        description: description.trim() || null,
        event_type: eventType,
        start_time: start.toISOString(),
        end_time: end ? end.toISOString() : null,
        is_free: isFree,
        price_min: min,
        price_max: isFree ? null : max,
        music_genre: genre.trim() || null,
        ticket_url: ticketUrl.trim() || null,
        image_url: venue.images?.[0] ?? null,
        is_published: publish,
      })
      .select('slug')
      .single()

    setSaving(false)
    if (eventError || !data) {
      setError(eventError?.message ?? 'Could not create the event.')
      return
    }

    router.push(`/events/${data.slug}`)
    router.refresh()
  }

  if (!venue) return null

  const photos = venue.images ?? []

  return (
    <form onSubmit={createEvent} className="space-y-8">
      {venues.length > 1 ? (
        <div>
          <label htmlFor="event-venue" className="mb-1 block text-sm font-medium text-foreground/90">
            Venue
          </label>
          <select
            id="event-venue"
            value={venue.id}
            onChange={(event) => selectVenue(event.target.value)}
            className={fieldClass}
          >
            {venues.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-background p-5">
        <h2 className="text-lg font-semibold text-foreground">From your venue</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Name, address, price range, and type come from the venue profile. About the venue is included on the event page.
        </p>

        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</dt>
            <dd className="mt-1 font-semibold text-foreground">{venue.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</dt>
            <dd className="mt-1 flex items-start gap-1 text-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {formatVenueAddress(venue)}
            </dd>
          </div>
          <div>
            <label htmlFor="template-type" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Type
            </label>
            <select
              id="template-type"
              value={venueType}
              onChange={(event) => setVenueType(event.target.value)}
              className={`${fieldClass} mt-1`}
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
            <label htmlFor="template-price" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Price range
            </label>
            <select
              id="template-price"
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
              className={`${fieldClass} mt-1`}
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
        </dl>

        <div className="mt-4">
          <label htmlFor="template-about" className="mb-1 block text-sm font-medium text-foreground">
            About the venue
          </label>
          <Textarea
            id="template-about"
            value={about}
            onChange={(event) => setAbout(event.target.value)}
            maxLength={2000}
            rows={5}
            placeholder="Tell people what this venue is like."
            className="min-h-28 border-border bg-card text-foreground"
            required
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Saved on {venue.name}
            {venueTypeLabel(venueType) ? ` · ${venueTypeLabel(venueType)}` : ''}
            {priceRange ? ` · ${priceRange}` : ''}.{' '}
            <Link href="/dashboard/profile" className="text-primary hover:underline">
              Edit the full profile
            </Link>
          </p>
        </div>

        {photos.length > 0 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {photos.map((url) => (
              <img key={url} src={url} alt={`${venue.name} photo`} className="h-20 w-28 shrink-0 rounded-lg object-cover" />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No venue photos yet.{' '}
            <Link href="/dashboard/profile" className="text-primary hover:underline">
              Upload them on your profile
            </Link>
            .
          </p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">This event</h2>
        <div>
          <label htmlFor="event-title" className="mb-1 block text-sm font-medium text-foreground/90">
            Title
          </label>
          <Input
            id="event-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Friday trad session"
            className="border-border bg-card text-foreground"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-type" className="mb-1 block text-sm font-medium text-foreground/90">
              Event type
            </label>
            <select
              id="event-type"
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              className={fieldClass}
            >
              {EVENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="event-genre" className="mb-1 block text-sm font-medium text-foreground/90">
              Music genre
            </label>
            <Input
              id="event-genre"
              value={genre}
              onChange={(event) => setGenre(event.target.value)}
              placeholder="Trad, house, indie…"
              className="border-border bg-card text-foreground"
            />
          </div>
          <div>
            <label htmlFor="event-start" className="mb-1 block text-sm font-medium text-foreground/90">
              Starts
            </label>
            <Input
              id="event-start"
              type="datetime-local"
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="border-border bg-card text-foreground"
              required
            />
          </div>
          <div>
            <label htmlFor="event-end" className="mb-1 block text-sm font-medium text-foreground/90">
              Ends
            </label>
            <Input
              id="event-end"
              type="datetime-local"
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="border-border bg-card text-foreground"
            />
          </div>
        </div>
        <div>
          <label htmlFor="event-description" className="mb-1 block text-sm font-medium text-foreground/90">
            What’s on
          </label>
          <Textarea
            id="event-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="Line-up, door time, anything specific to this night."
            className="min-h-24 border-border bg-card text-foreground"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground/90">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(event) => setIsFree(event.target.checked)}
            className="h-4 w-4"
          />
          Free entry
        </label>
        {isFree ? null : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price-min" className="mb-1 block text-sm font-medium text-foreground/90">
                Price from (€)
              </label>
              <Input
                id="price-min"
                type="number"
                min="0"
                step="0.01"
                value={priceMin}
                onChange={(event) => setPriceMin(event.target.value)}
                className="border-border bg-card text-foreground"
                required
              />
            </div>
            <div>
              <label htmlFor="price-max" className="mb-1 block text-sm font-medium text-foreground/90">
                Price to (€)
              </label>
              <Input
                id="price-max"
                type="number"
                min="0"
                step="0.01"
                value={priceMax}
                onChange={(event) => setPriceMax(event.target.value)}
                className="border-border bg-card text-foreground"
              />
            </div>
          </div>
        )}
        <div>
          <label htmlFor="ticket-url" className="mb-1 block text-sm font-medium text-foreground/90">
            Ticket link
          </label>
          <Input
            id="ticket-url"
            type="url"
            value={ticketUrl}
            onChange={(event) => setTicketUrl(event.target.value)}
            placeholder="https://"
            className="border-border bg-card text-foreground"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-foreground/90">
          <input
            type="checkbox"
            checked={publish}
            onChange={(event) => setPublish(event.target.checked)}
            className="h-4 w-4"
          />
          Publish this event
        </label>
        <p className="text-xs text-muted-foreground">
          A draft stays visible to you. It appears on the public site once the event is published and the venue is approved.
        </p>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="brand" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating event
            </>
          ) : (
            'Create event'
          )}
        </Button>
        <Link href="/dashboard/events" className={buttonVariants({ variant: 'brand-outline' })}>
          Cancel
        </Link>
      </div>
    </form>
  )
}
