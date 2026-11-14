import type { MapInfoPanelData } from './mapInfoData'
import { MOCK_MAP_INFO } from './mapInfoData'

function WarningIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-red-600" fill="currentColor"><path d="M12 3 1.8 20.5h20.4L12 3Zm0 5.1c.5 0 .9.4.9.9v5.2a.9.9 0 0 1-1.8 0V9c0-.5.4-.9.9-.9Zm0 9.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" /></svg>
}

function CalendarIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M7 14h.01M12 14h.01M17 14h.01" /></svg>
}

function ActivityRing({ percentage }: { percentage: number }) {
  return <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#f97316 ${percentage}%, #fed7aa ${percentage}% 100%)` }} aria-label={`${percentage}% of annual burning activity`}><span className="h-1.5 w-1.5 rounded-full bg-white" /></span>
}

export function MapInfoPanel({ data = MOCK_MAP_INFO }: { data?: MapInfoPanelData }) {
  return (
    <aside
      className="pointer-events-auto absolute right-4 top-20 z-[500] w-[min(42rem,calc(100%-2rem))] rounded-xl border border-slate-200 bg-white/90 p-2 shadow-lg shadow-slate-900/10 backdrop-blur-sm sm:right-5 sm:top-20 sm:p-3"
      aria-label="Historical fire activity summary"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <div className="grid grid-cols-3 divide-x divide-slate-200">
        <section className="min-w-0 px-2 sm:px-4">
          <div className="flex items-center gap-1 text-[0.6rem] font-medium uppercase tracking-wide text-slate-500 sm:text-xs"><WarningIcon /> <span>Current month anomaly</span></div>
          <p className="mt-1 truncate text-lg font-bold text-red-600 sm:text-2xl">+{data.anomalyPercent}%</p>
          <p className="mt-0.5 text-[0.58rem] leading-3 text-slate-500 sm:text-[0.68rem] sm:leading-4">{data.anomalyComparisonLabel}</p>
        </section>
        <section className="min-w-0 px-2 sm:px-4">
          <p className="text-[0.6rem] font-medium uppercase tracking-wide text-amber-700 sm:text-xs">Historical peak period</p>
          <p className="mt-1 truncate text-base font-bold text-slate-900 sm:text-2xl">{data.peakPeriodLabel}</p>
          <p className="mt-0.5 truncate text-[0.58rem] leading-3 text-amber-800 sm:text-[0.68rem] sm:leading-4">Cumulative FRP {data.peakFrpMw.toLocaleString()} MW</p>
        </section>
        <section className="min-w-0 px-2 sm:px-4">
          <div className="flex items-center gap-1 text-[0.6rem] font-medium uppercase tracking-wide text-slate-500 sm:text-xs"><CalendarIcon /> <span>Fire season window</span></div>
          <p className="mt-1 truncate text-base font-bold text-slate-900 sm:text-2xl">{data.seasonWindowLabel}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[0.58rem] leading-3 text-slate-500 sm:text-[0.68rem] sm:leading-4"><ActivityRing percentage={data.seasonActivityPercent} /> {data.seasonActivityPercent}% of annual burning activity</p>
        </section>
      </div>
    </aside>
  )
}

