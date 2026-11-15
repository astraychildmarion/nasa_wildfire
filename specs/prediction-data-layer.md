# Daily fire-detection forecast data layer

This slice defines the replaceable frontend contract for a 1–7 local-day forecast and a
deterministic mock source. It does not connect to a backend or modify UI components.

## Meaning and units

- Probability values use the `0..1` range in the data layer and are formatted as percentages by
  the UI.
- A probability is the chance that at least one hotspot is detected in a 0.5-degree grid cell on
  a local day by one NOAA-20 VIIRS-equivalent satellite.
- It is not an ignition probability or a prediction that a wildfire will happen.
- The UI label must be **Fire Detection Probability**.
- `anomaly` is the ratio between forecast probability and climatological probability. `1.0`
  means the historical average level. Missing or undefined ratios remain `null`.

## Daily forecast contract

- The query contains an AOI, an optional `asOf` local date, and a horizon from 1 through 7 days.
- Region summaries and grid-cell items are independent arrays.
- Grid coordinates represent cell centres, not exact fire locations.
- `observed: null` means an observation is not available yet; it is not zero.
- Mock values are deterministic demonstration data and are not scientific observations.
- The mock source is explicitly labelled `mock`.

## Migration policy

The existing monthly prediction contract remains temporarily available so the current UI stays
runnable. It will be removed when the daily forecast UI slice replaces all consumers.

## Backend confirmation required

- Whether backend probability fields use `0..1` or `0..100` (the frontend currently assumes
  `0..1`).
- The complete forecast response JSON and error-body format.
- Exact grid coordinate field names.
- Whether `observed` is binary or another numeric observation.

