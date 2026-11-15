import type { HistoricalCalendarSummary } from '../../shared/types'

export interface MapInfoPanelData {
  latestMonth: string
  anomalyPercent: number | null
  peakMonthLabel: string
  topYear: number | null
  topYearTotal: number | null
  unit: string
}

function monthName(month: number | null): string {
  if (month === null || month < 1 || month > 12) return 'Unavailable'
  return new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, month - 1, 1)))
}

export function prepareMapInfoPanelData(summary: HistoricalCalendarSummary): MapInfoPanelData {
  const topYear = summary.topYears[0] ?? null
  const ratio = summary.latestCompleteMonth?.ratioToMedian ?? null
  return {
    latestMonth: summary.latestCompleteMonth?.month ?? 'Unavailable',
    anomalyPercent: ratio === null ? null : (ratio - 1) * 100,
    peakMonthLabel: monthName(summary.peakMonth),
    topYear: topYear?.year ?? null,
    topYearTotal: topYear?.total ?? null,
    unit: summary.unit,
  }
}
