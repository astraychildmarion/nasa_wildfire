import type { CalendarMode, MonthlyActivity, SensorMode } from '../types'

export interface BaselinePeriod {
  startYear: number
  endYear: number
}

export interface ActivityDifference {
  absolute: number | null
  percentage: number | null
}

export interface CalendarCell extends ActivityDifference {
  year: number
  month: number
  value: number | null
  complete: boolean
  baselineMedian: number | null
  displayValue: number | null
}

export function getSensorValue(
  activity: MonthlyActivity,
  sensor: SensorMode,
): number | null {
  return activity[sensor]
}

export function calculateMedian(values: readonly (number | null | undefined)[]): number | null {
  const validValues = values
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))
    .sort((left, right) => left - right)

  if (validValues.length === 0) return null

  const middle = Math.floor(validValues.length / 2)
  return validValues.length % 2 === 0
    ? (validValues[middle - 1] + validValues[middle]) / 2
    : validValues[middle]
}

export function calculateHistoricalSameMonthMedian(
  records: readonly MonthlyActivity[],
  month: number,
  sensor: SensorMode,
  baseline: BaselinePeriod,
  comparisonYear?: number,
): number | null {
  return calculateMedian(
    records
      .filter((record) => record.month === month
        && record.year >= baseline.startYear
        && record.year <= baseline.endYear
        && record.year !== comparisonYear
        && record.complete)
      .map((record) => getSensorValue(record, sensor)),
  )
}

export function calculateDifferences(
  value: number | null,
  baseline: number | null,
): ActivityDifference {
  if (value === null || baseline === null) {
    return { absolute: null, percentage: null }
  }

  const absolute = value - baseline
  return {
    absolute,
    percentage: baseline === 0 ? null : (absolute / baseline) * 100,
  }
}

export function prepareCalendarCells(
  records: readonly MonthlyActivity[],
  sensor: SensorMode,
  mode: CalendarMode,
  baseline: BaselinePeriod,
): CalendarCell[] {
  return [...records]
    .sort((left, right) => left.year - right.year || left.month - right.month)
    .map((record) => {
      const value = record.complete ? getSensorValue(record, sensor) : null
      const baselineMedian = calculateHistoricalSameMonthMedian(
        records,
        record.month,
        sensor,
        baseline,
        record.year,
      )
      const difference = calculateDifferences(value, baselineMedian)

      return {
        year: record.year,
        month: record.month,
        value,
        complete: record.complete,
        baselineMedian,
        ...difference,
        displayValue: mode === 'activity' ? value : difference.percentage,
      }
    })
}

