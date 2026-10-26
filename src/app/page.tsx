'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HomeHero } from '@/components/home/HomeHero'
import { CategoryBrowse } from '@/components/home/CategoryBrowse'
import { HomeEventSection } from '@/components/home/HomeEventSection'
import { DiscoverVenues } from '@/components/home/DiscoverVenues'
import { PlannerPromo } from '@/components/home/PlannerPromo'
import { CountyExplore } from '@/components/home/CountyExplore'
import {
  eventsSearchHref,
  isSameLocalDay,
  type HomeEvent,
  type HomeVenue,
} from '@/components/home/types'

const supabase = createClient()

const FEATURED_CAP = 6
const TONIGHT_CAP = 6
const UPCOMING_CAP = 6
const VENUE_CAP = 6

export default function HomePage() {
  const [selectedCounty, setSelectedCounty] = useState('Cork')
  const [events, setEvents] = useState<HomeEvent[]>([])
  const [venues, setVenues] = useState<HomeVenue[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [venuesLoading, setVenuesLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      setEventsLoading(true)

      let query = supabase
        .from('events')
        .select(
          `
          id,
          title,
          slug,
          description,
          event_type,
          start_time,
          end_time,
          price_min,
          price_max,
          is_free,
          music_genre,
          image_url,
          is_featured,
          venues!inner (
            name,
            slug,
            county,
            city,
            images
          )
        `
        )
        .eq('is_published', true)
        .eq('venues.is_verified', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(50)

      if (selectedCounty !== 'All Ireland') {
        query = query.eq('venues.county', selectedCounty)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } else {
        const rows: HomeEvent[] = (data || []).flatMap((event) => {
          const venueRelation = event.venues
          const venue = Array.isArray(venueRelation) ? venueRelation[0] : venueRelation
          if (!venue?.name) return []
          return [
            {
              id: event.id,
              title: event.title,
              slug: event.slug,
              description: event.description ?? '',
              event_type: event.event_type ?? '',
              start_time: event.start_time,
              end_time: event.end_time,
              price_min: event.price_min,
              price_max: event.price_max,
              is_free: event.is_free,
              music_genre: event.music_genre ?? '',
              image_url: event.image_url,
              is_featured: Boolean(event.is_featured),
              venues: {
                name: venue.name,
                slug: venue.slug,
                county: venue.county,
                city: venue.city,
                images: venue.images,
              },
            },
          ]
        })
        setEvents(rows)
      }

      setEventsLoading(false)
    }

    fetchEvents()
  }, [selectedCounty])

  useEffect(() => {
    async function fetchVenues() {
      setVenuesLoading(true)

      let query = supabase
        .from('venues')
        .select('id, name, slug, city, county, venue_type, images')
        .eq('is_verified', true)
        .order('name', { ascending: true })
        .limit(VENUE_CAP)

      if (selectedCounty !== 'All Ireland') {
        query = query.eq('county', selectedCounty)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching venues:', error)
        setVenues([])
      } else {
        setVenues((data || []) as HomeVenue[])
      }

      setVenuesLoading(false)
    }

    fetchVenues()
  }, [selectedCounty])

  const { featured, tonight, upcoming } = useMemo(() => {
    const featuredEvents = events.filter((event) => event.is_featured).slice(0, FEATURED_CAP)
    const featuredIds = new Set(featuredEvents.map((event) => event.id))
    const tonightEvents = events.filter((event) => isSameLocalDay(event.start_time)).slice(0, TONIGHT_CAP)
    const upcomingEvents = events
      .filter((event) => !isSameLocalDay(event.start_time) && !featuredIds.has(event.id))
      .slice(0, UPCOMING_CAP)

    return {
      featured: featuredEvents,
      tonight: tonightEvents,
      upcoming: upcomingEvents,
    }
  }, [events])

  const countyLabel = selectedCounty === 'All Ireland' ? 'across Ireland' : `in ${selectedCounty}`
  const eventsCountyHref = eventsSearchHref({ county: selectedCounty })
  const venuesSeeAllHref =
    selectedCounty === 'All Ireland' ? '/venues' : `/venues?county=${encodeURIComponent(selectedCounty)}`

  return (
    <div className="flex flex-col overflow-x-hidden bg-background">
      <HomeHero county={selectedCounty} onCountyChange={setSelectedCounty} />
      <CategoryBrowse />

      {!eventsLoading && featured.length > 0 ? (
        <HomeEventSection
          id="featured"
          title="Featured events"
          description={`Hand-picked nights ${countyLabel}.`}
          events={featured}
          emptyTitle="No featured events right now"
          emptyDescription="Featured listings appear here when venues mark an upcoming night as featured."
          seeAllHref={eventsCountyHref}
        />
      ) : null}

      <HomeEventSection
        id="tonight"
        title="Happening Tonight"
        description={`Tonight's listings ${countyLabel}.`}
        events={tonight}
        loading={eventsLoading}
        emptyTitle="Nothing listed for tonight"
        emptyDescription={
          selectedCounty === 'All Ireland'
            ? 'No verified venues have published a night that starts today. Browse upcoming events instead.'
            : `No nights listed in ${selectedCounty} for today. Check upcoming events, or try another county.`
        }
        emptyActionHref={eventsCountyHref}
        emptyActionLabel="See upcoming events"
        seeAllHref={tonight.length > 0 ? eventsCountyHref : null}
      />

      <HomeEventSection
        id="upcoming"
        title="Upcoming events"
        description={`Published nights from verified venues ${countyLabel}.`}
        events={upcoming}
        loading={eventsLoading}
        emptyTitle="No upcoming events"
        emptyDescription={
          selectedCounty === 'All Ireland'
            ? 'Nothing is listed from tonight onward. Check back after the next week of listings is added.'
            : `Nothing is listed in ${selectedCounty} from tonight onward. Try Cork, or check back after the next week of listings.`
        }
        emptyActionHref={selectedCounty !== 'Cork' ? eventsSearchHref({ county: 'Cork' }) : '/events'}
        emptyActionLabel={selectedCounty !== 'Cork' ? 'Try Cork' : 'Browse all events'}
        seeAllHref={upcoming.length > 0 ? eventsCountyHref : null}
      />

      <DiscoverVenues
        venues={venues}
        loading={venuesLoading}
        county={selectedCounty}
        seeAllHref={venuesSeeAllHref}
      />

      <PlannerPromo />

      <CountyExplore selectedCounty={selectedCounty} onSelectCounty={setSelectedCounty} />
    </div>
  )
}
