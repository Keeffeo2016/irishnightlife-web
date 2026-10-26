'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, PartyPopper, Sparkles, Wallet, Sun, ArrowLeft, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHero, HeroAccent } from '@/components/layout/PageHero'

const TOTAL_STEPS = 5
const REACTION_MS = 700

type StepId = 1 | 2 | 3 | 4 | 5
type ContextField = 'who' | 'occasion' | 'vibe' | 'budget' | 'tomorrow'
type SlideDirection = 'forward' | 'back'

interface Choice {
  id: string
  label: string
  icon: string
  description: string
  reaction: string
  recap: string
}

interface NightContext {
  who: string
  occasion: string
  vibe: string
  budget: string
  tomorrow: string
}

interface PlannerStep {
  id: StepId
  field: ContextField
  label: string
  title: string
  subtitle: string
  icon: LucideIcon
  columns: 2 | 3
}

const WHO_OPTIONS: Choice[] = [
  { id: 'solo', label: 'Solo', icon: '🧍', description: 'Just me tonight', reaction: "Flying solo. We'll keep it easy.", recap: 'Just you' },
  { id: 'date', label: 'Date', icon: '💑', description: 'Romantic evening', reaction: "Date night. We'll keep it close.", recap: 'A date' },
  { id: 'friends', label: 'Friends', icon: '👯', description: 'Small group (3-5)', reaction: "The crew's out. Grand.", recap: 'Out with friends' },
  { id: 'group', label: 'Group', icon: '👥', description: 'Big group (6+)', reaction: "Big group. We'll find room.", recap: 'A big group' },
  { id: 'tourist', label: 'Tourist', icon: '🧳', description: 'Visiting Cork', reaction: "Welcome to Cork. We'll show you the good stuff.", recap: 'Visiting Cork' },
]

const OCCASION_OPTIONS: Choice[] = [
  { id: 'none', label: 'Nothing Special', icon: '🍻', description: 'Just a night out', reaction: 'No occasion needed. Just a good night.', recap: 'no special occasion' },
  { id: 'birthday', label: 'Birthday', icon: '🎂', description: 'Celebrating another year', reaction: "Happy birthday. We'll make a fuss.", recap: 'a birthday' },
  { id: 'hen', label: 'Hen Party', icon: '👰', description: 'Last night of freedom', reaction: "Hen party. We'll find room for the lot.", recap: 'a hen party' },
  { id: 'stag', label: 'Stag Party', icon: '🤵', description: 'Send-off with the lads', reaction: "Stag. We'll keep it lively.", recap: 'a stag' },
  { id: 'anniversary', label: 'Anniversary', icon: '💍', description: 'Marking a milestone', reaction: "Anniversary. We'll make it feel special.", recap: 'an anniversary' },
  { id: 'leaving', label: 'Leaving Do', icon: '👋', description: 'Saying goodbye', reaction: "Leaving do. We'll send them off right.", recap: 'a leaving do' },
]

const VIBE_OPTIONS: Choice[] = [
  { id: 'chill', label: 'Chill', icon: '😌', description: 'Relaxed and easy', reaction: 'Easy does it. Low lights, good chat.', recap: 'keeping it chill' },
  { id: 'wild', label: 'Wild', icon: '🎉', description: 'Party hard', reaction: "Grand. We're going out out.", recap: 'going wild' },
  { id: 'cultural', label: 'Cultural', icon: '🎭', description: 'Arts and music', reaction: 'Something with a bit of soul.', recap: 'something cultural' },
  { id: 'romantic', label: 'Romantic', icon: '💕', description: 'Intimate and sweet', reaction: "Keep it close. We'll find a quiet corner.", recap: 'keeping it romantic' },
  { id: 'surprise', label: 'Surprise Me', icon: '✨', description: 'Something unexpected', reaction: 'You trust us. We like that.', recap: 'a surprise' },
]

const BUDGET_OPTIONS: Choice[] = [
  { id: 'budget', label: '€', icon: '💰', description: 'Under €20', reaction: "Mind the wallet. We'll still have a night.", recap: 'watching the spend' },
  { id: 'moderate', label: '€€', icon: '💵', description: '€20-50', reaction: 'A sensible splash. Perfect.', recap: 'a mid-range budget' },
  { id: 'splurge', label: '€€€', icon: '💎', description: '€50+', reaction: "Tonight's the night. We'll spend it well.", recap: 'pushing the boat out' },
]

