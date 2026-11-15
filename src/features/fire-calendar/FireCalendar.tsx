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
    ? `${monthLabel} ${year}: not comparable`
    : `${monthLabel} ${year}: data unavailable`
}

function scaleMaximum(cells: CalendarCell[]): number {
  return Math.max(0, ...cells.map((cell) => cell.value ?? 0))
}

function anomalyMaximum(cells: CalendarCell[]): number {
  return Math.max(0, ...cells.map((cell) => Math.abs(cell.absolute ?? 0)))
}

export function FireCalendar({ cells, selectedMonth, calendarMode, onMonthSelect }: FireCalendarProps) {
  const years = useMemo(
    () => [...new Set(cells.map((cell) => cell.year))].sort((left, right) => right - left),
    [cells],
  )
  const cellByMonth = useMemo(
    () => new Map(cells.map((cell) => [toMonthKey(cell.year, cell.month), cell])),
    [cells],
  )
  const maximum = scaleMaximum(cells)
  const maximumAbsolute = anomalyMaximum(cells)
  const colours = legendColours(calendarMode)
  const legendScaleColours = [...colours].reverse()
  const [lowLegend, highLegend, midpointLegend] = legendEnds(calendarMode)

  if (cells.length === 0) {
    return <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No complete monthly activity is available for this area.</section>
  }

  return (
    <section className="w-fit max-w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="overflow-x-auto pb-2">
        <div className="grid w-fit grid-cols-[2.5rem_repeat(12,1.5rem)] gap-0.5" role="grid" aria-label={calendarAriaLabel(calendarMode)}>
          <span aria-hidden="true" />
          {monthLabels.map((month) => <span key={month} className="pb-1 text-center text-[0.65rem] font-medium text-slate-500" role="columnheader">{month}</span>)}
          {years.flatMap((year) => [
            <span key={`${year}-label`} className="flex h-6 items-center text-xs font-semibold text-slate-700" role="rowheader">{year}</span>,
            ...monthLabels.map((monthLabel, index) => {
              const month = index + 1
              const monthKey = toMonthKey(year, month)
              const cell = cellByMonth.get(monthKey)

              if (!cell || !cell.complete || cell.displayValue === null) {
                const notComparable = calendarMode === 'anomaly' && cell !== undefined
                return <span key={monthKey} className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 text-center text-[0.5rem] font-medium leading-none text-slate-500" style={missingPattern} role="gridcell" title={unavailableLabel(cell, monthLabel, year, calendarMode)} aria-label={unavailableLabel(cell, monthLabel, year, calendarMode)}>{notComparable ? 'N/C' : ''}</span>
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
                  className={`h-6 w-6 rounded border transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${colourForCell(cell, calendarMode, maximum, maximumAbsolute)} ${selected ? 'border-fuchsia-600 ring-2 ring-fuchsia-600 ring-offset-1' : 'border-white/60 hover:border-slate-700'}`}
                />
              )
            }),
          ])}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.6rem] text-slate-500" aria-label={legendLabel(calendarMode)}>
        <span className="font-medium">{highLegend}</span>
        <div className="flex gap-0.5">
          {legendScaleColours.map((colour, index) => <span key={colour} className={`h-2.5 w-4 rounded-sm border border-slate-200 ${colour}`} aria-label={`Scale step ${colours.length - index} of ${colours.length}`} />)}
        </div>
        <span className="font-medium">{lowLegend}</span>
        {midpointLegend && <span className="text-slate-400">· {midpointLegend}</span>}
        <span className="ml-1 h-2.5 w-4 rounded-sm border border-slate-300" style={missingPattern} />
        <span>Unavailable</span>
      </div>
    </section>
  )
}

