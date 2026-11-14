import { useState } from 'react'
import type { FormEvent } from 'react'
import type { FireEventType, NewFireFieldNote, ReporterRole } from '../../types/annotation'

const eventLabels: Record<FireEventType, string> = {
  wildfire: 'Uncontrolled wildfire',
  prescribed_burn: 'Prescribed burn',
  agricultural: 'Agricultural / land clearing',
  false_alarm: 'False alarm / heat source',
}
const roleLabels: Record<ReporterRole, string> = {
  local_resident: 'Local resident / community member',
  small_landowner: 'Small landowner',
  first_responder: 'Fire / emergency responder',
  land_manager_sci: 'Land manager / researcher',
}
const impactOptions = ['Structures affected', 'Evacuations', 'Smoke impact', 'Ecological benefit', 'Contained', 'No ground fire found']
const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

interface FormValues {
  eventDate: string
  lat: string
  lng: string
  locationName: string
  fireType: FireEventType
  impacts: string[]
  notes: string
  reporterRole: ReporterRole
  evidenceUrl: string
}

const initialForm: FormValues = {
  eventDate: '', lat: '', lng: '', locationName: '', fireType: 'wildfire', impacts: [],
  notes: '', reporterRole: 'local_resident', evidenceUrl: '',
}

export interface AddFireFieldNoteProps {
  onSubmit: (note: NewFireFieldNote) => Promise<void>
  onClose?: () => void
  initialLocation?: { lat: number; lng: number; name?: string }
  initialEventDate?: string
}

function validEventDate(value: string): boolean {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const month = Number(value.slice(5, 7))
    return month >= 1 && month <= 12
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function validate(values: FormValues): string[] {
  const errors: string[] = []
  if (!validEventDate(values.eventDate)) errors.push('Enter a valid event month (YYYY-MM) or date (YYYY-MM-DD).')
  const lat = Number(values.lat)
  const lng = Number(values.lng)
  if (values.lat.trim() === '' || !Number.isFinite(lat) || lat < -90 || lat > 90) errors.push('Latitude is required and must be between -90 and 90.')
  if (values.lng.trim() === '' || !Number.isFinite(lng) || lng < -180 || lng > 180) errors.push('Longitude is required and must be between -180 and 180.')
  if (values.notes.trim() === '') errors.push('Add a field description before submitting.')
  if (values.notes.length > 300) errors.push('Description must be 300 characters or fewer.')
  if (values.evidenceUrl.trim()) {
    try {
      const url = new URL(values.evidenceUrl)
      if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('unsupported protocol')
    } catch {
      errors.push('Evidence must be a valid http or https URL.')
    }
  }
  return errors
}

export function AddFireFieldNote({ onSubmit, onClose, initialLocation, initialEventDate = '' }: AddFireFieldNoteProps) {
  const [values, setValues] = useState<FormValues>(() => ({
    ...initialForm,
    eventDate: initialEventDate,
    lat: initialLocation ? String(initialLocation.lat) : '',
    lng: initialLocation ? String(initialLocation.lng) : '',
    locationName: initialLocation?.name ?? '',
  }))
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setSuccess(false)
    if (nextErrors.length) return
    setSubmitting(true)
    try {
      await onSubmit({
        eventDate: values.eventDate,
        lat: Number(values.lat),
        lng: Number(values.lng),
        locationName: values.locationName.trim() || undefined,
        fireType: values.fireType,
        impacts: values.impacts,
        notes: values.notes.trim(),
        reporterRole: values.reporterRole,
        evidenceUrl: values.evidenceUrl.trim() || undefined,
      })
      setValues({
        ...initialForm,
        eventDate: initialEventDate,
        lat: initialLocation ? String(initialLocation.lat) : '',
        lng: initialLocation ? String(initialLocation.lng) : '',
        locationName: initialLocation?.name ?? '',
      })
      setSuccess(true)
    } catch {
      setErrors(['The report could not be saved. Please try again.'])
    } finally {
      setSubmitting(false)
    }
  }

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }))
    setSuccess(false)
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Community field record</p><h2 id="field-note-title" className="mt-1 text-xl font-semibold text-slate-900">Add a field note</h2><p className="mt-1 text-sm text-slate-500">Add local context to a historical satellite detection.</p></div>
        {onClose && <button type="button" onClick={onClose} className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500">Close</button>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">Event month or date<input required aria-label="Event month or date" type="text" placeholder="YYYY-MM or YYYY-MM-DD" value={values.eventDate} onChange={(e) => update('eventDate', e.target.value)} className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700">Event type<select value={values.fireType} onChange={(e) => update('fireType', e.target.value as FireEventType)} className={inputClass}>{Object.entries(eventLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700">Latitude<input required type="number" min="-90" max="90" step="any" value={values.lat} onChange={(e) => update('lat', e.target.value)} className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700">Longitude<input required type="number" min="-180" max="180" step="any" value={values.lng} onChange={(e) => update('lng', e.target.value)} className={inputClass} /></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Location or grid name <span className="font-normal text-slate-400">(optional)</span><input value={values.locationName} onChange={(e) => update('locationName', e.target.value)} className={inputClass} /></label>
        <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-slate-700">Impacts <span className="font-normal text-slate-400">(select any that apply)</span></legend><div className="mt-2 flex flex-wrap gap-2">{impactOptions.map((impact) => <label key={impact} className={`cursor-pointer rounded-lg border px-3 py-2 text-xs transition ${values.impacts.includes(impact) ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}><input className="sr-only" type="checkbox" checked={values.impacts.includes(impact)} onChange={(e) => update('impacts', e.target.checked ? [...values.impacts, impact] : values.impacts.filter((item) => item !== impact))} />{impact}</label>)}</div></fieldset>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Field description <span className="font-normal text-slate-400">(300 characters max)</span><textarea required rows={4} maxLength={300} value={values.notes} onChange={(e) => update('notes', e.target.value)} className={inputClass} /><span className="mt-1 block text-right text-xs font-normal text-slate-500">{values.notes.length}/300</span></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Reporter role<select value={values.reporterRole} onChange={(e) => update('reporterRole', e.target.value as ReporterRole)} className={inputClass}>{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">Evidence URL <span className="font-normal text-slate-400">(optional)</span><input type="url" placeholder="https://…" value={values.evidenceUrl} onChange={(e) => update('evidenceUrl', e.target.value)} className={inputClass} /></label>
      </div>
      {errors.length > 0 && <ul className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{errors.map((error) => <li key={error}>{error}</li>)}</ul>}
      {success && <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">Field note submitted.</p>}
      <button type="submit" disabled={submitting} className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Saving note…' : 'Submit field note'}</button>
    </form>
  )
}
