# Week 11: Beta Sprint 3 - Integration, Reliability, and End-to-End Flow

**Sprint Goal:** By Friday, an authenticated user can sign in, create a trip, save it, reload it, update checklist state, and delete it with reliable error handling and passing CI-backed tests.

## Primary End-to-End Workflow

1. User signs in with Google OAuth.
2. User creates a trip and generates a checklist.
3. User saves trip to API/database.
4. User reloads and restores the same trip.
5. User updates packed state and persists changes.
6. User deletes trip and confirms it is removed.

This is the required Week 11 workflow and takes priority over new feature requests.

---

## Committed Integration Backlog (5 Items)

| # | Item | Owner | Priority |
|---|------|-------|----------|
| 1 | E2E workflow verification and integration fixes as needed (auth + API + DB + UI) | Heather | 1 |
| 2 | Reliability hardening (UI loading/error states + server failure responses) | Jason | 2 |
| 3 | Add workflow-focused automated tests (minimum 4) | Naren | 2 |
| 4 | CI stability cleanup and flaky check remediation | Jason | 2 |
| 5 | Known issues log and beta readiness snapshot | Heather | 2 |

Rule check: All committed items directly improve or document integration, workflow completion, reliability, testing, or CI stability.

---

## Acceptance Criteria by Item (Deliverable A Scope)

### 1. E2E workflow verification and integration fixes as needed (auth + API + DB + UI)

- The primary workflow (sign in -> create -> save -> reload -> update -> delete) succeeds on current `main` without manual DB/file edits.
- One full run of the workflow is verified by the team on the sprint-review target environment (Elastic Beanstalk if deployed; otherwise the agreed local review environment).
- Verification evidence is captured; if any integration defects are found, fixes are merged and linked from the sprint board.

### 2. Reliability hardening (UI loading/error states + server failure responses)

- TBD: At least 2 concrete UI reliability defects are fixed (for example: stuck spinner, duplicate submission, missing failure feedback).
- Save, update, and delete actions surface user-facing success/error feedback in both success and failure cases.
- Server responses for failure paths are consistent and do not leak stack traces to the client.

### 3. Add workflow-focused automated tests (minimum 4)

- Add at least 4 new tests in Week 11.
- At least 2 tests validate the primary end-to-end workflow behavior. 
- At least 1 integration or multi-component test and at least 1 failure-path/regression test are included.

### 4. CI stability cleanup and flaky check remediation

- CI passes on all Week 11 PRs that implement committed sprint items.
- Any CI failure encountered during Week 11 has a recorded fix in the corresponding PR discussion.
- `main` is green at sprint close.

### 5. Known issues log and beta readiness snapshot

- Known issues discovered during Week 11 are captured and ranked high/medium/low.
- Deferred items from this sprint are listed with a short reason.
- A beta-readiness note is prepared for sprint close based on Week 11 results.

---

## Evidence

- **Project Board Sprint View:** https://github.com/orgs/Georgia-Southwestern-State-Univeristy/projects/26/views/1
- **PR Evidence:** Week 11 PRs linked from each backlog item
- **CI Evidence:** Passing run links included in `week11-ci.md`

---

## Sequencing Gate

1. Fix E2E integration first (Item 1).
2. Land reliability fixes and workflow tests in parallel (Items 2-3).
3. Finalize known issues and readiness snapshot at sprint close (Item 5).

No new feature expansion unless integration work is complete and CI is stable.