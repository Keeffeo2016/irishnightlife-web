import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHero } from '@/components/layout/PageHero'
import { RemoveSaveButton } from './RemoveSaveButton'
import { SignOutButton } from './SignOutButton'

export const instant = false

function first<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/profile')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const { data: venueSaves } = await supabase
    .from('user_favorites')
    .select('id, venues!inner(name, city, county, slug)')
    .eq('user_id', user.id)
    .not('venue_id', 'is', null)

  const { data: eventSaves } = await supabase
    .from('user_favorites')
    .select('id, events!inner(title, slug, start_time)')
    .eq('user_id', user.id)
    .not('event_id', 'is', null)

  const savedVenues = (venueSaves ?? []).flatMap((row) => {
    const venue = first(row.venues)
    return venue ? [{ id: row.id, venue }] : []
  })
  const savedEvents = (eventSaves ?? []).flatMap((row) => {
    const event = first(row.events)
    return event ? [{ id: row.id, event }] : []
  })
  const name = profile?.full_name || 'Your profile'
  const email = profile?.email || user.email || ''

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        align="left"
        compact
        showMap={false}
        title={name}
        subtitle={email}
        actions={<SignOutButton />}
      />
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Saved venues</CardTitle>
            </CardHeader>
            <CardContent>
              {savedVenues.length === 0 ? (
                <p className="text-muted-foreground">
                  You have not saved any venues yet.{' '}
                  <Link href="/venues" className="text-primary hover:underline">
                    Browse venues
                  </Link>
                </p>
              ) : (
                <ul className="space-y-3">
                  {savedVenues.map((row) => (
                    <li key={row.id} className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/venues/${row.venue.slug}`} className="font-semibold text-foreground hover:underline">
                          {row.venue.name}
                        </Link>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {row.venue.city}, {row.venue.county}
                        </p>
                      </div>
                      <RemoveSaveButton favoriteId={row.id} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Saved events</CardTitle>
            </CardHeader>
            <CardContent>
              {savedEvents.length === 0 ? (
                <p className="text-muted-foreground">You have not saved any events yet.</p>
              ) : (
                <ul className="space-y-3">
                  {savedEvents.map((row) => (
                    <li key={row.id} className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/events/${row.event.slug}`} className="font-semibold text-foreground hover:underline">
                          {row.event.title}
                        </Link>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(row.event.start_time).toLocaleString('en-IE', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <RemoveSaveButton favoriteId={row.id} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
