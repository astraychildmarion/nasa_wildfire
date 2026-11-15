# Historical CSV data export

## Interaction

- The primary navigation export control opens a small menu.
- Calendar CSV uses the currently selected AOI bbox.
- Hotspot-grid CSV uses the currently selected AOI bbox and inclusive selected month range.
- Export links are unavailable until an AOI exists; the grid export also requires a date range.
- Downloads use direct browser navigation so the backend `Content-Disposition` filename is
  preserved. No CSV data is parsed or held in React state for downloads.

## Endpoints

- `GET /api/calendar.csv?bbox=w,s,e,n`
- `GET /api/hotspots.csv?bbox=w,s,e,n&from=YYYY-MM&to=YYYY-MM`
