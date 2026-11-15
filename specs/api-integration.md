# Backend API integration

## Transport policy

- The API base URL comes from `VITE_API_BASE` and falls back to `http://localhost:8080`.
- Trailing slashes are removed before endpoint paths are appended.
- AOI bounds are serialized in `west,south,east,north` order.
- JSON requests use a shared transport with an injectable `fetch` implementation for tests.
- Non-success responses are converted to `ApiError`, preserving Problem Details `status`,
  `title`, and `detail` when supplied.
- Network failures and invalid successful JSON responses are reported as API errors.
- Runtime repositories must not silently replace failed real responses with mock data.
- Top-level `coverage` metadata is preserved. Outside results are never presented as zero
  activity, while inside results with no cells remain valid zero-activity results.
- A 404 from the daily forecast is presented as an unsupported-region state.

## Rollout

Historical runtime data uses `/api/activity`, `/api/calendar`, and `/api/hotspots`. Prediction
runtime data uses `/api/outlook` and `/api/forecast`.
