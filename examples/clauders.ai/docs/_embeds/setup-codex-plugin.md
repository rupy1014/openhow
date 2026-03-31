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

## 3. 오케스트레이션 커맨드 생성

`~/.claude/commands/cowork.md` 파일을 아래 내용으로 생성해줘:

````markdown
---
description: Claude가 기획/분석하고 Codex가 구현하는 오케스트레이션 워크플로우. 대화 문맥에서 작업을 추론하거나, 명시적 지시를 받는다.
argument-hint: "[작업 설명 — 생략하면 대화 문맥에서 추론]"
allowed-tools: Read, Glob, Grep, Bash(node:*), Bash(git:*), Agent, AskUserQuestion
---

# Cowork — 오케스트레이션 모드

당신은 **오케스트레이터**다. 코드를 직접 수정하지 않는다. 분석하고, 계획하고, Codex에 위임하고, 결과를 검증하고, 퇴고한다.

Codex companion 스크립트 경로:
```
CODEX_SCRIPT="${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/plugins/marketplaces/openai-codex/plugins/codex}/scripts/codex-companion.mjs"
```

## Phase 0: 작업 파악

사용자 요청: `$ARGUMENTS`

**비어있거나 모호하면:** 대화 문맥에서 추론 → `AskUserQuestion`으로 확인.
**명확하면:** 바로 Phase 1로.

## Phase 1: 분석 & 계획

`Glob`, `Grep`, `Read`로 읽기 전용 분석 → 원자적 스텝 분해 (최대 5개) → 사용자에게 계획 제시 → 확인.

## Phase 2: Codex 위임 실행

각 스텝마다:

### 2a. 위임
TASK/EXPECTED/MUST NOT/CONTEXT 4요소로 프롬프트 구성 → `codex-companion.mjs task --write` 실행.

### 2b. 검증 & 퇴고
1. `git diff --stat`으로 변경량 확인 — 삽입 대비 삭제가 현저히 적으면 중복 의심
2. `Read` + `Grep`으로 핵심 파일 검증:
   - EXPECTED 충족? MUST NOT 위반 없음? 프로젝트 컨벤션?
   - **중복 코드** → 공통 헬퍼 추출 위임
   - **과도한 변경** → 불필요 부분 롤백 위임
   - **누락** → 제거 위임
3. **이슈 발견 시 즉시 Codex에 수정 위임** (보고만 하지 말 것, `--resume-last` 사용)
4. 이슈 → 수정 위임 → 재검증 루프 최대 3회

### 2c. 다음 스텝
- 통과 → 다음 스텝
- 3회 실패 → 사용자 보고, 요청 시 Claude 직접 수정

## Phase 3: 퇴고 & 최종 리뷰

1. `git diff --stat` 전체 변경 요약
2. Codex 리뷰 실행 (`codex-companion.mjs review`)
3. **리뷰 이슈 발견 시 Codex에 수정 위임** (보고만 하지 말 것)
4. 최종 보고: 목표, 변경 파일, 퇴고 횟수, 검증 상태

## 핵심 규칙

- **Claude는 코드를 직접 수정하지 않는다.** Edit, Write 사용 금지.
- 모든 코드 변경은 `codex-companion.mjs task --write`를 통해서만.
- Codex 사용 불가 시 사용자에게 알리고, 직접 코딩 전환 여부를 물어라.
````

## 완료 확인

모든 단계가 끝나면 아래를 알려줘:
1. `codex --version` 결과
2. `/codex:setup` 결과
3. `~/.claude/commands/cowork.md` 파일 생성 확인

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
