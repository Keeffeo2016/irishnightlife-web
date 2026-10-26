'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from 'cn'
import { shouldShowMobileNav } from '@/lib/mobile-nav'

export function Footer() {
  const pathname = usePathname()
  const hasMobileNav = shouldShowMobileNav(pathname)

  return (
    <footer
      className={cn(
        'mt-auto border-t border-border bg-night text-white',
        hasMobileNav && 'pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="mb-4 inline-block">
              <Image
                src="/brand/logo.png"
                alt="IrishNightlife.ie — Discover what's happening tonight"
                width={832}
                height={220}
                className="h-[77px] w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Ireland&apos;s nightlife discovery platform. Find the perfect night out.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-mint">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="text-muted-foreground hover:text-mint">Events</Link></li>
              <li><Link href="/venues" className="text-muted-foreground hover:text-mint">Venues</Link></li>
              <li><Link href="/planner" className="text-muted-foreground hover:text-mint">Tonight Planner</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-mint">For Venues</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/for-venues" className="text-muted-foreground hover:text-mint">List Your Venue</Link></li>
              <li><Link href="/auth/signup" className="text-muted-foreground hover:text-mint">Create an account</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-mint">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-mint">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/login" className="text-muted-foreground hover:text-mint">Sign in</Link></li>
              <li><Link href="/auth/signup" className="text-muted-foreground hover:text-mint">Get started</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © 2026 IrishNightlife. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
