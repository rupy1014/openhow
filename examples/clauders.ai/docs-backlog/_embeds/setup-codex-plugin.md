---
hidden: true
---

# Codex 플러그인 + 오케스트레이션 세팅

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.

---

=== 여기서부터 복사 ===

OpenAI Codex 플러그인을 설치하고, Claude가 오케스트레이터(기획/분석/퇴고), Codex가 실행자(코딩)를 담당하는 환경을 만들어줘.

공식 레포: https://github.com/openai/codex-plugin-cc

## 1. Codex CLI 설치

`codex --version`으로 설치 여부 확인해줘. 없으면:

```bash
npm install -g @openai/codex
```

설치 후 `codex --version`으로 확인.

## 2. 플러그인 설치

`/plugin` 명령은 사용자가 직접 입력해야 해. 아래 3줄을 **순서대로 입력하라고 안내**해줘:

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
```

3개 다 입력했으면 `/codex:setup`으로 확인하라고 알려줘. 로그인이 안 돼 있으면 터미널에서 `codex login`을 실행하라고 안내해줘.

## 3. 래퍼 스크립트 생성

`~/.claude/scripts/cowork-run.sh` 파일을 아래 내용으로 생성해줘. 이 스크립트가 Codex를 sub-agent로 격리 호출해.

```bash
#!/bin/bash
# cowork-run.sh — Codex sub-agent runner (격리 호출)
#
# Claude 컨텍스트를 오염시키지 않고 Codex를 격리 호출한다.
# 프롬프트 파일 → Codex 호출 → 결과 파일 저장 → JSON 상태만 반환.
#
# Usage:
#   cowork-run.sh task <prompt_file> [--background] [--resume-last]
#   cowork-run.sh review [--base <ref>]
#   cowork-run.sh status
#   cowork-run.sh result
#
# Examples:
#   # 프롬프트 파일로 task 위임
#   cowork-run.sh task /tmp/cowork_step1.md
#
#   # 백그라운드로 task 위임
#   cowork-run.sh task /tmp/cowork_step1.md --background
#
#   # 이전 세션 이어서 수정 위임
#   cowork-run.sh task /tmp/cowork_fix.md --resume-last
#
#   # 리뷰 실행
#   cowork-run.sh review

set -euo pipefail

CODEX_SCRIPT="${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/plugins/marketplaces/openai-codex/plugins/codex}/scripts/codex-companion.mjs"
COWORK_DIR="/tmp/cowork"
mkdir -p "$COWORK_DIR"

MODE="${1:?Usage: $0 <task|review|status|result> [args...]}"
shift

