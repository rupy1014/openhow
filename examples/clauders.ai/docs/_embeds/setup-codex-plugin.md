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

set -euo pipefail

CODEX_SCRIPT="${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/plugins/marketplaces/openai-codex/plugins/codex}/scripts/codex-companion.mjs"
COWORK_DIR="/tmp/cowork"
mkdir -p "$COWORK_DIR"

MODE="${1:?Usage: $0 <task|review|status|result> [args...]}"
shift

if [ "$MODE" = "task" ]; then
  PROMPT_FILE="${1:?Missing prompt file path}"
  shift
  EXTRA_FLAGS="--write"
  for arg in "$@"; do
    case "$arg" in
      --background) EXTRA_FLAGS="$EXTRA_FLAGS --background" ;;
      --resume-last) EXTRA_FLAGS="$EXTRA_FLAGS --resume-last" ;;
      --resume) EXTRA_FLAGS="$EXTRA_FLAGS --resume" ;;
      --fresh) EXTRA_FLAGS="$EXTRA_FLAGS --fresh" ;;
    esac
  done
  [ ! -f "$PROMPT_FILE" ] && echo '{"status":"error","message":"Prompt file not found"}' && exit 1
  PROMPT_CONTENT=$(cat "$PROMPT_FILE")
  PROMPT_LINES=$(wc -l < "$PROMPT_FILE" | tr -d ' ')
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  RESULT_FILE="${COWORK_DIR}/result_${TIMESTAMP}.txt"
  ERROR_FILE="${COWORK_DIR}/error_${TIMESTAMP}.txt"
  if node "$CODEX_SCRIPT" task $EXTRA_FLAGS "$PROMPT_CONTENT" > "$RESULT_FILE" 2>"$ERROR_FILE"; then
    RESULT_LINES=$(wc -l < "$RESULT_FILE" | tr -d ' ')
    RESULT_BYTES=$(wc -c < "$RESULT_FILE" | tr -d ' ')
    SUMMARY=$(head -5 "$RESULT_FILE" | tr '\n' ' ' | cut -c1-200)
    cat << STATUS
{"status":"success","mode":"task","result_file":"${RESULT_FILE}","result_lines":${RESULT_LINES},"result_bytes":${RESULT_BYTES},"summary":"$(echo "$SUMMARY" | sed 's/"/\\"/g')","flags":"${EXTRA_FLAGS}"}
STATUS
  else
    EXIT_CODE=$?
    CODEX_ERR=$(cat "$ERROR_FILE" 2>/dev/null | head -5 | tr '\n' ' ' | cut -c1-200)
    cat << STATUS
{"status":"error","mode":"task","exit_code":${EXIT_CODE},"error":"$(echo "$CODEX_ERR" | sed 's/"/\\"/g')","result_file":"${RESULT_FILE}"}
STATUS
  fi

elif [ "$MODE" = "review" ]; then
  TIMESTAMP=$(date +%Y%m%d_%H%M%S)
  RESULT_FILE="${COWORK_DIR}/review_${TIMESTAMP}.txt"
  ERROR_FILE="${COWORK_DIR}/review_error_${TIMESTAMP}.txt"
  if node "$CODEX_SCRIPT" review "$@" > "$RESULT_FILE" 2>"$ERROR_FILE"; then
    RESULT_LINES=$(wc -l < "$RESULT_FILE" | tr -d ' ')
    SUMMARY=$(head -10 "$RESULT_FILE" | tr '\n' ' ' | cut -c1-300)
    cat << STATUS
{"status":"success","mode":"review","result_file":"${RESULT_FILE}","result_lines":${RESULT_LINES},"summary":"$(echo "$SUMMARY" | sed 's/"/\\"/g')"}
STATUS
  else
    EXIT_CODE=$?
    echo '{"status":"error","mode":"review","exit_code":'$EXIT_CODE'}'
  fi

elif [ "$MODE" = "status" ]; then
  node "$CODEX_SCRIPT" status 2>/dev/null

elif [ "$MODE" = "result" ]; then
  RESULT_FILE=$(ls -t "${COWORK_DIR}"/result_*.txt 2>/dev/null | head -1)
  if [ -n "$RESULT_FILE" ]; then
    RESULT_LINES=$(wc -l < "$RESULT_FILE" | tr -d ' ')
    SUMMARY=$(head -10 "$RESULT_FILE" | tr '\n' ' ' | cut -c1-300)
    echo '{"status":"success","result_file":"'"${RESULT_FILE}"'","result_lines":'${RESULT_LINES}'}'
  else
    echo '{"status":"error","message":"No recent results found"}'
  fi
