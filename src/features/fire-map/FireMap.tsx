import { divIcon } from 'leaflet'
import {
	CircleMarker,
	MapContainer,
	Marker,
	Popup,
	Rectangle,
	TileLayer,
	Tooltip,
	useMapEvents,
	useMap,
} from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import type { AreaOfInterest, HistoricalGridData, MonthlyActivity } from '../../shared/types';
import type { FireEventType, FireFieldNote } from '../../types/annotation'
import { createAreaOfInterest, type AOIDimensions } from './aoi';
import { GRID_COLORS, getGridCellBounds, getGridFillColor } from './gridScale';
import { MapInfoPanel } from './MapInfoPanel';
import type { MapInfoPanelData } from './mapInfoData';

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

function formatNativeBoundary(monthKey: string): string {
	const [year, month] = monthKey.split('-').map(Number)
	return new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' })
		.format(new Date(Date.UTC(year, month - 1, 1)))
}

interface MapClickHandlerProps {
	dimensions: AOIDimensions;
	onAOIChange: (aoi: AreaOfInterest) => void;
}

function MapClickHandler({ dimensions, onAOIChange }: MapClickHandlerProps) {
	useMapEvents({
		click(event) {
			onAOIChange(
				createAreaOfInterest(
					{ latitude: event.latlng.lat, longitude: event.latlng.lng },
					dimensions,
				),
			);
		},
	});
	return null;
}

function MapViewportController({ aoi }: { aoi: AreaOfInterest | null }) {
	const map = useMap();
	useEffect(() => {
		if (!aoi) return;
		map.fitBounds(
			[[aoi.bounds.south, aoi.bounds.west], [aoi.bounds.north, aoi.bounds.east]],
			{ padding: [24, 24], maxZoom: 7 },
		);
	}, [aoi, map]);
	return null;
}

function MapResizeController() {
	const map = useMap();
	useEffect(() => {
		const container = map.getContainer();
		const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
		observer.observe(container);
		return () => observer.disconnect();
	}, [map]);
	return null;
}

export interface FireMapProps {
	aoi: AreaOfInterest | null;
	gridData: HistoricalGridData | null;
	fieldNotes: FireFieldNote[];
	selectedMonth: string | null;
	selectedActivity: MonthlyActivity | null;
	loading: boolean;
	error: string | null;
	aoiDimensions: AOIDimensions;
	emptyMessage?: string;
	infoPanelData?: MapInfoPanelData;
	viirsNativeFrom?: string;
	onAOIChange: (aoi: AreaOfInterest) => void;
}

