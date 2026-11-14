import { describe, expect, it } from 'vitest'
import { MockPredictionRepository, createMockPredictionDashboard } from './MockPredictionRepository'
import { TEST_AOI } from './mockHistoricalData'

const query = { aoi: TEST_AOI, sensorMode: 'harmonized' as const, forecastMonths: 12 }

describe('MockPredictionRepository', () => {
  it('returns the expected historical and forecast periods', async () => {
    const data = await new MockPredictionRepository().getPredictionDashboard(query)
    const historical = data.points.filter((point) => point.phase === 'historical')
    const forecast = data.points.filter((point) => point.phase === 'forecast')

    expect(historical).toHaveLength(26 * 12)
    expect(forecast).toHaveLength(12)
    expect(historical[0].month).toBe('2001-01')
    expect(historical.at(-1)?.month).toBe('2026-12')
    expect(forecast[0].month).toBe('2027-01')
    expect(forecast.at(-1)?.month).toBe('2027-12')
  })

  it('keeps historical observations and forecast intervals separate', () => {
    const data = createMockPredictionDashboard(query)
    const historical = data.points[0]
    const forecast = data.points.at(-1)

    expect(historical).toMatchObject({ phase: 'historical', observed: expect.any(Number), forecastMedian: null })
    expect(forecast).toMatchObject({ phase: 'forecast', observed: null })
    expect(forecast?.lower95).toBeLessThan(forecast?.lower80 ?? Infinity)
    expect(forecast?.lower80).toBeLessThan(forecast?.forecastMedian ?? Infinity)
    expect(forecast?.forecastMedian).toBeLessThan(forecast?.upper80 ?? -Infinity)
    expect(forecast?.upper80).toBeLessThan(forecast?.upper95 ?? -Infinity)
  })

  it('is deterministic and returns the requested sensor mode', () => {
    const first = createMockPredictionDashboard(query)
    const second = createMockPredictionDashboard({ ...query, sensorMode: 'viirs' })

    expect(first).toEqual(createMockPredictionDashboard(query))
    expect(first.sensorMode).toBe('harmonized')
    expect(second.sensorMode).toBe('viirs')
    expect(first.isMock).toBe(true)
  })

  it('provides risk, insight, and confidence output for the dashboard', () => {
    const data = createMockPredictionDashboard(query)

    expect(data.risks).toHaveLength(12)
    expect(data.risks.find((risk) => risk.month === '2027-08')?.level).toBe('extreme')
    expect(data.highRiskMonth).toBe('August 2027')
    expect(data.insights.nextThreeMonthsChangePercent).toBe(32)
    expect(data.modelConfidence.scorePercent).toBe(87)
    expect(data.modelConfidence.factors).toHaveLength(3)
  })

  it('clamps an invalid forecast horizon to a usable mock range', () => {
    expect(createMockPredictionDashboard({ ...query, forecastMonths: 40 }).risks).toHaveLength(12)
    expect(createMockPredictionDashboard({ ...query, forecastMonths: 0 }).risks).toHaveLength(1)
  })
})

