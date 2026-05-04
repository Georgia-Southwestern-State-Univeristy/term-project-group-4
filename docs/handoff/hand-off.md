# Smart Packing Checklist Generator — Hand-Off Document

This document provides an overview of the system, its architecture, stack rationale, deployment, and guidance for future maintainers. It is intended to help a new team quickly understand how the project works, how to run it, what was accepted as a trade-off, and where to focus future improvements.

---

## System Overview

The Smart Packing Checklist Generator is a full-stack web application that allows authenticated users to create, manage, and track trip-based packing checklists.

### Core Features

- Google OAuth authentication (user-scoped data)
- Create trips with:
  - trip name
  - destination type
  - duration
- Generate packing checklists dynamically based on trip inputs
- Save, load, update, and delete trips
- Track packed/unpacked checklist items
- Auto-save checklist changes for saved trips
- Search/filter saved trips
- Edit existing trips with change detection and controlled update flow

---

### Current State

The system is functionally complete, deployed, and supported by automated unit, integration, and end-to-end testing.

Weeks 13–16 focused on:

- maintainability (refactoring brittle UI logic; extracting a shared trip-payload validator)
- observability (request correlation, structured logging, health diagnostics)
- regression protection (Playwright + backend test coverage; XSS rendering tests)
- support readiness (error visibility and diagnostics)
- security and validation hardening (XSS audit, input length limits, type guards before string operations)
- deployment hardening (release-candidate runbook and verification)

The system is now functionally stable, with improvements focused on clarity, reliability, and maintainability rather than feature expansion.

---

## Architecture Snapshot

The application is a Vite-built vanilla-JS SPA served by an Express backend. User data is persisted in a SQLite database on a mounted EBS volume and accessed through Knex.js. Authentication uses Google OAuth 2.0 via Passport. The application is hosted on AWS Elastic Beanstalk (single-instance) with automated deployment from GitHub Actions.

### Component Diagram

![Architecture Diagram](../architecture/diagrams/architecture-snapshot-3.drawio.svg)

*Source diagram:* [`architecture-snapshot-3.drawio`](../architecture/diagrams/architecture-snapshot-3.drawio)

### Request Flow

1. Browser sends a request with the `connect.sid` session cookie and `x-request-id` header.
2. Request-ID middleware tags the request (sanitizes external IDs, generates a UUID if missing or malformed).
3. Passport session middleware verifies the user; `req.user` is populated.
4. Route handler validates input, calls Knex, SQLite responds.
5. Server returns a structured JSON response; errors include the request ID for support triage.
6. Winston logs an `HTTP_REQUEST` completion entry with method, path, status code, and latency.

### Detailed References

- [docs/architecture/architecture-snapshot.md](../architecture/architecture-snapshot.md) — full architecture snapshot with major components, data flow, trade-offs, and design evolution.
- [docs/final/week13-architecture.md](../final/week13-architecture.md) — Week 13 update with current component diagram, responsibility table, and architectural risks.

---

## Stack and Tool Choices

Each layer below is paired with a one-line rationale; ADRs are the authoritative source for each decision.

### Frontend

- **Vite** + **Vanilla JavaScript (ES Modules)** — DOM-driven UI with modular JS files
- **Why:** intentionally lightweight; no framework runtime overhead; fast iteration; state management is hand-rolled and covered by E2E tests rather than framework abstractions.

---

### Backend

- **Node.js** + **Express.js** (REST-style API)
- **Why:** minimal HTTP framework that fits the team's JavaScript skill set and SPA-companion needs without ORM or framework opinions.

---

### Database

- **SQLite** via **Knex.js** (query builder + migrations)
- **Why ([ADR-002](../adr/ADR-002.md)):** simple ops, zero external service, fine for current scale. Knex keeps the application database-agnostic so a future PostgreSQL migration is a config change plus a migration test pass — not a rewrite.

---

### Authentication

- **Google OAuth 2.0** via **Passport.js**, session-based authentication using `connect.sid` cookies
- **Why ([ADR-001](../adr/ADR-001.md)):** delegates password storage and account-recovery responsibility to Google; per-user data isolation enforced via `user_id` foreign keys; no custom credential management surface.

---

### Testing

- **Vitest** — Unit and integration tests (backend + logic)
- **Playwright** — End-to-end (E2E) testing using test-mode auth via `x-test-user-id` header

Covers:

- auth error handling
- edit-mode UI behavior
- change detection
- core workflows

---

### Observability (Week 13 Additions)

- Request correlation via `x-request-id` (sanitized — alphanumeric + `._-`, max 128 chars; replaced with a server-generated UUID otherwise)
- Structured JSON logging (Winston); `req.path` only in logs to avoid leaking query strings
- `/health` endpoint with diagnostics: uptime, config validity, version, database status
- Centralized 404 and error handling with request IDs in every error response
- Startup configuration validation (fail-fast for missing environment variables)

