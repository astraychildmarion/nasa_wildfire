import type {
  AreaOfInterest,
  HistoricalHotspot,
  MonthlyActivity,
} from '../shared/types'

export const TEST_AOI: AreaOfInterest = {
  centre: { latitude: 37, longitude: -119.5 },
  bounds: { north: 42, south: 32, east: -114, west: -125 },
}

const seasonalActivity = [8, 6, 10, 18, 35, 68, 112, 138, 104, 54, 22, 11]

function deterministicOffset(year: number, month: number, salt: number): number {
  return ((year * 17 + month * 23 + salt * 11) % 13) - 6
}

export const MOCK_MONTHLY_ACTIVITY: MonthlyActivity[] = Array.from(
  { length: 6 * 12 },
  (_, index) => {
    const year = 2019 + Math.floor(index / 12)
    const month = (index % 12) + 1
    const seasonal = seasonalActivity[month - 1]

    const record: MonthlyActivity = {
      year,
      month,
      harmonized: Math.max(0, seasonal + deterministicOffset(year, month, 1)),
      modis: Math.max(0, Math.round(seasonal * 0.58) + deterministicOffset(year, month, 2)),
      viirs: Math.max(0, Math.round(seasonal * 0.72) + deterministicOffset(year, month, 3)),
      complete: !(year === 2024 && month === 12),
    }

    if (year === 2020 && month === 2) {
      record.harmonized = 0
      record.modis = 0
      record.viirs = 0
    }

    if (year === 2021 && month === 4) record.viirs = null
    if (year === 2022 && month === 9) record.harmonized = null
    if (year === 2023 && month === 1) record.modis = null

    return record
  },
)

export const MOCK_HOTSPOTS: HistoricalHotspot[] = [
  { id: 'mock-001', latitude: 34.23, longitude: -118.41, detectedAt: '2021-06-18T19:25:00Z', sensor: 'viirs', confidence: 82 },
  { id: 'mock-002', latitude: 38.44, longitude: -120.51, detectedAt: '2021-07-09T21:10:00Z', sensor: 'modis', confidence: 74 },
  { id: 'mock-003', latitude: 39.72, longitude: -121.58, detectedAt: '2022-08-02T20:40:00Z', sensor: 'viirs', confidence: 91 },
  { id: 'mock-004', latitude: 36.61, longitude: -118.82, detectedAt: '2022-09-14T18:05:00Z', sensor: 'modis' },
  { id: 'mock-005', latitude: 40.12, longitude: -122.37, detectedAt: '2023-07-22T22:15:00Z', sensor: 'viirs', confidence: 88 },
  { id: 'mock-006', latitude: 33.91, longitude: -116.72, detectedAt: '2023-10-06T17:45:00Z', sensor: 'modis', confidence: 67 },
  { id: 'mock-007', latitude: 37.31, longitude: -119.09, detectedAt: '2024-06-29T19:55:00Z', sensor: 'viirs', confidence: 79 },
  { id: 'mock-008', latitude: 41.08, longitude: -123.23, detectedAt: '2024-08-11T23:20:00Z', sensor: 'modis', confidence: 85 },
]

