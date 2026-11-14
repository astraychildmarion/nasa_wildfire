import type { AreaOfInterest, SensorMode } from './wildfire'

export type PredictionPhase = 'historical' | 'forecast'

export type PredictionRiskLevel = 'low' | 'moderate' | 'high' | 'extreme'

export interface PredictionQuery {
  aoi: AreaOfInterest
  sensorMode: SensorMode
  forecastMonths: number
}

export interface PredictionMonthlyPoint {
  month: string
  phase: PredictionPhase
  observed: number | null
  forecastMedian: number | null
  lower80: number | null
  upper80: number | null
  lower95: number | null
  upper95: number | null
}

export interface MonthlyRisk {
  month: string
  level: PredictionRiskLevel
  score: number
}

export interface PredictionInsights {
  nextThreeMonthsChangePercent: number
  highRiskPeriod: string
  longTermTrendPercent: number
}

export interface ModelConfidence {
  scorePercent: number
  metric: string
  factors: string[]
}

export interface PredictionDashboardData {
  sensorMode: SensorMode
  unit: string
  points: PredictionMonthlyPoint[]
  risks: MonthlyRisk[]
  highRiskMonth: string
  insights: PredictionInsights
  modelConfidence: ModelConfidence
  isMock: boolean
}

