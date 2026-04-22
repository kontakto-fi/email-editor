#!/usr/bin/env bash
# Sequentially run the work-on-issue skill for each issue number given.
# Each invocation: reads the issue, implements it, verifies with Playwright MCP,
# commits, and pushes. Stops on first failure.
#
# Usage:
#   scripts/work-issues.sh                 # default dependency-aware order
#   scripts/work-issues.sh 4 5 6           # specific issues
#
# Requires: claude CLI, gh CLI, Playwright MCP server configured.

set -euo pipefail

DEFAULT_ORDER=(8 5 6 7 10 11 12 9 13)

if [[ $# -eq 0 ]]; then
  ISSUES=("${DEFAULT_ORDER[@]}")
else
  ISSUES=("$@")
fi

echo "Working issues in order: ${ISSUES[*]}"
echo

for N in "${ISSUES[@]}"; do
  printf '\n\033[1;34m━━━ Issue #%s ━━━\033[0m\n\n' "$N"

  claude -p "/work-on-issue $N" --dangerously-skip-permissions

  printf '\n\033[1;32m✓ Issue #%s done.\033[0m\n' "$N"
done

echo
echo "All issues processed."
