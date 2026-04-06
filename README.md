# term-project-group-4

A full-stack Smart Packing Checklist application that allows authenticated users to create, manage, and persist trip-based packing lists with automated checklist generation.

---

## Project Overview

This application helps users quickly generate and manage packing checklists based on trip details (destination type and duration). It is designed to streamline trip preparation while ensuring reliability through automated testing and CI workflows.

### Core Value Proposition

- Generate packing checklists instantly based on trip inputs
- Persist trips per user with secure authentication
- Edit, reload, and manage saved trips seamlessly
- Provide a testable, production-aligned workflow with CI validation

---

## Live Deployment

Primary hosted application:

- https://spcg.zentrofi.com

This environment reflects the current Beta build and is the recommended path for reviewer validation.

---

## Prerequisites

This project requires Node.js v24 LTS (Long Term Support). Download and install from the official Node.js website:

https://nodejs.org/

---

## Google OAuth Setup

This application uses Google OAuth for user authentication. To set it up:

1. Go to the Google Cloud Console
2. Create a new project or select an existing one
3. Configure the OAuth consent screen
4. Create OAuth 2.0 credentials (Client ID and Client Secret)
5. Add http://localhost:5173 to authorized JavaScript origins
6. Add http://localhost:3000/auth/google/callback to redirect URIs
7. Copy credentials into `.env`

Create a `.env` file with:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-random-session-secret
FRONTEND_URL=http://localhost:5173
```

Note: In production, SESSION_SECRET must be set or the server will refuse to start.

---

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

---

## Running Locally

The app has two parts: a Vite frontend (serves the UI) and an Express API server (handles trip data storage). Both must be running for full functionality.

### Quick Start (Recommended)

```bash
npm run dev:full
```

Open: http://localhost:5173

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

---

## Tech Stack

- Frontend: Vite + Vanilla JavaScript
- Backend: Node.js + Express
- Database: SQLite (via Knex)
- Authentication: Google OAuth 2.0
- Testing: Playwright (E2E), Vitest (unit)
- CI/CD: GitHub Actions + AWS Elastic Beanstalk

---

## Current Feature Summary (Beta)

### Core Functionality

- Google-authenticated user sessions
- Create trips with:
  - trip name
  - destination type
  - duration
- Automatic checklist generation based on inputs
- Save, load, update, and delete trips
- Per-user data isolation

---

### UI / UX Behavior (Updated for Beta)

#### Required Field Enforcement

- Fields are marked with *
- Generate Checklist button is disabled until inputs are valid
- Uses form.checkValidity() for enforcement

#### Checklist Generation Flow

- Button shows loading state (Generating...)
- Disabled during generation

#### Form Reset After Save (NEW)

After creating a new trip:

- Form fields are cleared
- Checklist is hidden and cleared
- Progress text is reset
- Save button returns to Save Trip
- Save remains disabled until a new checklist is generated

#### Edit vs Create Behavior

- Loaded trips remain editable
- Save button stays enabled for edits
- Change detection updates button state dynamically

---

## API Endpoints

All endpoints require authentication.

- `GET /api/trips` - List all saved trips for the authenticated user
- `GET /api/trips/{tripId}` - Retrieve a single trip by ID (user-specific)
- `POST /api/saveTrip` - Create/save a new trip with checklist
- `PUT /api/trips/{tripId}` - Update an existing trip
- `DELETE /api/trips/{tripId}` - Delete a trip

Trip data is persisted through Knex using SQLite for local development. Each user sees only their own trips.

Swagger docs:
http://localhost:3000/docs

---

### Verify It Works

1. Run `npm run dev:full`
2. Open `http://localhost:5173`
3. Click "Login with Google" and authenticate
4. Enter a trip name, select a destination type, and set a duration
5. Click **Generate Checklist** to create a packing list
6. Click **Save Trip** to persist the trip to the server
7. Confirm the trip is saved and appears in the Saved Trips list
8. The trip appears in the **Saved Trips** list below the form
9. Use the filter input to search trips by name
10. Click **Load** on a saved trip to restore it into the form with its checklist

---

## End-to-End Testing (Playwright)

### Important Note

Playwright E2E tests use test-mode authentication instead of real Google OAuth.

A test header (`x-test-user-id`) simulates authenticated users in test mode. This avoids brittle external authentication flows and ensures reliable CI execution.

Manual usage of the app still uses real Google OAuth.

### Coverage Includes

- Primary workflow (create → save → load → delete)
- Checklist generation behavior
- Form reset after save (NEW)
- Required-field validation and button gating (NEW)
- Failure-path validation (invalid input, error handling)

### Run Tests

```bash
npx playwright test
```

### Run Specific Tests

```bash
npx playwright test tests/e2e/primary-workflow.spec.js
```

### Debug / UI Mode

```bash
npx playwright test --headed
npx playwright test --debug
npx playwright test --ui
```

### View Report

```bash
npx playwright show-report
```

---

## CI Behavior

- Playwright E2E runs in CI (currently non-blocking)
- Deployment includes:
  - EB environment update wait
  - /health smoke test validation

---

## Development Commands

```bash
npm run lint
npm run test
npm run build
npm run preview
npx knex seed:run
```

---

## Beta Scope

The following items are intentionally incomplete and tracked for post-Beta work:

- XSS audit and DOM sanitization validation (#82)
- Input length validation limits (#81)
- Reliability hardening for network/server failures (#101)
- Authentication failure and error-path testing (#98)
- authError redirect regression test coverage (#121)
- Change detection unit/integration testing gaps (#122)
- Edit-mode UI state inconsistency after loading trips (#126)

See: Week 12 Known Issues & Technical Debt document

---

## Reinstall Dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

---