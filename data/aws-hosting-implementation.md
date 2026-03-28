# AWS Hosting Plan Implementation (Beta)

## Purpose

Execution checklist for implementing Elastic Beanstalk hosting with SQLite on an attached EBS volume.

## Assumptions

- Single EB environment for Beta.
- One EC2 instance only (no autoscaling).
- DB file path target: `/data/trips.db`.

## Phase 0: Preconditions

1. Confirm branch and rollback point.
2. Confirm AWS region and EB environment name.
3. Confirm OAuth hosted callback URL target format.
4. Confirm min/max instance count is planned as `1`.

## Phase 1: Application Changes

### 1.1 Update production Knex config

- File: `knexfile.js`
- Change production config from:
  - `client: 'pg'`
  - `connection: process.env.DATABASE_URL`
- To:
  - `client: 'better-sqlite3'`
  - `connection.filename: process.env.SQLITE_PATH || '/data/trips.db'`
  - `useNullAsDefault: true`
  - preserve migrations/seeds directories

### 1.2 Add startup safety check

- Fail startup if `NODE_ENV=production` and `SQLITE_PATH` directory is not writable.
- Log explicit error and exit non-zero to avoid silent writes to ephemeral disk.

### 1.3 Production frontend serving

- In `server.js`, serve static assets from `dist/` when in production.
- Add SPA fallback route to `index.html` for non-API routes if needed.

### 1.4 Health endpoint

- Add `GET /health` endpoint that returns:
  - app status
  - DB path in use
  - DB path write check result (boolean)

### 1.5 Session/cookie hardening

- Add `app.set('trust proxy', 1)` for LB/proxy mode.
- Ensure secure cookie flags in production.

## Phase 2: AWS Infrastructure

### 2.1 Elastic Beanstalk environment

1. Create Node.js EB environment.
2. Configure capacity min=1, max=1.
3. Set env vars:
   - `NODE_ENV=production`
   - `SQLITE_PATH=/data/trips.db`
   - `GOOGLE_CLIENT_ID=...`
   - `GOOGLE_CLIENT_SECRET=...`
   - `SESSION_SECRET=...`
   - `FRONTEND_URL=https://<host>`

### 2.2 EBS volume setup

1. Create EBS volume in the same AZ as EB instance.
2. Attach volume (example device `/dev/xvdf`).
3. Format once: `mkfs -t ext4 /dev/xvdf`.
4. Mount to `/data`.
5. Add `/etc/fstab` entry for reboot remount.
6. Set ownership/permissions so app process can read/write.

### 2.3 Automate on instance replacement

- Implement attach/mount automation in EB configuration:
  - `.ebextensions` and/or platform hooks.
- Ensure app does not start serving before mount success.

## Phase 3: Deploy and Verify

1. Deploy app build to EB.
2. Verify `/health` is healthy and reports mounted path.
3. Run migrations: `npm run db:migrate`.
4. Verify DB file and tables exist under `/data/trips.db`.
5. Validate OAuth sign-in on hosted URL.
6. Run full workflow:
   - sign in
   - create trip
   - save trip
   - reload trip
   - update checklist
   - delete trip

## Phase 4: Reliability Validation

1. Restart instance and verify data remains.
2. Force instance replacement and verify:
   - volume remount succeeds
   - app uses `/data/trips.db`
   - existing data remains available
3. Validate failure mode:
   - if mount missing, app fails fast and alerts clearly.

## Evidence To Capture

- EB environment settings screenshot (capacity + env vars).
- EBS attachment and mount evidence.
- Health endpoint output after deploy.
- Migration output log.
- End-to-end workflow run notes/screenshots.
- Forced replacement test evidence.

## Open Issues to Track

- `knexfile.js` production SQLite switch
- production static asset serving
- health endpoint and startup mount guard
- session/cookie hardening for proxy HTTPS
- EB attach/mount automation script
- forced replacement regression test

## CI/CD Automation (PR Pass -> Auto Deploy)

### Workflow model

- Keep CI on pull requests to `main`.
- Require CI checks in branch protection for `main`.
- Deploy on `push` to `main` using GitHub Actions.
- Result: when a PR passes CI and is merged, deployment runs automatically.

### Required repository secrets

- `AWS_ROLE_TO_ASSUME` (OIDC IAM role ARN for GitHub Actions)
- `AWS_REGION`
- `EB_DEPLOY_BUCKET` (S3 bucket for deployment bundles)
- `EB_APPLICATION_NAME`
- `EB_ENVIRONMENT_NAME`

### Guardrails

- Keep EB environment single-instance (min/max 1).
- Use workflow concurrency to prevent overlapping deploys.
- Keep docs-only changes out of deploy trigger when desired.
- Keep CI checks required for merge to protect deploy quality.

### First-run validation

1. Merge a non-doc change PR into `main`.
2. Confirm CI succeeds and CD workflow triggers on `push`.
3. Confirm EB environment updates to the new version label.
4. Re-run full workflow and verify data remains on EBS-backed SQLite.

## Rollback Plan

1. Keep previous deploy artifact available in EB.
2. If deployment fails, roll back application version.
3. Do not destroy EBS volume during app rollback.
4. Re-validate `/health` and data access before reopening demo access.
