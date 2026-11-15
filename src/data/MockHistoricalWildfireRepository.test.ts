import { describe, expect, it } from 'vitest'
import { MockHistoricalWildfireRepository } from './MockHistoricalWildfireRepository'
import { TEST_AOI } from './mockHistoricalData'

describe('MockHistoricalWildfireRepository', () => {
  const repository = new MockHistoricalWildfireRepository()

  it('returns deterministic monthly data across the configured availability period', async () => {
    const firstResult = await repository.getMonthlyActivity(TEST_AOI)
    const secondResult = await repository.getMonthlyActivity(TEST_AOI)
    const first = firstResult.records
    const second = secondResult.records

    expect(first).toEqual(second)
    expect(first).not.toBe(second)
    expect(firstResult).toMatchObject({ coverage: 'inside', cellCount: 1 })
    expect(first.some((record) => record.harmonized === 0 && record.complete)).toBe(true)
    expect(first.some((record) => record.harmonized === null)).toBe(true)
    expect(first.some((record) => !record.complete)).toBe(true)
    expect(first).toHaveLength(325)
    expect(first[0]).toMatchObject({ year: 2000, month: 11 })
    expect(first.at(-1)).toMatchObject({ year: 2027, month: 11, complete: true })
  })

  it('marks an unsupported area as outside coverage instead of returning zero activity', async () => {
    const outside = { centre: { latitude: 52, longitude: -8 }, bounds: { north: 54, south: 50, east: -6, west: -10 } }

    await expect(repository.getMonthlyActivity(outside)).resolves.toEqual({ coverage: 'outside', cellCount: 0, records: [] })
  })

  it('returns deterministic monthly grid cells filtered by inclusive month range and AOI', async () => {
    const first = await repository.getHistoricalGridCells(TEST_AOI, '2024-06', '2024-06')
    const second = await repository.getHistoricalGridCells(TEST_AOI, '2024-06', '2024-06')

    expect(first).toEqual(second)
    expect(first).not.toBe(second)
    expect(first.cells).toHaveLength(2)
    expect(first.from).toBe('2024-06')
    expect(first.to).toBe('2024-06')
  })

  it('preserves decimal values and explicit partial-month status', async () => {
    const { cells } = await repository.getHistoricalGridCells(TEST_AOI, '2023-01', '2024-12')

    expect(cells.some((cell) => !Number.isInteger(cell.hotspotCount))).toBe(true)
    expect(cells.every((cell) => cell.bounds.east - cell.bounds.west === 0.5)).toBe(true)
  })

  it('does not return cells outside the selected AOI', async () => {
    const smallAoi = {
      centre: { latitude: 40, longitude: -122 },
      bounds: { north: 40.5, south: 39.5, east: -121.5, west: -122.5 },
    }

    await expect(repository.getHistoricalGridCells(smallAoi, '2023-01', '2024-12')).resolves.toMatchObject({ cells: [] })
  })
})

