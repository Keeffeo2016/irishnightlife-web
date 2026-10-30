import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from 'cn'

export function PlannerPromo() {
  return (
    <section aria-labelledby="planner-promo-heading" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-night-soft via-card to-forest px-6 py-10 sm:px-10 md:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-mint/15 blur-3xl motion-reduce:hidden"
          />
          <div className="relative max-w-2xl">
            <h2 id="planner-promo-heading" className="text-2xl font-bold text-white md:text-3xl">
              Not Sure Where to Go?
            </h2>
            <p className="mt-3 text-base text-foreground/80 md:text-lg">
              Tell us what kind of night you&apos;re after and we&apos;ll help you plan it.
            </p>
            <Link
              href="/planner"
              className={cn(buttonVariants({ variant: 'brand', size: 'lg' }), 'mt-6 inline-flex gap-2 px-6')}
            >
              <Sparkles className="size-4" aria-hidden="true" />
              Plan My Night
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