const TOMORROW_OPTIONS: Choice[] = [
  { id: 'nothing', label: 'Nothing Special', icon: '😴', description: 'Sleep in tomorrow', reaction: 'Lie-in secured. We can stay out.', recap: 'a lie-in tomorrow' },
  { id: 'early', label: 'Early Start', icon: '⏰', description: 'Up before 9am', reaction: "Early start. We'll have you home in time.", recap: 'an early start tomorrow' },
  { id: 'hungover', label: 'Hungover', icon: '🤕', description: 'Need recovery day', reaction: 'Recovery day booked. No judgment.', recap: 'a recovery day tomorrow' },
]

const OPTIONS: Record<ContextField, Choice[]> = {
  who: WHO_OPTIONS,
  occasion: OCCASION_OPTIONS,
  vibe: VIBE_OPTIONS,
  budget: BUDGET_OPTIONS,
  tomorrow: TOMORROW_OPTIONS,
}

const STEPS: PlannerStep[] = [
  { id: 1, field: 'who', label: 'Who', title: 'Who are you with?', subtitle: 'This helps us find the perfect vibe', icon: Users, columns: 2 },
  { id: 2, field: 'occasion', label: 'Occasion', title: 'Celebrating anything?', subtitle: "We'll pick spots that suit the occasion", icon: PartyPopper, columns: 2 },
  { id: 3, field: 'vibe', label: 'Vibe', title: "What's the vibe?", subtitle: 'Tell us what kind of night you want', icon: Sparkles, columns: 2 },
  { id: 4, field: 'budget', label: 'Budget', title: "What's your budget?", subtitle: 'Per person for the night', icon: Wallet, columns: 3 },
  { id: 5, field: 'tomorrow', label: 'Tomorrow', title: 'Tomorrow morning?', subtitle: 'This helps us plan the right ending time', icon: Sun, columns: 3 },
]

function buildRecap(context: NightContext): string | null {
  const who = OPTIONS.who.find(option => option.id === context.who)?.recap
  const occasion = OPTIONS.occasion.find(option => option.id === context.occasion)?.recap
  const vibe = OPTIONS.vibe.find(option => option.id === context.vibe)?.recap
  const budget = OPTIONS.budget.find(option => option.id === context.budget)?.recap
  const tomorrow = OPTIONS.tomorrow.find(option => option.id === context.tomorrow)?.recap

  if (!who || !occasion || !vibe || !budget || !tomorrow) return null
  return `${who}, ${occasion}, ${vibe}, ${budget}, and ${tomorrow}.`
}

function ChoiceGrid({
  options,
  selected,
  columns,
  onSelect,
}: {
  options: Choice[]
  selected: string
  columns: 2 | 3
  onSelect: (id: string) => void
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
      {options.map(option => {
            const active = selected === option.id
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(option.id)}
            className={`rounded-2xl border-2 p-6 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              active
                ? 'scale-[1.02] border-emerald-600 bg-emerald-50 shadow-md'
                : 'border-gray-200 bg-white hover:-translate-y-0.5 hover:border-emerald-300'
            }`}
          >
            <div className="mb-3 text-4xl">{option.icon}</div>
            <h3 className="mb-1 text-xl font-bold text-gray-900">{option.label}</h3>
            <p className="text-sm text-gray-600">{option.description}</p>
          </button>
        )
      })}
    </div>
  )
}

