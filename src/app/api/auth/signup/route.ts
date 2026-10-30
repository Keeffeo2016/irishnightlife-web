import { createClient } from '@/lib/supabase/server'
import { normalizeEircode } from '@/lib/eircode'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, accountType, venueName, city, county, address, eircode } = await request.json()
    const postcode = accountType === 'venue' ? normalizeEircode(typeof eircode === 'string' ? eircode : '') : null

    if (accountType === 'venue' && (!venueName || !city || !county || !address || !String(eircode ?? '').trim())) {
      return NextResponse.json(
        { error: 'Venue name, address, Eircode, city, and county are required.' },
        { status: 400 }
      )
    }

    if (accountType === 'venue' && !postcode) {
      return NextResponse.json(
        { error: 'Enter a valid Eircode, such as T12 W8RP.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
        },
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    if (accountType === 'venue') {
      // Use SECURITY DEFINER function instead of service-role fallback
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
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      message: accountType === 'venue'
        ? 'Venue registered. It stays hidden until a superadmin approves it. Check your email to confirm, then sign in.'
        : 'Account created. Check your email to confirm, then sign in.',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
