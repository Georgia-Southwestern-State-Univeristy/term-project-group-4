# Week 9 Sprint Plan

## Sprint Goal

**By Sunday, users can create, track, and delete trips reliably with clear error feedback and backend logging.**

---

## Committed Backlog

Items are ranked by priority. Only committed items consume sprint time this week.

| Rank | Item | Source | Owner | Why This Week |
|------|------|--------|-------|---------------|
| 1 | **Database migration (SQLite)** | Beta Sprint 1 | TBD | Riskiest item — Unblocks auth, deletion, and locking. |
| 2 | **Trip deletion** | Beta Sprint 1 | TBD | Small feature, depends on DB but can ship same week. |
| 3 | **Toast notifications** | Beta Sprint 1 | TBD | Addresses error handling. |
| 4 | **Integration test suite** | Beta backlog | TBD | Regression protection. |
| 5 | **Observability starter (structured logging)** | Week 9 requirement | TBD | Required for deliverable D |
| 6 | **Bug triage + fix 2 issues** | Week 9 requirement | TBD | Required for deliverable C |

---

### Acceptance Criteria

**1. Database migration (SQLite)**
- `storageFile.js` replaced by a SQLite-backed module behind the same interface
- All 23 existing tests pass against the new storage layer
- Trip data persists across server restarts

**2. Trip deletion**
- `DELETE /api/trips/:tripId` returns `204` on success and `404` for missing trips
- Deleted trips no longer appear in `GET /api/trips`
- UI shows a Delete button on each saved trip; clicking it removes the trip without a full page reload

**3. Toast notifications**
- Toast component renders success and error messages in the UI
- Save, delete, and network-error events trigger a toast instead of silent console logs
- Toasts auto-dismiss after 4 seconds

**4. Integration test suite**
- End-to-end tests covering create → generate → pack → update → delete flow
- Tests run in CI alongside existing unit tests
- At least one happy-path and one error-path scenario per endpoint

**5. Observability starter (structured logging)**
- Structured JSON logging added to the Express server (request method, path, status, duration)
- Errors logged with stack traces and request context
- Log output is parseable by standard tools (e.g., `jq`)

**6. Bug triage + fix 2 issues**
- Team reviews open issues and labels at least 4 as triaged
- At least 2 bugs fixed with tests proving the fix
- Fixed issues are closed with a link to the merging PR

---

## Evidence

**Project Board (Sprint View):**
https://github.com/orgs/Georgia-Southwestern-State-Univeristy/projects/26/views/1

---

## Ordering Notes

- **Item 1 (Database)** must merge first — deletion depends on it (ordering gate from beta plan).
- **Item 2 (Deletion)** can start on a feature branch in parallel but cannot merge until the DB layer lands.
- **Items 3, 5, 6 (Toast, Logging, Bug fixes)** have no blocking dependencies and can proceed immediately.
- **Item 4 (Integration tests)** can begin with the existing API but should be finalized after DB migration merges.

---

## What Is NOT Committed This Week

The following items remain on the backlog but are not committed to this sprint:

- User authentication (blocked by DB migration — likely Week 10)
- Optimistic locking (depends on stable DB layer)
- Custom checklist items
- Edit trip metadata
- Accessibility audit
- AI-powered checklist generation

If it is not in the committed backlog table above, it is not required this week. Finish work, do not sprawl.
