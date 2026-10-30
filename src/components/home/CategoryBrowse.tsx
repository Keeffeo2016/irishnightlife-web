import Link from 'next/link'
import { Mic2, Music2, PartyPopper, Store, UtensilsCrossed, CalendarDays } from 'lucide-react'

const CATEGORIES = [
  {
    label: 'Live Music',
    href: '/events?type=live_music',
    description: 'Bands and sessions',
    icon: Music2,
  },
  {
    label: 'DJs & Club Nights',
    href: '/events?type=dj',
    description: 'DJ sets and club nights',
    icon: PartyPopper,
  },
  {
    label: 'Comedy',
    href: '/events?type=comedy',
    description: 'Stand-up and shows',
    icon: Mic2,
  },
  {
    label: 'Pubs & Bars',
    href: '/venues?types=pub,bar',
    description: 'Browse pubs and bars',
    icon: Store,
  },
  {
    label: 'Restaurants',
    href: '/venues?type=restaurant',
    description: 'Dining venues',
    icon: UtensilsCrossed,
  },
  {
    label: 'All Events',
    href: '/events',
    description: 'Everything upcoming',
    icon: CalendarDays,
  },
] as const

export function CategoryBrowse() {
  return (
    <section aria-labelledby="browse-categories-heading" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 max-w-2xl">
          <h2 id="browse-categories-heading" className="text-2xl font-bold text-foreground md:text-3xl">
            Browse by category
          </h2>
          <p className="mt-2 text-muted-foreground">
            Jump straight into the nights and venues we actually list.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <li key={category.href + category.label}>
                <Link
                  href={category.href}
                  className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-primary hover:bg-card focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-semibold text-foreground group-hover:text-primary">
                      {category.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{category.description}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
