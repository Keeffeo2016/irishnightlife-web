import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slug'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { venueName, city, county, address } = await request.json()

    if (!venueName || !city || !county || !address) {
      return NextResponse.json(
        { error: 'Venue name, address, city, and county are required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Sign in before adding a venue.' }, { status: 401 })
    }

    const admin = createAdminClient()
    const db = admin ?? supabase
    const { data: profile, error: profileError } = await db
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    if (profile && profile.role !== 'admin' && profile.role !== 'venue_owner') {
      const { error: roleError } = await db
        .from('users')
        .update({ role: 'venue_owner' })
        .eq('id', user.id)

      if (roleError) {
        return NextResponse.json({ error: roleError.message }, { status: 400 })
      }
    }

    if (!profile) {
      if (!admin) {
        return NextResponse.json(
          { error: 'Your profile is missing and the server cannot create it.' },
          { status: 500 }
        )
      }

      const { error: insertProfileError } = await admin.from('users').insert({
        id: user.id,
        email: user.email ?? '',
        full_name: typeof user.user_metadata.full_name === 'string' ? user.user_metadata.full_name : null,
        role: 'venue_owner',
      })

      if (insertProfileError) {
        return NextResponse.json({ error: insertProfileError.message }, { status: 400 })
      }
    }

    const { data: existing, error: existingError } = await supabase
      .from('venues')
      .select('id')
      .eq('owner_id', user.id)
      .limit(1)

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 })
    }

    if (existing && existing.length > 0) {
      return NextResponse.json({ success: true })
    }

    const venue = {
      owner_id: user.id,
      name: venueName,
      slug: slugify(venueName),
      address,
      city,
      county,
      venue_type: 'pub',
      subscription_tier: 'free',
      subscription_status: 'active',
    }

    const { error: venueError } = await supabase.from('venues').insert(venue)
    if (venueError) {
      if (!admin) {
        return NextResponse.json({ error: venueError.message }, { status: 400 })
      }

      const { error: adminError } = await admin.from('venues').insert(venue)
      if (adminError) {
        return NextResponse.json({ error: adminError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Venue registration error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
