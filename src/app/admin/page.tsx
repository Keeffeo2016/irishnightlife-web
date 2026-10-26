import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const instant = false
import { Card, CardContent } from '@/components/ui/card'
import { PageHero } from '@/components/layout/PageHero'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/admin')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  const { count: venueCount } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })

  const { count: eventCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  return (
    <div className="flex flex-col bg-gray-50">
      <PageHero
        align="left"
        compact
        showMap={false}
        title="Admin"
        subtitle="Live counts from Supabase. Revenue, bookings, and moderation stay off until those records exist."
      />
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Venues</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{venueCount ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <p className="text-sm text-gray-500">Published events</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{eventCount ?? 0}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
