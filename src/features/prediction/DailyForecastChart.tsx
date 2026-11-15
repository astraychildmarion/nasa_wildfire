import type { DailyForecastSummary, ForecastSource } from '../../shared/types'

const WIDTH = 560
const HEIGHT = 360
const PLOT = { left: 72, right: 24, top: 28, bottom: 58 }

function clampProbability(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function formatDate(date: string): string {
  const [, month, day] = date.split('-')
  return `${month}/${day}`
}

function makePath(values: number[], xFor: (index: number) => number, yFor: (value: number) => number): string {
  return values.map((value, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yFor(value)}`).join(' ')
}

export interface DailyForecastChartProps {
  summaries: DailyForecastSummary[]
  source: ForecastSource
}

export function DailyForecastChart({ summaries, source }: DailyForecastChartProps) {
  const plotWidth = WIDTH - PLOT.left - PLOT.right
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom
  const xFor = (index: number) => PLOT.left + (summaries.length <= 1 ? plotWidth / 2 : (index / (summaries.length - 1)) * plotWidth)
  const yFor = (value: number) => PLOT.top + (1 - clampProbability(value)) * plotHeight
  const forecastPath = makePath(summaries.map((item) => item.meanProbability), xFor, yFor)
  const climatologyPath = makePath(summaries.map((item) => item.climatologyMeanProbability), xFor, yFor)
  const sourceLabel = source === 'model-api' ? 'Live model' : source === 'fallback-precomputed' ? 'Fallback forecast' : 'Mock data'
  const sourceClass = source === 'model-api' ? 'bg-emerald-50 text-emerald-800 ring-emerald-200' : 'bg-amber-50 text-amber-800 ring-amber-200'

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">1–7 Day Fire Detection Forecast</h2>
        </div>
        <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${sourceClass}`}>{sourceLabel}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600" aria-label="Forecast chart legend">
        <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-5 bg-blue-700" />Forecast regional mean</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-5 border-t-2 border-dashed border-slate-500" />Historical climatology</span>
        <strong className="font-medium text-slate-700">Unit: probability (%) per grid cell per local day</strong>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-100">
        <svg className="h-auto w-full min-w-[32rem]" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Seven-day regional mean fire detection probability chart">
          <title>1–7 day fire detection probability</title>
          <desc>Daily regional mean forecast probability compared with historical climatology. Values are percentages, not ignition probability.</desc>
          {[0, 0.25, 0.5, 0.75, 1].map((value) => {
            const y = yFor(value)
            return <g key={value}><line x1={PLOT.left} x2={WIDTH - PLOT.right} y1={y} y2={y} stroke="#e2e8f0" /><text x={PLOT.left - 10} y={y + 4} textAnchor="end" className="fill-slate-500 text-[11px]">{Math.round(value * 100)}%</text></g>
          })}
          <path d={climatologyPath} fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="6 5" />
          <path d={forecastPath} fill="none" stroke="#1d4ed8" strokeWidth="2.5" />
          {summaries.map((summary, index) => <g key={summary.date}>
            <circle cx={xFor(index)} cy={yFor(summary.meanProbability)} r="4.5" fill="#1d4ed8" stroke="#fff" strokeWidth="1.5"><title>{summary.date}: {(summary.meanProbability * 100).toFixed(1)}% forecast probability</title></circle>
            <text x={xFor(index)} y={HEIGHT - 34} textAnchor="middle" className="fill-slate-600 text-[11px]">{formatDate(summary.date)}</text>
          </g>)}
          <text x="18" y={PLOT.top + plotHeight / 2} transform={`rotate(-90 18 ${PLOT.top + plotHeight / 2})`} textAnchor="middle" className="fill-slate-700 text-[11px]">Fire Detection Probability (%)</text>
          <text x={PLOT.left + plotWidth / 2} y={HEIGHT - 8} textAnchor="middle" className="fill-slate-600 text-[11px]">Local forecast date (MM/DD)</text>
        </svg>
      </div>
    </section>
  )
}
