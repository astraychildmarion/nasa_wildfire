export interface GeographicPoint {
  latitude: number
  longitude: number
}

export interface GeographicBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface AreaOfInterest {
  centre: GeographicPoint
  bounds: GeographicBounds
}

export type SensorMode = 'harmonized' | 'modis' | 'viirs'

export type CalendarMode = 'activity' | 'anomaly'

export interface MonthlyActivity {
  year: number
  month: number
  harmonized: number | null
  modis: number | null
  viirs: number | null
  complete: boolean
  source?: HistoricalGridSource
  dailyMean?: number | null
}

export type HistoricalGridSource = 'MODISxk' | 'VIIRS'

export interface HistoricalGridCell {
  cellId: string
  latitude: number
  longitude: number
  bounds: GeographicBounds
  hotspotCount: number
  monthsWithFire: number
}

export interface HistoricalGridData {
  from: string
  to: string
  unit: string
  cellSize: number
  maxHotspots: number
  cells: HistoricalGridCell[]
}

export interface HistoricalGridCsvRow {
  month: string
  cellId: string
  latitude: number
  longitude: number
  hotspotCount: number
  source: HistoricalGridSource
  partial: boolean
}

export interface LatestCompleteMonthSummary {
  month: string
  value: number
  historicalMedian: number
  ratioToMedian: number | null
  percentileRank: number | null
}

export interface HistoricalYearTotal {
  year: number
  total: number
}

export interface HistoricalCalendarSummary {
  unit: string
  latestCompleteMonth: LatestCompleteMonthSummary | null
  peakMonth: number | null
  topYears: HistoricalYearTotal[]
  viirsNativeFrom: string
}

