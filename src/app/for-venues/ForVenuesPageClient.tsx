import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, MapPin, Users, TrendingUp } from 'lucide-react'
import { PageHero, HeroAccent } from '@/components/layout/PageHero'

export default function ForVenuesPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title={<>List Your Venue on <HeroAccent>IrishNightlife</HeroAccent></>}
        subtitle="Reach thousands of nightlife enthusiasts across Ireland. Get discovered, drive footfall, and grow your business."
        actions={
          <>
            <Link href="/auth/signup?role=venue">
              <Button variant="brand" size="lg" className="px-8 py-6 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="#pricing">
              <Button variant="brand-outline-dark" size="lg" className="px-8 py-6 text-lg">
                View Pricing
              </Button>
            </Link>
          </>
        }
      />

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Why List Your Venue?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Get Discovered</h3>
                <p className="text-muted-foreground">
                  Reach thousands of potential customers actively looking for places to go tonight.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Drive Footfall</h3>
                <p className="text-muted-foreground">
                  Convert online searches into real customers walking through your door.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Grow Your Business</h3>
                <p className="text-muted-foreground">
                  Track analytics, manage events, and build your brand on Ireland&apos;s nightlife platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Venue Profile</h3>
                  <p className="text-muted-foreground">Custom profile with photos, description, and contact info</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Event Management</h3>
                  <p className="text-muted-foreground">Create and manage events, gigs, and special nights</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Analytics Dashboard</h3>
                  <p className="text-muted-foreground">Track views, clicks, and customer engagement</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Map Integration</h3>
                  <p className="text-muted-foreground">Show your venue on our interactive map with pins</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">AI Planner Integration</h3>
                  <p className="text-muted-foreground">Get recommended by our AI-powered Tonight Planner</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-foreground">Verification Badge</h3>
                  <p className="text-muted-foreground">Stand out with a verified venue badge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Basic</h3>
                <div className="text-4xl font-bold text-foreground mb-4">
                  Free
                  <span className="text-lg text-muted-foreground font-normal">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Venue profile
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Up to 5 events/month
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Basic analytics
                  </li>
                </ul>
                <Link href="/auth/signup?role=venue">
                  <Button variant="brand-outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="bg-card border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Premium</h3>
                <div className="text-4xl font-bold text-foreground mb-4">
                  €29
                  <span className="text-lg text-muted-foreground font-normal">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Everything in Basic
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Unlimited events
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Verified badge
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Featured in AI Planner
                  </li>
                </ul>
                <Link href="/auth/signup?role=venue">
                  <Button variant="brand" className="w-full">
                    Start Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-foreground mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-foreground mb-4">
                  Custom
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Everything in Premium
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Multiple venues
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Custom integrations
                  </li>
                </ul>
                <Link href="/contact">
                  <Button variant="brand-outline" className="w-full">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-night via-night-soft to-forest text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 text-muted-foreground">
            Join hundreds of venues across Ireland already using IrishNightlife to drive footfall.
          </p>
          <Link href="/auth/signup?role=venue">
            <Button variant="brand" size="lg" className="px-8 py-6 text-lg">
              List Your Venue Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
