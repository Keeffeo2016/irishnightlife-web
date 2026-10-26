import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base || 'venue'}-${suffix}`
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, accountType, venueName, city, county, address } = await request.json()

    if (accountType === 'venue' && (!venueName || !city || !county || !address)) {
      return NextResponse.json(
        { error: 'Venue name, address, city, and county are required.' },
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
      const venue = {
        owner_id: authData.user.id,
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
        const admin = createAdminClient()
        if (!admin) {
          return NextResponse.json({ error: venueError.message }, { status: 400 })
        }

        const { error: adminError } = await admin.from('venues').insert(venue)
        if (adminError) {
          console.error('Venue creation error:', adminError)
          return NextResponse.json({ error: adminError.message }, { status: 400 })
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      message: accountType === 'venue'
        ? 'Venue registered. Check your email to confirm, then sign in to open the dashboard.'
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
