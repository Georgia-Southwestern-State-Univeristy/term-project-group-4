# Beta Sprint Plan (Weeks 9-12)

> Informed by midterm reality: all 6 MVP stories shipped, 23 tests passing,
> JSON-file persistence works for single-user demo but won't scale.

---

## Ranked Backlog (11 items)

| # | Item | Category | Risk |
|---|------|----------|------|
| 1 | Migrate persistence to a database (engine TBD) | Architecture | **HIGH** — blocks multi-user, deletion, and locking |
| 2 | User authentication | Feature | **HIGH** — depends on database; enables multi-user isolation |
| 3 | Trip deletion endpoint (`DELETE /api/trips/:id`) | Feature | Medium |
| 4 | Custom checklist items (add / remove / rename) | Feature | Medium |
| 5 | Optimistic locking (ETag / version field on PUT) | Reliability | Medium |
| 6 | Toast notification system for UI errors | UX | Low |
| 7 | Edit trip metadata (name, destination, duration) | Feature | Low |
| 8 | Shareable trip link (read-only URL) | Feature | Low |
| 9 | Export checklist to PDF / print view | Feature | Low |
| 10 | Integration test suite (frontend + backend round-trip) | Quality | Medium |
| 11 | Accessibility audit and fixes (WCAG 2.1 AA) | Quality | Low |

---

## Sprint Breakdown

### Sprint 1 — Weeks 9-10: Foundation & Features

**Goal:** Replace the riskiest piece of infrastructure and ship the two most-requested features.

| Story | Owner | Points |
|-------|-------|--------|
| #1 Database migration | TBD | 5 |
| #2 User authentication | TBD | 5 |
| #3 Trip deletion | TBD | 3 |
| #6 Toast notifications | TBD | 2 |

**Quality sprint item:** Expand test coverage for the new database storage layer (unit + integration).

**Why database first?** Midterm showed that JSON-file persistence is the single biggest
bottleneck. Every future feature (deletion, locking, multi-user, auth) depends on a real
storage layer. Scheduling it first de-risks the rest of the plan.

### Sprint 2 — Week 11: Enhancements

**Goal:** Add user-facing features and harden data integrity.

| Story | Owner | Points |
|-------|-------|--------|
| #4 Custom checklist items | TBD | 5 |
| #5 Optimistic locking | TBD | 3 |
| #7 Edit trip metadata | TBD | 3 |

**Quality sprint item:** Integration test suite — full round-trip tests covering
create -> generate -> pack -> update -> delete flow.

### Sprint 3 — Week 12: Hardening & Release

**Goal:** Stabilise, document, and prepare for final demo.

| Story | Owner | Points |
|-------|-------|--------|
| #8 Shareable trip link | TBD | 3 |
| #9 Export to PDF / print | TBD | 3 |
| #11 Accessibility audit | TBD | 2 |

**Quality sprint item:** Accessibility audit (WCAG 2.1 AA) — run axe-core, fix
critical/serious violations, document results.

---

## Riskiest Technical Item

**#1 — Database Migration**

- Touches every read/write path in the application.
- Requires replacing `storageFile.js` with a new database-backed module behind the
  same interface so the Express routes stay unchanged.
- Risk of data-loss bugs during migration; mitigated by keeping the old JSON driver
  as a fallback behind an env flag during Sprint 1.
- Scheduled for **Sprint 1** so issues surface early while there is still time to
  course-correct.

---

## Lessons Applied from Midterm

| Midterm Lesson | How It Shapes This Plan |
|----------------|------------------------|
| JSON file persistence is fragile under concurrent writes | Database migration is #1 priority |
| Scope lock kept MVP focused and on-time | Each sprint has a fixed scope; stretch items move to next sprint |
| CI + 23 tests caught regressions early | Every sprint includes a dedicated quality item to keep coverage growing |
| Demo-readiness docs prevented last-minute scramble | Week 12 hardening sprint includes demo prep and release notes |
| Atomic writes mitigated but didn't solve concurrency | Optimistic locking scheduled after database is in place |

---

## Definition of Done (Beta)

Same as MVP DoD, plus:

- New features include at least one happy-path and one error-path test.
- Swagger spec (`openapi.yaml`) is updated for any new/changed endpoints.
- No critical or serious accessibility violations on affected pages.
