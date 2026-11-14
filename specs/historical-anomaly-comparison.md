# Historical median and anomaly comparison

## Baseline

The application integration layer configures an inclusive 2019–2023 baseline for the current
mock dataset. Shared analytics apply the existing leave-one-year-out policy when a displayed
year is itself inside that baseline. Missing and incomplete records are excluded.

## Display modes

- Activity uses observed monthly activity and a sequential blue scale.
- Anomaly uses the absolute difference from the historical same-month median and a diverging
  blue–neutral–orange scale. The neutral midpoint represents zero difference.
- Invalid comparisons remain unavailable; they are never converted to zero anomaly.
- Percentage difference is supplementary summary information. It is unavailable when the
  historical median is zero, while the absolute difference remains valid.

## Interaction ownership

Mode changes only update calendar presentation state. Hotspot requests continue to depend only
on AOI and selected month, so changing modes preserves the map and does not request hotspots.

