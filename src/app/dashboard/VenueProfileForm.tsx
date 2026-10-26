'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ImagePlus, Loader2, MapPin, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { AwaitingApprovalNotice } from '@/components/AwaitingApprovalNotice'
import { HenStagSelect } from './HenStagSelect'

const fieldClass = 'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900'

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

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    const about = description.trim()
    if (!about || !venueType || !priceRange) {
      setSaving(false)
      setError('Add a short description, a venue type, and a price range.')
      return
    }

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('venues')
      .update({
        description: about,
        venue_type: venueType,
        price_range: priceRange,
      })
      .eq('id', venue.id)

    setSaving(false)
    if (updateError) {
      setError(updateError.message)
      return
    }

    setDescription(about)
    setMessage('Profile saved. New events will use these details.')
    router.refresh()
  }

  async function uploadPhotos(fileList: FileList | null) {
    if (!fileList?.length) return
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
        setUploading(false)
        setError(uploadError.message)
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

    setUploading(false)
    if (updateError) {
      setError(updateError.message)
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
      setError(updateError.message)
      return
    }

    const path = venueImagePath(url)
    if (path) {
      await supabase.storage.from(VENUE_IMAGE_BUCKET).remove([path])
    }

    setImages(nextImages)
    router.refresh()
  }

  return (
    <form onSubmit={saveProfile} className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{venue.name}</h3>
          <p className="mt-1 flex items-start gap-1 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {formatVenueAddress(venue)}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {viewCount.toLocaleString('en-IE')} profile {viewCount === 1 ? 'view' : 'views'}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href={`/venues/${venue.slug}`} className="text-emerald-700 hover:underline">
            View page
          </Link>
          {venue.is_verified ? (
            <Link
              href={`/dashboard/events/new?venue=${venue.id}`}
              className="text-emerald-700 hover:underline"
            >
              Create event
            </Link>
          ) : (
            <AwaitingApprovalNotice className="max-w-xs text-right text-sm text-amber-800" />
          )}
        </div>
      </div>

      <HenStagSelect venueId={venue.id} value={venue.accepts_hen_stag} />

      <div>
        <label htmlFor={`about-${venue.id}`} className="mb-1 block text-sm font-medium text-gray-700">
          About the venue
        </label>
        <Textarea
          id={`about-${venue.id}`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="What should people know before they come? Music, atmosphere, food, who it's for."
          className="min-h-28 border-gray-300 bg-white text-gray-900"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`type-${venue.id}`} className="mb-1 block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id={`type-${venue.id}`}
            value={venueType}
            onChange={(event) => setVenueType(event.target.value)}
            className={fieldClass}
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
          <label htmlFor={`price-${venue.id}`} className="mb-1 block text-sm font-medium text-gray-700">
            Price range
          </label>
          <select
            id={`price-${venue.id}`}
            value={priceRange}
            onChange={(event) => setPriceRange(event.target.value)}
            className={fieldClass}
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
        <p className="mb-2 text-sm font-medium text-gray-700">Photos</p>
        {images.length > 0 ? (
          <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((url) => (
              <li key={url} className="relative">
                <img src={url} alt={`${venue.name} photo`} className="h-28 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute right-2 top-2 rounded-md bg-white/90 p-1 text-gray-700 shadow-sm hover:text-red-600"
                  aria-label="Remove photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-3 text-sm text-gray-500">No photos yet. These show on your venue page and on events.</p>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? 'Uploading…' : 'Upload photos'}
          <input
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
        <p className="mt-2 text-xs text-gray-500">Up to {MAX_VENUE_IMAGES} photos, 5 MB each.</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <Button type="submit" variant="brand" disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving
          </>
        ) : (
          'Save profile'
        )}
      </Button>
    </form>
  )
}
