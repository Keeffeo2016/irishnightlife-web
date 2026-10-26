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

const VENUE_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/events', label: 'Events' },
  { href: '/dashboard/profile', label: 'Profile' },
]

function isVenueLinkActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [role, setRole] = useState<string | null>(null)

  const close = () => setIsOpen(false)
  const links = role === 'venue_owner' ? VENUE_LINKS : LINKS
  const isVenue = role === 'venue_owner'

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function loadSession() {
      const { data } = await supabase.auth.getUser()
      if (!active) return
      if (!data.user) {
        setSignedIn(false)
        setRole(null)
        return
      }
      setSignedIn(true)
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
      if (active) setRole(profile?.role ?? null)
    }

    loadSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadSession()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [pathname])

  return (
    <nav className="border-b border-border bg-night sticky top-0 z-50">
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
            {links.map((link) => {
              const active = isVenue && isVenueLinkActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'text-mint font-medium'
                      : 'text-muted-foreground hover:text-mint font-medium transition'
                  }
                >
                  {link.label}
                </Link>
              )
            })}
            {role === 'admin' ? (
              <Link href="/admin" className="text-muted-foreground hover:text-mint font-medium transition">
                Admin
              </Link>
            ) : null}
            {!isVenue && signedIn === true ? (
              <Link
                href="/profile"
                className="inline-flex items-center justify-center rounded-md border border-mint px-4 py-2 text-sm text-mint hover:bg-mint/10 transition"
              >
                Profile
              </Link>
            ) : null}
            {!isVenue && signedIn === false ? (
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
            ) : null}
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
            {links.map((link) => {
              const active = isVenue && isVenueLinkActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`block py-2 ${active ? 'text-mint font-medium' : 'text-muted-foreground hover:text-mint'}`}
                  onClick={close}
                >
                  {link.label}
                </Link>
              )
            })}
            {role === 'admin' ? (
              <Link href="/admin" className="block py-2 text-muted-foreground hover:text-mint" onClick={close}>
                Admin
              </Link>
            ) : null}
            {!isVenue && signedIn === true ? (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/profile"
                  onClick={close}
                  className="flex-1 inline-flex items-center justify-center rounded-md border border-mint px-4 py-2 text-sm text-mint hover:bg-mint/10"
                >
                  Profile
                </Link>
              </div>
            ) : null}
            {!isVenue && signedIn === false ? (
              <div className="flex gap-2 pt-2">
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
              </div>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  )
}
