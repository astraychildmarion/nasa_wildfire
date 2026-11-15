import type { HistoricalGridCsvRow, HistoricalGridSource } from '../shared/types'

const REQUIRED_HEADERS = [
  'month',
  'cellId',
  'lat',
  'lon',
  'hotspots_noaa20_equivalent',
  'source',
] as const

export class HistoricalGridCsvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'HistoricalGridCsvError'
  }
}

function parseRows(csv: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (character === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && csv[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else {
      field += character
    }
  }

  if (quoted) throw new HistoricalGridCsvError('CSV contains an unterminated quoted field.')
  row.push(field)
  if (row.some((value) => value.trim() !== '')) rows.push(row)
  return rows
}

function parseMonth(value: string, rowNumber: number): string {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    throw new HistoricalGridCsvError(`Row ${rowNumber}: month must use YYYY-MM.`)
  }
  return value
}

function parseNumber(value: string, field: string, rowNumber: number): number {
  const parsed = Number(value)
  if (value === '' || !Number.isFinite(parsed)) {
    throw new HistoricalGridCsvError(`Row ${rowNumber}: ${field} must be a finite number.`)
  }
  return parsed
}

function parseSource(value: string, rowNumber: number): { source: HistoricalGridSource; partial: boolean } {
  const partial = value.endsWith('-partial')
  const source = partial ? value.slice(0, -'-partial'.length) : value
  if (source !== 'MODISxk' && source !== 'VIIRS') {
    throw new HistoricalGridCsvError(`Row ${rowNumber}: unsupported source "${value}".`)
  }
  return { source, partial }
}

export function parseHistoricalGridCsv(csv: string): HistoricalGridCsvRow[] {
  if (csv.trim() === '') return []
  const rows = parseRows(csv)
  const headers = rows[0].map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim())
  const headerIndexes = new Map(headers.map((header, index) => [header, index]))

  for (const header of REQUIRED_HEADERS) {
    if (!headerIndexes.has(header)) throw new HistoricalGridCsvError(`CSV is missing required header "${header}".`)
  }

  const valueAt = (row: string[], header: typeof REQUIRED_HEADERS[number]) => row[headerIndexes.get(header)!]?.trim() ?? ''

  return rows.slice(1).map((row, index) => {
    const rowNumber = index + 2
    const cellId = valueAt(row, 'cellId')
    if (!cellId) throw new HistoricalGridCsvError(`Row ${rowNumber}: cellId is required.`)

    const latitude = parseNumber(valueAt(row, 'lat'), 'lat', rowNumber)
    const longitude = parseNumber(valueAt(row, 'lon'), 'lon', rowNumber)
    const hotspotCount = parseNumber(valueAt(row, 'hotspots_noaa20_equivalent'), 'hotspots_noaa20_equivalent', rowNumber)
    if (latitude < -90 || latitude > 90) throw new HistoricalGridCsvError(`Row ${rowNumber}: lat must be between -90 and 90.`)
    if (longitude < -180 || longitude > 180) throw new HistoricalGridCsvError(`Row ${rowNumber}: lon must be between -180 and 180.`)
    if (hotspotCount < 0) throw new HistoricalGridCsvError(`Row ${rowNumber}: hotspots_noaa20_equivalent must not be negative.`)
    const source = parseSource(valueAt(row, 'source'), rowNumber)

    return {
      month: parseMonth(valueAt(row, 'month'), rowNumber),
      cellId,
      latitude,
      longitude,
      hotspotCount,
      ...source,
    }
  })
}
