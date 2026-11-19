'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { AuthDivider, SocialAuthButtons } from '@/components/auth/SocialAuthButtons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<'consumer' | 'venue'>(
    searchParams.get('role') === 'venue' ? 'venue' : 'consumer'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [acceptedLegal, setAcceptedLegal] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    venueName: '',
    address: '',
    eircode: '',
    city: '',
    county: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptedLegal) {
      setError('Please agree to the Terms of Use and Privacy Policy to continue.')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          accountType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account')
      }

      setSuccess(data.message)
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push(accountType === 'venue' ? '/auth/login?next=/dashboard' : '/auth/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-night via-night-soft to-forest">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl shadow-hotpink/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo className="h-16" />
          </div>
          <CardTitle className="text-2xl text-foreground">Create your account</CardTitle>
          <p className="text-muted-foreground">Join Ireland&apos;s nightlife discovery platform</p>
        </CardHeader>
        <CardContent>
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/40 rounded-lg">
              <p className="text-primary text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/40 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {/* Account Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setAccountType('consumer')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                accountType === 'consumer'
                  ? 'bg-hotpink text-night font-semibold'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              🎉 I&apos;m going out
            </button>
            <button
              type="button"
              onClick={() => setAccountType('venue')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                accountType === 'venue'
                  ? 'bg-hotpink text-night font-semibold'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              🏢 I own a venue
            </button>
          </div>

          <div className="mb-6 flex items-start gap-3">
            <input
              id="signup-legal"
              type="checkbox"
              checked={acceptedLegal}
              onChange={(e) => {
                setAcceptedLegal(e.target.checked)
                if (e.target.checked) setError(null)
              }}
              className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-hotpink"
            />
            <label htmlFor="signup-legal" className="text-sm leading-relaxed text-muted-foreground">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline font-medium">
                Terms of Use
              </Link>{' '}
              and acknowledge the{' '}
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          {accountType === 'consumer' && (
            <>
              <SocialAuthButtons
                intent="signup"
                nextPath="/"
                disabled={!acceptedLegal}
              />
              {!acceptedLegal ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Accept the Terms and Privacy Policy above to continue with Google or Apple.
                </p>
              ) : null}
              <AuthDivider label="or use email" />
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signup-full-name" className="text-sm text-foreground/90 mb-1 block font-medium">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="signup-full-name"
                  autoComplete="name"
                  placeholder="John Murphy"
                  className="pl-10 bg-card border-border text-foreground"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="signup-email" className="text-sm text-foreground/90 mb-1 block font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-card border-border text-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="signup-password" className="text-sm text-foreground/90 mb-1 block font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 characters"
                  className="pl-10 pr-10 bg-card border-border text-foreground"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
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

            {accountType === 'venue' && (
              <>
                <p className="text-sm text-muted-foreground">
                  Your venue stays hidden until a superadmin approves it.
                </p>
                <div>
                  <label htmlFor="signup-venue-name" className="text-sm text-foreground/90 mb-1 block font-medium">
                    Venue Name
                  </label>
                  <Input
                    id="signup-venue-name"
                    placeholder="The Bleeding Heart"
                    className="bg-card border-border text-foreground"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-address" className="text-sm text-foreground/90 mb-1 block font-medium">
                    Address
                  </label>
                  <Input
                    id="signup-address"
                    autoComplete="street-address"
                    placeholder="12 Oliver Plunkett Street"
                    className="bg-card border-border text-foreground"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-eircode" className="text-sm text-foreground/90 mb-1 block font-medium">
                    Eircode
                  </label>
                  <Input
                    id="signup-eircode"
                    autoComplete="postal-code"
                    placeholder="T12 W8RP"
                    className="bg-card border-border text-foreground uppercase"
                    value={formData.eircode}
                    onChange={(e) => setFormData({ ...formData, eircode: e.target.value.toUpperCase() })}
                    required
                    autoCapitalize="characters"
                    maxLength={8}
                  />
                </div>
                <div>
                  <label htmlFor="signup-city" className="text-sm text-foreground/90 mb-1 block font-medium">
                    City
                  </label>
                  <Input
                    id="signup-city"
                    autoComplete="address-level2"
                    placeholder="Cork"
                    className="bg-card border-border text-foreground"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="signup-county" className="text-sm text-foreground/90 mb-1 block font-medium">
                    County
                  </label>
                  <Input
                    id="signup-county"
                    autoComplete="address-level1"
                    placeholder="Cork"
                    className="bg-card border-border text-foreground"
                    value={formData.county}
                    onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                    required
                  />
                </div>
              </>
            )}

            <Button 
              type="submit"
              variant="brand"
              className="w-full py-6"
              size="lg"
              disabled={loading || !acceptedLegal}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                accountType === 'consumer' ? 'Create Account' : 'Register Venue'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
