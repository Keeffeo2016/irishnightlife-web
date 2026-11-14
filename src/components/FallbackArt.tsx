import {
  Beer,
  Disc3,
  HelpCircle,
  Mic2,
  Music,
  Sparkles,
  Tag,
  Trophy,
  Utensils,
  Wine,
  type LucideIcon,
} from 'lucide-react'
import { fallbackStops, type FallbackKind } from '@/lib/fallback-art'
import { cn } from 'cn'

const EVENT_ICONS: Record<string, LucideIcon> = {
  live_music: Music,
  dj: Disc3,
  comedy: Mic2,
  quiz: HelpCircle,
  sports: Trophy,
  special_offer: Tag,
}

const VENUE_ICONS: Record<string, LucideIcon> = {
  pub: Beer,
  bar: Wine,
  club: Disc3,
  live_music_venue: Music,
  restaurant: Utensils,
}

export function FallbackArt({
  kind,
  type,
  label,
  className,
}: {
  kind: FallbackKind
  type: string | null | undefined
  label: string
  className?: string
}) {
  const art = fallbackStops(kind, type)
  const key = (type ?? '').trim().toLowerCase()
  const icons = kind === 'event' ? EVENT_ICONS : VENUE_ICONS
  const Icon = icons[key] ?? Sparkles

  return (
    <div className={cn('absolute inset-0', art.className, className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'radial-gradient(rgba(11, 10, 18, 0.45) 0.7px, transparent 0.7px)',
          backgroundSize: '4px 4px',
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-night text-muted-foreground">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        <span className="rounded-md bg-night px-2 py-1 text-xs font-medium uppercase tracking-wider text-foreground">
          {label}
        </span>
      </div>
    </div>
  )
}
