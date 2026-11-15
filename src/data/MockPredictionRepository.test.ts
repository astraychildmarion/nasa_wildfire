import { describe, expect, it } from 'vitest'
import { MockPredictionRepository, createMockDailyForecast, createMockPredictionDashboard } from './MockPredictionRepository'
import { TEST_AOI } from './mockHistoricalData'

const query = { aoi: TEST_AOI, sensorMode: 'harmonized' as const, forecastMonths: 12 }
const dailyQuery = { aoi: TEST_AOI, asOf: '2026-11-07', days: 7 as const }

describe('MockPredictionRepository daily forecast', () => {
  it('returns one regional summary and four grid cells for each requested day', async () => {
    const data = await new MockPredictionRepository().getDailyForecast(dailyQuery)

    expect(data.region).toHaveLength(7)
    expect(data.items).toHaveLength(28)
    expect(data.region[0].date).toBe('2026-11-08')
    expect(data.region.at(-1)?.date).toBe('2026-11-14')
  })

  it('uses probability ratios without describing them as ignition probability', () => {
    const data = createMockDailyForecast({ ...dailyQuery, days: 1 })

    for (const item of data.items) {
      expect(item.probability).toBeGreaterThanOrEqual(0)
      expect(item.probability).toBeLessThanOrEqual(1)
      expect(item.climatologyProbability).toBeGreaterThanOrEqual(0)
      expect(item.observed).toBeNull()
      expect(item.anomaly).toBeCloseTo(item.probability / item.climatologyProbability, 2)
    }
  })

  it('is deterministic, AOI-relative, and explicitly marked as mock data', () => {
    const first = createMockDailyForecast(dailyQuery)
    const second = createMockDailyForecast(dailyQuery)

    expect(first).toEqual(second)
    expect(first.source).toBe('mock')
    expect(first.isMock).toBe(true)
    expect(first.items[0].latitude).toBe(TEST_AOI.centre.latitude - 0.25)
    expect(first.items[0].longitude).toBe(TEST_AOI.centre.longitude - 0.25)
  })
})

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

