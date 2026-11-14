import { useEffect, useMemo, useState } from 'react'
import { MockHistoricalWildfireRepository } from './data'
import { FireCalendar } from './features/fire-calendar/FireCalendar'
import { CalendarModeToggle } from './features/fire-calendar/CalendarModeToggle'
import { FireMap } from './features/fire-map/FireMap'
import type { AOIDimensions } from './features/fire-map/aoi'
import { DateRangeControls } from './features/filters/DateRangeControls'
import { getLatestCompleteMonthRange, getUtcMonthDateRange, isMonthInRange, prepareCalendarCells, toMonthKey } from './shared/lib'
import type { MonthRange } from './shared/lib'
import type { AreaOfInterest, CalendarMode, HistoricalHotspot, MonthlyActivity, SensorMode } from './shared/types'

const repository = new MockHistoricalWildfireRepository()
const AOI_DIMENSIONS: AOIDimensions = { latitudeSpan: 4, longitudeSpan: 4 }
const HISTORICAL_BASELINE = { startYear: 2019, endYear: 2023 } as const

function App() {
  const [selectedAOI, setSelectedAOI] = useState<AreaOfInterest | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<MonthRange | null>(null)
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('activity')
  const [sensorMode] = useState<SensorMode>('harmonized')
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivity[]>([])
  const [hotspots, setHotspots] = useState<HistoricalHotspot[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [hotspotLoading, setHotspotLoading] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [hotspotError, setHotspotError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedAOI) return
    let cancelled = false

    repository.getMonthlyActivity(selectedAOI)
      .then((records) => {
        if (cancelled) return
        setMonthlyActivity(records)
        setDateRange(getLatestCompleteMonthRange(records.filter((record) => record[sensorMode] !== null)))
      })
      .catch(() => {
        if (!cancelled) setActivityError('Historical monthly activity could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false)
      })

    return () => { cancelled = true }
  }, [selectedAOI, sensorMode])

  useEffect(() => {
    if (!selectedAOI || !selectedMonth) return

    let cancelled = false
    const { start, end } = getUtcMonthDateRange(selectedMonth)

    repository.getHotspots(selectedAOI, start, end)
      .then((records) => {
        if (!cancelled) setHotspots(records)
      })
      .catch(() => {
        if (!cancelled) setHotspotError('Historical hotspots could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setHotspotLoading(false)
      })

    return () => { cancelled = true }
  }, [selectedAOI, selectedMonth])

  const availableRange = useMemo(
    () => getLatestCompleteMonthRange(monthlyActivity, monthlyActivity.length),
    [monthlyActivity],
  )

  const latestRange = useMemo(
    () => getLatestCompleteMonthRange(monthlyActivity.filter((record) => record[sensorMode] !== null)),
    [monthlyActivity, sensorMode],
  )

  const calendarCells = useMemo(() => {
    const prepared = prepareCalendarCells(monthlyActivity, sensorMode, calendarMode, HISTORICAL_BASELINE)
    if (!dateRange) return []
    return prepared.filter((cell) => isMonthInRange(toMonthKey(cell.year, cell.month), dateRange))
  }, [calendarMode, dateRange, monthlyActivity, sensorMode])

  function handleAOIChange(aoi: AreaOfInterest) {
    setSelectedAOI(aoi)
    setSelectedMonth(null)
    setMonthlyActivity([])
    setDateRange(null)
    setHotspots([])
    setActivityLoading(true)
    setHotspotLoading(false)
    setActivityError(null)
    setHotspotError(null)
  }

  function handleDateRangeChange(nextRange: MonthRange) {
    setDateRange(nextRange)
    if (selectedMonth && !isMonthInRange(selectedMonth, nextRange)) {
      setSelectedMonth(null)
      setHotspots([])
      setHotspotLoading(false)
      setHotspotError(null)
    }
  }

  function handleMonthSelect(month: string) {
    if (month === selectedMonth) return
    setSelectedMonth(month)
    setHotspots([])
    setHotspotLoading(true)
    setHotspotError(null)
  }

  const mapEmptyMessage = activityLoading
    ? undefined
    : monthlyActivity.length === 0
      ? 'No historical activity is available for this selected area.'
      : selectedMonth
        ? 'No historical hotspots were found for the selected month.'
        : 'Choose a calendar month to display historical hotspots.'

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Historical Wildfire Activity Explorer</h1>
        </div>
      </header>
      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <section className="relative min-h-[34rem]">
          <FireMap
            aoi={selectedAOI}
            hotspots={hotspots}
            loading={activityLoading || hotspotLoading}
            error={activityError ?? hotspotError}
            aoiDimensions={AOI_DIMENSIONS}
            emptyMessage={mapEmptyMessage}
            onAOIChange={handleAOIChange}
          />
          <div className="absolute inset-x-4 top-4 z-[500] sm:left-auto sm:right-5 sm:w-[28rem] sm:max-w-[calc(100%_-_2.5rem)]">
            <DateRangeControls
              key={dateRange ? `${dateRange.start}:${dateRange.end}` : 'no-range'}
              range={dateRange}
              availableRange={availableRange}
              latestRange={latestRange}
              disabled={activityLoading}
              onChange={handleDateRangeChange}
            />
          </div>
        </section>
        {!selectedAOI && <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">Select a location on the map to load historical monthly activity.</section>}
        {selectedAOI && activityLoading && <section className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm" role="status">Loading historical monthly activity…</section>}
        {selectedAOI && activityError && <section className="w-full rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-700 shadow-sm" role="alert">{activityError}</section>}
        {selectedAOI && !activityLoading && !activityError && (
          <section>
            <CalendarModeToggle mode={calendarMode} onChange={setCalendarMode} />
            <FireCalendar cells={calendarCells} selectedMonth={selectedMonth} calendarMode={calendarMode} onMonthSelect={handleMonthSelect} />
          </section>
        )}
      </main>
    </div>
  )
}

export default App
