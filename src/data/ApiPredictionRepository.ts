import type { PredictionRepository } from './PredictionRepository'
import { ApiClient, ApiError, serializeBbox } from './apiClient'
import type {
  DailyForecastData,
  DailyForecastQuery,
  ForecastSource,
  PredictionDashboardData,
  PredictionQuery,
} from '../shared/types'

interface ForecastResponse {
  asOf: string
  source: string
  region: Array<{
    date: string
    expectedFireCells: number
    pMean: number
    pClimMean: number
    anomaly: number | null
  }>
  items: Array<{
    date: string
    cellId: string
    lat: number
    lon: number
    p: number
    pClim: number
    anomaly: number | null
    observed: number | null
  }>
}

function forecastSource(value: string): ForecastSource {
  if (value === 'model-api' || value === 'fallback-precomputed') return value
  throw new ApiError(`The wildfire API returned an unsupported forecast source: ${value}.`)
}

export class ApiPredictionRepository implements PredictionRepository {
  constructor(private readonly client = new ApiClient()) {}

  getPredictionDashboard(query: PredictionQuery): Promise<PredictionDashboardData> {
    return this.client.get<PredictionDashboardData>('/api/outlook', {
      bbox: serializeBbox(query.aoi),
      months: Math.max(1, Math.min(12, Math.floor(query.forecastMonths))),
    })
  }

  async getDailyForecast(query: DailyForecastQuery): Promise<DailyForecastData> {
    const response = await this.client.post<ForecastResponse>('/api/forecast', {
      bbox: [query.aoi.bounds.west, query.aoi.bounds.south, query.aoi.bounds.east, query.aoi.bounds.north],
      ...(query.asOf ? { asOf: query.asOf } : {}),
      days: query.days,
    })
    if (!Array.isArray(response.region) || !Array.isArray(response.items)) {
      throw new ApiError('The wildfire forecast response is missing region or item data.')
    }
    return {
      asOf: response.asOf,
      source: forecastSource(response.source),
      region: response.region.map((item) => ({
        date: item.date,
        expectedFireCells: item.expectedFireCells,
        meanProbability: item.pMean,
        climatologyMeanProbability: item.pClimMean,
        anomaly: item.anomaly,
      })),
      items: response.items.map((item) => ({
        date: item.date,
        cellId: item.cellId,
        latitude: item.lat,
        longitude: item.lon,
        probability: item.p,
        climatologyProbability: item.pClim,
        anomaly: item.anomaly,
        observed: item.observed,
      })),
      isMock: false,
    }
  }
}
