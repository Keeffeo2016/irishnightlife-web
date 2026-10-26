export type UserRole = 'consumer' | 'venue_owner' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Venue {
  id: string
  owner_id: string | null
  name: string
  slug: string
  description: string | null
  address: string
  city: string
  county: string
  postcode: string | null
  latitude: number | null
  longitude: number | null
  venue_type: string | null
  capacity: number | null
  price_range: string | null
  music_genres: string[] | null
  atmosphere: string[] | null
  age_restriction: string | null
  accepts_hen_stag: boolean | null
  website: string | null
  phone: string | null
  email: string | null
  instagram: string | null
  facebook: string | null
  opening_hours: OpeningHours | null
  images: string[] | null
  logo_url: string | null
  is_verified: boolean
  is_featured: boolean
  subscription_tier: 'free' | 'basic' | 'premium'
  subscription_status: 'active' | 'cancelled' | 'expired'
  created_at: string
  updated_at: string
}

export interface OpeningHours {
  [day: string]: {
    open: string
    close: string
    closed?: boolean
  }
}

export interface Event {
  id: string
  venue_id: string
  venue?: Venue
  title: string
  slug: string
  description: string | null
  event_type: string | null
  start_time: string
  end_time: string | null
  price_min: number | null
  price_max: number | null
  currency: string
  is_free: boolean
  image_url: string | null
  ticket_url: string | null
  age_restriction: string | null
  music_genre: string | null
  atmosphere: string | null
  is_recurring: boolean
  recurring_pattern: RecurringPattern | null
  is_published: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly'
  day?: string
  days?: string[]
}

export interface UserPreferences {
  id: string
  user_id: string
  preferred_cities: string[] | null
  preferred_genres: string[] | null
  preferred_atmosphere: string[] | null
  budget_range: string | null
  age_group: string | null
  group_size: number | null
  updated_at: string
}

export interface VenueReview {
  id: string
  venue_id: string
  user_id: string | null
  user?: User
  rating: number
  title: string | null
  comment: string | null
  visit_date: string | null
  is_verified_visit: boolean
  created_at: string
}

export interface LiveUpdate {
  id: string
  venue_id: string
  venue?: Venue
  update_type: 'crowd_level' | 'music_now' | 'special_offer' | 'vibe_check'
  content: string | null
  media_url: string | null
  crowd_level: 'quiet' | 'moderate' | 'busy' | 'packed' | null
  created_at: string
}

// Discovery query types
export interface DiscoveryQuery {
  location?: string
  vibe?: string
  budget?: string
  group_size?: number
  genre?: string
  event_type?: string
  age_group?: string
}

export interface NightPlan {
  query: DiscoveryQuery
  venues: Venue[]
  events: Event[]
  itinerary: ItineraryItem[]
  total_budget: { min: number; max: number }
}

export interface ItineraryItem {
  time: string
  venue: Venue
  event?: Event
  activity: string
  estimated_cost: { min: number; max: number }
  walking_distance?: string
}
