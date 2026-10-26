export function safeNextPath(value: string | null, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback
  }
  return value
}

export function pathAfterSignIn(role: string | null | undefined, next: string) {
  if (role === 'venue_owner') return '/dashboard'
  return next
}