---

### Deployment

- **AWS Elastic Beanstalk** (single-instance) with **SQLite on a mounted EBS volume**
- **CI/CD** via GitHub Actions; predeploy hooks attach/mount EBS and run Knex migrations
- **Why ([ADR-003](../adr/ADR-003.md)):** fastest path from local SQLite to a hosted production environment with persistence; deferred RDS/PostgreSQL until scale or availability requirements demand it.

---

## Setup / Run Summary

### Prerequisites

- Node.js (LTS recommended)
- npm
- SQLite (local file-based, no external install required)

---

### Install Dependencies

```bash
npm install
```

---

### Run the Application Locally

```bash
npm run dev:full
```

- Frontend UI: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger API docs: http://localhost:3000/docs

---

### Environment Variables

Key environment variables:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- SESSION_SECRET
- SQLITE_PATH (optional override; production uses `/data/trips.db` on EBS)

In test mode:

- authentication is bypassed via `x-test-user-id` header
- used by Playwright and automated tests

---

### Running Tests

Run all tests:

```bash
npm test
```

Run E2E tests:

```bash
npm run test:e2e
```

Run a specific Playwright test:

```bash
npm exec playwright test --grep "test name"
```

---

## Accepted Known Constraints

These constraints are **deliberate trade-offs** for the current release scope, not unresolved bugs. Each is documented and surfaced here so a future team understands the system's intentional limits before changing them.

### 1. SQLite + Single-Instance Elastic Beanstalk Deployment

- Production runs on a single EB instance with SQLite persisted on an attached EBS volume.
- Result: no horizontal scaling, brief downtime during deployments, and tied to a single availability zone.
- **Why accepted:** matches the SQLite single-writer model; meets current load and operational-cost targets. Replacement path documented in [ADR-002](../adr/ADR-002.md) (Knex → PostgreSQL).

### 2. In-Memory Session Store

- `express-session` uses its default `MemoryStore`. All active sessions are cleared whenever the app restarts (including on every deploy and instance replacement).
- **Why accepted:** acceptable UX for the current user base; avoids introducing Redis/DB-backed session infrastructure for the project's scope.
- A persistent session store (e.g., `connect-sqlite3`, Redis) is the natural follow-on if multi-instance deployment is adopted.

---

## Technical Debt

These items are real cleanup work that the team would address with more time. Unlike the accepted constraints above, these are not intentional product decisions.

### 1. Checklist Auto-Save and Change Detection Complexity

Checklist behavior combines:

- UI rendering
- debounced auto-save
- change detection via serialized state comparison

Risks:

- tightly coupled logic
- harder to extend safely
- potential edge-case bugs with future features

---

### 2. Backend Structure Centralization

`server.js` currently handles routing, middleware, configuration, and observability logic in a single file. (Trip-payload validation has been extracted to `server/tripValidators.js`, but routing and middleware are still inline.) Mixed responsibilities make the file harder to scale or extend cleanly.

---

### 3. Limited Backend Test Depth Outside the Validator

Validator coverage is solid (`server/tripValidators.js` is unit-tested). The remaining gaps are:

- storage-layer edge cases (`server/storage.js`)
- error path testing across all routes
- deeper unit tests for non-validator business logic

---

## Recommended Next Steps for a Future Team

### 1. Simplify Checklist State Management

Separate:

- change detection
- persistence
- UI rendering

Replace serialized comparison with more explicit state tracking.

---

### 2. Modularize Backend Structure

Break `server.js` into:

- routes
- middleware
- config

(Validation is already extracted to `server/tripValidators.js`.) Do this incrementally to avoid regressions.

---

### 3. Expand Backend Test Coverage

Add unit tests for:

- storage layer (`server/storage.js`)
- error handling paths in each route
- non-validator business logic

Keep E2E tests focused on user workflows.

---

### 4. Lift the Accepted Constraints When Scale Demands It

The accepted constraints above (SQLite + single-instance, in-memory sessions) are not permanent. When scale or availability requirements change, the migration paths are:

- Move from SQLite to PostgreSQL (Knex makes this primarily a config change — see [ADR-002](../adr/ADR-002.md))
- Add a persistent session store (e.g., `connect-sqlite3` or Redis)
- Move to multi-instance Elastic Beanstalk with sticky sessions or a shared session store

---

### 5. Continue Observability Improvements

- Add request tracing across services (if expanded)
- Improve log aggregation and monitoring in production
- Add alerting on failures

---

## User and Admin Guidance

- **[docs/user-guide.md](../user-guide.md)** — End-user reference: how to log in, create and manage trips, generate and track checklists, and edit saved trips.
- **[docs/admin-guide.md](../admin-guide.md)** — Operator reference: production environment, deployment overview, environment variables, common maintenance tasks, and references to API documentation.

---

