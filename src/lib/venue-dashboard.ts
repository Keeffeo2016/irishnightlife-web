import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type DashboardVenue = {
  id: string
  name: string
  slug: string
  address: string
  city: string
  county: string
  postcode: string | null
  description: string | null
  venue_type: string | null
  price_range: string | null
  images: string[] | null
  accepts_hen_stag: boolean | null
  is_verified: boolean
}

const venueColumns =
  'id, name, slug, address, city, county, postcode, description, venue_type, price_range, images, accepts_hen_stag, is_verified'

export async function getVenueDashboard(nextPath = '/dashboard') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextPath)}`)
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'venue_owner' && profile?.role !== 'admin') {
    redirect('/for-venues')
  }

  const { data: venues } = await supabase
    .from('venues')
    .select(venueColumns)
    .eq('owner_id', user.id)
    .order('name')

  return {
    user,
    profile,
    venues: (venues ?? []) as DashboardVenue[],
  }
}

export async function getOwnerViewCounts(supabase: SupabaseClient, paths: string[]) {
  const counts = new Map<string, number>()
  if (paths.length === 0) return counts

  const { data, error } = await supabase.rpc('owner_page_view_counts', {
    paths: paths.slice(0, 500),
  })

  if (error || !Array.isArray(data)) return counts

  for (const row of data) {
    if (!row || typeof row !== 'object') continue
    const path = 'path' in row && typeof row.path === 'string' ? row.path : null
    const views = 'views' in row ? Number(row.views) : Number.NaN
    if (path && Number.isFinite(views)) counts.set(path, views)
  }

  return counts
}
