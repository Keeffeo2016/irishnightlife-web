'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlarmClock,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Beer,
  Cake,
  Check,
  Coffee,
  Compass,
  Crown,
  Flame,
  Gem,
  HandMetal,
  Heart,
  Moon,
  Music,
  PartyPopper,
  RotateCcw,
  Sparkles,
  Sun,
  Sunrise,
  Trophy,
  User,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { HeroAccent, PageHero } from '@/components/layout/PageHero'
import {
  buildPlannerResultHref,
  isPlannerComplete,
  parsePlannerSearchParams,
  type PlannerContextValues,
  type PlannerFieldKey,
} from '@/lib/planner'

const TOTAL_STEPS = 5

type StepId = 1 | 2 | 3 | 4 | 5
type SlideDirection = 'forward' | 'back'

interface Choice {
  id: string
  label: string
  badge?: string
  icon: LucideIcon
  description: string
  reaction: string
  recap: string
}

interface PlannerStep {
  id: StepId
  field: PlannerFieldKey
  label: string
  title: string
  subtitle: string
  icon: LucideIcon
  columns: 2 | 3
}

const WHO_OPTIONS: Choice[] = [
  {
    id: 'solo',
    label: 'Solo',
    icon: User,
    description: 'Heading out on your own tonight',
    reaction: "Flying solo. We'll keep it welcoming and easy.",
    recap: 'heading out solo',
  },
  {
    id: 'date',
    label: 'Date Night',
    icon: Heart,
    description: 'Somewhere with a bit of atmosphere for two',
    reaction: "Date night. We'll keep it close and atmospheric.",
    recap: 'a date night',
  },
  {
    id: 'friends',
    label: 'Friends',
    icon: Users,
    description: 'Small crew of 3 to 5',
    reaction: "The crew's out. Grand.",
    recap: 'out with friends',
  },
  {
    id: 'group',
    label: 'Big Group',
    icon: UsersRound,
    description: 'Six or more out together',
    reaction: "Big group. We'll find spots with room for everyone.",
    recap: 'a big group',
  },
  {
    id: 'tourist',
    label: 'Visiting',
    icon: Compass,
    description: 'Exploring local music, pubs, and culture',
    reaction: "Welcome! We'll show you the best local spots.",
    recap: 'visiting and exploring',
  },
]

const OCCASION_OPTIONS: Choice[] = [
  {
    id: 'none',
    label: 'Nothing Special',
    icon: Beer,
    description: 'Just a proper night out',
    reaction: 'No occasion needed — just a good night out.',
    recap: 'no special occasion',
  },
  {
    id: 'birthday',
    label: 'Birthday',
    icon: Cake,
    description: 'Celebrating another year',
    reaction: "Happy birthday! We'll line up a lively run of stops.",
    recap: 'a birthday celebration',
  },
  {
    id: 'hen',
    label: 'Hen Party',
    icon: Crown,
    description: 'Hen-friendly spots with plenty of energy',
    reaction: "Hen party. We'll only pick venues that welcome groups.",
    recap: 'a hen party',
  },
  {
    id: 'stag',
    label: 'Stag Party',
    icon: Trophy,
    description: 'Stag-friendly pubs, bars, and late rooms',
    reaction: "Stag night. We'll keep it lively and group-ready.",
    recap: 'a stag party',
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    icon: Gem,
    description: 'Marking a milestone together',
    reaction: "Anniversary. We'll make it feel special.",
    recap: 'an anniversary',
  },
  {
    id: 'leaving',
    label: 'Leaving Do',
    icon: HandMetal,
    description: 'Giving someone a proper send-off',
    reaction: "Leaving do. We'll send them off right.",
    recap: 'a leaving do',
  },
]

const VIBE_OPTIONS: Choice[] = [
  {
    id: 'chill',
    label: 'Chill & Cozy',
    icon: Coffee,
    description: 'Relaxed pubs, acoustic corners, and good chat',
    reaction: 'Easy does it. Low lights, good pints, and great chat.',
    recap: 'keeping it chill',
  },
  {
    id: 'wild',
    label: 'High Energy',
    icon: Flame,
    description: 'Busy dancefloors, DJs, and late finishes',
    reaction: "Grand — we're going out out.",
    recap: 'high energy',
  },
  {
    id: 'cultural',
    label: 'Live & Cultural',
    icon: Music,
    description: 'Trad sessions, live gigs, comedy, and local arts',
    reaction: 'Something with a bit of soul and live character.',
    recap: 'live music and culture',
  },
  {
    id: 'romantic',
    label: 'Intimate & Warm',
    icon: Heart,
    description: 'Candlelit corners, jazz, and unhurried drinks',
    reaction: "Keep it close. We'll find a warm, intimate spot.",
    recap: 'an intimate vibe',
  },
  {
    id: 'surprise',
    label: 'Surprise Me',
    icon: Sparkles,
    description: 'Eclectic picks and hidden gems worth discovering',
    reaction: 'You trust us — we love an eclectic route.',
    recap: 'a surprise mix',
  },
]

