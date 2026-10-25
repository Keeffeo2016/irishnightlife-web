'use client'

import { useState } from 'react'
import {
  LayoutDashboard, Building2, Users, Calendar, BarChart3, Settings,
  TrendingUp, TrendingDown, DollarSign, MapPin, Eye, CheckCircle, XCircle,
  MoreVertical, Search, Filter, Crown, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

// Mock admin data
const ADMIN_STATS = {
  totalVenues: 147,
  activeVenues: 123,
  totalEvents: 892,
  upcomingEvents: 234,
  totalUsers: 15420,
  monthlyRevenue: 9850,
  premiumSubscriptions: 52,
  basicSubscriptions: 98,
}

const VENUES = [
  { id: '1', name: 'The Bleeding Heart', city: 'Dublin', tier: 'premium', status: 'active', events: 12, revenue: 1188, rating: 4.6 },
  { id: '2', name: "O'Flaherty's", city: 'Galway', tier: 'premium', status: 'active', events: 8, revenue: 1188, rating: 4.8 },
  { id: '3', name: 'The Warehouse', city: 'Dublin', tier: 'basic', status: 'active', events: 15, revenue: 585, rating: 4.2 },
  { id: '4', name: 'The Comedy Cellar', city: 'Dublin', tier: 'premium', status: 'active', events: 6, revenue: 1188, rating: 4.7 },
  { id: '5', name: 'The Long Hall', city: 'Dublin', tier: 'basic', status: 'active', events: 4, revenue: 585, rating: 4.4 },
  { id: '6', name: 'The Mixology Bar', city: 'Cork', tier: 'free', status: 'active', events: 3, revenue: 0, rating: 4.1 },
  { id: '7', name: 'The Quay Co-op', city: 'Galway', tier: 'basic', status: 'pending', events: 0, revenue: 0, rating: 0 },
  { id: '8', name: 'The Hi-B Bar', city: 'Dublin', tier: 'free', status: 'suspended', events: 2, revenue: 0, rating: 3.2 },
]

const RECENT_SIGNUPS = [
  { id: '1', venue: 'The Dark Horse', city: 'Limerick', date: '2 hours ago', status: 'pending' },
  { id: '2', venue: 'The Crane Bar', city: 'Galway', date: '5 hours ago', status: 'approved' },
  { id: '3', venue: 'The Round Room', city: 'Dublin', date: '1 day ago', status: 'approved' },
  { id: '4', venue: 'The Roundy', city: 'Dublin', date: '2 days ago', status: 'pending' },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredVenues = VENUES.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.city.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Crown className="h-8 w-8 text-amber-400" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400">IrishNightlife.ie Platform Management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-white/20 text-gray-300">
            <Settings className="h-4 w-4 mr-2" />
            Platform Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'venues', label: 'Venues', icon: Building2 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'revenue', label: 'Revenue', icon: DollarSign },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
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
                <p className="text-gray-400 text-sm">Total Venues</p>
                <p className="text-3xl font-bold text-white mt-1">{ADMIN_STATS.totalVenues}</p>
                <p className="text-xs text-emerald-400 mt-1">+12 this month</p>
              </div>
              <Building2 className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Monthly Revenue</p>
                <p className="text-3xl font-bold text-white mt-1">€{ADMIN_STATS.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs text-emerald-400 mt-1">+18% vs last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">{ADMIN_STATS.totalUsers.toLocaleString()}</p>
                <p className="text-xs text-emerald-400 mt-1">+842 this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Events</p>
                <p className="text-3xl font-bold text-white mt-1">{ADMIN_STATS.upcomingEvents}</p>
                <p className="text-xs text-emerald-400 mt-1">{ADMIN_STATS.totalEvents} total</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border-amber-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-5 w-5 text-amber-400" />
              <span className="text-amber-400 font-semibold">Premium (€99/mo)</span>
            </div>
            <p className="text-3xl font-bold text-white">{ADMIN_STATS.premiumSubscriptions}</p>
            <p className="text-sm text-gray-400">€{(ADMIN_STATS.premiumSubscriptions * 99).toLocaleString()}/month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 font-semibold">Basic (€49/mo)</span>
            </div>
            <p className="text-3xl font-bold text-white">{ADMIN_STATS.basicSubscriptions}</p>
            <p className="text-sm text-gray-400">€{(ADMIN_STATS.basicSubscriptions * 49).toLocaleString()}/month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-900/30 to-gray-800/10 border-gray-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-gray-400 font-semibold">Free Tier</span>
            </div>
            <p className="text-3xl font-bold text-white">{ADMIN_STATS.totalVenues - ADMIN_STATS.premiumSubscriptions - ADMIN_STATS.basicSubscriptions}</p>
            <p className="text-sm text-gray-400">Upgrade candidates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Venues Table */}
        <div className="lg:col-span-2">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Venues</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search venues..."
                      className="pl-9 bg-white/5 border-white/10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" className="border-white/20 text-gray-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Venue</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">City</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Tier</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Events</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Revenue</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVenues.map((venue) => (
                      <tr key={venue.id} className="border-b border-white/5 hover:bg-white/5 transition">
                        <td className="py-3 px-4">
                          <span className="font-medium text-white">{venue.name}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{venue.city}</td>
                        <td className="py-3 px-4">
                          <Badge className={
                            venue.tier === 'premium' ? 'bg-amber-500/20 text-amber-400' :
                            venue.tier === 'basic' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }>
                            {venue.tier}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={
                            venue.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                            venue.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {venue.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-white">{venue.events}</td>
                        <td className="py-3 px-4 text-white">€{venue.revenue}</td>
                        <td className="py-3 px-4">
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {RECENT_SIGNUPS.filter(s => s.status === 'pending').map((signup) => (
                  <div key={signup.id} className="p-3 rounded-lg bg-white/5">
                    <h4 className="font-medium text-white">{signup.venue}</h4>
                    <p className="text-sm text-gray-400">{signup.city} • {signup.date}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1">
                        <CheckCircle className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex-1">
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Health */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Platform Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">API Uptime</span>
                  <span className="text-emerald-400 font-semibold">99.9%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Avg Response Time</span>
                  <span className="text-white font-semibold">142ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Active Sessions</span>
                  <span className="text-white font-semibold">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Events Today</span>
                  <span className="text-white font-semibold">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">New Signups (7d)</span>
                  <span className="text-emerald-400 font-semibold">+23</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
