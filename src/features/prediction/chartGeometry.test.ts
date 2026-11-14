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
})

