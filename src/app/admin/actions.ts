'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function setVenueVerified(venueId: string, verified: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Sign in required.' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return { error: 'Only a superadmin can approve venues.' }
  }

  const { data, error } = await supabase
    .from('venues')
    .update({ is_verified: verified })
    .eq('id', venueId)
    .select('id')

  if (error) {
    return { error: error.message }
  }

  if (!data || data.length === 0) {
    return { error: 'That venue could not be updated. Run supabase/admin-overview.sql in the Supabase SQL editor, then try again.' }
  }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  revalidatePath('/venues')
  revalidatePath('/events')
  revalidatePath('/')

  return { error: null }
}
