import type {
  AreaOfInterest,
  HistoricalHotspot,
  MonthlyActivity,
} from '../shared/types'

export interface HistoricalWildfireRepository {
  getMonthlyActivity(aoi: AreaOfInterest): Promise<MonthlyActivity[]>
  getHotspots(
    aoi: AreaOfInterest,
    startDate: Date,
    endDate: Date,
  ): Promise<HistoricalHotspot[]>
}

