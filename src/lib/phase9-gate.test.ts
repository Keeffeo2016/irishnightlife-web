import assert from 'node:assert/strict'
import test from 'node:test'
import { buildLoginSuccessBody } from './auth/login-response.ts'
import { safeNextPath } from './auth/redirect.ts'
import { dublinWallTimeToUtc } from './dublin-time.ts'
import {
  ROBOTS_DISALLOW_PATHS,
  resolveAppOrigin,
  resolveMetadataBase,
  SITEMAP_STATIC_PATHS,
  viewsSinceIso,
} from './seo.ts'

test('login success body never includes a session field', () => {
  const body = buildLoginSuccessBody({
    userId: 'user-1',
    email: 'pat@example.com',
    role: 'consumer',
  })

  assert.equal(body.success, true)
  assert.equal(body.user.id, 'user-1')
  assert.equal(body.user.email, 'pat@example.com')
  assert.equal(body.role, 'consumer')
  assert.equal('session' in body, false)
  assert.deepEqual(Object.keys(body).sort(), ['role', 'success', 'user'])
})

test('robots disallow paths cover private app areas', () => {
  assert.deepEqual([...ROBOTS_DISALLOW_PATHS], [
    '/dashboard',
    '/admin',
    '/profile',
    '/auth',
    '/api',
    '/planner/plan',
  ])
})

test('sitemap lists static public routes only (no invented slugs)', () => {
  assert.deepEqual([...SITEMAP_STATIC_PATHS], [
    '/',
    '/events',
    '/venues',
    '/planner',
    '/for-venues',
  ])
  for (const path of SITEMAP_STATIC_PATHS) {
    assert.equal(path.includes('/events/'), false)
    assert.equal(path.includes('/venues/'), false)
    assert.equal(path.includes('/planner/plan'), false)
  }
})

test('resolveAppOrigin prefers valid http(s) env and falls back to localhost', () => {
  assert.equal(resolveAppOrigin('https://example.com/app'), 'https://example.com')
  assert.equal(resolveAppOrigin('http://localhost:3000'), 'http://localhost:3000')
  assert.equal(resolveAppOrigin('not a url'), 'http://localhost:3000')
  assert.equal(resolveAppOrigin(''), 'http://localhost:3000')
  assert.equal(resolveAppOrigin(undefined), 'http://localhost:3000')
  assert.equal(resolveMetadataBase('https://example.com').href, 'https://example.com/')
})

test('viewsSinceIso is a pure helper driven by nowMs', () => {
  assert.equal(
    viewsSinceIso(Date.UTC(2026, 9, 26, 12, 0, 0)),
    new Date(Date.UTC(2026, 9, 12, 12, 0, 0)).toISOString()
  )
})

test('safeNextPath rejects protocol-relative and off-site next values', () => {
  assert.equal(safeNextPath('//evil.com'), '/')
  assert.equal(safeNextPath('//evil.com/phish'), '/')
  assert.equal(safeNextPath('/profile'), '/profile')
  assert.equal(safeNextPath('https://evil.com'), '/')
})

test('Dublin spring-forward gap and fall-back ambiguous wall times resolve stably', () => {
  // 2026-03-29: clocks jump 01:00 -> 02:00 IST. 01:30 does not exist.
  const springGap = dublinWallTimeToUtc('2026-03-29', 1, 30, 0)
  assert.ok(!Number.isNaN(springGap.getTime()))
  // Resolved instant should still land on the transition day in UTC terms.
  assert.equal(springGap.toISOString().startsWith('2026-03-29'), true)

  // Neighbouring valid times remain exact.
  assert.equal(
    dublinWallTimeToUtc('2026-03-29', 0, 30, 0).toISOString(),
    '2026-03-29T00:30:00.000Z'
  )
  assert.equal(
    dublinWallTimeToUtc('2026-03-29', 2, 30, 0).toISOString(),
    '2026-03-29T01:30:00.000Z'
  )

  // 2026-10-25: 01:30 occurs twice (IST then GMT). Helper picks one stable offset.
  const fallAmbiguous = dublinWallTimeToUtc('2026-10-25', 1, 30, 0)
  assert.ok(!Number.isNaN(fallAmbiguous.getTime()))
  const fallIso = fallAmbiguous.toISOString()
  assert.ok(
    fallIso === '2026-10-25T00:30:00.000Z' || fallIso === '2026-10-25T01:30:00.000Z',
    `unexpected ambiguous fall-back instant: ${fallIso}`
  )

  assert.equal(
    dublinWallTimeToUtc('2026-10-25', 0, 30, 0).toISOString(),
    '2026-10-24T23:30:00.000Z'
  )
  assert.equal(
    dublinWallTimeToUtc('2026-10-25', 2, 30, 0).toISOString(),
    '2026-10-25T02:30:00.000Z'
  )
})
