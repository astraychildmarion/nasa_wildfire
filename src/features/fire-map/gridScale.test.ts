import { describe, expect, it } from 'vitest'
import type { HistoricalGridCell } from '../../shared/types'
import { GRID_COLORS, getGridCellBounds, getGridFillColor } from './gridScale'

describe('historical activity grid presentation', () => {
  it('maps increasing activity to an ordered sequential palette', () => {
    expect(getGridFillColor(0, 100)).toBe(GRID_COLORS[0])
    expect(getGridFillColor(50, 100)).toBe(GRID_COLORS[2])
    expect(getGridFillColor(100, 100)).toBe(GRID_COLORS[4])
  })

  it('handles an empty scale safely', () => {
    expect(getGridFillColor(0, 0)).toBe(GRID_COLORS[0])
  })

  it('creates a 0.5-degree rectangle around the supplied grid centre', () => {
    const cell: HistoricalGridCell = { cellId: 'cell', latitude: 38.25, longitude: -120.25, bounds: { west: -120.5, south: 38, east: -120, north: 38.5 }, hotspotCount: 1.5, monthsWithFire: 1 }
    expect(getGridCellBounds(cell)).toEqual([[38, -120.5], [38.5, -120]])
  })
})
