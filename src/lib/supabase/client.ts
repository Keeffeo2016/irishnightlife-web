import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | undefined

/**
 * Browser Supabase client. Lazily creates a single shared instance.
 * Avoid calling this at module top-level in Client Components so the
 * client is not constructed during SSR with a non-browser storage path.
 */
export function createClient() {
  if (typeof window !== 'undefined' && browserClient) {
    return browserClient
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const client = createBrowserClient(url, anonKey)
  if (typeof window !== 'undefined') {
    browserClient = client
  }
  return client
}
