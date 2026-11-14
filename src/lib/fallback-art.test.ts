import assert from 'node:assert/strict'
import test from 'node:test'
import { fallbackStops } from './fallback-art.ts'

test('event types map to distinct gradient pairs', () => {
  const dj = fallbackStops('event', 'dj')
  const live = fallbackStops('event', 'live_music')
  const comedy = fallbackStops('event', 'comedy')
  const quiz = fallbackStops('event', 'quiz')
  const sports = fallbackStops('event', 'sports')

  assert.deepEqual(
    [dj.from, dj.to],
    ['violet', 'rose']
  )
  assert.deepEqual([live.from, live.to], ['shamrock', 'amber'])
  assert.deepEqual([comedy.from, comedy.to], ['amber', 'rose'])
  assert.equal(fallbackStops('event', 'special_offer').className, comedy.className)
  assert.deepEqual([quiz.from, quiz.to], ['violet', 'shamrock'])
  assert.deepEqual([sports.from, sports.to], ['rose', 'amber'])
  assert.notEqual(dj.className, live.className)
})

test('venue types map onto the same pairs', () => {
  assert.deepEqual(
    [fallbackStops('venue', 'club').from, fallbackStops('venue', 'club').to],
    ['violet', 'rose']
  )
  assert.deepEqual(
    [fallbackStops('venue', 'pub').from, fallbackStops('venue', 'pub').to],
    ['shamrock', 'amber']
  )
  assert.equal(
    fallbackStops('venue', 'live_music_venue').className,
    fallbackStops('event', 'live_music').className
  )
  assert.deepEqual(
    [fallbackStops('venue', 'restaurant').from, fallbackStops('venue', 'restaurant').to],
    ['amber', 'rose']
  )
  assert.deepEqual(
    [fallbackStops('venue', 'bar').from, fallbackStops('venue', 'bar').to],
    ['rose', 'amber']
  )
})

test('unknown types fall back to night ink on raised', () => {
  for (const kind of ['event', 'venue'] as const) {
    const art = fallbackStops(kind, 'trad')
    assert.deepEqual([art.from, art.to], ['night', 'raised'])
    assert.match(art.className, /from-night/)
    assert.match(art.className, /to-forest/)
  }
  assert.deepEqual(
    [fallbackStops('event', null).from, fallbackStops('event', '  ').to],
    ['night', 'raised']
  )
})
