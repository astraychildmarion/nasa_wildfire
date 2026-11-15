import type { MonthlyActivity } from '../types'

export interface MonthRange {
  start: string
  end: string
}

export function toMonthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function isMonthInRange(month: string, range: MonthRange): boolean {
  return month >= range.start && month <= range.end
}

export function clampMonthRange(
  range: MonthRange,
  available: MonthRange | null,
): MonthRange | null {
  if (!available || range.end < available.start || range.start > available.end) return null
  return {
    start: range.start < available.start ? available.start : range.start,
    end: range.end > available.end ? available.end : range.end,
  }
}

export function getLatestCompleteMonthRange(
  records: readonly MonthlyActivity[],
  count = 12,
): MonthRange | null {
  const completeMonths = records
    .filter((record) => record.complete)
    .map((record) => toMonthKey(record.year, record.month))
    .sort()
    .slice(-count)

  if (completeMonths.length === 0) return null
  return { start: completeMonths[0], end: completeMonths[completeMonths.length - 1] }
}

export function getUtcMonthDateRange(monthKey: string): { start: Date; end: Date } {
  const [year, month] = monthKey.split('-').map(Number)
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1) - 1),
  }
}

