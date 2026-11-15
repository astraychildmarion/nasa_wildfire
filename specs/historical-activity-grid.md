# Historical monthly activity grid

This slice defines the frontend domain contract and deterministic mock source for monthly
historical activity aggregated into 0.5-degree grid cells. It does not modify the map UI or call
the backend.

## Semantics

- A grid coordinate is the centre of a 0.5-degree cell, not an exact hotspot location.
- `hotspotCount` is a NOAA-20-equivalent monthly value and may contain decimals.
- Only non-zero cells are supplied by the planned CSV source.
- `partial` explicitly marks an unfinished month and must not be inferred as complete data.
- Sources are normalized to `MODISxk` or `VIIRS`; a `-partial` CSV suffix maps to `partial: true`.
- Missing grid data must not be presented as a precise zero without coverage confirmation.
- An empty cell collection with `coverage: inside` represents genuine zero activity. With
  `coverage: outside`, the UI displays the supported-region message instead.

## CSV parsing policy

- The parser accepts the documented `month`, `cellId`, `lat`, `lon`,
  `hotspots_noaa20_equivalent`, and `source` headers.
- Empty and header-only responses produce an empty collection.
- Invalid headers or rows fail the whole parse with a row-specific error; malformed data is not
  silently omitted from the map.
- UTF-8 BOM, CRLF line endings, and quoted fields are supported without an additional dependency.

## Migration policy

The original point-hotspot contract was removed when the map grid-rendering slice replaced all
consumers. Aggregated cell centres must not be converted back into precise hotspot markers.

## Backend mapping

- `/api/hotspots` accepts bbox filtering and returns `cellSize`, `maxHotspots`, and exact bounds.
- The grid request uses a configurable three-degree radius around the selected AOI centre so the
  map can show surrounding activity. This expanded query does not replace or resize the selected
  AOI used by the calendar, prediction, export, or visible AOI boundary.
- The map uses response bounds directly and scales colours with `hotspots / maxHotspots`.
- The selected `/api/activity` record supplies month source and complete/partial status.
- After an inside-coverage activity response, the selected range end is automatically selected so
  the map requests and displays a monthly grid without requiring a separate calendar click.
- The map legend identifies values as harmonized NOAA-20-equivalent monthly cell counts, displays
  the backend-provided VIIRS-native boundary, and labels the selected month's source.
- Whether absence of a returned cell means zero activity or unavailable coverage remains a
  backend semantic constraint; the UI does not draw an absent cell as an explicit zero.
