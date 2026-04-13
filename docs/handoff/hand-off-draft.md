# Hand-Off Document Draft
## Smart Packing Checklist Generator

This document provides an overview of the system, its architecture, and guidance for future maintainers. It is intended to help a new team quickly understand how the project works, how to run it, and where to focus future improvements.

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

The system is in a post-Beta, pre-final state, with all core functionality implemented, deployed, and supported by automated testing.

Week 13 focused on improving:

- maintainability (refactoring brittle UI logic)
- observability (request correlation, structured logging, health diagnostics)
- regression protection (Playwright + backend test coverage)
- support readiness (error visibility and diagnostics)

The system is now functionally stable, with improvements focused on clarity, reliability, and maintainability rather than feature expansion.

---

## Stack and Tool Choices

### Frontend

- Vite
- Vanilla JavaScript (ES Modules)
- No framework (intentionally lightweight)
- DOM-driven UI with modular JS files

---

### Backend

- Node.js
- Express.js
- REST-style API

---

### Database

- SQLite
- Knex.js for query building and migrations

---

### Authentication

- Google OAuth (Passport.js)
- Session-based authentication using cookies (connect.sid)

---

### Testing

- Vitest
  - Unit and integration tests (backend + logic)

- Playwright
  - End-to-end (E2E) testing
  - Uses test-mode auth via x-test-user-id header

Covers:

- auth error handling 
- edit-mode UI behavior
- change detection
- core workflows

---

### Observability (Week 13 Additions)

- Request correlation via x-request-id
- Structured JSON logging (Winston)
- /health endpoint with diagnostics:
  - uptime
  - config validity
  - version
- Centralized 404 and error handling with request IDs
- Startup configuration validation (fail-fast for missing environment variables)

---

### Deployment

- AWS Elastic Beanstalk (single-instance deployment)
- SQLite database persisted via EBS volume
- CI/CD via GitHub Actions

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
npm run dev
```

- Frontend served via Vite
- Backend runs on Express server
- App typically available at: http://localhost:3000

---

### Environment Variables

Key environment variables:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- SESSION_SECRET
- SQLITE_PATH (optional override)

In test mode:

- authentication is bypassed via x-test-user-id header
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

## Known Weaknesses / Technical Debt

The following areas reflect known limitations or technical debt identified during development and Week 13 analysis.

### 1. Duplicated Backend Validation Logic

- Trip payload validation is still duplicated across create and update routes
- Risk of inconsistent validation behavior
- Harder to maintain and test
- Tracked in: #129

---

### 2. Checklist Auto-Save and Change Detection Complexity

Checklist behavior combines:

- UI rendering
- debounced auto-save
- change detection via serialized state comparison

Risks:

- tightly coupled logic
- harder to extend safely
- potential edge-case bugs with future features

---

### 3. Backend Structure Centralization

server.js currently handles:

- routing
- middleware
- validation
- configuration
- observability logic

Risks:

- large file with mixed responsibilities
- harder to scale or extend cleanly

---

### 4. Limited Backend Test Depth

While test coverage exists:

- strong E2E coverage
- some backend tests for observability

Remaining gaps:

- deeper unit tests for business logic
- validation edge cases
- error path testing across all routes

---

### 5. Deployment Scalability Constraints

Current architecture is intentionally simple:

- SQLite (single-writer constraint)
- single-instance Elastic Beanstalk deployment
- in-memory session storage

Risks:

- no horizontal scaling
- sessions lost on restart
- potential write bottlenecks under load

---

## Recommended Next Steps for a Future Team

### 1. Centralize Backend Validation Logic

- Extract shared validation layer
- Reuse across create/update routes
- Add dedicated unit tests

---

### 2. Simplify Checklist State Management

Separate:

- change detection
- persistence
- UI rendering

Replace serialized comparison with more explicit state tracking

---

### 3. Modularize Backend Structure

Break server.js into:

- routes
- middleware
- validation
- config

Do this incrementally to avoid regressions

---

### 4. Expand Backend Test Coverage

Add unit tests for:

- validation logic
- storage layer
- error handling paths

Keep E2E tests focused on user workflows

---

### 5. Improve Production Readiness

- Move from SQLite to PostgreSQL for scaling
- Add persistent session store (Redis or DB-backed)
- Consider multi-instance deployment

---

### 6. Continue Observability Improvements

- Add request tracing across services (if expanded)
- Improve log aggregation and monitoring in production
- Add alerting on failures

---

## Final Notes

The system is functionally complete and stable, with strong improvements made in Week 13 around:

- observability
- reliability
- regression protection
- frontend state clarity

At this stage, the priority is not adding features, but:

- reducing technical debt
- improving maintainability
- strengthening system reliability

With continued incremental improvements, the system is well-positioned to be maintained and extended by future teams.