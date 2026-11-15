import { describe, expect, it } from 'vitest'
import { TEST_AOI } from '../../data'
import { getExportUrls } from './exportUrls'

describe('getExportUrls', () => {
  it('keeps exports unavailable before an AOI is selected', () => {
    expect(getExportUrls(null, null, 'https://example.test')).toEqual({ calendar: null, hotspots: null })
  })

  it('builds calendar and inclusive grid export URLs from current state', () => {
    const urls = getExportUrls(TEST_AOI, { start: '2026-01', end: '2026-10' }, 'https://example.test')
    expect(urls.calendar).toBe('https://example.test/api/calendar.csv?bbox=-125%2C32%2C-114%2C42')
    expect(urls.hotspots).toBe('https://example.test/api/hotspots.csv?bbox=-125%2C32%2C-114%2C42&from=2026-01&to=2026-10')
  })

  it('keeps the grid export unavailable until a range exists', () => {
    expect(getExportUrls(TEST_AOI, null, 'https://example.test')).toMatchObject({ calendar: expect.any(String), hotspots: null })
  })
})
