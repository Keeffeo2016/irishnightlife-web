import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, MapPin, Users, TrendingUp, Calendar, DollarSign } from 'lucide-react'

export default function ForVenuesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-cyan-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">List Your Venue on IrishNightlife</h1>
          <p className="text-xl mb-8 text-emerald-50">
            Reach thousands of nightlife enthusiasts across Ireland. Get discovered, drive footfall, and grow your business.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-6 text-lg">
                Get Started Free
              </Button>
            </Link>
            <Link href="#pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why List Your Venue?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get Discovered</h3>
                <p className="text-gray-600">
                  Reach thousands of potential customers actively looking for places to go tonight.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Drive Footfall</h3>
                <p className="text-gray-600">
                  Convert online searches into real customers walking through your door.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Grow Your Business</h3>
                <p className="text-gray-600">
                  Track analytics, manage events, and build your brand on Ireland's nightlife platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Venue Profile</h3>
                  <p className="text-gray-600">Custom profile with photos, description, and contact info</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Event Management</h3>
                  <p className="text-gray-600">Create and manage events, gigs, and special nights</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Analytics Dashboard</h3>
                  <p className="text-gray-600">Track views, clicks, and customer engagement</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Map Integration</h3>
                  <p className="text-gray-600">Show your venue on our interactive map with pins</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">AI Planner Integration</h3>
                  <p className="text-gray-600">Get recommended by our AI-powered Tonight Planner</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Verification Badge</h3>
                  <p className="text-gray-600">Stand out with a verified venue badge</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Simple Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  Free
                  <span className="text-lg text-gray-500 font-normal">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Venue profile
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Up to 5 events/month
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Basic analytics
                  </li>
                </ul>
                <Link href="/auth/signup">
                  <Button className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Tier */}
            <Card className="bg-white border-2 border-emerald-500 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  €29
                  <span className="text-lg text-gray-500 font-normal">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Everything in Basic
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Unlimited events
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Verified badge
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Featured in AI Planner
                  </li>
                </ul>
                <Link href="/auth/signup">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Start Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Tier */}
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  Custom
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Everything in Premium
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Multiple venues
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Custom integrations
                  </li>
                </ul>
                <Link href="/contact">
                  <Button className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-emerald-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
          <p className="text-xl mb-8 text-emerald-50">
            Join hundreds of venues across Ireland already using IrishNightlife to drive footfall.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-6 text-lg">
              List Your Venue Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
