import { describe, expect, it, vi } from 'vitest'
import { ApiClient } from './apiClient'
import { ApiHistoricalWildfireRepository } from './ApiHistoricalWildfireRepository'
import { TEST_AOI } from './mockHistoricalData'

function repositoryFor(body: unknown) {
  const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }))
  return { repository: new ApiHistoricalWildfireRepository(new ApiClient('https://example.test', fetchImpl)), fetchImpl }
}

describe('ApiHistoricalWildfireRepository', () => {
  it('maps real activity records and requests bbox in API order', async () => {
    const { repository, fetchImpl } = repositoryFor({ coverage: 'inside', cellCount: 313, records: [{ year: 2000, month: 11, harmonized: 2415.4, modis: null, viirs: null, complete: true, dailyMean: 80.51, median: 2000, anomaly: 415.4, anomalyPercent: 20.77, source: 'MODISxk' }] })

    await expect(repository.getMonthlyActivity(TEST_AOI)).resolves.toEqual({ coverage: 'inside', cellCount: 313, records: [{ year: 2000, month: 11, harmonized: 2415.4, modis: null, viirs: null, complete: true, dailyMean: 80.51, median: 2000, anomaly: 415.4, anomalyPercent: 20.77, source: 'MODISxk' }] })
    expect(fetchImpl.mock.calls[0][0]).toContain('bbox=-125%2C32%2C-114%2C42')
  })

  it('preserves null backend comparisons for an incomplete month', async () => {
    const { repository } = repositoryFor({ coverage: 'inside', cellCount: 1, records: [{ year: 2026, month: 11, harmonized: 10, modis: null, viirs: 10, complete: false, source: 'VIIRS', median: null, anomaly: null, anomalyPercent: null }] })

    await expect(repository.getMonthlyActivity(TEST_AOI)).resolves.toMatchObject({
      records: [{ complete: false, median: null, anomaly: null, anomalyPercent: null }],
    })
  })

  it('preserves outside coverage instead of exposing zero records as observations', async () => {
    const { repository } = repositoryFor({ coverage: 'outside', cellCount: 0, records: [] })

    await expect(repository.getMonthlyActivity(TEST_AOI)).resolves.toEqual({ coverage: 'outside', cellCount: 0, records: [] })
  })

  it('maps calendar summary fields used by the real map panel', async () => {
    const summary = { coverage: 'inside', cellCount: 313, unit: 'NOAA-20-equivalent hotspots per month', latestCompleteMonth: { month: '2026-10', value: 1804, historicalMedian: 3329.9, ratioToMedian: 0.54, percentileRank: 28 }, peakMonth: 8, topYears: [{ year: 2020, total: 224814.5 }], viirsNativeFrom: '2012-02' }
    const { repository } = repositoryFor(summary)

    await expect(repository.getCalendarSummary(TEST_AOI)).resolves.toEqual(summary)
  })

  it('uses backend cell bounds and grid scale metadata without reconstructing corners', async () => {
    const { repository } = repositoryFor({ coverage: 'inside', from: '2026-10', to: '2026-10', unit: 'NOAA-20-equivalent hotspots in range', cellSize: 0.5, maxHotspots: 404, cells: [{ cellId: '65_-235', lat: 32.75, lon: -117.25, bounds: [-117.5, 32.5, -117, 33], hotspots: 1, monthsWithFire: 1 }] })

    await expect(repository.getHistoricalGridCells(TEST_AOI, '2026-10', '2026-10')).resolves.toMatchObject({
      coverage: 'inside',
      maxHotspots: 404,
      cells: [{ cellId: '65_-235', bounds: { west: -117.5, south: 32.5, east: -117, north: 33 }, hotspotCount: 1 }],
    })
  })

  it('keeps an empty inside-coverage grid distinct from outside coverage', async () => {
    const { repository } = repositoryFor({ coverage: 'inside', from: '2026-10', to: '2026-10', unit: 'unit', cellSize: 0.5, maxHotspots: 0, cells: [] })

    await expect(repository.getHistoricalGridCells(TEST_AOI, '2026-10', '2026-10')).resolves.toMatchObject({ coverage: 'inside', cells: [], maxHotspots: 0 })
  })
})
