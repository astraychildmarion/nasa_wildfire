# Prediction data layer

This slice defines the replaceable frontend prediction contract and deterministic mock source.
It does not connect to a backend and does not modify prediction UI components.

## Mock boundaries

- Historical points cover January 2001 through December 2026.
- Forecast points cover the next 12 months, January through December 2027.
- Values are demonstration values, expressed in thousands of fire hotspots; they are not
  scientific observations or a fabricated backend response.
- Confidence intervals, risk scores, insights, and model confidence are independently supplied
  mock output from the repository.

## Backend confirmation required

- Prediction endpoint/query shape and whether AOI is required.
- Forecast units and interval semantics.
- Risk-level vocabulary and score range.
- Model metrics and confidence-factor definitions.

