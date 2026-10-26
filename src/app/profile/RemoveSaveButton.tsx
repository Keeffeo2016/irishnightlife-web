'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function RemoveSaveButton({ favoriteId }: { favoriteId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function remove() {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('user_favorites').delete().eq('id', favoriteId)
    setLoading(false)
    if (!error) router.refresh()
  }

  return (
    <Button type="button" variant="ghost" onClick={remove} disabled={loading}>
      {loading ? 'Removing...' : 'Remove'}
    </Button>
  )
}
