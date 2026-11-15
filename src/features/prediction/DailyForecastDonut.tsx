import type { DailyForecastSummary, ForecastSource } from '../../shared/types'
import { FORECAST_PROBABILITY_BANDS, forecastProbabilityColour } from './forecastProbabilityScale'

const SIZE = 280
const CENTRE = SIZE / 2
const RADIUS = 92
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatDate(date: string): string {
  const [, month, day] = date.split('-')
  return `${month}/${day}`
}

function formatProbability(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatAnomaly(value: number | null): string {
  return value === null ? 'Unavailable' : `${value.toFixed(2)}×`
}

export interface DailyForecastDonutProps {
  summaries: DailyForecastSummary[]
  source: ForecastSource
}

export function DailyForecastDonut({ summaries, source }: DailyForecastDonutProps) {
  const segmentLength = CIRCUMFERENCE / Math.max(1, summaries.length)
  const visibleSegmentLength = Math.max(1, segmentLength - 6)
  const highest = summaries.reduce<DailyForecastSummary | null>((current, item) => current === null || item.meanProbability > current.meanProbability ? item : current, null)
  const sourceLabel = source === 'model-api' ? 'Live model' : source === 'fallback-precomputed' ? 'Fallback forecast' : 'Mock data'
  const sourceClass = source === 'model-api' ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-amber-200'

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">1–7 Day Fire Detection Forecast</h2>
        <span className={`w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${sourceClass}`}>{sourceLabel}</span>
      </div>

      <div className="mt-2 flex justify-center">
        <div className="relative h-56 w-56">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full" role="img" aria-label="Daily regional mean fire detection probability donut">
            <title>1–7 day regional mean fire detection probability</title>
            <desc>Each equal segment represents one local forecast day. Segment colour represents fire detection probability.</desc>
            <circle cx={CENTRE} cy={CENTRE} r={RADIUS} fill="none" stroke="#f1f5f9" strokeWidth="32" />
            {summaries.map((summary, index) => (
              <circle key={summary.date} cx={CENTRE} cy={CENTRE} r={RADIUS} fill="none" stroke={forecastProbabilityColour(summary.meanProbability)} strokeWidth="32" strokeDasharray={`${visibleSegmentLength} ${CIRCUMFERENCE - visibleSegmentLength}`} strokeDashoffset={-index * segmentLength} transform={`rotate(-90 ${CENTRE} ${CENTRE})`}>
                <title>{summary.date}: {formatProbability(summary.meanProbability)} detection probability; {formatAnomaly(summary.anomaly)} climatology anomaly</title>
              </circle>
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-500">Highest probability</span>
            <strong className="mt-1 text-2xl text-slate-900">{highest ? formatProbability(highest.meanProbability) : 'Unavailable'}</strong>
            <span className="text-xs text-slate-500">{highest ? formatDate(highest.date) : 'No forecast date'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5" aria-label="Daily forecast values">
        {summaries.map((summary) => <div key={summary.date} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-[0.68rem] text-slate-600">
          <i className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: forecastProbabilityColour(summary.meanProbability) }} />
          <strong className="text-slate-800">{formatDate(summary.date)}</strong>
          <span>{formatProbability(summary.meanProbability)}</span>
          <span className="ml-auto text-slate-400">{formatAnomaly(summary.anomaly)}</span>
        </div>)}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.65rem] text-slate-500" aria-label="Fire detection probability colour scale">
        {FORECAST_PROBABILITY_BANDS.map((band) => <span key={band.label} className="inline-flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: band.colour }} />{band.label}</span>)}
      </div>
    </section>
  )
}
