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

### Current State

The system is in a post-Beta stage, with full end-to-end functionality implemented and deployed. Current work is focused on:

- maintainability  
- technical debt reduction  
- improved observability  
- regression protection  

---

## Stack and Tool Choices

### Frontend

- Vite  
- Vanilla JavaScript (ES Modules)  
- No framework (intentionally lightweight)  
- DOM-driven UI with modular JS files  

### Backend

- Node.js  
- Express.js  
- REST-style API  

### Database

- SQLite  
- Knex.js for query building and migrations  

### Authentication

- Google OAuth (Passport.js)  
- Session-based authentication using cookies (connect.sid)  

### Testing

- Vitest  
  - Unit and integration tests  

- Playwright  
  - End-to-end (E2E) testing  
  - Uses test-mode auth via x-test-user-id header  

### Deployment

- AWS Elastic Beanstalk  
- Environment-based configuration  

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

Key environment variables may include:

- Google OAuth credentials  
- session secrets  
- database config (if modified)  

For local testing, authentication can be bypassed in test mode.

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
Trip payload validation is currently duplicated across create and update routes.

- Risk of inconsistent validation behavior over time
- Makes validation harder to maintain and test
- Tracked in: #129

### 2. Checklist Auto-Save and Change Detection Complexity
Checklist updates trigger both auto-save behavior and change detection logic.

- Checklist changes are debounced and sent to the backend automatically
- Change detection depends on comparing serialized checklist state
- This creates tight coupling between checklist rendering, persistence, and UI state

This behavior works as intended but may be harder to reason about or extend, especially if additional checklist features are introduced.

### 3. Inconsistent Error Handling and Messaging
Error handling across the frontend and backend is not fully standardized.

- Some errors are surfaced via UI toasts, others only logged to console
- Lack of consistent structure for error responses
- Tracked in: #101

### 4. Gaps in Test Coverage for Edge Cases
While core workflows are covered by E2E tests, some important scenarios lack coverage:

- authentication failure flows (#98)
- OAuth error redirect handling (#121)
- edit-mode change detection logic (#122)

These gaps increase the risk of regressions in less frequently exercised paths.

### 5. Backend Structure Could Be Further Modularized
The backend currently centralizes multiple responsibilities in `server.js`.

- routing, validation, and configuration are not fully separated
- this makes the file harder to evolve as complexity grows

This has not yet caused major issues but may become a limitation as the system expands.

---

## Recommended Next Steps for a Future Team

The following recommendations are based directly on known technical debt and system limitations identified during Week 13.

### 1. Centralize Backend Validation Logic

Address duplicated validation logic across create and update routes (#129).

- Extract shared validation functions or middleware for trip payloads  
- Ensure all routes use a single validation path  
- Add unit tests specifically targeting validation behavior  

This will improve consistency, reduce duplication, and make validation easier to maintain and extend.

---

### 2. Simplify Checklist Auto-Save and Change Detection

The current checklist system tightly couples:

- UI rendering  
- auto-save behavior  
- change detection logic  

Future improvements should:

- separate change detection from persistence logic  
- avoid reliance on serialized checklist comparisons where possible  
- make checklist state transitions more explicit  

This will make the checklist system easier to reason about and safer to extend with new features.

---

### 3. Standardize Error Handling and Improve Observability

Address inconsistent error handling (#101).

- Define a consistent backend error response format  
- Ensure frontend displays meaningful, user-friendly error messages  
- Standardize logging across key operations (API calls, failures)  

Optional improvements:

- add a basic health check endpoint  
- add startup validation for required configuration  

These changes will make the system easier to debug and support.

---

### 4. Expand Test Coverage for Edge Cases

Address known gaps in automated testing:

- add Playwright tests for authentication failure flows (#98)  
- add regression test for OAuth error redirect handling (#121)  
- add tests for edit-mode change detection behavior (#122)  

Additionally:

- increase backend unit test coverage for critical logic  
- continue strengthening E2E tests for user workflows  

This will improve confidence in the system and reduce regression risk.

---

### 5. Incrementally Modularize Backend Structure

The backend currently centralizes multiple responsibilities in `server.js`.

Recommended approach:

- gradually extract route logic into separate modules (e.g., `/routes/trips.js`)  
- move validation logic into its own layer  
- isolate middleware and configuration setup  

This should be done incrementally to avoid destabilizing the system during final stages.

---

## Final Notes

The system is functional and stable, with strong core workflows and end-to-end test coverage. Recent refactoring work (Week 13) has improved clarity and reduced brittleness in key areas, particularly in frontend state management.

Moving forward, the priority should be:

- reducing technical debt in targeted areas  
- improving consistency and maintainability  
- strengthening regression protection and error visibility  

With these improvements, the system will be well-positioned for continued development and maintenance by future teams.