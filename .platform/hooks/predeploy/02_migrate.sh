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
DB_PATH="${SQLITE_PATH:-/data/trips.db}"

echo "[migrate] running migrations (SQLITE_PATH=$DB_PATH)..."
node_modules/.bin/knex migrate:latest

# Migrations run as root in EB hooks. Ensure the runtime app user can write DB.
# WAL mode creates companion files (.db-wal, .db-shm) that must also be owned by webapp.
if [[ -d "/data" ]]; then
  find /data -maxdepth 1 -name 'trips.db*' -exec chown webapp:webapp {} \; 2>/dev/null || true
  find /data -maxdepth 1 -name 'trips.db*' -exec chmod 660 {} \; 2>/dev/null || true
  chown webapp:webapp /data || true
  chmod 750 /data || true
fi

echo "[migrate] migrations complete"
