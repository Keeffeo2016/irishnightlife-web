'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function CompleteVenueForm({ email }: { email: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    venueName: '',
    address: '',
    eircode: '',
    city: '',
    county: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/venue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register venue')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-night via-night-soft to-forest">
      <Card className="w-full max-w-md bg-card border-border shadow-2xl shadow-mint/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl text-foreground">Add your venue</CardTitle>
          <p className="text-muted-foreground">
            Signed in as {email || 'your account'}. These details link the venue to your dashboard.
            The venue stays hidden until a superadmin approves it.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/40 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-foreground/90 mb-1 block font-medium">Venue Name</label>
              <Input
                placeholder="The Bleeding Heart"
                className="bg-card border-border text-foreground"
                value={formData.venueName}
                onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-foreground/90 mb-1 block font-medium">Address</label>
              <Input
                placeholder="12 Oliver Plunkett Street"
                className="bg-card border-border text-foreground"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-foreground/90 mb-1 block font-medium">Eircode</label>
              <Input
                placeholder="T12 W8RP"
                className="bg-card border-border text-foreground uppercase"
                value={formData.eircode}
                onChange={(e) => setFormData({ ...formData, eircode: e.target.value.toUpperCase() })}
                required
                autoCapitalize="characters"
                maxLength={8}
              />
            </div>
            <div>
              <label className="text-sm text-foreground/90 mb-1 block font-medium">City</label>
              <Input
                placeholder="Cork"
                className="bg-card border-border text-foreground"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-foreground/90 mb-1 block font-medium">County</label>
              <Input
                placeholder="Cork"
                className="bg-card border-border text-foreground"
                value={formData.county}
                onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                required
              />
            </div>
            <Button type="submit" variant="brand" className="w-full py-6" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving venue...
                </>
              ) : (
                'Open dashboard'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
