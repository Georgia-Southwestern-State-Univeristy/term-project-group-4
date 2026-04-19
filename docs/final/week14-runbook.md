# Week 14 Release Candidate Runbook

## Overview

This document provides the deployment verification path for the Week 14 release candidate. The deployment process is **fully automated via GitHub Actions and Elastic Beanstalk hooks** — manual steps shown below are for understanding and verification only.

### Issues Found During Verification

During Week 14 release candidate verification, the following gaps in the beta deployment process were identified and addressed:

1. **Missing EBS volume setup**: The `beta-deploy.md` did not include persistent storage configuration. EBS volumes are required for SQLite database persistence across instance restarts. This runbook adds Step 1 with complete volume setup and tagging.
2. **Database migration hooks not documented**: Predeploy scripts for running database migrations were missing from beta procedures. These are now explicitly called out in the automated deployment flow (Step 4).
3. **Manual EB deployment steps unclear**: Steps for reference/troubleshooting manual deployment have been clarified with both EB CLI and console approaches.

### Important Notes

**Deployment Verification**: The deployment test environment was verified manually following the steps in `beta-deploy.md`. Due to infrastructure constraints, test EB environments use HTTP instead of HTTPS. Production and staging use HTTPS with custom domain (spcg.zentrofi.com).

**Automated Deployment**: The release candidate uses GitHub Actions workflows to automatically:
- Build the application (`npm run build`)
- Run all tests (unit and E2E)
- Deploy to Elastic Beanstalk
- Execute predeploy hooks (EBS mount, database migrations)

Manual deployment steps shown here are for **reference and troubleshooting** only. Normal deployments trigger automatically on commits to `main`.

---

## Quick Start

For manual deployment reference, follow these steps. This builds on `beta-deploy.md` with additions for AWS account setup and EBS volume management.

---

## Prerequisites

- AWS account with billing enabled
- AWS CLI v2 configured with credentials
- EB CLI (optional: `pip install awsebcli`)
- Node.js version matching the EB solution stack (e.g., 24.x LTS or as specified in `.ebextensions`)
- Git

---

## Step 1: Create EBS Volume (NEW - Not in Beta Deploy)

EBS provides persistent storage for the SQLite database.

### Create Volume via AWS Console

1. Go to **EC2** > **Volumes**
2. Click **Create volume**
3. Set:
   - **Type**: `gp3`
   - **Size**: `20 GiB`
   - **AZ**: Same AZ as your EB instance (e.g., `<YOUR_AZ>`)
   - **Encryption**: Enable
4. **Record the Volume ID** (e.g., `vol-xxx`)

### Or via CLI

```bash
aws ec2 create-volume \
  --size 20 \
  --volume-type gp3 \
  --availability-zone <YOUR_AZ> \
  --tag-specifications 'ResourceType=volume,Tags=[{Key=Name,Value=spcg-database-volume}]' \
  --region <YOUR_REGION>
```

---

## Step 2: Create EB Application & Environment

Follow the same steps from `beta-deploy.md`:

1. Go to **Elastic Beanstalk** > **Create application**
2. Enter name: `smart-packing-checklist`
3. Click **Create environment** > **Web server tier**
4. Select **Node.js 24 running on 64bit Amazon Linux 2023**
5. Wait for environment to be Green (3-5 min)

---

## Step 3: Set Environment Variables (Updated)

Once environment is Green, click **Configuration** > **Software** and add these properties:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `8080` |
| `FRONTEND_URL` | `https://<YOUR_DOMAIN>` (e.g., `spcg.zentrofi.com` for production) |
| `SQLITE_PATH` | `/data/trips.db` |
| `EBS_VOLUME_ID` | `vol-xxxx` (from Step 1) |
| `GOOGLE_CLIENT_ID` | [from Google Cloud Console] |
| `GOOGLE_CLIENT_SECRET` | [from Google Cloud Console] |
| `SESSION_SECRET` | `openssl rand -base64 32` |

Click **Apply** (2-3 min wait).

---

## Step 4: Deploy (Automated via CI/CD)

