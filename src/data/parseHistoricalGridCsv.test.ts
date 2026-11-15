import { describe, expect, it } from 'vitest'
import { HistoricalGridCsvError, parseHistoricalGridCsv } from './parseHistoricalGridCsv'

const HEADER = 'month,cellId,lat,lon,hotspots_noaa20_equivalent,source'

describe('parseHistoricalGridCsv', () => {
  it('parses decimal activity values and normalized sources', () => {
    const cells = parseHistoricalGridCsv(`${HEADER}\n2024-06,grid-1,38.25,-120.25,11.6,VIIRS\n2023-07,grid-2,34.25,-118.25,18.4,MODISxk`)

    expect(cells).toEqual([
      { month: '2024-06', cellId: 'grid-1', latitude: 38.25, longitude: -120.25, hotspotCount: 11.6, source: 'VIIRS', partial: false },
      { month: '2023-07', cellId: 'grid-2', latitude: 34.25, longitude: -118.25, hotspotCount: 18.4, source: 'MODISxk', partial: false },
    ])
  })

  it('extracts partial status from the source suffix', () => {
    const [cell] = parseHistoricalGridCsv(`${HEADER}\n2024-12,grid-1,36.25,-117.75,2.75,VIIRS-partial`)
    expect(cell).toMatchObject({ source: 'VIIRS', partial: true })
  })

  it('supports CRLF, a UTF-8 BOM, and quoted fields', () => {
    const [cell] = parseHistoricalGridCsv(`\uFEFF${HEADER}\r\n2024-06,"grid-1",38.25,-120.25,11.6,VIIRS\r\n`)
    expect(cell.cellId).toBe('grid-1')
  })

  it('returns an empty collection for an empty response or header-only response', () => {
    expect(parseHistoricalGridCsv('')).toEqual([])
    expect(parseHistoricalGridCsv(HEADER)).toEqual([])
  })

  it('rejects missing required headers', () => {
    expect(() => parseHistoricalGridCsv('month,lat,lon\n2024-06,38,-120')).toThrowError(new HistoricalGridCsvError('CSV is missing required header "cellId".'))
  })

  it.each([
    ['invalid month', '2024-13,grid-1,38,-120,1,VIIRS', 'month must use YYYY-MM'],
    ['invalid latitude', '2024-06,grid-1,91,-120,1,VIIRS', 'lat must be between -90 and 90'],
    ['invalid longitude', '2024-06,grid-1,38,-181,1,VIIRS', 'lon must be between -180 and 180'],
    ['negative activity', '2024-06,grid-1,38,-120,-1,VIIRS', 'must not be negative'],
    ['invalid source', '2024-06,grid-1,38,-120,1,MODIS', 'unsupported source'],
  ])('rejects %s', (_, row, expectedMessage) => {
    expect(() => parseHistoricalGridCsv(`${HEADER}\n${row}`)).toThrowError(expectedMessage)
  })
})
