# term-project-group-4

A Node.js-based project that includes automated testing and code linting to ensure code quality and consistency.

## Prerequisites

This project requires Node.js v24 LTS (Long Term Support). Download and install from the [official Node.js website](https://nodejs.org/).

## Google OAuth Setup

This application uses Google OAuth for user authentication. To set it up:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials (Client ID and Client Secret)
5. Add `http://localhost:5173` to authorized origins (for Vite dev server)
6. Add `http://localhost:5173/auth/google/callback` to authorized redirect URIs
7. Copy the Client ID and Client Secret to your `.env` file

Create a `.env` file in the project root with:
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-random-session-secret
```

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

Trip data is persisted to a SQLite database. Each user sees only their own trips.

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

This includes comprehensive E2E tests using Playwright that verify the entire user workflow including Google OAuth authentication, trip creation, checklist generation, and data persistence.

### Prerequisites for E2E Tests

1. **Google OAuth Test Account**: You need a real Google account for testing
   - Email: `group4termproject@gmail.com`
   - Password: Set via `TEST_PASSWORD` environment variable

2. **Environment Variables**: Set in `.env` or pass at runtime. Test uses localhost if there is no BAse URL in .env file
   ```bash
   BASE_URL=
   TEST_EMAIL=group4termproject@gmail.com
   TEST_PASSWORD=your-test-password
   ```

### Installing Playwright

Install Playwright and its browser binaries:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Running E2E Tests

**Important**: Both the backend API (port 3000) and frontend server (port 5173) must be running. Playwright will start these automatically, but you can also run them manually in separate terminals:

```bash
# Terminal 1: Start backend API
npm run server

# Terminal 2: Start frontend dev server
npm run dev

# Terminal 3: Run E2E tests
export TEST_PASSWORD="your-test-password"
npx playwright test
```

#### Running All Tests
```bash
export TEST_PASSWORD="your-test-password"
npx playwright test
```

#### Running Specific Test File
```bash
export TEST_PASSWORD="your-test-password"
npx playwright test tests/e2e/primary-workflow.spec.js
```

#### Running Tests in Headed Mode (see browser)
```bash
export TEST_PASSWORD="your-test-password"
npx playwright test --headed
```

#### Running Tests in Debug Mode
```bash
export TEST_PASSWORD="your-test-password"
npx playwright test --debug
```

#### Running Tests in UI Mode (interactive)
```bash
export TEST_PASSWORD="your-test-password"
npx playwright test --ui
```

### E2E Test Files

The test suite includes three test files:

1. **`tests/e2e/auth.spec.js`** - Authentication Tests
   - Verifies Google OAuth login flow works end-to-end
   - Confirms user is properly authenticated and logged in

2. **`tests/e2e/primary-workflow.spec.js`** - Primary Workflow Tests
   - Tests core user journey: login → create trip → generate checklist → save trip
   - Verifies checklist items are correctly generated for different destination types (beach, camping, city)
   - Uses timestamp-based unique trip names to avoid conflicts

3. **`tests/e2e/integration.spec.js`** - Integration Tests
   - Tests saving a trip and then loading it back
   - Verifies trip data is correctly persisted and restored
   - Confirms form is repopulated with saved trip information

4. **`tests/e2e/failure-paths.spec.js`** - Failure Path Tests
   - Tests error handling and edge cases
   - Verifies validation prevents saving trips with invalid data (e.g., spaces-only trip names)
   - Confirms error toast messages display when operations fail

### Test Configuration

Playwright configuration is in `playwright.config.js`:
- **Viewport**: 1920x1080 (ensures all elements are visible)
- **Timeout**: 30 seconds per test
- **Retries**: 0 on local, 2 on CI
- **Browsers**: Chromium (Firefox and WebKit commented out)
- **Web Servers**: Automatically starts both API (port 3000) and frontend (port 5173)

### Test Reports

After running tests, view detailed reports:
```bash
npx playwright show-report
```

This opens an HTML report with:
- Test results and timing
- Screenshots on failure
- Video recordings (if enabled)
- Detailed trace files for debugging


## Development Commands

- **Lint Code**: Check for code quality issues
  ```bash
  npm run lint
  ```

- **Run Tests**: Execute the test suite
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
  npm run seed
  ```
  This creates sample data in the SQLite database with 3 realistic trips (beach, mountain, city) ready for testing.

### Reinstall Dependencies
If you encounter dependency issues, reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```
