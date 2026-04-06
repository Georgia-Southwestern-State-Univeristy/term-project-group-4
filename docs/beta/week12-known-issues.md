# Week 12 Beta: Known Issues & Technical Debt

**Date:** April 2, 2026  
**Owner:** QA & Development Team  
**Purpose:** Transparent documentation of known limitations, bugs, and technical debt heading into Beta release.

**Core Principle:** Hidden problems become presentation disasters later. All open known issues are documented here with severity, cause, and planned remediation.

---

## Known Issues Summary

| Priority | Count | Issues |
|----------|-------|--------|
| **High** | 3 | XSS audit, input length validation, required field validation |
| **Medium** | 4 | Form reset, reliability hardening, auth failure tests, ESLint config |
| **Low** | 2 | authError redirect test, change detection testing |

**Total: 9 known issues**

**Status Update (Week 12 PR #113):** All 9 issues are currently open. Issue #109 (Spinner/Toast) was resolved. Issue #69 is in PR review. The 9 remaining open issues are: #60, #61, #63, #81, #82, #98, #101, #121, #122.

---

## High Priority Issues (Must Address Before Final Release)

### 1. **Audit XSS Vulnerability in Trip Rendering**
**GitHub Issue:** [#82](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/82)  
**Severity:** High (Security)  
**Status:** Open

**Description:**
Trip names, destinations, and checklist item names are rendered in the UI. If a user inputs HTML/JavaScript in the trip name field, there is a risk it could be executed instead of rendered as text. Need to verify all rendering uses `.textContent` (safe) instead of `.innerHTML` (unsafe).

**Likely Cause:**
- Inconsistent use of `.textContent` vs `.innerHTML` in `src/main.js`
- Possible unescaped rendering in `checklistRenderer.js`
- Legacy code may have direct DOM manipulation

**Affected Area:**
- `src/main.js` — trip list rendering
- `src/checklistRenderer.js` — checklist rendering
- Form value display

**Planned Next Action (Week 12):**
1. Audit all DOM writes for `.innerHTML` usage
2. Add code comments preventing future `.innerHTML` use
3. Replace any `innerHTML` with `.textContent` or safe templating

**Impact if Not Fixed:**
- **Critical Security Risk:** XSS vulnerability allows attacker to inject malicious scripts
- User data injection attacks possible
- Session hijacking risk

---

### 2. **Add Input Length Limits for Trip Fields**
**GitHub Issue:** [#81](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/81)  
**Severity:** High  
**Status:** Open

**Description:**
Trip name and destination type fields have no max length limits. Users can input arbitrarily long strings, which could cause:
- UI overflow/layout breaking
- Database bloat
- Rendering performance issues

**Current State:**
- Server-side validation exists for whitespace-only but not for length limits
- Frontend has no input `maxlength` attribute

**Likely Cause:**
- Not implemented during MVP phase (focus was on core workflow)
- Database schema doesn't enforce column size limits

**Affected Area:**
- HTML form: `#trip-name`, `#destination-type` input fields
- `server.js` POST/PUT validation
- Database schema (migrations)

**Planned Next Action (Week 12):**
1. Add `maxlength` attribute to frontend inputs
2. Add server-side validation: name ≤ 100 chars, destination ≤ 50 chars
3. Return 400 with clear message if exceeded
4. Add unit tests for length validation
5. Verify existing data doesn't exceed new limits (backfill if needed)

---

### 3. **Generate Checklist Can Be Used Without Clear Required-Field Guidance**
**GitHub Issue:** [#63](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/63)  
**Severity:** High  
**Status:** Open

**Description:**
The "Generate Checklist" button can be clicked even when required fields (trip name, duration) are not filled. User sees unclear error or unexpected behavior instead of clear validation message.

**Current State:**
- Form doesn't prevent clicking "Generate Checklist" with empty fields
- No prominent indication which fields are required
- User feedback unclear when fields are missing

**Likely Cause:**
- Frontend validation not comprehensive before checklist generation
- Missing HTML5 `required` attribute or custom validation
- Error messages not user-friendly

**Affected Area:**
- `src/tripForm.js` — form validation
- `index.html` — form fields markup
- `src/main.js` — error handling

**Planned Next Action (Week 12-13):**
1. Add `required` attribute to trip name and duration fields
2. Add clear visual indicators for required fields (asterisk, label)
3. Add client-side validation before checklist generation
4. Show clear error toast if required fields missing
5. Add E2E test for validation scenario

**Impact if Not Fixed:**
- Poor UX when user attempts invalid action
- Confusion about form requirements
- Errors instead of clear guidance

---

## Medium Priority Issues (Should Address If Time Allows)

### 4. **Trip Form Does Not Clear After Saving**
**GitHub Issue:** [#61](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/61)  
**Severity:** Medium  
**Status:** Open

**Description:**
When user creates and saves a trip, the form fields (name, destination, duration) are not cleared. The old trip data remains visible, creating confusion about whether the form is ready for a new trip or if the previous data will be saved again.

**Current State:**
- Save succeeds and trip appears in saved list
- Form keeps old values
- User must manually clear fields to create new trip

**Likely Cause:**
- `tripForm.js` save handler doesn't reset form after successful save
- Missing `form.reset()` call

**Affected Area:**
- `src/tripForm.js` — `handleFormSubmit()` or save callback

**Planned Next Action (Week 13):**
1. Add `form.reset()` call after successful save
2. Also clear checklist container (`#checklist-container`)
3. Add E2E test: create trip, save, verify form is empty for next trip
4. Optional: show success toast "Trip saved! Form cleared."

**Impact if Not Fixed:**
- UX confusion after each save
- Users might accidentally save duplicate trips
- Reduced usability

---

### 5. **Reliability Hardening: UI + Server Error Handling**
**GitHub Issue:** [#101](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/101)  
**Severity:** Medium  
**Status:** Open

**Description:**
App is missing comprehensive error handling for:
- Network timeouts
- Server 5xx errors
- Unexpected API responses
- Database connection failures

Users see generic errors or crashes instead of actionable messages.

**Current State:**
- Toast notifications show server validation errors (working)
- Network failures show generic "Failed to save" (could be better)
- Server crashes cause silent failures

**Likely Cause:**
- Limited error scenarios covered in `apiClient.js`
- Server doesn't gracefully handle database errors
- Missing timeout handling on fetch calls

**Affected Area:**
- `src/apiClient.js` — error handling
- `server.js` — error catching in routes
- `server/storage.js` — database error handling

**Planned Next Action (Week 13-14):**
1. Add fetch timeout (e.g., 15s) for all API calls
2. Add retry logic for transient failures
3. Enhance error messages: distinguish network vs validation vs server errors
4. Add server error logging without exposing stack traces to client
5. Test failure scenarios: kill database, simulate timeout, return 500

**Impact if Not Fixed:**
- Silent failures degrade trust
- Users don't know if action succeeded
- Difficult to debug real problems
- May violate SLA expectations for reliability

---

### 6. **Add Playwright Tests for Authentication Failure and Error Redirect Handling**
**GitHub Issue:** [#98](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/98)  
**Severity:** Medium  
**Status:** Open

**Description:**
E2E tests are needed to verify proper handling of authentication failures and error redirects. Specifically:
- User clicks "Login with Google" and denies permission
- System redirects back with error parameters
- Frontend displays user-friendly error message
- User can retry authentication flow

**Current State:**
- E2E test suite exists but doesn't cover auth failure scenarios
- Auth success path tested in primary workflow
- Error redirect handling not validated

**Likely Cause:**
- Auth failure is less common happy path, added to test coverage later
- Error redirect behavior needs explicit E2E validation

**Affected Area:**
- `tests/e2e/` — test files
- `server.js` — auth error redirect logic
- `src/main.js` — error display handling

**Planned Next Action (Week 13):**
1. Add E2E test for auth denial scenario
2. Verify error parameters are captured and displayed
3. Test error message appears in toast/UI
4. Validate "Try Again" button works

**Impact if Not Fixed:**
- Users may see broken behavior when auth fails
- Poor error recovery experience
- Not caught by existing test suite

---

### 7. **ESLint Does Not Recognize Vitest Globals in Test Files**
**GitHub Issue:** [#60](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/60)  
**Severity:** Medium  
**Status:** Open

**Description:**
ESLint reports "describe", "it", "expect", etc. as undefined in `.test.js` files, even though Vitest provides these globals. Creates false lint errors.

**Current State:**
- `eslint.config.js` doesn't configure Vitest environment
- Linter fails on valid Vitest code

**Likely Cause:**
- ESLint config missing Vitest globals configuration
- Vitest globals not registered in ESLint

**Affected Area:**
- `eslint.config.js` — environment configuration

**Planned Next Action (Week 12):**
1. Update `eslint.config.js` to add Vitest globals
2. Verify `describe`, `it`, `expect` no longer show as errors in test files
3. Run `npm run eslint` and confirm no false positives

**Impact if Not Fixed:**
- Noisy lint output
- False errors make real issues harder to spot
- Reduces confidence in linter

---

## Low Priority Issues (Acceptable to Defer Post-Beta)

### 8. **Add Playwright Regression Test for authError Redirect Handling**
**GitHub Issue:** [#121](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/121)  
**Severity:** Low  
**Status:** Open

**Description:**
Playwright regression test is needed to specifically validate that when authentication fails, the system properly redirects with error parameters and displays appropriate error handling to the user.

**Current State:**
- Auth failure E2E tests exist in primary workflow
- Specific regression test for authError redirect handling needed
- Error parameter passing and display validated

**Likely Cause:**
- Created as follow-up to auth failure test coverage
- Specific regression test for error redirect needed

**Affected Area:**
- `tests/e2e/` — Playwright test files
- `server.js` — auth error redirect
- `src/main.js` — error parameter handling

**Planned Next Action (Week 13 if time):**
1. Add dedicated Playwright test for authError parameter
2. Validate error redirect behavior
3. Verify error message display

**Impact if Deferred:**
- Auth error scenarios may not be fully covered
- Can be addressed in next sprint

---

### 9. **Add Unit/Integration Test Around Change Detection**
**GitHub Issue:** [#122](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/122)  
**Severity:** Low  
**Status:** Open

**Description:**
Unit and integration tests are needed to validate change detection for trip data and form state. Ensures:
- Trip field changes properly trigger updates
- Form state changes are reliably detected
- Dependent components receive state updates
- No missed state transitions

**Current State:**
- E2E tests validate overall workflows
- Unit tests exist but have coverage gaps for change detection
- Some edge cases in rapid state changes may not be caught

**Likely Cause:**
- Focus was on core workflow functionality
- Change detection edge cases not fully covered in initial test suite

**Affected Area:**
- `src/tripForm.js` — form state and change detection
- `src/main.js` — trip state management
- Test files: `tests/` directory

**Planned Next Action (Week 13 if time allows):**
1. Identify change detection edge cases and scenarios
2. Add unit tests for form state changes
3. Add integration tests for trip update flows
4. Document change detection patterns

**Impact if Deferred:**
- May miss subtle state management bugs
- Acceptable for Beta if E2E tests pass
- Can be addressed in maintenance sprint

---