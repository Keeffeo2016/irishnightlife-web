import assert from 'node:assert/strict'
import test from 'node:test'
import { dublinWallTimeToUtc, formatDublinDateKey } from './dublin-time.ts'
import { buildEventJsonLd } from './event-jsonld.ts'
import { serializeJsonLd } from './safe-json-ld.ts'
import { shouldCommitFavoritesSnapshot } from './favorites-snapshot.ts'
import {
  activeMobileNavHref,
  isMobileNavItemActive,
  MOBILE_NAV_ITEMS,
  shouldShowMobileNav,
} from './mobile-nav.ts'
import {
  AWAITING_APPROVAL_MESSAGE,
  computeDashboardEventMetrics,
  DASHBOARD_GENERIC_CREATE_ERROR,
  DASHBOARD_GENERIC_LOAD_ERROR,
  DASHBOARD_GENERIC_SAVE_ERROR,
  DASHBOARD_GENERIC_UPLOAD_ERROR,
  DASHBOARD_NAV_ITEMS,
  formatDashboardDateTime,
  isDashboardNavItemActive,
  isVenueProfileComplete,
  validateCreateEventInput,
  validateVenueProfileInput,
} from './dashboard-validation.ts'
import { pathAfterSignIn, safeNextPath } from './auth/redirect.ts'
import {
  bestAlternate,
  buildPlannerResultHref,
  buildPlannerWizardHref,
  canShuffleStops,
  detailHrefFromPlan,
  isPlannerComplete,
  parsePlannerSearchParams,
  PLANNER_OPTION_IDS,
  plannerPlanHref,
  preservePlannerOrigin,
  shuffleStops,
  sortStopsByStart,
  summarizeEvents,
  swapStop,
} from './planner.ts'
import { directionsHref, safeExternalUrl } from './safe-external-url.ts'
import { buildVenueJsonLd } from './venue-jsonld.ts'
import { buildEventsHref, parseEventsSearchParams, resolveDublinDateRangeUtc } from '../components/events/events-discovery-utils.ts'
import {
  buildVenuesHref,
  clearSingleVenueFilter,
  parseVenuesSearchParams,
  PUBS_BARS_KEY,
  sanitizeVenueSearchQuery,
  venueCategoryLabel,
  venueTypesForFilter,
} from '../components/venues/venues-discovery-utils.ts'

test('favourites snapshot from an older session cannot overwrite the current one across login -> logout -> login', () => {
  // Initial login (generation 1)
  assert.equal(shouldCommitFavoritesSnapshot(1, 1), true)
  // User logs out (generation 2): stale generation 1 fetch cannot commit
  assert.equal(shouldCommitFavoritesSnapshot(1, 2), false)
  assert.equal(shouldCommitFavoritesSnapshot(2, 2), true)
  // Second user logs in (generation 3): neither gen 1 nor gen 2 can commit
  assert.equal(shouldCommitFavoritesSnapshot(1, 3), false)
  assert.equal(shouldCommitFavoritesSnapshot(2, 3), false)
  assert.equal(shouldCommitFavoritesSnapshot(3, 3), true)
})

test('Irish daylight-saving boundaries use Europe/Dublin offsets', () => {
  const winterNoon = dublinWallTimeToUtc('2026-01-15', 12, 0, 0)
  assert.equal(winterNoon.toISOString(), '2026-01-15T12:00:00.000Z')

  const summerNoon = dublinWallTimeToUtc('2026-07-15', 12, 0, 0)
  assert.equal(summerNoon.toISOString(), '2026-07-15T11:00:00.000Z')

  const beforeSpringForward = dublinWallTimeToUtc('2026-03-29', 0, 30, 0)
  assert.equal(beforeSpringForward.toISOString(), '2026-03-29T00:30:00.000Z')

  const afterSpringForward = dublinWallTimeToUtc('2026-03-29', 2, 30, 0)
  assert.equal(afterSpringForward.toISOString(), '2026-03-29T01:30:00.000Z')

  const beforeFallBack = dublinWallTimeToUtc('2026-10-25', 0, 30, 0)
  assert.equal(beforeFallBack.toISOString(), '2026-10-24T23:30:00.000Z')

  const afterFallBack = dublinWallTimeToUtc('2026-10-25', 2, 30, 0)
  assert.equal(afterFallBack.toISOString(), '2026-10-25T02:30:00.000Z')

  const tonight = resolveDublinDateRangeUtc('tonight', new Date('2026-10-26T22:15:00.000Z'))
  assert.equal(formatDublinDateKey(new Date(tonight.startIso)), '2026-10-26')
  assert.equal(tonight.endIso, dublinWallTimeToUtc('2026-10-26', 23, 59, 59, 999).toISOString())
})

