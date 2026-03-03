---
slug: 부록-codex-orchestration
title: "Claude + Codex 오케스트레이션"
nav: Claude + Codex 오케스트레이션
order: 5
---

# Claude가 Codex를 부리는 법

Claude가 전략/조율을 맡고, Codex CLI가 실제 코드 실행을 담당하는 하이브리드 에이전트 패턴이야.

핵심은 간단해. Claude가 `codex exec` 명령을 쉘로 호출하고, Codex가 JSON으로 결과를 돌려주면, Claude가 그걸 보고 다음 명령을 내리는 거야.

```
Claude (오케스트레이터)
  │
  ├── 작업 분석 + 명령 생성
  │         ↓
  ├── codex exec ... (쉘 명령)
  │         ↓
  ├── JSON 응답 파싱
  │         ↓
  └── 다음 명령 결정 (반복)
```

---

## 왜 이렇게 해?

Claude가 직접 코드를 수정하면 그 내용이 전부 Claude 컨텍스트에 쌓여.
파일 10개 수정하면 10개 내용이 다 들어오거든.

Codex에 위임하면 Claude는 **요약(JSON)만** 받으면 되니까 컨텍스트를 훨씬 아낄 수 있어.

| 방식 | Claude 컨텍스트 부하 |
|------|-------------------|
| Claude가 직접 수정 | 수정한 코드 전체 포함 |
| Codex에 위임 | JSON 요약만 수신 |

---

## 어떻게 설치하냐

**Step 1.** 설치

```bash
npm install -g @openai/codex
```

**Step 2.** 설치 확인 + 동작 테스트

```bash
codex --version

# 간단한 smoke test — JSON 응답 오면 정상
codex exec --full-auto \
  --output-last-message /tmp/test.txt \
  "현재 디렉토리의 파일 목록을 알려주고, 아래 JSON으로만 응답해라:
\`\`\`json
{\"status\":\"done\",\"summary\":\"파일 목록 확인 완료\"}
\`\`\`"
cat /tmp/test.txt
```

**Step 3.** 모델 설정 (`~/.codex/config.toml`)

```toml
model = "o4-mini"
model_reasoning_effort = "high"
```

:::tip
`model` 값은 OpenAI 계정에서 접근 가능한 모델로 맞춰야 해. `codex --version`으로 현재 설치된 버전 확인 후 공식 문서에서 지원 모델 확인해봐.
:::

---

## exec에 어떤 플래그 쓰냐

`codex exec`는 비대화형(non-interactive) 실행 모드야. 스크립트에서 쓰는 거야.

```bash
# --full-auto: 확인 없이 자동 실행 (스크립트 기본값)
codex exec --full-auto "작업 내용"

# -C: 작업 디렉토리 지정
codex exec -C ./my-project --full-auto "작업 내용"

# --output-last-message: 최종 응답을 파일로 저장 (오케스트레이션 핵심!)
codex exec --full-auto \
  --output-last-message /tmp/result.txt \
  "작업 내용"

# --dangerously-bypass-approvals-and-sandbox: 완전 샌드박스 우회
# (CI/격리 환경 전용 — 로컬에선 --full-auto 권장)
codex exec --dangerously-bypass-approvals-and-sandbox "작업 내용"
```

:::tip
`-a` 플래그(승인 정책)는 대화형 `codex` 명령 전용이야. `codex exec`에서는 작동하지 않아.
:::

---

## JSON 응답은 어떻게 받냐

`--output-schema`로 구조화된 응답을 강제할 수 있는데, 일부 모델에서는 400 에러가 나.

대신 **프롬프트에 직접 JSON 형식을 명시**하는 방법이 안정적으로 작동해:

```bash
codex exec --full-auto \
  --output-last-message /tmp/result.txt \
  "작업 내용을 수행하고, 반드시 아래 JSON 형식으로만 응답해라:

\`\`\`json
{
  \"status\": \"done\",
  \"summary\": \"수행한 작업 요약\",
  \"files_modified\": [\"수정된 파일\"],
  \"next_steps\": [\"다음 권장 작업\"]
}
\`\`\`

status 값: done | blocked | error | needs_review"
```

Codex가 저 형식대로 응답하면, Claude가 `/tmp/result.txt`를 읽어서 파싱하는 거야.

---

## 매번 치기 귀찮으면?

매번 긴 플래그를 쓰기 번거로우니까 래퍼 스크립트를 만들어.

```bash
#!/usr/bin/env bash
# scripts/run-codex.sh
set -euo pipefail

PROJECT="${1:?프로젝트 경로 필요}"
TASK="${2:?작업 내용 필요}"
RESULT_FILE="/tmp/codex-result-$$.txt"

# 어디서 실행하든 동작하도록 절대경로 변환
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ABS="$REPO_ROOT/$PROJECT"

if [ ! -d "$PROJECT_ABS" ]; then
  echo '{"status":"error","summary":"디렉토리 없음: '"$PROJECT_ABS"'","files_modified":[],"next_steps":[]}'
  exit 1
fi

JSON_INSTRUCTION='작업 완료 후 아래 JSON 형식으로만 응답해라:

```json
{
  "status": "done",
  "summary": "수행한 작업 요약",
  "files_modified": ["수정된 파일"],
  "next_steps": ["다음 작업"]
}
```

status 값: done | blocked | error | needs_review'

codex exec \
  -C "$PROJECT_ABS" \
  --full-auto \
  --output-last-message "$RESULT_FILE" \
  "${TASK}

${JSON_INSTRUCTION}" >/dev/null 2>&1

# JSON 추출 (```json 블록 파싱) — python3 사용 (별도 설치 불필요)
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
```

```bash
chmod +x scripts/run-codex.sh
```

사용법:

```bash
bash scripts/run-codex.sh packages/backend "컴포넌트 리팩토링해줘"
# → JSON 출력
```

:::tip
**상대경로로 넘겨도 돼.** 스크립트 내부에서 레포 루트 기준 절대경로로 변환하거든.
프로젝트 루트 어디서든 실행 가능해.
:::

:::tip
**중첩 JSON 주의.** Codex가 가끔 `summary` 안에 JSON 전체를 또 넣어. 래퍼 스크립트의 파이썬 파서가 자동으로 감지해서 안쪽 JSON을 꺼내주니까 별도 처리는 필요 없어.
:::

---

## Claude가 어떻게 Codex를 쓰냐

### 기본: 단순 위임

```
사용자: "주문 취소 기능 만들어줘"

