# Week 11 Reliability and Failure Handling

## Scope

This document tracks concrete reliability risks in the current system, records Week 11 reliability fixes, and lists deferred risks for Week 12+.

Rule applied: reliability work below is implementation-specific and tied to current frontend/backend behavior.

---

## System-Specific Reliability Risks (Required 3)

### Risk 1: Duplicate or inconsistent saves from repeated user clicks

- Area: frontend trip save flow in `src/tripForm.js`
- Failure mode: repeated clicks on Save can create duplicate in-flight save/update requests and inconsistent UI state.
- User impact: duplicate records or unclear save state.

### Risk 2: Invalid payloads causing unstable API behavior

- Area: backend create/update handlers in `server.js`
- Failure mode: malformed checklist items or blank required fields can enter API handlers and break expected persistence behavior.
- User impact: bad data, failed saves, and unclear correction path.

### Risk 3: Missing or unauthorized trip IDs during update/delete

- Area: backend trip read/update/delete routes in `server.js`
- Failure mode: trip not found (non-existent or wrong owner) can throw and produce poor or inconsistent failure semantics if not handled cleanly.
- User impact: confusing failure responses and uncertainty whether data changed.

---

## Week 11 Fixes Implemented (At Least 2)

### Fix A: Prevent duplicate save submission in UI

- Before:
  - Save actions could be retriggered while a request was in flight.
  - Users had limited immediate signal that save was processing.
- After:
  - Save button is disabled during save/update request and text changes to `Saving...`.
  - On success, button text is updated to `Saved! (ID: ...)` and success toast is shown.
  - On failure, button is re-enabled and changed to `Save failed - retry?`.
- Implementation evidence:
  - `src/tripForm.js`
  - Addressed in PR #89: https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/89
- User-facing messaging improved:
  - `Trip saved successfully.`
  - `Trip updated successfully.`
  - `Failed to save trip: <error>`

### Fix B: Harden server-side validation for whitespace and checklist payloads

- Before:
  - Whitespace-only required fields could pass as valid input.
  - Invalid checklist item shape could produce inconsistent outcomes.
- After:
  - `POST /api/saveTrip` trims and validates required string fields.
  - `PUT /api/trips/:tripId` rejects blank `name`/`destinationType` updates.
  - Both endpoints validate each checklist item (`id`, `name`, `category`, `packed`) with 400 responses.
- Implementation evidence:
  - `server.js`
  - `tests/server.test.js`
  - Addressed in PR #90: https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/90
- User-facing messaging improved:
  - `Missing required fields: ...`
  - `name must not be blank`
  - `destinationType must not be blank`
  - `Invalid checklist payload` with field-specific message

### Fix C: Safe not-found and ownership handling on trip operations

- Before:
  - Not-found and cross-user access paths risked generic or ambiguous failure handling.
- After:
  - GET/PUT/DELETE trip routes return clear `404` with `Trip not found` for missing/non-owned trips.
  - Update/delete paths handle not-found conditions without crashing server flow.
- Implementation evidence:
  - `server.js`
  - `tests/server.test.js`
  - Addressed in PR #89: https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/89
  - Additional API/doc reliability alignment in PR #90: https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/90
- User-facing messaging improved:
  - `Trip not found`
  - `Failed to update trip: <error>` (frontend surfaced)
  - `Failed to delete trip: <error>` (frontend surfaced)

---

## Verification Evidence

### Code References

- `src/tripForm.js`
- `src/apiClient.js`
- `server.js`
- `tests/server.test.js`

### PR and CI Evidence

- Project Board Sprint View:
  - https://github.com/orgs/Georgia-Southwestern-State-Univeristy/projects/26/views/1
- Week 11 reliability PR links:
  - PR #89 (Frontend save flow + auth/frontend integration fixes): https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/89
  - PR #90 (Server-side validation + API/doc alignment): https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/90
  - PR #91 (Repo hygiene/schema cleanup supporting reliability consistency): https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/91
- Passing CI run links:
  - Attached in the corresponding Week 11 PR checks/discussions.

---

## Remaining Risks Deferred to Week 12+

### Deferred 1: Session reliability under multi-instance hosting

- Why deferred: migration to Elastic Beanstalk is still in progress; current session approach is not ideal for horizontal scaling.
- Risk: login/session consistency may degrade if multiple instances are enabled without shared session storage.

### Deferred 2: Cloud log durability and centralized queryability

- Why deferred: current logger writes to local file path and migration logging strategy is still being finalized.
- Risk: incident debugging in cloud environments can be harder without durable centralized logs.

### Deferred 3: Request timeout and retry strategy for API calls

- Why deferred: frontend currently surfaces errors but does not yet implement explicit timeout controls/backoff strategy.
- Risk: poor behavior during partial outages or slow downstream dependencies.

---

## Next Update Checklist

- Attach screenshot snippets or run notes for at least two failure-path user messages.
- After merge, add final `main` CI run link confirming reliability-path tests remain green.
