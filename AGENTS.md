# Project Development Rules

These instructions apply only to this project.

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + Space UI
- React Leaflet for geographic maps
- React + CSS Grid for the calendar heatmap
- Lightweight Feature-Based Architecture

## Development Approach

Follow Spec-First + Vertical Slice Development.

Each task must deliver one small, complete, working user interaction:

User Interaction → React State → Data Repository → UI Update

### Rules

1. Read the relevant slice specification before implementation.
2. Implement only the requested slice.
3. A slice may modify multiple feature folders when necessary.
4. Do not build entire feature modules before integration.
5. Keep the application runnable after every slice.
6. Use mock data through a repository interface until the backend contract is confirmed.
7. Do not invent backend endpoints or response formats.
8. Reuse existing types, utilities, and components.
9. Do not add unnecessary dependencies or abstractions.
10. Do not refactor unrelated code.
11. Run TypeScript checks and relevant tests.
12. Stop after completing the current slice.

Additional task constraints:

- Implement one complete feature per task.
- Keep feature-specific code inside its feature folder.
- Keep `App.tsx` as the integration point.
- Do not assume the backend API format.
- Use mock data until the backend contract is confirmed.

## Architecture

- Organise code by feature.
- Keep shared types and analytics in `src/shared/`.
- Keep cross-feature state in the application integration layer.
- Use props and callbacks for feature communication.
- Keep data access separate from visual components.

## Scope

- Historical wildfire data only.
- No real-time data.
- Prediction mode and exports are future phases.
- Do not implement future-phase features unless explicitly requested.

## AI Coding Efficiency

- Read only files relevant to the current task.
- Avoid unnecessary full-project exploration.
- Keep changes focused.
- If the same fix fails twice, stop and report the issue.
- Report modified files, verification results, and unresolved assumptions.
