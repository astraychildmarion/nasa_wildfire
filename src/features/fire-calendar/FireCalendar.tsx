import type { CalendarMode, MonthlyActivity, SensorMode } from '../../shared/types'
import { getSensorValue, toMonthKey } from '../../shared/lib'

export interface FireCalendarProps {
  records: MonthlyActivity[]
  selectedMonth: string | null
  sensorMode: SensorMode
  calendarMode: CalendarMode
  loading: boolean
  error: string | null
  hasAOI: boolean
  onMonthSelect: (month: string) => void
}

function monthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(year, month - 1, 1)))
}

export function FireCalendar({ records, selectedMonth, sensorMode, calendarMode, loading, error, hasAOI, onMonthSelect }: FireCalendarProps) {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      {!hasAOI && <p className="text-sm text-slate-500">Select a location on the map to load historical monthly activity.</p>}
      {hasAOI && loading && <p className="text-sm text-slate-500" role="status">Loading historical monthly activity…</p>}
      {hasAOI && error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      {hasAOI && !loading && !error && records.length === 0 && <p className="text-sm text-slate-500">No complete monthly activity is available for this area.</p>}
      {records.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
          {records.map((record) => {
            const month = toMonthKey(record.year, record.month)
            const value = getSensorValue(record, sensorMode)
            const selected = selectedMonth === month
            return (
              <button
                key={month}
                type="button"
                className={`rounded-lg border px-3 py-3 text-left transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${selected ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/60'}`}
                aria-pressed={selected}
                onClick={() => onMonthSelect(month)}
              >
                <span className="block text-xs font-medium text-slate-600">{monthLabel(record.year, record.month)}</span>
                <span className="mt-1 block text-base font-semibold text-slate-900">{!record.complete ? 'Incomplete' : value ?? 'Unavailable'}</span>
                <span className="mt-1 block text-[0.65rem] uppercase tracking-wide text-slate-400">{calendarMode === 'activity' ? sensorMode : calendarMode}</span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

