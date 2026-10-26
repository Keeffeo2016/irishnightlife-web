import { summarizeEvents } from '@/lib/planner'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ALTERNATE_LIMIT = 8

// Context to atmosphere/vibe mapping
const VIBE_TO_ATMOSPHERE: Record<string, string[]> = {
  chill: ['Relaxed', 'Cozy', 'Intimate', 'Authentic', 'Traditional'],
  wild: ['Lively', 'Energetic', 'High-energy', 'Party', 'Social'],
  cultural: ['Cultural', 'Historic', 'Artsy', 'Authentic', 'Traditional'],
  romantic: ['Intimate', 'Romantic', 'Cozy', 'Sophisticated', 'Hidden Gem'],
  surprise: ['Hidden Gem', 'Unique', 'Eclectic', 'Bohemian', 'Artsy'],
}

const VIBE_TO_GENRE: Record<string, string[]> = {
  chill: ['Jazz', 'Acoustic', 'Folk', 'Traditional Irish', 'Ambient'],
  wild: ['Electronic', 'House', 'Techno', 'Pop', 'Commercial'],
  cultural: ['Traditional Irish', 'Folk', 'Jazz', 'Classical', 'World'],
  romantic: ['Jazz', 'Acoustic', 'Soul', 'Blues', 'Classical'],
  surprise: ['Indie', 'Eclectic', 'Experimental', 'World', 'Fusion'],
}

interface OccasionProfile {
  label: string
  narrative: string
  venueTypes: string[]
  atmospheres: string[]
  minCapacity?: number
  henOrStag?: boolean
}

const OCCASION_PROFILES: Record<string, OccasionProfile> = {
  birthday: {
    label: 'birthday',
    narrative: 'your birthday celebration',
    venueTypes: ['bar', 'club', 'pub'],
    atmospheres: ['Lively', 'Social', 'Party', 'Energetic'],
    minCapacity: 60,
  },
  hen: {
    label: 'hen party',
    narrative: 'the hen party',
    venueTypes: ['club', 'bar', 'live_music_venue'],
    atmospheres: ['Lively', 'Party', 'Energetic', 'High-energy', 'Social'],
    minCapacity: 100,
    henOrStag: true,
  },
  stag: {
    label: 'stag party',
    narrative: 'the stag',
    venueTypes: ['pub', 'club', 'bar'],
    atmospheres: ['Lively', 'Party', 'Energetic', 'High-energy', 'Social'],
    minCapacity: 100,
    henOrStag: true,
  },
  anniversary: {
    label: 'anniversary',
    narrative: 'your anniversary',
    venueTypes: ['restaurant', 'bar'],
    atmospheres: ['Romantic', 'Intimate', 'Sophisticated', 'Cozy'],
  },
  leaving: {
    label: 'leaving do',
    narrative: 'the leaving do',
    venueTypes: ['pub', 'bar'],
    atmospheres: ['Social', 'Lively', 'Relaxed', 'Traditional'],
    minCapacity: 60,
  },
}

const BUDGET_TO_PRICE: Record<string, { min: number; max: number }> = {
  budget: { min: 0, max: 20 },
  moderate: { min: 20, max: 50 },
  splurge: { min: 50, max: 1000 },
}

const TOMORROW_TO_END_TIME: Record<string, number> = {
  nothing: 3, // Can go until 3 AM
  early: 1, // End by 1 AM
  hungover: 0, // End by midnight
}

interface PlannerContext {
  who: string
  occasion?: string
  vibe: string
  budget: string
  tomorrow: string
}

interface PlannerVenue {
  venue_type?: string | null
  atmosphere?: string[] | null
  capacity?: number | null
  accepts_hen_stag?: boolean | null
}

interface PlannerEvent {
  id: string
  venue_id: string
  music_genre: string | null
  is_free: boolean
  price_min: number | null
  start_time: string
  end_time: string
  is_featured: boolean | null
  venues: PlannerVenue
}

