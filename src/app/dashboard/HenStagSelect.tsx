'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Choice = 'unset' | 'yes' | 'no'

function toChoice(value: boolean | null): Choice {
  if (value === null) return 'unset'
  return value ? 'yes' : 'no'
}

function toValue(choice: Choice): boolean | null {
  switch (choice) {
    case 'unset':
      return null
    case 'yes':
      return true
    case 'no':
      return false
    default: {
      const unreachable: never = choice
      throw new Error(`Unknown choice: ${unreachable}`)
    }
  }
}

export function HenStagSelect({ venueId, value }: { venueId: string; value: boolean | null }) {
  const router = useRouter()
  const [choice, setChoice] = useState<Choice>(toChoice(value))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  async function update(next: Choice) {
    const previous = choice
    setChoice(next)
    setSaving(true)
    setError(false)
    const supabase = createClient()
    const { error } = await supabase
      .from('venues')
      .update({ accepts_hen_stag: toValue(next) })
      .eq('id', venueId)
    setSaving(false)
    if (error) {
      setChoice(previous)
      setError(true)
      return
    }
    router.refresh()
  }

  return (
    <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
      Hen &amp; stag parties:
      <select
        value={choice}
        onChange={(e) => update(e.target.value as Choice)}
        disabled={saving}
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900"
      >
        <option value="unset">Not set</option>
        <option value="yes">Welcome</option>
        <option value="no">Not accepted</option>
      </select>
      {error && <span className="text-red-600">Couldn&apos;t save</span>}
    </label>
  )
}
