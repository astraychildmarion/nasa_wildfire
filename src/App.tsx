import { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { MockHistoricalWildfireRepository, MockPredictionRepository, TEST_AOI } from './data'
import { FireCalendar } from './features/fire-calendar/FireCalendar'
import { CalendarModeToggle } from './features/fire-calendar/CalendarModeToggle'
import { FireMap } from './features/fire-map/FireMap'
import type { AOIDimensions } from './features/fire-map/aoi'
import { DateRangeControls } from './features/filters/DateRangeControls'
import { AddFireFieldNote } from './features/fire-annotations/AddFireFieldNote'
import { MockFireAnnotationRepository } from './features/fire-annotations/MockFireAnnotationRepository'
import { MOCK_MAP_FIELD_NOTES } from './features/fire-annotations/mockMapFieldNotes'
import { PredictionTrendChart } from './features/prediction/PredictionTrendChart'
import { PredictionRiskDonut } from './features/prediction/PredictionRiskDonut'
import { ModelConfidenceCard } from './features/prediction/ModelConfidenceCard'
import { PredictionInsightsCard } from './features/prediction/PredictionInsightsCard'
import { PredictionAboutCard } from './features/prediction/PredictionAboutCard'
import { getLatestCompleteMonthRange, getUtcMonthDateRange, isMonthInRange, prepareCalendarCells, toMonthKey } from './shared/lib'
import type { MonthRange } from './shared/lib'
import type { AreaOfInterest, CalendarMode, HistoricalHotspot, MonthlyActivity, SensorMode } from './shared/types'
import type { NewFireFieldNote } from './types/annotation'

const repository = new MockHistoricalWildfireRepository()
const fireAnnotationRepository = new MockFireAnnotationRepository()
const predictionRepository = new MockPredictionRepository()
const AOI_DIMENSIONS: AOIDimensions = { latitudeSpan: 4, longitudeSpan: 4 }
const HISTORICAL_BASELINE = { startYear: 2019, endYear: 2023 } as const

function HistoricalExplorerPage() {
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
  const [annotationOpen, setAnnotationOpen] = useState(false)

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

  async function handleAddFieldNote(note: NewFireFieldNote) {
    await fireAnnotationRepository.add(note)
  }

  const mapEmptyMessage = activityLoading
    ? undefined
    : monthlyActivity.length === 0
      ? 'No historical activity is available for this selected area.'
      : selectedMonth
        ? 'No historical hotspots were found for the selected month.'
        : 'Choose a calendar month to display historical hotspots.'

  return (
      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <section className="relative min-h-[34rem]">
          <FireMap
            aoi={selectedAOI}
            hotspots={hotspots}
            fieldNotes={MOCK_MAP_FIELD_NOTES}
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
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label="Report"
          onClick={() => setAnnotationOpen(true)}
          className="fixed right-0 top-1/2 z-[1200] flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-l-xl border border-r-0 border-slate-300 bg-white px-3 py-3 text-xs font-semibold text-slate-700 shadow-lg transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3.75h7.5l4.5 4.5v12a.75.75 0 0 1-.75.75h-11.25a.75.75 0 0 1-.75-.75v-15.75a.75.75 0 0 1 .75-.75Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 3.75v4.5h4.5M9 13.5h6M9 16.5h6" />
          </svg>
          <span>Report</span>
        </button>
        {annotationOpen && (
          <FieldNoteDialog
            onClose={() => setAnnotationOpen(false)}
            onSubmit={handleAddFieldNote}
            initialLocation={selectedAOI ? {
              lat: selectedAOI.centre.latitude,
              lng: selectedAOI.centre.longitude,
            } : undefined}
            initialEventDate={selectedMonth ?? ''}
          />
        )}
      </main>
  )
}

interface FieldNoteDialogProps {
  onClose: () => void
  onSubmit: (note: NewFireFieldNote) => Promise<void>
  initialLocation?: { lat: number; lng: number; name?: string }
  initialEventDate: string
}

function FieldNoteDialog({ onClose, onSubmit, initialLocation, initialEventDate }: FieldNoteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="field-note-title"
      onClose={onClose}
      className="m-auto max-h-[90vh] w-[min(42rem,calc(100vw-2rem))] max-w-none overflow-y-auto rounded-2xl border-0 bg-transparent p-0 shadow-2xl backdrop:bg-slate-950/50"
    >
      <div className="rounded-2xl bg-stone-50">
        <AddFireFieldNote onSubmit={onSubmit} onClose={() => dialogRef.current?.close()} initialLocation={initialLocation} initialEventDate={initialEventDate} />
      </div>
    </dialog>
  )
}

function PredictionDashboardPlaceholder() {
  const [prediction, setPrediction] = useState<Awaited<ReturnType<typeof predictionRepository.getPredictionDashboard>> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    predictionRepository.getPredictionDashboard({ aoi: TEST_AOI, sensorMode: 'harmonized', forecastMonths: 12 })
      .then((data) => { if (!cancelled) setPrediction(data) })
      .catch(() => { if (!cancelled) setError('Prediction data could not be loaded.') })
    return () => { cancelled = true }
  }, [])

  return (
    <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(15rem,0.8fr)]">
        <div>
          {prediction && <PredictionTrendChart points={prediction.points} unit={prediction.unit} />}
          {!prediction && !error && <p className="text-sm text-slate-500" role="status">Loading prediction data…</p>}
          {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
        </div>
        <div className="min-h-[28rem]">
          {prediction && <PredictionRiskDonut risks={prediction.risks} highRiskMonth={prediction.highRiskMonth} />}
          {!prediction && !error && <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500" role="status">Loading risk outlook…</p>}
          {error && <p className="rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-700" role="alert">{error}</p>}
        </div>
      </section>
      <section className="grid items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(15rem,0.8fr)]">
        <div className="grid w-full items-start gap-4 self-start md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
          {prediction ? <PredictionInsightsCard insights={prediction.insights} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm"><h2 className="font-semibold">Key Insights</h2><p className="mt-3 text-sm text-slate-500">Loading insight data…</p></div>}
          <div className="self-start">
            {prediction ? <ModelConfidenceCard confidence={prediction.modelConfidence} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm"><h2 className="font-semibold">Model Confidence</h2><p className="mt-3 text-sm text-slate-500">Loading confidence data…</p></div>}
          </div>
        </div>
        <div className="self-start">
          {prediction ? <PredictionAboutCard isMock={prediction.isMock} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm"><h2 className="font-semibold">About Forecast Results</h2><p className="mt-3 text-sm text-slate-500">Loading forecast information…</p></div>}
        </div>
      </section>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white/90">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <NavLink to="/history" className="text-lg font-semibold tracking-tight sm:text-xl">Historical Wildfire Activity Explorer</NavLink>
            <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Primary navigation">
              <NavLink to="/history" className={({ isActive }) => `rounded-lg px-3 py-2 font-medium transition ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>Historical Fire Calendar</NavLink>
              <NavLink to="/prediction" className={({ isActive }) => `rounded-lg px-3 py-2 font-medium transition ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>Trend Forecast &amp; Risk Outlook</NavLink>
              <button type="button" className="rounded-lg border border-slate-300 px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">Model Transparency &amp; Data Export</button>
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/history" element={<HistoricalExplorerPage />} />
          <Route path="/prediction" element={<PredictionDashboardPlaceholder />} />
          <Route path="*" element={<Navigate to="/history" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
