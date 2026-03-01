#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATES_DIR="$ROOT_DIR/docs/clauders/templates"
STARTER_BASE="$ROOT_DIR/docs/clauders/starter"

usage() {
  cat <<EOF
Usage: $0 <cohort> [owner] [--force] [--dry-run]
  example: $0 4th @digiewood
EOF
}

if [[ ! -d "$TEMPLATES_DIR" ]]; then
  echo "[error] templates directory not found: $TEMPLATES_DIR" >&2
  exit 1
fi

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

COHORT_RAW="$1"
shift || true
OWNER="@[username]"
FORCE=0
DRY_RUN=0

# Optional owner as 2nd positional if it doesn't look like a flag.
if [[ $# -gt 0 && "${1:-}" != --* ]]; then
  OWNER="$1"
  shift || true
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=1 ;;
    --dry-run) DRY_RUN=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "[error] unknown option: $1" >&2; usage; exit 1 ;;
  esac
  shift || true
done

TODAY="$(date +%F)"
COHORT_SAFE="$(echo "$COHORT_RAW" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9-' '-')"
COHORT_SAFE="${COHORT_SAFE#-}"
COHORT_SAFE="${COHORT_SAFE%-}"
TARGET_DIR="$STARTER_BASE/cohort-$COHORT_SAFE"

if [[ -d "$TARGET_DIR" && $FORCE -ne 1 ]]; then
  echo "[error] target already exists: $TARGET_DIR" >&2
  echo "        use --force to overwrite" >&2
  exit 1
fi

if [[ $DRY_RUN -eq 1 ]]; then
  echo "[dry-run] cohort=$COHORT_RAW owner=$OWNER target=$TARGET_DIR"
  find "$TEMPLATES_DIR" -type f -name "*.md" | sed "s#^$TEMPLATES_DIR#would copy -> $TARGET_DIR#"
  exit 0
fi

if [[ -d "$TARGET_DIR" && $FORCE -eq 1 ]]; then
  rm -rf "$TARGET_DIR"
fi

mkdir -p "$TARGET_DIR"

# Copy template tree
while IFS= read -r -d '' file; do
  rel="${file#"$TEMPLATES_DIR/"}"
  dst="$TARGET_DIR/$rel"
  mkdir -p "$(dirname "$dst")"
  cp "$file" "$dst"
done < <(find "$TEMPLATES_DIR" -type f -name "*.md" -print0)

# Safe placeholder replacements (literal, non-regex)
while IFS= read -r -d '' file; do
  python3 - "$file" "$COHORT_RAW" "${OWNER#@}" "$TODAY" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
cohort = sys.argv[2]
owner = sys.argv[3]
today = sys.argv[4]
text = path.read_text(encoding='utf-8')
text = text.replace('[3rd]', cohort)
text = text.replace('[username]', owner)
# Keep replacement narrow to frontmatter style
import re
text = re.sub(r'updatedAt:\s*\d{4}-\d{2}-\d{2}', f'updatedAt: {today}', text)
path.write_text(text, encoding='utf-8')
PY
done < <(find "$TARGET_DIR" -type f -name "*.md" -print0)

echo "[ok] cohort starter created: $TARGET_DIR"