# Technical Architecture Decisions

## 1. Split MERN-style stack (Express API + MongoDB + React SPA)
- **Context** - The backend boots an Express app, loads environment variables centrally, wires JSON/CORS middleware, connects to Mongo, and mounts user-facing routes under `/api/users` (`backend/server/server.js:1`). 

The frontend is a Vite-powered React SPA that handles auth, view routing, and dashboarding (`frontend/fitness-tracker/src/App.jsx:1`).
- **Rationale** - Keeps the data/API tier isolated from presentation, allows independent deployment/scaling, and lets each side use best-of-breed tooling (Express/Mongoose vs. modern React & Vite).
- **Consequences** - Requires CORS/proxy coordination during local dev, and API changes must stay in sync with the SPA client.

## 2. Store everything in a single `User` document with embedded arrays
- **Context** - Fitness entries and meals (with nested food items) live as arrays inside each user document rather than in separate collections (`backend/models/user.js:3`).
- **Rationale** - Simplifies CRUD (single query per user) and keeps per-user data colocated, which matches the tracker's primary access pattern.
- **Consequences** - Documents can grow quickly; we need to monitor MongoDB document size limits and consider splitting collections if data volume per user escalates.

## 3. Stateless JWT authentication propagated via Axios interceptor
- **Context** - Register/login endpoints issue signed JWTs (`backend/routes/users.js:9`), middleware validates Bearer tokens and attaches `userId` for all protected routes (`backend/middleware/auth.js:1`), and the frontend stores the token in `localStorage`, automatically attaching it on every Axios request (`frontend/fitness-tracker/src/lib/api.js:1`, `frontend/fitness-tracker/src/App.jsx:31`).
- **Rationale** - Keeps the API stateless for easy scaling and avoids standing up session infrastructure.
- **Consequences** - Tokens in `localStorage` are vulnerable to XSS; we must keep the SPA hardened and may later transition to HTTP-only cookies if security requirements tighten.

## 4. Multi-tier nutrition lookup (API -> local fallback -> client hints)
- **Context** - `/users/food-calories` calls a CalorieNinjas API when an API key is configured, then falls back to a bundled JSON dataset and fuzzy string matching before bubbling an error (`backend/services/nutritionService.js:5`, `backend/routes/users.js:98`). The frontend meal form pre-fills calories via a curated local list and auto-calls the backend lookup when needed (`frontend/fitness-tracker/src/components/mealLog.jsx:1`, `frontend/fitness-tracker/src/lib/foods.js:1`).
- **Rationale** - Provides a responsive UX with offline-friendly data, reduces third-party API calls, and still allows live data when keys are available.
- **Consequences** - Local data must be curated over time; discrepancies between client hints and backend fallbacks should be reconciled periodically.

## 5. Consolidated `/api/users` contract for all tracker features
- **Context** - Every capability (register/login, fitness CRUD, meal CRUD, nutrition lookup) is grouped inside a single router mounted at `/api/users` (`backend/routes/users.js:46`).
- **Rationale** - Keeps related concerns together and allows middleware (auth, validation) to be reused without duplicating Express routers.
- **Consequences** - As the API grows, we may need to split routers (for example `/api/fitness`, `/api/meals`) to avoid a monolithic file and to better express domain boundaries.

## 6. Client-side aggregation and visualization
- **Context** - React components fetch data directly from the API and compute summaries/visuals: `Dashboard` renders charts via Chart.js (`frontend/fitness-tracker/src/components/dashboard.jsx:1`), `CalorieSummary` performs time-window aggregations (`frontend/fitness-tracker/src/components/calorieSummary.jsx:10`), while `FitnessForm` and `MealsList` handle respective CRUD flows (`frontend/fitness-tracker/src/components/fitnessForm.jsx:4`, `frontend/fitness-tracker/src/components/mealsList.jsx:4`).
- **Rationale** - Keeps the backend lean (simple persistence) and leverages the SPA for interactive analytics.
- **Consequences** - Mobile or bandwidth-constrained clients must download full datasets; if this becomes heavy, add backend aggregation endpoints or pagination.

## 7. Local development proxy instead of CORS tweaking
- **Context** - Vite's dev server proxies `/api` calls to `http://localhost:5000`, so the SPA can assume a relative `/api` base URL (`frontend/fitness-tracker/vite.config.js:5`).
- **Rationale** - Avoids coupling the client to environment-specific URLs and means production can serve both front and back behind the same origin.
- **Consequences** - Deployments must replicate the `/api` prefix (either via reverse proxy or by co-hosting); otherwise, the SPA's Axios base URL needs to be overridden at build time.
