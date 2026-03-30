#!/bin/bash
# Deprecated duplicate mount script.
# The authoritative EBS mount logic now lives under:
#   .platform/hooks/predeploy/01_mount_ebs.sh
#
# This confighooks copy is intentionally a no-op to avoid running the
# mount logic twice per deployment and to prevent future divergence
# between two separate copies of the script.

set -euo pipefail

echo "[mount-ebs] NOTE: .platform/confighooks/predeploy/01_mount_ebs.sh is deprecated and is a no-op."
echo "[mount-ebs] The EBS volume mount is handled by .platform/hooks/predeploy/01_mount_ebs.sh."
exit 0
