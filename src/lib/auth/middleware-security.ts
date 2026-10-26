/**
 * Next.js middleware security helpers.
 * Uses pure logic from middleware-security-pure.ts and adds Next.js-specific behavior.
 */

import { NextResponse, type NextRequest } from 'next/server'

/**
 * Create a fail-closed response when Supabase is not configured.
 * In production, returns a 503 Service Unavailable.
 * In development, can optionally fail open for convenience.
 */
export function createAuthUnavailableResponse(
  request: NextRequest,
  options: { failOpenInDev?: boolean } = {}
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production'
  const shouldFailOpen = options.failOpenInDev && !isProduction

  if (shouldFailOpen) {
    // Development: fail open for convenience
    return NextResponse.next({ request })
  }

  // Production or development without failOpenInDev: fail closed
  return NextResponse.json(
    {
      error: 'Authentication service unavailable',
      message: 'Please try again later.',
    },
    {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Retry-After': '60',
      },
    }
  )
}
