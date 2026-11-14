import { describe, expect, it } from 'vitest'
import type { MonthlyActivity } from '../types'
import {
  calculateDifferences,
  calculateHistoricalSameMonthMedian,
  calculateMedian,
  getSensorValue,
  prepareCalendarCells,
} from './historicalActivity'

const records: MonthlyActivity[] = [
  { year: 2019, month: 1, harmonized: 10, modis: 4, viirs: 7, complete: true },
  { year: 2020, month: 1, harmonized: 20, modis: 8, viirs: 14, complete: true },
  { year: 2021, month: 1, harmonized: null, modis: 12, viirs: 21, complete: true },
  { year: 2022, month: 1, harmonized: 100, modis: 40, viirs: 70, complete: false },
  { year: 2020, month: 2, harmonized: 0, modis: 0, viirs: 0, complete: true },
]

describe('historical activity analytics', () => {
  it('extracts the requested sensor value and preserves missing values', () => {
    expect(getSensorValue(records[0], 'modis')).toBe(4)
    expect(getSensorValue(records[2], 'harmonized')).toBeNull()
  })

  it('calculates medians from finite observations only', () => {
    expect(calculateMedian([3, null, 1, Number.NaN, 2])).toBe(2)
    expect(calculateMedian([4, 2, undefined, 8, 6])).toBe(5)
    expect(calculateMedian([null, undefined])).toBeNull()
  })

  it('uses complete, non-missing same-month values inside the baseline', () => {
    expect(calculateHistoricalSameMonthMedian(
      records,
      1,
      'harmonized',
      { startYear: 2019, endYear: 2022 },
    )).toBe(15)
  })

  it('excludes the comparison year when it is inside the baseline', () => {
    expect(calculateHistoricalSameMonthMedian(
      records,
      1,
      'harmonized',
      { startYear: 2019, endYear: 2021 },
      2020,
    )).toBe(10)
  })

  it('calculates absolute and percentage differences safely', () => {
    expect(calculateDifferences(15, 10)).toEqual({ absolute: 5, percentage: 50 })
    expect(calculateDifferences(5, 0)).toEqual({ absolute: 5, percentage: null })
    expect(calculateDifferences(null, 10)).toEqual({ absolute: null, percentage: null })
  })

  it('prepares sorted activity cells while keeping zero distinct from missing', () => {
    const cells = prepareCalendarCells(
      [records[4], records[3], records[0]],
      'harmonized',
      'activity',
      { startYear: 2019, endYear: 2022 },
    )

    expect(cells.map(({ year, month }) => [year, month])).toEqual([
      [2019, 1],
      [2020, 2],
      [2022, 1],
    ])
    expect(cells[1].displayValue).toBe(0)
    expect(cells[2].value).toBeNull()
    expect(cells[2].displayValue).toBeNull()
  })

  it('uses percentage difference as the anomaly display value', () => {
    const cells = prepareCalendarCells(
      records,
      'harmonized',
      'anomaly',
      { startYear: 2019, endYear: 2021 },
    )

    expect(cells.find((cell) => cell.year === 2020 && cell.month === 1)?.displayValue).toBe(100)
  })
})

