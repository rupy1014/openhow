#!/usr/bin/env bash
# clauders-community 데모: worker(:7877) + viewer(:5173) 가 떠있는지 보고,
# 없으면 부팅. 그 후 seed:local + 데모 가입자 부트스트랩 실행하고 브라우저로
# /login?demo=1&... 자동 오픈. autosubmit 으로 로그인 후 /w/clauders-community 로 진입.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CORE="$ROOT/core"
WORKER_DIR="$CORE/packages/worker"
VIEWER_DIR="$CORE/packages/viewer"
LOG_DIR="$ROOT/.tmp/dev-logs"
mkdir -p "$LOG_DIR"

WORKER_PORT=7877
VIEWER_PORT=5173
WORKSPACE_SLUG="clauders-community"
DEMO_EMAIL="${DEMO_EMAIL:-demo@clauders.community.local}"
DEMO_PASSWORD="${DEMO_PASSWORD:-clauders-demo-2026}"

# URL-encode helper (jq -sRr @uri)
url_encode() {
    printf '%s' "$1" | jq -sRr @uri
}

WORKER_STARTED=0
VIEWER_STARTED=0
WORKER_PID=""
VIEWER_PID=""

wait_for_port() {
    local port="$1"
    local label="$2"
    local max=60
    local i=0
    until lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
        i=$((i + 1))
        if [ "$i" -ge "$max" ]; then
            echo "[dev-community] timed out waiting for $label on :$port"
            exit 1
        fi
        sleep 1
    done
    echo "[dev-community] $label ready on :$port"
}

if lsof -iTCP:"$WORKER_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "[dev-community] worker already on :$WORKER_PORT — reusing"
else
    echo "[dev-community] starting worker (log: $LOG_DIR/worker.log)"
    (cd "$WORKER_DIR" && pnpm dev >"$LOG_DIR/worker.log" 2>&1) &
    WORKER_PID=$!
    WORKER_STARTED=1
fi

if lsof -iTCP:"$VIEWER_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "[dev-community] viewer already on :$VIEWER_PORT — reusing"
else
    echo "[dev-community] starting viewer (log: $LOG_DIR/viewer.log)"
    (cd "$VIEWER_DIR" && pnpm dev >"$LOG_DIR/viewer.log" 2>&1) &
    VIEWER_PID=$!
    VIEWER_STARTED=1
fi

if [ "$WORKER_STARTED" = "1" ] || [ "$VIEWER_STARTED" = "1" ]; then
    trap 'echo "[dev-community] stopping..."; [ -n "'"$WORKER_PID"'" ] && kill '"$WORKER_PID"' 2>/dev/null || true; [ -n "'"$VIEWER_PID"'" ] && kill '"$VIEWER_PID"' 2>/dev/null || true' INT TERM
fi

wait_for_port "$WORKER_PORT" "worker"
wait_for_port "$VIEWER_PORT" "viewer"
sleep 1

echo "[dev-community] bootstrapping demo owner (workspace + sign-up + sign-in token)"
SEED_OUT=$(DEMO_EMAIL="$DEMO_EMAIL" DEMO_PASSWORD="$DEMO_PASSWORD" \
    bash "$WORKER_DIR/scripts/seed-clauders-community.sh")

# seed 스크립트의 마지막 stdout 블록을 eval — DEMO_USER_ID / DEMO_TOKEN / DEMO_TOKEN_EXPIRES 주입.
eval "$(printf '%s\n' "$SEED_OUT" | grep -E '^(DEMO_USER_ID|DEMO_TOKEN|DEMO_TOKEN_EXPIRES)=')"

if [ -z "${DEMO_TOKEN:-}" ]; then
    echo "[dev-community] FAIL: seed did not emit DEMO_TOKEN"
    exit 1
fi

echo "[dev-community] publishing examples/clauders-community (4편)"
DEMO_USER_ID="$DEMO_USER_ID" DEMO_TOKEN="$DEMO_TOKEN" DEMO_TOKEN_EXPIRES="$DEMO_TOKEN_EXPIRES" \
DEMO_EMAIL="$DEMO_EMAIL" WORKER_PORT="$WORKER_PORT" \
    bash "$ROOT/scripts/publish-community-demo.sh"

REDIRECT="/w/${WORKSPACE_SLUG}"
LOGIN_URL="http://localhost:${VIEWER_PORT}/login?demo=1&email=$(url_encode "$DEMO_EMAIL")&password=$(url_encode "$DEMO_PASSWORD")&redirect=$(url_encode "$REDIRECT")"

echo "[dev-community] opening $LOGIN_URL"
if command -v open >/dev/null 2>&1; then
    open "$LOGIN_URL"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$LOGIN_URL"
else
    echo "[dev-community] no browser opener — open manually: $LOGIN_URL"
fi

if [ "$WORKER_STARTED" = "1" ] || [ "$VIEWER_STARTED" = "1" ]; then
    echo "[dev-community] running. Ctrl-C to stop the servers I started."
    [ -n "$WORKER_PID" ] && echo "  worker pid=$WORKER_PID (log: $LOG_DIR/worker.log)"
    [ -n "$VIEWER_PID" ] && echo "  viewer pid=$VIEWER_PID (log: $LOG_DIR/viewer.log)"
    wait
else
    echo "[dev-community] done (servers were already running — not killing them)"
fi
