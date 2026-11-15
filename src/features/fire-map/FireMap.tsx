import {
	CircleMarker,
	MapContainer,
	Popup,
	Rectangle,
	TileLayer,
	useMapEvents,
	useMap,
} from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import type { AreaOfInterest, HistoricalGridData, MonthlyActivity } from '../../shared/types';
import { createAreaOfInterest, type AOIDimensions } from './aoi';
import { GRID_COLORS, getGridCellBounds, getGridFillColor } from './gridScale';
import { MapInfoPanel } from './MapInfoPanel';
import type { MapInfoPanelData } from './mapInfoData';

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

export interface FireMapProps {
	aoi: AreaOfInterest | null;
	gridData: HistoricalGridData | null;
	selectedMonth: string | null;
	selectedActivity: MonthlyActivity | null;
	loading: boolean;
	error: string | null;
	aoiDimensions: AOIDimensions;
	emptyMessage?: string;
	infoPanelData?: MapInfoPanelData;
	onAOIChange: (aoi: AreaOfInterest) => void;
}

export function FireMap({
	aoi,
	gridData,
	selectedMonth,
	selectedActivity,
	loading,
	error,
	aoiDimensions,
	emptyMessage,
	infoPanelData,
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
				zoom={3}
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
			</MapContainer>

			<MapInfoPanel data={infoPanelData} />

			{gridCells.length > 0 && (
				<div className="pointer-events-none absolute bottom-5 left-5 z-[500] rounded-lg bg-white/85 px-3 py-2 text-[11px] text-slate-700 shadow-md ring-1 ring-slate-200 backdrop-blur-sm">
					<p className="font-semibold">Monthly activity intensity</p>
					<div className="mt-1 flex items-center gap-1" aria-label="Activity intensity from lower to higher">
						<span>Lower</span>
						{GRID_COLORS.map((color) => <i key={color} className="h-3 w-5" style={{ backgroundColor: color }} />)}
						<span>Higher</span>
					</div>
					<p className="mt-1 text-[10px] text-slate-500">{gridData?.unit}</p>
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
