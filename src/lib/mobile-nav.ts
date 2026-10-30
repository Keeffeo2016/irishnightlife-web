export type MobileNavRoute = '/' | '/events' | '/venues' | '/planner' | '/profile'

export interface MobileNavItem {
  label: 'Home' | 'Events' | 'Explore' | 'Planner' | 'Profile'
  href: MobileNavRoute
}

export const MOBILE_NAV_ITEMS: readonly MobileNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Events', href: '/events' },
  { label: 'Explore', href: '/venues' },
  { label: 'Planner', href: '/planner' },
  { label: 'Profile', href: '/profile' },
] as const

const HIDDEN_ROUTE_PREFIXES = ['/dashboard', '/admin', '/auth'] as const

export function normalizePathname(pathname: string | null | undefined): string {
  const raw = pathname?.trim() || '/'
  const withoutQuery = raw.split('?')[0]?.split('#')[0] || '/'
  if (withoutQuery === '/') return '/'
  return withoutQuery.endsWith('/') ? withoutQuery.slice(0, -1) : withoutQuery
}

export function shouldShowMobileNav(pathname: string | null | undefined): boolean {
  if (!pathname || !pathname.trim()) return false
  const clean = normalizePathname(pathname)
  for (const prefix of HIDDEN_ROUTE_PREFIXES) {
    if (clean === prefix || clean.startsWith(`${prefix}/`)) {
      return false
    }
  }
  return true
}

export function isMobileNavItemActive(
  pathname: string | null | undefined,
  href: MobileNavRoute
): boolean {
  if (!shouldShowMobileNav(pathname)) return false
  const clean = normalizePathname(pathname)

  switch (href) {
    case '/':
      return clean === '/'
    case '/events':
      return clean === '/events' || clean.startsWith('/events/')
    case '/venues':
      return clean === '/venues' || clean.startsWith('/venues/')
    case '/planner':
      return clean === '/planner' || clean.startsWith('/planner/')
    case '/profile':
      return clean === '/profile' || clean.startsWith('/profile/')
    default: {
      const _exhaustive: never = href
      return _exhaustive
    }
  }
}

export function activeMobileNavHref(
  pathname: string | null | undefined
): MobileNavRoute | null {
  for (const item of MOBILE_NAV_ITEMS) {
    if (isMobileNavItemActive(pathname, item.href)) {
      return item.href
    }
  }
  return null
}