# ============================================================
# task — 프롬프트 파일 기반 Codex 호출
# ============================================================
if [ "$MODE" = "task" ]; then
  PROMPT_FILE="${1:?Missing prompt file path}"
  shift

  if [ ! -f "$PROMPT_FILE" ]; then
    echo '{"status":"error","message":"Prompt file not found: '"$PROMPT_FILE"'"}'
    exit 1
  fi

  # Parse optional flags
  EXTRA_FLAGS="--write"
  for arg in "$@"; do
    case "$arg" in
      --background) EXTRA_FLAGS="$EXTRA_FLAGS --background" ;;
      --resume-last) EXTRA_FLAGS="$EXTRA_FLAGS --resume-last" ;;
      --resume) EXTRA_FLAGS="$EXTRA_FLAGS --resume" ;;
      --fresh) EXTRA_FLAGS="$EXTRA_FLAGS --fresh" ;;
    esac
  done

  PROMPT_CONTENT=$(cat "$PROMPT_FILE")
  PROMPT_LINES=$(wc -l < "$PROMPT_FILE" | tr -d ' ')
  PROMPT_BYTES=$(wc -c < "$PROMPT_FILE" | tr -d ' ')
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  RESULT_FILE="${COWORK_DIR}/result_${TIMESTAMP}.txt"
  ERROR_FILE="${COWORK_DIR}/error_${TIMESTAMP}.txt"

  echo "[cowork] Calling Codex: ${PROMPT_LINES} lines, ${PROMPT_BYTES} bytes, flags: ${EXTRA_FLAGS}" >&2

  # Codex 호출 — stdin으로 프롬프트 전달, 결과는 파일로
  if node "$CODEX_SCRIPT" task $EXTRA_FLAGS "$PROMPT_CONTENT" > "$RESULT_FILE" 2>"$ERROR_FILE"; then
    RESULT_LINES=$(wc -l < "$RESULT_FILE" | tr -d ' ')
    RESULT_BYTES=$(wc -c < "$RESULT_FILE" | tr -d ' ')

    # 결과 요약 추출 (첫 5줄 + 변경 파일 목록)
    SUMMARY=$(head -5 "$RESULT_FILE" | tr '\n' ' ' | cut -c1-200)

    cat << STATUS
{
  "status": "success",
  "mode": "task",
  "prompt_file": "${PROMPT_FILE}",
  "prompt_lines": ${PROMPT_LINES},
  "result_file": "${RESULT_FILE}",
  "result_lines": ${RESULT_LINES},
  "result_bytes": ${RESULT_BYTES},
  "summary": "$(echo "$SUMMARY" | sed 's/"/\\"/g')",
  "flags": "${EXTRA_FLAGS}"
}
STATUS
  else
    EXIT_CODE=$?
    CODEX_ERR=$(cat "$ERROR_FILE" 2>/dev/null | head -5 | tr '\n' ' ' | cut -c1-200)
    cat << STATUS
{
  "status": "error",
  "mode": "task",
  "exit_code": ${EXIT_CODE},
  "error": "$(echo "$CODEX_ERR" | sed 's/"/\\"/g')",
  "result_file": "${RESULT_FILE}",
  "error_file": "${ERROR_FILE}"
}
STATUS
  fi

# ============================================================
# review — Codex 리뷰 실행
# ============================================================
elif [ "$MODE" = "review" ]; then
  EXTRA_FLAGS=""
  for arg in "$@"; do
    case "$arg" in
      --base) shift; EXTRA_FLAGS="$EXTRA_FLAGS --base $1" ;;
      --background) EXTRA_FLAGS="$EXTRA_FLAGS --background" ;;
    esac
  done

  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  RESULT_FILE="${COWORK_DIR}/review_${TIMESTAMP}.txt"
  ERROR_FILE="${COWORK_DIR}/review_error_${TIMESTAMP}.txt"

  echo "[cowork] Running Codex review..." >&2

  if node "$CODEX_SCRIPT" review $EXTRA_FLAGS > "$RESULT_FILE" 2>"$ERROR_FILE"; then
    RESULT_LINES=$(wc -l < "$RESULT_FILE" | tr -d ' ')
    SUMMARY=$(head -10 "$RESULT_FILE" | tr '\n' ' ' | cut -c1-300)

    cat << STATUS
{
  "status": "success",
  "mode": "review",
  "result_file": "${RESULT_FILE}",
  "result_lines": ${RESULT_LINES},
  "summary": "$(echo "$SUMMARY" | sed 's/"/\\"/g')"
}
STATUS
  else
    EXIT_CODE=$?
    CODEX_ERR=$(cat "$ERROR_FILE" 2>/dev/null | head -5 | tr '\n' ' ' | cut -c1-200)
    cat << STATUS
{
  "status": "error",
  "mode": "review",
  "exit_code": ${EXIT_CODE},
  "error": "$(echo "$CODEX_ERR" | sed 's/"/\\"/g')",
  "result_file": "${RESULT_FILE}"
}
STATUS
  fi

# ============================================================
# status — 현재 작업 상태 확인
# ============================================================
elif [ "$MODE" = "status" ]; then
  node "$CODEX_SCRIPT" status 2>/dev/null

