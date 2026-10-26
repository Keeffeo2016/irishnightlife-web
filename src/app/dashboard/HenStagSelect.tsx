'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'
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
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(false)

  const selectId = `hen-stag-${venueId}`

  async function update(next: Choice) {
    const previous = choice
    setChoice(next)
    setSaving(true)
    setSaved(false)
    setError(false)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('venues')
      .update({ accepts_hen_stag: toValue(next) })
      .eq('id', venueId)
    setSaving(false)
    if (updateError) {
      setChoice(previous)
      setError(true)
      return
    }
    setSaved(true)
    router.refresh()
  }

  return (
    <div>
      <label
        htmlFor={selectId}
        className="mb-1.5 flex items-center justify-between gap-2 text-sm font-medium text-foreground"
      >
        <span>Hen &amp; stag parties</span>
        {saving ? (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
          >
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            <span>Saving…</span>
          </span>
        ) : saved ? (
          <span
            role="status"
            aria-live="polite"
            className="inline-flex items-center gap-1 text-xs text-mint"
          >
            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
            <span>Saved</span>
          </span>
        ) : error ? (
          <span role="alert" className="text-xs text-red-400">
            Couldn&apos;t save
          </span>
        ) : null}
      </label>
      <select
        id={selectId}
        value={choice}
        onChange={(e) => update(e.target.value as Choice)}
        disabled={saving}
        className="h-11 w-full rounded-xl border border-border bg-background px-3.5 py-2 text-sm text-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30 disabled:opacity-60"
      >
        <option value="unset">Not set</option>
        <option value="yes">Welcome</option>
        <option value="no">Not accepted</option>
      </select>
    </div>
  )
}
