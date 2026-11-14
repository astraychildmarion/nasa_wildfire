# Interactive historical fire map

## User interaction

Map click → parent AOI state → repository monthly activity → date range and calendar update →
calendar month click → repository hotspots → map markers.

## Initial state

- The viewport is centred on North America at latitude 45, longitude -100, zoom 3.
- No AOI exists and no AOI-specific repository call runs before a map click.
- Calendar mode is `activity`; sensor mode is `harmonized`; selected month is `null`.
- The date range is derived from the latest 12 complete monthly records after data becomes
  available for a selected AOI.

## AOI policy

The map receives configurable latitude and longitude spans. A map click creates a rectangular
AOI centred on the click by applying half of each span in every direction. This slice uses a
temporary 4° × 4° configuration in the application integration layer.

## Date policy

- Month keys use `YYYY-MM` and ranges are inclusive.
- Start must not follow end.
- Changing the range clears the selected month and hotspots only when that month leaves the range.
- Selecting a month queries from the first instant through the final instant of that UTC month.

## Historical-data language

All points are described as historical detections. No UI text implies live or real-time data.

