# Week 12 Beta Deployment and Reproducible Run Path

## Purpose

This document defines the reproducible reviewer path for the Week 12 Beta.

For this project, item **B** is centered on the hosted environment first. Local developer setup/run steps remain in `README.md` and related development docs.

## Run Path Type

- Primary path: Live hosted deployment
- URL: `https://spcg.zentrofi.com`
- Requirement: Reviewer should be able to validate core workflow without local setup

Reviewer first click: `Login with Google` on the hosted landing page.

## What "First Run" Means for Hosted Beta

For Week 12 Item B, the reproducible run path is the hosted Beta environment (`https://spcg.zentrofi.com`).

"First run" means the first-time reviewer validation flow on the deployed system to verify:

- HTTPS and basic availability
- Authentication flow
- Core trip workflow behavior
- Persistence behavior after reload

Local developer startup steps are documented in `README.md` and are outside the scope of this hosted-review checklist.

## Prerequisites for Reviewer

- Modern browser with JavaScript enabled
- Google account for OAuth login

## Hosted Validation Checklist (Reviewer)

1. Open `https://spcg.zentrofi.com`.
2. Confirm HTTPS lock icon and no certificate warning.
3. Optionally open `https://spcg.zentrofi.com/health` and confirm status response is returned.
4. On the app page, click `Login with Google` first.
5. Complete Google OAuth and return to the app.
6. Enter a trip name, destination type, and duration.
7. Click `Generate Checklist`.
8. Click `Save Trip`.
9. Confirm success feedback appears (toast and saved-state label) and the trip appears in `Saved Trips`.
10. Reload the page.
11. Click `Load` on the saved trip and confirm data/checklist round-trips correctly.
12. (Optional sanity) Delete the trip and confirm it is removed.
13. Confirm delete feedback appears (success toast).

Pass criteria: Steps complete without major errors, success feedback (toasts/saved-state label) appears for key actions, and saved data persists across page reload.

## Quick Smoke Test (2-3 Minutes)

Use this when time is limited during review:

1. Open `https://spcg.zentrofi.com` and verify HTTPS lock.
2. Click `Login with Google` and confirm return to app.
3. Create one trip, click `Generate Checklist`, then click `Save Trip` once (initial save).
4. Toggle one checklist item packed/unpacked and confirm the trip remains in a saved state (`Saved! (ID: ...)` label).
5. Reload page and `Load` the saved trip.
6. Delete the trip from `Saved Trips`, confirm it is removed, and confirm success toast feedback appears.

Smoke pass criteria: login succeeds, initial trip save succeeds with visible feedback, checklist toggle works without requiring an additional save click, the trip loads correctly after refresh, and delete removes the trip with visible success feedback.

## Required Elastic Beanstalk Environment Variables (Runtime)

Set in EB environment properties (plus defaults in `.ebextensions` where applicable):

- `NODE_ENV` (required): `production`
- `PORT` (required): `8080`
- `FRONTEND_URL` (required): `https://spcg.zentrofi.com`
- `SQLITE_PATH` (required): `/data/trips.db`
- `EBS_VOLUME_ID` (required for mount hook): `vol-...`
- `GOOGLE_CLIENT_ID` (required secret): from Google Cloud OAuth credentials
- `GOOGLE_CLIENT_SECRET` (required secret): from Google Cloud OAuth credentials
- `SESSION_SECRET` (required secret): strong random value

Notes:

- `SQLITE_PATH` is required in production startup checks.
- If `SQLITE_PATH` points under `/data`, the app expects `/data` to be mounted.
- Secrets are intentionally not committed to repository files.
- `EB_ENVIRONMENT_NAME` is not an app runtime variable; it is a GitHub Actions deploy secret.

## Required GitHub Repository Secrets (CD Workflow)

Used by `.github/workflows/deploy-eb.yaml`:

- `AWS_ROLE_TO_ASSUME`
- `AWS_REGION`
- `EB_DEPLOY_BUCKET`
- `EB_APPLICATION_NAME`
- `EB_ENVIRONMENT_NAME`
- `PROD_BASE_URL` (used by post-deploy `/health` smoke check)

Currently present but not required by deploy workflow:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`
- `TEST_EMAIL`
- `TEST_PASSWORD`

Note: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `SESSION_SECRET` are required in Elastic Beanstalk environment properties at runtime, even though the CD workflow does not read them directly from GitHub secrets.

## Database and Setup Steps (Hosted Environment)

1. Ensure persistent EBS volume exists in same AZ as the EB instance.
2. Ensure EB env property `EBS_VOLUME_ID` is set correctly.
3. Deploy application version to EB.
4. Predeploy hook attaches/mounts EBS volume at `/data`.
5. Run migrations in deployed environment (`npm run db:migrate`) if not already executed by deployment process.
6. Confirm app can write to `SQLITE_PATH=/data/trips.db`.

## Failure Signals and First Checks

- Symptom: browser shows TLS/certificate warning.
- First check: confirm DNS points to the active EB load balancer and certificate covers `spcg.zentrofi.com`.

- Symptom: login fails or redirects incorrectly.
- First check: confirm OAuth authorized origin and callback include `https://spcg.zentrofi.com` and `/auth/google/callback`.

- Symptom: app loads but save/load fails.
- First check: confirm `/data` is mounted, `EBS_VOLUME_ID` is set, and migrations were applied.

## Seed Data and Test Accounts

- Seed data is not required for baseline reviewer workflow.
- Reviewer uses real Google OAuth login.
- No shared test account is required for this path.

## Team Evidence (Week 12)

Record at least one team-verified run of this exact checklist with:

- Date/time of verification
- Verifier name(s)
- URL validated (`https://spcg.zentrofi.com`)
- CI run link associated with deployed version
- Outcome: pass/fail + brief notes

Minimum evidence to attach in Week 12:

- One recent passing CI run link for the deployed commit
- One completed reviewer checklist run (or smoke test) with pass/fail result
- Deployed version identifier used during verification

Suggested evidence table:

| Date | Verifier | Deployed Version | CI Run Link | Result | Notes |
|---|---|---|---|---|---|
| YYYY-MM-DD | Name | version-label | link | Pass/Fail | short note |

## Scope Boundary for Week 12 Item B

- Item B focuses on reproducible **Beta run path** for external review.
- Detailed local development setup remains in `README.md` and supporting engineering docs.
