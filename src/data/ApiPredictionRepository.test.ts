import { describe, expect, it, vi } from 'vitest'
import { ApiClient } from './apiClient'
import { ApiPredictionRepository } from './ApiPredictionRepository'
import { TEST_AOI } from './mockHistoricalData'

function repositoryFor(body: unknown) {
  const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }))
  return { repository: new ApiPredictionRepository(new ApiClient('https://example.test', fetchImpl)), fetchImpl }
}

describe('ApiPredictionRepository', () => {
  it('requests the monthly outlook with bbox and a bounded month horizon', async () => {
    const response = { coverage: 'inside', cellCount: 313, sensorMode: 'harmonized', unit: 'NOAA-20-equivalent hotspots per month', points: [], risks: [], highRiskMonth: 'August 2027', insights: { nextThreeMonthsChangePercent: null, highRiskPeriod: 'August', longTermTrendPercent: null }, modelConfidence: { scorePercent: null, metric: 'Unavailable', factors: [] }, isMock: false }
    const { repository, fetchImpl } = repositoryFor(response)

    await expect(repository.getPredictionDashboard({ aoi: TEST_AOI, sensorMode: 'harmonized', forecastMonths: 20 })).resolves.toEqual(response)
    expect(fetchImpl.mock.calls[0][0]).toContain('months=12')
    expect(fetchImpl.mock.calls[0][0]).toContain('bbox=-125%2C32%2C-114%2C42')
  })

  it('posts a seven-day bbox request and maps API probability fields', async () => {
    const apiResponse = {
      asOf: '2026-11-14',
      source: 'model-api',
      region: [{ date: '2026-11-15', expectedFireCells: 20.65, pMean: 0.1002, pClimMean: 0.0724, anomaly: 1.38 }],
      items: [{ date: '2026-11-15', cellId: '65_-237', lat: 32.75, lon: -118.25, p: 0.0001, pClim: 0, anomaly: 1.35, observed: null }],
    }
    const { repository, fetchImpl } = repositoryFor(apiResponse)

    const result = await repository.getDailyForecast({ aoi: TEST_AOI, days: 7 })
    expect(result).toMatchObject({ source: 'model-api', isMock: false, region: [{ meanProbability: 0.1002, climatologyMeanProbability: 0.0724 }], items: [{ probability: 0.0001, climatologyProbability: 0 }] })
    expect(JSON.parse(String(fetchImpl.mock.calls[0][1]?.body))).toEqual({ bbox: [-125, 32, -114, 42], days: 7 })
  })
})