const BUDGET_OPTIONS: Choice[] = [
  {
    id: 'budget',
    label: 'Easy on the Wallet',
    badge: '€ · Under €20',
    icon: Wallet,
    description: 'Free gigs and low-cover nights under €20',
    reaction: "Minding the wallet — plenty of great free and low-cover options.",
    recap: 'under €20 per person',
  },
  {
    id: 'moderate',
    label: 'Mid-Range',
    badge: '€€ · €20–€50',
    icon: Banknote,
    description: 'Ticketed shows and a comfortable night out (€20–€50)',
    reaction: 'A sensible splash. Opens up great ticketed gigs.',
    recap: 'a €20–€50 budget',
  },
  {
    id: 'splurge',
    label: 'All Out',
    badge: '€€€ · €50+',
    icon: Gem,
    description: 'Big nights, headline shows, and no holding back (€50+)',
    reaction: "Tonight's the night — we'll include headline options.",
    recap: 'an all-out €50+ budget',
  },
]

const TOMORROW_OPTIONS: Choice[] = [
  {
    id: 'nothing',
    label: 'Lie-In Tomorrow',
    icon: Moon,
    description: 'No plans in the morning — happy to stay out late',
    reaction: 'Lie-in secured. Late-night stops are on the table.',
    recap: 'a lie-in tomorrow',
  },
  {
    id: 'early',
    label: 'Early Start',
    icon: AlarmClock,
    description: 'Up before 9am — wrap up at a sensible hour',
    reaction: "Early start noted. We'll keep the finish time sensible.",
    recap: 'an early start tomorrow',
  },
  {
    id: 'hungover',
    label: 'Easy Sunday / Recovery',
    icon: Sunrise,
    description: 'Taking it handy tomorrow — wrap up around midnight',
    reaction: 'Recovery day planned. No super-late finishes.',
    recap: 'a recovery day tomorrow',
  },
]

const OPTIONS: Record<PlannerFieldKey, Choice[]> = {
  who: WHO_OPTIONS,
  occasion: OCCASION_OPTIONS,
  vibe: VIBE_OPTIONS,
  budget: BUDGET_OPTIONS,
  tomorrow: TOMORROW_OPTIONS,
}

const STEPS: PlannerStep[] = [
  {
    id: 1,
    field: 'who',
    label: 'Who',
    title: 'Who are you heading out with?',
    subtitle: 'Helps us match venue size, atmosphere, and group policies.',
    icon: Users,
    columns: 2,
  },
  {
    id: 2,
    field: 'occasion',
    label: 'Occasion',
    title: 'Are you celebrating anything?',
    subtitle: "We'll tailor the stops to suit your occasion.",
    icon: PartyPopper,
    columns: 2,
  },
  {
    id: 3,
    field: 'vibe',
    label: 'Vibe',
    title: "What's the vibe tonight?",
    subtitle: 'Pick the mood and music style you want to build around.',
    icon: Sparkles,
    columns: 2,
  },
  {
    id: 4,
    field: 'budget',
    label: 'Budget',
    title: "What's your ticket budget?",
    subtitle: 'Estimated entry / ticket spend per person.',
    icon: Wallet,
    columns: 3,
  },
  {
    id: 5,
    field: 'tomorrow',
    label: 'Tomorrow',
    title: 'How is tomorrow morning looking?',
    subtitle: 'Helps us pace the evening and pick the right finish time.',
    icon: Sun,
    columns: 3,
  },
]

function buildRecap(context: PlannerContextValues): string | null {
  const who = OPTIONS.who.find(option => option.id === context.who)?.recap
  const occasion = OPTIONS.occasion.find(option => option.id === context.occasion)?.recap
  const vibe = OPTIONS.vibe.find(option => option.id === context.vibe)?.recap
  const budget = OPTIONS.budget.find(option => option.id === context.budget)?.recap
  const tomorrow = OPTIONS.tomorrow.find(option => option.id === context.tomorrow)?.recap

  if (!who || !occasion || !vibe || !budget || !tomorrow) return null
  return `${who}, ${occasion}, ${vibe}, ${budget}, and ${tomorrow}.`
}

