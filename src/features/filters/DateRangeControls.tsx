import { useState } from 'react'
import type { MonthRange } from '../../shared/lib'

export interface DateRangeControlsProps {
  range: MonthRange | null
  availableRange: MonthRange | null
  disabled?: boolean
  onChange: (range: MonthRange) => void
}

export function DateRangeControls({ range, availableRange, disabled = false, onChange }: DateRangeControlsProps) {
  const [draft, setDraft] = useState<MonthRange | null>(range)

  if (!draft || !availableRange) {
    return <div className="rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-xs leading-5 text-slate-500 shadow-lg shadow-slate-900/10 backdrop-blur">Select a map location to load the available historical period.</div>
  }

  const invalid = draft.start > draft.end
  function update(next: MonthRange) {
    setDraft(next)
    if (next.start <= next.end) onChange(next)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-900/10 backdrop-blur">
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs font-medium text-slate-600">Start month
          <input type="month" value={draft.start} min={availableRange.start} max={availableRange.end} disabled={disabled} onChange={(event) => update({ ...draft, start: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 disabled:bg-slate-100" />
        </label>
        <label className="text-xs font-medium text-slate-600">End month
          <input type="month" value={draft.end} min={availableRange.start} max={availableRange.end} disabled={disabled} onChange={(event) => update({ ...draft, end: event.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 disabled:bg-slate-100" />
        </label>
      </div>
      {invalid && <p className="mt-2 text-xs text-red-700" role="alert">Start month must not be after end month.</p>}
    </div>
  )
}

