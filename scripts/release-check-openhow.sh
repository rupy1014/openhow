#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CORE_ROOT="$REPO_ROOT/core"

run_step() {
  local label="$1"
  shift
  echo
  echo "==> $label"
  "$@"
}

run_bundle_step() {
  local label="$1"
  local dir="$2"
  local log_file
  log_file="$(mktemp)"

  echo
  echo "==> $label"
  (
    cd "$dir"
    pnpm build 2>&1 | tee "$log_file"
    exit "${PIPESTATUS[0]}"
  )

  if grep -q "Some chunks are larger" "$log_file"; then
    echo "Bundle warning detected during $label"
    rm -f "$log_file"
    exit 1
  fi

  rm -f "$log_file"
}

run_step "Build shared types" \
  pnpm --dir "$CORE_ROOT/packages/types" build

run_step "Run worker tests" \
  pnpm --dir "$CORE_ROOT/packages/worker" test

run_step "Run worker type diagnostics" \
  npx --prefix "$CORE_ROOT" tsc --noEmit --pretty false --project "$CORE_ROOT/packages/worker/tsconfig.json"

run_step "Run CLI tests" \
  pnpm --dir "$CORE_ROOT/packages/cli" test -- --run

run_step "Build CLI" \
  pnpm --dir "$CORE_ROOT/packages/cli" build

run_bundle_step "Build React viewer" "$CORE_ROOT/packages/viewer"

run_bundle_step "Build Vue viewer" "$CORE_ROOT/packages/viewer-vue"

echo
echo "release-check-openhow: PASS"
