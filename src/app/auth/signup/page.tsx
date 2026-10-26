'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
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
      <Card className="w-full max-w-md bg-card border-border shadow-2xl shadow-mint/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">Create your account</CardTitle>
          <p className="text-muted-foreground">Join Ireland's nightlife discovery platform</p>
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
                  ? 'bg-mint text-night font-semibold'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              🎉 I'm going out
            </button>
            <button
              type="button"
              onClick={() => setAccountType('venue')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                accountType === 'venue'
                  ? 'bg-mint text-night font-semibold'
                  : 'bg-muted text-muted-foreground hover:bg-secondary'
              }`}
            >
              🏢 I own a venue
            </button>
          </div>

          {accountType === 'consumer' && (
            <>
              <SocialAuthButtons intent="signup" nextPath="/" />
              <AuthDivider label="or use email" />
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-foreground/90 mb-1 block font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="John Murphy"
                  className="pl-10 bg-card border-border text-foreground"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-foreground/90 mb-1 block font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-card border-border text-foreground"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-foreground/90 mb-1 block font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className="pl-10 pr-10 bg-card border-border text-foreground"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {accountType === 'venue' && (
              <>
                <p className="text-sm text-muted-foreground">
                  Your venue stays hidden until a superadmin approves it.
                </p>
                <div>
                  <label className="text-sm text-foreground/90 mb-1 block font-medium">Venue Name</label>
                  <Input
                    placeholder="The Bleeding Heart"
                    className="bg-card border-border text-foreground"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/90 mb-1 block font-medium">Address</label>
                  <Input
                    placeholder="12 Oliver Plunkett Street"
                    className="bg-card border-border text-foreground"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/90 mb-1 block font-medium">Eircode</label>
                  <Input
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
                  <label className="text-sm text-foreground/90 mb-1 block font-medium">City</label>
                  <Input
                    placeholder="Cork"
                    className="bg-card border-border text-foreground"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/90 mb-1 block font-medium">County</label>
                  <Input
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
              disabled={loading}
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
