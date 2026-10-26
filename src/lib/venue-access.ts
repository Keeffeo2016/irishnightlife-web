import type { SupabaseClient } from '@supabase/supabase-js'

export async function viewerManagesVenue(
  supabase: SupabaseClient,
  ownerId: string | null,
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  if (ownerId != null && ownerId === user.id) return true

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return profile?.role === 'admin'
}
