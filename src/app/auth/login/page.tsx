'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { AuthDivider, SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { pathAfterSignIn, safeNextPath } from '@/lib/auth/redirect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = safeNextPath(searchParams.get('next'))
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(searchParams.get('error'))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        const message = typeof data.error === 'string' ? data.error : 'Failed to sign in'
        if (/email not confirmed/i.test(message)) {
          throw new Error('Email not confirmed. Check your inbox and confirm your address, then sign in again.')
        }
        throw new Error(message)
      }

      const role = typeof data.role === 'string' ? data.role : null
      router.push(pathAfterSignIn(role, nextPath))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-night via-night-soft to-forest">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl shadow-mint/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">Welcome back</CardTitle>
          <p className="text-muted-foreground">Sign in to your IrishNightlife account</p>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/40 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <SocialAuthButtons intent="signin" nextPath={nextPath} />
          <AuthDivider label="or use email" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-sm text-foreground/90 mb-1 block font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-card border-border text-foreground"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="text-sm text-foreground/90 mb-1 block font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-card border-border text-foreground"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-1.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>
              <span className="text-sm text-muted-foreground/80">
                Password reset is not available yet
              </span>
            </div>
            <Button 
              type="submit"
              variant="brand"
              className="w-full py-6"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Own a venue?{' '}
            <Link href="/auth/signup?role=venue" className="text-primary hover:underline font-medium">
              Register your venue
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
