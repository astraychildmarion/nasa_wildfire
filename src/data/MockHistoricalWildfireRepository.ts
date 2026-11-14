import type { HistoricalWildfireRepository } from './HistoricalWildfireRepository'
import { MOCK_HOTSPOTS, MOCK_MONTHLY_ACTIVITY, TEST_AOI } from './mockHistoricalData'
import type {
  AreaOfInterest,
  GeographicPoint,
  HistoricalHotspot,
  MonthlyActivity,
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
  async getMonthlyActivity(aoi: AreaOfInterest): Promise<MonthlyActivity[]> {
    if (!overlapsTestArea(aoi)) return []
    return MOCK_MONTHLY_ACTIVITY.map((record) => ({ ...record }))
  }

  async getHotspots(
    aoi: AreaOfInterest,
    startDate: Date,
    endDate: Date,
  ): Promise<HistoricalHotspot[]> {
    const start = startDate.getTime()
    const end = endDate.getTime()

    return MOCK_HOTSPOTS
      .filter((hotspot) => {
        const detectedAt = Date.parse(hotspot.detectedAt)
        return contains(aoi, hotspot) && detectedAt >= start && detectedAt <= end
      })
      .map((hotspot) => ({ ...hotspot }))
  }
}

