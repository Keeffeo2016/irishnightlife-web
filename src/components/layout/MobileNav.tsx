'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Compass,
  House,
  Sparkles,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { cn } from 'cn'
import {
  isMobileNavItemActive,
  MOBILE_NAV_ITEMS,
  shouldShowMobileNav,
  type MobileNavRoute,
} from '@/lib/mobile-nav'

function iconForRoute(href: MobileNavRoute): LucideIcon {
  switch (href) {
    case '/':
      return House
    case '/events':
      return CalendarDays
    case '/venues':
      return Compass
    case '/planner':
      return Sparkles
    case '/profile':
      return UserRound
    default: {
      const _exhaustive: never = href
      return _exhaustive
    }
  }
}

export function MobileNav() {
  const pathname = usePathname()

  if (!shouldShowMobileNav(pathname)) {
    return null
  }

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 px-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const active = isMobileNavItemActive(pathname, item.href)
          const Icon = iconForRoute(item.href)

          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-16 min-w-11 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] leading-none transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'font-semibold text-primary'
                    : 'font-medium text-muted-foreground hover:text-foreground'
                )}
              >
                {active ? (
                  <span
                    aria-hidden="true"
                    className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                  />
                ) : null}
                <span
                  className={cn(
                    'flex h-7 w-10 items-center justify-center rounded-full transition-colors motion-reduce:transition-none',
                    active && 'bg-primary/15'
                  )}
                >
                  <Icon
                    className={cn('h-5 w-5 shrink-0', active && 'stroke-[2.25]')}
                    aria-hidden="true"
                  />
                </span>
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
