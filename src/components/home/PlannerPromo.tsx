import Link from 'next/link'
import { Sparkles, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from 'cn'

export function PlannerPromo() {
  return (
    <section aria-labelledby="planner-promo-heading" className="relative">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-violet/35 bg-night px-6 py-12 sm:px-10 md:px-14 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(139,92,246,0.28),transparent_55%),radial-gradient(ellipse_at_100%_80%,rgba(255,61,129,0.18),transparent_50%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-violet/20 blur-3xl"
          />

          <div className="relative grid gap-8 md:grid-cols-[1.2fr_auto] md:items-end">
            <div className="max-w-xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet/40 bg-violet/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-foreground">
                <Sparkles className="size-3.5 text-violet-light" aria-hidden="true" />
                Tonight Planner
              </span>
              <h2
                id="planner-promo-heading"
                className="text-3xl font-bold text-foreground md:text-5xl md:leading-[1.1]"
              >
                Not sure where to go?
              </h2>
              <p className="mt-4 text-base text-foreground/80 md:text-lg">
                Tell us the vibe, budget and company - we&apos;ll build a night from real verified
                listings.
              </p>
            </div>

            <Link
              href="/planner"
              className={cn(
                buttonVariants({ variant: 'brand', size: 'lg' }),
                'inline-flex w-full gap-2 px-8 md:w-auto'
              )}
            >
              Plan My Night
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
