'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard, Calendar, Plus, BarChart3, Settings, Users,
  MapPin, Clock, TrendingUp, Eye, Edit, Trash2, Music, Ticket
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Mock data for venue dashboard
const VENUE_STATS = {
  totalEvents: 24,
  upcomingEvents: 5,
  totalViews: 12450,
  totalBookings: 187,
  avgRating: 4.6,
}

const UPCOMING_EVENTS = [
  { id: '1', title: 'Friday Night Live', date: '2026-10-30', time: '21:00', tickets_sold: 45, capacity: 120, status: 'published' },
  { id: '2', title: 'Jazz Sunday', date: '2026-11-01', time: '19:00', tickets_sold: 23, capacity: 80, status: 'published' },
  { id: '3', title: 'Halloween Special', date: '2026-10-31', time: '20:00', tickets_sold: 89, capacity: 150, status: 'published' },
  { id: '4', title: 'Quiz Night', date: '2026-11-03', time: '20:30', tickets_sold: 0, capacity: 60, status: 'draft' },
  { id: '5', title: 'Live Trad Session', date: '2026-11-05', time: '21:00', tickets_sold: 12, capacity: 50, status: 'published' },
]

const RECENT_ACTIVITY = [
  { id: '1', type: 'booking', message: 'New booking for Friday Night Live (2 tickets)', time: '5 min ago' },
  { id: '2', type: 'view', message: 'Venue profile viewed 23 times today', time: '1 hour ago' },
  { id: '3', type: 'review', message: 'New 5-star review from Sarah M.', time: '3 hours ago' },
  { id: '4', type: 'booking', message: 'New booking for Jazz Sunday (4 tickets)', time: '5 hours ago' },
]

export default function VenueDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Venue Dashboard</h1>
          <p className="text-gray-400">The Bleeding Heart Pub — Dublin</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'reviews', label: 'Reviews', icon: Users },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Upcoming Events</p>
                <p className="text-3xl font-bold text-white mt-1">{VENUE_STATS.upcomingEvents}</p>
              </div>
              <Calendar className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Profile Views</p>
                <p className="text-3xl font-bold text-white mt-1">{VENUE_STATS.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-white mt-1">{VENUE_STATS.totalBookings}</p>
              </div>
              <Ticket className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-white mt-1">{VENUE_STATS.avgRating} ⭐</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Events */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upcoming Events</span>
                <Link href="/dashboard/events" className="text-sm text-emerald-400 hover:underline">
                  View All
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {UPCOMING_EVENTS.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Music className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{event.title}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {event.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Tickets</p>
                        <p className="font-semibold text-white">{event.tickets_sold}/{event.capacity}</p>
                      </div>
                      <Badge className={event.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                        {event.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {RECENT_ACTIVITY.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      activity.type === 'booking' ? 'bg-emerald-400' :
                      activity.type === 'view' ? 'bg-blue-400' :
                      'bg-amber-400'
                    }`} />
                    <div>
                      <p className="text-sm text-white">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/5 border-white/10 mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5">
                <Plus className="h-4 w-4 mr-2" /> Add New Event
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5">
                <TrendingUp className="h-4 w-4 mr-2" /> Post Live Update
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5">
                <Ticket className="h-4 w-4 mr-2" /> Create Special Offer
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/10 text-gray-300 hover:bg-white/5">
                <MapPin className="h-4 w-4 mr-2" /> Update Venue Info
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
