import { useMemo } from 'react'
import type { CalendarCell } from '../../shared/lib'
import { toMonthKey } from '../../shared/lib'
import type { CalendarMode } from '../../shared/types'

export interface FireCalendarProps {
  cells: CalendarCell[]
  selectedMonth: string | null
  calendarMode: CalendarMode
  onMonthSelect: (month: string) => void
}

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const activityColours = [
  'bg-sky-50 text-slate-800',
  'bg-sky-200 text-slate-900',
  'bg-sky-400 text-slate-950',
  'bg-blue-600 text-white',
  'bg-indigo-900 text-white',
]
const anomalyColours = [
  'bg-blue-800 text-white',
  'bg-blue-300 text-slate-950',
  'bg-slate-100 text-slate-900',
  'bg-orange-300 text-slate-950',
  'bg-orange-700 text-white',
]
const missingPattern = {
  backgroundImage: 'repeating-linear-gradient(135deg, #f1f5f9 0, #f1f5f9 4px, #cbd5e1 4px, #cbd5e1 5px)',
}

function getColour(value: number, maximum: number): string {
  if (maximum <= 0) return activityColours[0]
  const index = Math.min(activityColours.length - 1, Math.floor((value / maximum) * activityColours.length))
  return activityColours[index]
}

function getAnomalyColour(value: number, maximumAbsolute: number): string {
  if (value === 0 || maximumAbsolute <= 0) return anomalyColours[2]
  const strong = Math.abs(value) / maximumAbsolute >= 0.5
  if (value < 0) return strong ? anomalyColours[0] : anomalyColours[1]
  return strong ? anomalyColours[4] : anomalyColours[3]
}

function formatSigned(value: number): string {
  return `${value > 0 ? '+' : ''}${Number.isInteger(value) ? value : value.toFixed(1)}`
}

function fullMonthLabel(year: number, monthNumber: number): string {
  const month = new Intl.DateTimeFormat(undefined, { month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, monthNumber - 1, 1)))
  return `${month} ${year}`
}

function cellLabel(cell: CalendarCell, mode: CalendarMode): string {
  const month = fullMonthLabel(cell.year, cell.month)
  if (mode === 'anomaly' && cell.displayValue !== null) {
    return `${month}: ${formatSigned(cell.displayValue)} difference from historical median`
  }
  return `${month}: ${cell.value} historical fire activity`
}

function SummaryValue({ children }: { children: string }) {
  return <dd className="mt-1 text-sm font-semibold text-slate-900">{children}</dd>
}

function ComparisonSummary({ cell }: { cell: CalendarCell }) {
  const percentage = cell.percentage === null ? 'Not defined' : `${formatSigned(cell.percentage)}%`
  const difference = cell.absolute === null ? 'Unavailable' : formatSigned(cell.absolute)
  return (
    <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-5" aria-label="Selected month comparison">
      <div><dt className="text-xs text-slate-500">Selected month</dt><SummaryValue>{fullMonthLabel(cell.year, cell.month)}</SummaryValue></div>
      <div><dt className="text-xs text-slate-500">Observed activity</dt><SummaryValue>{cell.value === null ? 'Unavailable' : String(cell.value)}</SummaryValue></div>
      <div><dt className="text-xs text-slate-500">Historical median</dt><SummaryValue>{cell.baselineMedian === null ? 'Unavailable' : String(cell.baselineMedian)}</SummaryValue></div>
      <div><dt className="text-xs text-slate-500">Absolute difference</dt><SummaryValue>{difference}</SummaryValue></div>
      <div><dt className="text-xs text-slate-500">Percentage difference</dt><SummaryValue>{percentage}</SummaryValue></div>
    </dl>
  )
}

function legendLabel(mode: CalendarMode): string {
  return mode === 'activity' ? 'activity colour scale' : 'anomaly colour scale'
}

function legendColours(mode: CalendarMode): string[] {
  return mode === 'activity' ? activityColours : anomalyColours
}

function colourForCell(cell: CalendarCell, mode: CalendarMode, maximum: number, maximumAbsolute: number): string {
  if (cell.displayValue === null) return ''
  return mode === 'activity'
    ? getColour(cell.displayValue, maximum)
    : getAnomalyColour(cell.displayValue, maximumAbsolute)
}

function displayForCell(cell: CalendarCell, mode: CalendarMode): string {
  if (cell.displayValue === null) return '—'
  return mode === 'activity' ? String(cell.displayValue) : formatSigned(cell.displayValue)
}

