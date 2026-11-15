import { describe, expect, it } from 'vitest'
import { createHomeDemoAreaOfInterest, HOME_DEMO_POINT } from './demoLocation'

describe('createHomeDemoAreaOfInterest', () => {
  it('creates the configured AOI around the fixed presentation location', () => {
    expect(createHomeDemoAreaOfInterest({ latitudeSpan: 4, longitudeSpan: 4 })).toEqual({
      centre: HOME_DEMO_POINT,
      bounds: {
        north: 44.315189299045294,
        south: 40.315189299045294,
        east: -115.67532283588565,
        west: -119.67532283588565,
      },
    })
  })
})
