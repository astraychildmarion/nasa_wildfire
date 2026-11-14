import { describe, expect, it } from 'vitest'
import { MockHistoricalWildfireRepository } from './MockHistoricalWildfireRepository'
import { TEST_AOI } from './mockHistoricalData'

describe('MockHistoricalWildfireRepository', () => {
  const repository = new MockHistoricalWildfireRepository()

  it('returns deterministic monthly data with zero, missing, and incomplete records', async () => {
    const first = await repository.getMonthlyActivity(TEST_AOI)
    const second = await repository.getMonthlyActivity(TEST_AOI)

    expect(first).toEqual(second)
    expect(first).not.toBe(second)
    expect(first.some((record) => record.harmonized === 0 && record.complete)).toBe(true)
    expect(first.some((record) => record.harmonized === null)).toBe(true)
    expect(first.some((record) => !record.complete)).toBe(true)
  })

  it('filters hotspots independently by AOI and inclusive date range', async () => {
    const hotspots = await repository.getHotspots(
      TEST_AOI,
      new Date('2023-01-01T00:00:00Z'),
      new Date('2023-12-31T23:59:59Z'),
    )

    expect(hotspots).toHaveLength(2)
    expect(hotspots.every((hotspot) => hotspot.detectedAt.startsWith('2023-'))).toBe(true)
  })
})