function legendEnds(mode: CalendarMode): [string, string, string?] {
  return mode === 'activity'
    ? ['Lower activity', 'Higher activity']
    : ['Below median', 'Above median', 'Near median']
}

function calendarAriaLabel(mode: CalendarMode): string {
  return mode === 'activity' ? 'Historical monthly fire activity' : 'Historical monthly anomaly'
}

function unavailableLabel(cell: CalendarCell | undefined, monthLabel: string, year: number, mode: CalendarMode): string {
  if (!cell) return `${monthLabel} ${year}: outside selected range`
  return mode === 'anomaly'
    ? `${monthLabel} ${year}: historical comparison unavailable`
    : `${monthLabel} ${year}: data unavailable`
}

function findSelectedCell(cells: Map<string, CalendarCell>, selectedMonth: string | null): CalendarCell | null {
  return selectedMonth ? cells.get(selectedMonth) ?? null : null
}

function scaleMaximum(cells: CalendarCell[]): number {
  return Math.max(0, ...cells.map((cell) => cell.value ?? 0))
}

function anomalyMaximum(cells: CalendarCell[]): number {
  return Math.max(0, ...cells.map((cell) => Math.abs(cell.absolute ?? 0)))
}

export function FireCalendar({ cells, selectedMonth, calendarMode, onMonthSelect }: FireCalendarProps) {
  const years = useMemo(
    () => [...new Set(cells.map((cell) => cell.year))].sort((left, right) => left - right),
    [cells],
  )
  const cellByMonth = useMemo(
    () => new Map(cells.map((cell) => [toMonthKey(cell.year, cell.month), cell])),
    [cells],
  )
  const maximum = scaleMaximum(cells)
  const maximumAbsolute = anomalyMaximum(cells)
  const selectedCell = findSelectedCell(cellByMonth, selectedMonth)
  const colours = legendColours(calendarMode)
  const [lowLegend, highLegend, midpointLegend] = legendEnds(calendarMode)

  if (cells.length === 0) {
    return <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No complete monthly activity is available for this area.</section>
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[52rem] grid-cols-[4.5rem_repeat(12,minmax(3.5rem,1fr))] gap-1.5" role="grid" aria-label={calendarAriaLabel(calendarMode)}>
          <span aria-hidden="true" />
          {monthLabels.map((month) => <span key={month} className="pb-1 text-center text-xs font-medium text-slate-500" role="columnheader">{month}</span>)}
          {years.flatMap((year) => [
            <span key={`${year}-label`} className="flex items-center text-sm font-semibold text-slate-700" role="rowheader">{year}</span>,
            ...monthLabels.map((monthLabel, index) => {
              const month = index + 1
              const monthKey = toMonthKey(year, month)
              const cell = cellByMonth.get(monthKey)

              if (!cell || !cell.complete || cell.displayValue === null) {
                return <span key={monthKey} className="flex h-12 items-center justify-center rounded-md border border-slate-200 text-xs font-medium text-slate-500" style={missingPattern} role="gridcell" aria-label={unavailableLabel(cell, monthLabel, year, calendarMode)}>—</span>
              }

              const label = cellLabel(cell, calendarMode)
              const selected = selectedMonth === monthKey
              return (
                <button
                  key={monthKey}
                  type="button"
                  role="gridcell"
                  title={label}
                  aria-label={label}
                  aria-pressed={selected}
                  onClick={() => onMonthSelect(monthKey)}
                  className={`h-12 rounded-md border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${colourForCell(cell, calendarMode, maximum, maximumAbsolute)} ${selected ? 'border-fuchsia-600 ring-2 ring-fuchsia-600 ring-offset-1' : 'border-white/60 hover:border-slate-700'}`}
                >
                  {displayForCell(cell, calendarMode)}
                </button>
              )
            }),
          ])}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600" aria-label={legendLabel(calendarMode)}>
        <span className="font-medium">{lowLegend}</span>
        {colours.map((colour, index) => <span key={colour} className={`h-4 w-7 rounded-sm border border-slate-200 ${colour}`} aria-label={`Scale step ${index + 1} of ${colours.length}`} />)}
        <span className="font-medium">{highLegend}</span>
        {midpointLegend && <span className="text-slate-400">Neutral midpoint: {midpointLegend}</span>}
        <span className="ml-2 h-4 w-7 rounded-sm border border-slate-300" style={missingPattern} />
        <span>Unavailable</span>
      </div>
      {selectedCell && <ComparisonSummary cell={selectedCell} />}
    </section>
  )
}

