import assert from 'node:assert/strict'
import test from 'node:test'
import { DARK_MAP_CLASS, MAP_TILE_ATTRIBUTION, MAP_TILE_URL } from './map-tiles.ts'

test('map tiles stay on OpenStreetMap until CARTO terms are accepted', () => {
  assert.match(MAP_TILE_URL, /tile\.openstreetmap\.org/)
  assert.doesNotMatch(MAP_TILE_URL, /carto/i)
  assert.match(MAP_TILE_ATTRIBUTION, /OpenStreetMap/)
  assert.equal(DARK_MAP_CLASS, 'dark-map-tiles')
})
