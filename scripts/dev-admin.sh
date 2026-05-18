#!/usr/bin/env bash
# Run the openhow admin/superadmin SPA on :5172 (local-only — never deployed).
# Vite proxies /api → local worker (http://localhost:7877). Requires worker dev:
#   cd core/packages/worker && pnpm dev
#
# Browser opens at /api/dev/login which mints a session cookie via
# DEV_LOGIN_EMAIL from worker/.dev.vars (localhost-only, no password).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CORE="$ROOT/core"
ADMIN_DIR="$CORE/packages/admin"
LOG_DIR="$ROOT/.tmp/dev-logs"
mkdir -p "$LOG_DIR"

ADMIN_PORT=5172
WORKER_PORT=7877
OPEN_URL="http://localhost:${ADMIN_PORT}/api/dev/login?redirect=/superadmin/workspaces"

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
    echo "Usage: $0"
    echo "  Runs admin SPA on :$ADMIN_PORT, proxies /api → :$WORKER_PORT."
    echo "  Worker must be running separately: cd core/packages/worker && pnpm dev"
    exit 0
fi

if ! lsof -iTCP:"$WORKER_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "[dev-admin] WARNING: worker dev not running on :$WORKER_PORT"
    echo "  start it in another terminal: cd core/packages/worker && pnpm dev"
fi

kill_port() {
    local port="$1"
    local pids
    pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo "[dev-admin] killing existing process(es) on :$port — $pids"
        # shellcheck disable=SC2086
        kill $pids 2>/dev/null || true
        sleep 1
        pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
        if [ -n "$pids" ]; then
            # shellcheck disable=SC2086
            kill -9 $pids 2>/dev/null || true
            sleep 1
        fi
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
            echo "[dev-admin] timed out waiting for $label on :$port"
            exit 1
        fi
        sleep 1
    done
    echo "[dev-admin] $label ready on :$port"
}

echo "[dev-admin] cleaning :$ADMIN_PORT"
kill_port "$ADMIN_PORT"

echo "[dev-admin] starting admin SPA (pnpm dev) — log: $LOG_DIR/admin.log"
(cd "$ADMIN_DIR" && pnpm dev >"$LOG_DIR/admin.log" 2>&1) &
ADMIN_PID=$!

trap 'echo "[dev-admin] stopping..."; kill '"$ADMIN_PID"' 2>/dev/null || true' INT TERM

wait_for_port "$ADMIN_PORT" "admin"
sleep 1

echo "[dev-admin] opening $OPEN_URL"
if command -v open >/dev/null 2>&1; then
    open "$OPEN_URL"
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$OPEN_URL"
else
    echo "[dev-admin] no browser opener found — open manually: $OPEN_URL"
fi

echo "[dev-admin] running. Ctrl-C to stop."
echo "  admin pid=$ADMIN_PID"
echo "  log: $LOG_DIR/admin.log"
wait
