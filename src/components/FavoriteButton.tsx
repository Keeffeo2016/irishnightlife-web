'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { shouldCommitFavoritesSnapshot } from '@/lib/favorites-snapshot'
import { createClient } from '@/lib/supabase/client'

export interface FavoriteButtonProps {
  venueId?: string
  eventId?: string
  label?: string
  variant?: 'default' | 'icon'
  compact?: boolean
  className?: string
}

type FavoriteRow = {
  id: string
  event_id: string | null
  venue_id: string | null
}

type FavoritesSnapshot = {
  userId: string | null
  byEventId: Map<string, string>
  byVenueId: Map<string, string>
}

let cachedSnapshot: FavoritesSnapshot | null = null
let inflightSnapshot: Promise<FavoritesSnapshot> | null = null
let snapshotGeneration = 0
let authListenerRegistered = false
const subscribers = new Set<() => void>()

function notifySubscribers() {
  subscribers.forEach((listener) => listener())
}

function ensureAuthListener() {
  if (authListenerRegistered || typeof window === 'undefined') return
  authListenerRegistered = true
  const supabase = createClient()
  supabase.auth.onAuthStateChange(() => {
    snapshotGeneration += 1
    cachedSnapshot = null
    inflightSnapshot = null
    notifySubscribers()
  })
}

async function fetchFavoritesSnapshot(): Promise<FavoritesSnapshot> {
  ensureAuthListener()
  if (cachedSnapshot) return cachedSnapshot
  if (inflightSnapshot) return inflightSnapshot

  const startedGeneration = snapshotGeneration
  inflightSnapshot = (async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const byEventId = new Map<string, string>()
    const byVenueId = new Map<string, string>()

    if (!user) {
      const emptySnapshot: FavoritesSnapshot = {
        userId: null,
        byEventId,
        byVenueId,
      }
      if (!shouldCommitFavoritesSnapshot(startedGeneration, snapshotGeneration)) {
        inflightSnapshot = null
        return cachedSnapshot ?? emptySnapshot
      }
      cachedSnapshot = emptySnapshot
      inflightSnapshot = null
      return emptySnapshot
    }

    const { data } = await supabase
      .from('user_favorites')
      .select('id, event_id, venue_id')
      .eq('user_id', user.id)

    for (const row of (data ?? []) as FavoriteRow[]) {
      if (row.event_id) {
        byEventId.set(row.event_id, row.id)
      }
      if (row.venue_id) {
        byVenueId.set(row.venue_id, row.id)
      }
    }

    const resolved: FavoritesSnapshot = {
      userId: user.id,
      byEventId,
      byVenueId,
    }
    if (!shouldCommitFavoritesSnapshot(startedGeneration, snapshotGeneration)) {
      inflightSnapshot = null
      return cachedSnapshot ?? resolved
    }
    cachedSnapshot = resolved
    inflightSnapshot = null
    return resolved
  })()

  return inflightSnapshot
}

function resolveFavoriteId(
  snapshot: FavoritesSnapshot | null,
  eventId?: string,
  venueId?: string
): string | null {
  if (!snapshot) return null
  if (eventId) return snapshot.byEventId.get(eventId) ?? null
  if (venueId) return snapshot.byVenueId.get(venueId) ?? null
  return null
}

export function FavoriteButton({
  venueId,
  eventId,
  label,
  variant = 'default',
  compact = false,
  className,
}: FavoriteButtonProps) {
  const router = useRouter()
  const [favoriteId, setFavoriteId] = useState<string | null>(() =>
    resolveFavoriteId(cachedSnapshot, eventId, venueId)
  )
  const [loading, setLoading] = useState(false)
  const saved = favoriteId !== null
  const isIconOnly = compact || variant === 'icon'

  useEffect(() => {
    let active = true

    const syncFromCache = () => {
      if (!active) return
      if (cachedSnapshot) {
        setFavoriteId(resolveFavoriteId(cachedSnapshot, eventId, venueId))
      } else {
        void fetchFavoritesSnapshot().then((snapshot) => {
          if (active) {
            setFavoriteId(resolveFavoriteId(snapshot, eventId, venueId))
          }
        })
      }
    }

    subscribers.add(syncFromCache)
    syncFromCache()

    return () => {
      active = false
      subscribers.delete(syncFromCache)
    }
  }, [eventId, venueId])

  async function toggle() {
    if (!eventId && !venueId) return
    setLoading(true)

    const supabase = createClient()
    const snapshot = await fetchFavoritesSnapshot()
    let userId = snapshot.userId

    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id ?? null
    }

    if (!userId) {
      const next = `${window.location.pathname}${window.location.search}`
      router.push(`/auth/login?next=${encodeURIComponent(next)}`)
      setLoading(false)
      return
    }

    const currentFavoriteId = resolveFavoriteId(cachedSnapshot, eventId, venueId) ?? favoriteId

    if (currentFavoriteId) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', currentFavoriteId)

      if (!error) {
        if (cachedSnapshot?.userId === userId) {
          if (eventId) cachedSnapshot.byEventId.delete(eventId)
          if (venueId && !eventId) cachedSnapshot.byVenueId.delete(venueId)
          notifySubscribers()
        } else {
          setFavoriteId(null)
        }
      }
    } else {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          venue_id: eventId ? null : (venueId ?? null),
          event_id: eventId ?? null,
        })
        .select('id')
        .single()

      if (!error && data) {
        if (cachedSnapshot?.userId === userId) {
          if (eventId) {
            cachedSnapshot.byEventId.set(eventId, data.id)
          } else if (venueId) {
            cachedSnapshot.byVenueId.set(venueId, data.id)
          }
          notifySubscribers()
        } else {
          setFavoriteId(data.id)
        }
      }
    }

    setLoading(false)
  }

  const ariaLabel = label
    ? saved
      ? `Remove ${label} from saved`
      : `Save ${label}`
    : saved
      ? 'Remove from saved'
      : 'Save'

  if (isIconOnly) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggle}
        disabled={loading}
        aria-pressed={saved}
        aria-label={ariaLabel}
        className={cn(
          'min-h-10 min-w-10 rounded-full border-border/80 bg-night/85 text-foreground shadow-md backdrop-blur-sm hover:border-primary hover:bg-night hover:text-primary',
          saved && 'border-primary/70 bg-night/90 text-primary',
          className
        )}
      >
        <Heart className={cn('h-4 w-4 transition-transform', saved && 'fill-primary text-primary scale-110')} />
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggle}
      disabled={loading}
      aria-pressed={saved}
      aria-label={ariaLabel}
      className={cn(
        'min-h-10 gap-2 px-3.5',
        saved && 'border-primary/60 text-primary',
        className
      )}
    >
      <Heart className={cn('h-4 w-4', saved && 'fill-primary text-primary')} />
      <span>{saved ? 'Saved' : 'Save'}</span>
    </Button>
  )
}
