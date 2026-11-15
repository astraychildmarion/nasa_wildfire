import { describe, expect, it } from 'vitest'
import { createAreaOfInterest, expandAreaOfInterest } from './aoi'

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

describe('expandAreaOfInterest', () => {
  it('creates a configurable query area without modifying the selected AOI', () => {
    const selected = createAreaOfInterest(
      { latitude: 37, longitude: -120 },
      { latitudeSpan: 4, longitudeSpan: 4 },
    )

    expect(expandAreaOfInterest(selected, 3)).toEqual({
      centre: { latitude: 37, longitude: -120 },
      bounds: { north: 40, south: 34, east: -117, west: -123 },
    })
    expect(selected.bounds).toEqual({ north: 39, south: 35, east: -118, west: -122 })
  })

  it('clamps an expanded query area to geographic limits', () => {
    const selected = createAreaOfInterest(
      { latitude: 89, longitude: 179 },
      { latitudeSpan: 1, longitudeSpan: 1 },
    )

    expect(expandAreaOfInterest(selected, 3).bounds).toEqual({
      north: 90,
      south: 86,
      east: 180,
      west: 176,
    })
  })
})

