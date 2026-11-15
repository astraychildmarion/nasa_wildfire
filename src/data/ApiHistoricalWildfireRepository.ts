import type { HistoricalWildfireRepository } from './HistoricalWildfireRepository'
import { ApiClient, ApiError, serializeBbox } from './apiClient'
import type {
  AreaOfInterest,
  DataCoverage,
  HistoricalActivityData,
  HistoricalCalendarSummary,
  HistoricalGridData,
  HistoricalGridSource,
  MonthlyActivity,
} from '../shared/types'

interface ActivityResponse {
  coverage: DataCoverage
  cellCount: number
  records: Array<MonthlyActivity & { source: string }>
}

interface CalendarResponse {
  coverage: DataCoverage
  cellCount: number
  unit: string
  latestCompleteMonth: HistoricalCalendarSummary['latestCompleteMonth']
  peakMonth: number | null
  topYears: HistoricalCalendarSummary['topYears']
  viirsNativeFrom: string
}

interface HotspotsResponse {
  coverage: DataCoverage
  from: string
  to: string
  unit: string
  cellSize: number
  maxHotspots: number
  cells: Array<{
    cellId: string
    lat: number
    lon: number
    bounds: [number, number, number, number]
    hotspots: number
    monthsWithFire: number
  }>
}

function source(value: string): HistoricalGridSource {
  if (value === 'MODISxk' || value === 'VIIRS') return value
  throw new ApiError(`The wildfire API returned an unsupported activity source: ${value}.`)
}

function requireArray(value: unknown, field: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new ApiError(`The wildfire API response is missing ${field}.`)
}

export class ApiHistoricalWildfireRepository implements HistoricalWildfireRepository {
  constructor(private readonly client = new ApiClient()) {}

  async getMonthlyActivity(aoi: AreaOfInterest): Promise<HistoricalActivityData> {
    const response = await this.client.get<ActivityResponse>('/api/activity', { bbox: serializeBbox(aoi) })
    requireArray(response.records, 'activity records')
    return {
      coverage: response.coverage,
      cellCount: response.cellCount,
      records: response.records.map((record) => ({
        year: record.year,
        month: record.month,
        harmonized: record.harmonized,
        modis: record.modis,
        viirs: record.viirs,
        complete: record.complete,
        source: source(record.source),
        dailyMean: record.dailyMean ?? null,
        median: record.median ?? null,
        anomaly: record.anomaly ?? null,
        anomalyPercent: record.anomalyPercent ?? null,
      })),
    }
  }

  async getCalendarSummary(aoi: AreaOfInterest): Promise<HistoricalCalendarSummary> {
    const response = await this.client.get<CalendarResponse>('/api/calendar', { bbox: serializeBbox(aoi) })
    requireArray(response.topYears, 'calendar topYears')
    return {
      coverage: response.coverage,
      cellCount: response.cellCount,
      unit: response.unit,
      latestCompleteMonth: response.latestCompleteMonth,
      peakMonth: response.peakMonth,
      topYears: response.topYears,
      viirsNativeFrom: response.viirsNativeFrom,
    }
  }

  async getHistoricalGridCells(aoi: AreaOfInterest, startMonth: string, endMonth: string): Promise<HistoricalGridData> {
    const response = await this.client.get<HotspotsResponse>('/api/hotspots', {
      bbox: serializeBbox(aoi),
      from: startMonth,
      to: endMonth,
    })
    requireArray(response.cells, 'hotspot cells')
    return {
      coverage: response.coverage,
      from: response.from,
      to: response.to,
      unit: response.unit,
      cellSize: response.cellSize,
      maxHotspots: response.maxHotspots,
      cells: response.cells.map((cell) => {
        const [west, south, east, north] = cell.bounds
        return {
          cellId: cell.cellId,
          latitude: cell.lat,
          longitude: cell.lon,
          bounds: { west, south, east, north },
          hotspotCount: cell.hotspots,
          monthsWithFire: cell.monthsWithFire,
        }
      }),
    }
  }
}
