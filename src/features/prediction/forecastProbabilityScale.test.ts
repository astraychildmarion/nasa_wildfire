import { describe, expect, it } from 'vitest'
import { FORECAST_PROBABILITY_BANDS, UNAVAILABLE_PROBABILITY_COLOUR, forecastProbabilityColour } from './forecastProbabilityScale'

describe('forecastProbabilityColour', () => {
  it.each([
    [0, FORECAST_PROBABILITY_BANDS[0].colour],
    [0.049, FORECAST_PROBABILITY_BANDS[0].colour],
    [0.05, FORECAST_PROBABILITY_BANDS[1].colour],
    [0.1, FORECAST_PROBABILITY_BANDS[2].colour],
    [0.2, FORECAST_PROBABILITY_BANDS[3].colour],
    [0.4, FORECAST_PROBABILITY_BANDS[4].colour],
  ])('maps probability %s to its fixed band', (probability, colour) => {
    expect(forecastProbabilityColour(probability)).toBe(colour)
  })

  it('uses unavailable styling for missing or invalid values', () => {
    expect(forecastProbabilityColour(null)).toBe(UNAVAILABLE_PROBABILITY_COLOUR)
    expect(forecastProbabilityColour(Number.NaN)).toBe(UNAVAILABLE_PROBABILITY_COLOUR)
  })
})
