# A) Final Sprint Goal + Closing Backlog

## Sprint Goal

Enter the final demo as a release-ready team — critical security and validation debt closed, the demo path rehearsed end-to-end, and hand-off and presentation materials finalized for Week 16.

---

## Committed Backlog (8 Items)

This is closure work. No new feature scope. Items 1–4 close the disposition plan from the Week 14 triage. Items 5–8 cover final-readiness deliverables (QA, presentation, hand-off, accountability).

| # | Item | Owner | Priority |
|---|------|-------|----------|
| 1 | Close XSS audit and trip-field length limits (#82, #81) | Jason | 1 |
| 2 | Deduplicate trip validation and backfill type guards (#129 + POST/PUT `.trim()` guards) | Jason | 2 |
| 3 | Gate `migrateLatest()` out of production startup | Naren | 2 |
| 4 | Verify and close reliability hardening (#101) | Heather | 2 |
| 5 | Final QA checklist and demo-path rehearsal (Deliverable B) | Naren | 1 |
| 6 | Presentation plan and speaking roles (Deliverable C) | Heather | 1 |
| 7 | Finalize hand-off package (Deliverable D) | Jason | 2 |
| 8 | Individual contribution snapshot and peer evaluation (Deliverables E + F) | All | 2 |

---

## Acceptance Criteria by Item

### 1. Close XSS Audit and Trip-Field Length Limits
**Owner:** Jason
**GitHub Issues:** [#82](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/82), [#81](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/81)

- All DOM writes in `src/main.js` and `src/checklistRenderer.js` use `textContent` (no `innerHTML` for user-supplied strings); inline code comment documents the requirement at the safe-write site
- `maxlength` attributes on `#trip-name` (≤100) and `#destination-type` (≤50), matched by server validation that returns 400 with a clear error message on over-length input
- Test coverage added for over-length and script-payload inputs

---

### 2. Deduplicate Trip Validation and Backfill Type Guards
**Owner:** Jason
**GitHub Issue:** [#129](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/129) + deferred Copilot review items from PR #67

- Shared validator extracted (e.g., `server/validators/trip.js`) and used by both `POST /api/saveTrip` and `PUT /api/trips/:tripId`
- `typeof` guards added before `.trim()` in both routes; non-string `name` / `destinationType` returns 400, not 500
- Unit tests cover the shared validator including non-string and missing-field branches

---

### 3. Gate `migrateLatest()` Out of Production Startup
**Owner:** Naren
**Source:** Deferred Copilot review item from PR #68

- `migrateLatest()` no longer runs on boot in production (gated to `NODE_ENV === 'development'` or moved to a deploy-time step)
- Local `npm run dev` behavior unchanged; developers still get migrations applied on startup
- Behavior documented in `docs/admin-guide.md` under deployment steps

---

### 4. Verify and Close Reliability Hardening (#101)
**Owner:** Heather
**GitHub Issue:** [#101](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/issues/101)

- Remaining scope on #101 reviewed against what shipped in PR #133 (observability) and marked as done or explicitly descoped
- Closing comment posted on #101 summarizing disposition
- Issue closed

---

### 5. Final QA Checklist and Demo-Path Rehearsal
**Owner:** Naren
**Document:** `docs/final/week15-qa.md` *(in flight: PR #146)*

- Final QA checklist with ≥10 checks (startup, auth, core workflow, error handling, UI sanity) executed against the deployed release candidate
- Exact demo path documented, rehearsed end-to-end, and any breakage or confusion captured with a disposition (fixed / risk-accepted)
- PRs linked for any high-priority fixes that fell out of rehearsal

---

### 6. Presentation Plan and Speaking Roles
**Owner:** Heather
**Document:** `docs/final/week15-presentation-plan.md` *(in flight: PR #147)*

- 12–15 minute presentation structured section-by-section with each section's speaker named
- Demo driver identified and a backup plan documented for partial live-demo failure
- Draft slide deck / outline attached or linked; every team member has a defined speaking contribution

---

### 7. Finalize Hand-Off Package
**Owner:** Jason
**Documents:** [docs/handoff/hand-off.md](../handoff/hand-off.md), `docs/final/week15-handoff-status.md` *(in flight: PR #149)*

- Hand-off draft updated to near-final form covering system overview, architecture snapshot, stack rationale, deploy/setup summary, known issues and constraints, recommended next steps, and references to user/admin guides
- `week15-handoff-status.md` lists any remaining minor cleanup for Week 16 submission
- Accepted known constraints from Week 14 triage (in-memory sessions, single-instance deploy, `mkdir` import-time edge case) surfaced in the hand-off's known-issues section

---

### 8. Individual Contribution Snapshot and Peer Evaluation
**Owner:** All team members
**Documents:** `docs/final/week15-contributions.md` *(in flight: PR #145)*, `docs/final/week15-peer-eval-confirmation.md` *(in flight: PR #144)*

- Each member completes their own section of `week15-contributions.md` with role, contributions since Beta, concrete PR / commit / doc / review evidence, and final-presentation speaking focus
- Each member completes the instructor's peer-evaluation survey and marks their row in `week15-peer-eval-confirmation.md` with completion date
- Both documents merged to `main` before the final presentation

---

## Evidence & Links

- **Project Board Sprint View:** https://github.com/orgs/Georgia-Southwestern-State-Univeristy/projects/26
- **Source triage for items 1–4:** [docs/final/week14-triage.md](week14-triage.md)
- **Week 15 PRs (in flight):**
  - [#144 — Peer eval confirmation draft](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/144)
  - [#145 — Individual contribution snapshot](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/145)
  - [#146 — Demo path / QA checklist](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/146)
  - [#147 — Presentation plan](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/147)

---

## Notes

- Items 1 and 5 are the highest risk to the final demo. If either slips past mid-week, raise it to the team immediately so presentation content can be adjusted.
- Items 2, 3, and 4 are committed for Week 15 closure; flag any blockers early so the team can rebalance, not de-commit.
- Deliverables E and F (item 8) are individual accountability — each member's completion is independent and unblocked by the other work.
