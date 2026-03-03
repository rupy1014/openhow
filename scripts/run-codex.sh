#!/usr/bin/env bash
# run-codex.sh — Claude + Codex 오케스트레이션 래퍼
# 사용법: bash scripts/run-codex.sh <패키지경로> "작업 내용"
# 예시:
#   bash scripts/run-codex.sh core/packages/worker "Order cancel 액션 구현"
#   bash scripts/run-codex.sh core/packages/viewer "취소 버튼 + 모달 UI 추가"

set -euo pipefail

PROJECT="${1:?패키지 경로 필요 (예: core/packages/worker)}"
TASK="${2:?작업 내용 필요}"
RESULT_FILE="/tmp/codex-result-$$.txt"

# 절대경로 변환 (run-codex.sh가 어디서 실행되든 동작하도록)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ABS="$REPO_ROOT/$PROJECT"

if [ ! -d "$PROJECT_ABS" ]; then
  echo '{"status":"error","summary":"디렉토리 없음: '"$PROJECT_ABS"'","files_modified":[],"next_steps":[]}' | python3 -m json.tool
  exit 1
fi

JSON_INSTRUCTION='작업 완료 후 반드시 아래 JSON 형식으로만 응답해라:

```json
{
  "status": "done",
  "summary": "수행한 작업 요약",
  "files_modified": ["수정된 파일 경로"],
  "next_steps": ["다음 권장 작업"]
}
```

status 값: done | blocked | error | needs_review'

codex exec \
  -C "$PROJECT_ABS" \
  --full-auto \
  --output-last-message "$RESULT_FILE" \
  "${TASK}

${JSON_INSTRUCTION}" >/dev/null 2>&1

# JSON 추출 (```json 블록 파싱)
python3 - "$RESULT_FILE" << 'PYEOF'
import sys, json, re
content = open(sys.argv[1]).read()
match = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
if match:
    try:
        parsed = json.loads(match.group(1))
        # Codex가 summary 안에 JSON을 중첩시키는 경우 자동 언래핑
        s = parsed.get("summary", "")
        if isinstance(s, str) and s.strip().startswith("{"):
            try:
                inner = json.loads(s)
                if "summary" in inner:
                    parsed = inner
            except Exception:
                pass
        print(json.dumps(parsed, ensure_ascii=False, indent=2))
    except json.JSONDecodeError:
        print(json.dumps({"status": "error", "summary": "JSON 파싱 실패: " + match.group(1)[:200], "files_modified": [], "next_steps": []}, ensure_ascii=False, indent=2))
else:
    print(json.dumps({"status": "done", "summary": content.strip()[:300], "files_modified": [], "next_steps": []}, ensure_ascii=False, indent=2))
PYEOF

rm -f "$RESULT_FILE"
