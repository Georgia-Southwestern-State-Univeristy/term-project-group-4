#!/usr/bin/env bash
# Creates Week 9 sprint label, issues, and adds them to the project board.
# Usage: bash scripts/create-sprint-issues.sh

set -euo pipefail

REPO="Georgia-Southwestern-State-Univeristy/term-project-group-4"
PROJECT_NUMBER=26
ORG="Georgia-Southwestern-State-Univeristy"
LABEL="week9"

echo "=== Step 1: Create label ==="
gh label create "$LABEL" \
  --repo "$REPO" \
  --color "1d76db" \
  --description "Week 9 Sprint" \
  --force
echo "Label '$LABEL' created."

echo ""
echo "=== Step 2: Create issues and add to project board ==="

# Define sprint items: "title|body"
items=(
  "Database migration (SQLite)|**Rank:** 1\n**Source:** Beta Sprint 1\n**Owner:** TBD\n\n### Acceptance Criteria\n- \`storageFile.js\` replaced by a SQLite-backed module behind the same interface\n- All 23 existing tests pass against the new storage layer\n- Trip data persists across server restarts\n\nSee [docs/beta/week9-sprint.md](../docs/beta/week9-sprint.md) for full sprint context."
  "Trip deletion|**Rank:** 2\n**Source:** Beta Sprint 1\n**Owner:** TBD\n\n### Acceptance Criteria\n- \`DELETE /api/trips/:tripId\` returns \`204\` on success and \`404\` for missing trips\n- Deleted trips no longer appear in \`GET /api/trips\`\n- UI shows a Delete button on each saved trip; clicking it removes the trip without a full page reload\n\nSee [docs/beta/week9-sprint.md](../docs/beta/week9-sprint.md) for full sprint context."
  "Toast notifications|**Rank:** 3\n**Source:** Beta Sprint 1\n**Owner:** TBD\n\n### Acceptance Criteria\n- Toast component renders success and error messages in the UI\n- Save, delete, and network-error events trigger a toast instead of silent console logs\n- Toasts auto-dismiss after 4 seconds\n\nSee [docs/beta/week9-sprint.md](../docs/beta/week9-sprint.md) for full sprint context."
  "Integration test suite|**Rank:** 4\n**Source:** Beta backlog\n**Owner:** TBD\n\n### Acceptance Criteria\n- End-to-end tests covering create → generate → pack → update → delete flow\n- Tests run in CI alongside existing unit tests\n- At least one happy-path and one error-path scenario per endpoint\n\nSee [docs/beta/week9-sprint.md](../docs/beta/week9-sprint.md) for full sprint context."
  "Observability starter (structured logging)|**Rank:** 5\n**Source:** Week 9 requirement\n**Owner:** TBD\n\n### Acceptance Criteria\n- Structured JSON logging added to the Express server (request method, path, status, duration)\n- Errors logged with stack traces and request context\n- Log output is parseable by standard tools (e.g., \`jq\`)\n\nSee [docs/beta/week9-sprint.md](../docs/beta/week9-sprint.md) for full sprint context."
  "Bug triage + fix 2 issues|**Rank:** 6\n**Source:** Week 9 requirement\n**Owner:** TBD\n\n### Acceptance Criteria\n- Team reviews open issues and labels at least 4 as triaged\n- At least 2 bugs fixed with tests proving the fix\n- Fixed issues are closed with a link to the merging PR\n\nSee [docs/beta/week9-sprint.md](../docs/beta/week9-sprint.md) for full sprint context."
)

for item in "${items[@]}"; do
  IFS='|' read -r title body <<< "$item"

  echo ""
  echo "Creating issue: $title"
  issue_url=$(gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --label "$LABEL" \
    --body "$(echo -e "$body")" \
    --json url -q .url)

  echo "  Created: $issue_url"

  # Extract issue number from URL
  issue_number=$(echo "$issue_url" | grep -oE '[0-9]+$')

  echo "  Adding to project #$PROJECT_NUMBER..."
  gh project item-add "$PROJECT_NUMBER" \
    --owner "$ORG" \
    --url "$issue_url" \
    2>&1

  echo "  Added to project board."
done

echo ""
echo "=== Done! ==="
echo "All 6 sprint issues created, labeled '$LABEL', and added to project #$PROJECT_NUMBER."
echo "View board: https://github.com/orgs/$ORG/projects/$PROJECT_NUMBER/views/1"
