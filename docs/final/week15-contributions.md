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
Project Manager / Scrum Master, Documentation Lead, QA / DevOps Support, Frontend Development.

**Major Contributions since Beta:**

- **Frontend correctness, state management, and UX reliability:**  
  Resolved key UI and state inconsistencies across core workflows. Fixed the flaky edit-mode behavior (#126) by centralizing UI state ownership and eliminating race conditions and inconsistent state updates, improving reliability of checklist generation, save/reset flows, and edit/update transitions.
- **System integration, validation, and code health ownership:**  
  Validated end-to-end system behavior across frontend, backend, and persistence layers, ensuring consistent runtime behavior between frontend UI state and backend authentication (`/auth/user`). Identified and resolved mismatches affecting core workflows (authentication, checklist generation, save/load/edit), and ensured implemented behavior, UI state, and documentation remained aligned before final evaluation.
- **E2E testing and CI reliability (Playwright):**  
  Diagnosed instability caused by reliance on real Google OAuth in CI. Implemented the shift to test-mode authentication (`NODE_ENV=test` + `x-test-user-id`), enabling stable, repeatable E2E tests that validate real application state via `/auth/user` rather than brittle external OAuth flows. Aligned Playwright configuration and CI setup to enable stable, repeatable execution across environments.
- **Documentation ownership and release alignment:**  
  Led creation and alignment of major documentation (README, user/admin guides, release notes, repo polish). Ensured documentation reflects the deployed system and matches deliverable requirements, improving clarity for reviewers and future maintainers.

**Relevant PRs / Commits / Docs / Reviews:**

**PRs:**
- Week 15:
  - PR #147 – Presentation plan and speaking roles
- Week 14:
  - PR #143 – Documentation alignment and repository polish
  - PR #138 – User Guide and Admin / Maintenance Guide
- Week 13:
  - PR #132 – Hand-off document draft
  - PR #131 – Refactoring and code health documentation
  - PR #130 – Fix for flaky edit-mode UI behavior (#126)
- Week 12:
  - PR #107 – Core system stabilization: authentication/test-mode alignment (including `/auth/user`), Playwright reliability, and CI/deployment verification fixes
  - PR #108 – Smoke test correction
  - PR #114 – Checklist loading UX simplification
  - PR #116 – Checklist update visual feedback improvements
  - PR #117 – Auth failure redirect and user messaging
  - PR #127 – Known issues updates
  - PR #128 – README updates and Beta-state documentation alignment

**PR Reviews:**
- Week 14:
  - PR #142 – Release candidate notes 
  - PR #141 – Final bug triage
  - PR #140 – Deployment runbook  
  - PR #139 – API documentation
- Week 13:
  - PR #137 – Architecture snapshot update
  - PR #136 – Sprint goals documentation
  - PR #135 – UI behavior (toast message handling)  
  - PR #134 – E2E test additions and updates  
  - PR #133 – Observability and support visibility improvements (#101)
- Week 12:
  - PR #125 – Known issues file  
  - PR #124 – Required-field validation improvements (#63)
  - PR #123 – Trip form reset behavior (#61)
  - PR #120 – Vitest configuration updates (#60)
  - PR #119 – Save button state issue on loading saved trip  
  - PR #112 – Retrospective and sprint planning  
  - PR #111 – Deployment and reproduction path documentation
  - PR #110 – Added new E2E tests  

**Docs (Authored / Updated):**
- `README.md`  
- `docs/user-guide.md`  
- `docs/admin-guide.md`  
- `docs/final/week13-refactoring.md`  
- `docs/handoff/hand-off-draft.md`  
- `docs/final/week14-repo-polish.md`  
- `docs/final/week15-presentation-plan.md`  
- `docs/releases/beta-release.md`
- `data/aws-hosting-plan.md`  
- `data/aws-hosting-implementation.md`  
- `docs/adr/ADR-003.md`  

---

**Final Presentation Focus:**

- **Demo (Core Workflows):**
  - Lead live demo of authentication, checklist generation, persistence, and edit workflows

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