else
  echo '{"status":"error","message":"Unknown mode: '"$MODE"'"}'
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

1. **프롬프트는 반드시 파일로** — `/tmp/cowork_step{N}.md`에 Write로 작성하고 파일 경로만 전달
2. **Claude는 JSON 상태만 받는다** — cowork-run.sh의 stdout은 JSON 상태 객체뿐
3. **Codex 결과는 필요할 때만 Read로** — result_file 경로를 받아서 필요한 부분만 읽는다
4. **git diff로 검증한다** — Codex 응답 전문 대신 `git diff --stat`으로 변경 사항을 확인

## Phase 0: 작업 파악

사용자 요청: `$ARGUMENTS`

**비어있거나 모호하면:** 대화 문맥에서 추론 → `AskUserQuestion`으로 확인.
**명확하면:** 바로 Phase 1로.

## Phase 1: 분석 & 계획

이 Phase가 전체 작업의 방향을 결정한다. **여기서 잘못 분석하면 뒤가 다 틀어진다.**

코드를 직접 수정하지 말고, **읽기 전용**으로 분석한다:

1. `Glob`, `Grep`, `Read`로 관련 파일과 구조를 파악한다.
2. 프로젝트의 CLAUDE.md, 아키텍처 문서를 참고한다.
3. **핵심 코드 스니펫을 수집한다** — 각 스텝에서 Codex가 참고할 10~20줄짜리 코드 조각을 미리 뽑아둔다.
4. 작업을 **원자적 단위**로 분해한다 (최대 5개 스텝).

사용자에게 계획을 보여주고 `AskUserQuestion`으로 확인.

## Phase 2: Codex 위임 실행 (격리)

각 스텝마다:

### 2a. 프롬프트 파일 작성

Write 도구로 `/tmp/cowork_step{N}.md`를 생성:

```
TASK: [원자적 목표 — 한 문장]
EXPECTED: [성공 기준 — 기계적으로 검증 가능한 것]
MUST NOT: [금지 행동]
CONTEXT: [핵심 코드 스니펫 10~20줄 + 파일 경로]
VERIFY: [Codex가 완료 전 실행할 검증 커맨드]
```

### 2b. Codex 격리 호출

```bash
COWORK="$HOME/.claude/scripts/cowork-run.sh" && bash "$COWORK" task /tmp/cowork_step1.md
```

오래 걸리면: `bash "$COWORK" task /tmp/cowork_step1.md --background`
수정 위임: `bash "$COWORK" task /tmp/cowork_fix.md --resume-last`

### 2c. 결과 검증 & 퇴고

1. `git diff --stat`으로 변경 확인
2. 변경된 핵심 파일을 `Read`로 검증
3. 이슈 발견 시 수정 프롬프트를 파일로 작성 → Codex 재위임 (최대 3회)

### 2d. 스텝 전환

- 통과 → 다음 스텝
- 3회 실패 → 사용자 보고

## Phase 3: 퇴고 & 최종 리뷰

1. `git diff --stat` 전체 변경 요약
2. 검증 방법 선택:
   - Codex 리뷰: `bash "$COWORK" review`
   - Claude 리뷰 에이전트: `Agent(subagent_type="Explore")` — 교차 검증이 필요할 때
   - 복잡한 변경은 둘 다 실행
3. 리뷰 이슈 발견 시 수정 프롬프트 파일 → Codex 재위임
4. 사용자에게 코드 완료 보고

## Phase 4: 문서 정리 (백그라운드)

`--background`로 실행.

1. 변경된 기능 키워드로 관련 md 탐색
2. 기존 md 우선 수정 (없을 때만 새 파일)
3. 1,000줄 이상이면 분할 / 같은 주제 3개 이상이면 폴더 묶기
4. Codex에 문서 수정 위임 (`bash "$COWORK" task /tmp/cowork_docs.md --background`)

## 핵심 규칙

- **Claude는 코드를 직접 수정하지 않는다.** Edit, Write는 프롬프트 파일 작성에만 사용.
- 분석/검증에만 Read, Glob, Grep을 사용한다.
- 모든 코드 변경은 `cowork-run.sh task`를 통해서만.
- **Codex 프롬프트는 반드시 파일로** — Bash 인라인 금지.
- **Codex 결과는 JSON 상태로만 받는다** — 상세 내용은 필요할 때 result_file을 Read.
- Codex 사용 불가 시 사용자에게 알리고, 직접 코딩 전환 여부를 물어라.
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
