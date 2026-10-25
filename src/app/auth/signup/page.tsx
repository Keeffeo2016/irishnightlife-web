'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [accountType, setAccountType] = useState<'consumer' | 'venue'>('consumer')

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-white/5 border-white/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MapPin className="h-10 w-10 text-emerald-400" />
          </div>
          <CardTitle className="text-2xl text-white">Create your account</CardTitle>
          <p className="text-gray-400">Join Ireland's nightlife discovery platform</p>
        </CardHeader>
        <CardContent>
          {/* Account Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setAccountType('consumer')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                accountType === 'consumer'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              🎉 I'm going out
            </button>
            <button
              onClick={() => setAccountType('venue')}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                accountType === 'venue'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              🏢 I own a venue
            </button>
          </div>

          <form className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="John Murphy"
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10 bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  className="pl-10 pr-10 bg-white/5 border-white/10 text-white"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {accountType === 'venue' && (
              <>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Venue Name</label>
                  <Input
                    placeholder="The Bleeding Heart"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">City</label>
                  <Input
                    placeholder="Dublin"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </>
            )}

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6" size="lg">
              {accountType === 'consumer' ? 'Create Account' : 'Register Venue'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-400 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