## Maintenance Notes

Operational guidance for keeping the deployed system healthy. The [admin guide](../admin-guide.md) covers environment setup and routine tasks in more depth; this section is the high-level pointer for someone new to the system.

### Health monitoring

- The `/health` endpoint reports environment, version, uptime, database writability, and configuration validity.
- Returns `200` when healthy, `503` when degraded (typically a non-writable database path).
- In production, internal filesystem paths and low-level error details are omitted from responses; non-production environments expose more detail for debugging.

### Logs and request correlation

- Structured JSON logs via Winston. Production logs to stdout/stderr (captured by Elastic Beanstalk and forwarded to CloudWatch); local development also writes to a file.
- Every request is tagged with an `x-request-id` header. External IDs are sanitized (alphanumeric + `._-`, max 128 characters) before being echoed back; malformed values are replaced with a server-generated UUID.
- Error responses include the request ID in the body, so a user-reported failure can be traced end-to-end via that ID. See [docs/final/week13-observability.md](../final/week13-observability.md) for the full observability design.

### Deployments

- Triggered automatically on every push to `main` via GitHub Actions ([`.github/workflows/deploy-eb.yaml`](../../.github/workflows/deploy-eb.yaml)).
- Predeploy hooks run in order: EBS volume mount (`.platform/confighooks/predeploy/01_mount_ebs.sh`) → Knex migrations (`.platform/hooks/predeploy/02_migrate.sh`).
- Verification path for releases is documented in [docs/final/week14-runbook.md](../final/week14-runbook.md). Rollback is "revert the merge to `main`"; CI redeploys automatically.

### Database

- SQLite at `/data/trips.db` on the attached EBS volume in production. Local development uses `data/trips.db`; tests use an in-memory database.
- Migrations live under [`migrations/`](../../migrations/) and run automatically on deploy via the predeploy hook above. New migrations: `npx knex migrate:make <name>` from a development checkout.
- **No automated backups.** Schema is fully recoverable from migrations, but trip data exists only on the EBS volume. If durability requirements increase, add scheduled EBS snapshots or migrate to RDS — see [ADR-003](../adr/ADR-003.md) for the constraint and migration path.

### Common operational situations

- **All users logged out after a deploy or restart:** expected. The session store is in-memory by design; this is documented in [Accepted Known Constraints](#accepted-known-constraints) and is not a regression.
- **Health endpoint returning 503:** the database path is unwritable. Most often: EBS volume not mounted (check the predeploy hook ran) or filesystem permissions changed.
- **Authentication suddenly failing:** check the Google OAuth credentials in the EB environment variables and the registered redirect URI in Google Cloud Console. `FRONTEND_URL` and the OAuth callback URI must stay in sync — see the FRONTEND_URL coordination note in [ADR-003](../adr/ADR-003.md).
- **Need to roll back a release:** revert the merge commit on `main` and let CI redeploy. Migrations are forward-only; data shape changes need a forward migration, not a manual revert.

---

## Related Documentation

### Architecture & Design

- [docs/architecture/architecture-snapshot.md](../architecture/architecture-snapshot.md) — Full architecture snapshot
- [docs/final/week13-architecture.md](../final/week13-architecture.md) — Week 13 architecture update with component diagram and risk table
- [docs/adr/ADR-001.md](../adr/ADR-001.md) — Authentication & identity decision
- [docs/adr/ADR-002.md](../adr/ADR-002.md) — Database choice (Knex + SQLite, portable to PostgreSQL)
- [docs/adr/ADR-003.md](../adr/ADR-003.md) — Beta hosting on Elastic Beanstalk with SQLite on EBS

### API

- [docs/api/README.md](../api/README.md) — API overview and authentication flow
- [docs/api/openapi.yaml](../api/openapi.yaml) — OpenAPI 3.0.3 specification (Swagger UI served at `/docs`)

### Deployment & Operations

- [docs/final/week14-runbook.md](../final/week14-runbook.md) — Release-candidate deployment verification runbook
- [docs/deployment/beta-deploy.md](../deployment/beta-deploy.md) — Beta deployment notes (superseded by the runbook above)

### Observability

- [docs/final/week13-observability.md](../final/week13-observability.md) — Observability and support visibility deep-dive

### Release & Status

- [docs/releases/release-candidate.md](../releases/release-candidate.md) — Release-candidate notes and executive summary
- [docs/final/week14-triage.md](../final/week14-triage.md) — Final bug triage and disposition plan

---

## Final Notes

The system is functionally complete and stable, with improvements made in Weeks 13–14 around:

- observability
- reliability
- regression protection
- frontend state clarity
- deployment hardening

At this stage, the priority is not adding features, but:

- closing the technical debt above
- maintaining the accepted constraints' documented migration paths
- strengthening system reliability

With continued incremental improvements, the system is well-positioned to be maintained and extended by a future team.
