# Week 10: Beta Sprint 2 — Security & Validation Hardening

**Sprint Goal:** Safe trip management: authenticated users can create/edit trips with validated input and clear error feedback; all critical paths protected and tested.

**Theme:** Beta is features you can trust. Users and stakeholders trust systems that consistently reject bad inputs, protect sensitive actions, and communicate failures clearly.

---

## Sprint Scope: Committed Backlog

| # | Item | Owner | Priority | Acceptance Criteria |
|---|------|-------|----------|---|
| **1** | **User authentication (login/session)** | Naren | 1 (blocker) | ✅ Login endpoint implemented; session/token persisted; protected routes enforce authentication; tests verify authorized vs unauthorized |
| **2** | **Add input length limits** | Heather | 2 | ✅ Name ≤ 100 chars, destination ≤ 50 chars; server rejects >limit with 400; UI prevents input overfill |
| **3** | **Display API errors in UI** | Jason | 2 | ✅ **Partially implemented:** toast notifications already active for save/update/load. Finish by adding delete-failure toast and surfacing server validation messages (not only generic network/status errors). |
| **4** | **Audit XSS vulnerability** | Heather | 2 | ✅ Confirm all name/destinationType rendering uses `.textContent` only (no `.innerHTML`); add code comment to prevent future changes |
| **5** | **Regression tests: validation** | Jason | 1 (blocker) | ✅ 4 new tests: POST/PUT whitespace-only inputs → 400; existing trip creation still passes; length limits enforced |
| **6** | **UX polish: loading indicator** | Jason | 3 | ✅ Show spinner/progress text while checklist generates; give user visual feedback (not just disabled button) |
| **7** | **Improve error message leakage** | Heather | 3 | ✅ Server doesn't expose internal stack traces to client; logs full error internally but returns generic "error" to API |

**Total:** 7 items. **Owners:** Replace remaining `TBD (Owner X)` entries with assigned teammate names. Naren owns #1 (auth). Jason owns #3, #5, #6 (deliverable D).

**Status note:** Item #3 is in progress and close to done. Existing toast system is live in UI; remaining work is to wire delete-path error toast and display backend validation text for failed API calls.

---

## Sequencing Gate

✅ **Current status:** Database migration is complete and the app is already writing to the database in local dev.

- Naren can proceed with auth implementation now.
- Next dependency is deployment hardening (managed DB/hosted environment) after auth and validation land.

---

## Evidence & Acceptance

✅ **Sprint Board:** [Link to GitHub Project Board Week 10 milestone / view](https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4/projects)

✅ **PR Links:** All items above tracked as issues + PRs with `week10` label

✅ **Test Run:** CI link showing all tests passing (including 4 new regression tests)

✅ **Docs:** 
- [week10-security-notes.md](../security/week10-security-notes.md) — 3 risks identified, 2+ mitigated, validation evidence
- [week10-ux.md](./week10-ux.md) — before/after UX improvements

---

## Burndown & Risk

| Risk | Mitigation |
|------|-----------|
| Auth + validation is too much scope | Length limits (item #2) are lower priority; auth can slip if needed |
| Hosted database not ready for deployment | Keep local DB for dev/test; schedule managed DB migration in Week 11 deployment task |
| Tests missing for auth logic | Define test criteria now: authorized user sees trip; unauthorized gets 401; session persists |

---

## Next: Security & Validation Details

See [week10-security-notes.md](../security/week10-security-notes.md) for the 3 concrete risks, mitigations, and validation entry points.