interface ScoredEvent {
  event: PlannerEvent
  score: number
  reasons: string[]
}

function scoreEvent(event: PlannerEvent, context: PlannerContext): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Vibe matching (40% weight)
  const vibeAtmospheres = VIBE_TO_ATMOSPHERE[context.vibe] || []
  const vibeGenres = VIBE_TO_GENRE[context.vibe] || []
  
  const atmosphereMatch = event.venues.atmosphere?.some((a) => 
    vibeAtmospheres.includes(a)
  )
  const genreMatch = event.music_genre ? vibeGenres.includes(event.music_genre) : false

  if (atmosphereMatch) {
    score += 40
    reasons.push(`Perfect ${context.vibe} atmosphere`)
  }
  if (genreMatch) {
    score += 20
    reasons.push(`${event.music_genre} fits your vibe`)
  }

  // Occasion matching
  const occasion = context.occasion ? OCCASION_PROFILES[context.occasion] : undefined
  if (occasion) {
    const venue = event.venues
    if (venue.venue_type && occasion.venueTypes.includes(venue.venue_type)) {
      score += 15
      reasons.push(`Great spot for a ${occasion.label}`)
    }
    if (venue.atmosphere?.some((a) => occasion.atmospheres.includes(a))) {
      score += 15
    }
    if (occasion.minCapacity && venue.capacity && venue.capacity >= occasion.minCapacity) {
      score += 10
      reasons.push('Room for the whole crew')
    }
    if (occasion.henOrStag && venue.accepts_hen_stag === true) {
      score += 10
      reasons.push('Hen & stag friendly')
    }
  }

  // Budget matching (30% weight)
  const budgetRange = BUDGET_TO_PRICE[context.budget]
  if (budgetRange) {
    const eventPrice = event.is_free ? 0 : (event.price_min || 0)
    if (eventPrice >= budgetRange.min && eventPrice <= budgetRange.max) {
      score += 30
      reasons.push('Fits your budget')
    } else if (eventPrice < budgetRange.min) {
      score += 15 // Still okay, just cheaper
      reasons.push('Great value')
    }
  }

  // Time matching (20% weight)
  const maxEndTime = TOMORROW_TO_END_TIME[context.tomorrow]
  if (maxEndTime !== undefined) {
    const eventEndTime = new Date(event.end_time)
    const now = new Date()
    const hoursUntilEnd = (eventEndTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (hoursUntilEnd <= maxEndTime) {
      score += 20
      reasons.push('Perfect timing for tomorrow')
    }
  }

  // Featured bonus (10% weight)
  if (event.is_featured) {
    score += 10
    reasons.push('Featured venue')
  }

  // Randomness factor for unpredictability (0-15 points)
  const randomBonus = Math.floor(Math.random() * 15)
  score += randomBonus
  if (randomBonus > 10) {
    reasons.push('A hidden gem worth discovering')
  }

  return { score, reasons }
}

function generateNarrative(context: PlannerContext, events: PlannerEvent[]): string {
  const vibeDescriptions: Record<string, string> = {
    chill: 'a relaxed evening',
    wild: 'an unforgettable night out',
    cultural: 'a culturally rich experience',
    romantic: 'a romantic evening',
    surprise: 'an adventure',
  }

  const whoDescriptions: Record<string, string> = {
    solo: 'your solo adventure',
    date: 'your date night',
    friends: 'your night with friends',
    group: 'your group outing',
    tourist: 'your Cork experience',
  }

  const vibe = vibeDescriptions[context.vibe] || 'a great night'
  const occasion = context.occasion ? OCCASION_PROFILES[context.occasion] : undefined
  const who = occasion?.narrative || whoDescriptions[context.who] || 'your night'

  const narratives = [
    `Tonight's vibe: ${vibe} tailored perfectly for ${who}. We've found ${events.length} amazing spots that match your style.`,
    `Get ready for ${vibe}! We've curated ${events.length} hand-picked venues just for ${who}. Each one offers something special.`,
    `Your perfect night awaits: ${vibe} designed for ${who}. We've selected ${events.length} venues that will make tonight memorable.`,
  ]

  return narratives[Math.floor(Math.random() * narratives.length)]
}

