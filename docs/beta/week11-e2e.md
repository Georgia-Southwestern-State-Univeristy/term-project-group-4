# Week 11 End-to-End Workflow Proof
## Smart Packing Checklist Generator

This workflow demonstrates meaningful system behavior across authentication, frontend UI, backend API, and persistence layers. It confirms that the core user journey is functional end-to-end.

---

## Primary Workflow: Create and Save a Trip

This workflow demonstrates a complete user journey across frontend UI, backend API, and persistence.

---

## Entry Point and User Role

- Entry Point: Application home page (`/`)
- User Role: Authenticated user (Google OAuth)

---

## Workflow Steps

1. User logs in via Google OAuth
2. User enters trip details:
   - Trip name
   - Destination type
   - Duration
3. User clicks **Generate Checklist**
   - Frontend calls checklist generation logic
4. Checklist is displayed in the UI
5. User clicks **Save Trip**
   - Frontend sends request to backend API
6. Backend validates request and persists trip
7. Saved trip appears in UI list

---

## System Components Involved

- Frontend (Vite + Vanilla JS)
  - `tripForm.js`
  - `apiClient.js`
- Backend (Node.js + Express)
  - `server.js`
- Database layer (SQLite via storage module)
- Authentication (Google OAuth)
- CI/Test layer (Playwright E2E tests)

---

## Expected Output / Final State

- A new trip is saved with:
  - Valid trip data
  - Generated checklist items
- Trip appears in the saved trips list
- No duplicate entries created
- UI reflects success state (toast or updated list)

---

## Evidence

### PRs That Enabled This Workflow

- `Week11/auth-and-frontend-integration-fixes`
  - Fixed auth flow and frontend/backend integration
- `Week11/api-and-doc-alignment`
  - Ensured API contract consistency and validation
- `Week11/repo-hygiene-and-schema-cleanup`
  - Standardized data schema across system

---

### Test Evidence

- Playwright E2E Tests:
  - `tests/e2e/primary-workflow.spec.js`
  - `tests/e2e/integration.spec.js`

Verified behaviors:
- User can log in
- User can create and save a trip
- Trip persists and can be reloaded
- Duplicate submissions are prevented

---

### Run Notes

Local test run:
- Started backend (`npm run server`)
- Started frontend (`npm run dev`)
- Executed Playwright tests (`npx playwright test`)
- Verified:
  - Trip creation
  - Checklist generation
  - Save + reload functionality

---

### CI Evidence

- CI pipeline includes E2E test stage (currently optional)
- Link to CI run: (add GitHub Actions run link here if available)