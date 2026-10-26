-- IrishNightlife Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User roles
CREATE TYPE user_role AS ENUM ('consumer', 'venue_owner', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'consumer',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues table
CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  postcode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  venue_type TEXT, -- pub, club, restaurant, etc.
  capacity INTEGER,
  price_range TEXT, -- €, €€, €€€
  music_genres TEXT[], -- array of genres
  atmosphere TEXT[], -- lively, relaxed, romantic, etc.
  age_restriction TEXT, -- 18+, 21+, all ages
  accepts_hen_stag BOOLEAN, -- NULL means the venue hasn't said
  website TEXT,
  phone TEXT,
  email TEXT,
  instagram TEXT,
  facebook TEXT,
  opening_hours JSONB, -- {monday: {open: '16:00', close: '23:00'}, ...}
  images TEXT[], -- array of image URLs
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free', -- free, basic, premium
  subscription_status TEXT DEFAULT 'active', -- active, cancelled, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_type TEXT, -- live_music, dj, comedy, quiz, sports, special_offer, etc.
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  price_min DECIMAL(10, 2),
  price_max DECIMAL(10, 2),
  currency TEXT DEFAULT 'EUR',
  is_free BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  ticket_url TEXT,
  age_restriction TEXT,
  music_genre TEXT,
  atmosphere TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_pattern JSONB, -- {frequency: 'weekly', day: 'friday'}
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User favorites
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, venue_id),
  UNIQUE(user_id, event_id)
);

-- User preferences (for AI recommendations)
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  preferred_cities TEXT[],
  preferred_genres TEXT[],
  preferred_atmosphere TEXT[],
  budget_range TEXT, -- €, €€, €€€
  age_group TEXT, -- 18-25, 25-35, 35-45, 45+
  group_size INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venue reviews
CREATE TABLE public.venue_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  visit_date DATE,
  is_verified_visit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live updates (real-time venue feed)
CREATE TABLE public.live_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE NOT NULL,
  update_type TEXT, -- crowd_level, music_now, special_offer, vibe_check
  content TEXT,
  media_url TEXT, -- image or video URL
  crowd_level TEXT, -- quiet, moderate, busy, packed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_venues_city ON public.venues(city);
CREATE INDEX idx_venues_county ON public.venues(county);
CREATE INDEX idx_venues_location ON public.venues(latitude, longitude);
CREATE INDEX idx_venues_type ON public.venues(venue_type);
CREATE INDEX idx_events_venue ON public.events(venue_id);
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_published ON public.events(is_published);
CREATE INDEX idx_user_favorites_user ON public.user_favorites(user_id);
CREATE INDEX idx_live_updates_venue ON public.live_updates(venue_id);
CREATE INDEX idx_live_updates_created ON public.live_updates(created_at);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_updates ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Venues are publicly readable
CREATE POLICY "Venues are publicly readable" ON public.venues
  FOR SELECT USING (true);

-- Venue owners can manage their venues
CREATE POLICY "Venue owners can update own venues" ON public.venues
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE POLICY "Venue owners can insert own venues" ON public.venues
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = owner_id);

-- Events are publicly readable when published
CREATE POLICY "Published events are publicly readable" ON public.events
  FOR SELECT USING (is_published = true);

-- Venue owners can manage their events
CREATE POLICY "Venue owners can manage own events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = events.venue_id
      AND venues.owner_id = auth.uid()
    )
  );

-- User favorites are private
CREATE POLICY "Users can manage own favorites" ON public.user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- User preferences are private
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Reviews are publicly readable
CREATE POLICY "Reviews are publicly readable" ON public.venue_reviews
  FOR SELECT USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON public.venue_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Live updates are publicly readable
CREATE POLICY "Live updates are publicly readable" ON public.live_updates
  FOR SELECT USING (true);

-- Venue owners can create live updates
CREATE POLICY "Venue owners can create live updates" ON public.live_updates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.venues
      WHERE venues.id = live_updates.venue_id
      AND venues.owner_id = auth.uid()
    )
  );

-- Functions

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.raw_user_meta_data->>'account_type' = 'venue' THEN 'venue_owner'::public.user_role
      ELSE 'consumer'::public.user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_venues_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Admin policies (need to be enhanced with custom claims)
-- For now, admin checks will be done in application logic
