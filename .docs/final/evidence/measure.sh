#!/usr/bin/env bash
# Reproduces every number in comparison-table.md and ai-logic.md.
# Run from the repository root after `git fetch --all`.
# Usage: bash .docs/final/evidence/measure.sh > .docs/final/evidence/measure-log.txt
set -u
BASE=516bb12   # browser-only demo baseline (15 Sep 2026)
echo "# measure.sh run at $(date -u +%Y-%m-%dT%H:%M:%SZ) on $(git rev-parse --short HEAD)"
echo
echo "## Git / AI disclosure (all refs)"
echo "unique_commits_all_refs=$(git rev-list --all --count)"
echo "commits_with_claude_trailer=$(git log --all -i --grep='Co-Authored-By: Claude' --format=%h | wc -l)"
git log --all -i --grep='Co-Authored-By: Claude' --format='  %h %ad %s' --date=short
echo "custom_agents=$(git ls-tree -r --name-only origin/docs/discover-package -- .github/agents | wc -l)  (branch docs/discover-package)"
echo "custom_skills=$(git ls-tree -r --name-only origin/docs/discover-package -- .claude/skills | grep -c SKILL.md)  (branch docs/discover-package)"
echo
echo "## Database evidence (current tree)"
echo "pgTAP plans in canonical files:"
grep -H "select plan(" supabase/tests/database/00[1-3]_*.test.sql | grep -v " 2.sql"
echo "overlap_exclusion_constraint_refs=$(grep -l 'bookings_no_active_overlap' supabase/migrations/*.sql | wc -l) migration file(s)"
echo "distinct_client_rpcs=$(grep -rhoE "\.rpc\(['\"][a-z_]+" app/src | sort -u | wc -l)"
echo "baseline_has_supabase_dir=$(git ls-tree -d --name-only $BASE supabase | wc -l)"
echo "baseline_localStorage_refs_in_bookingService=$(git show $BASE:app/src/features/bookings/bookingService.js | grep -c localStorage)"
echo "baseline_rpc_calls=$(git grep -hoE "\.rpc\(" $BASE -- app/src | wc -l)"
echo
echo "## Frontend tests (current) — run separately:"
echo "  npm ci --prefix app && npm test --prefix app"
echo "## Frontend tests (baseline) — run separately:"
echo "  git worktree add /tmp/base $BASE && (cd /tmp/base/app && npm ci && node --test)"
