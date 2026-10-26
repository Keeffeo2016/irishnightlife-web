'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { UserRole } from '@/types/database'
import { VenueApprovalButton } from './VenueApprovalButton'

type Section = 'venues' | 'events' | 'users'
type ChartKind = 'views' | 'signups' | 'events' | 'counties'
type VenueFilter = 'all' | 'pending' | 'verified'
type EventFilter = 'all' | 'live' | 'draft' | 'hidden'
type UserFilter = 'all' | UserRole

export type BoardUser = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export type BoardVenue = {
  id: string
  name: string
  slug: string
  address: string
  postcode: string | null
  city: string
  county: string
  is_verified: boolean
  created_at: string
  eventCount: number
  ownerName: string | null
  ownerEmail: string | null
}

export type BoardView = {
  path: string
  created_at: string
}

export type BoardEvent = {
  id: string
  title: string
  slug: string
  start_time: string
  is_published: boolean
  venueName: string | null
  venueVerified: boolean
}

const CHART_COLORS = {
  mint: '#10c98c',
  forest: '#075c43',
  amber: '#d97706',
  slate: '#64748b',
  stone: '#e5e7eb',
}

export function AdminBoard({
  users,
  venues,
  events,
  views,
}: {
  users: BoardUser[]
  venues: BoardVenue[]
  events: BoardEvent[]
  views: BoardView[]
}) {
  const pendingCount = venues.filter((venue) => !venue.is_verified).length
  const [section, setSection] = useState<Section>('venues')
  const [chart, setChart] = useState<ChartKind>('views')
  const [venueFilter, setVenueFilter] = useState<VenueFilter>('all')
  const [eventFilter, setEventFilter] = useState<EventFilter>('all')
  const [userFilter, setUserFilter] = useState<UserFilter>('all')

  const verifiedCount = venues.length - pendingCount
  const publishedCount = events.filter((event) => event.is_published).length
  const consumerCount = users.filter((user) => user.role === 'consumer').length
  const ownerCount = users.filter((user) => user.role === 'venue_owner').length
  const adminCount = users.filter((user) => user.role === 'admin').length

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Users" value={users.length} />
        <Stat label="Venues" value={venues.length} />
        <Stat label="Events" value={events.length} />
        <Stat label="Views, 14 days" value={views.length} />
      </div>

      <VenueSetups venues={venues} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DonutCard
          title="Users"
          total={users.length}
          segments={[
            { label: 'Consumers', value: consumerCount, color: CHART_COLORS.mint },
            { label: 'Venue owners', value: ownerCount, color: CHART_COLORS.forest },
            { label: 'Admins', value: adminCount, color: CHART_COLORS.slate },
          ]}
        />
        <DonutCard
          title="Venues"
          total={venues.length}
          segments={[
            { label: 'Verified', value: verifiedCount, color: CHART_COLORS.mint },
            { label: 'Pending', value: pendingCount, color: CHART_COLORS.amber },
          ]}
        />
        <DonutCard
          title="Events"
          total={events.length}
          segments={[
            { label: 'Published', value: publishedCount, color: CHART_COLORS.mint },
            { label: 'Drafts', value: events.length - publishedCount, color: CHART_COLORS.slate },
          ]}
        />
      </div>

      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Trend</CardTitle>
          <FilterSelect
            label="Chart"
            value={chart}
            onChange={(value) => setChart(parseChart(value))}
            options={[
              { value: 'views', label: 'Page views, last 14 days' },
              { value: 'events', label: 'Events per venue' },
              { value: 'signups', label: 'Signups, last 14 days' },
              { value: 'counties', label: 'Venues by county' },
            ]}
          />
        </CardHeader>
        <CardContent>
          <TrendChart kind={chart} users={users} venues={venues} views={views} />
        </CardContent>
      </Card>

      <Card className="bg-white border-gray-200">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
          <CardTitle>{sectionTitle(section)}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="List"
              value={section}
              onChange={(value) => setSection(parseSection(value))}
              options={[
                { value: 'venues', label: `Venues (${venues.length})` },
                { value: 'events', label: `Events (${events.length})` },
                { value: 'users', label: `Users (${users.length})` },
              ]}
            />
            {section === 'venues' ? (
              <FilterSelect
                label="Venue status"
                value={venueFilter}
                onChange={(value) => setVenueFilter(parseVenueFilter(value))}
                options={[
                  { value: 'all', label: 'All venues' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'verified', label: 'Verified' },
                ]}
              />
            ) : null}
            {section === 'events' ? (
              <FilterSelect
                label="Event status"
                value={eventFilter}
                onChange={(value) => setEventFilter(parseEventFilter(value))}
                options={[
                  { value: 'all', label: 'All events' },
                  { value: 'live', label: 'Live' },
                  { value: 'draft', label: 'Drafts' },
                  { value: 'hidden', label: 'Waiting on venue' },
                ]}
              />
            ) : null}
            {section === 'users' ? (
              <FilterSelect
                label="User role"
                value={userFilter}
                onChange={(value) => setUserFilter(parseUserFilter(value))}
                options={[
                  { value: 'all', label: 'All roles' },
                  { value: 'consumer', label: 'Consumers' },
                  { value: 'venue_owner', label: 'Venue owners' },
                  { value: 'admin', label: 'Admins' },
                ]}
              />
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {section === 'venues' ? (
            <VenueTable venues={filterVenues(venues, venueFilter)} />
          ) : null}
          {section === 'events' ? (
            <EventTable events={filterEvents(events, eventFilter)} />
          ) : null}
          {section === 'users' ? (
            <UserTable users={filterUsers(users, userFilter)} />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function VenueSetups({ venues }: { venues: BoardVenue[] }) {
  const pending = venues
    .filter((venue) => !venue.is_verified)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <Card className={pending.length > 0 ? 'border-amber-200 bg-amber-50/60' : 'bg-white border-gray-200'}>
      <CardHeader className="space-y-1">
        <CardTitle>
          New venue setups{pending.length > 0 ? ` (${pending.length})` : ''}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Venues registered by their owners. Approve one to put it on the public site.
        </p>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <p className="text-sm text-gray-600">No new venues waiting for approval.</p>
        ) : (
          <ul className="divide-y divide-amber-200/80">
            {pending.map((venue) => (
              <li key={venue.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-gray-900">{venue.name}</p>
                    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Pending
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700">{venue.address}</p>
                  <p className="text-sm text-gray-700">
                    {venue.postcode ? `${venue.postcode} · ` : ''}{venue.city}, {venue.county}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {venue.ownerName || 'No owner'}
                    {venue.ownerEmail ? ` · ${venue.ownerEmail}` : ''}
                  </p>
                  <p className="text-xs text-gray-500">Submitted {formatDate(venue.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link href={`/venues/${venue.slug}`} className="text-sm text-emerald-700 hover:underline">
                    Preview
                  </Link>
                  <VenueApprovalButton venueId={venue.id} verified={false} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-5">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </CardContent>
    </Card>
  )
}

function DonutCard({
  title,
  total,
  segments,
}: {
  title: string
  total: number
  segments: { label: string; value: number; color: string }[]
}) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  let offset = 0
  const slices = total === 0 ? [] : segments.filter((segment) => segment.value > 0)

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-5 flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="size-24 shrink-0" role="img" aria-label={`${title}: ${total}`}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke={CHART_COLORS.stone} strokeWidth="12" />
          {slices.map((segment) => {
            const length = (segment.value / total) * circumference
            const circle = (
              <circle
                key={segment.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="12"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 50 50)"
              />
            )
            offset += length
            return circle
          })}
          <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">
            {total}
          </text>
        </svg>
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">{title}</p>
          <ul className="space-y-1">
            {segments.map((segment) => (
              <li key={segment.label} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                <span>{segment.label}</span>
                <span className="font-medium text-gray-900">{segment.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function TrendChart({
  kind,
  users,
  venues,
  views,
}: {
  kind: ChartKind
  users: BoardUser[]
  venues: BoardVenue[]
  views: BoardView[]
}) {
  switch (kind) {
    case 'views':
      return <ViewsChart views={views} />
    case 'signups':
      return <ColumnChart rows={signupRows(users)} label="Signups over the last 14 days" />
    case 'events':
      return <BarList rows={eventRows(venues)} empty="No venues yet." />
    case 'counties':
      return <BarList rows={countyRows(venues)} empty="No venues yet." />
    default: {
      const unexpected: never = kind
      return unexpected
    }
  }
}

function ViewsChart({ views }: { views: BoardView[] }) {
  return (
    <div className="space-y-6">
      <ColumnChart rows={dayRows(views)} label="Page views over the last 14 days" />
      <BarList rows={pageRows(views)} empty="No page views in the last 14 days." />
    </div>
  )
}

function ColumnChart({ rows, label }: { rows: { label: string; value: number }[]; label: string }) {
  const max = Math.max(...rows.map((row) => row.value), 1)

  return (
    <div className="flex items-end gap-1 h-44" role="img" aria-label={label}>
      {rows.map((row) => (
        <div key={row.label} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full gap-1">
          <span className="text-[10px] text-gray-500">{row.value}</span>
          <div
            className="w-full max-w-8 rounded-t bg-emerald-500"
            style={{ height: `${Math.max(row.value === 0 ? 2 : 8, (row.value / max) * 112)}px` }}
          />
          <span className="text-[10px] leading-tight text-gray-500 text-center">{row.label}</span>
        </div>
      ))}
    </div>
  )
}

function BarList({ rows, empty }: { rows: { label: string; value: number }[]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-gray-600">{empty}</p>
  const max = Math.max(...rows.map((row) => row.value), 1)

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
            <span className="text-gray-800 truncate">{row.label}</span>
            <span className="font-medium text-gray-900">{row.value}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full bg-emerald-500"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <Select value={value} onValueChange={(next) => { if (next) onChange(next) }}>
      <SelectTrigger className="w-48 bg-white" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function VenueTable({ venues }: { venues: BoardVenue[] }) {
  if (venues.length === 0) return <p className="text-sm text-gray-600">No venues in this view.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">Venue</th>
            <th className="py-2 pr-4 font-medium">Place</th>
            <th className="py-2 pr-4 font-medium">Owner</th>
            <th className="py-2 pr-4 font-medium">Events</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 font-medium">Approval</th>
          </tr>
        </thead>
        <tbody>
          {venues.map((venue) => (
            <tr key={venue.id} className="border-b border-gray-100 last:border-0">
              <td className="py-3 pr-4">
                <Link href={`/venues/${venue.slug}`} className="font-medium text-emerald-700 hover:underline">
                  {venue.name}
                </Link>
              </td>
              <td className="py-3 pr-4 text-gray-700">{venue.city}, {venue.county}</td>
              <td className="py-3 pr-4 text-gray-700">
                <p>{venue.ownerName || 'No owner'}</p>
                {venue.ownerEmail ? <p className="text-xs text-gray-500">{venue.ownerEmail}</p> : null}
              </td>
              <td className="py-3 pr-4 text-gray-700">{venue.eventCount}</td>
              <td className="py-3 pr-4">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${venue.is_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {venue.is_verified ? 'Verified' : 'Pending'}
                </span>
              </td>
              <td className="py-3">
                <VenueApprovalButton venueId={venue.id} verified={venue.is_verified} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function EventTable({ events }: { events: BoardEvent[] }) {
  if (events.length === 0) return <p className="text-sm text-gray-600">No events in this view.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">Event</th>
            <th className="py-2 pr-4 font-medium">Venue</th>
            <th className="py-2 pr-4 font-medium">Starts</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 font-medium">Page</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const live = event.is_published && event.venueVerified
            return (
              <tr key={event.id} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-4 font-medium text-gray-900">{event.title}</td>
                <td className="py-3 pr-4 text-gray-700">{event.venueName ?? 'Unknown venue'}</td>
                <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{formatEventWhen(event.start_time)}</td>
                <td className="py-3 pr-4 text-gray-700">{eventStatus(event)}</td>
                <td className="py-3">
                  {live ? (
                    <Link href={`/events/${event.slug}`} className="text-emerald-700 hover:underline">View</Link>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function UserTable({ users }: { users: BoardUser[] }) {
  if (users.length === 0) return <p className="text-sm text-gray-600">No users in this view.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Role</th>
            <th className="py-2 font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((account) => (
            <tr key={account.id} className="border-b border-gray-100 last:border-0">
              <td className="py-3 pr-4 font-medium text-gray-900">{account.full_name || '—'}</td>
              <td className="py-3 pr-4 text-gray-700">{account.email}</td>
              <td className="py-3 pr-4 text-gray-700">{roleLabel(account.role)}</td>
              <td className="py-3 text-gray-700 whitespace-nowrap">{formatDate(account.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function signupRows(users: BoardUser[]) {
  return dayRows(users.map((user) => ({ created_at: user.created_at })))
}

function dayRows(rows: { created_at: string }[]) {
  const series: { label: string; value: number }[] = []
  for (let daysAgo = 13; daysAgo >= 0; daysAgo -= 1) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - daysAgo)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    const value = rows.filter((row) => {
      const created = new Date(row.created_at).getTime()
      return created >= start.getTime() && created < end.getTime()
    }).length
    series.push({
      label: start.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' }),
      value,
    })
  }
  return series
}

function pageRows(views: BoardView[]) {
  const counts = new Map<string, number>()
  for (const view of views) {
    const label = pageLabel(view.path)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
}

function pageLabel(path: string) {
  if (path === '/') return 'Home'
  if (path === '/venues') return 'Venues'
  if (path.startsWith('/venues/')) return 'Venue pages'
  if (path === '/events') return 'Events'
  if (path.startsWith('/events/')) return 'Event pages'
  if (path === '/planner') return 'Tonight planner'
  if (path.startsWith('/planner/')) return 'Planner results'
  if (path === '/for-venues') return 'For venues'
  if (path === '/profile') return 'Profile'
  if (path === '/dashboard' || path.startsWith('/dashboard/')) return 'Venue dashboard'
  return path
}

function eventRows(venues: BoardVenue[]) {
  const ranked = [...venues].sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name))
  const top = ranked.slice(0, 8).map((venue) => ({ label: venue.name, value: venue.eventCount }))
  const rest = ranked.slice(8).reduce((sum, venue) => sum + venue.eventCount, 0)
  if (rest > 0) top.push({ label: 'Other venues', value: rest })
  return top.filter((row) => row.value > 0)
}

function countyRows(venues: BoardVenue[]) {
  const counts = new Map<string, number>()
  for (const venue of venues) {
    counts.set(venue.county, (counts.get(venue.county) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, 8)
}

function filterVenues(venues: BoardVenue[], filter: VenueFilter) {
  switch (filter) {
    case 'all':
      return venues
    case 'pending':
      return venues.filter((venue) => !venue.is_verified)
    case 'verified':
      return venues.filter((venue) => venue.is_verified)
    default: {
      const unexpected: never = filter
      return unexpected
    }
  }
}

function filterEvents(events: BoardEvent[], filter: EventFilter) {
  switch (filter) {
    case 'all':
      return events
    case 'live':
      return events.filter((event) => event.is_published && event.venueVerified)
    case 'draft':
      return events.filter((event) => !event.is_published)
    case 'hidden':
      return events.filter((event) => event.is_published && !event.venueVerified)
    default: {
      const unexpected: never = filter
      return unexpected
    }
  }
}

function filterUsers(users: BoardUser[], filter: UserFilter) {
  switch (filter) {
    case 'all':
      return users
    case 'consumer':
    case 'venue_owner':
    case 'admin':
      return users.filter((user) => user.role === filter)
    default: {
      const unexpected: never = filter
      return unexpected
    }
  }
}

function sectionTitle(section: Section) {
  switch (section) {
    case 'venues':
      return 'Venues'
    case 'events':
      return 'Events'
    case 'users':
      return 'Users'
    default: {
      const unexpected: never = section
      return unexpected
    }
  }
}

function eventStatus(event: BoardEvent) {
  if (!event.is_published) return 'Draft'
  if (!event.venueVerified) return 'Waiting on venue'
  return 'Live'
}

function roleLabel(role: UserRole) {
  switch (role) {
    case 'consumer':
      return 'Consumer'
    case 'venue_owner':
      return 'Venue owner'
    case 'admin':
      return 'Admin'
    default: {
      const unexpected: never = role
      return unexpected
    }
  }
}

function parseSection(value: string): Section {
  switch (value) {
    case 'venues':
    case 'events':
    case 'users':
      return value
    default:
      return 'venues'
  }
}

function parseChart(value: string): ChartKind {
  switch (value) {
    case 'views':
    case 'signups':
    case 'events':
    case 'counties':
      return value
    default:
      return 'views'
  }
}

function parseVenueFilter(value: string): VenueFilter {
  switch (value) {
    case 'all':
    case 'pending':
    case 'verified':
      return value
    default:
      return 'all'
  }
}

function parseEventFilter(value: string): EventFilter {
  switch (value) {
    case 'all':
    case 'live':
    case 'draft':
    case 'hidden':
      return value
    default:
      return 'all'
  }
}

function parseUserFilter(value: string): UserFilter {
  switch (value) {
    case 'all':
    case 'consumer':
    case 'venue_owner':
    case 'admin':
      return value
    default:
      return 'all'
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatEventWhen(value: string) {
  return new Date(value).toLocaleString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
