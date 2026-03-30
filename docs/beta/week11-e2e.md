# Week 11 End-to-End Workflow Proof
## Smart Packing Checklist Generator

This document demonstrates that the core system workflow functions end-to-end across authentication, frontend UI, backend API, and persistence layers.

---

## Primary Workflow: Create and Save a Trip

This workflow validates the full user journey from login to persistent storage.

---

## Entry Point and User Role

- **Entry Point:** http://localhost:5173/
- **User Role:** Authenticated user

---

## Workflow Steps

### 1. User logs in via Google OAuth
![Login Page](image.png)  
![Login to Google Account](image-1.png)

---

### 2. User enters trip details
- Trip name  
- Destination type  
- Duration  

![Enter Trip Details](image-2.png)

---

### 3. User clicks **Generate Checklist**
- Frontend generates checklist items based on destination type  

![Generate Checklist](image-3.png)

---

### 4. Checklist is displayed in the UI
![Checklist Displayed](image-4.png)

---

### 5. User clicks **Save Trip**
- Frontend sends request to backend API  

![Saved Trip](image-5.png)

---

### 6. Backend processes request
- Validates input  
- Enforces user ownership  
- Persists data to SQLite  

---

### 7. Saved trip appears in UI
- Trip is added to saved trips list  
- User can reload it later  

![Saved Trip Visible](image-6.png)

---

## System Components Involved

### Frontend (Vite + Vanilla JS)
- `tripForm.js`
- `apiClient.js`
- `main.js`

### Backend (Node.js + Express)
- `server.js`

### Persistence Layer
- Knex + SQLite

### Authentication
- Google OAuth (user-facing)
- Session-based authentication

### Testing / CI
- Playwright E2E tests
- GitHub Actions CI pipeline

---

## Expected Output / Final State

- Trip is saved with:
  - Valid trip data  
  - Generated checklist items  
- Trip appears in saved trips list  
- No duplicate entries are created  
- UI reflects success state  
- Data is user-specific and isolated  
- Trip can be reloaded into the form  

---

## Evidence

### PRs That Enabled This Workflow

#### Authentication
- #70 – Google authentication implementation  
- #89 – Auth and frontend integration fixes  

#### API / Backend
- #22 – Initial save trip API  
- #25 – Validation and error handling fixes  
- #33 – GET /api/trips/:tripId  
- #95 – API and documentation alignment  

#### Persistence
- #57 – Migration to SQLite (Knex)  
- #36 – Seed script  
- #91 – Schema cleanup  

#### Frontend
- #37 – Saved trips list + load/filter  
- #55 – Toast notifications  

#### Testing & CI
- #38 – Demo-path tests
- #102 – Workflow-focused automated tests  
- #103 – CI stability cleanup  
- #94 – Required check reporting  
- #96 – workflow_dispatch  

#### Infrastructure
- #92 – AWS beta hosting  

---

## Test Evidence

### Playwright E2E Tests

- `tests/e2e/primary-workflow.spec.js`
- `tests/e2e/integration.spec.js`
- `tests/e2e/failure-paths.spec.js`

### Verified Behaviors

- User can authenticate (test-mode in automation)
- User can create and save a trip
- Trip persists and reloads correctly
- Invalid input triggers proper error handling

---

## Run Notes

### Manual Testing

- Ran application locally (`npm run dev:full`)
- Logged in via Google OAuth
- Created trip and generated checklist
- Saved trip and verified persistence
- Reloaded saved trip successfully

### Automated Testing

- Executed Playwright tests:
  ```bash
  npx playwright test
  ```

- Tests use test-mode authentication (`x-test-user-id`) to avoid OAuth dependency  

---

## CI Evidence

CI pipeline includes:

- Lint stage  
- Unit tests (Vitest)  
- Playwright E2E tests (non-blocking)  

GitHub Actions:

https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/actions  

---

## Notes on Authentication

- Manual testing: uses real Google OAuth  
- Automated tests (CI): use test-mode authentication  

This ensures:

- realistic user behavior validation  
- stable and reliable automated test execution  