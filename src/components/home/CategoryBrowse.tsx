import Image from 'next/image'
import Link from 'next/link'

const CATEGORIES = [
  {
    label: 'Live Music',
    href: '/events?type=live_music',
    description: 'Bands and sessions',
    image: '/home/vibe-live-music.jpg',
  },
  {
    label: 'DJs & Clubs',
    href: '/events?type=dj',
    description: 'Sets and late nights',
    image: '/home/vibe-dj-clubs.jpg',
  },
  {
    label: 'Comedy',
    href: '/events?type=comedy',
    description: 'Stand-up and shows',
    image: '/home/vibe-comedy.jpg',
  },
  {
    label: 'Pubs & Bars',
    href: '/venues?types=pub,bar',
    description: 'Verified locals',
    image: '/home/vibe-pubs-bars.jpg',
  },
  {
    label: 'Restaurants',
    href: '/venues?type=restaurant',
    description: 'Dinner before the gig',
    image: '/home/vibe-restaurants.jpg',
  },
  {
    label: 'All Events',
    href: '/events',
    description: 'Everything upcoming',
    image: '/home/vibe-all-events.jpg',
  },
] as const

export function CategoryBrowse() {
  return (
    <section aria-labelledby="browse-categories-heading" className="band-wash">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 id="browse-categories-heading" className="text-3xl font-bold text-foreground md:text-4xl">
            Discover by vibe
          </h2>
          <p className="mt-2 text-muted-foreground">
            Jump into the nights and venues we actually list.
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((category) => (
            <li key={category.href + category.label}>
              <Link
                href={category.href}
                className="group relative flex h-full min-h-[9.5rem] flex-col justify-end overflow-hidden rounded-2xl border border-border focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:min-h-[11rem]"
              >
                <Image
                  src={category.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/25 transition-colors group-hover:from-night group-hover:via-night/60"
                />
                <span className="relative p-4 md:p-5">
                  <span className="block text-base font-semibold text-white md:text-lg">
                    {category.label}
                  </span>
                  <span className="mt-1 block text-xs text-white/70 md:text-sm">
                    {category.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