# ============================================================
# result — 마지막 작업 결과 확인
# ============================================================
elif [ "$MODE" = "result" ]; then
  RESULT_FILE=$(ls -t "${COWORK_DIR}"/result_*.txt 2>/dev/null | head -1)
  if [ -n "$RESULT_FILE" ]; then
    RESULT_LINES=$(wc -l < "$RESULT_FILE" | tr -d ' ')
    RESULT_BYTES=$(wc -c < "$RESULT_FILE" | tr -d ' ')
    SUMMARY=$(head -10 "$RESULT_FILE" | tr '\n' ' ' | cut -c1-300)
    cat << STATUS
{
  "status": "success",
  "result_file": "${RESULT_FILE}",
  "result_lines": ${RESULT_LINES},
  "result_bytes": ${RESULT_BYTES},
  "summary": "$(echo "$SUMMARY" | sed 's/"/\\"/g')"
}
STATUS
  else
    echo '{"status":"error","message":"No recent results found"}'
  fi

else
  echo '{"status":"error","message":"Unknown mode: '"$MODE"'. Use: task|review|status|result"}'
  exit 1
fi
```

생성 후 `chmod +x ~/.claude/scripts/cowork-run.sh` 실행.

## 4. 오케스트레이션 커맨드 생성

아래 URL에서 최신 cowork.md를 다운로드해서 `~/.claude/commands/cowork.md`로 저장해줘:

```bash
curl -fsSL "https://raw.githubusercontent.com/rupy1014/openhow/main/examples/clauders.ai/docs/_embeds/cowork-latest.md" -o ~/.claude/commands/cowork.md
```

다운로드가 안 되면 아래 내용으로 직접 생성해줘:

````markdown
---
description: Claude가 기획/분석하고 Codex가 구현하는 오케스트레이션 워크플로우. 대화 문맥에서 작업을 추론하거나, 명시적 지시를 받는다.
argument-hint: "[작업 설명 — 생략하면 대화 문맥에서 추론]"
allowed-tools: Read, Glob, Grep, Bash(node:*), Bash(git:*), Bash(bash:*), Agent, AskUserQuestion
---

# Cowork — 오케스트레이션 모드

당신은 **오케스트레이터**다. 코드를 직접 수정하지 않는다. 분석하고, 계획하고, Codex에 위임하고, 결과를 검증한다.

래퍼 스크립트:
```
COWORK="$HOME/.claude/scripts/cowork-run.sh"
```

모든 Codex 호출에서 이 래퍼를 사용한다. **`codex-companion.mjs`를 직접 호출하지 마라.**

## 격리 원칙 (중요)

Codex는 **sub-agent**로 동작한다. Claude 컨텍스트 오염 방지를 위해:

1. **프롬프트는 반드시 파일로** — Bash 인라인에 프롬프트를 넣지 않는다. `/tmp/cowork_step{N}.md`에 쓰고 파일 경로만 전달
2. **Claude는 JSON 상태만 받는다** — cowork-run.sh의 stdout은 JSON 상태 객체뿐
3. **Codex 결과는 필요할 때만 Read로** — result_file 경로를 받아서 필요한 부분만 읽는다
4. **git diff로 검증한다** — Codex 응답 전문 대신 `git diff --stat`으로 변경 사항을 확인

---

## Phase 0: 작업 파악

사용자 요청:
`$ARGUMENTS`

**$ARGUMENTS가 비어있거나 모호하면:**
- 대화 흐름에서 "다음으로 구현해야 할 것"을 추론
- `AskUserQuestion`으로 확인: "이 작업을 진행할까요? → [작업 설명]"
  - `네, 진행해주세요 (Recommended)`
  - `아니요, 다른 작업을 할게요`

**$ARGUMENTS가 명확하면:** 바로 Phase 1로.

## Phase 1: 분석 & 계획

**여기서 잘못 분석하면 뒤가 다 틀어진다.** 충분히 시간을 들여라.

코드를 직접 수정하지 말고, **읽기 전용**으로 분석한다:

1. `Glob`, `Grep`, `Read`로 관련 파일과 구조를 파악한다.
2. 프로젝트의 CLAUDE.md, 아키텍처 문서를 참고한다.
3. **핵심 코드 스니펫을 수집한다** — 각 스텝에서 Codex가 참고할 10~20줄짜리 코드 조각을 미리 뽑아둔다.
4. 작업을 **원자적 단위**로 분해한다 (최대 5개 스텝).

사용자에게 계획을 보여줘라:

```
## 작업 계획

**목표**: [한 문장]

