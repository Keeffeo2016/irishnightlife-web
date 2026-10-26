import type { MetadataRoute } from 'next'
import { resolveAppOrigin, SITEMAP_STATIC_PATHS } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = resolveAppOrigin()
  return SITEMAP_STATIC_PATHS.map((path) => ({
    url: path === '/' ? origin : `${origin}${path}`,
  }))
}
