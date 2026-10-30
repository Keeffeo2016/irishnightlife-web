/**
 * Pure security helpers for middleware — no Next.js dependency.
 * Safe to import from test files.
 */

/**
 * Determine whether Supabase environment variables are configured.
 * Returns false if either required variable is missing or empty.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  )
}

/**
 * List of exact paths that do not require authentication.
 */
export const PUBLIC_PATHS = [
  '/',
  '/events',
  '/venues',
  '/planner',
  '/for-venues',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
]

/**
 * Check if a path is a public route that does not require authentication.
 */
export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) {
    return true
  }

  if (
    pathname.startsWith('/events/') ||
    pathname.startsWith('/venues/') ||
    pathname.startsWith('/auth/')
  ) {
    return true
  }

  if (pathname === '/api/planner') {
    return true
  }

  return false
}

/**
 * Check if a path requires authentication.
 */
export function requiresAuth(pathname: string): boolean {
  return !isPublicPath(pathname)
}
