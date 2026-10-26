'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2,
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  PlusCircle,
} from 'lucide-react'
import {
  DASHBOARD_NAV_ITEMS,
  isDashboardNavItemActive,
  type DashboardNavRoute,
} from '@/lib/dashboard-validation'
import { SignOutButton } from '@/app/profile/SignOutButton'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function NavIcon({
  href,
  active,
}: {
  href: DashboardNavRoute
  active: boolean
}) {
  const iconClass = cn(
    'h-4 w-4 shrink-0',
    active ? 'stroke-[2.25] text-mint' : 'stroke-[1.75] text-muted-foreground'
  )

  switch (href) {
    case '/dashboard':
      return <LayoutDashboard className={iconClass} aria-hidden="true" />
    case '/dashboard/events':
      return <CalendarDays className={iconClass} aria-hidden="true" />
    case '/dashboard/events/new':
      return <PlusCircle className={iconClass} aria-hidden="true" />
    case '/dashboard/profile':
      return <Building2 className={iconClass} aria-hidden="true" />
    default: {
      const _exhaustive: never = href
      return _exhaustive
    }
  }
}

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Venue dashboard navigation" className="mt-6">
      <ul className="grid grid-cols-2 gap-2 pb-3 sm:flex sm:flex-wrap sm:gap-1 sm:pb-0">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const active = isDashboardNavItemActive(pathname, item.href)

          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:w-auto sm:justify-start sm:rounded-t-xl sm:rounded-b-none sm:border-b-0 sm:px-4',
                  active
                    ? 'border-primary/40 bg-primary/15 font-semibold text-mint'
                    : 'border-border bg-card/50 font-medium text-muted-foreground hover:border-border hover:bg-card hover:text-foreground sm:border-transparent sm:bg-transparent'
                )}
              >
                <NavIcon href={item.href} active={active} />
                <span className="truncate">{item.label}</span>
                {active ? (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-2 bottom-0 hidden h-0.5 rounded-full bg-primary sm:block"
                  />
                ) : null}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function DashboardShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string
  subtitle?: string | null
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-background">
      <header className="border-b border-border bg-gradient-to-br from-night via-night-soft to-forest/80 pt-8">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-mint">
                VENUE OWNER PORTAL
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {actions}
              <Link
                href="/"
                aria-label="Return to public website"
                className={cn(
                  buttonVariants({ variant: 'brand-outline-dark', size: 'default' }),
                  'gap-1.5 text-xs sm:text-sm'
                )}
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Public site</span>
              </Link>
              <SignOutButton />
            </div>
          </div>

          <DashboardNav />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {children}
      </div>
    </div>
  )
}
