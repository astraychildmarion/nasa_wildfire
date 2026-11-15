import type { MapInfoPanelData } from './mapInfoData'

function WarningIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-red-600" fill="currentColor"><path d="M12 3 1.8 20.5h20.4L12 3Zm0 5.1c.5 0 .9.4.9.9v5.2a.9.9 0 0 1-1.8 0V9c0-.5.4-.9.9-.9Zm0 9.1a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" /></svg>
}

function CalendarIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></svg>
}

function signedPercent(value: number | null): string {
  if (value === null) return 'Unavailable'
  const rounded = Math.round(value)
  return `${rounded > 0 ? '+' : ''}${rounded}%`
}

export function MapInfoPanel({ data }: { data?: MapInfoPanelData }) {
  if (!data) return null
  return (
    <aside className="pointer-events-auto absolute right-4 top-[13rem] z-[500] w-[min(42rem,calc(100%-2rem))] rounded-xl border border-slate-200 bg-white/90 p-2 shadow-lg shadow-slate-900/10 backdrop-blur-sm sm:right-5 sm:top-[13rem] sm:p-3" aria-label="Historical fire activity summary" onClick={(event) => event.stopPropagation()} onPointerDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
      <div className="grid grid-cols-3 divide-x divide-slate-200">
        <section className="min-w-0 px-2 sm:px-4">
          <div className="flex items-center gap-1 text-[0.6rem] font-medium uppercase tracking-wide text-slate-500 sm:text-xs"><WarningIcon /><span>Latest month anomaly</span></div>
          <p className="mt-1 truncate text-lg font-bold text-red-600 sm:text-2xl">{signedPercent(data.anomalyPercent)}</p>
          <p className="mt-0.5 text-[0.68rem] text-slate-500">{data.latestMonth}</p>
        </section>
        <section className="min-w-0 px-2 sm:px-4">
          <p className="text-[0.6rem] font-medium uppercase tracking-wide text-amber-700 sm:text-xs">Historical peak month</p>
          <p className="mt-1 truncate text-base font-bold text-slate-900 sm:text-2xl">{data.peakMonthLabel}</p>
          <p className="mt-0.5 text-[0.68rem] text-slate-500">Peak calendar month</p>
        </section>
        <section className="min-w-0 px-2 sm:px-4">
          <div className="flex items-center gap-1 text-[0.6rem] font-medium uppercase tracking-wide text-slate-500 sm:text-xs"><CalendarIcon /><span>Highest activity year</span></div>
          <p className="mt-1 truncate text-base font-bold text-slate-900 sm:text-2xl">{data.topYear ?? 'Unavailable'}</p>
          <p className="mt-0.5 truncate text-[0.68rem] text-slate-500">{data.topYearTotal === null ? 'Unavailable' : `${data.topYearTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })} hotspots`}</p>
        </section>
      </div>
    </aside>
  )
}
