# Historical Wildfire Activity Explorer

## Run Locally

### Prerequisites

- Node.js `20.19+` or `22.12+`
- npm

### Installation

```bash
git clone https://github.com/astraychildmarion/nasa_wildfire.git
cd nasa_wildfire
npm install
```

Create the local environment file:

```bash
cp .env.example .env.local
```

Set `VITE_API_BASE` in `.env.local` to the wildfire API URL. To use the deployed backend:

```ini
VITE_API_BASE=https://fire-backend-398373643848.us-central1.run.app
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The backend currently allows this development origin, so make sure port `5173` is available before starting Vite.

### Verification Commands

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## How I Used AI

I built this project with Codex as a development partner. AI drafted and proposed; I set the requirements, reviewed every change, and made the final calls.

- **Planning:** AI helped divide large requirements into small, testable vertical slices.
- **Architecture:** AI helped maintain clear separation between UI components, repositories, shared types, and analytics.
- **Implementation:** AI assisted with React components, TypeScript types, Leaflet integration, data visualisation, and responsive styling.
- **API integration:** AI helped map backend responses into stable frontend repository interfaces without coupling components directly to API formats.
- **Testing:** AI generated and refined focused tests for statistical calculations, API transformations, and chart behaviour.
- **Debugging:** AI helped identify issues such as stale development servers, incorrect year ordering, compressed chart trends, and redundant interface content.

Commits where AI wrote a substantial part of the change carry a `Co-authored-by` trailer.
