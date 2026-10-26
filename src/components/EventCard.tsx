import Link from 'next/link'
import { Calendar, Clock, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export interface EventCardEvent {
  id: string
  title: string
  slug: string
  description: string
  event_type: string
  start_time: string
  price_min: number
  price_max: number | null
  is_free: boolean
  music_genre: string
  venues: {
    name: string
    county: string
  }
}

const EVENT_EMOJI: Record<string, string> = {
  dj: '🎧',
  live_music: '🎵',
  comedy: '🎤',
  sports: '🏉',
  quiz: '🧠',
}

function formatPrice(event: EventCardEvent) {
  if (event.is_free) return 'Free'
  if (event.price_max == null || event.price_min === event.price_max) return `€${event.price_min}`
  return `€${event.price_min} - €${event.price_max}`
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (date.toDateString() === today.toDateString()) return 'Tonight'
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'

  return date.toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
}

export function EventCard({ event }: { event: EventCardEvent }) {
  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="bg-white border-2 border-gray-200 hover:border-emerald-500 hover:shadow-2xl transition-all cursor-pointer h-full group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl group-hover:scale-110 transition-transform">
              {EVENT_EMOJI[event.event_type] ?? '🎉'}
            </div>
            <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md">
              {event.music_genre}
            </Badge>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            {event.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>

          <div className="flex items-center gap-2 text-gray-700 mb-3">
            <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{event.venues.name}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
            <span className="font-medium text-emerald-700">{event.venues.county}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-emerald-700">{formatDate(event.start_time)}</span>
            </div>
            <div className="flex items-center gap-1 bg-cyan-50 px-2 py-1 rounded-full">
              <Clock className="h-4 w-4 text-cyan-600" />
              <span className="font-medium text-cyan-700">{formatTime(event.start_time)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              {formatPrice(event)}
            </span>
            <span className="inline-flex h-8 items-center rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-3 text-sm font-medium text-white shadow-md transition-all group-hover:shadow-lg">
              View Details →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
