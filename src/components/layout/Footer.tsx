'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from 'cn'
import { BrandLogo } from '@/components/brand/BrandLogo'
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
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <Link href="/" className="mb-4 inline-block">
              <BrandLogo
                alt="IrishNightlife.ie - Discover what's happening tonight"
                className="h-20"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              Ireland&apos;s nightlife discovery platform. Find the perfect night out.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-hotpink">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="text-muted-foreground hover:text-hotpink">Events</Link></li>
              <li><Link href="/venues" className="text-muted-foreground hover:text-hotpink">Venues</Link></li>
              <li><Link href="/planner" className="text-muted-foreground hover:text-hotpink">Tonight Planner</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-hotpink">For Venues</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/for-venues" className="text-muted-foreground hover:text-hotpink">List Your Venue</Link></li>
              <li><Link href="/auth/signup" className="text-muted-foreground hover:text-hotpink">Create an account</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-hotpink">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-hotpink">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/login" className="text-muted-foreground hover:text-hotpink">Sign in</Link></li>
              <li><Link href="/auth/signup" className="text-muted-foreground hover:text-hotpink">Get started</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-hotpink">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-hotpink">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-hotpink">Terms of Use</Link></li>
              <li><Link href="/cookies" className="text-muted-foreground hover:text-hotpink">Cookie Notice</Link></li>
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
