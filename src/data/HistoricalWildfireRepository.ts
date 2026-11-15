import type {
  AreaOfInterest,
  HistoricalActivityData,
  HistoricalGridData,
  HistoricalCalendarSummary,
} from '../shared/types'

export interface HistoricalWildfireRepository {
  getMonthlyActivity(aoi: AreaOfInterest): Promise<HistoricalActivityData>
  getCalendarSummary(aoi: AreaOfInterest): Promise<HistoricalCalendarSummary>
  getHistoricalGridCells(
    aoi: AreaOfInterest,
    startMonth: string,
    endMonth: string,
  ): Promise<HistoricalGridData>
}

