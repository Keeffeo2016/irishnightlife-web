'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function signOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant="brand-outline-dark"
      onClick={signOut}
      disabled={loading}
      className="min-h-11"
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </Button>
  )
}
