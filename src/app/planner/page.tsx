'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Image from 'next/image'
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
const AUTO_ADVANCE_MS = 480

type StepId = 1 | 2 | 3 | 4 | 5
type SlideDirection = 'forward' | 'back'

interface Choice {
  id: string
  label: string
  badge?: string
  icon: LucideIcon
  imageSrc: string
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
    imageSrc: '/planner/choices/who-solo.jpg',
    description: 'Heading out on your own tonight',
    reaction: "Flying solo. We'll keep it welcoming and easy.",
    recap: 'heading out solo',
  },
  {
    id: 'date',
    label: 'Date Night',
    icon: Heart,
    imageSrc: '/planner/choices/who-date.jpg',
    description: 'Somewhere with a bit of atmosphere for two',
    reaction: "Date night. We'll keep it close and atmospheric.",
    recap: 'a date night',
  },
  {
    id: 'friends',
    label: 'Friends',
    icon: Users,
    imageSrc: '/planner/choices/who-friends.jpg',
    description: 'Small crew of 3 to 5',
    reaction: "The crew's out. Grand.",
    recap: 'out with friends',
  },
  {
    id: 'group',
    label: 'Big Group',
    icon: UsersRound,
    imageSrc: '/planner/choices/who-group.jpg',
    description: 'Six or more out together',
    reaction: "Big group. We'll find spots with room for everyone.",
    recap: 'a big group',
  },
  {
    id: 'tourist',
    label: 'Visiting',
    icon: Compass,
    imageSrc: '/planner/choices/who-tourist.jpg',
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
    imageSrc: '/planner/choices/occasion-none.jpg',
    description: 'Just a proper night out',
    reaction: 'No occasion needed - just a good night out.',
    recap: 'no special occasion',
  },
  {
    id: 'birthday',
    label: 'Birthday',
    icon: Cake,
    imageSrc: '/planner/choices/occasion-birthday.jpg',
    description: 'Celebrating another year',
    reaction: "Happy birthday! We'll line up a lively run of stops.",
    recap: 'a birthday celebration',
  },
  {
    id: 'hen',
    label: 'Hen Party',
    icon: Crown,
    imageSrc: '/planner/choices/occasion-hen.jpg',
    description: 'Hen-friendly spots with plenty of energy',
    reaction: "Hen party. We'll only pick venues that welcome groups.",
    recap: 'a hen party',
  },
  {
    id: 'stag',
    label: 'Stag Party',
    icon: Trophy,
    imageSrc: '/planner/choices/occasion-stag.jpg',
    description: 'Stag-friendly pubs, bars, and late rooms',
    reaction: "Stag night. We'll keep it lively and group-ready.",
    recap: 'a stag party',
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    icon: Gem,
    imageSrc: '/planner/choices/occasion-anniversary.jpg',
    description: 'Marking a milestone together',
    reaction: "Anniversary. We'll make it feel special.",
    recap: 'an anniversary',
  },
  {
    id: 'leaving',
    label: 'Leaving Do',
    icon: HandMetal,
    imageSrc: '/planner/choices/occasion-leaving.jpg',
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
    imageSrc: '/planner/choices/vibe-chill.jpg',
    description: 'Relaxed pubs, acoustic corners, and good chat',
    reaction: 'Easy does it. Low lights, good pints, and great chat.',
    recap: 'keeping it chill',
  },
  {
    id: 'wild',
    label: 'High Energy',
    icon: Flame,
    imageSrc: '/planner/choices/vibe-wild.jpg',
    description: 'Busy dancefloors, DJs, and late finishes',
    reaction: "Grand - we're going out out.",
    recap: 'high energy',
  },
  {
    id: 'cultural',
    label: 'Live & Cultural',
    icon: Music,
    imageSrc: '/planner/choices/vibe-cultural.jpg',
    description: 'Trad sessions, live gigs, comedy, and local arts',
    reaction: 'Something with a bit of soul and live character.',
    recap: 'live music and culture',
  },
  {
    id: 'romantic',
    label: 'Intimate & Warm',
    icon: Heart,
    imageSrc: '/planner/choices/vibe-romantic.jpg',
    description: 'Candlelit corners, jazz, and unhurried drinks',
    reaction: "Keep it close. We'll find a warm, intimate spot.",
    recap: 'an intimate vibe',
  },
  {
    id: 'surprise',
    label: 'Surprise Me',
    icon: Sparkles,
    imageSrc: '/planner/choices/vibe-surprise.jpg',
    description: 'Eclectic picks and hidden gems worth discovering',
    reaction: 'You trust us - we love an eclectic route.',
    recap: 'a surprise mix',
  },
]

