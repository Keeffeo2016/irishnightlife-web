export const ROBOTS_DISALLOW_PATHS = [
  '/dashboard',
  '/admin',
  '/profile',
  '/auth',
  '/api',
  '/planner/plan',
] as const

export const SITEMAP_STATIC_PATHS = [
  '/',
  '/events',
  '/venues',
  '/planner',
  '/for-venues',
] as const

export function resolveAppOrigin(raw = process.env.NEXT_PUBLIC_APP_URL): string {
  const trimmed = raw?.trim()
  if (trimmed) {
    try {
      const url = new URL(trimmed)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return url.origin
      }
    } catch {
      // fall through to localhost
    }
  }
  // NEXT_PUBLIC_APP_URL unset/invalid — match siteOrigin helpers
  return 'http://localhost:3000'
}

export function resolveMetadataBase(
  raw = process.env.NEXT_PUBLIC_APP_URL
): URL {
  return new URL(resolveAppOrigin(raw))
}

export function viewsSinceIso(nowMs: number, windowMs = 14 * 24 * 60 * 60 * 1000): string {
  return new Date(nowMs - windowMs).toISOString()
}
