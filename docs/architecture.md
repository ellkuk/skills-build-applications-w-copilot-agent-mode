# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep rendering and interaction in React components, use the shared API client for relative `/api` requests, and show loading, empty, and accessible error states.
- Logic tier decision: Keep request validation and capability behavior in Express routes and services; return deliberate 4xx responses for invalid input and unknown users.
- Data tier decision: Define required fields and relationships in the four Mongoose models, and keep representative seed data repeatable without replacing unrelated records.
- Activity tracking approach: Validate submitted user and team IDs before database lookups, create activities with their references and submitted fields, and compute points and occurrence time in the service.
- Team management approach: Validate that a team has a name, preserve its name and mascot, and expose its members through the teams API.
- Leaderboard approach: Sum activity points per team, sort totals descending, and assign ranks starting at 1 in the service layer.
- Workout suggestions approach: Find the user by email, use their goal and recent activities to select and explain relevant suggestions, and return a deliberate 4xx when no user matches.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — model validation failures point to missing or incorrect schema constraints; seed failures point to incomplete or non-repeatable representative data. Baseline: 4 failures and 1 pass; the four model validation cases fail.
- API command: `npm run test:api --prefix octofit-tracker/backend` — failures identify incorrect status codes or activity, team, leaderboard, or suggestion behavior. Baseline: all 4 contract tests fail; invalid creates return 501, the leaderboard is empty, and workout suggestions do not match the expected user.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — failures identify missing API requests/rendering or missing loading, empty, and accessible error states. Baseline: all 15 presentation contract tests fail against the pending component placeholders.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — TypeScript errors indicate backend implementation or type-contract problems. Run after data and logic changes; not run for this starter baseline.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — TypeScript or Vite errors indicate frontend implementation or bundling problems. Run after presentation changes; not run for this starter baseline.
