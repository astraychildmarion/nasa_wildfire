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

  it('uses absolute difference as the anomaly display value', () => {
    const cells = prepareCalendarCells(
      records,
      'harmonized',
      'anomaly',
      { startYear: 2019, endYear: 2021 },
    )

    expect(cells.find((cell) => cell.year === 2020 && cell.month === 1)?.displayValue).toBe(10)
  })

  it('uses backend harmonized median and anomaly values when supplied', () => {
    const cells = prepareCalendarCells(
      [{ year: 2024, month: 8, harmonized: 30, modis: 12, viirs: 22, complete: true, median: 10, anomaly: 20, anomalyPercent: 200 }],
      'harmonized',
      'anomaly',
      { startYear: 2019, endYear: 2023 },
    )

    expect(cells[0]).toMatchObject({ baselineMedian: 10, absolute: 20, percentage: 200, displayValue: 20 })
  })

  it('preserves backend null comparisons for incomplete months', () => {
    const cells = prepareCalendarCells(
      [{ year: 2026, month: 11, harmonized: 10, modis: null, viirs: 10, complete: false, median: null, anomaly: null, anomalyPercent: null }],
      'harmonized',
      'anomaly',
      { startYear: 2019, endYear: 2023 },
    )

    expect(cells[0]).toMatchObject({ value: null, baselineMedian: null, absolute: null, percentage: null, displayValue: null })
  })

  it('keeps a backend anomaly when its median is zero without inventing a percentage', () => {
    const cells = prepareCalendarCells(
      [{ year: 2024, month: 2, harmonized: 5, modis: 2, viirs: 3, complete: true, median: 0, anomaly: 5, anomalyPercent: null }],
      'harmonized',
      'anomaly',
      { startYear: 2019, endYear: 2023 },
    )

    expect(cells[0]).toMatchObject({ baselineMedian: 0, absolute: 5, percentage: null, displayValue: 5 })
  })

  it('does not turn a missing historical comparison into zero anomaly', () => {
    const cells = prepareCalendarCells(
      [{ year: 2024, month: 3, harmonized: 9, modis: 4, viirs: 6, complete: true }],
      'harmonized',
      'anomaly',
      { startYear: 2019, endYear: 2023 },
    )

    expect(cells[0]).toMatchObject({ baselineMedian: null, absolute: null, percentage: null, displayValue: null })
  })

  it('keeps an absolute anomaly when the baseline is zero and leaves percentage undefined', () => {
    const cells = prepareCalendarCells(
      [
        { year: 2019, month: 2, harmonized: 0, modis: 0, viirs: 0, complete: true },
        { year: 2024, month: 2, harmonized: 5, modis: 2, viirs: 3, complete: true },
      ],
      'harmonized',
      'anomaly',
      { startYear: 2019, endYear: 2023 },
    )

    expect(cells[1]).toMatchObject({ baselineMedian: 0, absolute: 5, percentage: null, displayValue: 5 })
  })
})


