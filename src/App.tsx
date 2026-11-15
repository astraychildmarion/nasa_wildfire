import { useEffect, useMemo, useRef, useState } from 'react'
import { BrowserRouter, Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { ApiError, ApiHistoricalWildfireRepository, ApiPredictionRepository } from './data'
import { FireCalendar } from './features/fire-calendar/FireCalendar'
import { CalendarModeToggle } from './features/fire-calendar/CalendarModeToggle'
import { FireMap } from './features/fire-map/FireMap'
import { createAreaOfInterest, type AOIDimensions } from './features/fire-map/aoi'
import { DateRangeControls, type MapQueryValues } from './features/filters/DateRangeControls'
import { AddFireFieldNote } from './features/fire-annotations/AddFireFieldNote'
import { MockFireAnnotationRepository } from './features/fire-annotations/MockFireAnnotationRepository'
import { MOCK_MAP_FIELD_NOTES } from './features/fire-annotations/mockMapFieldNotes'
import { getLatestCompleteMonthRange, isMonthInRange, prepareCalendarCells, toMonthKey } from './shared/lib'
import type { MonthRange } from './shared/lib'
import type { AreaOfInterest, CalendarMode, HistoricalCalendarSummary, HistoricalGridData, MonthlyActivity, SensorMode } from './shared/types'
import type { NewFireFieldNote } from './types/annotation'
import { DailyForecastDonut } from './features/prediction/DailyForecastDonut'
import { HistoricalActivityChart } from './features/prediction/HistoricalActivityChart'
import { ModelConfidenceCard } from './features/prediction/ModelConfidenceCard'
import { PredictionInsightsCard } from './features/prediction/PredictionInsightsCard'
import { PredictionAboutCard } from './features/prediction/PredictionAboutCard'
import { prepareMapInfoPanelData } from './features/fire-map/mapInfoData'
import { DataExportMenu } from './features/data-export/DataExportMenu'

const repository = new ApiHistoricalWildfireRepository()
const fireAnnotationRepository = new MockFireAnnotationRepository()
const predictionRepository = new ApiPredictionRepository()
const AOI_DIMENSIONS: AOIDimensions = { latitudeSpan: 4, longitudeSpan: 4 }
const HISTORICAL_BASELINE = { startYear: 2019, endYear: 2023 } as const
const DEFAULT_CALIFORNIA_AOI: AreaOfInterest = {
  centre: { latitude: 37.25, longitude: -119.25 },
  bounds: { west: -124.5, south: 32.5, east: -114, north: 42 },
}

function HistoricalExplorerPage({ selectedAOI, onSelectedAOIChange, onExportRangeChange }: { selectedAOI: AreaOfInterest | null; onSelectedAOIChange: (aoi: AreaOfInterest) => void; onExportRangeChange: (range: MonthRange | null) => void }) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<MonthRange | null>(null)
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('activity')
  const [sensorMode] = useState<SensorMode>('harmonized')
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivity[]>([])
  const [gridData, setGridData] = useState<HistoricalGridData | null>(null)
  const [calendarSummary, setCalendarSummary] = useState<HistoricalCalendarSummary | null>(null)
  const [activityLoading, setActivityLoading] = useState(false)
  const [gridLoading, setGridLoading] = useState(false)
  const [activityError, setActivityError] = useState<string | null>(null)
  const [gridError, setGridError] = useState<string | null>(null)
  const pendingDateRangeRef = useRef<MonthRange | null>(null)
  const [annotationOpen, setAnnotationOpen] = useState(false)

  useEffect(() => {
    if (!selectedAOI) return
    let cancelled = false

    Promise.all([repository.getMonthlyActivity(selectedAOI), repository.getCalendarSummary(selectedAOI)])
      .then(([records, summary]) => {
        if (cancelled) return
        setMonthlyActivity(records)
        setCalendarSummary(summary)
        const latest = getLatestCompleteMonthRange(records.filter((record) => record[sensorMode] !== null))
        const keys = records.map((record) => toMonthKey(record.year, record.month)).sort()
        const available = keys.length > 0 ? { start: keys[0], end: keys[keys.length - 1] } : null
        const requested = pendingDateRangeRef.current
        const intersects = requested && available && requested.end >= available.start && requested.start <= available.end
        const nextRange = intersects ? { start: requested.start < available.start ? available.start : requested.start, end: requested.end > available.end ? available.end : requested.end } : latest
        setDateRange(nextRange)
        onExportRangeChange(nextRange)
        pendingDateRangeRef.current = null
      })
      .catch((error: unknown) => {
        if (!cancelled) setActivityError(error instanceof ApiError
          ? `Historical activity could not be loaded: ${error.detail}`
          : 'Historical activity could not be loaded from the API.')
      })
      .finally(() => {
        if (!cancelled) setActivityLoading(false)
      })

    return () => { cancelled = true }
  }, [onExportRangeChange, selectedAOI, sensorMode])

  useEffect(() => {
    if (!selectedAOI || !selectedMonth) return

    let cancelled = false
    repository.getHistoricalGridCells(selectedAOI, selectedMonth, selectedMonth)
      .then((records) => {
        if (!cancelled) setGridData(records)
      })
      .catch((error: unknown) => {
        if (!cancelled) setGridError(error instanceof ApiError
          ? `Historical activity grids could not be loaded: ${error.detail}`
          : 'Historical activity grids could not be loaded.')
      })
      .finally(() => {
        if (!cancelled) setGridLoading(false)
      })

    return () => { cancelled = true }
  }, [selectedAOI, selectedMonth])

  const availableRange = useMemo(() => {
    const keys = monthlyActivity.map((record) => toMonthKey(record.year, record.month)).sort()
    return keys.length > 0 ? { start: keys[0], end: keys[keys.length - 1] } : null
  }, [monthlyActivity])

  const calendarCells = useMemo(() => {
    const prepared = prepareCalendarCells(monthlyActivity, sensorMode, calendarMode, HISTORICAL_BASELINE)
    if (!dateRange) return []
    return prepared.filter((cell) => isMonthInRange(toMonthKey(cell.year, cell.month), dateRange))
  }, [calendarMode, dateRange, monthlyActivity, sensorMode])

  function handleAOIChange(aoi: AreaOfInterest, preferredRange?: MonthRange) {
    if (preferredRange) pendingDateRangeRef.current = preferredRange
    onSelectedAOIChange(aoi)
    setSelectedMonth(null)
    setMonthlyActivity([])
    setDateRange(null)
    onExportRangeChange(null)
    setGridData(null)
    setCalendarSummary(null)
    setActivityLoading(true)
    setGridLoading(false)
    setActivityError(null)
    setGridError(null)
  }

  function handleApplyQuery(values: MapQueryValues) {
    const requestedRange = { start: values.start, end: values.end }
    const hasCoordinates = values.latitude.trim() !== '' && values.longitude.trim() !== ''
    if (hasCoordinates) {
      handleAOIChange(createAreaOfInterest({ latitude: Number(values.latitude), longitude: Number(values.longitude) }, AOI_DIMENSIONS), requestedRange)
      return
    }
    if (selectedAOI) handleDateRangeChange(requestedRange)
    else { pendingDateRangeRef.current = requestedRange; setDateRange(requestedRange); onExportRangeChange(requestedRange) }
  }

  function handleDateRangeChange(nextRange: MonthRange) {
    setDateRange(nextRange)
    onExportRangeChange(nextRange)
    if (selectedMonth && !isMonthInRange(selectedMonth, nextRange)) {
      setSelectedMonth(null)
      setGridData(null)
      setGridLoading(false)
      setGridError(null)
    }
  }

  function handleMonthSelect(month: string) {
    if (month === selectedMonth) return
    setSelectedMonth(month)
    setGridData(null)
    setGridLoading(true)
    setGridError(null)
  }

  async function handleAddFieldNote(note: NewFireFieldNote) {
    await fireAnnotationRepository.add(note)
  }

  const mapEmptyMessage = activityLoading
    ? undefined
    : monthlyActivity.length === 0
      ? 'No historical activity is available for this selected area.'
      : selectedMonth
        ? 'No recorded grid activity was found for the selected month.'
        : 'Choose a calendar month to display historical activity grids.'

  return (
      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <section className="relative min-h-[34rem]">
          <FireMap
            aoi={selectedAOI}
            gridData={gridData}
            fieldNotes={MOCK_MAP_FIELD_NOTES}
            selectedMonth={selectedMonth}
            selectedActivity={selectedMonth ? monthlyActivity.find((record) => toMonthKey(record.year, record.month) === selectedMonth) ?? null : null}
            loading={activityLoading || gridLoading}
            error={activityError ?? gridError}
            aoiDimensions={AOI_DIMENSIONS}
            emptyMessage={mapEmptyMessage}
            infoPanelData={calendarSummary ? prepareMapInfoPanelData(calendarSummary) : undefined}
            onAOIChange={handleAOIChange}
          />
          <div className="absolute right-4 top-4 z-[500] w-[min(24rem,calc(100%_-_2rem))] sm:right-5">
            <DateRangeControls
              key={`${selectedAOI?.centre.latitude ?? 'none'}:${selectedAOI?.centre.longitude ?? 'none'}:${dateRange?.start ?? 'none'}:${dateRange?.end ?? 'none'}`}
              range={dateRange}
              availableRange={availableRange}
              selectedAOI={selectedAOI}
              disabled={activityLoading}
              onApplyQuery={handleApplyQuery}
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

function PredictionDashboardPlaceholder({ selectedAOI }: { selectedAOI: AreaOfInterest | null }) {
  const [prediction, setPrediction] = useState<Awaited<ReturnType<typeof predictionRepository.getPredictionDashboard>> | null>(null)
  const [dailyForecast, setDailyForecast] = useState<Awaited<ReturnType<typeof predictionRepository.getDailyForecast>> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const predictionAOI = selectedAOI ?? DEFAULT_CALIFORNIA_AOI

  useEffect(() => {
    let cancelled = false
    Promise.all([
      predictionRepository.getPredictionDashboard({ aoi: predictionAOI, sensorMode: 'harmonized', forecastMonths: 12 }),
      predictionRepository.getDailyForecast({ aoi: predictionAOI, days: 7 }),
    ])
      .then(([dashboard, forecast]) => { if (!cancelled) { setPrediction(dashboard); setDailyForecast(forecast) } })
      .catch((requestError: unknown) => { if (!cancelled) setError(requestError instanceof ApiError ? `Prediction data could not be loaded: ${requestError.detail}` : 'Prediction data could not be loaded.') })
    return () => { cancelled = true }
  }, [predictionAOI])

  return (
    <main className="mx-auto grid max-w-[1600px] gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
      <section className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(26rem,1.25fr)]">
        {prediction ? <PredictionInsightsCard insights={prediction.insights} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm"><h2 className="font-semibold">Key Insights</h2><p className="mt-3 text-sm text-slate-500">Loading insight data…</p></div>}
        {prediction ? <ModelConfidenceCard confidence={prediction.modelConfidence} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm"><h2 className="font-semibold">Monthly Outlook Evaluation</h2><p className="mt-3 text-sm text-slate-500">Loading evaluation data…</p></div>}
      </section>
      <section className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,3fr)_minmax(26rem,1.25fr)]">
        {prediction && <HistoricalActivityChart points={prediction.points} unit={prediction.unit} displayDivisor={1000} displayUnit="thousand NOAA-20-equivalent hotspots per month" aoi={predictionAOI} isSelectedAOI={selectedAOI !== null} />}
        {dailyForecast && <DailyForecastDonut summaries={dailyForecast.region} source={dailyForecast.source} />}
        {(!prediction || !dailyForecast) && !error && <p className="text-sm text-slate-500" role="status">Loading prediction data…</p>}
        {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
      </section>
      <section className="w-full">
        {prediction ? <PredictionAboutCard isMock={prediction.isMock} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 shadow-sm"><h2 className="font-semibold">About Forecast Results</h2><p className="mt-3 text-sm text-slate-500">Loading forecast information…</p></div>}
      </section>
    </main>
  )
}

function App() {
  const [selectedAOI, setSelectedAOI] = useState<AreaOfInterest | null>(null)
  const [exportRange, setExportRange] = useState<MonthRange | null>(null)
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-stone-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white/90">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <NavLink to="/history" className="text-lg font-semibold tracking-tight sm:text-xl">Historical Wildfire Activity Explorer</NavLink>
            <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Primary navigation">
              <NavLink to="/history" className={({ isActive }) => `rounded-lg px-3 py-2 font-medium transition ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>Historical Fire Calendar</NavLink>
              <NavLink to="/prediction" className={({ isActive }) => `rounded-lg px-3 py-2 font-medium transition ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>Trend Forecast &amp; Risk Outlook</NavLink>
              <DataExportMenu aoi={selectedAOI} range={exportRange} />
            </nav>
          </div>
        </header>
        <Routes>
          <Route path="/history" element={<HistoricalExplorerPage selectedAOI={selectedAOI} onSelectedAOIChange={setSelectedAOI} onExportRangeChange={setExportRange} />} />
          <Route path="/prediction" element={<PredictionDashboardPlaceholder selectedAOI={selectedAOI} />} />
          <Route path="*" element={<Navigate to="/history" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
