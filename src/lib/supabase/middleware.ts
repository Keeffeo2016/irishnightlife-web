import { type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { pathAfterSignIn, safeNextPath } from '@/lib/auth/redirect'
import { createAuthUnavailableResponse } from '@/lib/auth/middleware-security'
import { isSupabaseConfigured, requiresAuth } from '@/lib/auth/middleware-security-pure'

export async function updateSession(request: NextRequest) {
  // Fail closed: if Supabase is not configured, reject requests to protected routes
  if (!isSupabaseConfigured()) {
    const path = request.nextUrl.pathname
    
    // Public routes can proceed without auth
    if (!requiresAuth(path)) {
      return NextResponse.next({ request })
    }
    
    // Protected routes fail closed
    return createAuthUnavailableResponse(request, { failOpenInDev: true })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const needsOwner = path.startsWith('/dashboard')
  const needsAdmin = path.startsWith('/admin')
  const signingIn = path === '/auth/login'

  if (needsOwner || needsAdmin || (signingIn && user)) {
    const redirectTo = (pathname: string) => {
      const url = request.nextUrl.clone()
      url.pathname = pathname
      url.search = ''
      if (pathname === '/auth/login') {
        url.searchParams.set('next', path)
      }
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie)
      })
      return redirectResponse
    }

    if (!user) {
      return redirectTo('/auth/login')
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    if (signingIn && role === 'venue_owner') {
      const next = safeNextPath(request.nextUrl.searchParams.get('next'))
      return redirectTo(pathAfterSignIn(role, next))
    }

    if (needsAdmin && role !== 'admin') {
      return redirectTo('/')
    }

    if (needsOwner && role !== 'venue_owner' && role !== 'admin') {
      return redirectTo('/for-venues')
    }
  }

  return supabaseResponse
}
