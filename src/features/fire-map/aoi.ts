import type { AreaOfInterest, GeographicPoint } from '../../shared/types'

export interface AOIDimensions {
  latitudeSpan: number
  longitudeSpan: number
}

export function createAreaOfInterest(
  centre: GeographicPoint,
  dimensions: AOIDimensions,
): AreaOfInterest {
  const halfLatitude = dimensions.latitudeSpan / 2
  const halfLongitude = dimensions.longitudeSpan / 2

  return {
    centre,
    bounds: {
      north: Math.min(90, centre.latitude + halfLatitude),
      south: Math.max(-90, centre.latitude - halfLatitude),
      east: Math.min(180, centre.longitude + halfLongitude),
      west: Math.max(-180, centre.longitude - halfLongitude),
    },
  }
}

export function expandAreaOfInterest(
  aoi: AreaOfInterest,
  radiusDegrees: number,
): AreaOfInterest {
  return createAreaOfInterest(aoi.centre, {
    latitudeSpan: radiusDegrees * 2,
    longitudeSpan: radiusDegrees * 2,
  })
}

