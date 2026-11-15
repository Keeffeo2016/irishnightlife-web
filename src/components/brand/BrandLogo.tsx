import Image from 'next/image'
import { cn } from 'cn'

type BrandLogoProps = {
  className?: string
  priority?: boolean
  alt?: string
}

export function BrandLogo({
  className,
  priority = false,
  alt = 'IrishNightlife.ie',
}: BrandLogoProps) {
  return (
    <Image
      src="/brand/logo.png"
      alt={alt}
      width={2172}
      height={724}
      priority={priority}
      className={cn('w-auto', className)}
    />
  )
}
