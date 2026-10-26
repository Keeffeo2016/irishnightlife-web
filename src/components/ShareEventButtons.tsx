'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

type ShareTarget = 'facebook' | 'x' | 'instagram'
type InstagramNotice = 'idle' | 'copied' | 'failed'

interface ShareEventButtonsProps {
  title: string
  venueName: string
  slug: string
}

function eventPageUrl(slug: string): string {
  return new URL(`/events/${slug}`, window.location.origin).toString()
}

function openShare(href: string) {
  window.open(href, '_blank', 'noopener,noreferrer')
}

async function copyEventLink(value: string): Promise<'copied' | 'failed'> {
  try {
    const wrote = navigator.clipboard.writeText(value)
    const timedOut = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('clipboard timeout')), 1500)
    })
    await Promise.race([wrote, timedOut])
    return 'copied'
  } catch {
    return 'failed'
  }
}

function instagramNotice(notice: InstagramNotice): string | null {
  switch (notice) {
    case 'idle':
      return null
    case 'copied':
      return 'Link copied. Paste it into your Instagram post or story.'
    case 'failed':
      return 'Instagram is open. Copy this page’s address and paste it there.'
    default: {
      const exhaustive: never = notice
      return exhaustive
    }
  }
}

export function ShareEventButtons({ title, venueName, slug }: ShareEventButtonsProps) {
  const [notice, setNotice] = useState<InstagramNotice>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const share = async (target: ShareTarget) => {
    const pageUrl = eventPageUrl(slug)
    const text = `${title} at ${venueName}`

    switch (target) {
      case 'facebook':
        openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`)
        return
      case 'x': {
        const intent = new URL('https://x.com/intent/post')
        intent.searchParams.set('text', text)
        intent.searchParams.set('url', pageUrl)
        openShare(intent.toString())
        return
      }
      case 'instagram': {
        openShare('https://www.instagram.com/')
        if (timer.current) clearTimeout(timer.current)
        setNotice(await copyEventLink(`${text}\n${pageUrl}`))
        timer.current = setTimeout(() => setNotice('idle'), 4000)
        return
      }
      default: {
        const exhaustive: never = target
        return exhaustive
      }
    }
  }

  const message = instagramNotice(notice)

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void share('facebook')}>
          <FacebookIcon />
          Facebook
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void share('x')}>
          <XIcon />
          X
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void share('instagram')}>
          <InstagramIcon />
          Instagram
        </Button>
      </div>
      {message ? (
        <p className="mt-2 text-sm text-gray-500" role="status">
          {message}
        </p>
      ) : null}
    </div>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.5 8.5V6.8c0-.7.5-1.1 1.2-1.1H17V3h-2.1C12.4 3 11 4.4 11 6.7v1.8H9v2.7h2V21h2.8v-9.6h2.3l.4-2.7h-2.7z"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.726-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
    </svg>
  )
}
