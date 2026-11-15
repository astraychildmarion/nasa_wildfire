import type { PredictionRepository } from './PredictionRepository'
import type {
  DailyForecastData,
  DailyForecastQuery,
  DailyForecastSummary,
  ForecastGridCell,
  MonthlyRisk,
  PredictionDashboardData,
  PredictionMonthlyPoint,
  PredictionQuery,
  PredictionRiskLevel,
} from '../shared/types'

const DEFAULT_FORECAST_AS_OF = '2026-11-07'
const GRID_OFFSETS = [
  { latitude: -0.25, longitude: -0.25 },
  { latitude: -0.25, longitude: 0.25 },
  { latitude: 0.25, longitude: -0.25 },
  { latitude: 0.25, longitude: 0.25 },
] as const

function addLocalDays(date: string, amount: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + amount))
  return next.toISOString().slice(0, 10)
}

function makeForecastCells(query: DailyForecastQuery, days: number): ForecastGridCell[] {
  const asOf = query.asOf ?? DEFAULT_FORECAST_AS_OF
  return Array.from({ length: days }, (_, dayIndex) => {
    const date = addLocalDays(asOf, dayIndex + 1)
    return GRID_OFFSETS.map((offset, cellIndex) => {
      const probability = Number((0.12 + dayIndex * 0.045 + cellIndex * 0.065).toFixed(3))
      const climatologyProbability = Number((0.1 + cellIndex * 0.035).toFixed(3))
      return {
        date,
        cellId: `mock-${date}-${cellIndex + 1}`,
        latitude: query.aoi.centre.latitude + offset.latitude,
        longitude: query.aoi.centre.longitude + offset.longitude,
        probability,
        climatologyProbability,
        anomaly: Number((probability / climatologyProbability).toFixed(3)),
        observed: null,
      }
    })
  }).flat()
}

function makeRegionSummaries(items: ForecastGridCell[]): DailyForecastSummary[] {
  const dates = [...new Set(items.map((item) => item.date))]
  return dates.map((date) => {
    const cells = items.filter((item) => item.date === date)
    const expectedFireCells = cells.reduce((total, cell) => total + cell.probability, 0)
    const meanProbability = expectedFireCells / cells.length
    const climatologyMeanProbability = cells.reduce((total, cell) => total + cell.climatologyProbability, 0) / cells.length
    return {
      date,
      expectedFireCells: Number(expectedFireCells.toFixed(3)),
      meanProbability: Number(meanProbability.toFixed(3)),
      climatologyMeanProbability: Number(climatologyMeanProbability.toFixed(3)),
      anomaly: climatologyMeanProbability === 0 ? null : Number((meanProbability / climatologyMeanProbability).toFixed(3)),
    }
  })
}

export function createMockDailyForecast(query: DailyForecastQuery): DailyForecastData {
  const days = Math.max(1, Math.min(7, Math.floor(query.days)))
  const items = makeForecastCells(query, days)
  return {
    asOf: query.asOf ?? DEFAULT_FORECAST_AS_OF,
    source: 'mock',
    region: makeRegionSummaries(items),
    items,
    isMock: true,
  }
}

const seasonalThousands = [0.8, 0.6, 1, 1.8, 3.5, 6.8, 11.2, 13.8, 10.4, 5.4, 2.2, 1.1]
const forecastStartYear = 2027
const historicalStartYear = 2001
const historicalEndYear = 2026

function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

function deterministicOffset(year: number, month: number): number {
  return (((year * 13 + month * 29) % 17) - 8) / 10
}

function historicalValue(year: number, month: number): number {
  const trend = (year - historicalStartYear) * 0.035
  return Number(Math.max(0, seasonalThousands[month - 1] + trend + deterministicOffset(year, month)).toFixed(2))
}

function forecastValue(month: number): number {
  const trend = (forecastStartYear - historicalStartYear) * 0.035
  return Number((seasonalThousands[month - 1] + trend + 0.55).toFixed(2))
}

function makeHistoricalPoints(): PredictionMonthlyPoint[] {
  return Array.from({ length: (historicalEndYear - historicalStartYear + 1) * 12 }, (_, index) => {
    const year = historicalStartYear + Math.floor(index / 12)
    const month = (index % 12) + 1
    return {
      month: monthKey(year, month),
      phase: 'historical',
      observed: historicalValue(year, month),
      forecastMedian: null,
      lower80: null,
      upper80: null,
      lower95: null,
      upper95: null,
    }
  })
}

function makeForecastPoints(forecastMonths: number): PredictionMonthlyPoint[] {
  return Array.from({ length: forecastMonths }, (_, index) => {
    const month = (index % 12) + 1
    const median = forecastValue(month)
    const spread = 0.8 + seasonalThousands[month - 1] * 0.08
    return {
      month: monthKey(forecastStartYear + Math.floor(index / 12), month),
      phase: 'forecast',
      observed: null,
      forecastMedian: median,
      lower80: Number(Math.max(0, median - spread * 0.55).toFixed(2)),
      upper80: Number((median + spread * 0.55).toFixed(2)),
      lower95: Number(Math.max(0, median - spread).toFixed(2)),
      upper95: Number((median + spread).toFixed(2)),
    }
  })
}

function riskForMonth(month: number): MonthlyRisk {
  const score = Math.round((seasonalThousands[month - 1] / Math.max(...seasonalThousands)) * 100)
  let level: PredictionRiskLevel = 'low'
  if (score >= 85) level = 'extreme'
  else if (score >= 60) level = 'high'
  else if (score >= 30) level = 'moderate'
  return { month: monthKey(forecastStartYear, month), level, score }
}

export function createMockPredictionDashboard(query: PredictionQuery): PredictionDashboardData {
  const forecastMonths = Math.max(1, Math.min(12, Math.floor(query.forecastMonths)))
  const risks = Array.from({ length: forecastMonths }, (_, index) => riskForMonth((index % 12) + 1))
  const points = [...makeHistoricalPoints(), ...makeForecastPoints(forecastMonths)]

  return {
    coverage: 'inside',
    cellCount: 1,
    sensorMode: query.sensorMode,
    unit: 'NOAA-20-equivalent hotspots per month',
    points,
    risks,
    highRiskMonth: 'August 2027',
    insights: {
      nextThreeMonthsChangePercent: 32,
      highRiskPeriod: 'August to September',
      longTermTrendPercent: 18,
    },
    modelConfidence: {
      scorePercent: 87,
      metric: 'R² historical fit',
      factors: ['25 years of historical samples', 'Strong seasonal pattern', 'High forecast confidence'],
    },
    isMock: true,
  }
}

export class MockPredictionRepository implements PredictionRepository {
  async getDailyForecast(query: DailyForecastQuery): Promise<DailyForecastData> {
    return createMockDailyForecast(query)
  }

  async getPredictionDashboard(query: PredictionQuery): Promise<PredictionDashboardData> {
    return createMockPredictionDashboard(query)
  }
}