function initialStepForContext(context: PlannerContextValues): StepId {
  for (const stepItem of STEPS) {
    if (!context[stepItem.field]) {
      return stepItem.id
    }
  }
  return 1
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
    <div
      className={`grid grid-cols-1 gap-4 ${
        columns === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2'
      }`}
    >
      {options.map(option => {
        const active = selected === option.id
        const OptionIcon = option.icon

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(option.id)}
            className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
              active
                ? 'border-primary bg-primary/12 shadow-lg shadow-black/25 ring-1 ring-primary/50'
                : 'border-border bg-card hover:border-primary/60 hover:bg-card/90'
            }`}
          >
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors motion-reduce:transition-none ${
                    active
                      ? 'border-primary/50 bg-primary text-primary-foreground'
                      : 'border-mint/20 bg-mint/10 text-mint group-hover:border-mint/40'
                  }`}
                >
                  <OptionIcon className="h-5 w-5" />
                </span>

                {active ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 bg-primary/20 px-2.5 py-1 text-xs font-semibold text-mint-light">
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Selected
                  </span>
                ) : option.badge ? (
                  <Badge
                    variant="outline"
                    className="border-border/80 bg-night/60 text-xs text-muted-foreground"
                  >
                    {option.badge}
                  </Badge>
                ) : null}
              </div>

              <h3 className="mb-1 text-lg font-bold text-foreground">{option.label}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function PlannerWizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [context, setContext] = useState<PlannerContextValues>(() =>
    parsePlannerSearchParams(searchParams)
  )
  const [step, setStep] = useState<StepId>(() =>
    initialStepForContext(parsePlannerSearchParams(searchParams))
  )
  const [direction, setDirection] = useState<SlideDirection>('forward')
  const [reaction, setReaction] = useState<string | null>(null)

  const current = STEPS[step - 1]
  if (!current) return null

  const currentSelection = context[current.field]
  const allComplete = isPlannerComplete(context)
  const recap = buildRecap(context)
  const answered = STEPS.filter(item => Boolean(context[item.field]))
  const StepIcon = current.icon

  // Determine the highest step a user can jump to (any answered step or the first unanswered step)
  const firstUnansweredId =
    STEPS.find(item => !context[item.field])?.id ?? TOTAL_STEPS

  const canJumpToStep = (targetId: StepId): boolean => {
    if (targetId === step) return false
    return Boolean(context[STEPS[targetId - 1].field]) || targetId <= firstUnansweredId
  }

  const jumpTo = (next: StepId) => {
    setDirection(next > step ? 'forward' : 'back')
    const field = STEPS[next - 1].field
    const selectedId = context[field]
    const existingOption = OPTIONS[field].find(item => item.id === selectedId)
    setReaction(existingOption?.reaction ?? null)
    setStep(next)
  }

  const handleSelect = (field: PlannerFieldKey, value: string) => {
    setContext(prev => ({ ...prev, [field]: value }))
    const option = OPTIONS[field].find(item => item.id === value)
    setReaction(option?.reaction ?? null)
  }

  const handleContinue = () => {
    if (!currentSelection) return
    const nextStep = STEPS.find(item => item.id === step + 1)
    if (nextStep) {
      jumpTo(nextStep.id)
    }
  }

  const handleBack = () => {
    const prevStep = STEPS.find(item => item.id === step - 1)
    if (prevStep) {
      jumpTo(prevStep.id)
    }
  }

  const handleReset = () => {
    setContext({
      who: '',
      occasion: '',
      vibe: '',
      budget: '',
      tomorrow: '',
    })
    setDirection('back')
    setReaction(null)
    setStep(1)
  }

  const handleGeneratePlan = () => {
    if (!allComplete) return
    router.push(buildPlannerResultHref(context))
  }

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        eyebrow={
          <Badge className="border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-mint">
            NIGHT PLANNER
          </Badge>
        }
        title={
          <>
            Your Night. <HeroAccent>Your Way.</HeroAccent>
          </>
        }
        subtitle="Tell us what kind of night you're after and we'll help you find the right events."
        showMap={false}
        compact
      >
        <nav aria-label="Planner progress" className="mx-auto max-w-3xl">
          <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              Step {step} of {TOTAL_STEPS}: <strong className="text-white">{current.label}</strong>
            </span>
            <span>
              {answered.length} of {TOTAL_STEPS} answered
            </span>
          </div>
          <ol className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {STEPS.map(item => {
              const done = Boolean(context[item.field])
              const isCurrent = step === item.id
              const clickable = canJumpToStep(item.id)

              return (
                <li key={item.id} aria-current={isCurrent ? 'step' : undefined}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onClick={() => jumpTo(item.id)}
                    aria-label={`Step ${item.id}: ${item.label}${done ? ' (completed)' : ''}`}
                    className={`flex w-full flex-col items-center gap-2 rounded-xl border px-2 py-2.5 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-100 ${
                      isCurrent
                        ? 'border-mint bg-mint/15 text-white'
                        : done
                          ? 'border-mint/40 bg-night/70 text-mint hover:border-mint'
                          : clickable
                            ? 'border-border/70 bg-night/40 text-muted-foreground hover:border-border'
                            : 'cursor-default border-border/40 bg-night/30 text-muted-foreground/70'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isCurrent
                          ? 'bg-mint text-night ring-2 ring-mint/40'
                          : done
                            ? 'bg-mint/25 text-mint'
                            : 'bg-card text-muted-foreground'
                      }`}
                    >
                      {done && !isCurrent ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        item.id
                      )}
                    </span>
                    <span
                      className={`text-[11px] leading-tight sm:text-xs ${
                        isCurrent ? 'font-semibold text-white' : 'text-muted-foreground'
                      }`}
                    >
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
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Interactive Summary Chips for Answered Steps */}
          {answered.length > 0 ? (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/80 bg-card/60 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                  Your choices:
                </span>
                {answered.map(item => {
                  const option = OPTIONS[item.field].find(
                    choice => choice.id === context[item.field]
                  )
                  if (!option) return null
                  const isCurrent = step === item.id
                  const ChipIcon = option.icon

                  return (
                    <button
                      key={item.field}
                      type="button"
                      onClick={() => {
                        if (!isCurrent) jumpTo(item.id)
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isCurrent
                          ? 'border-primary bg-primary/15 text-mint-light'
                          : 'border-border bg-night/70 text-foreground hover:border-primary/60'
                      }`}
                    >
                      <ChipIcon className="h-3.5 w-3.5 text-mint" aria-hidden="true" />
                      <span>
                        {item.label}: <strong>{option.label}</strong>
                      </span>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          ) : null}

          <Card
            key={step}
            className={`border-border bg-card/80 shadow-xl animate-in fade-in-0 duration-200 motion-reduce:animate-none ${
              direction === 'forward' ? 'slide-in-from-right-2' : 'slide-in-from-left-2'
            }`}
          >
            <CardContent className="p-6 sm:p-8">
              <div className="mb-8 text-center">
                <div
                  aria-hidden="true"
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-mint/25 bg-mint/10 text-mint"
                >
                  <StepIcon className="h-7 w-7" />
                </div>
                <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-mint">
                  Question {step} of {TOTAL_STEPS}
                </p>
                <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                  {current.title}
                </h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  {current.subtitle}
                </p>

                <div className="mt-4 min-h-[2.5rem]" aria-live="polite" role="status">
                  {reaction ? (
                    <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-mint-light">
                      <Check className="h-4 w-4 text-mint" aria-hidden="true" />
                      <span>{reaction}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <ChoiceGrid
                options={OPTIONS[current.field]}
                selected={currentSelection}
                columns={current.columns}
                onSelect={id => handleSelect(current.field, id)}
              />

              {/* Step Navigation Bar */}
              <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-3 border-t border-border/80 pt-6 sm:flex-row sm:items-center">
                <div>
                  {step > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="w-full gap-2 sm:w-auto"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                      <span>Previous step</span>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Select an option to continue
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {step < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      variant="brand"
                      disabled={!currentSelection}
                      onClick={handleContinue}
                      className="w-full gap-2 px-6 sm:w-auto"
                    >
                      <span>Continue to {STEPS[step]?.label}</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : null}

                  {allComplete ? (
                    <Button
                      type="button"
                      variant="brand"
                      onClick={handleGeneratePlan}
                      className="w-full gap-2 px-6 py-5 text-base font-bold sm:w-auto"
                    >
                      <span>Build My Night Plan</span>
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : null}
                </div>
              </div>

              {allComplete && recap ? (
                <div className="mt-6 rounded-xl border border-mint/25 bg-mint/10 p-4 text-center">
                  <p className="text-sm text-foreground/90">
                    <strong className="font-semibold text-mint-light">Tonight&apos;s brief: </strong>
                    {recap}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function PlannerWizardFallback() {
  return (
    <div className="flex flex-col bg-background">
      <PageHero
        eyebrow={
          <Badge className="border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-mint">
            NIGHT PLANNER
          </Badge>
        }
        title={
          <>
            Your Night. <HeroAccent>Your Way.</HeroAccent>
          </>
        }
        subtitle="Tell us what kind of night you're after and we'll help you find the right events."
        showMap={false}
        compact
      />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div
            role="status"
            aria-live="polite"
            className="h-96 rounded-2xl border border-border bg-card/60 p-8 animate-pulse motion-reduce:animate-none"
          >
            <span className="sr-only">Loading night planner…</span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PlannerPage() {
  return (
    <Suspense fallback={<PlannerWizardFallback />}>
      <PlannerWizardContent />
    </Suspense>
  )
}
