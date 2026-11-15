import { describe, expect, it } from 'vitest'
import { getChartWidth, getTrendChartGeometry, toAreaPath, toPath } from './chartGeometry'
import type { PredictionMonthlyPoint } from '../../shared/types'

const points: PredictionMonthlyPoint[] = [
  { month: '2026-12', phase: 'historical', observed: 10, forecastMedian: null, lower80: null, upper80: null, lower95: null, upper95: null },
  { month: '2027-01', phase: 'forecast', observed: null, forecastMedian: 12, lower80: 11, upper80: 13, lower95: 10, upper95: 14 },
]

describe('trend chart geometry', () => {
  it('creates separate historical and forecast coordinates with a boundary', () => {
    const geometry = getTrendChartGeometry(points)
    expect(geometry.historical).toHaveLength(1)
    expect(geometry.forecast).toHaveLength(1)
    expect(geometry.boundaryX).toBeGreaterThan(geometry.historical[0].x)
    expect(geometry.boundaryX).toBeLessThan(geometry.forecast[0].x)
    expect(geometry.maxValue).toBe(14)
  })

  it('creates line and confidence-area SVG paths', () => {
    const geometry = getTrendChartGeometry(points)
    expect(toPath(geometry.forecast)).toMatch(/^M /)
    expect(toAreaPath(geometry.lower95, geometry.upper95)).toContain('Z')
    expect(toAreaPath([], geometry.upper95)).toBe('')
  })

  it('allocates a fixed horizontal width per month', () => {
    const chartWidth = getChartWidth(120)
    const geometry = getTrendChartGeometry(points, chartWidth)
    expect(chartWidth).toBeGreaterThan(1000)
    expect(geometry.forecast[0].x - geometry.historical[0].x).toBeGreaterThan(40)
  })

  it('supports a padded data-driven range without forcing zero', () => {
    const dynamicPoints: PredictionMonthlyPoint[] = [
      { month: '2025-01', phase: 'historical', observed: 10, forecastMedian: null, lower80: null, upper80: null, lower95: null, upper95: null },
      { month: '2025-02', phase: 'historical', observed: 20, forecastMedian: null, lower80: null, upper80: null, lower95: null, upper95: null },
    ]
    const dynamic = getTrendChartGeometry(dynamicPoints, 1000, { includeZero: false, paddingRatio: 0.08 })
    expect(dynamic.minValue).toBeCloseTo(9.2)
    expect(dynamic.maxValue).toBeCloseTo(20.8)
  })

  it('creates a visible non-negative range for an equal-value series', () => {
    const equalPoints: PredictionMonthlyPoint[] = [
      { month: '2025-01', phase: 'historical', observed: 10, forecastMedian: null, lower80: null, upper80: null, lower95: null, upper95: null },
    ]
    const equal = getTrendChartGeometry(equalPoints, 1000, { includeZero: false, paddingRatio: 0.08 })
    expect(equal.minValue).toBeGreaterThanOrEqual(0)
    expect(equal.minValue).toBeLessThan(10)
    expect(equal.maxValue).toBeGreaterThan(10)
  })

  it('uses only the requested visible range to calculate the Y-axis', () => {
    const rangedPoints: PredictionMonthlyPoint[] = [
      { month: '2026-01', phase: 'historical', observed: 100, forecastMedian: null, lower80: null, upper80: null, lower95: null, upper95: null },
      { month: '2026-02', phase: 'historical', observed: 10, forecastMedian: null, lower80: null, upper80: null, lower95: null, upper95: null },
      { month: '2026-03', phase: 'historical', observed: 20, forecastMedian: null, lower80: null, upper80: null, lower95: null, upper95: null },
    ]

    const geometry = getTrendChartGeometry(rangedPoints, 1000, {
      includeZero: false,
      rangeStartIndex: 1,
      rangeEndIndex: 3,
    })

    expect(geometry.minValue).toBe(10)
    expect(geometry.maxValue).toBe(20)
    expect(geometry.historical).toHaveLength(3)
  })
})

