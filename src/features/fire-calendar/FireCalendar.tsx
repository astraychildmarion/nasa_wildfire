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
const missingPattern = {
  backgroundImage: 'repeating-linear-gradient(135deg, #f1f5f9 0, #f1f5f9 4px, #cbd5e1 4px, #cbd5e1 5px)',
}

function getColour(value: number, maximum: number): string {
  if (maximum <= 0) return activityColours[0]
  const index = Math.min(activityColours.length - 1, Math.floor((value / maximum) * activityColours.length))
  return activityColours[index]
}

function activityLabel(cell: CalendarCell): string {
  const month = new Intl.DateTimeFormat(undefined, { month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(cell.year, cell.month - 1, 1)))
  return `${month} ${cell.year}: ${cell.value} historical fire activity`
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
  const maximum = Math.max(0, ...cells.map((cell) => cell.value ?? 0))

  if (cells.length === 0) {
    return <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No complete monthly activity is available for this area.</section>
  }

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[52rem] grid-cols-[4.5rem_repeat(12,minmax(3.5rem,1fr))] gap-1.5" role="grid" aria-label="Historical monthly fire activity">
          <span aria-hidden="true" />
          {monthLabels.map((month) => <span key={month} className="pb-1 text-center text-xs font-medium text-slate-500" role="columnheader">{month}</span>)}
          {years.flatMap((year) => [
            <span key={`${year}-label`} className="flex items-center text-sm font-semibold text-slate-700" role="rowheader">{year}</span>,
            ...monthLabels.map((monthLabel, index) => {
              const month = index + 1
              const monthKey = toMonthKey(year, month)
              const cell = cellByMonth.get(monthKey)

              if (!cell || !cell.complete || cell.value === null) {
                const unavailableLabel = cell ? `${monthLabel} ${year}: data unavailable` : `${monthLabel} ${year}: outside selected range`
                return <span key={monthKey} className="flex h-12 items-center justify-center rounded-md border border-slate-200 text-xs font-medium text-slate-500" style={missingPattern} role="gridcell" aria-label={unavailableLabel}>—</span>
              }

              const value = cell.value
              const label = activityLabel(cell)
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
                  className={`h-12 rounded-md border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${getColour(value, maximum)} ${selected ? 'border-orange-500 ring-2 ring-orange-500 ring-offset-1' : 'border-white/60 hover:border-slate-700'}`}
                >
                  {value}
                </button>
              )
            }),
          ])}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-600" aria-label={`${calendarMode} colour scale`}>
        <span className="font-medium">Lower activity</span>
        {activityColours.map((colour, index) => <span key={colour} className={`h-4 w-7 rounded-sm border border-slate-200 ${colour}`} aria-label={`Intensity ${index + 1} of ${activityColours.length}`} />)}
        <span className="font-medium">Higher activity</span>
        <span className="ml-2 h-4 w-7 rounded-sm border border-slate-300" style={missingPattern} />
        <span>Unavailable</span>
        <span className="ml-auto text-slate-400">Mock activity values</span>
      </div>
    </section>
  )
}