export async function POST(request: NextRequest) {
  try {
    const context: PlannerContext = await request.json()
    const supabase = await createClient()

    // Get upcoming events (next 48 hours for better planning)
    const now = new Date()
    const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        venues (*)
      `)
      .eq('is_published', true)
      .eq('venues.is_verified', true)
      .gte('start_time', now.toISOString())
      .lte('start_time', fortyEightHoursLater.toISOString())
      .order('start_time', { ascending: true })
      .limit(20)

    if (error) {
      console.error('Error fetching events:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    if (!events || events.length === 0) {
      return NextResponse.json(
        { error: 'No events happening tonight. Try again tomorrow!' },
        { status: 404 }
      )
    }

    const occasion = context.occasion ? OCCASION_PROFILES[context.occasion] : undefined
    const plannerEvents = (events as PlannerEvent[]).filter(
      (event): event is PlannerEvent => Boolean(event?.venues)
    )
    const eligibleEvents = occasion?.henOrStag
      ? plannerEvents.filter((event) => event.venues?.accepts_hen_stag !== false)
      : plannerEvents

    if (eligibleEvents.length === 0) {
      return NextResponse.json(
        { error: `No venues welcoming a ${occasion?.label} tonight. Try again tomorrow!` },
        { status: 404 }
      )
    }

    // Score all events
    const scoredEvents: ScoredEvent[] = eligibleEvents.map((event) => {
      const { score, reasons } = scoreEvent(event, context)
      return { event, score, reasons }
    })

    // Sort by score and take top candidates
    scoredEvents.sort((a, b) => b.score - a.score)

    // Select 2-3 events for the plan
    // Ensure variety: don't pick two events at the same venue
    const selected: ScoredEvent[] = []
    const usedVenues = new Set<string>()

    for (const scored of scoredEvents) {
      if (selected.length >= 3) break
      if (usedVenues.has(scored.event.venue_id)) continue

      selected.push(scored)
      usedVenues.add(scored.event.venue_id)
    }

    // If we don't have enough events, allow same venue
    if (selected.length < 2) {
      for (const scored of scoredEvents) {
        if (selected.length >= 2) break
        if (selected.some(item => item.event.id === scored.event.id)) continue

        selected.push(scored)
        if (scored.event.venue_id) usedVenues.add(scored.event.venue_id)
      }
    }

    if (selected.length === 0) {
      return NextResponse.json(
        { error: 'No events happening tonight. Try again tomorrow!' },
        { status: 404 }
      )
    }

    const alternates: ScoredEvent[] = []
    for (const scored of scoredEvents) {
      if (alternates.length >= ALTERNATE_LIMIT) break
      if (selected.some(item => item.event.id === scored.event.id)) continue
      if (scored.event.venue_id && usedVenues.has(scored.event.venue_id)) continue
      alternates.push(scored)
    }

    const selectedEvents = selected.map(item => item.event)
    const narrative = generateNarrative(context, selectedEvents)
    const summary = summarizeEvents(selectedEvents)
    const toStop = (scored: ScoredEvent) => ({
      event: scored.event,
      reasons: scored.reasons,
    })

    return NextResponse.json({
      narrative,
      stops: selected.map(toStop),
      alternates: alternates.map(toStop),
      total_cost: summary.total_cost,
      estimated_duration: summary.estimated_duration,
    })
  } catch (error) {
    console.error('Planner error:', error)
    return NextResponse.json(
      { error: 'Failed to generate plan' },
      { status: 500 }
    )
  }
}
