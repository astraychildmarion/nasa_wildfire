import { useEffect, useMemo, useState } from 'react'
import { MockHistoricalWildfireRepository } from './data'
import { FireCalendar } from './features/fire-calendar/FireCalendar'
import { FireMap } from './features/fire-map/FireMap'
import type { AOIDimensions } from './features/fire-map/aoi'
import { DateRangeControls } from './features/filters/DateRangeControls'
import { getLatestCompleteMonthRange, getUtcMonthDateRange, isMonthInRange, toMonthKey } from './shared/lib'
import type { MonthRange } from './shared/lib'
import type { AreaOfInterest, CalendarMode, HistoricalHotspot, MonthlyActivity, SensorMode } from './shared/types'

const repository = new MockHistoricalWildfireRepository()
const AOI_DIMENSIONS: AOIDimensions = { latitudeSpan: 4, longitudeSpan: 4 }

function App() {
  const [selectedAOI, setSelectedAOI] = useState<AreaOfInterest | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<MonthRange | null>(null)
  const [calendarMode] = useState<CalendarMode>('activity')
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
        setDateRange(getLatestCompleteMonthRange(records))
      })
      .catch(() => {
        if (!cancelled) setActivityError('Historical monthly activity could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false)
      })

    return () => { cancelled = true }
  }, [selectedAOI])

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

  const visibleActivity = useMemo(() => {
    if (!dateRange) return []
    return monthlyActivity.filter((record) => isMonthInRange(toMonthKey(record.year, record.month), dateRange))
  }, [dateRange, monthlyActivity])

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
              disabled={activityLoading}
              onChange={handleDateRangeChange}
            />
          </div>
        </section>
        <FireCalendar
          records={visibleActivity}
          selectedMonth={selectedMonth}
          sensorMode={sensorMode}
          calendarMode={calendarMode}
          loading={activityLoading}
          error={activityError}
          hasAOI={selectedAOI !== null}
          onMonthSelect={handleMonthSelect}
        />
      </main>
    </div>
  )
}

export default App
