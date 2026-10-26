'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const LINKS = [
  { href: '/venues', label: 'Venues' },
  { href: '/events', label: 'Events' },
  { href: '/planner', label: 'Tonight Planner' },
  { href: '/for-venues', label: 'For Venues' },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  const close = () => setIsOpen(false)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user))
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.user))
    })

    return () => {
      active = false
    }
  }, [pathname])

  return (
    <nav className="border-b border-white/10 bg-night sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center" onClick={close}>
            <Image
              src="/brand/logo-nav.png"
              alt="IrishNightlife.ie"
              width={832}
              height={220}
              priority
              className="h-11 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-mint font-medium transition"
              >
                {link.label}
              </Link>
            ))}
            {signedIn === null ? null : signedIn ? (
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-md border border-mint px-4 py-2 text-sm text-mint hover:bg-mint/10 transition"
              >
                Profile
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-md border border-mint px-4 py-2 text-sm text-mint hover:bg-mint/10 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center justify-center rounded-md bg-mint px-4 py-2 text-sm font-semibold text-night hover:bg-mint-light transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-300 hover:text-mint"
                onClick={close}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {signedIn === null ? null : signedIn ? (
                <Link
                  href="/profile"
                  onClick={close}
                  className="flex-1 inline-flex items-center justify-center rounded-md border border-mint px-4 py-2 text-sm text-mint hover:bg-mint/10"
                >
                  Profile
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={close}
                    className="flex-1 inline-flex items-center justify-center rounded-md border border-mint px-4 py-2 text-sm text-mint hover:bg-mint/10"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={close}
                    className="flex-1 inline-flex items-center justify-center rounded-md bg-mint px-4 py-2 text-sm font-semibold text-night hover:bg-mint-light"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
