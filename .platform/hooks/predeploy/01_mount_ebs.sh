#!/bin/bash
# Attaches and mounts the persistent EBS volume that holds the SQLite database.
# Runs as root from .platform/hooks/predeploy on every deployment.
# Requires EBS_VOLUME_ID to be set as an EB environment property.
# Safe to run on already-mounted volumes (idempotent).

set -euo pipefail

MOUNT_POINT="/data"
DEVICE="/dev/xvdf"
ENV_FILE="/opt/elasticbeanstalk/deployment/env"

# Load EB environment properties (includes EBS_VOLUME_ID)
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

if [[ -z "${EBS_VOLUME_ID:-}" ]]; then
  echo "[mount-ebs] EBS_VOLUME_ID not set — skipping EBS mount"
  exit 0
fi

# Idempotent: nothing to do if already mounted
if mountpoint -q "$MOUNT_POINT"; then
  echo "[mount-ebs] $MOUNT_POINT already mounted — nothing to do"
  exit 0
fi

# Discover instance identity via IMDSv2
TOKEN=$(curl -sf -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
INSTANCE_ID=$(curl -sf -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/instance-id)
REGION=$(curl -sf -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/region)

echo "[mount-ebs] instance=$INSTANCE_ID region=$REGION volume=$EBS_VOLUME_ID"

# Attach (ignore error — volume may already be attached from a prior run)
aws ec2 attach-volume \
  --volume-id  "$EBS_VOLUME_ID" \
  --instance-id "$INSTANCE_ID" \
  --device      "$DEVICE" \
  --region      "$REGION" 2>/dev/null || true

# Wait up to 30 s for the block device to appear
for i in $(seq 1 6); do
  [[ -b "$DEVICE" ]] && break
  echo "[mount-ebs] waiting for $DEVICE ($i/6)…"
  sleep 5
done

if [[ ! -b "$DEVICE" ]]; then
  echo "[mount-ebs] ERROR: $DEVICE did not appear after attach — aborting"
  exit 1
fi

# Format only if no filesystem exists (brand-new volume)
if ! blkid "$DEVICE" &>/dev/null; then
  echo "[mount-ebs] formatting $DEVICE as ext4 (new volume)"
  mkfs.ext4 -F "$DEVICE"
fi

mkdir -p "$MOUNT_POINT"
mount "$DEVICE" "$MOUNT_POINT"

# Persist the mount across OS reboots
if ! grep -qF "$DEVICE" /etc/fstab; then
  echo "$DEVICE  $MOUNT_POINT  ext4  defaults,nofail  0  2" >> /etc/fstab
fi

# Allow the webapp service user to write the SQLite file
chown webapp:webapp "$MOUNT_POINT"
chmod 750 "$MOUNT_POINT"

echo "[mount-ebs] $EBS_VOLUME_ID successfully mounted at $MOUNT_POINT"
