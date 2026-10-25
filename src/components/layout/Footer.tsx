'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin } from 'lucide-react'

export function Footer() {
  const [year, setYear] = useState(2026)
  
  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-emerald-400" />
              <span className="text-xl font-bold text-white">
                Irish<span className="text-emerald-400">Nightlife</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm">
              Don't just go out. Find your night.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Discover</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/venues" className="text-gray-400 hover:text-white">Venues</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-white">Events</Link></li>
              <li><Link href="/dublin" className="text-gray-400 hover:text-white">Dublin</Link></li>
              <li><Link href="/cork" className="text-gray-400 hover:text-white">Cork</Link></li>
              <li><Link href="/galway" className="text-gray-400 hover:text-white">Galway</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Venues</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white">Venue Dashboard</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link href="/partners" className="text-gray-400 hover:text-white">Partner With Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white">Privacy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-500 text-sm">
          © {year} IrishNightlife.ie — Ireland's Nightlife Intelligence Platform
        </div>
      </div>
    </footer>
  )
}
