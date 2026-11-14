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
}

export interface HistoricalHotspot {
  id: string
  latitude: number
  longitude: number
  detectedAt: string
  sensor: Exclude<SensorMode, 'harmonized'>
  confidence?: number
}

