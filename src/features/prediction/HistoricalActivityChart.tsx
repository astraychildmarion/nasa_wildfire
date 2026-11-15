import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AreaOfInterest, PredictionMonthlyPoint } from '../../shared/types'
import { CHART_HEIGHT, getChartWidth, getChartX, getTrendChartGeometry, toPath } from './chartGeometry'

export interface HistoricalActivityChartProps {
  points: PredictionMonthlyPoint[]
  unit: string
  displayDivisor?: number
  displayUnit?: string
  aoi: AreaOfInterest
  isSelectedAOI: boolean
}

export function HistoricalActivityChart({ points, unit, displayDivisor = 1, displayUnit = unit, aoi, isSelectedAOI }: HistoricalActivityChartProps) {
  const historicalPoints = useMemo(() => points
    .filter((point) => point.observed !== null)
    .map((point) => ({ ...point, observed: point.observed === null ? null : point.observed / displayDivisor })), [displayDivisor, points])
  const chartWidth = useMemo(() => getChartWidth(historicalPoints.length), [historicalPoints.length])
  const scrollRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: historicalPoints.length })
  const updateVisibleRange = useCallback((element: HTMLDivElement) => {
    const viewportStart = element.scrollLeft
    const viewportEnd = viewportStart + element.clientWidth
    const firstVisible = historicalPoints.findIndex((_, index) => getChartX(index, historicalPoints.length, chartWidth) >= viewportStart)
    const firstAfterViewport = historicalPoints.findIndex((_, index) => getChartX(index, historicalPoints.length, chartWidth) > viewportEnd)
    const start = Math.max(0, (firstVisible === -1 ? historicalPoints.length - 1 : firstVisible) - 1)
    const end = Math.min(historicalPoints.length, firstAfterViewport === -1 ? historicalPoints.length : firstAfterViewport + 1)
    setVisibleRange((current) => current.start === start && current.end === end ? current : { start, end })
  }, [chartWidth, historicalPoints])
  const geometry = useMemo(() => getTrendChartGeometry(historicalPoints, chartWidth, {
    includeZero: false,
    paddingRatio: 0.04,
    rangeStartIndex: visibleRange.start,
    rangeEndIndex: visibleRange.end,
  }), [chartWidth, historicalPoints, visibleRange])
  const yearLabels = historicalPoints.flatMap((point, index) => point.month.endsWith('-01') ? [{ index, label: point.month.slice(0, 4) }] : [])
  const yTicks = [geometry.minValue, (geometry.minValue + geometry.maxValue) / 2, geometry.maxValue]

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
      updateVisibleRange(scrollRef.current)
    }
  }, [chartWidth, updateVisibleRange])

  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Historical Monthly Activity</h2>
        <div className="flex flex-wrap items-center justify-end gap-3 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">{isSelectedAOI ? 'Selected AOI' : 'Default California AOI'}</span>
          <span>Latitude <strong className="font-semibold text-slate-900">{aoi.centre.latitude.toFixed(4)}</strong></span>
          <span>Longitude <strong className="font-semibold text-slate-900">{aoi.centre.longitude.toFixed(4)}</strong></span>
        </div>
      </div>
      <div ref={scrollRef} className="mt-3 overflow-x-auto rounded-lg border border-slate-100" tabIndex={0} aria-label="Scrollable historical monthly activity chart" onScroll={(event) => updateVisibleRange(event.currentTarget)}>
        <svg className="h-auto" style={{ width: chartWidth, maxWidth: 'none' }} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`} role="img" aria-label={`Historical monthly activity in ${displayUnit}`}>
          <title>Historical monthly fire activity</title>
          <desc>Monthly historical activity. The chart opens at the latest years and can be scrolled left for earlier history.</desc>
          {yTicks.map((value) => {
            const y = geometry.minValue === geometry.maxValue ? CHART_HEIGHT / 2 : 28 + ((geometry.maxValue - value) / (geometry.maxValue - geometry.minValue)) * (CHART_HEIGHT - 82)
            return <g key={value}><line x1="64" x2={chartWidth - 28} y1={y} y2={y} stroke="#e2e8f0" /><text x="56" y={y + 4} textAnchor="end" className="fill-slate-500 text-[11px]">{value.toFixed(1)}</text></g>
          })}
          <path d={toPath(geometry.historical)} fill="none" stroke="#1d4ed8" strokeWidth="2.25" />
          {geometry.historical.map((point, index) => <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="3.5" fill="#1d4ed8" stroke="#fff" strokeWidth="1"><title>{historicalPoints[index]?.month}: {point.value.toFixed(2)} {displayUnit}</title></circle>)}
          {yearLabels.map(({ index, label }) => {
            const x = getChartX(index, historicalPoints.length, chartWidth)
            return <g key={label}><line x1={x} x2={x} y1="366" y2="372" stroke="#94a3b8" /><text x={x} y="392" textAnchor="middle" className="fill-slate-600 text-[11px]">{label}</text></g>
          })}
          <text x="18" y="210" transform="rotate(-90 18 210)" textAnchor="middle" className="fill-slate-700 text-[11px]">Intensity</text>
          <text x={chartWidth / 2} y="414" textAnchor="middle" className="fill-slate-600 text-[11px]">Historical year / month</text>
        </svg>
      </div>
    </section>
  )
}
