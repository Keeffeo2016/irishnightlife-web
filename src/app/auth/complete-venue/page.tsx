import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CompleteVenueForm } from './CompleteVenueForm'

export const instant = false

export default async function CompleteVenuePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/auth/complete-venue')
  }

  const [{ data: profile }, { data: venues }] = await Promise.all([
    supabase.from('users').select('role').eq('id', user.id).maybeSingle(),
    supabase.from('venues').select('id').eq('owner_id', user.id).limit(1),
  ])

  if ((profile?.role === 'venue_owner' || profile?.role === 'admin') && venues && venues.length > 0) {
    redirect('/dashboard')
  }

  return <CompleteVenueForm email={user.email ?? ''} />
}
