import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, accountType, venueName, city } = await request.json()
    const supabase = await createClient()

    // Create the user in Supabase Auth
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

    // If it's a venue account, create a venue record
    if (accountType === 'venue' && venueName && city) {
      const { error: venueError } = await supabase
        .from('venues')
        .insert({
          owner_id: authData.user.id,
          name: venueName,
          city: city,
          county: city, // For now, use city as county
          venue_type: 'pending',
          subscription_tier: 'basic',
          subscription_status: 'active',
        })

      if (venueError) {
        console.error('Venue creation error:', venueError)
        // Don't fail the signup if venue creation fails
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      message: accountType === 'venue' 
        ? 'Venue registered successfully! Check your email to confirm.'
        : 'Account created successfully! Check your email to confirm.',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
