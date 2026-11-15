import type {
  AreaOfInterest,
  HistoricalGridData,
  HistoricalCalendarSummary,
  MonthlyActivity,
} from '../shared/types'

export interface HistoricalWildfireRepository {
  getMonthlyActivity(aoi: AreaOfInterest): Promise<MonthlyActivity[]>
  getCalendarSummary(aoi: AreaOfInterest): Promise<HistoricalCalendarSummary>
  getHistoricalGridCells(
    aoi: AreaOfInterest,
    startMonth: string,
    endMonth: string,
  ): Promise<HistoricalGridData>
}