const BUDGET_OPTIONS: Choice[] = [
  {
    id: 'budget',
    label: 'Easy on the Wallet',
    badge: '€ · Under €20',
    icon: Wallet,
    imageSrc: '/planner/choices/budget-budget.jpg',
    description: 'Free gigs and low-cover nights under €20',
    reaction: 'Minding the wallet - plenty of great free and low-cover options.',
    recap: 'under €20 per person',
  },
  {
    id: 'moderate',
    label: 'Mid-Range',
    badge: '€€ · €20–€50',
    icon: Banknote,
    imageSrc: '/planner/choices/budget-moderate.jpg',
    description: 'Ticketed shows and a comfortable night out (€20–€50)',
    reaction: 'A sensible splash. Opens up great ticketed gigs.',
    recap: 'a €20–€50 budget',
  },
  {
    id: 'splurge',
    label: 'All Out',
    badge: '€€€ · €50+',
    icon: Gem,
    imageSrc: '/planner/choices/budget-splurge.jpg',
    description: 'Big nights, headline shows, and no holding back (€50+)',
    reaction: "Tonight's the night - we'll include headline options.",
    recap: 'an all-out €50+ budget',
  },
]

const TOMORROW_OPTIONS: Choice[] = [
  {
    id: 'nothing',
    label: 'Lie-In Tomorrow',
    icon: Moon,
    imageSrc: '/planner/choices/tomorrow-nothing.jpg',
    description: 'No plans in the morning - happy to stay out late',
    reaction: 'Lie-in secured. Late-night stops are on the table.',
    recap: 'a lie-in tomorrow',
  },
  {
    id: 'early',
    label: 'Early Start',
    icon: AlarmClock,
    imageSrc: '/planner/choices/tomorrow-early.jpg',
    description: 'Up before 9am - wrap up at a sensible hour',
    reaction: "Early start noted. We'll keep the finish time sensible.",
    recap: 'an early start tomorrow',
  },
  {
    id: 'hungover',
    label: 'Easy Sunday / Recovery',
    icon: Sunrise,
    imageSrc: '/planner/choices/tomorrow-hungover.jpg',
    description: 'Taking it handy tomorrow - wrap up around midnight',
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

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function pulseChoiceTile(element: HTMLElement) {
  if (prefersReducedMotion() || typeof element.animate !== 'function') return
  element.animate(
    [
      { transform: 'scale(1)', filter: 'brightness(1)' },
      { transform: 'scale(1.025)', filter: 'brightness(1.12)' },
      { transform: 'scale(1)', filter: 'brightness(1)' },
    ],
    { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
  )
}

function pulseProgressMark(element: HTMLElement | null) {
  if (!element || prefersReducedMotion() || typeof element.animate !== 'function') return
  element.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.18)' },
      { transform: 'scale(1)' },
    ],
    { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
  )
}

function runViewTransition(update: () => void, direction: SlideDirection) {
  if (prefersReducedMotion() || typeof document === 'undefined') {
    update()
    return
  }

  const doc = document as Document & {
    startViewTransition?: (
      callbackOrOptions:
        | (() => void)
        | { update: () => void; types?: string[] }
    ) => { finished: Promise<void> }
  }

  if (typeof doc.startViewTransition !== 'function') {
    update()
    return
  }

  const type = direction === 'forward' ? 'forward' : 'back'
  try {
    doc.startViewTransition({
      update,
      types: [type],
    })
  } catch {
    doc.startViewTransition(update)
  }
}

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
  onSelect: (id: string, element: HTMLButtonElement) => void
}) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 ${
        columns === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2'
      }`}
    >
      {options.map(option => {
        const active = selected === option.id

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={event => onSelect(option.id, event.currentTarget)}
            className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
              active
                ? 'border-primary bg-primary/12 shadow-lg shadow-black/30 ring-1 ring-primary/50'
                : 'border-border bg-card hover:border-primary/60 hover:bg-card/90'
            }`}
          >
            <span className="relative block aspect-[16/10] w-full overflow-hidden bg-night">
              <Image
                src={option.imageSrc}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className={`object-cover transition-transform duration-500 motion-reduce:transition-none ${
                  active
                    ? 'scale-105 brightness-110'
                    : 'scale-100 group-hover:scale-105'
                }`}
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-night via-night/35 to-transparent"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,61,129,0.28),transparent_55%)]"
              />

              {active ? (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full border border-primary/50 bg-night/80 px-2.5 py-1 text-xs font-semibold text-hotpink-light backdrop-blur-sm">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Selected
                </span>
              ) : option.badge ? (
                <span className="absolute top-3 right-3">
                  <Badge
                    variant="outline"
                    className="border-border/80 bg-night/70 text-xs text-muted-foreground backdrop-blur-sm"
                  >
                    {option.badge}
                  </Badge>
                </span>
              ) : null}
            </span>

            <span className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <span>
                <h3 className="mb-1 text-lg font-bold text-foreground">{option.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {option.description}
                </p>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function PlannerWizardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const advanceTimerRef = useRef<number | null>(null)
  const progressRefs = useRef<Partial<Record<StepId, HTMLSpanElement | null>>>({})

  const [context, setContext] = useState<PlannerContextValues>(() =>
    parsePlannerSearchParams(searchParams)
  )
  const [step, setStep] = useState<StepId>(() =>
    initialStepForContext(parsePlannerSearchParams(searchParams))
  )
  const [direction, setDirection] = useState<SlideDirection>('forward')
  const [reaction, setReaction] = useState<string | null>(null)
  const [useCssFallbackMotion, setUseCssFallbackMotion] = useState(true)

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
  }

  useEffect(() => {
    const supportsViewTransition =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      !prefersReducedMotion()
    setUseCssFallbackMotion(!supportsViewTransition)

    return () => {
      clearAdvanceTimer()
    }
  }, [])

  const current = STEPS[step - 1]
  if (!current) return null

  const currentSelection = context[current.field]
  const allComplete = isPlannerComplete(context)
  const recap = buildRecap(context)
  const answered = STEPS.filter(item => Boolean(context[item.field]))
  const StepIcon = current.icon

  const firstUnansweredId =
    STEPS.find(item => !context[item.field])?.id ?? TOTAL_STEPS

  const canJumpToStep = (targetId: StepId): boolean => {
    if (targetId === step) return false
    return Boolean(context[STEPS[targetId - 1].field]) || targetId <= firstUnansweredId
  }

  const jumpTo = (next: StepId, nextContext: PlannerContextValues = context) => {
    clearAdvanceTimer()
    const nextDirection: SlideDirection = next > step ? 'forward' : 'back'
    const field = STEPS[next - 1].field
    const selectedId = nextContext[field]
    const existingOption = OPTIONS[field].find(item => item.id === selectedId)

    runViewTransition(() => {
      flushSync(() => {
        setDirection(nextDirection)
        setReaction(existingOption?.reaction ?? null)
        setStep(next)
      })
    }, nextDirection)

    window.requestAnimationFrame(() => {
      pulseProgressMark(progressRefs.current[next] ?? null)
    })
  }

  const handleSelect = (
    field: PlannerFieldKey,
    value: string,
    element: HTMLButtonElement
  ) => {
    clearAdvanceTimer()
    pulseChoiceTile(element)

    const nextContext = { ...context, [field]: value }
    setContext(nextContext)
    const option = OPTIONS[field].find(item => item.id === value)
    setReaction(option?.reaction ?? null)

    const isLastStep = step === TOTAL_STEPS
    if (isLastStep || prefersReducedMotion()) return

    advanceTimerRef.current = window.setTimeout(() => {
      const nextStep = STEPS.find(item => item.id === step + 1)
      if (nextStep) {
        jumpTo(nextStep.id, nextContext)
      }
    }, AUTO_ADVANCE_MS)
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
    clearAdvanceTimer()
    const empty: PlannerContextValues = {
      who: '',
      occasion: '',
      vibe: '',
      budget: '',
      tomorrow: '',
    }
    runViewTransition(() => {
      flushSync(() => {
        setContext(empty)
        setDirection('back')
        setReaction(null)
        setStep(1)
      })
    }, 'back')
  }

  const handleGeneratePlan = () => {
    if (!allComplete) return
    clearAdvanceTimer()
    router.push(buildPlannerResultHref(context))
  }

  return (
    <div className="flex flex-col bg-background">
      <PageHero
        eyebrow={
          <Badge className="border border-hotpink/30 bg-hotpink/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-hotpink">
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
              Step {step} of {TOTAL_STEPS}:{' '}
              <strong className="text-white">{current.label}</strong>
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
                    className={`flex w-full flex-col items-center gap-1.5 rounded-xl border px-1.5 py-2 sm:gap-2 sm:px-2 sm:py-2.5 transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-100 ${
                      isCurrent
                        ? 'border-hotpink bg-hotpink/15 text-white'
                        : done
                          ? 'border-hotpink/40 bg-night/70 text-hotpink hover:border-hotpink'
                          : clickable
                            ? 'border-border/70 bg-night/40 text-muted-foreground hover:border-border'
                            : 'cursor-default border-border/40 bg-night/30 text-muted-foreground/70'
                    }`}
                  >
                    <span
                      ref={node => {
                        progressRefs.current[item.id] = node
                      }}
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isCurrent
                          ? 'bg-hotpink text-night ring-2 ring-hotpink/40'
                          : done
                            ? 'bg-hotpink/25 text-hotpink'
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
                      className={`hidden text-[11px] leading-tight sm:block sm:text-xs ${
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
        <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-6 -z-10 mx-auto h-[28rem] max-w-3xl rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,rgba(255,61,129,0.12),transparent_68%)]"
          />

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

                  return (
                    <button
                      key={item.field}
                      type="button"
                      onClick={() => {
                        if (!isCurrent) jumpTo(item.id)
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isCurrent
                          ? 'border-primary bg-primary/15 text-hotpink-light'
                          : 'border-border bg-night/70 text-foreground hover:border-primary/60'
                      }`}
                    >
                      <span className="relative h-4 w-4 overflow-hidden rounded-full">
                        <Image
                          src={option.imageSrc}
                          alt=""
                          fill
                          sizes="16px"
                          className="object-cover"
                        />
                      </span>
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
            className={`planner-step-card border-border bg-card/80 shadow-xl ${
              useCssFallbackMotion
                ? `animate-in fade-in-0 duration-200 motion-reduce:animate-none ${
                    direction === 'forward'
                      ? 'slide-in-from-right-2'
                      : 'slide-in-from-left-2'
                  }`
                : ''
            }`}
          >
            <CardContent className="p-6 sm:p-8">
              <div className="mb-8 text-center">
                <div
                  aria-hidden="true"
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-hotpink/25 bg-hotpink/10 text-hotpink"
                >
                  <StepIcon className="h-7 w-7" />
                </div>
                <p className="mb-1 text-xs font-semibold tracking-wider uppercase text-hotpink">
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
                    <p
                      key={reaction}
                      className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-hotpink-light animate-in fade-in-0 zoom-in duration-200 motion-reduce:animate-none"
                    >
                      <Check className="h-4 w-4 text-hotpink" aria-hidden="true" />
                      <span>{reaction}</span>
                    </p>
                  ) : null}
                </div>
              </div>

              <ChoiceGrid
                options={OPTIONS[current.field]}
                selected={currentSelection}
                columns={current.columns}
                onSelect={(id, element) => handleSelect(current.field, id, element)}
              />

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
                <div className="mt-6 rounded-xl border border-hotpink/25 bg-hotpink/10 p-4 text-center">
                  <p className="text-sm text-foreground/90">
                    <strong className="font-semibold text-hotpink-light">
                      Tonight&apos;s brief:{' '}
                    </strong>
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
          <Badge className="border border-hotpink/30 bg-hotpink/10 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-hotpink">
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
