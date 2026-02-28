#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES_DIR="$ROOT_DIR/docs/clauders/templates"
STARTER_BASE="$ROOT_DIR/docs/clauders/starter"

if [[ ! -d "$TEMPLATES_DIR" ]]; then
  echo "[error] templates directory not found: $TEMPLATES_DIR" >&2
  exit 1
fi

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <cohort> [owner]" >&2
  echo "  example: $0 4th @digiewood" >&2
  exit 1
fi

COHORT_RAW="$1"
OWNER="${2:-@[username]}"
TODAY="$(date +%F)"

COHORT_SAFE="$(echo "$COHORT_RAW" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9-' '-')"
COHORT_SAFE="${COHORT_SAFE#-}"
COHORT_SAFE="${COHORT_SAFE%-}"
TARGET_DIR="$STARTER_BASE/cohort-$COHORT_SAFE"

mkdir -p "$TARGET_DIR"

# Copy template tree
while IFS= read -r -d '' file; do
  rel="${file#"$TEMPLATES_DIR/"}"
  dst="$TARGET_DIR/$rel"
  mkdir -p "$(dirname "$dst")"
  cp "$file" "$dst"
done < <(find "$TEMPLATES_DIR" -type f -name "*.md" -print0)

# Replace common placeholders in generated files
while IFS= read -r -d '' file; do
  perl -i -pe "s/\[3rd\]/$COHORT_RAW/g; s/\[username\]/${OWNER#@}/g; s/updatedAt:\s*\d{4}-\d{2}-\d{2}/updatedAt: $TODAY/g" "$file"
done < <(find "$TARGET_DIR" -type f -name "*.md" -print0)

echo "[ok] cohort starter created: $TARGET_DIR"
