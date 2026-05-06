#!/usr/bin/env bash
# Spin up worker (port 7877) + viewer (port 5173) and open the superadmin page
# with auto-login. Requires DEV_LOGIN_EMAIL set in core/packages/worker/.dev.vars.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CORE="$ROOT/core"
LOG_DIR="$ROOT/.tmp/dev-logs"
mkdir -p "$LOG_DIR"

WORKER_PORT=7877
VIEWER_PORT=5173
SUPERADMIN_URL="http://localhost:${VIEWER_PORT}/api/dev/login?redirect=/superadmin/workspaces"

kill_port() {
    local port="$1"
    local pids
    pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo "[dev-superadmin] killing existing process(es) on :$port — $pids"
        # shellcheck disable=SC2086
        kill $pids 2>/dev/null || true
        sleep 1
    fi
}

wait_for_port() {
    local port="$1"
    local label="$2"
    local max=60
    local i=0
    until lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; do
        i=$((i + 1))
        if [ "$i" -ge "$max" ]; then
            echo "[dev-superadmin] timed out waiting for $label on :$port"
            exit 1
        fi
        sleep 1
    done
    echo "[dev-superadmin] $label ready on :$port"
}

echo "[dev-superadmin] cleaning ports"
kill_port "$WORKER_PORT"
kill_port "$VIEWER_PORT"

echo "[dev-superadmin] starting worker (log: $LOG_DIR/worker.log)"
(cd "$CORE/packages/worker" && pnpm dev >"$LOG_DIR/worker.log" 2>&1) &
WORKER_PID=$!

echo "[dev-superadmin] starting viewer (log: $LOG_DIR/viewer.log)"
(cd "$CORE/packages/viewer" && pnpm dev >"$LOG_DIR/viewer.log" 2>&1) &
VIEWER_PID=$!

trap 'echo "[dev-superadmin] stopping..."; kill '"$WORKER_PID $VIEWER_PID"' 2>/dev/null || true' INT TERM

wait_for_port "$WORKER_PORT" "worker"
wait_for_port "$VIEWER_PORT" "viewer"

# small grace period for viewer's vite proxy to be fully listening
sleep 1

echo "[dev-superadmin] opening $SUPERADMIN_URL"
if command -v open >/dev/null 2>&1; then
    open "$SUPERADMIN_URL"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$SUPERADMIN_URL"
else
    echo "[dev-superadmin] no browser opener found — open manually: $SUPERADMIN_URL"
fi

echo "[dev-superadmin] running. Ctrl-C to stop both servers."
echo "  worker pid=$WORKER_PID  viewer pid=$VIEWER_PID"
echo "  worker log: $LOG_DIR/worker.log"
echo "  viewer log: $LOG_DIR/viewer.log"
wait