test('event search filters survive a URL round trip', () => {
  const href = buildEventsHref({
    county: 'Cork',
    type: 'live_music',
    genre: 'Traditional Irish',
    date: 'tonight',
    q: 'trad',
    free: false,
    view: 'grid',
  })
  const params = new URLSearchParams(href.split('?')[1])
  const parsed = parseEventsSearchParams(params)
  assert.equal(parsed.county, 'Cork')
  assert.equal(parsed.type, 'live_music')
  assert.equal(parsed.genre, 'Traditional Irish')
  assert.equal(parsed.date, 'tonight')
  assert.equal(parsed.q, 'trad')
  assert.equal(parsed.view, 'grid')
})

test('venue search filters and /venues?types=pub,bar survive a URL round trip', () => {
  // Homepage category deep link: /venues?types=pub,bar
  const pubsBarsParams = new URLSearchParams('types=pub,bar')
  const parsedPubsBars = parseVenuesSearchParams(pubsBarsParams)
  assert.equal(parsedPubsBars.type, PUBS_BARS_KEY)
  assert.equal(parsedPubsBars.county, 'All Ireland')
  assert.deepEqual(venueTypesForFilter(parsedPubsBars.type), ['pub', 'bar'])
  assert.equal(venueCategoryLabel(parsedPubsBars.type), 'Pubs & Bars')

  const rebuiltHref = buildVenuesHref(parsedPubsBars)
  assert.equal(rebuiltHref, '/venues?types=pub%2Cbar')
  const roundTripped = parseVenuesSearchParams(new URLSearchParams(rebuiltHref.split('?')[1]))
  assert.equal(roundTripped.type, PUBS_BARS_KEY)

  // Single type + county + query round-trip
  const singleHref = buildVenuesHref({
    county: 'Galway',
    type: 'live_music_venue',
    q: 'Róisín',
  })
  const parsedSingle = parseVenuesSearchParams(new URLSearchParams(singleHref.split('?')[1]))
  assert.equal(parsedSingle.county, 'Galway')
  assert.equal(parsedSingle.type, 'live_music_venue')
  assert.equal(parsedSingle.q, 'Róisín')
  assert.deepEqual(venueTypesForFilter(parsedSingle.type), ['live_music_venue'])

  // Clear single filter
  const clearedCounty = clearSingleVenueFilter(parsedSingle, 'county')
  assert.equal(clearedCounty.county, 'All Ireland')
  const clearedType = clearSingleVenueFilter(parsedSingle, 'type')
  assert.equal(clearedType.type, 'All')
  const clearedQ = clearSingleVenueFilter(parsedSingle, 'q')
  assert.equal(clearedQ.q, '')

  // Sanitize search query strips PostgREST filter delimiters
  assert.equal(sanitizeVenueSearchQuery('Sin É, (Cork)'), 'Sin É Cork')
})

test('ticket links allow http(s) and reject unsafe schemes', () => {
  assert.equal(safeExternalUrl('javascript:alert(1)'), null)
  assert.equal(safeExternalUrl('data:text/html,hi'), null)
  assert.equal(safeExternalUrl(''), null)
  assert.equal(safeExternalUrl('https://tickets.example/night'), 'https://tickets.example/night')
})

test('directions use stored coordinates and do not invent them', () => {
  assert.match(directionsHref({ latitude: 51.9, longitude: -8.47 }) ?? '', /51\.9/)
  assert.match(directionsHref({ address: 'Paul Street', city: 'Cork', county: 'Cork' }) ?? '', /search\?query=/)
  assert.equal(directionsHref({}), null)
})

