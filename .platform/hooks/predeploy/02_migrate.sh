#!/bin/bash
# Runs Knex database migrations against the production SQLite database.
# Runs as the webapp service user during hooks/predeploy on every deployment,
# after 01_mount_ebs.sh has attached /data and npm install has completed.

set -euo pipefail

APP_STAGING="/var/app/staging"
ENV_FILE="/opt/elasticbeanstalk/deployment/env"

# Load EB environment properties (SQLITE_PATH, NODE_ENV, etc.)
if [[ -f "$ENV_FILE" ]]; then
  set -o allexport
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +o allexport
fi

if [[ ! -d "$APP_STAGING" ]]; then
  echo "[migrate] staging directory not found at $APP_STAGING — skipping"
  exit 0
fi

cd "$APP_STAGING"
echo "[migrate] running migrations (SQLITE_PATH=${SQLITE_PATH:-/data/trips.db})…"
node_modules/.bin/knex migrate:latest
echo "[migrate] migrations complete"
