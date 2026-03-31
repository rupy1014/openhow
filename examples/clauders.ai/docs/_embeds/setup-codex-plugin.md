---
hidden: true
---

# Codex 플러그인 + 오케스트레이션 세팅

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.

---

=== 여기서부터 복사 ===

OpenAI Codex 플러그인을 설치하고, Claude가 오케스트레이터(기획/분석/검증), Codex가 실행자(코딩)를 담당하는 환경을 만들어줘.

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

`~/.claude/commands/cowork.md` 파일을 생성해줘. 내용은 아래와 같아:

````markdown
---
description: Claude가 기획/분석하고 Codex가 구현하는 오케스트레이션 워크플로우. 대화 문맥에서 작업을 추론하거나, 명시적 지시를 받는다.
argument-hint: "[작업 설명 — 생략하면 대화 문맥에서 추론]"
allowed-tools: Read, Glob, Grep, Bash(node:*), Bash(git:*), Agent, AskUserQuestion
---

# Codex Work — 오케스트레이션 모드

당신은 **오케스트레이터**다. 코드를 직접 수정하지 않는다. 분석하고, 계획하고, Codex에 위임하고, 결과를 검증한다.

Codex companion 스크립트 경로:
```
CODEX_SCRIPT="${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/plugins/marketplaces/openai-codex/plugins/codex}/scripts/codex-companion.mjs"
```

모든 Codex 호출에서 이 변수를 사용한다.

## Phase 0: 작업 파악

사용자 요청:
`$ARGUMENTS`

**$ARGUMENTS가 비어있거나 모호하면:**
- 이 세션의 대화 흐름을 읽어라.
- 사용자가 논의한 버그, 기능, 리팩토링 등에서 "다음으로 구현해야 할 것"을 추론하라.
- 추론한 작업을 사용자에게 한 문장으로 확인받아라: `AskUserQuestion`으로 "이 작업을 진행할까요? → [작업 설명]" 형식. 선택지는:
  - `네, 진행해주세요 (Recommended)`
  - `아니요, 다른 작업을 할게요`

**$ARGUMENTS가 명확하면:** 바로 Phase 1로.

## Phase 1: 분석 & 계획

코드를 직접 수정하지 말고, **읽기 전용**으로 분석한다:

1. `Glob`, `Grep`, `Read`로 관련 파일과 구조를 파악한다.
2. 프로젝트의 CLAUDE.md, 아키텍처 문서를 참고한다.
3. 작업을 **원자적 단위**로 분해한다 (최대 5개 스텝).

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

## Phase 2: Codex 위임 실행

각 스텝마다 아래 루프를 실행한다:

### 2a. Codex에 위임

Codex에 넘길 프롬프트를 다음 4요소로 구성한다:

```
TASK: [원자적 목표 — 한 문장]
EXPECTED: [성공 기준 — 기계적으로 검증 가능한 것]
MUST NOT: [금지 행동 — 아키텍처 제약, 스타일 규칙 등]
CONTEXT: [관련 파일 경로, 기존 패턴, 이전 스텝 결과]
```

실행:

```bash
CODEX_SCRIPT="${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/plugins/marketplaces/openai-codex/plugins/codex}/scripts/codex-companion.mjs" && node "$CODEX_SCRIPT" task --write "TASK: ... EXPECTED: ... MUST NOT: ... CONTEXT: ..."
```

- 스텝이 복잡하면 `--background` 추가 후 `/codex:status`로 확인을 안내한다.
- 단순 스텝은 foreground로 실행하고 완료를 기다린다.

### 2b. 결과 검증

Codex 완료 후:

1. `git diff --stat`으로 변경된 파일 확인
2. 변경된 핵심 파일을 `Read`로 읽어서 검증
3. 검증 결과를 사용자에게 짧게 보고

### 2c. 재시도 또는 다음 스텝

- **통과**: 다음 스텝으로 진행
- **문제 발견**: 구체적 수정 지시를 포함하여 Codex에 재위임 (`--resume-last`)
- **3회 연속 실패**: 사용자에게 보고. 원하면 Claude가 직접 수정.

## Phase 3: 최종 리뷰

모든 스텝 완료 후 전체 변경 요약 + 선택적 Codex 리뷰.

## 핵심 규칙

- **Claude는 코드를 직접 수정하지 않는다.** Edit, Write 도구를 사용하지 마라.
- 분석/검증에만 Read, Glob, Grep을 사용한다.
- 모든 코드 변경은 `codex-companion.mjs task --write`를 통해서만.
- Codex가 사용 불가하면 사용자에게 알리고, 직접 코딩 전환 여부를 물어라.
````

## 완료 확인

모든 단계가 끝나면 아래를 알려줘:
1. `codex --version` 결과
2. `/codex:setup` 결과
3. `~/.claude/commands/cowork.md` 파일 생성 확인

=== 여기까지 복사 ===

---

## 세팅 후 사용법

### 오케스트레이션 모드 (Claude 기획 + Codex 코딩)
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
