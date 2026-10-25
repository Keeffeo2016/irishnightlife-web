# IrishNightlife.ie 🍀

**Ireland's Nightlife Intelligence Platform**

> Don't just go out. Find your night.

## Overview

IrishNightlife.ie is a nightlife discovery platform combining the best elements of Google Maps, TikTok, Eventbrite and Tripadvisor — with AI at its core. It helps people decide where to go tonight, based on what's actually happening right now.

## Features

### Consumer-Facing
- **AI Night Planner** — Conversational discovery ("Where's the best live music in Galway tonight?")
- **Vibe-Based Discovery** — "What's your vibe tonight?" with mood, budget, group size filters
- **Happening Tonight** — Real-time events feed with crowd levels
- **Venue Directory** — Searchable listings with ratings, genres, atmosphere tags
- **User Accounts** — Save preferences, favorites, and get personalized recommendations

### Venue Dashboard
- **Event Management** — Create, edit, publish events
- **Analytics** — Views, bookings, ratings
- **Live Updates** — Post real-time crowd levels and vibe checks
- **Profile Management** — Update venue info, photos, opening hours
- **Subscription Tiers** — Free, Basic (€49/mo), Premium (€99/mo)

### Super Admin Dashboard
- **Platform Overview** — Total venues, users, revenue, events
- **Venue Management** — Approve/reject signups, manage subscriptions
- **Revenue Tracking** — Subscription breakdown, booking commissions
- **Platform Health** — API uptime, response times, active sessions
- **Content Moderation** — Manage events, reviews, live updates

## Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | Next.js 15 (App Router) + TypeScript | Vercel (free) |
| Styling | Tailwind CSS + Shadcn/ui | — |
| Database | PostgreSQL | Supabase (free tier) |
| Auth | Supabase Auth | Supabase (free tier) |
| Storage | Supabase Storage | Supabase (free tier) |
| Real-time | Supabase Realtime | Supabase (free tier) |
| Maps | Leaflet + OpenStreetMap | Free |
| Icons | Lucide React | — |

## Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Supabase account (free)

### Setup

```bash
# Navigate to the project
cd web

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Set up the database
# Run supabase/schema.sql in your Supabase SQL Editor

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage (vibe discovery)
│   │   ├── layout.tsx            # Root layout (Navbar + Footer)
│   │   ├── venues/               # Venue listings
│   │   ├── events/               # Event listings
│   │   ├── dashboard/            # Venue owner dashboard
│   │   ├── admin/                # Super admin dashboard
│   │   └── auth/
│   │       ├── login/            # Sign in
│   │       └── signup/           # Register (consumer or venue)
│   ├── components/
│   │   ├── layout/               # Navbar, Footer
│   │   ├── venues/               # Venue cards, maps
│   │   ├── discovery/            # AI search, vibe picker
│   │   └── ui/                   # Shadcn components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client
│   │   │   └── middleware.ts     # Auth middleware
│   │   └── utils.ts
│   └── types/
│       └── database.ts           # TypeScript types
├── supabase/
│   └── schema.sql                # Database schema + RLS policies
└── .env.local                    # Environment variables
```

## Database Schema

### Core Tables
- **users** — Extends Supabase auth, includes role (consumer/venue_owner/admin)
- **venues** — Venue profiles with location, type, atmosphere, subscription tier
- **events** — Events linked to venues with time, price, type
- **user_favorites** — Saved venues and events
- **user_preferences** — AI recommendation inputs
- **venue_reviews** — Ratings and reviews
- **live_updates** — Real-time venue feed

### Security
- Row Level Security (RLS) enabled on all tables
- Venue owners can only manage their own venues/events
- Users can only see/edit their own data
- Public read access for venues, published events, reviews

## Revenue Model

| Source | Monthly |
|--------|---------|
| 100 venues × €49/mo (Basic) | €4,900 |
| 50 premium venues × €99/mo | €4,950 |
| Promoted events & sponsorship | €2,000 |
| Booking commissions | €1,500 |
| **Total** | **€13,350/mo** |

## Roadmap

### Phase 1 (MVP) ✅
- [x] Homepage with vibe discovery
- [x] Venue listings with search/filter
- [x] Event listings
- [x] Venue dashboard
- [x] Admin dashboard
- [x] Auth (login/signup)
- [x] Database schema with RLS

### Phase 2
- [ ] AI Night Planner (conversational interface)
- [ ] Real-time live updates (Supabase Realtime)
- [ ] Interactive map view (Leaflet)
- [ ] Booking integration
- [ ] Payment processing (Stripe)
- [ ] User reviews system

### Phase 3
- [ ] Tourist concierge (multi-language)
- [ ] AI marketing for venues (auto-generate content)
- [ ] Rewards/loyalty system
- [ ] B2B API for hotels/tourism sites
- [ ] Mobile app (React Native)

## Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Copy your project URL and anon key to `.env.local`

## License

Private — All rights reserved.

---

Built with ❤️ for Ireland's nightlife scene.
