# Release Candidate: Smart Packing Checklist Generator v0.9

## Release Information

- **Release Candidate Tag:** `rc-v0.9`
- **Release Date:** `April 18, 2026`
- **Release Candidate Status:** Ready for final testing and validation
- **Target Final Release:** `Week 15–16 (Late April / Early May 2026)`
- **GitHub Release Page:** `https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/releases` (pending tag creation)

---

## Executive Summary

This release candidate represents a significant step forward from Beta (v0.1, released April 6, 2026). Over the past two weeks (Week 13–14), the engineering team has focused entirely on **operational hardening and reliability** — not new features. The result is a production-ready system with:

- **35 commits** of focused improvements since Beta
- **4 new regression tests** protecting critical bug fixes
- **Enhanced observability** with request correlation and structured logging
- **Improved error handling** with user-facing feedback and security hardening
- **Complete test coverage** for authentication failure paths and state management
- **Documented architecture** aligned with actual deployed system

The application remains **functionally identical to Beta** (all existing workflows preserved), but the system is now more **reliable, maintainable, and supportable** for production operation.

---

## Core Workflows - Expected to Be Stable

All workflows from Beta remain fully functional and are now reinforced with regression test coverage:

### 1. **Authentication and Access Control**
- Google OAuth login via Passport.js with session-based authentication (`connect.sid`)
- Protected API routes and user-scoped trip ownership enforcement
- **New RC improvement:** Enhanced error handling with user feedback when OAuth fails
- **Tests:** Auth error scenarios covered in `tests/e2e/auth-error.spec.js`

### 2. **Trip Creation and Checklist Generation**
- Users can enter trip details (name, destination type, duration)
- Checklist generation based on destination type and packing duration
- "Generate Checklist" button validation and gating
- **Tests:** Covered in `tests/e2e/primary-workflow.spec.js`

