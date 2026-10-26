'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { setVenueVerified } from './actions'

export function VenueApprovalButton({
  venueId,
  verified,
}: {
  venueId: string
  verified: boolean
}) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onClick() {
    setError(null)
    startTransition(async () => {
      const result = await setVenueVerified(venueId, !verified)
      if (result.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        size="sm"
        variant={verified ? 'brand-outline' : 'brand'}
        disabled={pending}
        onClick={onClick}
      >
        {pending ? 'Saving...' : verified ? 'Revoke' : 'Approve'}
      </Button>
      {error ? <p className="max-w-48 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
