#!/usr/bin/env bash
# clauders-community 예제 4편을 로컬 워커(:7877)로 publish.
# 인증 전략: 사용자의 prod ~/.openhow/auth.json 을 건드리지 않기 위해 임시 HOME
# 을 만들어서 거기에 dev 토큰 파일을 쓴다. publish 후에도 그대로 둔다 (재실행 시
# 덮어쓰기). prod 환경은 영향 없음.
#
# 호출 형식:
#   DEMO_USER_ID=... DEMO_TOKEN=... DEMO_TOKEN_EXPIRES=... \
#     bash scripts/publish-community-demo.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE_DIR="$ROOT/examples/clauders-community"
WORKER_PORT="${WORKER_PORT:-7877}"
DEMO_EMAIL="${DEMO_EMAIL:-demo@clauders.community.local}"

: "${DEMO_USER_ID:?DEMO_USER_ID env required (export from seed-clauders-community.sh)}"
: "${DEMO_TOKEN:?DEMO_TOKEN env required}"
: "${DEMO_TOKEN_EXPIRES:?DEMO_TOKEN_EXPIRES env required}"

DEV_HOME="${OPENHOW_DEV_HOME:-/tmp/openhow-dev-home}"
mkdir -p "$DEV_HOME/.openhow"

cat >"$DEV_HOME/.openhow/auth.json" <<EOF
{
  "accessToken": "${DEMO_TOKEN}",
  "refreshToken": "${DEMO_TOKEN}",
  "expiresAt": "${DEMO_TOKEN_EXPIRES}",
  "userId": "${DEMO_USER_ID}",
  "email": "${DEMO_EMAIL}",
  "serverUrl": "http://localhost:${WORKER_PORT}"
}
EOF
chmod 600 "$DEV_HOME/.openhow/auth.json"

echo "[publish-cc] using dev HOME=$DEV_HOME"
echo "[publish-cc] publish target: $EXAMPLE_DIR"
echo "[publish-cc] server: http://localhost:${WORKER_PORT}"

# openhow CLI 는 pnpm global bin 으로 설치돼 있음. HOME 만 갈아끼우면
# token-storage 가 dev 토큰만 본다.
# 부모 repo 의 untracked/dirty 파일 때문에 "git commit 후 publish 할까요?"
# 프롬프트가 뜨므로 'n' 을 미리 주입해서 비대화형으로 진행.
HOME="$DEV_HOME" \
OPENHOW_SERVER_URL="http://localhost:${WORKER_PORT}" \
    openhow publish "$EXAMPLE_DIR" <<<'n'

echo "[publish-cc] done"
