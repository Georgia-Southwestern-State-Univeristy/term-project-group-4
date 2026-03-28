# AWS Hosting Plan Scratch

This is a temporary planning note for AWS hosting. It is intentionally stored under `data/`, which is ignored by git in this repo.

## Recommendation

Use a single AWS-hosted Node app with SQLite on an attached EBS volume for Beta.

Recommended stack:
- App runtime: AWS Elastic Beanstalk (Node.js)
- Database: SQLite (`better-sqlite3`) with DB file stored on a persistent EBS volume
- Domain/TLS: Elastic Beanstalk load balancer + HTTPS
- Secrets/config: Elastic Beanstalk environment properties for Beta

Why this is the right fit for the current repo:
- The app already uses `better-sqlite3` in development — no driver change needed.
- No separate DB service to provision, secure, or pay for.
- SQLite on a dedicated EBS volume survives restarts, and can survive EB redeploy/replacement when attach/mount automation is configured.
- Single-instance Beta deployment is sufficient for class-demo scope.
- Elastic Beanstalk is the shortest path to a working hosted demo without adding container orchestration complexity.

## Current Repo State

What is already aligned with AWS:
- Backend is Node/Express and can run as a single process.
- App already uses `better-sqlite3` — no database driver change needed.
- OAuth credentials and session secret are already environment-driven.
- API + auth are already behind the same Express app.

What is not production-ready yet:
- `knexfile.js` production config points to `pg`/`DATABASE_URL` — needs to be updated to `better-sqlite3` with an EBS-mounted path.
- Express does not currently serve the built Vite frontend from `dist/`.
- Session storage is still the default in-memory session store.
- Cookie settings are not yet hardened for HTTPS production.
- There is no dedicated health endpoint.
- Logger writes to local files, which is not ideal for ephemeral cloud instances.
- EBS volume must be provisioned, attached, and mounted before first deploy.

## Target Beta Architecture

Browser
-> HTTPS
-> Elastic Beanstalk load balancer
-> Express app on EC2 instance (single)
-> SQLite DB file on attached EBS volume

Same Express app responsibilities:
- serve built frontend assets
- handle `/auth/*`
- handle `/api/*`
- connect to SQLite via Knex (`better-sqlite3`)

This is better than splitting frontend and backend for Beta because:
- Google OAuth callbacks stay on the same origin
- session/cookie behavior is simpler
- deployment and debugging are simpler for a student team

## Required Code/Config Work Before AWS Deployment

### 1. Update production database config for SQLite on EBS
- Update `knexfile.js` production config from `pg`/`DATABASE_URL` to `better-sqlite3`
- Set DB file path via env var (e.g. `SQLITE_PATH=/data/trips.db`) so it points to the EBS mount
- Run `npm run db:migrate` in the deployed environment after volume is mounted

### 2. Serve frontend from Express in production
Current state:
- Vite proxies `/api` and `/auth` only during local development
- there is no production asset-serving path in `server.js`

Need:
- build frontend with `npm run build`
- use `express.static('dist')` in production
- add fallback route for SPA entry if needed

### 3. Session and cookie hardening
Current risk:
- default MemoryStore is not appropriate for scaled/multi-instance production
- cookie security flags are not configured for HTTPS deployment

Minimum Beta approach:
- run a single application instance initially
- set secure cookie options for production
- set `app.set('trust proxy', 1)` behind the load balancer

Better follow-up:
- move sessions to Redis or a DB-backed session store if scaling beyond one instance

### 4. OAuth production configuration
Need to update Google Cloud OAuth settings with:
- authorized origin: the Elastic Beanstalk URL or custom domain
- redirect URI: `https://<host>/auth/google/callback`

Need to verify:
- `FRONTEND_URL` is set correctly
- callback flow returns to the hosted app, not localhost

### 5. Health and deployment visibility
Need:
- `GET /health` endpoint returning simple status
- startup logs that clearly show environment and successful migration state
- prefer stdout/stderr logging in production instead of local log files only

## Recommended Rollout Sequence

### Phase 1. Prepare app for production hosting
Goal: make the existing app capable of running as one hosted service.

Tasks:
- update `knexfile.js` production config to `better-sqlite3` with `SQLITE_PATH` env var
- add production static asset serving
- add health endpoint
- harden session/cookie config for proxy + HTTPS
- confirm single-instance deployment for Beta

Exit criteria:
- app can run locally in a production-like mode using built frontend and a file-path SQLite connection

### Phase 2. Provision AWS infrastructure
Goal: create the minimum cloud environment needed for Beta.

Tasks:
- create and attach EBS volume to the EB EC2 instance
- mount EBS volume (e.g. at `/data`) and confirm it persists across restarts
- automate attach/mount during instance replacement (for example via EB `.ebextensions`/platform hooks)
- create Elastic Beanstalk Node environment
- set env vars in Elastic Beanstalk:
  - `NODE_ENV=production`
  - `SQLITE_PATH=/data/trips.db`
  - `GOOGLE_CLIENT_ID=...`
  - `GOOGLE_CLIENT_SECRET=...`
  - `SESSION_SECRET=...`
  - `FRONTEND_URL=https://<host>`

Exit criteria:
- deployed app instance can boot and write to the SQLite file on the mounted EBS volume
- attach/mount is automated so replacement instances do not fall back to ephemeral storage

### Phase 3. Migrate and verify
Goal: prove the system works end to end in AWS.

