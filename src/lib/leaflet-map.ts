import { Map as LeafletMap, type LatLngExpression } from 'leaflet'

type MapWithContainer = LeafletMap & {
  _containerId?: number
  _container?: HTMLElement & { _leaflet_id?: number }
}

let removeGuarded = false

// Leaflet's map.remove() throws "Map container is being reused by another instance"
// if it runs again after the container was already cleared. Next.js can replay
// map effects while keeping the same DOM node, so removal must be idempotent.
export function guardLeafletRemove(): void {
  if (removeGuarded) return
  removeGuarded = true

  const originalRemove = LeafletMap.prototype.remove
  LeafletMap.prototype.remove = function removeMap() {
    const map = this as MapWithContainer
    const container = map._container
    const containerId = container?._leaflet_id
    const mapId = map._containerId
    if (!container || containerId !== mapId || mapId == null) {
      return this
    }
    return originalRemove.call(this)
  }
}

guardLeafletRemove()

export function syncLeafletView(
  map: LeafletMap,
  center: LatLngExpression,
  zoom: number,
): boolean {
  const instance = map as MapWithContainer
  const container = instance.getContainer() as (HTMLElement & { _leaflet_id?: number }) | undefined
  if (!container || container._leaflet_id !== instance._containerId || instance._containerId == null || !instance.getPane('mapPane')) {
    return false
  }

  if (instance.getZoom() !== zoom || !instance.getCenter().equals(center)) {
    instance.setView(center, zoom, { animate: false })
  }
  return true
}