| # | 스텝 | Codex에 위임할 내용 | 검증 기준 |
|---|------|-------------------|----------|
| 1 | ... | ... | ... |
| 2 | ... | ... | ... |
```

`AskUserQuestion`으로 확인:
- `계획대로 진행 (Recommended)`
- `계획 수정이 필요해요`

## Phase 2: Codex 위임 실행 (격리)

각 스텝마다 아래 루프를 실행한다:

### 2a. 프롬프트 파일 작성

스텝별로 `/tmp/cowork_step{N}.md` 파일을 **Write 도구로** 생성한다:

```markdown
TASK: [원자적 목표 — 한 문장]

EXPECTED: [성공 기준 — 기계적으로 검증 가능한 것]

MUST NOT: [금지 행동 — 아키텍처 제약, 스타일 규칙 등]

CONTEXT:
[Phase 1에서 수집한 핵심 코드 스니펫 10~20줄 + 파일 경로]

VERIFY: [Codex가 완료 전에 스스로 실행할 검증 커맨드]
```

**CONTEXT 규칙**: 파일 경로만 넘기면 Codex가 파일을 읽느라 토큰을 낭비한다. 관련 코드 스니펫을 직접 넣어라.

**VERIFY 규칙**: Codex가 돌려주기 전에 스스로 검증하게 만든다. 테스트가 없으면 `VERIFY: 수정된 파일에서 lint 에러가 없는지 확인` 정도라도 넣어라.

### 2b. Codex 격리 호출

```bash
COWORK="$HOME/.claude/scripts/cowork-run.sh" && bash "$COWORK" task /tmp/cowork_step1.md
```

**Claude가 받는 것은 JSON 상태뿐:**
```json
{
  "status": "success",
  "mode": "task",
  "prompt_file": "/tmp/cowork_step1.md",
  "prompt_lines": 25,
  "result_file": "/tmp/cowork/result_20260406_143022.txt",
  "result_lines": 80,
  "result_bytes": 3200,
  "summary": "Modified 3 files...",
  "flags": "--write"
}
```

**옵션:**
- 오래 걸릴 작업: `bash "$COWORK" task /tmp/cowork_step1.md --background`
- 이전 세션 이어서 수정: `bash "$COWORK" task /tmp/cowork_fix.md --resume-last`
- **파이프라이닝**: Codex 실행 중에 다음 스텝 프롬프트를 미리 Write로 준비

### 2c. 결과 검증 & 퇴고

Codex 완료 후:

1. `git diff --stat`으로 변경된 파일과 변경량 확인
2. **변경량 이상 감지**: 삽입 대비 삭제가 현저히 적으면 중복 코드나 불필요한 추가를 의심
3. 변경된 핵심 파일을 `Read`로 읽고 검증:
   - EXPECTED 기준 충족?
   - MUST NOT 위반 없는가?
   - 프로젝트 컨벤션 준수?
   - **중복 코드**: 같은 로직 2곳 이상 → 공통 헬퍼 추출 위임
   - **과도한 변경**: 요청 범위 초과 → 롤백 위임
4. **이슈가 있으면 수정 프롬프트를 파일로 작성**하고 Codex에 재위임:

```bash
# /tmp/cowork_fix1.md 를 Write로 작성한 후:
COWORK="$HOME/.claude/scripts/cowork-run.sh" && bash "$COWORK" task /tmp/cowork_fix1.md --resume-last
```

5. **이슈 발견 → 수정 위임 → 재검증** 루프를 최대 3회 반복.

### 2d. 스텝 전환

- **통과**: 다음 스텝으로 진행
- **3회 연속 실패**: 해당 스텝을 포기하고 사용자에게 보고. 사용자가 원하면 Claude가 직접 수정.

## Phase 3: 퇴고 & 최종 리뷰

모든 스텝 완료 후:

1. `git diff --stat`으로 전체 변경 요약
2. Codex 리뷰 격리 실행:

```bash
COWORK="$HOME/.claude/scripts/cowork-run.sh" && bash "$COWORK" review
```

3. 리뷰 결과는 `result_file`을 Read로 확인. **이슈가 있으면 수정 프롬프트를 파일로 작성**하고 위임:

```bash
# /tmp/cowork_review_fix.md 를 Write로 작성한 후:
COWORK="$HOME/.claude/scripts/cowork-run.sh" && bash "$COWORK" task /tmp/cowork_review_fix.md
```

4. 사용자에게 **코드 완료 보고** 후 Phase 4를 백그라운드로 실행:

```
## 코드 완료