test('event structured data omits offers and ratings', () => {
  const json = buildEventJsonLd({
    name: 'Session',
    startDate: '2026-10-26T20:00:00.000Z',
    url: 'https://irishnightlife.ie/events/session',
    venueName: 'Sin É',
    addressLocality: 'Cork',
  })
  assert.ok(json)
  assert.equal('offers' in (json ?? {}), false)
  assert.equal('aggregateRating' in (json ?? {}), false)
  assert.equal(buildEventJsonLd({ name: '', startDate: '2026-10-26T20:00:00.000Z', url: 'https://example.com', venueName: 'Sin É' }), null)
})

test('JSON-LD script serialization escapes HTML-sensitive characters', () => {
  const payload = { name: 'Night </script><script>alert(1)</script>', '@type': 'Event' }
  const html = serializeJsonLd(payload)
  assert.equal(html.includes('</script>'), false)
  assert.equal(html.includes('<'), false)
  assert.equal(html.includes('>'), false)
  assert.ok(html.includes('\\u003c'))
  assert.deepEqual(JSON.parse(html), payload)
})

test('venue structured data maps venue_type and never fabricates ratings, reviews, or opening hours', () => {
  const pubJson = buildVenueJsonLd({
    name: 'Sin É',
    description: 'Traditional music pub on Coburg Street.',
    url: 'https://irishnightlife.ie/venues/sin-e-cork',
    venueType: 'pub',
    priceRange: '€€',
    telephone: '+353214501234',
    streetAddress: '8 Coburg Street',
    addressLocality: 'Cork',
    addressRegion: 'Cork',
    latitude: 51.9018,
    longitude: -8.4685,
  })
  assert.ok(pubJson)
  assert.equal(pubJson['@type'], 'BarOrPub')
  assert.equal(pubJson.name, 'Sin É')
  assert.deepEqual(pubJson.geo, {
    '@type': 'GeoCoordinates',
    latitude: 51.9018,
    longitude: -8.4685,
  })
  assert.equal('aggregateRating' in pubJson, false)
  assert.equal('review' in pubJson, false)
  assert.equal('openingHoursSpecification' in pubJson, false)

  const musicVenueJson = buildVenueJsonLd({
    name: 'Cyprus Avenue',
    url: 'https://irishnightlife.ie/venues/cyprus-avenue',
    venueType: 'live_music_venue',
  })
  assert.ok(musicVenueJson)
  assert.equal(musicVenueJson['@type'], 'MusicVenue')
  assert.equal('geo' in musicVenueJson, false)
  assert.equal(buildVenueJsonLd({ name: '', url: 'https://irishnightlife.ie/venues/x' }), null)
})

test('planner option IDs and URL round-trips preserve exact API contract', () => {
  assert.deepEqual(PLANNER_OPTION_IDS.who, ['solo', 'date', 'friends', 'group', 'tourist'])
  assert.deepEqual(PLANNER_OPTION_IDS.occasion, [
    'none',
    'birthday',
    'hen',
    'stag',
    'anniversary',
    'leaving',
  ])
  assert.deepEqual(PLANNER_OPTION_IDS.vibe, ['chill', 'wild', 'cultural', 'romantic', 'surprise'])
  assert.deepEqual(PLANNER_OPTION_IDS.budget, ['budget', 'moderate', 'splurge'])
  assert.deepEqual(PLANNER_OPTION_IDS.tomorrow, ['nothing', 'early', 'hungover'])

  const choices = {
    who: 'friends',
    occasion: 'birthday',
    vibe: 'wild',
    budget: 'moderate',
    tomorrow: 'nothing',
  }

  assert.equal(isPlannerComplete(choices), true)

  const resultHref = buildPlannerResultHref(choices)
  assert.equal(
    resultHref,
    '/planner/plan?who=friends&occasion=birthday&vibe=wild&budget=moderate&tomorrow=nothing'
  )

  const wizardHref = buildPlannerWizardHref(choices)
  assert.equal(
    wizardHref,
    '/planner?who=friends&occasion=birthday&vibe=wild&budget=moderate&tomorrow=nothing'
  )

  const parsedFromResult = parsePlannerSearchParams(new URLSearchParams(resultHref.split('?')[1]))
  assert.deepEqual(parsedFromResult, choices)
  assert.equal(isPlannerComplete(parsedFromResult), true)

  // Invalid / unknown option IDs are rejected cleanly
  const parsedWithInvalid = parsePlannerSearchParams({
    who: 'friends',
    occasion: 'invalid-occasion',
    vibe: 'chill',
    budget: 'splurge',
    tomorrow: '',
  })
  assert.equal(parsedWithInvalid.who, 'friends')
  assert.equal(parsedWithInvalid.occasion, '')
  assert.equal(parsedWithInvalid.vibe, 'chill')
  assert.equal(parsedWithInvalid.budget, 'splurge')
  assert.equal(parsedWithInvalid.tomorrow, '')
  assert.equal(isPlannerComplete(parsedWithInvalid), false)

  // Planner origin links preserve query parameters and from=planner
  const planQuery = 'who=date&occasion=anniversary&vibe=romantic&budget=splurge&tomorrow=nothing'
  const eventDetailHref = detailHrefFromPlan('/events/jazz-session', planQuery)
  assert.equal(
    eventDetailHref,
    '/events/jazz-session?who=date&occasion=anniversary&vibe=romantic&budget=splurge&tomorrow=nothing&from=planner'
  )

  const detailSearchRecord = Object.fromEntries(
    new URLSearchParams(eventDetailHref.split('?')[1]).entries()
  )
  assert.equal(plannerPlanHref(detailSearchRecord), `/planner/plan?${planQuery}`)
  assert.equal(
    preservePlannerOrigin('/venues/sin-e-cork', detailSearchRecord),
    `/venues/sin-e-cork?${planQuery}&from=planner`
  )
})

