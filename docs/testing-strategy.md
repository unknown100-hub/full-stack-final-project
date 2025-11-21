# Testing & Quality Strategy

## Automated coverage

- **Unit tests**  
  - `services/nutritionService` validates calorie lookups and error handling.  
  - Authentication helpers and other critical utilities can be added following the Jest pattern under `backend/tests/`.
- **Integration tests**  
  - Supertest scenarios spin up the Express app against an in-memory MongoDB instance to exercise register/login, fitness logging, meal logging, and the nutrition lookup endpoint.
- **End-to-end flows**  
  - The supertest suite also covers a complete user journey (register → login → log fitness/meal → fetch summaries), ensuring the API chain works as expected.

Run `npm test` inside `backend/` to execute the full backend suite. Frontend Vitest coverage can be added by running `npm test` inside `frontend/fitness-tracker/` once component tests are introduced.

## Manual smoke testing

| Device / Browser | Steps |
| --- | --- |
| Desktop Chrome / Edge | Register, login, toggle theme, add fitness entry, add meal, view dashboard charts |
| Desktop Firefox / Safari | Repeat auth + data-entry flows to confirm storage and CORS |
| Mobile Safari / Chrome | Verify responsive landing page, drawer navigation, and form usability |

## Accessibility checklist

- Keyboard-only navigation across landing forms and dashboard tabs
- Color contrast validated with WCAG AA (hero gradient, CTA buttons, nav pills)
- Semantic HTML for lists/tables; ensure chart labels have textual equivalents (CalorieSummary cards)
- ARIA labels for toggle/theme buttons and interactive icons

## Code review & refactoring highlights

- Extracted Express app initialization to `backend/app.js` so it can be reused by tests and future tooling.
- Ensured Mongo connections are idempotent, preventing duplicate connections during test runs.
- Added comprehensive tests to prevent regressions in authentication, nutrition calculations, and CRUD endpoints.
