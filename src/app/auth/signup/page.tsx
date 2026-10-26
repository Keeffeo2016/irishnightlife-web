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
        router.push('/auth/login')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-night via-night-soft to-forest">
      <Card className="w-full max-w-md bg-white border-gray-200 shadow-2xl shadow-mint/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MapPin className="h-10 w-10 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Create your account</CardTitle>
          <p className="text-gray-600">Join Ireland's nightlife discovery platform</p>
        </CardHeader>
        <CardContent>
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-emerald-700 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
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
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              <label className="text-sm text-gray-700 mb-1 block font-medium">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="John Murphy"
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-1 block font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className="pl-10 pr-10 bg-white border-gray-300 text-gray-900"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {accountType === 'venue' && (
              <>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block font-medium">Venue Name</label>
                  <Input
                    placeholder="The Bleeding Heart"
                    className="bg-white border-gray-300 text-gray-900"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block font-medium">Address</label>
                  <Input
                    placeholder="12 Oliver Plunkett Street"
                    className="bg-white border-gray-300 text-gray-900"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block font-medium">City</label>
                  <Input
                    placeholder="Cork"
                    className="bg-white border-gray-300 text-gray-900"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-700 mb-1 block font-medium">County</label>
                  <Input
                    placeholder="Cork"
                    className="bg-white border-gray-300 text-gray-900"
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

          {accountType === 'venue' && (
            <>
              <AuthDivider label="or continue with" />
              <SocialAuthButtons intent="signup" nextPath="/auth/complete-venue" />
              <p className="mt-3 text-center text-xs text-gray-500">
                You will add the venue name and address on the next screen.
              </p>
            </>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
