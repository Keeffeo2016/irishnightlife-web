import { createClient } from '@/lib/supabase/server'
import { normalizeEircode } from '@/lib/eircode'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { venueName, city, county, address, eircode } = await request.json()
    const postcode = normalizeEircode(typeof eircode === 'string' ? eircode : '')

    if (!venueName || !city || !county || !address || !String(eircode ?? '').trim()) {
      return NextResponse.json(
        { error: 'Venue name, address, Eircode, city, and county are required.' },
        { status: 400 }
      )
    }

    if (!postcode) {
      return NextResponse.json(
        { error: 'Enter a valid Eircode, such as T12 W8RP.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Sign in before adding a venue.' }, { status: 401 })
    }

    // Use SECURITY DEFINER function for venue creation
    // This handles:
    // - Owner identity from auth.uid() (trusted)
    // - Role promotion to venue_owner (safe, only upgrades consumers)
    // - Duplicate venue check (idempotent)
    // - Input validation
    const { data: venueId, error: venueError } = await supabase.rpc('create_venue_for_owner', {
      p_name: venueName,
      p_address: address,
      p_city: city,
      p_county: county,
      p_eircode: postcode,
      p_venue_type: 'pub',
      p_description: null,
    })

    if (venueError) {
      console.error('Venue creation error:', venueError)
      return NextResponse.json({ error: venueError.message }, { status: 400 })
    }

    console.log('Venue created with ID:', venueId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Venue registration error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
