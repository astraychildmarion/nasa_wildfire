import { createAreaOfInterest, type AOIDimensions } from '../fire-map/aoi'
import type { AreaOfInterest, GeographicPoint } from '../../shared/types'

export const HOME_DEMO_POINT: GeographicPoint = {
  latitude: 42.315189299045294,
  longitude: -117.67532283588565,
}

export function createHomeDemoAreaOfInterest(dimensions: AOIDimensions): AreaOfInterest {
  return createAreaOfInterest(HOME_DEMO_POINT, dimensions)
}
