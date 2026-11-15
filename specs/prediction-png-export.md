# Prediction dashboard PNG export

## Export policy

- The download menu always displays the prediction PNG option, but it remains disabled outside
  the prediction route and until both monthly outlook and daily forecast data have loaded.
- The exported target is the complete prediction dashboard content without the global header or
  download menu.
- The PNG uses a solid stone background, two-times pixel density, and the filename
  `wildfire-prediction-dashboard.png`.
- Export captures the current UI state, including the visible historical-chart viewport and the
  current expanded or collapsed methodology state.
- Exporting does not trigger additional API requests or hidden dashboard rendering.
