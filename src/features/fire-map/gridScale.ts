import type { HistoricalGridCell } from '../../shared/types'

export const GRID_COLORS = ['#fff7bc', '#fec44f', '#fe9929', '#d95f0e', '#7f2704'] as const

export function getGridFillColor(value: number, maximum: number): string {
  if (maximum <= 0) return GRID_COLORS[0]
  const ratio = Math.max(0, Math.min(1, value / maximum))
  const index = Math.min(GRID_COLORS.length - 1, Math.floor(ratio * GRID_COLORS.length))
  return GRID_COLORS[index]
}

export function getGridCellBounds(cell: HistoricalGridCell): [[number, number], [number, number]] {
  return [
    [cell.bounds.south, cell.bounds.west],
    [cell.bounds.north, cell.bounds.east],
  ]
}