Tasks:
- confirm EBS volume is mounted at `/data`
- run `npm run db:migrate`
- verify users/trips/checklist tables exist in `/data/trips.db`
- verify Google login works
- run end-to-end flow:
  - login
  - create trip
  - save trip
  - reload trip
  - update checklist item
  - delete trip

Exit criteria:
- full Beta workflow works on the hosted environment

### Phase 4. Stabilize and document
Goal: remove uncertainty before demo/release.

Tasks:
- document rollback steps
- record hosted URL and deployment process
- capture known risks that remain
- verify CI still protects the flow after deployment-related changes

## AWS Provisioning Steps

### EBS Volume
1. Create an EBS volume in the same AZ as the EB EC2 instance.
2. Attach volume to the instance (e.g. as `/dev/xvdf`).
3. Format the volume on first use: `mkfs -t ext4 /dev/xvdf`
4. Mount at `/data`: add entry to `/etc/fstab` so it remounts on reboot.
5. Confirm the app user has read/write access to `/data`.
6. Set `SQLITE_PATH=/data/trips.db` in EB environment properties.

### Elastic Beanstalk
1. Create Node.js environment.
2. Deploy app from repo/package upload.
3. Set environment variables (see Phase 2 above).
4. Use one instance; do not enable auto-scaling (EBS volumes are single-AZ).
5. Verify app boots and `/health` returns OK before running migrations.

### Google OAuth
1. Add hosted domain to authorized origins.
2. Add `/auth/google/callback` on hosted domain to redirect URIs.
3. Re-test auth after deployment.

## Biggest Risks

### 1. EBS volume not mounted before app starts
If the volume is not mounted at `/data` when the app boots, SQLite will write to the ephemeral instance disk and data will be lost on redeploy.

Beta decision:
- confirm mount and `SQLITE_PATH` env var before first deploy
- add a startup check or health endpoint that verifies the DB path is accessible

### 1b. EB instance replacement without automated volume attach/mount
Elastic Beanstalk can replace instances during updates/health events. Without automation, a new instance can come up without the data volume mounted.

Beta decision:
- implement attach/mount automation in EB configuration before production deploy
- verify with one forced instance replacement test

### 2. EBS volume is single-AZ
EBS volumes cannot be shared across multiple EC2 instances or AZs. This means auto-scaling is not possible without a different storage strategy.

Beta decision:
- run exactly one instance; disable auto-scaling in EB configuration
- acceptable for class-demo scope

### 3. Frontend hosting mismatch
Right now the app depends on Vite for local frontend hosting. Without Express serving `dist/`, AWS deployment will host API only, not the app UI.

### 4. OAuth callback mismatch
This is the most likely deployment-day failure. If the hosted URL is not registered exactly in Google Cloud, login will fail.

### 5. Logging strategy
Current logger writes to local files. On cloud hosts, instance-local logs are fragile. For Beta, console logging is more useful because platform log collection can capture it.

## Concrete Plan for the Team

### Jason
- Own production app-shape changes in `server.js`
- Serve frontend in production
- Add health endpoint
- Review deployment architecture decisions

### Naren
- Own AWS environment setup
- Provision Elastic Beanstalk environment
- Create, attach, and mount EBS volume
- Configure env vars and deployment flow
- Verify CI/main stays stable while deployment work lands

### Heather
- Own runbook/docs
- Capture exact OAuth setup steps, hosted URL, and known risks
- Record deployment evidence and Beta-readiness notes

## Minimum Viable Beta Hosting Checklist

- `knexfile.js` production config updated to `better-sqlite3` + `SQLITE_PATH`
- EBS volume created, attached, formatted, and mounted at `/data`
- Elastic Beanstalk app provisioned
- env vars configured (including `SQLITE_PATH=/data/trips.db`)
- frontend served from Express in production
- migrations run successfully against EBS-mounted DB file
- Google OAuth works on hosted URL
- full create/save/load/update/delete workflow passes
- rollback steps written down

## What I Would Not Do For Beta

Avoid these unless clearly necessary:
- ECS/Fargate
- separate S3/CloudFront frontend plus separate API domain
- multi-instance autoscaling with SQLite on a single attached EBS volume
- private VPC architecture that the team cannot debug quickly
- over-engineered secret management if Elastic Beanstalk env vars are sufficient for class-demo scope

## Suggested Next Deliverables

1. Convert this scratch note into a versioned `docs/beta/week11-aws-plan.md` only after the team agrees on the architecture.
2. Open issues for:
  - update `knexfile.js` production config to `better-sqlite3` + `SQLITE_PATH`
  - serve built frontend from Express
  - add health endpoint
  - production session/cookie config
  - provision Elastic Beanstalk environment
  - create, attach, and mount EBS volume
  - run migrations and verify DB on hosted environment
3. Add one deployment dry-run before the final Beta week.

## CI/CD Recommendation (Main Branch Auto Deploy)

- Keep CI pipeline on pull requests to `main`.
- Add branch protection so CI must pass before merge.
- Add CD workflow on `push` to `main` that deploys to Elastic Beanstalk.
- This yields automatic deploy after PR merge without deploying from unmerged PR branches.

Required GitHub repository secrets:
- `AWS_ROLE_TO_ASSUME`
- `AWS_REGION`
- `EB_DEPLOY_BUCKET`
- `EB_APPLICATION_NAME`
- `EB_ENVIRONMENT_NAME`

Important note:
- Use one EB instance only for this SQLite + EBS architecture.
