import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isSupabaseConfigured,
  isPublicPath,
  requiresAuth,
  PUBLIC_PATHS,
} from './auth/middleware-security-pure.ts'

test('isSupabaseConfigured returns false when env vars are missing', () => {
  // Save original values
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    // Test missing URL
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
    assert.equal(isSupabaseConfigured(), false)

    // Test missing key
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    assert.equal(isSupabaseConfigured(), false)

    // Test both missing
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    assert.equal(isSupabaseConfigured(), false)

    // Test empty strings
    process.env.NEXT_PUBLIC_SUPABASE_URL = ''
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''
    assert.equal(isSupabaseConfigured(), false)

    // Test whitespace only
    process.env.NEXT_PUBLIC_SUPABASE_URL = '   '
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '   '
    assert.equal(isSupabaseConfigured(), false)
  } finally {
    // Restore original values
    if (originalUrl !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    }
    if (originalKey !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    }
  }
})

test('isSupabaseConfigured returns true when both env vars are present', () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
    assert.equal(isSupabaseConfigured(), true)
  } finally {
    if (originalUrl !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
    } else {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
    }
    if (originalKey !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalKey
    } else {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  }
})

test('PUBLIC_PATHS contains expected public routes', () => {
  assert.ok(PUBLIC_PATHS.includes('/'))
  assert.ok(PUBLIC_PATHS.includes('/events'))
  assert.ok(PUBLIC_PATHS.includes('/venues'))
  assert.ok(PUBLIC_PATHS.includes('/planner'))
  assert.ok(PUBLIC_PATHS.includes('/for-venues'))
  assert.ok(PUBLIC_PATHS.includes('/auth/login'))
  assert.ok(PUBLIC_PATHS.includes('/auth/signup'))
  assert.ok(PUBLIC_PATHS.includes('/auth/callback'))
})

test('isPublicPath correctly identifies public routes', () => {
  // Exact matches
  assert.equal(isPublicPath('/'), true)
  assert.equal(isPublicPath('/events'), true)
  assert.equal(isPublicPath('/venues'), true)
  assert.equal(isPublicPath('/planner'), true)
  assert.equal(isPublicPath('/for-venues'), true)
  assert.equal(isPublicPath('/auth/login'), true)
  assert.equal(isPublicPath('/auth/signup'), true)
  assert.equal(isPublicPath('/auth/callback'), true)

  // Dynamic routes
  assert.equal(isPublicPath('/events/some-event'), true)
  assert.equal(isPublicPath('/venues/some-venue'), true)
  assert.equal(isPublicPath('/auth/confirm-email'), true)

  // Public API routes
  assert.equal(isPublicPath('/api/planner'), true)

  // Protected routes
  assert.equal(isPublicPath('/dashboard'), false)
  assert.equal(isPublicPath('/dashboard/events'), false)
  assert.equal(isPublicPath('/dashboard/profile'), false)
  assert.equal(isPublicPath('/admin'), false)
  assert.equal(isPublicPath('/admin/users'), false)
  assert.equal(isPublicPath('/profile'), false)
  assert.equal(isPublicPath('/api/auth/login'), false)
  assert.equal(isPublicPath('/api/auth/signup'), false)
  assert.equal(isPublicPath('/api/auth/venue'), false)
})

test('requiresAuth is the inverse of isPublicPath', () => {
  // Public paths do not require auth
  assert.equal(requiresAuth('/'), false)
  assert.equal(requiresAuth('/events'), false)
  assert.equal(requiresAuth('/venues/some-venue'), false)
  assert.equal(requiresAuth('/api/planner'), false)

  // Protected paths require auth
  assert.equal(requiresAuth('/dashboard'), true)
  assert.equal(requiresAuth('/admin'), true)
  assert.equal(requiresAuth('/profile'), true)
  assert.equal(requiresAuth('/api/auth/login'), true)
})

test('middleware security prevents fail-open vulnerability', () => {
  // This test documents the security fix:
  // Previously, missing Supabase config would fail open (allow all requests)
  // Now, missing config fails closed (reject protected routes)

  // Verify that protected routes are correctly identified
  assert.equal(requiresAuth('/dashboard'), true, 'dashboard requires auth')
  assert.equal(requiresAuth('/admin'), true, 'admin requires auth')
  assert.equal(requiresAuth('/profile'), true, 'profile requires auth')

  // Verify that public routes do not require auth
  assert.equal(requiresAuth('/'), false, 'homepage is public')
  assert.equal(requiresAuth('/events'), false, 'events directory is public')
  assert.equal(requiresAuth('/api/planner'), false, 'planner API is public')

  // The actual fail-closed behavior is tested in integration tests
  // This unit test verifies the logic that enables it
})
