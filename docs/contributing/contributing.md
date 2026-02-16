# Contributing Guide
## Smart Packing Checklist Generator

This repo follows trunk-based habits: short-lived branches, PR-only merges, and CI-gated changes.

---

## Branch Naming

Create a new branch for every change. Keep branches short-lived (hours/days, not weeks).

**Pattern**
- `week<NUM>/<short-description>`

You may optionally include a change type in the description for clarity:

- `week<NUM>/feature-<short-description>`
- `week<NUM>/fix-<short-description>`
- `week<NUM>/docs-<short-description>`
- `week<NUM>/chore-<short-description>`

**Examples**
- `week5/ci-workflow`
- `week5/feature-thin-slice`
- `week5/docs-definition-of-done`
- `week5/fix-eslint-config`

**Rules**
- Do not commit directly to `main`
- Sync with `main` before opening or merging a PR to minimize conflicts
- Keep branches focused on a single deliverable or logical change

## Pull Request (PR) Expectations

Open PRs early. Don’t wait until everything is “perfect.”

A PR should include:
- What changed (summary)
- Why it changed (goal/problem)
- How to verify (steps to run or expected output)
- Links to relevant issues/notes (if applicable)

**PR checklist**
- Branch is short-lived and purpose-specific  
- PR has a clear description and verification steps  
- CI checks pass  
- Code follows team standards (format/lint)  
- Tests added OR test plan notes included  
- Docs updated if behavior/setup changed  

**Keep PRs reviewable**
- Prefer small PRs that do one thing well
- If a change grows too large, split into multiple PRs

## Review Expectations

**Minimum requirement:** at least one teammate approval before merge.

**Author responsibilities**
- Request review from at least one teammate
- Respond to feedback promptly and respectfully
- Address requested changes or discuss/resolve them in the PR thread
- Do not merge your own PR without approval

**Reviewer responsibilities**
- Review for correctness, clarity, and maintainability
- Prefer asking questions and suggesting improvements over style-only nitpicks
- Use PR comments as the primary place for technical discussion

**Where decisions live**
- Implementation discussion: PR comments
- Significant design/architecture decisions: summarize in the PR and capture in an ADR when needed

## How to Run Checks Locally

Run the same checks locally that CI runs before requesting review.

### Option A: Use the repo scripts (preferred)
- `npm run eslint`
- `npm run test`

### Option B: Follow the README
If you’re unsure what commands apply, follow the current instructions in `README.md`.

### Minimum local verification before opening/merging PR
- Project runs locally
- Lint/format passes
- Tests pass

> Note: PRs must show a passing check before merge.

## Merge Policy

- All changes land via PR into `main`
- No merge if CI is failing
- Squash merge is acceptable unless the team adopts a different merge strategy