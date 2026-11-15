import type { DailyForecastData, DailyForecastQuery, PredictionDashboardData, PredictionQuery } from '../shared/types'

export interface PredictionRepository {
  getDailyForecast(query: DailyForecastQuery): Promise<DailyForecastData>
  /** @deprecated Retained until the daily forecast UI replaces the monthly dashboard. */
  getPredictionDashboard(query: PredictionQuery): Promise<PredictionDashboardData>
}

