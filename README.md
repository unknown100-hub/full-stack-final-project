# Fitness Tracker

Modern MERN-styled health tracker that lets users log workouts and meals, visualize trends, and estimate nutrition data with a CalorieNinjas fallback. This repo contains both backend (Express + MongoDB) and frontend (React + Vite) apps plus shared documentation and automation.

## Stack

- **Backend:** Node 20, Express 5, MongoDB (via Mongoose 8), JWT auth, CalorieNinjas + local nutrition data, Sentry error monitoring.
- **Frontend:** React 19 + Vite 7, Axios API layer, Chart.js visualizations, Testing Library + Vitest, Sentry browser telemetry.
- **Tooling:** Jest/Supertest integration tests, GitHub Actions CI, npm workspaces via root scripts, docs under `/docs`.

## Getting started

### Prerequisites

- Node.js 20+ and npm 10+
- MongoDB instance (local or remote)
- Optional: CalorieNinjas API key and Sentry DSNs for monitoring

### Clone & install

```bash
git clone <repo-url>
cd fitness-tracker

# Backend deps
cd backend
npm install

# Frontend deps
cd ../frontend/fitness-tracker
npm install
```

### Environment variables

Create `backend/.env` with:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fitness_tracker
JWT_SECRET=dev-secret
CALORIE_NINJAS_API_KEY=           # optional, fallbacks used when empty
SENTRY_DSN=                       # optional backend Sentry DSN
SENTRY_TRACES_SAMPLE_RATE=0.2
```

Create `frontend/fitness-tracker/.env`:

```
VITE_API_BASE=/api
VITE_SENTRY_DSN=                 # optional DSN for browser errors
VITE_SENTRY_TRACES_SAMPLE_RATE=0.2
VITE_SENTRY_REPLAY_SAMPLE_RATE=0.1
```

### Run locally

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend/fitness-tracker
npm run dev
```

Vite proxies `/api` requests to the backend (see `vite.config.js`).

## Testing

- **Backend:** `npm test --prefix backend` (Jest + mongodb-memory-server, includes API integration flows).
- **Frontend:** `npm test --prefix frontend/fitness-tracker` (Vitest + Testing Library).
- **Root shortcut:** `npm test` runs the frontend suite by default; `npm run test:backend` is also available.

CI (see `.github/workflows/ci.yml`) installs dependencies, runs backend tests, then frontend tests/build for every push/PR targeting `main` or `master`.

## Monitoring & error tracking

- **Backend:** Sentry is automatically initialised when `SENTRY_DSN` is provided. Handlers capture HTTP traces and forward uncaught errors.
- **Frontend:** `@sentry/react` initialises tracing + Replay when `VITE_SENTRY_DSN` exists. Sampling rates are configurable via env vars.
- Configure dashboards/alerts from your Sentry project; DSN secrets should be injected via CI/CD secrets or deployment platform vars.

## Deployment

CI currently focuses on automated verification. To deploy, extend `.github/workflows/ci.yml` or add a new workflow/job that:

1. Builds the frontend (`npm run build --prefix frontend/fitness-tracker`) and publishes the `dist/` folder to your host (e.g., Netlify, S3, Vercel).
2. Ships the backend via your preferred platform (Heroku, Render, Docker image, etc.), ensuring the `.env` variables above are set.
the deployment link is https://mern-final-project-unknown100-hub-q.vercel.app/

## Documentation

- `docs/api.md` – REST endpoints, request/response samples.
- `docs/user-guide.md` – UI walkthrough for end-users.
- `docs/architecture-overview.md` – system diagram, module responsibilities, deployment notes.
- `docs/architecture-decisions.md` – detailed decision log.
- `docs/testing-strategy.md` – automated + manual QA plan.

## Contributing

1. Fork & create a topic branch.
2. Run formatters/lints/tests locally.
3. Submit a PR; the CI workflow will run automatically.

Please review the testing + documentation standards before merging to keep the tracker stable and easy to onboard.*** End Patch
