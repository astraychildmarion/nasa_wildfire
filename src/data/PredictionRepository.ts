import type { PredictionDashboardData, PredictionQuery } from '../shared/types'

export interface PredictionRepository {
  getPredictionDashboard(query: PredictionQuery): Promise<PredictionDashboardData>
}

