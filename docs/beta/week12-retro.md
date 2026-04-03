# Week 12 Beta Retrospective + Final Sprint Plan

## Deliverable Scope

This document fulfills Week 12 item F:

- What went well reaching Beta
- What slowed the team down
- Top 3 lessons learned
- Top 5 priorities for Weeks 13-15
- Link to updated board/milestone plan

## What Went Well

1. End-to-end workflow reached Beta usability.
- The core path (auth -> create trip -> generate checklist -> save/load/delete) is now reproducible and testable.

2. CI and test coverage matured to support release confidence.
- Unit/API tests and Playwright E2E tests are both part of routine validation.

3. Deployment path became concrete and reviewable.
- Hosted environment, runtime configuration, and reviewer-first checklist are now documented.

## What Slowed the Team Down

1. Environment/config drift across branches and deployment contexts.
- Some confusion occurred between EB runtime env vars and GitHub Actions deploy secrets.

2. Branch synchronization and merge visibility gaps.
- Work existed on feature branches but was not always visible on local stale branches, causing re-check/reconciliation time.

3. Late-stage documentation alignment.
- Deliverable docs required multiple passes to align with rubric wording, evidence expectations, and reviewer clarity.

## Top 3 Lessons Learned

1. Treat pipeline enforcement as a release requirement, not a nice-to-have.
- Quality gates are only valuable when they are consistently required before merge/deploy.

2. Separate runtime configuration from deploy-time secrets in docs and operations.
- Explicit separation reduced ambiguity and improved deployment reproducibility.

3. Write reviewer-first documentation, not team-memory documentation.
- Step-by-step hosted validation and evidence tables reduce reviewer guesswork and improve credibility.

## Top 5 Priorities for Weeks 13-15

1. Finalize and enforce release-quality CI policy.
- Ensure required checks are consistently enforced for final-release branches.

2. Close remaining test reliability gaps.
- Replace brittle waits in E2E tests and strengthen persistence checks for destructive actions.

3. Complete Week 12 evidence fields with live data.
- Add CI run links, team verification records, and deployed commit mapping.

4. Harden deployment and operational runbook.
- Validate rollback steps, env-var completeness, and post-deploy health checks.

5. Final docs/repo polish for external review.
- Align README, release notes, known issues triage, and final sprint artifacts with current system reality.

## Updated Board / Milestone Link

- Project board view: https://github.com/orgs/Georgia-Southwestern-State-Univeristy/projects/26/views/1
- Final sprint milestone plan link: ADD_LINK_HERE

## Engineering Focus for Final Phase

The team will prioritize process discipline over feature expansion:

- Keep scope controlled
- Protect behavior with tests before merge
- Keep deployment path reproducible
- Document known gaps transparently with owner and next action
