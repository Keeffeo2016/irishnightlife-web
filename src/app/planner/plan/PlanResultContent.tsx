'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MapPin, Clock, Euro, Sparkles, RefreshCw, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Venue {
  id: string
  name: string
  slug: string
  description: string
  address: string
  city: string
  county: string
  latitude: number
  longitude: number
  price_range: string
  music_genres: string[]
  atmosphere: string[]
}

interface Event {
  id: string
  title: string
  slug: string
  description: string
  start_time: string
  end_time: string
  price_min: number
  price_max: number
  is_free: boolean
  music_genre: string
  atmosphere: string
  venues: Venue
}

interface PlanResult {
  narrative: string
  events: Event[]
  total_cost: string
  estimated_duration: string
}

export default function PlanResultContent() {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<PlanResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const context = {
    who: searchParams.get('who') || '',
    vibe: searchParams.get('vibe') || '',
    budget: searchParams.get('budget') || '',
    tomorrow: searchParams.get('tomorrow') || '',
  }

  useEffect(() => {
    async function fetchPlan() {
      try {
        setLoading(true)
        const response = await fetch('/api/planner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(context),
        })

        if (!response.ok) {
          throw new Error('Failed to generate plan')
        }

        const data = await response.json()
        setPlan(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [])

  const handleRegenerate = () => {
    setLoading(true)
    setPlan(null)
    fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
    })
      .then(res => res.json())
      .then(data => {
        setPlan(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  const handleShare = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    alert('Plan link copied to clipboard!')
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (event: Event) => {
    if (event.is_free) return 'Free'
    if (event.price_min === event.price_max) return `€${event.price_min}`
    return `€${event.price_min}-€${event.price_max}`
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-2xl font-bold text-emerald-600">IrishNightlife</Link>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="h-16 w-16 text-emerald-600 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crafting your perfect night...</h2>
            <p className="text-gray-600">Finding the best venues and events for you</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-2xl font-bold text-emerald-600">IrishNightlife</Link>
            </div>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!plan) {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-emerald-600">IrishNightlife</Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/events" className="text-gray-700 hover:text-emerald-600 font-medium">Events</Link>
              <Link href="/venues" className="text-gray-700 hover:text-emerald-600 font-medium">Venues</Link>
              <Link href="/planner" className="text-emerald-600 font-medium">Tonight Planner</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Plan Header */}
          <div className="text-center mb-8">
            <Sparkles className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Perfect Night</h1>
            <p className="text-xl text-gray-600 italic mb-6">"{plan.narrative}"</p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Euro className="h-4 w-4" />
                <span>Estimated cost: {plan.total_cost}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Duration: {plan.estimated_duration}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              onClick={handleRegenerate}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Plan
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Plan
            </Button>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {plan.events.map((event, index) => (
              <Card key={event.id} className="bg-white border-gray-200 hover:border-emerald-500 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Timeline Number */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                          <Link
                            href={`/venues/${event.venues.slug}`}
                            className="text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            {event.venues.name}
                          </Link>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700">
                          {event.music_genre}
                        </Badge>
                      </div>

                      <p className="text-gray-600 mb-4">{event.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{event.venues.address}, {event.venues.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Euro className="h-4 w-4" />
                          <span>{formatPrice(event)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.venues.atmosphere.slice(0, 3).map((atm, idx) => (
                          <Badge key={idx} variant="outline" className="border-gray-300 text-gray-700">
                            {atm}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        <Link href={`/events/${event.slug}`}>
                          <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                            View Event Details
                          </Button>
                        </Link>
                        <Link href={`/venues/${event.venues.slug}`}>
                          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                            View Venue
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map Placeholder */}
          <Card className="bg-white border-gray-200 mt-8">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Route Tonight</h3>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <p className="text-gray-500">Map view coming soon</p>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Total walking time: ~15 minutes between all venues
              </p>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not quite right?</h2>
            <p className="text-gray-600 mb-6">Try regenerating or start over with different preferences</p>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={handleRegenerate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              <Link href="/planner">
                <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                  Start Over
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
