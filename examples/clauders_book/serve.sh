#!/usr/bin/env bash
# clauders_book 로컬 서버 실행 스크립트
# 포트 충돌 방지: 3600 주변 프로세스 정리 후 openhow serve 시작

PORT=${1:-3600}
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== clauders_book serve ==="
echo "포트: $PORT"

# 해당 포트에 프로세스가 있으면 모두 kill
PIDS=$(lsof -ti :"$PORT" 2>/dev/null)
if [ -n "$PIDS" ]; then
  echo "포트 $PORT 사용 중 → 종료"
  echo "$PIDS" | xargs kill 2>/dev/null
  sleep 2
  # 아직 살아있으면 강제 종료
  PIDS=$(lsof -ti :"$PORT" 2>/dev/null)
  if [ -n "$PIDS" ]; then
    echo "강제 종료..."
    echo "$PIDS" | xargs kill -9 2>/dev/null
    sleep 1
  fi
fi

echo "openhow serve 시작..."
exec openhow serve "$DIR" -p "$PORT" -o
