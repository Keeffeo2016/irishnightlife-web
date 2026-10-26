'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SKIP = /^\/(admin|auth|api)(\/|$)/
const recording = new Set<string>()

export function PageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const path = normalizePath(pathname)
    if (!path || SKIP.test(path)) return

    const storageKey = `page-view:${path}`
    const seenAt = Number(sessionStorage.getItem(storageKey) ?? 0)
    if (Date.now() - seenAt < 30_000 || recording.has(path)) return
    recording.add(path)

    const supabase = createClient()
    void supabase
      .from('page_views')
      .insert({ path })
      .then((result: { error: { message: string } | null }) => {
        recording.delete(path)
        if (result.error) return
        sessionStorage.setItem(storageKey, String(Date.now()))
      })
  }, [pathname])

  return null
}

function normalizePath(pathname: string) {
  if (!pathname.startsWith('/')) return null
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (path.length > 200 || !/^\/[A-Za-z0-9/_~.-]*$/.test(path)) return null
  return path
}
