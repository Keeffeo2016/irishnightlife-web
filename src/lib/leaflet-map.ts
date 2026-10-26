import { Map as LeafletMap, type LatLngExpression } from 'leaflet'

type MapWithContainer = LeafletMap & {
  _containerId?: number
  _container?: HTMLElement & { _leaflet_id?: number }
}

let removeGuarded = false

// react-leaflet removes the map from a useEffect cleanup. React Strict Mode and
// Next.js Activity (cacheComponents) both re-run that cleanup while the container
// is still in the document, then tile layers call appendChild on panes remove()
// already deleted. Skip teardown until the node is actually leaving the document.
// A second remove after a real teardown is also a no-op: Leaflet throws if the
// container was already cleared and then reused.
export function guardLeafletRemove(): void {
  if (removeGuarded) return
  removeGuarded = true

  const originalRemove = LeafletMap.prototype.remove
  LeafletMap.prototype.remove = function removeMap() {
    const map = this as MapWithContainer
    const container = map._container
    if (container?.isConnected) {
      return this
    }
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

  // Activity hides the map with display:none, so the cached page comes back at 0×0.
  instance.invalidateSize({ animate: false })
  if (instance.getZoom() !== zoom || !instance.getCenter().equals(center)) {
    instance.setView(center, zoom, { animate: false })
  }
  return true
}
