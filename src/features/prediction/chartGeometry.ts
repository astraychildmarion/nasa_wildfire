import type { PredictionMonthlyPoint } from '../../shared/types'

export interface ChartCoordinate {
  x: number
  y: number
  value: number
}

export interface TrendChartGeometry {
  historical: ChartCoordinate[]
  forecast: ChartCoordinate[]
  lower80: ChartCoordinate[]
  upper80: ChartCoordinate[]
  lower95: ChartCoordinate[]
  upper95: ChartCoordinate[]
  boundaryX: number
  maxValue: number
  minValue: number
}

export interface TrendChartRangeOptions {
  includeZero?: boolean
  paddingRatio?: number
  rangeStartIndex?: number
  rangeEndIndex?: number
}

export const CHART_WIDTH = 1000
export const CHART_HEIGHT = 420
export const MONTH_WIDTH = 16
const PADDING = { top: 28, right: 28, bottom: 54, left: 64 }

export function getChartWidth(pointCount: number, monthWidth = MONTH_WIDTH): number {
  return Math.max(CHART_WIDTH, PADDING.left + PADDING.right + Math.max(1, pointCount - 1) * monthWidth)
}

export function getChartX(index: number, total: number, chartWidth = CHART_WIDTH): number {
  const usableWidth = chartWidth - PADDING.left - PADDING.right
  return PADDING.left + (index / Math.max(1, total - 1)) * usableWidth
}

function yForValue(value: number, minValue: number, maxValue: number): number {
  const usableHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom
  const span = Math.max(1, maxValue - minValue)
  return PADDING.top + ((maxValue - value) / span) * usableHeight
}

function coordinates(values: Array<{ index: number; value: number }>, total: number, minValue: number, maxValue: number, chartWidth: number): ChartCoordinate[] {
  return values.map(({ index, value }) => ({
    x: getChartX(index, total, chartWidth),
    y: yForValue(value, minValue, maxValue),
    value,
  }))
}

export function getTrendChartGeometry(points: readonly PredictionMonthlyPoint[], chartWidth = CHART_WIDTH, options: TrendChartRangeOptions = {}): TrendChartGeometry {
  const rangeStartIndex = Math.max(0, options.rangeStartIndex ?? 0)
  const rangeEndIndex = Math.min(points.length, options.rangeEndIndex ?? points.length)
  const rangePoints = points.slice(rangeStartIndex, Math.max(rangeStartIndex + 1, rangeEndIndex))
  const values = rangePoints.flatMap((point) => [point.observed, point.forecastMedian, point.lower95, point.upper95])
    .filter((value): value is number => value !== null)
  const rawMinimum = values.length === 0 ? 0 : Math.min(...values)
  const rawMaximum = values.length === 0 ? 1 : Math.max(...values)
  const paddingRatio = Math.max(0, options.paddingRatio ?? 0)
  const span = rawMaximum - rawMinimum
  const padding = span > 0 ? span * paddingRatio : Math.max(Math.abs(rawMaximum) * paddingRatio, paddingRatio)
  const minValue = options.includeZero === false ? Math.max(0, rawMinimum - padding) : Math.min(0, rawMinimum - padding)
  const maxValue = Math.max(minValue + Number.EPSILON, rawMaximum + padding)
  const historical = points.flatMap((point, index) => point.observed === null ? [] : [{ index, value: point.observed }])
  const forecast = points.flatMap((point, index) => point.forecastMedian === null ? [] : [{ index, value: point.forecastMedian }])
  const lower80 = points.flatMap((point, index) => point.lower80 === null ? [] : [{ index, value: point.lower80 }])
  const upper80 = points.flatMap((point, index) => point.upper80 === null ? [] : [{ index, value: point.upper80 }])
  const lower95 = points.flatMap((point, index) => point.lower95 === null ? [] : [{ index, value: point.lower95 }])
  const upper95 = points.flatMap((point, index) => point.upper95 === null ? [] : [{ index, value: point.upper95 }])
  const historicalCount = historical.length

  return {
    historical: coordinates(historical, points.length, minValue, maxValue, chartWidth),
    forecast: coordinates(forecast, points.length, minValue, maxValue, chartWidth),
    lower80: coordinates(lower80, points.length, minValue, maxValue, chartWidth),
    upper80: coordinates(upper80, points.length, minValue, maxValue, chartWidth),
    lower95: coordinates(lower95, points.length, minValue, maxValue, chartWidth),
    upper95: coordinates(upper95, points.length, minValue, maxValue, chartWidth),
    boundaryX: getChartX(Math.max(0, historicalCount - 0.5), points.length, chartWidth),
    minValue,
    maxValue,
  }
}

export function toPath(coordinates: readonly ChartCoordinate[]): string {
  return coordinates.map((coordinate, index) => `${index === 0 ? 'M' : 'L'} ${coordinate.x.toFixed(2)} ${coordinate.y.toFixed(2)}`).join(' ')
}

export function toAreaPath(lower: readonly ChartCoordinate[], upper: readonly ChartCoordinate[]): string {
  if (lower.length === 0 || upper.length === 0) return ''
  const forward = upper.map((coordinate, index) => `${index === 0 ? 'M' : 'L'} ${coordinate.x.toFixed(2)} ${coordinate.y.toFixed(2)}`).join(' ')
  const backward = [...lower].reverse().map((coordinate) => `L ${coordinate.x.toFixed(2)} ${coordinate.y.toFixed(2)}`).join(' ')
  return `${forward} ${backward} Z`
}

