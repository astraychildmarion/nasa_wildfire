import type { CalendarMode } from '../../shared/types'

export interface CalendarModeToggleProps {
  mode: CalendarMode
  onChange: (mode: CalendarMode) => void
}

export function CalendarModeToggle({ mode, onChange }: CalendarModeToggleProps) {
  return (
    <div className="mb-3 inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1" aria-label="Calendar display mode">
      <button type="button" aria-pressed={mode === 'activity'} onClick={() => onChange('activity')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${mode === 'activity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Fire activity</button>
      <button type="button" aria-pressed={mode === 'anomaly'} onClick={() => onChange('anomaly')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${mode === 'anomaly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>Historical anomaly</button>
    </div>
  )
}

