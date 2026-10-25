'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-emerald-400" />
            <span className="text-xl font-bold text-white">
              Irish<span className="text-emerald-400">Nightlife</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/venues" className="text-gray-300 hover:text-white transition">
              Venues
            </Link>
            <Link href="/events" className="text-gray-300 hover:text-white transition">
              Events
            </Link>
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition">
              Venue Dashboard
            </Link>
            <Link href="/admin" className="text-gray-300 hover:text-white transition">
              Admin
            </Link>
            <Link href="/auth/login" className="inline-flex items-center justify-center rounded-md border border-emerald-500 px-4 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 transition">
              Sign In
            </Link>
            <Link href="/auth/signup" className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 transition">
              Get Started
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/venues" className="block py-2 text-gray-300 hover:text-white">
              Venues
            </Link>
            <Link href="/events" className="block py-2 text-gray-300 hover:text-white">
              Events
            </Link>
            <Link href="/dashboard" className="block py-2 text-gray-300 hover:text-white">
              Venue Dashboard
            </Link>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 border-emerald-500 text-emerald-400">
                Sign In
              </Button>
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