Claude:
1. 작업 분해
   - 백엔드: Order 모델 cancel 액션 추가
   - 프론트: 취소 버튼 + 모달 UI

2. 백엔드 Codex 호출 (Bash 도구)
   bash scripts/run-codex.sh packages/backend "Order cancel 액션 구현"

3. JSON 응답 확인
   {
     "status": "done",
     "files_modified": ["models/order.rb", "controllers/orders.rb"],
     "next_steps": ["spec 작성", "프론트 연동"]
   }

4. 프론트 Codex 호출
   bash scripts/run-codex.sh packages/frontend "취소 버튼 + 모달 UI 추가 (API: DELETE /orders/:id)"

5. 완료 보고
```

### 순차: 의존성 있는 작업

백엔드 → 프론트처럼 순서가 있을 때.
결과를 **파일로 저장**하고 python3으로 파싱해. `echo | python3` 파이프는 멀티라인 JSON에서 깨져:

```bash
# 1단계: 백엔드 → 파일로 저장
bash scripts/run-codex.sh packages/backend "API 구현" > /tmp/step1.json

STATUS=$(python3 -c "import json; print(json.load(open('/tmp/step1.json'))['status'])")
SUMMARY=$(python3 -c "import json; print(json.load(open('/tmp/step1.json'))['summary'])")

# 2단계: 완료 확인 후 프론트에 컨텍스트 전달
if [ "$STATUS" = "done" ]; then
  bash scripts/run-codex.sh packages/frontend \
    "백엔드 완료: $SUMMARY. 이에 맞게 프론트 구현."
else
  echo "백엔드 실패: $STATUS — $SUMMARY"
  exit 1
fi
```

:::warning
**`echo "$RESULT" | python3` 패턴은 쓰지 마.** Codex 결과 JSON이 멀티라인이거나 특수문자를 포함하면 파이프가 깨져. 항상 파일로 저장 후 `json.load(open(...))` 방식을 써.
:::

### 병렬: 독립적인 작업

서로 다른 파일/모듈을 건드리는 작업은 동시에 돌릴 수 있어:

```bash
bash scripts/run-codex.sh packages/module-a "..." > /tmp/a.json &
bash scripts/run-codex.sh packages/module-b "..." > /tmp/b.json &
wait

python3 -c "import json; print(json.load(open('/tmp/a.json'))['status'])"
python3 -c "import json; print(json.load(open('/tmp/b.json'))['status'])"
```

:::warning
**같은 파일을 건드리는 작업은 병렬 금지.** 덮어쓰기 발생해.
같은 패키지 내 작업도 병렬 금지 — 순서 보장이 안 돼.
:::

---

## 컨텍스트가 넘치면?

Claude 컨텍스트가 한계에 가까워지면 자동으로 압축하는 기능이야.
Codex 오케스트레이션처럼 결과 JSON이 계속 누적되는 작업에서 중요해.

**프로젝트 루트**의 `.claude/settings.json`:

```json
{
  "autoCompact": true
}
```

이렇게 하면 컨텍스트 한계 전에 자동 압축 → 장시간 작업이 끊기지 않아.

중간에 수동으로 압축하고 싶으면 `/compact` 명령에 요약을 붙여서:

```
/compact 백엔드 Order 취소 기능 완료. 다음은 프론트 작업.
```

---

## Claude가 직접 코드 건드리면?

Claude가 습관적으로 직접 파일을 수정하려 할 수 있어. 명시적으로 역할을 알려줘:

```
"코드 수정은 Codex에게 위임해.
bash scripts/run-codex.sh 로 실행하고, JSON 결과를 받아서 다음 단계를 결정해.
파일을 직접 열거나 수정하지 마."
```

아니면 `AGENTS.md`나 `CLAUDE.md`에 박아놓으면 매번 말 안 해도 돼:

```markdown
## 코드 수정 원칙
멀티파일 변경은 `bash scripts/run-codex.sh`로 Codex에 위임한다.
직접 파일 수정 금지.
```

---

## 한 줄 정리

| 전략 | 효과 |
|------|------|
| `autoCompact: true` | 장시간 세션 지속 |
| Codex에게 실행 위임 | Claude 컨텍스트에 코드 안 쌓임 |
| `--output-last-message` | 최종 결과만 파싱 (JSONL 전체 X) |
| `/compact` 중간 삽입 | 완료된 단계 압축 |
| JSON `summary`만 전달 | 전체 응답 대신 요약만 컨텍스트에 |

Claude는 생각하고, Codex는 실행하고, JSON으로 대화해. 이게 컨텍스트 안 터지는 유일한 방법이야.
