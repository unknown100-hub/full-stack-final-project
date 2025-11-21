# Technical Architecture Overview

## High-level diagram

```
React SPA (Vite) ──Axios──▶ Express API ──▶ MongoDB
      │                         │
      └── Sentry (browser) ◀───┘├── CalorieNinjas (optional)
                                └── Local nutrition fallback JSON
```

- **Frontend** serves the SPA, handles authentication (JWT stored in localStorage), manages forms/dashboards, and calls the REST API via Axios using `/api` proxying in development.
- **Backend** exposes REST endpoints under `/api/users/*`, handles auth, persistence, nutrition lookup, and serves health metrics. MongoDB holds a single `User` collection with embedded `fitnessData` + `meals`.
- **Monitoring** uses optional Sentry DSNs for both tiers; initialization occurs only when DSNs are supplied.

## Backend modules

| Module | Purpose |
| --- | --- |
| `server/server.js` | Entry-point; imports the shared `app` for local/serverless usage. |
| `app.js` | Express wiring (middleware, routes, health checks) and Sentry setup. |
| `config/db.js` | Establishes mongoose connections (idempotent to support tests, CLI tools). |
| `models/user.js` | Single schema containing user info plus arrays for fitness entries and meals. |
| `routes/users.js` | Authentication, fitness CRUD, meal logging, nutrition lookup endpoints. |
| `services/nutritionService.js` | CalorieNinjas integration with fuzzy fallback dataset. |
| `monitoring/sentry.js` | Optional Sentry instrumentation and error handler. |

## Frontend modules

| Module | Purpose |
| --- | --- |
| `src/App.jsx` | Controls landing/authorized views, theme toggles, layout, GMT chip. |
| `src/lib/api.js` | Axios instance with `/api` base URL and JWT interceptor. |
| `src/components/` | Dashboard, forms, meal UI, reusable summary components. |
| `src/main.jsx` | Bootstraps React root + Sentry configuration. |
| `src/index.css` & `src/App.css` | Theme variables, layout, hero styling. |

## Data flow

1. Users register/login; backend hashes passwords, issues JWTs.
2. Axios attaches the token via interceptor for all `/users/*` calls.
3. Fitness + meal endpoints mutate the `User` document arrays; returns updated state so UI can refresh.
4. Dashboard components call `/users/fitness` + `/users/meals` to compute summary stats and charts.
5. Nutrition lookup hits CalorieNinjas when API key exists, otherwise uses `backend/data/nutritionFallback.json`.

## Deployment considerations

- Serve the frontend statically (Vite build output) behind a CDN. Configure rewrites so `/api` calls pass through to the backend host.
- Deploy the backend to any Node-friendly host (Docker, Render, fly.io, etc.) and configure environment variables listed in the README.
- Enable Sentry by supplying DSNs as secrets; adjust sampling rates for production to balance observability vs. cost.
- Use the GitHub Actions workflow as a base for CD by appending deployment jobs once tests pass.