test('planner itinerary summarize, sort, swap, and shuffle utilities work deterministically', () => {
  const stopEarly = {
    event: {
      id: 'ev-1',
      start_time: '2026-10-26T19:00:00.000Z',
      end_time: '2026-10-26T21:00:00.000Z',
      is_free: true,
      price_min: 0,
      venues: { id: 'venue-1' },
    },
    reasons: ['Fits your budget'],
  }
  const stopLate = {
    event: {
      id: 'ev-2',
      start_time: '2026-10-26T21:30:00.000Z',
      end_time: '2026-10-26T23:30:00.000Z',
      is_free: false,
      price_min: 15,
      venues: { id: 'venue-2' },
    },
    reasons: ['Great live music'],
  }
  const alternateSameVenue = {
    event: {
      id: 'ev-3',
      start_time: '2026-10-26T20:00:00.000Z',
      end_time: '2026-10-26T22:00:00.000Z',
      is_free: false,
      price_min: 10,
      venues: { id: 'venue-2' },
    },
    reasons: ['Same venue as stop 2'],
  }
  const alternateNewVenue = {
    event: {
      id: 'ev-4',
      start_time: '2026-10-26T18:00:00.000Z',
      end_time: '2026-10-26T20:00:00.000Z',
      is_free: false,
      price_min: 20,
      venues: { id: 'venue-3' },
    },
    reasons: ['Fresh venue'],
  }

  const sorted = sortStopsByStart([stopLate, stopEarly])
  assert.deepEqual(
    sorted.map(s => s.event.id),
    ['ev-1', 'ev-2']
  )

  const summary = summarizeEvents(sorted.map(s => s.event))
  assert.equal(summary.total_cost, '€15+')
  assert.equal(summary.estimated_duration, '5 hours')

  const catalog = [stopEarly, stopLate, alternateSameVenue, alternateNewVenue]

  // Swapping stop 0 (venue-1) should skip alternateSameVenue (venue-2 is taken by stop 1) and pick alternateNewVenue (venue-3)
  const altForFirst = bestAlternate(catalog, sorted, 0)
  assert.equal(altForFirst?.event.id, 'ev-4')

  const swapped = swapStop(catalog, sorted, 0)
  assert.ok(swapped)
  assert.deepEqual(
    swapped.map(s => s.event.id),
    ['ev-4', 'ev-2']
  )

  assert.equal(canShuffleStops(catalog, sorted), true)
  const shuffled = shuffleStops(catalog, sorted)
  assert.equal(shuffled.length, 3)
})

