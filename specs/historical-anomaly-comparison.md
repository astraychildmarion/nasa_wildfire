# Historical median and anomaly comparison

## Baseline

The API supplies the authoritative same-month median, absolute anomaly, and percentage anomaly
for harmonized records. The application integration layer retains an inclusive 2019–2023
baseline for mock records and other sensor modes. Local fallback analytics apply the existing
leave-one-year-out policy when a displayed year is itself inside that baseline.

## Display modes

- Activity uses observed monthly activity and a sequential blue scale.
- Anomaly uses the absolute difference from the historical same-month median and a diverging
  blue–neutral–orange scale. The neutral midpoint represents zero difference.
- Missing, incomplete, and invalid comparisons display as "Not comparable"; they are never
  converted to zero anomaly.
- Percentage difference is supplementary summary information. It is unavailable when the
  historical median is zero, while the absolute difference remains valid.

## Interaction ownership

Mode changes only update calendar presentation state. Hotspot requests continue to depend only
on AOI and selected month, so changing modes preserves the map and does not request hotspots.

