import { useEffect, useMemo, useRef } from 'react'
import type { PredictionMonthlyPoint } from '../../shared/types'
import { CHART_HEIGHT, getChartWidth, getChartX, getTrendChartGeometry, toAreaPath, toPath } from './chartGeometry'

export interface PredictionTrendChartProps {
  points: PredictionMonthlyPoint[]
  unit: string
}

export function PredictionTrendChart({ points, unit }: PredictionTrendChartProps) {
  const chartWidth = useMemo(() => getChartWidth(points.length), [points.length])
  const geometry = useMemo(() => getTrendChartGeometry(points, chartWidth), [chartWidth, points])
  const scrollRef = useRef<HTMLDivElement>(null)
  const yearLabels = points.flatMap((point, index) => point.month.endsWith('-01') ? [{ index, label: point.month.slice(0, 4) }] : [])
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
  }, [chartWidth, points.length])

  const yTicks = [geometry.minValue, (geometry.minValue + geometry.maxValue) / 2, geometry.maxValue]
  const forecastLine = geometry.forecast.length > 0 && geometry.historical.length > 0
    ? `${toPath([geometry.historical.at(-1)!, ...geometry.forecast])}`
    : toPath(geometry.forecast)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Historical &amp; Future Fire Activity</h2>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600" aria-label="Trend chart legend">
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-5 rounded-full bg-blue-700" />Historical observed</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-0.5 w-5 border-t-2 border-dashed border-blue-700" />Forecast median</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-3 w-5 rounded-sm bg-blue-200" />80% / 95% intervals</span>
        </div>
      </div>

      <div ref={scrollRef} className="mt-3 overflow-x-auto rounded-lg border border-slate-100" tabIndex={0} aria-label="Scrollable monthly trend chart">
        <svg className="h-auto" style={{ width: chartWidth, maxWidth: 'none' }} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`} role="img" aria-label="Historical observed fire activity and 12-month forecast with confidence intervals">
          <title>Historical observed fire activity and future forecast</title>
          <desc>Historical data from 2001 through 2026 is shown as a solid line. The next 12 months are shown as a dashed forecast with 80 and 95 percent confidence intervals.</desc>
          {yTicks.map((value) => {
            const y = geometry.minValue === geometry.maxValue ? CHART_HEIGHT / 2 : 28 + ((geometry.maxValue - value) / (geometry.maxValue - geometry.minValue)) * (CHART_HEIGHT - 82)
            return <g key={value}><line x1="64" x2={chartWidth - 28} y1={y} y2={y} stroke="#e2e8f0" /><text x="56" y={y + 4} textAnchor="end" className="fill-slate-500 text-[11px]">{value.toFixed(1)}</text></g>
          })}
          <path d={toAreaPath(geometry.lower95, geometry.upper95)} fill="#dbeafe" opacity="0.65" />
          <path d={toAreaPath(geometry.lower80, geometry.upper80)} fill="#93c5fd" opacity="0.5" />
          <line x1={geometry.boundaryX} x2={geometry.boundaryX} y1="28" y2="366" stroke="#64748b" strokeDasharray="5 5" />
          <path d={toPath(geometry.historical)} fill="none" stroke="#1d4ed8" strokeWidth="2.25" />
          {geometry.historical.map((point) => <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="3" fill="#1d4ed8" stroke="#ffffff" strokeWidth="0.8" />)}
          <path d={forecastLine} fill="none" stroke="#1d4ed8" strokeWidth="2.25" strokeDasharray="7 5" />
          <text x={Math.max(70, geometry.boundaryX - 12)} y="20" textAnchor="end" className="fill-slate-500 text-[11px]">Historical data (2001–2026)</text>
          <text x={Math.min(chartWidth - 220, geometry.boundaryX + 12)} y="20" className="fill-slate-500 text-[11px]">Next 12 months forecast</text>
          {yearLabels.map(({ index, label }) => {
            const x = getChartX(index, points.length, chartWidth)
            return <g key={label}><line x1={x} x2={x} y1="366" y2="372" stroke="#94a3b8" /><text x={x} y="392" textAnchor="middle" className="fill-slate-600 text-[11px]">{label}</text></g>
          })}
          <text x="18" y="210" transform="rotate(-90 18 210)" textAnchor="middle" className="fill-slate-600 text-[11px]">Monthly fire hotspots ({unit})</text>
          <text x={chartWidth / 2} y="414" textAnchor="middle" className="fill-slate-600 text-[11px]">Year / month</text>
        </svg>
      </div>
    </section>
  )
}

