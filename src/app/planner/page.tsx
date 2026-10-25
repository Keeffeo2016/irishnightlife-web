'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Sparkles, Wallet, Sun, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

const STEP_1_OPTIONS = [
  { id: 'solo', label: 'Solo', icon: '🧍', description: 'Just me tonight' },
  { id: 'date', label: 'Date', icon: '💑', description: 'Romantic evening' },
  { id: 'friends', label: 'Friends', icon: '👯', description: 'Small group (3-5)' },
  { id: 'group', label: 'Group', icon: '👥', description: 'Big group (6+)' },
  { id: 'tourist', label: 'Tourist', icon: '🧳', description: 'Visiting Cork' },
]

const STEP_2_OPTIONS = [
  { id: 'chill', label: 'Chill', icon: '😌', description: 'Relaxed and easy' },
  { id: 'wild', label: 'Wild', icon: '🎉', description: 'Party hard' },
  { id: 'cultural', label: 'Cultural', icon: '🎭', description: 'Arts and music' },
  { id: 'romantic', label: 'Romantic', icon: '💕', description: 'Intimate and sweet' },
  { id: 'surprise', label: 'Surprise Me', icon: '✨', description: 'Something unexpected' },
]

const STEP_3_OPTIONS = [
  { id: 'budget', label: '€', icon: '💰', description: 'Under €20' },
  { id: 'moderate', label: '€€', icon: '💵', description: '€20-50' },
  { id: 'splurge', label: '€€€', icon: '💎', description: '€50+' },
]

const STEP_4_OPTIONS = [
  { id: 'nothing', label: 'Nothing Special', icon: '😴', description: 'Sleep in tomorrow' },
  { id: 'early', label: 'Early Start', icon: '⏰', description: 'Up before 9am' },
  { id: 'hungover', label: 'Hungover', icon: '🤕', description: 'Need recovery day' },
]

export default function PlannerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [context, setContext] = useState({
    who: '',
    vibe: '',
    budget: '',
    tomorrow: '',
  })

  const handleSelect = (field: keyof typeof context, value: string) => {
    setContext({ ...context, [field]: value })
    
    // Auto-advance after selection
    setTimeout(() => {
      if (step < 4) {
        setStep(step + 1)
      }
    }, 300)
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleGeneratePlan = () => {
    // Build URL with context params
    const params = new URLSearchParams({
      who: context.who,
      vibe: context.vibe,
      budget: context.budget,
      tomorrow: context.tomorrow,
    })
    
    router.push(`/planner/plan?${params.toString()}`)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="text-center mb-8">
              <Users className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Who are you with?</h2>
              <p className="text-gray-600">This helps us find the perfect vibe</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STEP_1_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect('who', option.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    context.who === option.id
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="text-4xl mb-3">{option.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
          </>
        )

      case 2:
        return (
          <>
            <div className="text-center mb-8">
              <Sparkles className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What's the vibe?</h2>
              <p className="text-gray-600">Tell us what kind of night you want</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STEP_2_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect('vibe', option.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    context.vibe === option.id
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="text-4xl mb-3">{option.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
          </>
        )

      case 3:
        return (
          <>
            <div className="text-center mb-8">
              <Wallet className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your budget?</h2>
              <p className="text-gray-600">Per person for the night</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STEP_3_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect('budget', option.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    context.budget === option.id
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="text-4xl mb-3">{option.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
          </>
        )

      case 4:
        return (
          <>
            <div className="text-center mb-8">
              <Sun className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tomorrow morning?</h2>
              <p className="text-gray-600">This helps us plan the right ending time</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {STEP_4_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect('tomorrow', option.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    context.tomorrow === option.id
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="text-4xl mb-3">{option.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </button>
              ))}
            </div>
            <div className="mt-8">
              <Button
                onClick={handleGeneratePlan}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg"
              >
                Generate My Night
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </>
        )
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-emerald-600">IrishNightlife</Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/events" className="text-gray-700 hover:text-emerald-600 font-medium">Events</Link>
              <Link href="/venues" className="text-gray-700 hover:text-emerald-600 font-medium">Venues</Link>
              <Link href="/planner" className="text-emerald-600 font-medium">Tonight Planner</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          {step > 1 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}

          {/* Step Content */}
          {renderStep()}
        </div>
      </main>
    </div>
  )
}
