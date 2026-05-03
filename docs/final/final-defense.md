# Final Technical Defense Snapshot

**Project:** Smart Packing Checklist Generator
**Team:** Group 4 — Heather Hawn · Jason Parrish · Nareenchowdary Rayapati
**Purpose:** Concise, evidence-anchored answers to the five technical-defense questions for the final release. Each answer points to the underlying source-of-truth artifact (ADR, hand-off, triage, or test) so a reviewer can verify the claim.

---

## 1. Why did the team choose this architecture and stack?

The design priorities were **operational simplicity for a small team** and **a clean migration path for the parts most likely to need to change**. Each layer was chosen with that frame:

- **Frontend — Vite + Vanilla JavaScript.** No framework runtime; fast iteration; the SPA is small enough that hand-rolled state management is cheaper than carrying a framework's abstraction tax. Hand-rolled state is covered by Playwright E2E tests.
- **Backend — Node.js + Express.** Minimal HTTP framework that fits the team's JavaScript skill set without ORM or framework opinions.
- **Database — SQLite via Knex.js.** Zero external service to manage in development or production. Knex keeps the application database-agnostic, so a future migration to PostgreSQL is a config change plus a migration test pass — not a rewrite. See [ADR-002](../adr/ADR-002.md).
- **Authentication — Google OAuth via Passport.** Delegates password storage and account-recovery responsibility to Google; no custom credential management surface. Per-user data isolation enforced via `user_id` foreign keys. See [ADR-001](../adr/ADR-001.md).
- **Deployment — AWS Elastic Beanstalk (single-instance) + EBS-backed SQLite.** Fastest path from local development to a hosted environment with persistence; deferred RDS/PostgreSQL until scale or availability requirements demand it. See [ADR-003](../adr/ADR-003.md).

Each layer can change independently as needs evolve, and the ADRs document the conditions under which we'd revisit each decision.

---

## 2. What were the most important technical trade-offs?

Three trade-offs carry the most weight, all framed as accepted constraints in the [hand-off document](../handoff/hand-off.md):

1. **SQLite over PostgreSQL.** Gained: dead-simple operations, no external service. Cost: no horizontal scaling — a SQLite database has a single writer. Mitigation: Knex makes the migration to PostgreSQL primarily a config change, and the migration path is documented in [ADR-002](../adr/ADR-002.md).
2. **Single-instance Elastic Beanstalk.** Gained: matches the SQLite single-writer model with one EBS volume; lowest operational complexity. Cost: brief downtime during deploys, no failover, AZ-bound. Mitigation: deployment hooks make the EBS attach/mount automatic; rollback is "revert the merge to `main`."
3. **In-memory session store.** Gained: no Redis or DB-backed session infrastructure. Cost: every server restart logs out all users. Mitigation: documented as an accepted constraint; the natural follow-on if multi-instance deployment is adopted is `connect-sqlite3` or Redis.

A fourth, smaller trade-off worth naming: **vanilla JS over a frontend framework.** Gained: lightweight, fast iteration. Cost: hand-rolled state management. Mitigation: Playwright E2E tests cover the workflows that a framework's abstractions would otherwise structure.

---

## 3. What is the system's biggest current weakness?

**Frontend state management complexity in checklist auto-save and change detection.**

Checklist behavior on a saved trip combines three responsibilities in one tightly-coupled flow: rendering, debounced auto-save, and change detection via serialized state comparison. Adding a feature to the checklist (or even renaming a field) currently requires reasoning about all three layers at once, and the change-detection mechanism — comparing serialized snapshots — is the kind of code that quietly accumulates edge-case bugs as the data shape evolves.

This is the weakness most likely to bite a future maintainer: it's hard to extend safely, hard to test in isolation, and the failure modes (stale auto-save, false-positive "dirty" state) are easy to introduce and easy to miss. Backend test depth outside the validator (storage layer, route error paths) is also lighter than E2E coverage, but it's a smaller cleanup with a clearer fix.

