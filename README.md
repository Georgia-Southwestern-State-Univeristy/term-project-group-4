# term-project-group-4

A Node.js-based project that includes automated testing and code linting to ensure code quality and consistency.

## Prerequisites

This project requires Node.js v24 LTS (Long Term Support). Download and install from the [official Node.js website](https://nodejs.org/).

## Google OAuth Setup

This application uses Google OAuth for user authentication. To set it up:

1. Go to the Google Cloud Console
2. Create a new project or select an existing one
3. Configure the OAuth consent screen
4. Create OAuth 2.0 credentials (Client ID and Client Secret)
5. Add `http://localhost:5173` to authorized JavaScript origins (frontend)
6. Add `http://localhost:3000/auth/google/callback` to authorized redirect URIs (backend callback)
7. Copy the Client ID and Client Secret to your `.env` file

Create a `.env` file in the project root with:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-random-session-secret
FRONTEND_URL=http://localhost:5173
```

In production, `SESSION_SECRET` must be explicitly set. The server refuses to start in production if that value is missing.

## Getting Started

1. Clone the project
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project root directory
   ```bash
   cd term-project-group-4
   ```

3. Install project dependencies
   ```bash
   npm install
   ```

## Running Locally

The app has two parts: a **Vite frontend** (serves the UI) and an **Express API server** (handles trip data storage). Both must be running for full functionality.


### Quick Start (both servers)

Run the frontend and backend together in a single terminal:
```bash
npm run dev:full
```
Then open `http://localhost:5173` in your browser.

### Running Separately

If you prefer separate terminals:

**Terminal 1 — Express API Server:**
```bash
npm run server
```
Starts the API at `http://localhost:3000`.

**Terminal 2 — Vite Frontend:**
```bash
npm run dev
```
Starts the UI at `http://localhost:5173` with hot reloading. API requests are automatically proxied to the Express server.

### API Endpoints

All endpoints require authentication.

- `GET /api/trips` - List all saved trips for the authenticated user
- `GET /api/trips/{tripId}` - Retrieve a single trip by ID (user-specific)
- `POST /api/saveTrip` - Create/save a new trip with checklist
- `PUT /api/trips/{tripId}` - Update an existing trip
- `DELETE /api/trips/{tripId}` - Delete a trip

Trip data is persisted through Knex using SQLite for local development. Each user sees only their own trips.

### Verify It Works

1. Run `npm run dev:full`
2. Open `http://localhost:5173`
3. Click "Login with Google" and authenticate
4. Enter a trip name, select a destination type, and set a duration
5. Click **Generate Checklist** to create a packing list
6. Click **Save Trip** to persist the trip to the server
7. Confirm the button shows "Saved!" with a trip ID
8. The trip appears in the **Saved Trips** list below the form
9. Use the filter input to search trips by name
10. Click **Load** on a saved trip to restore it into the form with its checklist

### API Documentation (Swagger UI)
After installing the server (`npm run server`), the OpenAPI documentation is available at:

- http://localhost:3000/docs

## End-to-End (E2E) Testing with Playwright

This project includes Playwright E2E tests that verify the core Smart Packing Checklist workflow across the real frontend and backend.

### Important Note

Playwright E2E tests are configured to use the project’s **test-mode authentication** rather than a real Google OAuth login. This keeps the tests focused on app behavior and avoids flaky external-auth automation.

Normal/manual use of the app can still use Google OAuth through the browser.

Playwright starts the app automatically through the configured `webServer`, so you do not need to manually run `npm run server` and `npm run dev` when using the E2E commands below.

## E2E Test Files

The current E2E suite includes:

1. **`tests/e2e/primary-workflow.spec.js`**
   - verifies create/save flow  
   - checks destination-specific checklist generation  

2. **`tests/e2e/integration.spec.js`**
   - verifies saved trip reload/edit behavior  

3. **`tests/e2e/failure-paths.spec.js`**
   - verifies invalid input handling and error toast behavior  

## Test Configuration

Playwright configuration is in `playwright.config.js` and includes:

- `BASE_URL` support  
- Chromium browser project  
- screenshots on failure  
- traces on first retry  
- automatic app startup via `webServer`  
- test auth header via `x-test-user-id`  
- centralized test-mode auth support for `/auth/user`, protected API routes, and `/auth/logout`  

## Running E2E Tests Locally

### Bash / macOS / Linux

```bash
npm install
npx playwright install

export NODE_ENV=test
export BASE_URL=http://localhost:5173
export FRONTEND_URL=http://localhost:5173
export TEST_USER_ID=demo-user-123
export SESSION_SECRET=test-session-secret

npx playwright test
```

### PowerShell (Windows)

```powershell
npm install
npx playwright install

$env:NODE_ENV="test"
$env:BASE_URL="http://localhost:5173"
$env:FRONTEND_URL="http://localhost:5173"
$env:TEST_USER_ID="demo-user-123"
$env:SESSION_SECRET="test-session-secret"

npx playwright test
```

## Run a Specific Test File

### Bash / macOS / Linux

```bash
npx playwright test tests/e2e/primary-workflow.spec.js
```

### PowerShell (Windows)

```powershell
npx playwright test tests/e2e/primary-workflow.spec.js
```

## Run in Headed / Debug / UI Mode

### Bash / macOS / Linux

```bash
npx playwright test --headed
npx playwright test --debug
npx playwright test --ui
```

### PowerShell (Windows)

```powershell
npx playwright test --headed
npx playwright test --debug
npx playwright test --ui
```

## View Test Report

```bash
npx playwright show-report
```

## CI Behavior

The CI pipeline includes a Playwright E2E stage, but it is currently non-blocking (`continue-on-error: true`) while the team continues stabilizing this workflow.

The deploy workflow now also waits for Elastic Beanstalk to finish updating and performs a post-deploy `/health` smoke test before treating the deployment as successful.

## Development Commands

- **Lint Code**: Check for code quality issues
  ```bash
  npm run lint
  ```

- **Run Unit Tests**: Execute the Vitest unit test suite
  ```bash
  npm run test
  ```

- **Build for Production**: Create an optimized build in the `dist/` folder
  ```bash
  npm run build
  ```

- **Preview Production Build**: Serve the production build locally
  ```bash
  npm run preview
  ```

- **Seed Sample Data**: Populate the database with demo trips and checklists
  ```bash
  npx knex seed:run
  ```

### Reinstall Dependencies
If you encounter dependency issues, reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```