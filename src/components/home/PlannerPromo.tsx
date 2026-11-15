import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from 'cn'

export function PlannerPromo() {
  return (
    <section aria-labelledby="planner-promo-heading">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card px-6 py-10 sm:px-10 md:py-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,61,129,0.16),transparent_55%)]"
          />
          <div className="relative max-w-2xl">
            <h2 id="planner-promo-heading" className="text-3xl font-bold text-foreground md:text-4xl">
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