> **Note**: Normal deployments are **automated via GitHub Actions** on commits to `main`. The steps below are for manual/reference deployment only.

### Automated CI/CD Flow (Default)

When you push to `main`, GitHub Actions automatically:
1. Installs dependencies (`npm install`)
2. Builds the frontend (`npm run build`)
3. Runs all tests (`npm run test:all`)
4. On success, deploys to Elastic Beanstalk
5. EB runs predeploy hooks (EBS mount + migrations)
6. Application starts and becomes available

**No manual action required.**

### Manual Deployment (Reference Only)

If you need to manually deploy:

```bash
git clone https://github.com/Georgia-Southwestern-State-Univeristy/term-project-group-4.git
cd term-project-group-4
npm install
npm run build
```

Then deploy with EB CLI:

```bash
eb init -p "Node.js 24 running on 64bit Amazon Linux 2023" \
  --region <YOUR_REGION> \
  smart-packing-checklist

eb deploy
eb logs --stream  # Watch deployment in real-time
```

Or upload ZIP to console:

```bash
git archive --format zip HEAD > spcg-rc.zip
```

Then in EB console: **Upload and deploy** > Select zip > **Deploy**

**Expected**: Environment turns Green, shows `INFO: EBS mount script executed successfully`

---

## Step 5: Verify Deployment

### Check health endpoint

```bash
curl https://<YOUR_DOMAIN>/health
# Replace <YOUR_DOMAIN> with your environment URL (e.g., smart-checklist-test-naren-env.eba-ievuxvxp.us-east-2.elasticbeanstalk.com for test, or spcg.zentrofi.com for production)
# Expected response:
# {"status":"ok","version":"1.0.0","environment":"production","requestId":"...","uptimeSeconds":...,"database":"connected","config":"loaded"}
```

### SSH to instance and verify EBS mount

```bash
eb ssh

# On the instance:
df -h | grep /data
# Expected: /dev/xvdf mounted at /data

sqlite3 /data/trips.db ".tables"
# Expected: users  trips  checklist_items
```

---

## Step 6: Run Smoke Test

1. Open `https://<YOUR_DOMAIN>` (use your EB environment URL or custom domain)
2. Click **Login with Google** and authenticate
3. Create trip: name="Test", destination="Beach", duration="3 days"
4. Click **Generate Checklist** → **Save Trip**
5. Verify toast shows "Saved! (ID: ...)"
6. Toggle one checklist item as packed
7. **Reload page** (Cmd+R / Ctrl+R)
8. Click **Load** on the saved trip
9. Verify:
   - Trip data is correct
   - Checklist item toggle state persisted
   - No console errors (F12)
10. Delete the trip and verify it's gone

**Pass**: All actions work, data persists, success messages appear, no errors.

---

## Troubleshooting

| Problem | Check |
|---------|-------|
| EB environment is Red | **Logs** > Check for missing env vars |
| App won't start | Verify `SQLITE_PATH=/data/trips.db` is set |
| Save/Load fails | SSH in and check `df -h \| grep /data` — volume must be mounted |
| Login redirects wrong | Verify `FRONTEND_URL` in EB env matches OAuth redirect URI in Google Console |

---

## What's Different from Beta Deploy

- ✅ **EBS volume creation** — Step 1 (NEW)
- ✅ **EBS_VOLUME_ID environment variable** — Step 3 (NEW)
- ✅ **Volume mount verification** — Step 5 (NEW)
- ✅ **Database persistence verification** — Step 5 (NEW)

The predeploy hooks (`.platform/hooks/predeploy/`) handle EBS mount and migrations automatically. No manual database setup needed.


## Evidence

| Date | Tester | Deployed Version | Evidence Links |
|------|--------|------------------|-----------------|
| 2026-04-18 | Naren | main @ 8a365fe| [Environment](http://smart-checklist-test-naren-env.eba-ievuxvxp.us-east-2.elasticbeanstalk.com), [EB Dashboard](https://us-east-2.console.aws.amazon.com/elasticbeanstalk/home?region=us-east-2#/environment/dashboard?environmentId=e-4qap4mrbcw&tab=deployments) |