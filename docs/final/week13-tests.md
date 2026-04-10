# Week 13: Regression Tests & Quality Assurance

## Overview

Four critical regression tests have been added to strengthen trust in the system by protecting against regressions in recently fixed bugs and weak spots. These tests ensure that authentication error handling, authError redirect behavior, form change detection, and edit-mode state management remain reliable.

---

## Test Inventory: Week 13 Additions

### Total New Tests Added: 4
- **Issue #98:** [tests/e2e/auth-error.spec.js](tests/e2e/auth-error.spec.js#L5) - Auth failure error feedback
- **Issue #121:** [tests/e2e/auth-error.spec.js](tests/e2e/auth-error.spec.js#L33) - Auth error access control
- **Issue #126 (PR #130):** [tests/e2e/primary-workflow.spec.js](tests/e2e/primary-workflow.spec.js#L219) - Edit-mode state management
- **Issue #122:** [tests/e2e/primary-workflow.spec.js](tests/e2e/primary-workflow.spec.js#L314) - Change detection
- **Type:** E2E tests (Playwright)

---

## Test Details

### 1. Issue #98: Auth Failure Tests - Error Parameter Handling

**Test Name:** `Issue 98 - auth failure page displays error message and cleans up URL`

**File:** [tests/e2e/auth-error.spec.js](tests/e2e/auth-error.spec.js#L5)

**What It Protects:**
- Ensures that when OAuth fails, the app properly redirects with error parameters
- Verifies that error toasts are displayed to users (user feedback)
- Validates that error parameters are cleaned from the URL after display (prevents replay)

**Issue Coverage:** GitHub Issue [#98](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/98)  
**Category:** Auth Error Handling

**Test Steps:**
1. Navigate to app with `?authError=google_login_failed` query parameter (simulating OAuth callback failure)
2. Verify error toast appears with message "Google login failed"
3. Verify `authError` parameter is removed from URL after display

**Recent Fix It Protects:**
- **Issue:** E2E tests were missing coverage for authentication failure scenarios
- **Fix Applied:** Added test to validate error redirect behavior and user feedback
- **Impact:** Users will now see proper error messages if Google OAuth fails, and errors won't replay on page reload


---

### 2. Issue #121: authError Regression Test - Access Control After Auth Failure

**Test Name:** `Issue 121 - user cannot access trip form after auth error`

**File:** [tests/e2e/auth-error.spec.js](tests/e2e/auth-error.spec.js#L33)

**What It Protects:**
- **Access Control:** Ensures trip form is NOT accessible after auth failure (hidden)
- **Login Redirect:** Verifies login section remains visible so user can retry
- **State Cleanup:** Validates error parameters are removed from URL
- **Security:** Prevents unauthenticated users from accessing trip data form

**Issue Coverage:** GitHub Issue [#121](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/121)  
**Category:** Auth Error Redirect & Access Control

**Test Steps:**
1. Create a new browser context without test auth header (simulating unauthenticated user)
2. Navigate with `?authError=google_login_failed` parameter
3. Verify error toast is displayed
4. **Verify trip form is HIDDEN** (not accessible)
5. **Verify login section is VISIBLE** (can retry)
6. Verify URL is cleaned up (authError param removed)


**Recent Fix It Protects:**
- **Issue:** Users might accidentally see or access form after auth failure
- **Fix Applied:** Added access control test ensuring form is properly hidden
- **Impact:** Users cannot fill trip form if not authenticated; forced to login/retry through proper channel


---

### 3. Issue #126: Edit-Mode State Management (PR #130)

**Test Name:** `button state and context display change when editing a saved trip`

**File:** [tests/e2e/primary-workflow.spec.js](tests/e2e/primary-workflow.spec.js#L219)

**What It Protects:**
- Ensures form values populate correctly when loading a saved trip
- Validates editing context displays "Editing: <trip name>"
- Confirms save button shows "Update Trip" in edit mode
- Verifies Update Trip button is **disabled** immediately after load (no unsaved changes)
- Ensures Update Trip button becomes **enabled only after actual user edits**
- Protects against UI state inconsistencies during edit-mode transitions

**Issue Coverage:** GitHub Issue [#126](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/126) - Flaky edit-mode UI after loading saved trip  
**Category:** Edit-Mode State Management & Regression Protection

**Test Steps:**
1. Create and save a new trip
2. Load the saved trip from the trips list
3. Verify form values are populated correctly
4. Verify editing context appears
5. Verify button text changes to "Update Trip"
6. Verify button is disabled immediately after load
7. Make an edit to the trip
8. Verify button becomes enabled after edit

**Recent Fix It Protects:**
- **Issue:** Edit-mode UI state was inconsistent when loading saved trips (flaky behavior)
- **Fix Applied:** Improved state management test to verify disabled/enabled state transitions
- **Impact:** Ensures users can reliably edit trips with consistent button states; prevents silent regressions in edit-mode behavior

---

### 4. Issue #122: Change Detection Tests - Form State Tracking

**Test Name:** `Update trip name`

**File:** [tests/e2e/primary-workflow.spec.js](tests/e2e/primary-workflow.spec.js#L314)

**What It Protects:**
- Ensures form field changes are reliably detected
- Validates that loaded trip data populates form correctly
- Confirms Update button appears when editing saved trips
- Protects against missed state transitions during form modification

**Issue Coverage:** GitHub Issue [#122](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/122)  
**Category:** Form Change Detection & State Management

**Test Steps:**
1. Create a new trip and generate checklist
2. Save the trip (initial save)
3. Navigate to saved trips list
4. Load the saved trip (verifies data population)
5. Modify trip name
6. Verify Update button appears (change detection working)
7. Click Update button
8. Verify update succeeds with success toast

**Recent Fix It Protects:**
- **Issue:** Change detection gaps could cause data loss when editing trips
- **Fix Applied:** Added comprehensive E2E test for form change detection workflow
- **Impact:** Ensures users can reliably edit saved trips without losing changes, and form state properly reflects when loading existing trips

**Evidence of Implementation:**
- Test added in `tests/e2e/primary-workflow.spec.js` lines 314-385
- Validates change detection code in:
  - [src/tripForm.js#L52-L76](src/tripForm.js#L52-L76) - `captureFormState()` and `checkForChanges()`
  - Button state management in `updateButtonState()`

---

## Quality Bar: Regression Test Coverage

### Requirement: Recent fixes must have regression tests

✅ **Issue #98 (Auth Failure):** Protected
- Fix: Added OAuth error redirect handling
- Regression Test: Validates error toast and URL cleanup

✅ **Issue #121 (authError Redirect):** Protected
- Fix: Ensured error state doesn't block retry + access control
- Regression Test: Validates error recovery, access control, and form remains hidden

✅ **Issue #126 (Edit-Mode State):** Protected (PR #130)
- Fix: Improved edit-mode state management and button state transitions
- Regression Test: Validates disabled/enabled state after load and after edits

✅ **Issue #122 (Change Detection):** Protected
- Fix: Form state tracking when loading and editing trips
- Regression Test: Full workflow covering load → modify → update

---

## Test Results

### CI Run with passing tests
[PR #135] (https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/135)



