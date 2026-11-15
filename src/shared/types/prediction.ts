import type { AreaOfInterest, SensorMode } from './wildfire'

export type ForecastDays = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type ForecastSource = 'model-api' | 'fallback-precomputed' | 'mock'

export interface DailyForecastQuery {
  aoi: AreaOfInterest
  asOf?: string
  days: ForecastDays
}

export interface DailyForecastSummary {
  date: string
  expectedFireCells: number
  meanProbability: number
  climatologyMeanProbability: number
  anomaly: number | null
}

export interface ForecastGridCell {
  date: string
  cellId: string
  latitude: number
  longitude: number
  probability: number
  climatologyProbability: number
  anomaly: number | null
  observed: number | null
}

export interface DailyForecastData {
  asOf: string
  source: ForecastSource
  region: DailyForecastSummary[]
  items: ForecastGridCell[]
  isMock: boolean
}

/** @deprecated Replaced by the daily forecast contract above. */
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
  nextThreeMonthsChangePercent: number | null
  highRiskPeriod: string
  longTermTrendPercent: number | null
}

export interface ModelConfidence {
  scorePercent: number | null
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