### 3. **Trip Management (Save, Load, Update, Delete)**
- Trips persisted to SQLite via Knex.js
- Users can load saved trips back into form for review or modification
- Trip data persists across sessions and browser restarts
- Existing trips can be updated and resaved
- Form automatically resets after creating a new trip
- **New RC improvement:** Edit-mode UI state management fixed (Issue #126)
- **Tests:** Regression test for edit-mode state in `tests/e2e/primary-workflow.spec.js` (improved in Week 13)

### 4. **Checklist Interaction (Packed/Unpacked Toggle)**
- Users can toggle items packed/unpacked
- Checklist state persists after save and reload
- Auto-save sync updates checklist changes for saved trips
- **Tests:** Covered in primary workflow test

### 5. **Hosted Deployment on AWS**
- Application deployed to AWS Elastic Beanstalk at `https://spcg.zentrofi.com`
- SQLite database persisted via mounted EBS volume
- Health endpoint available: `https://spcg.zentrofi.com/health` with status details
- **New RC improvement:** Health endpoint enhanced with environment, version, uptime, and database status
- CI/CD pipeline validates build, runs unit tests, E2E tests, then deploys

---

## Major Differences from Beta (v0.1)

### Operational Improvements (No Feature Changes)

The RC release maintains **100% feature parity with Beta** — no new features were added. Instead, the team focused on three key operational areas:

#### 1. **Enhanced Observability and Logging**

**Beta state:** Basic action-level logging (START/SUCCESS/ERROR)

**RC improvements:**
- **Request Correlation IDs:** Every HTTP request receives a unique correlation ID, tracked through logs for debugging
- **Structured JSON Logging:** All logs include request ID, method, path, status code, response time, and correlation context
- **Health Endpoint Enhancement:** `/health` now returns detailed system status including environment, version, uptime, and database connectivity
- **Security Hardening:** Request IDs validated (alphanumeric + `._-`, max 128 chars); logs use `req.path` only (no query strings to prevent credential leaks)
- **Related Issue:** [#101 - Reliability hardening and observability](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/101) (PR merged in Week 13)

**Impact:** Operators can now trace requests through the system, diagnose issues faster, and validate production health

#### 2. **Improved Error Handling and User Feedback**

**Beta state:** Per-route error handling with inconsistent user feedback; some failures silent

**RC improvements:**
- **Timeout Handling:** All API calls in `src/apiClient.js` now have 15-second timeout with user-facing error messages
- **Network Error Feedback:** Distinct toast messages for network timeouts, server errors (5xx), and validation errors (4xx)
- **No Stack Trace Leaks:** Error responses to client do not expose internal server paths or implementation details
- **Auth Error Visibility:** When Google OAuth fails, users see clear error message and can retry login
- **Related Issues:**
  - [#101 - Error handling](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/101) (merged Week 13)
  - [#98 - Auth failure error feedback](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/98) (test added Week 13)

**Impact:** Users get immediate, clear feedback on failures; operators get actionable error information in logs

#### 3. **Bug Fixes and Regression Test Coverage**

**Three critical bugs fixed and protected with regression tests:**

| Issue | Bug | Fix | Test Coverage |
|-------|-----|-----|----------------|
| **#126** | Flaky edit-mode UI state after loading saved trip | Button state race condition fixed; context updates ordered | `primary-workflow.spec.js` (improved regression test) |
| **#98** | Auth failure doesn't show error message | Error toast added; URL parameter cleaned | `auth-error.spec.js` |
| **#121** | Trip form accessible after auth error (access control) | Form hidden on auth failure; login section visible | `auth-error.spec.js` |

**Four new E2E regression tests added to prevent future failures:**
1. **`tests/e2e/auth-error.spec.js`** — Auth failure error feedback and access control
2. **`tests/e2e/primary-workflow.spec.js` (Line 219)** — Edit-mode state management after loading saved trip
3. **`tests/e2e/primary-workflow.spec.js` (Line 314)** — Change detection (form dirty state tracking)

**Related PRs:**
- PR #130 - Fixed edit-mode UI and added regression test
- PR #128 - Auth error handling
- PR #127 - Timeout and error handling in API client

**Impact:** These bugs are now protected; they cannot regress without test failures alerting developers

---

## Known Risks Before Final Release

The RC is **stable and production-ready**, but the following known risks and architectural constraints remain:

### High-Priority Risks (Should Address Before Full Release)

| Risk | Severity | Mitigation Plan | Target Week |
|------|----------|-----------------|-------------|
| **Input validation gaps** | Medium | Add input length limits for trip name (max 100 chars) and destination (max 50 chars). Issue #81. | Week 15 |
| **XSS audit incomplete** | High (Security) | Verify all DOM writes use `.textContent` (safe) not `.innerHTML` (unsafe). Issue #82. Likely affects `main.js` and `checklistRenderer.js`. | Week 15 |

### Medium-Priority Risks (Can Address Post-Release)

| Risk | Impact | Mitigation Path |
|------|--------|-----------------|
| **SQLite write concurrency** | Under high concurrent load, single-writer lock could bottleneck | Migrate to PostgreSQL (Knex makes this straightforward) |
| **In-memory session store** | Server restart logs out all users | Add persistent session store (e.g., connect-sqlite3 or Redis) |
| **Single EB instance** | Deployment or instance failure causes downtime; no auto-scaling | Multi-instance EB with PostgreSQL and external session store |
| **Frontend-only checklist logic** | Generation rules unverifiable server-side; modified client could inject items | Move generation to server endpoint or validate server-side |
| **No rate limiting** | API endpoints unprotected against abuse | Add express-rate-limit middleware |
| **EBS single-AZ** | EBS failure = database loss | Automated snapshots or migrate to RDS |

---

## What Must Still Be Completed in Week 15–16

To move from RC to final release (v1.0), the following work is committed:

### 1. **Security Hardening (Issue #82)**
- **Owner:** TBD
- **Task:** Audit all DOM rendering for XSS vulnerabilities
  - Review `src/main.js`, `src/checklistRenderer.js` for `.innerHTML` usage
  - Replace unsafe `.innerHTML` with `.textContent` or safe templating
  - Add code comments preventing future `.innerHTML` use
- **Tests:** Existing E2E tests validate no script injection; add unit test for rendering
- **Target:** Complete by Week 15

### 2. **Input Validation (Issue #81)**
- **Owner:** TBD
- **Task:** Enforce input length limits on trip fields
  - Frontend: Add `maxlength` attribute to trip name and destination inputs
  - Backend: Add validation in `server.js` (POST and PUT routes) for name ≤ 100 chars, destination ≤ 50 chars
  - Return HTTP 400 with clear message if exceeded
  - Unit tests for validation logic
  - Verify no existing data violates limits (backfill if needed)
- **Tests:** Unit tests in `app.test.js`; E2E test for form behavior
- **Target:** Complete by Week 15

### 3. **Final Integration Testing**
- **Task:** Full end-to-end regression test run on hosted environment
  - Run `npm run test:all` (unit + E2E tests)
  - Validate health endpoint responses
  - Smoke test core workflows (auth, create trip, save, load, edit, delete)
- **Target:** Week 16 before final tag

### 4. **Documentation Updates**
- **Task:** Finalize handoff documentation and known issues list
  - Update `docs/beta/week12-known-issues.md` to reflect fixes in RC
  - Add observability and error-handling changes to architecture doc
  - Finalize `docs/handoff/hand-off-draft.md` with recommendations for next team
- **Target:** Week 15

### 5. **Release Tag and Artifact**
- **Task:** Create final release (v1.0) with GitHub release page
  - Tag: `v1.0` (or `v1.0.0`)
  - Release notes summarizing Beta → RC → v1.0 journey
  - GitHub release artifact link
- **Target:** Week 16

---

## Test Coverage and Stability Metrics

### Test Suite Status (Week 14)

| Test Type | Count | Status | Recent Changes |
|-----------|-------|--------|-----------------|
| **Unit Tests** | 5+ | ✅ Passing | API validation, checklist generation, storage |
| **Integration Tests** | 4+ | ✅ Passing | Server routes, authentication, CRUD operations |
| **E2E Tests (Playwright)** | 7+ | ✅ Passing | Primary workflow, auth errors, failure paths, edit mode |
| **CI Pipeline** | ✅ Automated | All tests + lint before merge | GitHub Actions (ci.yaml) |

### New Regression Tests (Week 13)

All critical bugs now protected by tests:

```
tests/e2e/auth-error.spec.js
  ✓ Issue 98 - auth failure page displays error message and cleans up URL
  ✓ Issue 121 - user cannot access trip form after auth error

tests/e2e/primary-workflow.spec.js
  ✓ Issue 126 - edit-mode state management after loading saved trip (improved regression test)
  ✓ Issue 122 - change detection (form dirty state)
```

**Test execution:** All E2E tests passing as of Week 14 (confirmed in terminal context)

---

## Commits and Changes Since Beta (April 6 → April 18)

**Total commits since Beta tag:** 35 commits over 12 days

**Key commit themes:**

1. **Week 13 Observability & Error Handling** (9 commits)
   - Request correlation IDs and sanitization (commits: 2787613, e0b9c21, 25b9a6a)
   - Health endpoint enhancement (commits: b45c97e)
   - Logging and diagnostics (commit: 2787613)

2. **Week 13 Regression Tests & Bug Fixes** (6 commits)
   - Edit-mode UI fix and test (commits: 30e2034, PR #130)
   - Auth error handling tests (commits: PR #128)
   - Change detection test (commits: PR #127)

3. **Week 13 Refactoring & Architecture** (8 commits)
   - Architecture snapshot update (commits: b1aafec, PR #137)
   - Handoff documentation draft (commit: 25b9a6a, PR #132)
   - Code refactoring for maintainability (PR #135)

4. **Week 14 Documentation and Runbook** (4 commits)
   - Week 14 runbook (commits: 5c9132e, 49cb102)
   - Various documentation updates

**Full commit history:**
```
git log beta-v0.1..HEAD --oneline | head -35
```

---

## Release Artifact and GitHub Release Page

**GitHub Release Link:** `https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/releases`

- **Release Tag:** Will be created as `rc-v0.9` (pending confirmation)
- **Artifacts:** 
  - Built frontend assets in `dist/` directory
  - Source code tagged in Git
  - Deployment instructions in `docs/deployment/beta-deploy.md` and `Procfile`

**Deployment Status:**
- Current production deployment: `https://spcg.zentrofi.com` (Beta v0.1)
- RC deployment ready: Same EB environment can be updated via CI/CD pipeline merge to main
- Health endpoint available: `https://spcg.zentrofi.com/health`

---

## Sign-Off and Next Steps

### Release Candidate Readiness Checklist

- ✅ All Beta features verified functional
- ✅ 35 commits of hardening and testing completed
- ✅ 4 new regression tests added and passing
- ✅ Observability enhancements in place
- ✅ Error handling improved with user feedback
- ✅ Architecture documentation updated
- ✅ Known issues tracked and prioritized
- ⏳ XSS audit (Issue #82) — Target Week 15
- ⏳ Input validation (Issue #81) — Target Week 15
- ⏳ Final integration testing — Target Week 16
- ⏳ v1.0 tag and release notes — Target Week 16

### Recommended Actions for Week 15–16

1. **Complete security and validation hardening** (Issues #81, #82)
2. **Run full regression test suite** on hosted environment
3. **Update known issues documentation** with fixes
4. **Finalize handoff documentation** for next team
5. **Create v1.0 final release tag** with release notes
6. **Deploy v1.0 to production** via CI/CD pipeline

### For Next Development Team

This RC represents a stable, well-tested, and well-documented foundation. The remaining work (Issues #81, #82) is clearly scoped and prioritized. The architecture is sound, and the codebase is maintainable. See `docs/handoff/hand-off-draft.md` for full handoff guidance.

---

## Appendix: Key Documentation References

- **Architecture:** [docs/architecture/architecture-snapshot.md](../../architecture/architecture-snapshot.md)
- **Beta Release:** [docs/releases/beta-release.md](beta-release.md)
- **Week 13 Sprint:** [docs/final/week13-sprint.md](../../final/week13-sprint.md)
- **Week 13 Tests:** [docs/final/week13-tests.md](../../final/week13-tests.md)
- **Week 13 Architecture Update:** [docs/final/week13-architecture.md](../../final/week13-architecture.md)
- **Observability Plan:** [docs/final/week13-observability.md](../../final/week13-observability.md)
- **Known Issues (Beta):** [docs/beta/week12-known-issues.md](../../beta/week12-known-issues.md)
- **API Documentation:** [docs/api/openapi.yaml](../../api/openapi.yaml)
- **Deployment:** [docs/deployment/beta-deploy.md](../../deployment/beta-deploy.md)
- **Handoff Draft:** [docs/handoff/hand-off-draft.md](../../handoff/hand-off-draft.md)

---

**Release Candidate created:** April 18, 2026  
**Ready for final validation and testing**
