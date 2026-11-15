import { useState } from 'react'
import type { MonthRange } from '../../shared/lib'
import type { AreaOfInterest } from '../../shared/types'

export interface MapQueryValues { start: string; end: string; latitude: string; longitude: string }
export interface DateRangeControlsProps { range: MonthRange | null; availableRange: MonthRange | null; selectedAOI: AreaOfInterest | null; disabled?: boolean; onApplyQuery: (values: MapQueryValues) => void }

export function DateRangeControls({ range, availableRange, selectedAOI, disabled = false, onApplyQuery }: DateRangeControlsProps) {
  const [start, setStart] = useState(range?.start ?? '')
  const [end, setEnd] = useState(range?.end ?? '')
  const [latitude, setLatitude] = useState(selectedAOI ? String(selectedAOI.centre.latitude) : '')
  const [longitude, setLongitude] = useState(selectedAOI ? String(selectedAOI.centre.longitude) : '')
  const [error, setError] = useState<string | null>(null)
  function apply(nextStart = start, nextEnd = end) {
    if (!nextStart || !nextEnd) { setError('Choose a start and end month.'); return }
    if (nextStart > nextEnd) { setError('Start month must not be after end month.'); return }
    const hasLat = latitude.trim() !== ''; const hasLon = longitude.trim() !== ''
    if (hasLat !== hasLon) { setError('Enter both latitude and longitude, or leave both empty.'); return }
    if (hasLat) { const lat = Number(latitude); const lon = Number(longitude); if (!Number.isFinite(lat) || lat < -90 || lat > 90) { setError('Latitude must be between -90 and 90.'); return }; if (!Number.isFinite(lon) || lon < -180 || lon > 180) { setError('Longitude must be between -180 and 180.'); return } }
    setError(null); onApplyQuery({ start: nextStart, end: nextEnd, latitude, longitude })
  }
  return <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-900/10 backdrop-blur">
    <div className="grid grid-cols-2 gap-2">
      <label className="text-[11px] font-medium text-slate-600">Start month<input type="month" value={start} min={availableRange?.start} max={availableRange?.end} disabled={disabled} onChange={(event) => setStart(event.target.value)} className="mt-0.5 block w-full rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-900 disabled:bg-slate-100" /></label>
      <label className="text-[11px] font-medium text-slate-600">End month<input type="month" value={end} min={availableRange?.start} max={availableRange?.end} disabled={disabled} onChange={(event) => setEnd(event.target.value)} className="mt-0.5 block w-full rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-900 disabled:bg-slate-100" /></label>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-2">
      <label className="text-[11px] font-medium text-slate-600">Latitude (optional)<input inputMode="decimal" value={latitude} disabled={disabled} onChange={(event) => setLatitude(event.target.value)} placeholder="e.g. 45" className="mt-0.5 block w-full rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-900 disabled:bg-slate-100" /></label>
      <label className="text-[11px] font-medium text-slate-600">Longitude (optional)<input inputMode="decimal" value={longitude} disabled={disabled} onChange={(event) => setLongitude(event.target.value)} placeholder="e.g. -100" className="mt-0.5 block w-full rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-900 disabled:bg-slate-100" /></label>
    </div>
    {error && <p className="mt-2 text-xs text-red-700" role="alert">{error}</p>}
    <div className="mt-3 flex justify-end">
      <button type="button" disabled={disabled} onClick={() => apply()} className="ml-auto rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Apply</button>
    </div>
  </div>
}
