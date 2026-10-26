import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function BackToPlanner({ href }: { href: string | null }) {
  if (!href) return null

  return (
    <div className="border-b border-white/10 bg-night">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-medium text-mint hover:text-mint-light"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to your plan
        </Link>
      </div>
    </div>
  )
}