test('mobile navigation visibility rules hide dashboard, admin, and auth routes', () => {
  assert.equal(MOBILE_NAV_ITEMS.length, 5)
  assert.deepEqual(
    MOBILE_NAV_ITEMS.map((item) => ({ label: item.label, href: item.href })),
    [
      { label: 'Home', href: '/' },
      { label: 'Events', href: '/events' },
      { label: 'Explore', href: '/venues' },
      { label: 'Planner', href: '/planner' },
      { label: 'Profile', href: '/profile' },
    ]
  )

  // Consumer routes show MobileNav
  assert.equal(shouldShowMobileNav('/'), true)
  assert.equal(shouldShowMobileNav('/events'), true)
  assert.equal(shouldShowMobileNav('/events/ceili-by-the-lee'), true)
  assert.equal(shouldShowMobileNav('/venues'), true)
  assert.equal(shouldShowMobileNav('/venues/crane-lane-theatre'), true)
  assert.equal(shouldShowMobileNav('/planner'), true)
  assert.equal(shouldShowMobileNav('/planner/plan'), true)
  assert.equal(shouldShowMobileNav('/profile'), true)
  assert.equal(shouldShowMobileNav('/for-venues'), true)

  // Dashboard, admin, and auth routes hide MobileNav
  assert.equal(shouldShowMobileNav('/dashboard'), false)
  assert.equal(shouldShowMobileNav('/dashboard/'), false)
  assert.equal(shouldShowMobileNav('/dashboard/events'), false)
  assert.equal(shouldShowMobileNav('/dashboard/events/new'), false)
  assert.equal(shouldShowMobileNav('/dashboard/profile'), false)
  assert.equal(shouldShowMobileNav('/admin'), false)
  assert.equal(shouldShowMobileNav('/admin/users'), false)
  assert.equal(shouldShowMobileNav('/auth/login'), false)
  assert.equal(shouldShowMobileNav('/auth/signup'), false)
  assert.equal(shouldShowMobileNav('/auth/complete-venue'), false)
  assert.equal(shouldShowMobileNav('/auth/callback'), false)
})

test('mobile navigation active route matching and profile auth redirect compatibility', () => {
  // Home is only active at '/'
  assert.equal(activeMobileNavHref('/'), '/')
  assert.equal(isMobileNavItemActive('/events', '/'), false)

  // Nested consumer routes match their parent tab
  assert.equal(activeMobileNavHref('/events'), '/events')
  assert.equal(activeMobileNavHref('/events/ceili-by-the-lee'), '/events')
  assert.equal(activeMobileNavHref('/venues'), '/venues')
  assert.equal(activeMobileNavHref('/venues/crane-lane-theatre'), '/venues')
  assert.equal(activeMobileNavHref('/planner'), '/planner')
  assert.equal(activeMobileNavHref('/planner/plan'), '/planner')
  assert.equal(activeMobileNavHref('/profile'), '/profile')

  // Unmatched consumer route (/for-venues) shows bar with no active tab
  assert.equal(activeMobileNavHref('/for-venues'), null)

  // Auth routes never highlight Profile
  assert.equal(isMobileNavItemActive('/auth/login', '/profile'), false)
  assert.equal(activeMobileNavHref('/auth/login'), null)

  // Profile redirect to /auth/login?next=/profile preserves intended return destination
  assert.equal(safeNextPath('/profile'), '/profile')
  assert.equal(pathAfterSignIn('consumer', safeNextPath('/profile')), '/profile')
  assert.equal(pathAfterSignIn('venue_owner', safeNextPath('/profile')), '/dashboard')
})

test('dashboard navigation items and active route matching distinguish /dashboard/events from /dashboard/events/new', () => {
  assert.deepEqual(
    DASHBOARD_NAV_ITEMS.map((item) => ({ label: item.label, href: item.href })),
    [
      { label: 'Overview', href: '/dashboard' },
      { label: 'Events', href: '/dashboard/events' },
      { label: 'Add Event', href: '/dashboard/events/new' },
      { label: 'Venue Profile', href: '/dashboard/profile' },
    ]
  )

  // /dashboard only matches exact /dashboard
  assert.equal(isDashboardNavItemActive('/dashboard', '/dashboard'), true)
  assert.equal(isDashboardNavItemActive('/dashboard/', '/dashboard'), true)
  assert.equal(isDashboardNavItemActive('/dashboard/events', '/dashboard'), false)
  assert.equal(isDashboardNavItemActive('/dashboard/profile', '/dashboard'), false)

  // /dashboard/events matches /dashboard/events, NOT /dashboard/events/new
  assert.equal(isDashboardNavItemActive('/dashboard/events', '/dashboard/events'), true)
  assert.equal(isDashboardNavItemActive('/dashboard/events/new', '/dashboard/events'), false)
  assert.equal(isDashboardNavItemActive('/dashboard/events/new', '/dashboard/events/new'), true)
  assert.equal(
    isDashboardNavItemActive('/dashboard/events/new?venue=123', '/dashboard/events/new'),
    true
  )

  // /dashboard/profile matches /dashboard/profile
  assert.equal(isDashboardNavItemActive('/dashboard/profile', '/dashboard/profile'), true)
  assert.equal(isDashboardNavItemActive('/dashboard/events', '/dashboard/profile'), false)

  // Empty or consumer paths never highlight dashboard items
  assert.equal(isDashboardNavItemActive('', '/dashboard'), false)
  assert.equal(isDashboardNavItemActive('/', '/dashboard'), false)
  assert.equal(isDashboardNavItemActive('/events', '/dashboard/events'), false)
})

