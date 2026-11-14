import { CircleMarker, MapContainer, Popup, Rectangle, TileLayer, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import type { AreaOfInterest, HistoricalHotspot } from '../../shared/types'
import { createAreaOfInterest, type AOIDimensions } from './aoi'
import { MapInfoPanel } from './MapInfoPanel'
import type { MapInfoPanelData } from './mapInfoData'

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
  loading: boolean
  error: string | null
  aoiDimensions: AOIDimensions
  emptyMessage?: string
  infoPanelData?: MapInfoPanelData
  onAOIChange: (aoi: AreaOfInterest) => void
}

export function FireMap({
  aoi,
  hotspots,
  loading,
  error,
  aoiDimensions,
  emptyMessage,
  infoPanelData,
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
      </MapContainer>

      <MapInfoPanel data={infoPanelData} />

      {!aoi && (
        <div className="pointer-events-none absolute inset-x-4 bottom-5 z-[500] flex justify-center">
          <p className="rounded-full bg-white/70 px-4 py-2 text-center text-sm font-medium text-slate-700 shadow-lg ring-1 ring-white/70 backdrop-blur-sm">
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

