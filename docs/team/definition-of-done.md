# Definition of Done
## Smart Packing Checklist Generator

A change is considered **DONE** only when it meets **all** requirements below.

---

## 1. Branching + PR Discipline
- Work is done on a short-lived branch (no direct commits to `main`)
- Branch name follows the team pattern (`week<NUM>/<short-description>`)
- A pull request is opened early (as soon as there is a reviewable slice), not at the end
- PR includes a clear description of:
  - what changed
  - why it changed
  - how to test/verify

## 2. Review Requirements
- At least one teammate review/approval is completed before merge
- All requested changes are addressed (or explicitly discussed and resolved in the PR)
- PR stays reasonably small and reviewable. If it grows too large, it is split

## 3. CI + Quality Gates
- CI checks pass on the PR (no red X)
- Code follows team standards (formatter/linter rules, naming conventions, file structure)
- No merge if checks fail unless the team explicitly agrees and documents why

## 4. Testing Expectations
- Any new behavior includes at least one of the following:
  - starter-level automated tests
  - test plan notes in the PR describing how the change was verified locally
- If the change is not easily testable yet, the PR must include a clear verification plan and rationale

## 5. Documentation + Repo Hygiene
- Documentation is updated when behavior changes, including as applicable:
  - `README.md` (setup/run instructions)
  - `docs/` (architecture notes, ADR links, workflow notes)
- Any new scripts/commands used by the team are documented (how to run locally)

## 6. Merge
- Only after all items above are satisfied:
  - PR is merged into `main`
  - The merge preserves a clean history (follow the team’s merge strategy)