test('computeDashboardEventMetrics partitions upcoming and earlier events and counts published vs drafts', () => {
  const nowIso = '2026-10-26T20:00:00.000Z'
  const events = [
    { id: 'past-1', start_time: '2026-10-20T19:00:00.000Z', is_published: true },
    { id: 'past-2', start_time: '2026-10-25T21:00:00.000Z', is_published: false },
    { id: 'future-2', start_time: '2026-10-28T21:00:00.000Z', is_published: false },
    { id: 'future-1', start_time: '2026-10-26T20:00:00.000Z', is_published: true },
  ]

  const metrics = computeDashboardEventMetrics(events, nowIso)
  assert.equal(metrics.total, 4)
  assert.equal(metrics.upcomingCount, 2)
  assert.equal(metrics.earlierCount, 2)
  assert.equal(metrics.publishedCount, 2)
  assert.equal(metrics.draftCount, 2)

  // Upcoming sorted ascending by start_time
  assert.deepEqual(
    metrics.upcoming.map((e) => e.id),
    ['future-1', 'future-2']
  )
  // Earlier sorted descending (most recent first)
  assert.deepEqual(
    metrics.earlier.map((e) => e.id),
    ['past-2', 'past-1']
  )

  const empty = computeDashboardEventMetrics([], nowIso)
  assert.equal(empty.total, 0)
  assert.equal(empty.upcomingCount, 0)
  assert.equal(empty.draftCount, 0)
  assert.equal(formatDashboardDateTime('not-a-date'), '')
})

