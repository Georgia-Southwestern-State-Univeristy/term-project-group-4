# Week 12 Beta: Known Issues & Technical Debt

**Date:** April 2, 2026  
**Owner:** QA & Development Team  
**Purpose:** Transparent documentation of known limitations, bugs, and technical debt heading into Beta release.

**Core Principle:** Hidden problems become presentation disasters later. All known issues are documented here with severity, cause, and planned remediation.

---

## Known Issues Summary

| Priority | Count | Issues |
|----------|-------|--------|
| **High** | 3 | Checklist spinner bug, XSS audit, input length validation |
| **Medium** | 4 | Auth error handling, form reset, checklist regeneration UX, ESLint config |
| **Low** | 3 | Legacy storage, mobile testing, performance optimization |

**Total: 10 known issues**

---

## High Priority Issues (Must Address Before Final Release)

### 1. **"Generating checklist" Spinner/Toast Never Resolves**
**GitHub Issue:** [#109](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/109)  
**Severity:** High  
**Status:** Open

**Description:**
When user clicks "Generate Checklist," a loading indicator/toast appears but never resolves. User sees spinner indefinitely. May be related to async/await timing or event handling in the checklist generation flow.

**Likely Cause:**
- `src/tripForm.js` checklist generation promise not resolving
- Possible race condition between frontend spinner and actual checklist rendering
- Event listener not properly awaiting completion before hiding spinner

**Affected Area:**
- `src/tripForm.js` — `generateChecklist()` handler
- `src/toast.js` — spinner state management
- Checklist rendering in `checklistRenderer.js`

**Planned Next Action (Week 12-13):**
1. Add console logging to trace promise resolution in `generateChecklist()`
2. Review vitest unit tests to add loading state assertions
3. Add E2E test to verify spinner disappears after checklist renders
4. Consider timeout safeguard if spinner persists >10s

**Impact if Not Fixed:**
- Users cannot generate checklists reliably
- Blocks core workflow → Beta unusable

---

### 2. **Audit XSS Vulnerability in Trip Rendering**
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

### 3. **Add Input Length Limits for Trip Fields**
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

**Impact if Not Fixed:**
- DoS vector: users could submit huge payloads
- UI corruption from long trip names
- Poor user experience with broken layouts

---

## Medium Priority Issues (Should Address If Time Allows)

### 4. **Handle ?authError Query Param on Frontend & Display User-Friendly Message**
**GitHub Issue:** [#97](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/97)  
**Severity:** Medium  
**Status:** Open

**Description:**
When authentication fails (e.g., user denies Google login), the auth flow redirects back with `?authError=<reason>` but the frontend doesn't parse or display this error. Users see blank page without understanding what went wrong.

**Current State:**
- Backend returns error query param on auth failure
- Frontend `main.js` doesn't check for `?authError` on page load
- No user-friendly error message shown

**Likely Cause:**
- Frontend auth error handling incomplete
- Missing query param parser in `main.js`

**Affected Area:**
- `src/main.js` — auth status check on page load
- `server.js` — auth failure redirect

**Planned Next Action (Week 13):**
1. Add query param parser in `main.js`
2. Check for `?authError` on page load
3. Display error in toast notification: "Authentication failed: {error reason}"
4. Provide "Try Again" button
5. Add E2E test for auth failure scenario

**Impact if Not Fixed:**
- Poor user experience when auth fails
- Users don't know what went wrong
- May appear as app bug vs auth issue

---

### 5. **Trip Form Does Not Clear After Saving**
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

### 6. **Reliability Hardening: UI + Server Error Handling**
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

### 7. **Save Button Misleading After Checklist Regeneration**
**GitHub Issue:** [#69](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/69)  
**Severity:** Medium  
**Status:** Open

**Description:**
User generates a checklist, then changes the trip name or duration. The "Save" button doesn't clearly indicate whether:
- Saving the *new* trip form (with updated checklist)
- Saving the *old* trip (overwriting it)
- Creating a duplicate

Users are confused about what will be saved.

**Current State:**
- Button says "Save" regardless of context
- No indication if editing existing trip vs creating new
- Checklist regenerates but button state unclear

**Likely Cause:**
- Form state doesn't distinguish "new trip" vs "loaded existing trip"
- Button label doesn't change based on context

**Affected Area:**
- `src/tripForm.js` — form state and button label logic
- `src/main.js` — trip load handler

**Planned Next Action (Week 13):**
1. Add form state flag: `isEditingExistingTrip`
2. Change button label: "Save" vs "Update Trip"
3. Show trip ID or modification date indicator
4. Add unit test verifying button label changes
5. Add E2E test: load trip, edit, verify "Update Trip" button shown

**Impact if Not Fixed:**
- User confusion about save semantics
- Potential accidental overwrites or duplicates
- Reduced confidence in app

---

### 8. **ESLint Does Not Recognize Vitest Globals in Test Files**
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

### 9. **Mobile Viewport Testing & Responsive Design**
**Severity:** Low  
**Status:** Open

**Description:**
E2E tests run at 1920x1080 desktop viewport only. No mobile/tablet testing. App may have layout issues on small screens.

**Current State:**
- Playwright config fixed at 1920x1080
- CSS uses responsive design (looks OK on phone manually)
- No automated verification on mobile

**Likely Cause:**
- MVP focused on desktop-first
- Playwright viewport configuration not parameterized

**Planned Next Action (Post-Beta):**
1. Add Playwright parameterized tests for mobile (375x667), tablet (768x1024)
2. Fix any responsive layout issues found
3. Consider mobile-first CSS refactor

**Impact if Deferred:**
- Users on mobile may have layout issues
- Not critical for Beta if core workflow works
- Can address in production release

---

### 10. **Performance & Load Testing**
**Severity:** Low  
**Status:** Open

**Description:**
No benchmarking or load testing. App performance on:
- Large trip lists (100+ trips)
- Slow networks (3G)
- Concurrent users

Unknown.

**Current State:**
- Unit/E2E tests validate correctness, not performance
- No load test scenarios
- Single-user database (SQLite)

**Likely Cause:**
- MVP phase focused on functionality
- Performance optimization deferred to production

**Planned Next Action (Post-Beta / Production):**
1. Add baseline performance metrics (checklist generation time, page load)
2. Run load test: 10-100 concurrent users
3. Optimize slow paths if identified
4. Consider caching, database indexing

**Impact if Deferred:**
- May discover performance issues in production
- Acceptable for Beta single-user focus
- Production monitoring will catch real issues

---

### 11. **Legacy Storage Code Cleanup**
**Severity:** Low  
**Status:** Open

**Description:**
`server/storageFile.js` contains legacy JSON-file storage from MVP phase. App now uses SQLite. Legacy code is dead code but still in repo, creating maintenance burden.

**Current State:**
- Codebase uses `server/storage.js` (Knex + SQLite)
- `storageFile.js` not used, marked as deprecated
- Code duplication creates confusion

**Likely Cause:**
- Migration to SQLite done incrementally, legacy code not removed

**Planned Next Action (Post-Beta):**
1. Verify no code references `storageFile.js`
2. Archive or remove it
3. Update documentation

**Impact if Deferred:**
- No functional impact
- Just code cleanliness
- Can be done in maintenance sprint

---