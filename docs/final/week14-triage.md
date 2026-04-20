# Week 14 Bug Triage

**Date:** 2026-04-18
**Purpose:** Prioritize remaining issues, bugs, and technical debt ahead of the final release (Weeks 15–16). This list is intended to help the team make final decisions under time pressure, not to serve as a backlog dump.

**On owners:** Assignments are marked *(preliminary)* and reflect a best-guess based on each item's primary area (backend, deploy, etc.) mapped against team roles (Jason — lead dev/architect, Naren — DevOps/QA, Heather — PM & docs lead). **Let's confirm these as part of PR approval.**

---

## Priority Summary

| Priority | Count | Items |
|----------|-------|-------|
| **Critical** — must fix before final presentation | 2 | #82, #81 |
| **Important** — strongly recommended before final release | 5 | #129, POST trim guards, PUT trim guards, `migrateLatest` gating, #101 verification |
| **Optional** — good polish if time allows | 3 | `mkdir` import-time robustness, in-memory session store, single-instance scaling note |
| **Closed this week** | 4 | #98, #121, #122, #126 |

**Total open items: 10**

---

## Critical

### 1. Audit and eliminate XSS in trip rendering — #82

- **Component:** `src/main.js`, `src/checklistRenderer.js`
- **Description:** Trip names, destination types, and checklist item names are rendered in the UI. If any rendering path uses `.innerHTML` instead of `.textContent`, a user-supplied string could execute as script. Must be audited and eliminated before the final demo.
- **Owner:** Jason (preliminary)
- **Week 15/16 disposition:** Close in Week 15. Audit all DOM writes, replace any `innerHTML` with `textContent`, and add a code comment preventing future `.innerHTML` use.
- **Link:** [#82](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/82)

### 2. Add input length limits on trip fields — #81

- **Component:** HTML form inputs (`#trip-name`, `#destination-type`), `server.js` POST/PUT validators, database schema
- **Description:** Trip name and destination type fields accept arbitrary-length input. Can break UI layout, bloat the database, and interacts with the XSS audit above (bounded inputs are easier to reason about).
- **Owner:** Jason (preliminary) — likely needs a frontend + server pair
- **Week 15/16 disposition:** Close in Week 15. Add `maxlength` attributes (name ≤ 100, destination ≤ 50), matching server validation, and return 400 with a clear message if exceeded.
- **Link:** [#81](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/81)

---

## Important

### 3. Deduplicate trip payload validation across POST and PUT — #129

- **Component:** `server.js` (POST `/api/saveTrip`, PUT `/api/trips/:tripId`)
- **Description:** Checklist-item validation is copy-pasted between POST and PUT handlers (~30 lines each). A fix in one place can drift from the other. Extract a shared validator.
- **Owner:** Jason (preliminary)
- **Week 15/16 disposition:** Close in Week 15. Extract to `server/validators/trip.js` (or inline helper) and cover with unit tests.
- **Link:** [#129](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/129)

### 4. Type guards before `.trim()` in POST handler

- **Component:** `server.js` POST `/api/saveTrip`
- **Description:** `name?.trim()` and `destinationType?.trim()` throw 500 if the client sends a non-string value (e.g. `name: 123`, `name: null`). Optional chaining only guards `null`/`undefined`. Deferred from Copilot review on PR #67.
- **Owner:** Jason (preliminary) — natural bundle with #129
- **Week 15/16 disposition:** Close in Week 15 alongside #129. Add `typeof` guards that return 400 before trimming. Add tests for non-string inputs.

### 5. Type guards before `.trim()` in PUT handler

- **Component:** `server.js` PUT `/api/trips/:tripId`
- **Description:** Same issue as #4 but in the PUT route. Deferred from Copilot review on PR #67.
- **Owner:** Jason (preliminary) — natural bundle with #129 and #4
- **Week 15/16 disposition:** Close in Week 15 alongside #129 and #4.

### 6. Gate `migrateLatest()` to development only

- **Component:** `server.js` startup, `server/storage.js`
- **Description:** `migrateLatest()` runs on every non-test startup. In production this means every deploy (and every instance boot) runs DDL with whatever privileges the DB user has. Deferred from Copilot review on PR #68. Also a 12-factor concern (Build/Release/Run separation).
- **Owner:** Naren (preliminary) — deploy/release-process concern
- **Week 15/16 disposition:** Close in Week 15. Gate to `NODE_ENV === 'development'` or move migrations into a deploy-time step that runs before the app boots.

### 7. Verify and close reliability hardening — #101

- **Component:** UI error handling, `server.js` error handler
- **Description:** Partially addressed by PR #133 (Week 13 observability — `requestId` propagation, structured error logging, `/health` degradation status). Needs a pass to confirm the remaining items are either covered or explicitly descoped, then close the issue.
- **Owner:** Heather (preliminary) — verification/cleanup pass fits recent task-closeout work
- **Week 15/16 disposition:** Close in Week 15 once the remaining scope is confirmed as either done or out-of-scope.
- **Link:** [#101](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/101)

---

## Optional

### 8. `mkdir` robustness at import time

- **Component:** `server/storage.js`, `knexfile.js`
- **Description:** `db = knex(config)` runs at import time. If `data/` is missing and `knexfile.js` isn't imported first, it could still fail before the `mkdirSync` in `knexfile.js` runs. Deferred from Copilot review on PR #68. Low-probability edge case given current import order but worth confirming.
- **Owner:** Jason (preliminary)
- **Week 15/16 disposition:** Confirm import order in Week 16 if time allows, otherwise document the assumption and close.

### 9. In-memory session store

- **Component:** `server.js` session middleware
- **Description:** Uses the default `express-session` `MemoryStore`. All users are logged out on every app restart (including every EB deploy). Already documented as a known operational constraint in `docs/admin-guide.md`. Not a bug — a scaling/UX trade-off.
- **Owner:** Naren (preliminary) — deploy/infra-adjacent
- **Week 15/16 disposition:** Leave as known constraint for final release. Mention as a future-work item in the hand-off doc.

### 10. Single-instance deployment

- **Component:** AWS Elastic Beanstalk environment
- **Description:** Currently runs as a single EB instance backed by a local SQLite file on an EBS volume. Cannot horizontally scale. Already documented in `docs/admin-guide.md` and `docs/handoff/hand-off-draft.md`. Not a bug — an architectural decision driven by the SQLite choice.
- **Owner:** Naren (preliminary) — deploy/infra-adjacent
- **Week 15/16 disposition:** Leave as a known architectural decision for the final release. Future-work item only.

---

## Closed This Week

These issues were closed at the Week 13 → Week 14 boundary (2026-04-13). Listed here for transparency; PR links attached where the closure is traceable.

| Issue | Title | Closed by |
|-------|-------|-----------|
| [#126](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/126) | Flaky edit-mode UI after loading saved trip | [PR #130](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/130) |
| [#122](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/122) | Add unit/integration test around change detection | [PR #134](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/134) |
| [#121](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/121) | Playwright regression test for authError redirect | [PR #134](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/134) |
| [#98](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/98) | Playwright auth failure / error redirect tests | [PR #134](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/134) |

---

## Disposition Plan

**Week 15 target (close):** #82, #81, #129, Copilot type guards (POST + PUT), `migrateLatest` gating, #101 verification — **7 items**.

**Week 16 target (verify or defer):** `mkdir` robustness — **1 item**.

**Accepted for final release as known constraints:** in-memory session store, single-instance deployment — **2 items**. These should appear in the hand-off doc, not be treated as bugs.

**Risk if any Critical slips:** XSS or unbounded input would damage evaluator confidence in the demo. These are the first two items to pick up in Week 15.