export function FireMap({
	aoi,
	gridData,
	fieldNotes,
	selectedMonth,
	selectedActivity,
	loading,
	error,
	aoiDimensions,
	emptyMessage,
	infoPanelData,
	viirsNativeFrom,
	onAOIChange,
}: FireMapProps) {
	const boundary: [[number, number], [number, number]] | null = aoi
		? [
				[aoi.bounds.south, aoi.bounds.west],
				[aoi.bounds.north, aoi.bounds.east],
			]
		: null;
	const statusClass = error
		? 'bg-white/80 text-red-700 ring-red-200'
		: loading
			? 'bg-white/80 text-slate-700 ring-slate-200'
			: 'bg-white/50 text-slate-600 ring-white/60';
	const gridCells = gridData?.cells ?? [];
	const maximumActivity = gridData?.maxHotspots ?? 0;
	const partialMonth = selectedActivity?.complete === false;

	return (
		<section className="relative h-[34rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			<MapContainer
				center={[45, -100]}
				zoom={4}
				minZoom={2}
				className="h-full w-full"
				scrollWheelZoom
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<MapClickHandler
					dimensions={aoiDimensions}
					onAOIChange={onAOIChange}
				/>
				<MapViewportController aoi={aoi} />
				<MapResizeController />

				{boundary && (
					<Rectangle
						bounds={boundary}
						pathOptions={{
							color: '#2563eb',
							weight: 2,
							fillColor: '#3b82f6',
							fillOpacity: 0.08,
						}}
					/>
				)}

				{aoi && (
					<CircleMarker
						center={[aoi.centre.latitude, aoi.centre.longitude]}
						radius={8}
						bubblingMouseEvents={false}
						pathOptions={{
							color: '#1d4ed8',
							fillColor: '#ffffff',
							fillOpacity: 1,
							weight: 3,
						}}
					>
						<Popup>User-selected AOI centre</Popup>
					</CircleMarker>
				)}

				{gridCells.map((cell) => (
					<Rectangle
						key={cell.cellId}
						bounds={getGridCellBounds(cell)}
						bubblingMouseEvents={false}
						pathOptions={{
							color: partialMonth ? '#7e22ce' : '#9a3412',
							fillColor: getGridFillColor(cell.hotspotCount, maximumActivity),
							fillOpacity: 0.72,
							weight: partialMonth ? 2.5 : 1,
							dashArray: partialMonth ? '6 4' : undefined,
						}}
					>
						<Popup>
							<div className="min-w-40 text-sm text-slate-800">
								<strong>Monthly fire activity grid</strong>
								<dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
									<dt>Month</dt><dd>{selectedMonth ?? 'Unavailable'}</dd>
									<dt>Activity</dt><dd>{cell.hotspotCount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</dd>
									<dt>Unit</dt><dd>NOAA-20-equivalent hotspots</dd>
									<dt>Source</dt><dd>{selectedActivity?.source ?? 'Unavailable'}</dd>
									<dt>Grid centre</dt><dd>{cell.latitude.toFixed(2)}, {cell.longitude.toFixed(2)}</dd>
									<dt>Status</dt><dd>{selectedActivity ? (selectedActivity.complete ? 'Complete month' : 'Partial month') : 'Unavailable'}</dd>
								</dl>
							</div>
						</Popup>
					</Rectangle>
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

			<MapInfoPanel data={infoPanelData} />

			{gridCells.length > 0 && (
				<div className="pointer-events-none absolute bottom-5 left-5 z-[500] max-w-xs rounded-lg bg-white/90 px-3 py-2 text-[11px] text-slate-700 shadow-md ring-1 ring-slate-200 backdrop-blur-sm">
					<p className="font-semibold">Harmonized hotspot intensity</p>
					<div className="mt-1 flex items-center gap-1" aria-label="Activity intensity from lower to higher">
						<span>Lower</span>
						{GRID_COLORS.map((color) => <i key={color} className="h-3 w-5" style={{ backgroundColor: color }} />)}
						<span>Higher</span>
					</div>
					<p className="mt-1 text-[10px] text-slate-600">NOAA-20-equivalent hotspots per 0.5° cell per month</p>
					{viirsNativeFrom && <p className="mt-1 text-[10px] leading-4 text-slate-500">Before {formatNativeBoundary(viirsNativeFrom)}: MODIS scaled · From {formatNativeBoundary(viirsNativeFrom)}: VIIRS native</p>}
					{selectedActivity?.source && <p className="mt-1 text-[10px] font-medium text-slate-600">Selected month: {selectedActivity.source === 'MODISxk' ? 'MODIS scaled' : 'VIIRS native'}</p>}
				</div>
			)}

			{!aoi && (
				<div className="pointer-events-none absolute inset-x-4 bottom-5 z-[500] flex justify-center">
					<p className="rounded-full bg-white/70 px-4 py-2 text-center text-sm font-medium text-slate-700 shadow-lg ring-1 ring-white/70 backdrop-blur-sm">
						Click anywhere on the map to explore historical fire
						activity.
					</p>
				</div>
			)}

			{aoi &&
				(loading ||
					error ||
					(gridCells.length === 0 && emptyMessage)) && (
					<div
						className="pointer-events-none absolute inset-x-4 bottom-5 z-[500] flex justify-center"
						role="status"
					>
						<p
							className={`rounded-full px-4 py-2 text-center text-sm shadow-md ring-1 backdrop-blur-sm ${statusClass}`}
						>
							{loading
								? 'Loading historical fire data…'
								: (error ?? emptyMessage)}
						</p>
					</div>
				)}
		</section>
	);
}
