'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, Music, Ticket, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const EVENTS = [
  { id: '1', title: 'Jazz Night', venue: 'The Bleeding Heart', city: 'Dublin', date: '2026-10-24', time: '21:00', genre: 'Jazz', price: 'Free', crowd: 'Moderate', type: 'live_music', image: '🎷' },
  { id: '2', title: 'Live Trad Session', venue: "O'Flaherty's", city: 'Galway', date: '2026-10-24', time: '20:30', genre: 'Traditional', price: 'Free', crowd: 'Busy', type: 'live_music', image: '🎻' },
  { id: '3', title: 'DJ Electro Pulse', venue: 'The Warehouse', city: 'Dublin', date: '2026-10-24', time: '22:00', genre: 'Electronic', price: '€15', crowd: 'Packed', type: 'dj', image: '🎧' },
  { id: '4', title: 'Comedy Club Night', venue: 'The Comedy Cellar', city: 'Dublin', date: '2026-10-24', time: '20:00', genre: 'Comedy', price: '€12', crowd: 'Moderate', type: 'comedy', image: '🎤' },
  { id: '5', title: 'Rugby on the Big Screen', venue: 'The Long Hall', city: 'Dublin', date: '2026-10-25', time: '19:00', genre: 'Sports', price: 'Free', crowd: 'Busy', type: 'sports', image: '🏉' },
  { id: '6', title: 'Cocktail Masterclass', venue: 'The Mixology Bar', city: 'Cork', date: '2026-10-25', time: '19:30', genre: 'Experience', price: '€35', crowd: 'Quiet', type: 'special', image: '🍹' },
  { id: '7', title: 'Open Mic Night', venue: 'The Dark Horse', city: 'Limerick', date: '2026-10-26', time: '20:00', genre: 'Various', price: 'Free', crowd: 'Moderate', type: 'live_music', image: '🎵' },
  { id: '8', title: 'Quiz Night', venue: 'The Round Room', city: 'Dublin', date: '2026-10-27', time: '20:30', genre: 'Quiz', price: 'Free', crowd: 'Busy', type: 'special', image: '🧠' },
  { id: '9', title: 'Halloween Special', venue: 'The Bleeding Heart', city: 'Dublin', date: '2026-10-31', time: '20:00', genre: 'Party', price: '€20', crowd: 'Packed', type: 'special', image: '🎃' },
]

const EVENT_TYPES = ['All', 'Live Music', 'DJ', 'Comedy', 'Sports', 'Quiz', 'Special']
const CITIES = ['All', 'Dublin', 'Cork', 'Galway', 'Limerick']

export default function EventsPage() {
  const [selectedCity, setSelectedCity] = useState('All')
  const [selectedType, setSelectedType] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredEvents = EVENTS.filter(e => {
    if (selectedCity !== 'All' && e.city !== selectedCity) return false
    if (selectedType !== 'All' && e.type !== selectedType.toLowerCase().replace(' ', '_')) return false
    if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Events Tonight & Beyond</h1>
        <p className="text-gray-400">What's happening across Ireland's nightlife scene</p>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
            className="pl-10 bg-white/5 border-white/10 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-400 self-center mr-2">City:</span>
          {CITIES.map((city) => (
            <Badge
              key={city}
              variant={selectedCity === city ? 'default' : 'outline'}
              className={`cursor-pointer ${
                selectedCity === city
                  ? 'bg-emerald-600 text-white'
                  : 'border-white/20 text-gray-300 hover:border-emerald-500'
              }`}
              onClick={() => setSelectedCity(city)}
            >
              {city}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-400 self-center mr-2">Type:</span>
          {EVENT_TYPES.map((type) => (
            <Badge
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              className={`cursor-pointer ${
                selectedType === type
                  ? 'bg-emerald-600 text-white'
                  : 'border-white/20 text-gray-300 hover:border-emerald-500'
              }`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <Card key={event.id} className="bg-white/5 border-white/10 hover:border-emerald-500/50 transition-all hover:scale-[1.02] cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{event.image}</span>
                <Badge className={
                  event.crowd === 'Packed' ? 'bg-red-500/20 text-red-400' :
                  event.crowd === 'Busy' ? 'bg-amber-500/20 text-amber-400' :
                  event.crowd === 'Moderate' ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-blue-500/20 text-blue-400'
                }>
                  {event.crowd}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{event.title}</h3>
              <p className="text-emerald-400 text-sm mb-2">{event.venue}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {event.city}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <Music className="h-3 w-3" /> {event.genre}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">{event.price}</span>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Ticket className="h-3 w-3 mr-1" /> Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No events found matching your filters.</p>
          <Button variant="outline" className="mt-4 border-white/20 text-gray-300" onClick={() => {
            setSelectedCity('All')
            setSelectedType('All')
            setSearchQuery('')
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
