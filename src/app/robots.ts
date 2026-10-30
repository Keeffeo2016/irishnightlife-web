import type { MetadataRoute } from 'next'
import { ROBOTS_DISALLOW_PATHS, resolveAppOrigin } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const origin = resolveAppOrigin()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...ROBOTS_DISALLOW_PATHS],
    },
    sitemap: `${origin}/sitemap.xml`,
  }
}
