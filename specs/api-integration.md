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

## Rollout

Historical runtime data uses `/api/activity`, `/api/calendar`, and `/api/hotspots`. Prediction
remains on its mock repository until its separate reviewable migration slice.