The fix path: separate change detection, persistence, and rendering into distinct units that can each be tested in isolation; replace serialized comparison with explicit state tracking. Tracked as item 1 in [Recommended Next Steps for a Future Team](../handoff/hand-off.md#recommended-next-steps-for-a-future-team) and Technical Debt §1 in the [hand-off document](../handoff/hand-off.md#technical-debt).

---

## 4. What testing and CI evidence gives confidence in the release?

Confidence comes from four layered sources:

- **Unit and integration tests (Vitest).** Over 80 tests across `tests/server.test.js`, `tests/tripValidators.test.js`, `tests/checklistRenderer.test.js`, `tests/savedTripsRenderer.test.js`, `tests/checklistGenerator.test.js`, and `app.test.js`. Coverage includes auth enforcement, observability behavior (request-ID sanitization, sanitized log paths), input validation (length limits, blank checks, type guards, checklist payload shape), user-scoped CRUD, and DOM-rendering XSS regression cases.
- **End-to-end tests (Playwright).** Coverage in [`tests/e2e/`](../../tests/e2e/) for the primary workflow (create → save → load → delete), checklist generation, edit-mode state management, change detection, and auth-failure access control. E2E tests use test-mode authentication (`x-test-user-id` header) so OAuth doesn't flake CI.
- **CI pipeline.** [`.github/workflows/ci.yaml`](../../.github/workflows/ci.yaml) runs on every PR; lint, unit tests, and E2E execute when code files change (a paths-filter on `src/`, `server/`, `*.js`, etc.) and are intentionally skipped on documentation-only PRs to avoid burning CI minutes on no-op changes. [`.github/workflows/deploy-eb.yaml`](../../.github/workflows/deploy-eb.yaml) deploys merges to `main` (markdown-only changes are ignored via `paths-ignore`) with predeploy hooks for EBS mount and Knex migrations, plus a post-deploy `/health` smoke test.
- **Operational verification.** The `/health` endpoint reports uptime, version, database writability, and config validity. The Week 14 [release-candidate runbook](week14-runbook.md) documents the deployment-verification path. Structured JSON logging with request-ID correlation gives us end-to-end traceability for any user-reported failure.

Concrete release-readiness markers: regression tests cover four previously-fixed bugs (#98, #121, #122, #126) so they cannot silently regress; the XSS audit ([#82](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/82)) and input-length limits ([#81](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/81)) closed in Week 15 with new test coverage; the deployment pipeline has run successfully through every release-candidate cycle.

---

## 5. If another team inherited this project, what should they tackle first?

In order:

1. **Simplify the frontend state model — checklist auto-save + change detection.** Highest-leverage cleanup, and the same item flagged as the system's biggest weakness in §3. Separate change detection, persistence, and rendering into distinct units; replace serialized snapshot comparison with explicit state tracking. Each unit becomes independently testable. Roughly a sprint of careful work; pays back on every checklist feature change.
2. **Modularize `server.js`.** Routing, middleware, configuration, and observability are still inline in one large file. (Trip-payload validation is already extracted to `server/tripValidators.js` — that's the model to follow.) Break the rest into `server/routes/`, `server/middleware/`, and `server/config/` incrementally — one concern per PR — to avoid regressions.
3. **Expand backend test depth outside the validator.** The trip validator is well-covered. Remaining gaps: storage layer (`server/storage.js`), route error paths, and non-validator business logic. This pairs with item 2 — every module extracted should land with focused unit tests.
4. **Lift the accepted constraints when scale demands it.** When a new requirement makes single-instance deployment or in-memory sessions unacceptable, the migration paths are already documented: PostgreSQL via Knex (config change), persistent session store (`connect-sqlite3` or Redis), and multi-instance EB with sticky sessions or a shared session store. See item 4 in [Recommended Next Steps for a Future Team](../handoff/hand-off.md#recommended-next-steps-for-a-future-team) and [ADR-003](../adr/ADR-003.md).

Items 1–3 are pure code health and are independent of any new feature work. Item 4 is conditional — only if scale or availability requirements change. A team with a single sprint of capacity should pick item 1 first.
