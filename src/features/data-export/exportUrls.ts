import { getApiBaseUrl, serializeBbox } from '../../data'
import type { MonthRange } from '../../shared/lib'
import type { AreaOfInterest } from '../../shared/types'

export interface ExportUrls {
  calendar: string | null
  hotspots: string | null
}

export function getExportUrls(aoi: AreaOfInterest | null, range: MonthRange | null, baseUrl = getApiBaseUrl()): ExportUrls {
  if (!aoi) return { calendar: null, hotspots: null }
  const calendar = new URL('/api/calendar.csv', baseUrl)
  calendar.searchParams.set('bbox', serializeBbox(aoi))
  if (!range) return { calendar: calendar.toString(), hotspots: null }
  const hotspots = new URL('/api/hotspots.csv', baseUrl)
  hotspots.searchParams.set('bbox', serializeBbox(aoi))
  hotspots.searchParams.set('from', range.start)
  hotspots.searchParams.set('to', range.end)
  return { calendar: calendar.toString(), hotspots: hotspots.toString() }
}
