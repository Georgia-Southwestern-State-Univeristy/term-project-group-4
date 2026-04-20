# Admin / Maintenance Guide
## Smart Packing Checklist Generator

This guide explains how to set up, run, and maintain the system.

---

## System Overview

This is a full-stack web application with:

- Frontend: Vite + Vanilla JavaScript
- Backend: Node.js + Express
- Database: SQLite (via Knex)
- Authentication: Google OAuth (Passport.js)
- Deployment: AWS Elastic Beanstalk

---

## API Documentation

For API details and endpoints, see:

- `docs/api/README.md`
- OpenAPI specification: `docs/api/openapi.yaml`

---

## Production Environment

The application is deployed and accessible at:

https://spcg.zentrofi.com

This URL represents the production instance hosted on AWS Elastic Beanstalk.

Use this endpoint to:
- verify deployments
- reproduce production issues
- validate fixes after changes
- confirm that CI/CD deployments completed successfully

---

## Setup and Deployment

### Prerequisites

- Node.js (LTS recommended)
- npm
- Git

---

### Install Dependencies

```bash
npm install
```

---

### Run Locally

```bash
npm run dev:full
```

- Starts both frontend and backend
- Frontend UI typically runs at: http://localhost:5173
- Backend API typically runs at: http://localhost:3000

---

## Environment Configuration

### Required Environment Variables

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_CALLBACK_URL
- SESSION_SECRET

### Common / Deployment Variables

- PORT (defaults to 3000 if not set)
- FRONTEND_URL (defaults to http://localhost:5173/ in development)
- SQLITE_PATH (required in production; optional override locally)
  - must point to a writable directory (e.g., `/data/trips.db` on Elastic Beanstalk)
  - the application will fail to start if the path is not writable
  - defaults to `data/trips.db` in development

---

## Test Mode (Important for CI and E2E)

- Uses `NODE_ENV=test`
- Authentication is bypassed using header: `x-test-user-id`

This is used by Playwright tests and should not be enabled in production.

---

## Database Management

### Migrations

Run migrations:

```bash
npm run db:migrate
```
---

### Seed Demo Data

```bash
npm run db:seed
```
---

### Reset / Reseed Database

Run:

```bash
npm run db:reset
```

This command:

- rolls back all migrations
- recreates the schema
- reseeds the database

---

### Test Database

- Uses in-memory SQLite
- Automatically reset during tests

---

## Restarting the Application

### Local

- Stop the running process (Ctrl + C)
- Restart with:

```bash
npm run dev:full
```

---

### Production (Elastic Beanstalk)

- Restart via AWS Elastic Beanstalk console or CLI
- Application restarts automatically on new deployment

---

## Observability and Diagnostics

### Request IDs (Important)

Every request includes an x-request-id.

Returned in:

- response headers
- API responses
- logs

Use this ID to trace issues across logs.

---

### Logs

#### Local Development

- Console output (formatted logs)
- File logs: /logs/app.log

#### Production

- Logs are output to console
- Available via:
  - AWS Elastic Beanstalk logs (via console or EB CLI)

---

### Health Check Endpoint

GET /health

Returns:

- status
- environment
- version
- requestId
- uptimeSeconds
- database information
- configuration status

Use this to verify system health.

---

## Error Handling

Backend error responses include an `error` field.

For centralized 404 and unhandled 500 responses, the body also includes `requestId`.
The `x-request-id` response header is available on all requests and should be used to trace failures in logs.

Examples:

- Unknown routes:
  - error: Not found
  - requestId

- Unhandled server errors:
  - error: Internal server error
  - requestId

---

## Common Issues

### 1. Authentication Not Working

- Check Google OAuth credentials
- Ensure redirect URIs are correct
- Verify Google OAuth configuration in Google Cloud Console:
  - Navigate to: APIs & Services → Credentials → OAuth 2.0 Client IDs
  - Ensure the Authorized Redirect URI matches: /auth/google/callback

---

### 2. Server Fails on Startup

- Missing environment variables
- Check startup validation error message

---

### 3. Database Issues

- Ensure SQLite file path is valid
- Run migrations

---

### 4. Tests Failing

- Ensure NODE_ENV=test is set

Install Playwright dependencies if needed:

```bash
npx playwright install
```

---

## CI/CD Notes

GitHub Actions runs:

- lint
- unit tests
- E2E tests

A separate GitHub Actions workflow deploys to Elastic Beanstalk on pushes to `main` (excluding markdown-only changes).

---

## Recovery Scenarios

### Reset Application State

Use the database reset procedure described in the **Database Management** section (`npm run db:reset`), then restart the server if it is running.

---

### Investigate a Failure

- Get requestId from user or logs
- Search logs for that ID
- Trace request lifecycle
- Check error logs (UNHANDLED_ERROR, etc.)

---

## Known Operational Constraints

- Single-instance deployment (no horizontal scaling)
- SQLite limits concurrent writes
- Sessions stored in memory (lost on restart)

---

## Recommended Maintenance Improvements

- Move to PostgreSQL for scaling
- Add persistent session store (Redis or DB-backed)
- Add monitoring and alerting
- Modularize backend structure

---

## Summary

To maintain this system:

- Ensure environment variables are correct
- Monitor logs using request IDs
- Use /health endpoint for quick diagnostics
- Run tests before deploying

The system is stable but designed for simplicity, not large-scale production use.