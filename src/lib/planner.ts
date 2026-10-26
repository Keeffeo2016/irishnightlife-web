interface CostEvent {
  is_free?: boolean
  price_min?: number | null
  start_time: string
  end_time: string
}

interface StopLike {
  event: {
    id: string
    start_time: string
    venues?: { id?: string }
  }
}

export interface PlanSummary {
  total_cost: string
  estimated_duration: string
}

function venueKey(event: StopLike['event']): string {
  return event.venues?.id || event.id
}

export function summarizeEvents(events: CostEvent[]): PlanSummary {
  const totalCost = events.reduce((sum, event) => {
    return sum + (event.is_free ? 0 : event.price_min || 0)
  }, 0)

  if (events.length === 0) {
    return { total_cost: 'Free', estimated_duration: '0 hours' }
  }

  const starts = events.map(event => new Date(event.start_time).getTime())
  const ends = events.map(event => new Date(event.end_time).getTime())
  const span = Math.max(...ends) - Math.min(...starts)
  const durationHours = Number.isFinite(span) ? Math.max(1, Math.ceil(span / (1000 * 60 * 60))) : 0

  return {
    total_cost: totalCost === 0 ? 'Free' : `€${totalCost}+`,
    estimated_duration: durationHours === 1 ? '1 hour' : `${durationHours} hours`,
  }
}

export function sortStopsByStart<T extends StopLike>(stops: T[]): T[] {
  return [...stops].sort(
    (left, right) => new Date(left.event.start_time).getTime() - new Date(right.event.start_time).getTime()
  )
}

export function bestAlternate<T extends StopLike>(catalog: T[], stops: T[], index: number): T | null {
  const current = stops[index]
  if (!current) return null

  const takenIds = new Set(stops.map(stop => stop.event.id))
  const takenVenues = new Set(
    stops.filter((_, stopIndex) => stopIndex !== index).map(stop => venueKey(stop.event))
  )

  return (
    catalog.find(stop => !takenIds.has(stop.event.id) && !takenVenues.has(venueKey(stop.event))) ?? null
  )
}

export function swapStop<T extends StopLike>(catalog: T[], stops: T[], index: number): T[] | null {
  const next = bestAlternate(catalog, stops, index)
  if (!next) return null

  const updated = stops.slice()
  updated[index] = next
  return sortStopsByStart(updated)
}

function sameStops<T extends StopLike>(left: T[], right: T[]): boolean {
  const key = (stops: T[]) => stops.map(stop => stop.event.id).sort().join('|')
  return key(left) === key(right)
}

function pickRoute<T extends StopLike>(catalog: T[], count: number): T[] {
  const order = catalog
    .map(stop => ({ stop, rank: Math.random() }))
    .sort((left, right) => left.rank - right.rank)

  const picked: T[] = []
  const usedVenues = new Set<string>()

  for (const item of order) {
    if (picked.length >= count) break
    const venue = venueKey(item.stop.event)
    if (usedVenues.has(venue)) continue
    picked.push(item.stop)
    usedVenues.add(venue)
  }

  return sortStopsByStart(picked)
}

export function shuffleStops<T extends StopLike>(catalog: T[], current: T[]): T[] {
  const venues = new Set(catalog.map(stop => venueKey(stop.event)))
  const count = Math.min(3, venues.size)
  if (count === 0) return current

  let next = current
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const picked = pickRoute(catalog, count)
    next = picked
    if (!sameStops(picked, current)) return picked
  }

  return next
}

export function canShuffleStops<T extends StopLike>(catalog: T[], current: T[]): boolean {
  const currentIds = new Set(current.map(stop => stop.event.id))
  return catalog.some(stop => !currentIds.has(stop.event.id))
}

const PLAN_FIELDS = ['who', 'occasion', 'vibe', 'budget', 'tomorrow'] as const

type SearchValue = string | string[] | undefined
type SearchRecord = Record<string, SearchValue>

function searchValue(value: SearchValue): string {
  if (Array.isArray(value)) return value[0] ?? ''
  return value ?? ''
}

function planFields(source: URLSearchParams | SearchRecord): URLSearchParams {
  const params = new URLSearchParams()
  for (const field of PLAN_FIELDS) {
    const value = source instanceof URLSearchParams ? source.get(field) ?? '' : searchValue(source[field])
    if (value) params.set(field, value)
  }
  return params
}

export function detailHrefFromPlan(path: string, planQuery: string): string {
  const params = planFields(new URLSearchParams(planQuery))
  params.set('from', 'planner')
  return `${path}?${params.toString()}`
}

export function plannerPlanHref(search: SearchRecord): string | null {
  if (searchValue(search.from) !== 'planner') return null
  const params = planFields(search)
  const query = params.toString()
  return query ? `/planner/plan?${query}` : '/planner'
}

export function preservePlannerOrigin(path: string, search: SearchRecord): string {
  const back = plannerPlanHref(search)
  if (!back) return path
  const query = back.includes('?') ? back.slice(back.indexOf('?') + 1) : ''
  const params = new URLSearchParams(query)
  params.set('from', 'planner')
  return `${path}?${params.toString()}`
}
