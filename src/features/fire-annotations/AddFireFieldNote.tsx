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
const impactOptions = ['Structures affected', 'Evacuations', 'Smoke impact', 'Ecological benefit', 'Contained', 'No ground fire found', 'High fire risk (potential)']
const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100'

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    street?: string
    housenumber?: string
    postcode?: string
    city?: string
    district?: string
    county?: string
    state?: string
    country?: string
  }
}

const geocodeCache = new Map<string, PhotonFeature[]>()

function parseCoordinates(query: string): { lat: number; lng: number } | null {
  const match = query.trim().match(/^\(?\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*\)?$/)
  if (!match) return null
  const lat = Number(match[1])
  const lng = Number(match[2])
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return { lat, lng }
}

function formatPlace(feature: PhotonFeature): string {
  const { properties } = feature
  const street = [properties.housenumber, properties.street].filter(Boolean).join(' ')
  return [...new Set([
    properties.name,
    street,
    properties.postcode,
    properties.city,
    properties.district,
    properties.county,
    properties.state,
    properties.country,
  ].filter((part): part is string => Boolean(part)))].join(', ')
}

interface FormValues {
  eventDate: string
  lat: string
  lng: string
  locationSearch: string
  locationName: string
  fireType: FireEventType
  impacts: string[]
  notes: string
  reporterRole: ReporterRole
  evidenceUrl: string
}

const initialForm: FormValues = {
  eventDate: '', lat: '', lng: '', locationSearch: '', locationName: '', fireType: 'wildfire', impacts: [],
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
  if (values.lat.trim() === '' || values.lng.trim() === '' || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    errors.push('Choose an address search result or enter a coordinate pair within valid latitude and longitude ranges.')
  }
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
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<PhotonFeature[]>([])
  const [locationError, setLocationError] = useState<string | null>(null)

  async function searchLocation() {
    const query = values.locationSearch.trim()
    if (!query) {
      setLocationError('Enter an address, place name, or coordinate pair.')
      setSearchResults([])
      return
    }

    const coordinates = parseCoordinates(query)
    if (coordinates) {
      setValues((current) => ({
        ...current,
        ...coordinates,
        lat: String(coordinates.lat),
        lng: String(coordinates.lng),
        locationName: 'Coordinates',
      }))
      setSearchResults([])
      setLocationError(null)
      return
    }

    const cacheKey = query.toLocaleLowerCase()
    setSearching(true)
    setLocationError(null)
    setSearchResults([])
    try {
      let features = geocodeCache.get(cacheKey)
      if (!features) {
        const params = new URLSearchParams({ q: query, limit: '5', lang: 'en' })
        const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`)
        if (!response.ok) throw new Error('Search service unavailable')
        const result = await response.json() as { features?: PhotonFeature[] }
        features = result.features ?? []
        geocodeCache.set(cacheKey, features)
      }
      setSearchResults(features)
      if (features.length === 0) setLocationError('No matching places found. Try a more specific address or enter coordinates.')
    } catch {
      setLocationError('Address search is unavailable right now. You can still search by coordinate pair.')
    } finally {
      setSearching(false)
    }
  }

  function chooseLocation(feature: PhotonFeature) {
    const [lng, lat] = feature.geometry.coordinates
    const locationName = formatPlace(feature)
    setValues((current) => ({
      ...current,
      lat: String(lat),
      lng: String(lng),
      locationName,
      locationSearch: locationName,
    }))
    setSearchResults([])
    setLocationError(null)
  }

  function updateLocationSearch(value: string) {
    const coordinates = parseCoordinates(value)
    setValues((current) => ({
      ...current,
      locationSearch: value,
      lat: coordinates ? String(coordinates.lat) : '',
      lng: coordinates ? String(coordinates.lng) : '',
      locationName: coordinates ? 'Coordinates' : '',
    }))
    setSearchResults([])
    setLocationError(null)
  }

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
        <div className="sm:col-span-2">
          <label htmlFor="field-note-location-search" className="text-sm font-medium text-slate-700">Search address or coordinates</label>
          <div className="mt-1 flex gap-2">
            <input id="field-note-location-search" type="search" placeholder="Address, place, or lat, lng" value={values.locationSearch} onChange={(e) => updateLocationSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void searchLocation() } }} className="block min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" aria-describedby="location-search-help" />
            <button type="button" onClick={() => void searchLocation()} disabled={searching} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-wait disabled:opacity-60">{searching ? 'Searching…' : 'Search'}</button>
          </div>
          <p id="location-search-help" className="mt-1.5 text-xs leading-5 text-slate-500">Coordinate pairs are parsed locally. Address queries are sent to Photon (OpenStreetMap data); keep searches occasional. <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer" className="underline underline-offset-2">Photon</a> · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline underline-offset-2">OpenStreetMap</a></p>
          {searching && <p className="mt-2 text-sm text-slate-600" role="status">Searching places…</p>}
          {locationError && <p className="mt-2 text-sm text-amber-800" role="status">{locationError}</p>}
          {searchResults.length > 0 && <ul className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white" aria-label="Address search results">{searchResults.map((feature, index) => <li key={`${feature.geometry.coordinates.join(',')}-${index}`} className="border-b border-slate-100 last:border-b-0"><button type="button" onClick={() => chooseLocation(feature)} className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none">{formatPlace(feature) || 'Unnamed place'}<span className="mt-0.5 block text-xs text-slate-500">{feature.geometry.coordinates[1].toFixed(5)}, {feature.geometry.coordinates[0].toFixed(5)}</span></button></li>)}</ul>}
          {values.lat && values.lng && <p className="mt-2 text-xs text-emerald-800" role="status">Selected coordinates: {Number(values.lat).toFixed(5)}, {Number(values.lng).toFixed(5)}</p>}
        </div>
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
