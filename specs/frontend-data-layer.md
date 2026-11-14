# Frontend data layer

## Scope

This slice defines shared historical wildfire domain types, a frontend repository boundary,
a deterministic mock implementation, and pure calendar analytics. It does not connect to a
backend or modify the UI.

## Comparison policy

- A baseline period is inclusive of its start and end years.
- Missing values and records marked incomplete are excluded from baseline medians.
- When the comparison year falls inside the baseline period, that year is excluded for that
  comparison (leave-one-year-out) so a value is not compared partly against itself.
- An absolute difference remains valid for a zero baseline. Percentage difference is `null`
  when the baseline is zero because the percentage is undefined.

## Mock-data policy

Mock values are deterministic demonstration data, not scientific observations. Harmonized
values are independently supplied mock values and are never derived by adding or otherwise
combining MODIS and VIIRS values.

## Backend confirmation required

- Timestamp serialization and timezone semantics.
- Geographic bounding-box field names and antimeridian behavior.
- Sensor and confidence value vocabularies and units.
- Whether activity counts and confidence can be fractional.