test('validateCreateEventInput enforces template, time, pricing, ticket URL, and venue verification rules', () => {
  const validBase = {
    about: ' lively pub in Cork ',
    venueType: 'pub',
    priceRange: '€€',
    title: ' Friday Trad Session ',
    startTime: '2026-10-30T20:00:00.000Z',
    endTime: '2026-10-30T23:00:00.000Z',
    isFree: false,
    priceMin: '10',
    priceMax: '15',
    ticketUrl: 'https://tickets.example.ie/trad',
    isVerified: true,
  }

  const validResult = validateCreateEventInput(validBase)
  assert.equal(validResult.ok, true)
  if (validResult.ok) {
    assert.equal(validResult.aboutText, 'lively pub in Cork')
    assert.equal(validResult.titleText, 'Friday Trad Session')
    assert.equal(validResult.minPrice, 10)
    assert.equal(validResult.maxPrice, 15)
    assert.equal(validResult.normalizedTicketUrl, 'https://tickets.example.ie/trad')
  }

  // Blank ticketUrl is allowed and normalized to null
  const blankTicket = validateCreateEventInput({ ...validBase, ticketUrl: '   ' })
  assert.equal(blankTicket.ok, true)
  if (blankTicket.ok) {
    assert.equal(blankTicket.normalizedTicketUrl, null)
  }

  // Unsafe javascript: ticketUrl is rejected
  const unsafeTicket = validateCreateEventInput({
    ...validBase,
    ticketUrl: 'javascript:alert(1)',
  })
  assert.deepEqual(unsafeTicket, {
    ok: false,
    error: 'Enter a valid http:// or https:// ticket link, or leave it blank.',
  })

  // Missing venue template fields
  assert.deepEqual(validateCreateEventInput({ ...validBase, about: '  ' }), {
    ok: false,
    error: 'The event template needs the venue type, price range, and a section about the venue.',
  })

  // Missing title or start time
  assert.deepEqual(validateCreateEventInput({ ...validBase, title: '' }), {
    ok: false,
    error: 'Add an event title and a start time.',
  })

  // End time before or equal to start time
  assert.deepEqual(
    validateCreateEventInput({
      ...validBase,
      endTime: '2026-10-30T19:00:00.000Z',
    }),
    {
      ok: false,
      error: 'The end time has to be after the start time.',
    }
  )

  // Paid event missing priceMin
  assert.deepEqual(
    validateCreateEventInput({
      ...validBase,
      isFree: false,
      priceMin: '',
    }),
    {
      ok: false,
      error: 'Enter a ticket price, or mark the event as free.',
    }
  )

  // Paid event with priceMax < priceMin
  assert.deepEqual(
    validateCreateEventInput({
      ...validBase,
      isFree: false,
      priceMin: '20',
      priceMax: '10',
    }),
    {
      ok: false,
      error: 'The top price has to be at least the starting price.',
    }
  )

  // Unverified venue rejected with AWAITING_APPROVAL_MESSAGE
  assert.deepEqual(
    validateCreateEventInput({
      ...validBase,
      isVerified: false,
    }),
    {
      ok: false,
      error: AWAITING_APPROVAL_MESSAGE,
    }
  )

  // Free events zero the minimum and drop the optional max
  const freeResult = validateCreateEventInput({
    ...validBase,
    isFree: true,
    priceMin: '',
    priceMax: '99',
  })
  assert.equal(freeResult.ok, true)
  if (freeResult.ok) {
    assert.equal(freeResult.minPrice, 0)
    assert.equal(freeResult.maxPrice, null)
  }

  // ftp and malformed ticket URLs are rejected
  assert.deepEqual(
    validateCreateEventInput({
      ...validBase,
      ticketUrl: 'ftp://files.example.com/tix',
    }),
    {
      ok: false,
      error: 'Enter a valid http:// or https:// ticket link, or leave it blank.',
    }
  )

  assert.ok(DASHBOARD_GENERIC_LOAD_ERROR.length > 0)
  assert.ok(DASHBOARD_GENERIC_SAVE_ERROR.length > 0)
  assert.ok(DASHBOARD_GENERIC_CREATE_ERROR.length > 0)
  assert.ok(DASHBOARD_GENERIC_UPLOAD_ERROR.length > 0)
})

test('validateVenueProfileInput and isVenueProfileComplete validate venue profile fields', () => {
  assert.deepEqual(
    validateVenueProfileInput({
      description: '  Great live music bar  ',
      venueType: 'bar',
      priceRange: '€€',
    }),
    {
      ok: true,
      description: 'Great live music bar',
    }
  )

  assert.deepEqual(
    validateVenueProfileInput({
      description: '   ',
      venueType: 'bar',
      priceRange: '€€',
    }),
    {
      ok: false,
      error: 'Add a short description, a venue type, and a price range.',
    }
  )

  const incomplete = isVenueProfileComplete({
    description: '',
    venue_type: 'pub',
    price_range: null,
    images: [],
  })
  assert.equal(incomplete.complete, false)
  assert.deepEqual(incomplete.missing, ['About description', 'Price range', 'Venue photos'])

  const complete = isVenueProfileComplete({
    description: 'Traditional music every night.',
    venue_type: 'pub',
    price_range: '€€',
    images: ['https://example.com/photo1.jpg'],
  })
  assert.equal(complete.complete, true)
  assert.deepEqual(complete.missing, [])
})

test('dashboard and admin next paths stay on-site and venue owners always land on the dashboard after sign-in', () => {
  assert.equal(safeNextPath('/dashboard'), '/dashboard')
  assert.equal(safeNextPath('/dashboard/events/new'), '/dashboard/events/new')
  assert.equal(safeNextPath('/dashboard/profile'), '/dashboard/profile')
  assert.equal(safeNextPath('//evil.example/dashboard'), '/')
  assert.equal(safeNextPath('https://evil.example/dashboard'), '/')

  assert.equal(pathAfterSignIn('venue_owner', '/events'), '/dashboard')
  assert.equal(pathAfterSignIn('venue_owner', '/dashboard/events'), '/dashboard')
  assert.equal(pathAfterSignIn('consumer', '/dashboard'), '/dashboard')
  assert.equal(pathAfterSignIn('admin', '/dashboard'), '/dashboard')
})


