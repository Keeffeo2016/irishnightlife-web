import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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
  vibe: string
  budget: string
  tomorrow: string
}

interface ScoredEvent {
  event: any
  score: number
  reasons: string[]
}

function scoreEvent(event: any, context: PlannerContext): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Vibe matching (40% weight)
  const vibeAtmospheres = VIBE_TO_ATMOSPHERE[context.vibe] || []
  const vibeGenres = VIBE_TO_GENRE[context.vibe] || []
  
  const atmosphereMatch = event.venues.atmosphere?.some((a: string) => 
    vibeAtmospheres.includes(a)
  )
  const genreMatch = vibeGenres.includes(event.music_genre)

  if (atmosphereMatch) {
    score += 40
    reasons.push(`Perfect ${context.vibe} atmosphere`)
  }
  if (genreMatch) {
    score += 20
    reasons.push(`${event.music_genre} fits your vibe`)
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

function generateNarrative(context: PlannerContext, events: any[]): string {
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
  const who = whoDescriptions[context.who] || 'your night'

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

    // Score all events
    const scoredEvents: ScoredEvent[] = events.map(event => {
      const { score, reasons } = scoreEvent(event, context)
      return { event, score, reasons }
    })

    // Sort by score and take top candidates
    scoredEvents.sort((a, b) => b.score - a.score)

    // Select 2-3 events for the plan
    // Ensure variety: don't pick two events at the same venue
    const selectedEvents: any[] = []
    const usedVenues = new Set<string>()

    for (const scored of scoredEvents) {
      if (selectedEvents.length >= 3) break
      if (usedVenues.has(scored.event.venue_id)) continue
      
      selectedEvents.push(scored.event)
      usedVenues.add(scored.event.venue_id)
    }

    // If we don't have enough events, allow same venue
    if (selectedEvents.length < 2) {
      for (const scored of scoredEvents) {
        if (selectedEvents.length >= 2) break
        if (!selectedEvents.includes(scored.event)) {
          selectedEvents.push(scored.event)
        }
      }
    }

    // Generate narrative
    const narrative = generateNarrative(context, selectedEvents)

    // Calculate total cost
    const totalCost = selectedEvents.reduce((sum, event) => {
      return sum + (event.is_free ? 0 : (event.price_min || 0))
    }, 0)

    // Calculate duration
    const startTime = new Date(selectedEvents[0].start_time)
    const endTime = new Date(selectedEvents[selectedEvents.length - 1].end_time)
    const durationHours = Math.ceil((endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60))

    return NextResponse.json({
      narrative,
      events: selectedEvents,
      total_cost: totalCost === 0 ? 'Free' : `€${totalCost}+`,
      estimated_duration: `${durationHours} hours`,
    })
  } catch (error) {
    console.error('Planner error:', error)
    return NextResponse.json(
      { error: 'Failed to generate plan' },
      { status: 500 }
    )
  }
}