**목표**: [한 문장]
**변경 파일**: N개
**주요 변경**:
- file1: 무엇을 했는지
- file2: 무엇을 했는지

**퇴고**: N회 수정 반복 / 리뷰 이슈 N개 해결
**검증 상태**: 모든 스텝 통과 / N개 이슈 남음
```

## Phase 4: 문서 정리 (백그라운드)

**이 Phase는 `--background`로 실행한다.**

### 4a. 관련 문서 탐색

1. 변경된 기능/모듈/개념에서 키워드 추출
2. `Grep`으로 docs/, CLAUDE.md, README 등에서 관련 md 파일 탐색
3. 관련 md 있으면 수정, 없으면 새 md 생성

### 4b. 문서 수정 규칙

| 조건 | 행동 |
|------|------|
| 관련 md 존재, 1,000줄 미만 | 기존 파일에 추가/수정 |
| 관련 md 존재, 1,000줄 이상 | 분할 |
| 관련 md 없음 | 가장 가까운 폴더에 새 md |
| 같은 주제 md 3개 이상 | 폴더로 묶기 |

### 4c. Codex에 문서 수정 위임 (격리)

```bash
# /tmp/cowork_docs.md 를 Write로 작성한 후:
COWORK="$HOME/.claude/scripts/cowork-run.sh" && bash "$COWORK" task /tmp/cowork_docs.md --background
```

### 4d. 대청소 (조건부)

문서 수정 후, 아래 조건 중 하나라도 해당하면 대청소 실행:
- 1,000줄 넘는 md 존재
- md 10개 이상인 폴더 존재
- 최근 2주간 docs 변경 커밋 5개 이상

**모두 해당 없으면**: 대청소 스킵.

대청소는 `AskUserQuestion`으로 사용자 승인 후 Codex에 위임.

### 4e. 백그라운드 완료 알림

```
문서 정리 완료: [수정된 md 파일 목록]
대청소: 실행함 (합치기 N건, 분할 N건) / 스킵
```

## 핵심 규칙

- **Claude는 코드를 직접 수정하지 않는다.** Edit, Write 도구는 프롬프트 파일 작성에만 사용.
- 분석/검증에만 Read, Glob, Grep을 사용한다.
- 모든 코드 변경은 `cowork-run.sh task`를 통해서만.
- **Codex 프롬프트는 반드시 파일로** — Bash 인라인에 프롬프트를 넣지 않는다.
- **Codex 결과는 JSON 상태로만 받는다** — 상세 내용은 필요할 때 result_file을 Read.
- md 파일은 1,000줄을 넘기지 않는다. 넘으면 분할.
- Codex가 사용 불가하면 사용자에게 알리고, 직접 코딩 전환 여부를 물어라.
- 각 스텝 사이에 불필요한 지연을 넣지 마라.
````

## 완료 확인

모든 단계가 끝나면 아래를 알려줘:
1. `codex --version` 결과
2. `/codex:setup` 결과
3. `~/.claude/scripts/cowork-run.sh` 파일 생성 확인
4. `~/.claude/commands/cowork.md` 파일 생성 확인

=== 여기까지 복사 ===

---

## 세팅 후 사용법

### 오케스트레이션 모드 (Claude 기획 + Codex 코딩 + 퇴고)
```
/cowork 결제 취소 API 만들어줘
```
또는 대화하다가 그냥:
```
/cowork
```
→ 대화 문맥에서 다음 작업을 추론해서 물어봄.

### 단순 위임 (Codex에 직접 넘기기)
```
/codex:rescue 테스트 실패 원인 조사해줘
```

### 코드 리뷰
```
/codex:review
/codex:adversarial-review --background
```

Codex가 안 되면 Claude가 직접 해. 따로 명령 안 해도 돼.
