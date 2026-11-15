import { describe, expect, it } from 'vitest'
import type { MonthlyActivity } from '../types'
import { clampMonthRange, getLatestCompleteMonthRange, getUtcMonthDateRange, isMonthInRange } from './months'

const record = (year: number, month: number, complete = true): MonthlyActivity => ({
  year, month, complete, harmonized: 1, modis: 1, viirs: 1,
})

describe('month utilities', () => {
  it('derives a range from the latest complete records without treating the latest month as complete', () => {
    expect(getLatestCompleteMonthRange([
      record(2023, 11), record(2023, 12), record(2024, 1), record(2024, 2, false),
    ], 2)).toEqual({ start: '2023-12', end: '2024-01' })
  })

  it('uses inclusive month ranges', () => {
    const range = { start: '2023-12', end: '2024-02' }
    expect(isMonthInRange('2023-12', range)).toBe(true)
    expect(isMonthInRange('2024-02', range)).toBe(true)
    expect(isMonthInRange('2024-03', range)).toBe(false)
  })

  it('clamps a requested range to the available months', () => {
    expect(clampMonthRange(
      { start: '2011-11', end: '2025-11' },
      { start: '2012-02', end: '2024-10' },
    )).toEqual({ start: '2012-02', end: '2024-10' })
    expect(clampMonthRange(
      { start: '1990-01', end: '1991-01' },
      { start: '2012-02', end: '2024-10' },
    )).toBeNull()
  })

  it('creates an inclusive UTC date range for a selected month', () => {
    const range = getUtcMonthDateRange('2024-02')
    expect(range.start.toISOString()).toBe('2024-02-01T00:00:00.000Z')
    expect(range.end.toISOString()).toBe('2024-02-29T23:59:59.999Z')
  })
})

