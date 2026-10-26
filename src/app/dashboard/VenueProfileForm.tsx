'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  ImagePlus,
  Loader2,
  MapPin,
  PlusCircle,
  Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  DASHBOARD_GENERIC_SAVE_ERROR,
  DASHBOARD_GENERIC_UPLOAD_ERROR,
  isVenueProfileComplete,
  validateVenueProfileInput,
} from '@/lib/dashboard-validation'
import {
  MAX_VENUE_IMAGES,
  PRICE_RANGES,
  VENUE_IMAGE_BUCKET,
  VENUE_TYPES,
  formatVenueAddress,
  venueImageError,
  venueImagePath,
} from '@/lib/venue-profile'
import type { DashboardVenue } from '@/lib/venue-dashboard'
import { Button, buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AwaitingApprovalNotice } from '@/components/AwaitingApprovalNotice'
import { cn } from '@/lib/utils'
import { HenStagSelect } from './HenStagSelect'

const selectFieldClass =
  'h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30'

export function VenueProfileForm({
  venue,
  ownerId,
  viewCount,
}: {
  venue: DashboardVenue
  ownerId: string
  viewCount: number
}) {
  const router = useRouter()
  const [description, setDescription] = useState(venue.description ?? '')
  const [venueType, setVenueType] = useState(venue.venue_type ?? '')
  const [priceRange, setPriceRange] = useState(venue.price_range ?? '')
  const [images, setImages] = useState<string[]>(venue.images ?? [])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const savingRef = useRef(false)
  const uploadingRef = useRef(false)

  const completeness = isVenueProfileComplete({
    description,
    venue_type: venueType,
    price_range: priceRange,
    images,
  })

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setError(null)
    setMessage(null)

    const validation = validateVenueProfileInput({
      description,
      venueType,
      priceRange,
    })

    if (!validation.ok) {
      savingRef.current = false
      setSaving(false)
      setError(validation.error)
      return
    }

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('venues')
      .update({
        description: validation.description,
        venue_type: venueType,
        price_range: priceRange,
      })
      .eq('id', venue.id)

    savingRef.current = false
    setSaving(false)
    if (updateError) {
      setError(DASHBOARD_GENERIC_SAVE_ERROR)
      return
    }

    setDescription(validation.description)
    setMessage('Profile saved. New events will use these details.')
    router.refresh()
  }

  async function uploadPhotos(fileList: FileList | null) {
    if (!fileList?.length || uploadingRef.current) return
    setError(null)
    setMessage(null)

    const room = MAX_VENUE_IMAGES - images.length
    if (room <= 0) {
      setError(`You can add up to ${MAX_VENUE_IMAGES} photos.`)
      return
    }

    const files = Array.from(fileList).slice(0, room)
    const invalid = files.map(venueImageError).find(Boolean)
    if (invalid) {
      setError(invalid)
      return
    }

    uploadingRef.current = true
    setUploading(true)
    const supabase = createClient()
    const uploaded: string[] = []

    for (const file of files) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${ownerId}/${venue.id}/${crypto.randomUUID()}.${extension}`
      const { error: uploadError } = await supabase.storage
        .from(VENUE_IMAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        uploadingRef.current = false
        setUploading(false)
        setError(DASHBOARD_GENERIC_UPLOAD_ERROR)
        return
      }

      const { data } = supabase.storage.from(VENUE_IMAGE_BUCKET).getPublicUrl(path)
      uploaded.push(data.publicUrl)
    }

    const nextImages = [...images, ...uploaded]
    const { error: updateError } = await supabase
      .from('venues')
      .update({ images: nextImages })
      .eq('id', venue.id)

    uploadingRef.current = false
    setUploading(false)
    if (updateError) {
      setError(DASHBOARD_GENERIC_SAVE_ERROR)
      return
    }

    setImages(nextImages)
    setMessage('Photos added.')
    router.refresh()
  }

  async function removePhoto(url: string) {
    setError(null)
    setMessage(null)
    const nextImages = images.filter((image) => image !== url)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('venues')
      .update({ images: nextImages })
      .eq('id', venue.id)

    if (updateError) {
      setError(DASHBOARD_GENERIC_SAVE_ERROR)
      return
    }

    const path = venueImagePath(url)
    if (path) {
      await supabase.storage.from(VENUE_IMAGE_BUCKET).remove([path])
    }

    setImages(nextImages)
    setMessage('Photo removed.')
    router.refresh()
  }

  return (
    <form
      onSubmit={saveProfile}
      className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6"
      noValidate
      aria-busy={saving || uploading}
      aria-describedby={error ? `venue-profile-error-${venue.id}` : undefined}
    >
      {/* Venue Header Card */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-start">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold text-foreground">{venue.name}</h2>
            {venue.is_verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-0.5 text-xs font-medium text-mint">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Verified — Live on public directory</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-0.5 text-xs font-medium text-amber-200">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Awaiting approval — Hidden from public directory</span>
              </span>
            )}
          </div>

          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mint/80" aria-hidden="true" />
            <span>{formatVenueAddress(venue)}</span>
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-mint/80" aria-hidden="true" />
              <span>
                {viewCount.toLocaleString('en-IE')} profile{' '}
                {viewCount === 1 ? 'view' : 'views'}
              </span>
            </span>
            <span>·</span>
            {completeness.complete ? (
              <span className="inline-flex items-center gap-1 font-medium text-mint">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Profile 100% complete</span>
              </span>
            ) : (
              <span className="font-medium text-amber-200">
                Missing: {completeness.missing.join(', ')}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/venues/${venue.slug}`}
            className={cn(
              buttonVariants({ variant: 'brand-outline', size: 'sm' }),
              'gap-1.5 text-xs'
            )}
          >
            <span>View public profile</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          {venue.is_verified ? (
            <Link
              href={`/dashboard/events/new?venue=${venue.id}`}
              className={cn(buttonVariants({ variant: 'brand', size: 'sm' }), 'gap-1.5 text-xs')}
            >
              <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add event</span>
            </Link>
          ) : (
            <AwaitingApprovalNotice className="max-w-xs text-xs text-amber-200" />
          )}
        </div>
      </div>

      {/* Feedback banners */}
      {error ? (
        <div
          id={`venue-profile-error-${venue.id}`}
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-3 rounded-xl border border-primary/40 bg-primary/15 p-4 text-sm text-mint"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mint" aria-hidden="true" />
          <p>{message}</p>
        </div>
      ) : null}

      {/* 1. Venue Classification & Policy */}
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Venue classification &amp; group policy
          </h3>
          <p className="text-xs text-muted-foreground">
            Help visitors and the Night Planner match your venue with the right crowd and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor={`type-${venue.id}`}
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Venue type <span className="text-mint">*</span>
            </label>
            <select
              id={`type-${venue.id}`}
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
              htmlFor={`price-${venue.id}`}
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              Price range <span className="text-mint">*</span>
            </label>
            <select
              id={`price-${venue.id}`}
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

          <HenStagSelect venueId={venue.id} value={venue.accepts_hen_stag} />
        </div>
      </section>

      {/* 2. About the Venue */}
      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={`about-${venue.id}`}
            className="block text-sm font-medium text-foreground"
          >
            About the venue <span className="text-mint">*</span>
          </label>
          <span className="text-xs text-muted-foreground">
            {description.length} / 2000
          </span>
        </div>
        <Textarea
          id={`about-${venue.id}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="What should people know before they come? Music, atmosphere, food, who it's for."
          className="min-h-28 border-border bg-background text-foreground"
          required
        />
        <p className="text-xs text-muted-foreground">
          This description appears on your public venue profile and is pre-filled when you create
          new events.
        </p>
      </section>

      {/* 3. Venue Photographs */}
      <section className="space-y-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground">Venue photographs</h3>
            <p className="text-xs text-muted-foreground">
              Up to {MAX_VENUE_IMAGES} photos, 5 MB each (JPEG, PNG, WebP, or GIF). Your first
              photo is used as the cover image.
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            {images.length} of {MAX_VENUE_IMAGES} photos uploaded
          </span>
        </div>

        {images.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {images.map((url, index) => (
              <li
                key={url}
                className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-background"
              >
                <img
                  src={url}
                  alt={`${venue.name} photo ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {index === 0 ? (
                  <span className="absolute bottom-2 left-2 rounded-md border border-primary/40 bg-night/90 px-2.5 py-1 text-xs font-semibold text-mint">
                    Cover photo
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  aria-label={`Remove photo ${index + 1} of ${venue.name}`}
                  className="absolute right-2 top-2 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-night/90 text-foreground/90 shadow-sm transition-colors hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No photos uploaded yet. Photos appear on your venue directory card, venue page, and
              events.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor={`photos-${venue.id}`}
            className={cn(
              'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-card',
              (uploading || images.length >= MAX_VENUE_IMAGES) &&
                'pointer-events-none opacity-50'
            )}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin text-mint" aria-hidden="true" />
            ) : (
              <ImagePlus className="h-4 w-4 text-mint" aria-hidden="true" />
            )}
            <span>{uploading ? 'Uploading…' : 'Upload photos'}</span>
            <input
              id={`photos-${venue.id}`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              disabled={uploading || images.length >= MAX_VENUE_IMAGES}
              onChange={(event) => {
                void uploadPhotos(event.target.files)
                event.target.value = ''
              }}
            />
          </label>
        </div>
      </section>

      <div className="flex items-center justify-end border-t border-border pt-5">
        <Button type="submit" variant="brand" disabled={saving} className="min-h-11 px-6">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>Saving…</span>
            </>
          ) : (
            <span>Save profile</span>
          )}
        </Button>
      </div>
    </form>
  )
}
