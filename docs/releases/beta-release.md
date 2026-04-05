# Beta Release Notes
## Smart Packing Checklist Generator

This Beta release marks the transition from initial feature implementation (Weeks 10–11) to a stable, test-backed, and deployable system. The application now supports a complete end-to-end workflow for authenticated users, with improved reliability, consistent API behavior, and a reproducible deployment path.

---

## Release Information

- **Release Name:** Smart Packing Checklist Generator Beta
- **Release Tag:** `{{BETA_RELEASE_TAG}}`
  _Suggested format: `beta-v0.1`_
- **Release Date:** `{{RELEASE_DATE}}`
- **GitHub Release Page:** `{{GITHUB_RELEASE_LINK}}`

> Note: The final tag and release link will be added once all approved corrections are merged to `main` and the Beta release is cut.

---

## Major Included Features / Workflows

### Authentication and access control
- Google OAuth login using Passport.js
- Session-based authentication (`connect.sid`)
- Protected API routes
- User-scoped trip ownership enforcement

### Trip creation and checklist generation
- Users can enter trip details and generate packing checklists
- Checklist generation is based on destination type and duration

### Trip saving, loading, and updating
- Trips can be saved to persistent storage (SQLite via Knex)
- Saved trips can be loaded back into the form
- Trip data persists across sessions
- Existing trips can be updated and resaved

### Packed/unpacked checklist workflow
- Users can toggle checklist items packed/unpacked
- Checklist state persists after saving and reloading
- Auto-save sync updates checklist changes for saved trips

### Trip deletion
- Users can delete saved trips
- Deleted trips are removed from the saved trips list

### Hosted Beta deployment
- Application deployed to AWS Elastic Beanstalk
- SQLite database persisted via mounted EBS volume
- Health endpoint available for validation:
  - `https://spcg.zentrofi.com/health`

### Automated testing and CI
- Unit tests for checklist generation
- API/integration tests for validation, authentication, and CRUD behavior
- Playwright E2E tests covering core user workflows
- CI pipeline for linting, testing, and deployment validation

---

## Important Fixes Since Week 10–11

This section highlights key bug fixes, reliability improvements, and UX corrections made after the initial Week 10–11 implementation phase to stabilize the system for Beta.

### Authentication, testing, and CI stabilization
- Introduced centralized test-mode authentication to ensure consistent behavior across backend routes (#107)
- Fixed inconsistent authentication handling, including `/auth/user`, aligning frontend and backend expectations
- Eliminated brittle Google OAuth dependency in automated tests, stabilizing Playwright E2E execution
- Fixed failing tests by aligning backend and database behavior with expected outcomes
- Added deployment verification steps to prevent silent CI/CD failures
- Strengthened production safety checks (e.g., `SESSION_SECRET` enforcement)

### Authentication and integration fixes
- Resolved mismatches between frontend auth expectations and backend session state (#89)
- Fixed inconsistent login behavior and ensured authenticated UI state is reliable

### API and schema alignment
- Standardized API request/response behavior across frontend and backend (#95)
- Resolved schema inconsistencies and aligned data model usage (#91)

### UX and workflow clarity fixes
- Fixed misleading save button behavior after checklist regeneration (#69)
- Added required-field guidance before checklist generation (#63)
- Fixed trip form not clearing/resetting appropriately after saving (#61)
- Improved checklist update clarity by adding visual feedback when generating a new checklist (#115)

### CI, deployment, and environment reliability fixes
- Ensured required CI checks consistently report status (#94)
- Improved CI workflow execution reliability (#96)
- Added deployment verification steps to prevent silent failures (#107)
- Corrected EBS environment configuration handling (#99)
- Improved deployment smoke test reliability and validation flow (#108)

### Checklist generation feedback fix
- Fixed checklist loading indicator not resolving due to CSS/visibility issue (#109)
- Simplified loading behavior for near-instant checklist generation

---

## Known Limitations Still Present

The Beta release is stable and functional, but the following known limitations remain:

### Open issues
- **#81:** Add input length limits for trip fields
- **#82:** Audit XSS vulnerability in trip rendering
- **#98:** Add Playwright tests for authentication failure handling
- **#101:** Remaining error-handling consistency improvements
- **#60:** ESLint/Vitest globals developer-experience cleanup

---

## Release Evidence

This Beta release is supported by:

- Hosted deployment at: `https://spcg.zentrofi.com`
- Health endpoint validation
- CI/CD pipeline execution for build, test, and deployment
- Unit, integration, and E2E test coverage

---

## Final Release Metadata To Fill In Before Publishing

Replace placeholders before creating the release:

- `{{BETA_RELEASE_TAG}}`
- `{{RELEASE_DATE}}`
- `{{GITHUB_RELEASE_LINK}}`

Optional additions:
- deployed commit hash on `main`
- CI run URL associated with the release