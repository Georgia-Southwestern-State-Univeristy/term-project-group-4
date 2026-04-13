# Week 13: Final Sprint - Quality and Maintainability Evidence Package

**Sprint Goal:** Harden system reliability through comprehensive error handling, secure user input validation, and production observability.

---

## Committed Backlog (7 Items)

All items below are quality-focused, reliability-focused, or supportability-focused. No new feature growth this sprint.

| # | Item | Owner | Priority |
|---|------|-------|----------|
| 1 | Enhance error handling and user feedback in API failures | Jason | 2 |
| 2 | Architecture update snapshot | Jason | 2 |
| 3 | Flaky edit-mode UI after loading saved trip (context/button state race) | Heather | 2 |
| 4 | Duplicated trip payload validation across create/update routes | Heather | 2 |
| 5 | Hand off documentation | Heather | 3 |
| 6 | Add a unit/integration test around change detection | Naren | 2 |
| 7 | Add Playwright regression test for authError redirect handling | Naren | 2 |
| 8 | Add Playwright tests for authentication failure and error redirect handling | Naren | 2 |

---

## Acceptance Criteria by Item

### 1. Enhance Error Handling and User Feedback in API Failures
**Owner:** Jason  
**GitHub Issue:** [#101](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/101)

- Timeout handling added to all API calls in `src/apiClient.js` (15-second default)
- Network errors and server errors show distinct user-facing toast messages
- Server error responses do not leak stack traces to client

---

### 2. Architecture Update Snapshot
**Owner:** Jason

- Update ADR or architecture documentation with current system state
- Reflect any changes from recent sprint work
- Documentation aligns with deployed/reviewed code

---

### 3. Fix Flaky Edit-Mode UI After Loading Saved Trip
**Owner:** Heather  
**GitHub Issue:** [#126](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/126)

- Make sure form restored after loading saved trip
- Save button should rename to 'Update trip'
- Only enables if user make changes
- No race conditions between context updates and button state

---

### 4. Deduplicate Trip Payload Validation Across Routes
**Owner:** Heather  
**GitHub Issue:** [#129](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/129)

- Validation logic extracted into shared helper function
- Both `POST /api/saveTrip` and `PUT /api/trips/:tripId` use same validator
- Unit tests confirm validation behavior consistent across both routes

---

### 5. Hand Off Documentation
**Owner:** Heather

- System overview
- Stack and tool choices
- Setup/run summary
- Known weaknesses or technical debt
- Recommended next steps for a future team

---

### 6. Add Unit/Integration Test Around Change Detection
**Owner:** Naren  
**GitHub Issue:** [#122](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/122)

- Make sure user able to load saved trip
- Verify 'Update' button is disabled
- Update the trip name
- Verify 'Update' button is enabled
- Reset the trip name to original name
- Verify 'Update' button is disabled

---

### 7. Add Playwright Regression Test for AuthError Redirect Handling
**Owner:** Naren  
**GitHub Issue:** [#98](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/98)

- Verifies that error toasts are displayed when OAuth fails
- Validates that error parameters are cleaned from the URL after display (prevents replay)
- Tests: Error message shown, URL parameter removed

---

### 8. Add Playwright tests for authentication failure and error redirect handling
**Owner:** Naren  
**GitHub Issue:** [#121](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/121)

- Ensures trip form is hidden when user is not authenticated after auth failure
- Ensures login section remains visible so user can retry authentication
- Validates that error toasts are displayed to users
- Tests: Form hidden, login button available, error message shown, URL cleaned

---

## Evidence & Links

- **Project Board Sprint View:** https://github.com/orgs/Georgia-Southwestern-State-Univeristy/projects/26
- **PR Evidence:** Week 13 PRs linked from each backlog item

---