export default function PlannerPage() {
  const router = useRouter()
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [step, setStep] = useState<StepId>(1)
  const [direction, setDirection] = useState<SlideDirection>('forward')
  const [reaction, setReaction] = useState<string | null>(null)
  const [context, setContext] = useState<NightContext>({
    who: '',
    occasion: '',
    vibe: '',
    budget: '',
    tomorrow: '',
  })

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  const clearAdvance = () => {
    if (!advanceTimer.current) return
    clearTimeout(advanceTimer.current)
    advanceTimer.current = null
  }

  const jumpTo = (next: StepId) => {
    clearAdvance()
    setDirection(next > step ? 'forward' : 'back')
    setReaction(null)
    setStep(next)
  }

  const handleSelect = (field: ContextField, value: string) => {
    setContext(current => ({ ...current, [field]: value }))
    const option = OPTIONS[field].find(item => item.id === value)
    setReaction(option?.reaction ?? null)
    clearAdvance()

    const next = STEPS.find(item => item.id === step + 1)
    if (!next) return

    advanceTimer.current = setTimeout(() => {
      setDirection('forward')
      setStep(next.id)
      setReaction(null)
    }, REACTION_MS)
  }

  const handleGeneratePlan = () => {
    const params = new URLSearchParams({
      who: context.who,
      occasion: context.occasion,
      vibe: context.vibe,
      budget: context.budget,
      tomorrow: context.tomorrow,
    })

    router.push(`/planner/plan?${params.toString()}`)
  }

  const current = STEPS[step - 1]
  const recap = buildRecap(context)
  const answered = STEPS.filter(item => context[item.field])

  if (!current) return null

  const Icon = current.icon

  return (
    <div className="flex flex-col bg-gray-50">
      <PageHero
        title={<>Plan My <HeroAccent>Night</HeroAccent></>}
        subtitle="Five quick questions and we'll build your evening"
        showMap={false}
        compact
      >
        <nav aria-label="Planner steps" className="mx-auto max-w-3xl">
          <ol className="grid grid-cols-5 gap-1">
            {STEPS.map(item => {
              const done = Boolean(context[item.field])
              const isCurrent = step === item.id
              const clickable = done && !isCurrent
              return (
                <li key={item.id} aria-current={isCurrent ? 'step' : undefined}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => jumpTo(item.id)}
                    className={`flex w-full flex-col items-center gap-2 rounded-xl px-1 py-1 disabled:opacity-100 ${
                      clickable ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        isCurrent
                          ? 'bg-mint text-night ring-2 ring-mint/40'
                          : done
                            ? 'bg-mint/25 text-mint'
                            : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {item.id}
                    </span>
                    <span className={`text-[11px] leading-tight sm:text-xs ${isCurrent ? 'font-medium text-white' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>
      </PageHero>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => {
                const previous = STEPS[step - 2]
                if (previous) jumpTo(previous.id)
              }}
              className="mb-6 flex items-center gap-2 text-gray-600 hover:text-emerald-600"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          )}

          <div
            key={step}
            className={`animate-in fade-in-0 duration-300 ${
              direction === 'forward' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'
            }`}
          >
            {answered.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {answered.map(item => {
                  const option = OPTIONS[item.field].find(choice => choice.id === context[item.field])
                  if (!option) return null
                  const isCurrent = step === item.id
                  return (
                    <button
                      key={item.field}
                      type="button"
                      onClick={() => {
                        if (!isCurrent) jumpTo(item.id)
                      }}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50 font-medium text-emerald-800'
                          : 'border-emerald-200 bg-white text-gray-800 hover:border-emerald-400'
                      }`}
                    >
                      <span className="mr-1">{option.icon}</span>
                      {option.label}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="mb-8 text-center">
              <Icon className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
              <h2 className="mb-2 text-3xl font-bold text-gray-900">{current.title}</h2>
              <p className="text-gray-600">{current.subtitle}</p>
              {reaction && (
                <p
                  aria-live="polite"
                  className="mx-auto mt-4 max-w-md animate-in fade-in-0 zoom-in-95 rounded-full bg-emerald-50 px-4 py-2 text-base font-medium text-emerald-800"
                >
                  {reaction}
                </p>
              )}
            </div>

            <ChoiceGrid
              options={OPTIONS[current.field]}
              selected={context[current.field]}
              columns={current.columns}
              onSelect={id => handleSelect(current.field, id)}
            />

            {step === TOTAL_STEPS && (
              <div className="mt-8">
                {recap && (
                  <p className="mb-4 text-center text-gray-700">
                    <span className="font-medium text-gray-900">Tonight: </span>
                    {recap}
                  </p>
                )}
                <Button
                  onClick={handleGeneratePlan}
                  variant="brand"
                  className="w-full py-6 text-lg"
                  disabled={!context.tomorrow}
                >
                  Generate My Night
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
