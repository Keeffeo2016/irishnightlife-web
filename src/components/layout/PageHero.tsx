import type { ReactNode } from 'react'
import { cn } from 'cn'

interface PageHeroProps {
  title: ReactNode
  subtitle?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  align?: 'center' | 'left'
  showMap?: boolean
  compact?: boolean
  className?: string
}

export function PageHero({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
  align = 'center',
  showMap = true,
  compact = false,
  className,
}: PageHeroProps) {
  const centered = align === 'center'

  return (
    <section
      className={cn(
        'relative overflow-hidden border-b border-border bg-gradient-to-br from-night via-night-soft to-forest',
        className
      )}
    >
      {showMap && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10">
          <div
            aria-hidden
            className="h-full w-full max-w-4xl bg-mint"
            style={{
              maskImage: 'url(/ireland-map.svg)',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              maskSize: 'contain',
            }}
          />
        </div>
      )}

      <div
        className={cn(
          'relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
          compact ? 'py-8 md:py-10' : 'py-12 md:py-16'
        )}
      >
        <div
          className={cn(
            'flex flex-col gap-6',
            centered ? 'items-center text-center' : 'md:flex-row md:items-end md:justify-between'
          )}
        >
          <div className={cn(centered && 'max-w-3xl')}>
            {eyebrow && <div className="mb-4">{eyebrow}</div>}
            <h1
              className={cn(
                'mb-3 font-bold text-white',
                compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'
              )}
            >
              {title}
            </h1>
            {subtitle && <p className="text-lg text-muted-foreground md:text-xl">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {children && <div className={cn('mt-8', centered && 'mx-auto max-w-4xl')}>{children}</div>}
      </div>
    </section>
  )
}

export function HeroAccent({ children }: { children: ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-mint-light to-mint bg-clip-text text-transparent">
      {children}
    </span>
  )
}
