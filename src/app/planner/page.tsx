'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, PartyPopper, Sparkles, Wallet, Sun, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero, HeroAccent } from '@/components/layout/PageHero'

const TOTAL_STEPS = 5

const WHO_OPTIONS = [
  { id: 'solo', label: 'Solo', icon: '🧍', description: 'Just me tonight' },
  { id: 'date', label: 'Date', icon: '💑', description: 'Romantic evening' },
  { id: 'friends', label: 'Friends', icon: '👯', description: 'Small group (3-5)' },
  { id: 'group', label: 'Group', icon: '👥', description: 'Big group (6+)' },
  { id: 'tourist', label: 'Tourist', icon: '🧳', description: 'Visiting Cork' },
]

const OCCASION_OPTIONS = [
  { id: 'none', label: 'Nothing Special', icon: '🍻', description: 'Just a night out' },
  { id: 'birthday', label: 'Birthday', icon: '🎂', description: 'Celebrating another year' },
  { id: 'hen', label: 'Hen Party', icon: '👰', description: 'Last night of freedom' },
  { id: 'stag', label: 'Stag Party', icon: '🤵', description: 'Send-off with the lads' },
  { id: 'anniversary', label: 'Anniversary', icon: '💍', description: 'Marking a milestone' },
  { id: 'leaving', label: 'Leaving Do', icon: '👋', description: 'Saying goodbye' },
]

const VIBE_OPTIONS = [
  { id: 'chill', label: 'Chill', icon: '😌', description: 'Relaxed and easy' },
  { id: 'wild', label: 'Wild', icon: '🎉', description: 'Party hard' },
  { id: 'cultural', label: 'Cultural', icon: '🎭', description: 'Arts and music' },
  { id: 'romantic', label: 'Romantic', icon: '💕', description: 'Intimate and sweet' },
  { id: 'surprise', label: 'Surprise Me', icon: '✨', description: 'Something unexpected' },
]

const BUDGET_OPTIONS = [
  { id: 'budget', label: '€', icon: '💰', description: 'Under €20' },
  { id: 'moderate', label: '€€', icon: '💵', description: '€20-50' },
  { id: 'splurge', label: '€€€', icon: '💎', description: '€50+' },
]

const TOMORROW_OPTIONS = [
  { id: 'nothing', label: 'Nothing Special', icon: '😴', description: 'Sleep in tomorrow' },
  { id: 'early', label: 'Early Start', icon: '⏰', description: 'Up before 9am' },
  { id: 'hungover', label: 'Hungover', icon: '🤕', description: 'Need recovery day' },
]

export default function PlannerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [context, setContext] = useState({
    who: '',
    occasion: '',
    vibe: '',
    budget: '',
    tomorrow: '',
  })

  const handleSelect = (field: keyof typeof context, value: string) => {
    setContext({ ...context, [field]: value })
    
    // Auto-advance after selection
    setTimeout(() => {
      if (step < TOTAL_STEPS) {
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
      occasion: context.occasion,
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
              {WHO_OPTIONS.map((option) => (
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
              <PartyPopper className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Celebrating anything?</h2>
              <p className="text-gray-600">We'll pick spots that suit the occasion</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OCCASION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect('occasion', option.id)}
                  className={`p-6 rounded-2xl border-2 transition-all text-left ${
                    context.occasion === option.id
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
              <Sparkles className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What's the vibe?</h2>
              <p className="text-gray-600">Tell us what kind of night you want</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIBE_OPTIONS.map((option) => (
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

      case 4:
        return (
          <>
            <div className="text-center mb-8">
              <Wallet className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">What's your budget?</h2>
              <p className="text-gray-600">Per person for the night</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BUDGET_OPTIONS.map((option) => (
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

      case 5:
        return (
          <>
            <div className="text-center mb-8">
              <Sun className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Tomorrow morning?</h2>
              <p className="text-gray-600">This helps us plan the right ending time</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TOMORROW_OPTIONS.map((option) => (
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
                variant="brand"
                className="w-full py-6 text-lg"
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
    <div className="flex flex-col bg-gray-50">
      <PageHero
        title={<>Plan My <HeroAccent>Night</HeroAccent></>}
        subtitle="Five quick questions and we'll build your evening"
        showMap={false}
        compact
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Step {step} of {TOTAL_STEPS}</span>
            <span className="text-sm text-gray-400">{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-mint h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      </PageHero>

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
