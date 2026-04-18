# API & Interface Documentation

## OpenAPI specification

The canonical API reference is [`openapi.yaml`](openapi.yaml) (OpenAPI 3.0.3).

### Viewing interactively

When the server is running, Swagger UI is served at:

```
http://localhost:3000/docs       # development
https://spcg.zentrofi.com/docs   # production
```

## Authentication flow

All `/api/*` routes require a valid session. The authentication sequence is:

1. **Browser** navigates to `GET /auth/google`
2. **Server** redirects (302) to Google OAuth consent screen
3. **Google** redirects back to `GET /auth/google/callback` with an authorization code
4. **Server** exchanges the code for a user profile, upserts the user in the database, establishes a session, and redirects to `FRONTEND_URL`
5. Subsequent requests include the `connect.sid` session cookie automatically

To check the current session: `GET /auth/user` — returns the `User` object or `401`.

To log out: `GET /auth/logout` — destroys the session and clears the cookie.

## API endpoints summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | System health and readiness check |
| GET | `/auth/google` | No | Initiate Google OAuth login (302 redirect) |
| GET | `/auth/google/callback` | No | OAuth callback (302 redirect) |
| GET | `/auth/login-error` | No | OAuth failure redirect |
| GET | `/auth/logout` | No | Log out, destroy session (no-op if not logged in) |
| GET | `/auth/user` | Session | Get current authenticated user |
| GET | `/api/trips` | Session | List all trips for the user |
| POST | `/api/saveTrip` | Session | Create a new trip |
| GET | `/api/trips/{tripId}` | Session | Get a single trip |
| PUT | `/api/trips/{tripId}` | Session | Update a trip (partial) |
| DELETE | `/api/trips/{tripId}` | Session | Delete a trip |

## Example requests

### Check system health

```bash
curl http://localhost:3000/health
```

```json
{
  "status": "ok",
  "environment": "development",
  "version": "1.0.0",
  "requestId": "req-abc123",
  "uptimeSeconds": 3600,
  "database": { "writable": true, "path": "./data/trips.db", "target": "./data", "error": null },
  "config": { "valid": true, "missing": [] }
}
```

### Create a trip (authenticated)

```bash
curl -X POST http://localhost:3000/api/saveTrip \
  -H "Content-Type: application/json" \
  -b "connect.sid=<session-cookie>" \
  -d '{
    "name": "Beach Getaway",
    "destinationType": "beach",
    "duration": 5,
    "checklist": [
      { "id": "item-0", "name": "Sunscreen", "category": "Beach", "packed": false }
    ]
  }'
```

### List trips (authenticated)

```bash
curl http://localhost:3000/api/trips \
  -b "connect.sid=<session-cookie>"
```

## Request lifecycle

A typical authenticated API request flows through the following stages:

```
Browser
  │
  │  HTTP request with connect.sid cookie
  ▼
Express server (server.js)
  │
  ├─ 1. Request ID middleware
  │     Reads X-Request-Id header or generates a UUID.
  │     Attaches requestId to the request for logging.
  │
  ├─ 2. Session middleware (express-session)
  │     Deserializes the session from the connect.sid cookie.
  │     Passport restores req.user via getUserById().
  │
  ├─ 3. JSON body parser (express.json)
  │     Parses request body for POST/PUT routes.
  │
  ├─ 4. Request logger
  │     Logs method, path, and timing via Winston.
  │
  ├─ 5. Route handler
  │     │
  │     ├─ requireAuth middleware
  │     │   Calls resolveAuthenticatedUser(req).
  │     │   Returns 401 if no valid session.
  │     │
  │     ├─ Input validation
  │     │   Trims strings, checks required fields, validates
  │     │   checklist item structure. Returns 400 on failure.
  │     │
  │     └─ Storage layer (server/storage.js)
  │         Executes Knex query against SQLite.
  │         Returns domain object (Trip, User).
  │
  ▼
JSON response → Browser
```

For unauthenticated routes (`/health`, `/auth/*`), steps 2 and 5's `requireAuth` are skipped.

## External integrations

| Integration | Purpose | Configuration |
|-------------|---------|---------------|
| **Google OAuth 2.0 API** | User authentication. The server exchanges authorization codes for user profiles via Passport.js `GoogleStrategy`. | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. The OAuth consent screen and the authorized redirect URI (`/auth/google/callback`) must be configured in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials). |
| **SQLite via better-sqlite3** | Persistent storage for users, trips, and checklist items. Accessed through Knex.js query builder with migration support. | `SQLITE_PATH` (production). In development, defaults to `./data/trips.db`. In production, the database file lives on a mounted EBS volume at `/data/trips.db`. |
| **Winston logging** | Structured logging with environment-specific transports. In production, logs are emitted as JSON to the console only. In non-production, logs are written to `logs/app.log` and also printed to the console with pretty formatting. Each log entry includes the `requestId` for request tracing. | No external configuration. In non-production, the log directory is created automatically for the file transport. |

## Internal services

The server is composed of several internal modules. These are not HTTP APIs, but they define the major architectural boundaries.

### Data layer — `server/storage.js`

Manages all database access via [Knex.js](https://knexjs.org/) with better-sqlite3.

| Function | Purpose |
|----------|---------|
| `migrateLatest()` | Run pending Knex migrations |
| `getAllTrips(userId)` | Fetch all trips owned by a user (newest first) |
| `getTripById(tripId, userId)` | Fetch one trip (ownership-scoped) |
| `createTrip(params)` | Insert a trip + checklist items in a transaction |
| `updateTrip(tripId, updates, userId)` | Partial update of trip fields + checklist replacement |
| `deleteTrip(tripId, userId)` | Delete a trip and its checklist items |
| `findOrCreateUser(profile)` | Upsert a user from a Google OAuth profile |
| `getUserById(id)` | Fetch a user row by primary key |

Database file: `./data/trips.db` (development) or `$SQLITE_PATH` (production, on mounted EBS volume).

### Auth middleware — `server/auth.js`

| Export | Purpose |
|--------|---------|
| `requireAuth(req, res, next)` | Express middleware — resolves the user or returns 401 |
| `resolveAuthenticatedUser(req)` | Returns the user from session or test headers |
| `isTestModeRequest(req)` | True when `NODE_ENV=test` and `x-test-user-id` header is present |

In test mode, `resolveAuthenticatedUser` auto-creates a test user from the `x-test-user-id` header, bypassing Google OAuth entirely.

### Logger — `server/logger.js`

Structured logging via [Winston](https://github.com/winstonjs/winston). Every request is assigned a `requestId` (from the `X-Request-Id` header or auto-generated) that propagates through all log entries for that request.

Log output: non-production writes to `logs/app.log` and stdout (pretty-formatted). Production writes JSON to stdout only.

### Checklist generator — `src/checklistGenerator.js`

Client-side module that generates packing checklist items based on destination type and trip duration. This is a pure function with no server dependency — it runs in the browser.

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | Production, development | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Production, development | — | Google OAuth client secret |
| `SESSION_SECRET` | Production | `default-dev-secret-change-in-production` (development only) | Express session signing secret. Startup throws in production if unset. |
| `FRONTEND_URL` | Optional | `http://localhost:5173` | Post-login redirect target |
| `SQLITE_PATH` | Production | — | Absolute path to SQLite database file |
| `NODE_ENV` | Optional | `development` | `development`, `production`, or `test` |
| `PORT` | Optional | `3000` | HTTP listen port |
