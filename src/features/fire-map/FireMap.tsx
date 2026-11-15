import { divIcon } from 'leaflet'
import { CircleMarker, MapContainer, Marker, Popup, Rectangle, TileLayer, Tooltip, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { AreaOfInterest, HistoricalHotspot } from '../../shared/types'
import type { FireEventType, FireFieldNote } from '../../types/annotation'
import { createAreaOfInterest, type AOIDimensions } from './aoi'

const fieldNoteIcon = divIcon({
  className: '',
  html: '<span style="display:grid;width:34px;height:34px;place-items:center;border:1px solid #cbd5e1;border-radius:9px;background:#fff;box-shadow:0 2px 7px #0f172a40;color:#334155"><svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3.5" width="13" height="17" rx="2"/><path d="M9.5 3.8v16.4M12 8h4M12 12h4M12 16h4"/><path d="M4.5 7h1.2M4.5 11h1.2M4.5 15h1.2"/></svg></span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  tooltipAnchor: [0, -17],
})

const fireTypeLabels: Record<FireEventType, string> = {
  wildfire: 'Uncontrolled wildfire',
  prescribed_burn: 'Prescribed burn',
  agricultural: 'Agricultural / land clearing',
  false_alarm: 'False alarm / heat source',
}

function FieldNoteTooltip({ note }: { note: FireFieldNote }) {
  return (
    <div className="w-full min-w-0 p-3 text-left text-slate-800 [overflow-wrap:anywhere]">
      <div className="flex items-start justify-between gap-2">
        <strong className="text-sm font-semibold">{fireTypeLabels[note.fireType]}</strong>
        <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">Demo</span>
      </div>
      <dl className="mt-2 grid grid-cols-[5rem_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-xs leading-4">
        <dt className="text-slate-500">Address</dt><dd className="min-w-0 font-medium [overflow-wrap:anywhere]">{note.locationName ?? 'United States'}</dd>
        <dt className="text-slate-500">Event date</dt><dd className="min-w-0 [overflow-wrap:anywhere]">{note.eventDate}</dd>
        <dt className="text-slate-500">Coordinates</dt><dd className="min-w-0 [overflow-wrap:anywhere]">{note.lat.toFixed(4)}, {note.lng.toFixed(4)}</dd>
        <dt className="text-slate-500">Reported by</dt><dd className="min-w-0 [overflow-wrap:anywhere]">{note.reporterRole.replaceAll('_', ' ')}</dd>
      </dl>
      <p className="mt-2 [overflow-wrap:anywhere] border-t border-slate-200 pt-2 text-xs leading-4 text-slate-600">{note.notes}</p>
      {note.impacts.length > 0 && <p className="mt-2 [overflow-wrap:anywhere] text-[11px] font-medium text-slate-600">Impacts: {note.impacts.join(', ')}</p>}
    </div>
  )
}

interface MapClickHandlerProps {
  dimensions: AOIDimensions
  onAOIChange: (aoi: AreaOfInterest) => void
}

function MapClickHandler({ dimensions, onAOIChange }: MapClickHandlerProps) {
  useMapEvents({
    click(event) {
      onAOIChange(createAreaOfInterest(
        { latitude: event.latlng.lat, longitude: event.latlng.lng },
        dimensions,
      ))
    },
  })
  return null
}

export interface FireMapProps {
  aoi: AreaOfInterest | null
  hotspots: HistoricalHotspot[]
  fieldNotes: FireFieldNote[]
  loading: boolean
  error: string | null
  aoiDimensions: AOIDimensions
  emptyMessage?: string
  onAOIChange: (aoi: AreaOfInterest) => void
}

export function FireMap({
  aoi,
  hotspots,
  fieldNotes,
  loading,
  error,
  aoiDimensions,
  emptyMessage,
  onAOIChange,
}: FireMapProps) {
  const boundary: [[number, number], [number, number]] | null = aoi
    ? [[aoi.bounds.south, aoi.bounds.west], [aoi.bounds.north, aoi.bounds.east]]
    : null

  return (
    <section className="relative h-[34rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapContainer
        center={[45, -100]}
        zoom={3}
        minZoom={2}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler dimensions={aoiDimensions} onAOIChange={onAOIChange} />

        {boundary && (
          <Rectangle
            bounds={boundary}
            pathOptions={{ color: '#2563eb', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.08 }}
          />
        )}

        {aoi && (
          <CircleMarker
            center={[aoi.centre.latitude, aoi.centre.longitude]}
            radius={8}
            bubblingMouseEvents={false}
            pathOptions={{ color: '#1d4ed8', fillColor: '#ffffff', fillOpacity: 1, weight: 3 }}
          >
            <Popup>User-selected AOI centre</Popup>
          </CircleMarker>
        )}

        {hotspots.map((hotspot) => (
          <CircleMarker
            key={hotspot.id}
            center={[hotspot.latitude, hotspot.longitude]}
            radius={6}
            bubblingMouseEvents={false}
            pathOptions={{ color: '#991b1b', fillColor: '#ef4444', fillOpacity: 0.85, weight: 2 }}
          >
            <Popup>
              <div className="min-w-40 text-sm text-slate-800">
                <strong>Historical fire detection</strong>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                  <dt>Sensor</dt><dd className="uppercase">{hotspot.sensor}</dd>
                  <dt>Detected</dt><dd>{new Date(hotspot.detectedAt).toLocaleString()}</dd>
                  <dt>Latitude</dt><dd>{hotspot.latitude.toFixed(3)}</dd>
                  <dt>Longitude</dt><dd>{hotspot.longitude.toFixed(3)}</dd>
                  {hotspot.confidence !== undefined && <><dt>Confidence</dt><dd>{hotspot.confidence}</dd></>}
                </dl>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {fieldNotes.map((note) => (
          <Marker
            key={note.id}
            position={[note.lat, note.lng]}
            icon={fieldNoteIcon}
            zIndexOffset={500}
          >
            <Tooltip direction="auto" offset={[0, -4]} opacity={1} className="field-note-tooltip !rounded-lg !border-slate-200 !p-0 !shadow-xl">
              <FieldNoteTooltip note={note} />
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-medium text-slate-600 shadow backdrop-blur">
        Fictional field note examples
      </div>

      {!aoi && (
        <div className="pointer-events-none absolute inset-x-4 bottom-5 z-[500] flex justify-center">
          <p className="rounded-full bg-white/95 px-4 py-2 text-center text-sm font-medium text-slate-700 shadow-lg ring-1 ring-slate-200 backdrop-blur">
            Click anywhere on the map to explore historical fire activity.
          </p>
        </div>
      )}

      {aoi && (loading || error || (hotspots.length === 0 && emptyMessage)) && (
        <div className="pointer-events-none absolute inset-x-4 bottom-5 z-[500] flex justify-center" role="status">
          <p className={`rounded-full bg-white/95 px-4 py-2 text-center text-sm shadow-lg ring-1 backdrop-blur ${error ? 'text-red-700 ring-red-200' : 'text-slate-700 ring-slate-200'}`}>
            {loading ? 'Loading historical fire data…' : error ?? emptyMessage}
          </p>
        </div>
      )}
    </section>
  )
}

