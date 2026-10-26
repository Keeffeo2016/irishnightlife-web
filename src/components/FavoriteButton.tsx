'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface FavoriteButtonProps {
  venueId?: string
  eventId?: string
}

export function FavoriteButton({ venueId, eventId }: FavoriteButtonProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [favoriteId, setFavoriteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function loadFavorite() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', user.id)

      if (eventId) {
        query = query.eq('event_id', eventId)
      } else if (venueId) {
        query = query.eq('venue_id', venueId)
      } else {
        return
      }

      const { data } = await query.maybeSingle()
      if (data) {
        setSaved(true)
        setFavoriteId(data.id)
      }
    }

    loadFavorite()
  }, [venueId, eventId])

  async function toggle() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const next = window.location.pathname
      router.push(`/auth/login?next=${encodeURIComponent(next)}`)
      setLoading(false)
      return
    }

    if (saved && favoriteId) {
      const { error } = await supabase.from('user_favorites').delete().eq('id', favoriteId)
      if (!error) {
        setSaved(false)
        setFavoriteId(null)
      }
    } else {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          venue_id: eventId ? null : venueId ?? null,
          event_id: eventId ?? null,
        })
        .select('id')
        .single()

      if (!error && data) {
        setSaved(true)
        setFavoriteId(data.id)
      }
    }

    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      disabled={loading}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save'}
    >
      <Heart className={`h-5 w-5 ${saved ? 'fill-emerald-600 text-emerald-600' : ''}`} />
    </Button>
  )
}
