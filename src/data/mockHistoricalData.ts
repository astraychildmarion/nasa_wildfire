import type {
  AreaOfInterest,
  HistoricalGridCsvRow,
  MonthlyActivity,
} from '../shared/types'

export const TEST_AOI: AreaOfInterest = {
  centre: { latitude: 37, longitude: -119.5 },
  bounds: { north: 42, south: 32, east: -114, west: -125 },
}

const seasonalActivity = [8, 6, 10, 18, 35, 68, 112, 138, 104, 54, 22, 11]
const MOCK_START_MONTH_INDEX = 2000 * 12 + 10
const MOCK_END_MONTH_INDEX = 2027 * 12 + 10

function deterministicOffset(year: number, month: number, salt: number): number {
  return ((year * 17 + month * 23 + salt * 11) % 13) - 6
}

export const MOCK_MONTHLY_ACTIVITY: MonthlyActivity[] = Array.from(
  { length: MOCK_END_MONTH_INDEX - MOCK_START_MONTH_INDEX + 1 },
  (_, index) => {
    const monthIndex = MOCK_START_MONTH_INDEX + index
    const year = Math.floor(monthIndex / 12)
    const month = (monthIndex % 12) + 1
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

export const MOCK_HISTORICAL_GRID_CELLS: HistoricalGridCsvRow[] = [
  { month: '2023-07', cellId: 'grid-2023-07-1', latitude: 34.25, longitude: -118.25, hotspotCount: 18.4, source: 'MODISxk', partial: false },
  { month: '2023-07', cellId: 'grid-2023-07-2', latitude: 34.75, longitude: -118.25, hotspotCount: 7.8, source: 'MODISxk', partial: false },
  { month: '2023-10', cellId: 'grid-2023-10-1', latitude: 37.25, longitude: -119.25, hotspotCount: 4.25, source: 'MODISxk', partial: false },
  { month: '2024-06', cellId: 'grid-2024-06-1', latitude: 38.25, longitude: -120.25, hotspotCount: 11.6, source: 'VIIRS', partial: false },
  { month: '2024-06', cellId: 'grid-2024-06-2', latitude: 38.75, longitude: -120.25, hotspotCount: 22.1, source: 'VIIRS', partial: false },
  { month: '2024-12', cellId: 'grid-2024-12-1', latitude: 36.25, longitude: -117.75, hotspotCount: 2.75, source: 'VIIRS', partial: true },
  { month: '2027-11', cellId: 'grid-2027-11-1', latitude: 37.25, longitude: -119.25, hotspotCount: 6.35, source: 'VIIRS', partial: false },
]

