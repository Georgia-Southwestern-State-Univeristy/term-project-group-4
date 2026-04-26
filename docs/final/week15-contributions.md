# Week 15: Individual Contribution Snapshot
## Smart Packing Checklist Generator

---

## Overview

This document captures each team member’s individual contributions to the project.

Each section is completed by the respective team member and includes:
- role on the team
- concrete contributions
- supporting evidence (PRs, commits, docs, reviews)
- ownership during the final presentation

This document is intended to provide clear, evidence-based accountability for individual work.

---

## Heather Hawn

**Role on Team:**  
(e.g., PM, frontend, documentation, QA, etc.)

**Major Contributions since Beta:**  
- 
- 
- 

**Relevant PRs / Commits / Docs / Reviews:**  
- PR #___ –  
- PR #___ –  
- Docs:  
- Reviews:  

**Final Presentation Focus:**  
- 
- 
- 

---

## Jason Parrish

**Role on Team:**  
Lead developer / architect. Backend, observability, and architecture/documentation focus. Cross-cutting reviewer on Heather's and Naren's deliverables across Weeks 12–14.

**Major Contributions since Beta:**
- Architected and shipped the Week 13 observability and reliability work — request correlation, structured logging, `/health` diagnostics, centralized 404/error handling, and startup config validation — closing the bulk of issue #101.
- Updated the architecture snapshot to reflect the actual deployed system (component diagram, responsibility table, risks), replacing the outdated MVP-era snapshot.
- Led API documentation for Week 14: OpenAPI 3.0.3 specification and reference README, with Swagger UI served at `/docs`.
- Drove the Week 14 final bug triage and the Week 15 closing-sprint backlog, mapping remaining issues to "close this week / accept as constraint / defer to Week 16."
- Polished `docs/handoff/hand-off-draft.md` to near-final form for Week 15 (architecture snapshot, stack rationale, accepted constraints vs. tech debt split, supporting-doc cross-references).
- Closed Week 12 stability bugs (#60, #61, #63) and authored Week 12 deployment-path and retrospective deliverables.

**Relevant PRs / Commits / Docs / Reviews:**

PRs:
- Week 15 (in-flight drafts):
  - PR #148 – Week 15 Deliverable A: final sprint goal and closing backlog
  - PR #149 – Week 15 Deliverable D: hand-off status punch list
  - PR #152 – Week 15 Deliverable D: hand-off document polish to near-final
- Week 14 (merged):
  - PR #141 – Week 14 Deliverable E: final bug triage
  - PR #139 – Week 14 Deliverable D: API documentation (OpenAPI spec)
- Week 13 (merged):
  - PR #137 – Week 13 Deliverable E: architecture snapshot update
  - PR #133 – Week 13: observability and support visibility improvements (#101)
- Week 12 (merged):
  - PR #124 – Add required-field guidance before checklist generation (#63)
  - PR #123 – Fix trip form reset after save (#61)
  - PR #120 – lint: add Vitest globals for test files (#60)
  - PR #112 – Week 12: Draft deliverable F retrospective + sprint plan
  - PR #111 – Week 12: Draft deliverable B deployment/repro path

Docs authored or substantially updated:
- `docs/architecture/architecture-snapshot.md` (Week 13 update)
- `docs/final/week13-architecture.md`
- `docs/final/week13-observability.md`
- `docs/api/README.md`, `docs/api/openapi.yaml`
- `docs/final/week14-triage.md`
- `docs/final/week15-sprint.md`
- `docs/final/week15-handoff-status.md`
- `docs/handoff/hand-off-draft.md` (polish)

Reviews:
- Week 14:
  - PR #138 – user/admin guides
  - PR #140 – deployment runbook
  - PR #142 – release-candidate notes
  - PR #143 – repo polish
- Week 13:
  - PR #130 – #126 fix (flaky edit-mode UI)
  - PR #131 – refactoring
  - PR #132 – hand-off doc
- Week 12:
  - PR #118 – beta release
  - PR #125 – known issues file
  - PR #127 – known issues updated
  - PR #128 – README update

**Final Presentation Focus:**
- §1 Introduction & Project Overview — the product's purpose and value
- §2 System Architecture Overview — stack, request flow, and the three architectural decisions: SQLite over Postgres, single-instance Elastic Beanstalk, vanilla JS over a framework
- §5 Future Improvements & Known Constraints — accepted constraints vs. technical debt, and the hand-off framing for a future team

---

## Nareenchowdary Rayapati

**Role on Team:**  
DevOps / QA Lead, Backup Developer.

**Major Contributions since Beta (Weeks 13–15):**  

- **E2E Regression Test Suite:**  
Added three new regression tests and imporved one existing test. (Issues #98, #121, #122, #126)
- **Deployment & Release Runbook:** 
Verified all the deployment steps on a brand new account and documented gaps (`docs/final/week14-runbook.md`).
- **Improved UI Experience**
Addressed mutiple toast messages stacking on the UI issue.
- **Docs:**
Documented Sprint goals release notes.

**Relevant PRs / Commits / Docs / Reviews:**  

- **E2E Regression Test Suite:** 
PR #134 - https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/134
- **Deployment & Release Runbook:**
PR #140 - https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/140
- **Improved UI Experience**
PR #135 - https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/135
- **Docs:**
PR #136 - https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/136
PR #142 - https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/pull/142

**Final Presentation Focus:**  
- Quality, Reliability and Observability
- Future Improvements & Known Constraints (Either Jason or I)
- CLosing
