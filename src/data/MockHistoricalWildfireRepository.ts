import type { HistoricalWildfireRepository } from './HistoricalWildfireRepository'
import { MOCK_HISTORICAL_GRID_CELLS, MOCK_MONTHLY_ACTIVITY, TEST_AOI } from './mockHistoricalData'
import type {
  AreaOfInterest,
  GeographicPoint,
  HistoricalActivityData,
  HistoricalGridCell,
  HistoricalGridData,
  HistoricalCalendarSummary,
} from '../shared/types'

function contains(aoi: AreaOfInterest, point: GeographicPoint): boolean {
  return point.latitude >= aoi.bounds.south
    && point.latitude <= aoi.bounds.north
    && point.longitude >= aoi.bounds.west
    && point.longitude <= aoi.bounds.east
}

function overlapsTestArea(aoi: AreaOfInterest): boolean {
  return aoi.bounds.west <= TEST_AOI.bounds.east
    && aoi.bounds.east >= TEST_AOI.bounds.west
    && aoi.bounds.south <= TEST_AOI.bounds.north
    && aoi.bounds.north >= TEST_AOI.bounds.south
}

export class MockHistoricalWildfireRepository implements HistoricalWildfireRepository {
  async getMonthlyActivity(aoi: AreaOfInterest): Promise<HistoricalActivityData> {
    if (!overlapsTestArea(aoi)) return { coverage: 'outside', cellCount: 0, records: [] }
    return { coverage: 'inside', cellCount: 1, records: MOCK_MONTHLY_ACTIVITY.map((record) => ({ ...record })) }
  }

  async getCalendarSummary(): Promise<HistoricalCalendarSummary> {
    return {
      coverage: 'inside',
      cellCount: 1,
      unit: 'NOAA-20-equivalent hotspots per month',
      latestCompleteMonth: { month: '2027-11', value: 18, historicalMedian: 14, ratioToMedian: 1.29, percentileRank: 72 },
      peakMonth: 8,
      topYears: [{ year: 2020, total: 1250.5 }],
      viirsNativeFrom: '2012-02',
    }
  }

  async getHistoricalGridCells(
    aoi: AreaOfInterest,
    startMonth: string,
    endMonth: string,
  ): Promise<HistoricalGridData> {
    const rows = MOCK_HISTORICAL_GRID_CELLS
      .filter((cell) => cell.month >= startMonth && cell.month <= endMonth && contains(aoi, cell))
    const cells: HistoricalGridCell[] = rows.map((cell) => ({
      cellId: cell.cellId,
      latitude: cell.latitude,
      longitude: cell.longitude,
      bounds: { west: cell.longitude - 0.25, south: cell.latitude - 0.25, east: cell.longitude + 0.25, north: cell.latitude + 0.25 },
      hotspotCount: cell.hotspotCount,
      monthsWithFire: 1,
    }))
    return {
      coverage: overlapsTestArea(aoi) ? 'inside' : 'outside',
      from: startMonth,
      to: endMonth,
      unit: 'NOAA-20-equivalent hotspots in range',
      cellSize: 0.5,
      maxHotspots: Math.max(0, ...cells.map((cell) => cell.hotspotCount)),
      cells,
    }
  }
}

