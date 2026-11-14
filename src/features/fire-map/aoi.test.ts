import { describe, expect, it } from 'vitest'
import { createAreaOfInterest } from './aoi'

describe('createAreaOfInterest', () => {
  it('creates a configured bounding box centred on the selected point', () => {
    expect(createAreaOfInterest(
      { latitude: 45, longitude: -100 },
      { latitudeSpan: 4, longitudeSpan: 6 },
    )).toEqual({
      centre: { latitude: 45, longitude: -100 },
      bounds: { north: 47, south: 43, east: -97, west: -103 },
    })
  })

  it('clamps bounds to valid latitude and longitude limits', () => {
    expect(createAreaOfInterest(
      { latitude: 89, longitude: 179 },
      { latitudeSpan: 4, longitudeSpan: 4 },
    ).bounds).toEqual({ north: 90, south: 87, east: 180, west: 177 })
  })
})

