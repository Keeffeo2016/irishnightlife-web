import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pathAfterSignIn, safeNextPath } from '@/lib/auth/redirect'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNextPath(searchParams.get('next'))
  const providerError = searchParams.get('error_description') || searchParams.get('error')
  const origin = publicOrigin(request)

  if (providerError && !code) {
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(clip(providerError))}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = user
        ? await supabase.from('users').select('role').eq('id', user.id).maybeSingle()
        : { data: null }
      return NextResponse.redirect(`${origin}${pathAfterSignIn(profile?.role, next)}`)
    }
  }

  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent('Sign-in could not be completed. Try again.')}`
  )
}

function publicOrigin(request: Request) {
  const { origin } = new URL(request.url)
  if (process.env.NODE_ENV === 'development') return origin

  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  if (forwardedHost && /^[a-z0-9.-]+(?::\d+)?$/i.test(forwardedHost)) {
    return `https://${forwardedHost}`
  }
  return origin
}

function clip(value: string) {
  return value.replace(/\s+/g, ' ').slice(0, 200)
}
