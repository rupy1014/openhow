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

assert_bundle_budget() {
  local assets_dir="$1"
  local pattern="$2"
  local max_bytes="$3"
  local label="$4"
  local matched_file
  local file_size

  matched_file="$(find "$assets_dir" -maxdepth 1 -name "$pattern" | head -n 1)"

  if [[ -z "$matched_file" ]]; then
    echo "Missing bundle for budget check: $label ($pattern)"
    exit 1
  fi

  file_size="$(wc -c < "$matched_file" | tr -d '[:space:]')"

  if (( file_size > max_bytes )); then
    echo "Bundle budget exceeded for $label: ${file_size} bytes > ${max_bytes} bytes"
    echo "File: $matched_file"
    exit 1
  fi
}

run_viewer_bundle_budget_checks() {
  local assets_dir="$CORE_ROOT/packages/viewer/dist/assets"

  echo
  echo "==> Check React viewer bundle budgets"

  assert_bundle_budget "$assets_dir" "markdown-shiki-*.js" 850000 "markdown-shiki core"
  assert_bundle_budget "$assets_dir" "editor-plate-core-*.js" 500000 "editor-plate core"
  assert_bundle_budget "$assets_dir" "editor-plate-markdown-*.js" 160000 "editor-plate markdown"
  assert_bundle_budget "$assets_dir" "editor-plate-embed-*.js" 160000 "editor-plate embed"
  assert_bundle_budget "$assets_dir" "editor-plate-plugins-*.js" 60000 "editor-plate plugins"
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
run_viewer_bundle_budget_checks

echo
echo "release-check-openhow: PASS"
