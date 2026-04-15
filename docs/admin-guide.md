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
npm run dev
```

- Starts both frontend and backend
- App typically runs at: http://localhost:3000

---

## Environment Configuration

### Required Environment Variables

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- SESSION_SECRET

### Optional

- SQLITE_PATH (custom database location)

---

## Test Mode (Important for CI and E2E)

- Uses NODE_ENV=test
- Authentication is bypassed using header: x-test-user-id

This is used by Playwright tests and should not be enabled in production.

---

## Database Management

### Migrations

Run migrations:

```bash
npx knex migrate:latest
```

---

### Reset Database (Local Development)

- Delete the SQLite file (for example: /data/trips.db or local path)
- Re-run migrations

---

### Test Database

- Uses in-memory SQLite
- Automatically reset during tests

---

## Restarting the Application

### Local

Stop and restart:

```bash
npm run dev
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
  - AWS Elastic Beanstalk logs
  - CloudWatch (if configured)

---

### Health Check Endpoint

GET /health

Returns:

- system status
- uptime
- config validity
- requestId

Use this to verify system health.

---

## Error Handling

### Standard Behavior

All errors return JSON:

- error message
- requestId

---

### 404 Behavior

Returns:

- error: Not found
- requestId

---

## Common Issues

### 1. Authentication Not Working

- Check Google OAuth credentials
- Ensure redirect URIs are correct

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

Deploys on merge to main (if configured).

---

## Recovery Scenarios

### Reset Application State

- Delete database file
- Run migrations
- Restart server

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