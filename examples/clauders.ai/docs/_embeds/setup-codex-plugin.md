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

아래 URL에서 최신 cowork.md를 다운로드해서 `~/.claude/commands/cowork.md`로 저장해줘:

```bash
curl -fsSL "https://raw.githubusercontent.com/rupy1014/openhow/main/examples/clauders.ai/docs/_embeds/cowork-latest.md" -o ~/.claude/commands/cowork.md
```

다운로드가 안 되면 아래 내용으로 직접 생성해줘:

````markdown
---
description: Claude가 기획/분석하고 Codex가 구현하는 오케스트레이션 워크플로우. 대화 문맥에서 작업을 추론하거나, 명시적 지시를 받는다.
argument-hint: "[작업 설명 — 생략하면 대화 문맥에서 추론]"
allowed-tools: Read, Glob, Grep, Bash(node:*), Bash(git:*), Agent, AskUserQuestion
---

# Cowork — 오케스트레이션 모드

당신은 **오케스트레이터**다. 코드를 직접 수정하지 않는다. 분석하고, 계획하고, Codex에 위임하고, 결과를 검증한다.

Codex companion 스크립트 경로:
```
CODEX_SCRIPT="${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/plugins/marketplaces/openai-codex/plugins/codex}/scripts/codex-companion.mjs"
```

모든 Codex 호출에서 이 변수를 사용한다.

## Phase 0: 작업 파악

사용자 요청: `$ARGUMENTS`

**비어있거나 모호하면:** 대화 문맥에서 추론 → `AskUserQuestion`으로 확인.
**명확하면:** 바로 Phase 1로.

## Phase 1: 분석 & 계획

이 Phase가 전체 작업의 방향을 결정한다. **여기서 잘못 분석하면 뒤가 다 틀어진다.** 충분히 시간을 들여라.

코드를 직접 수정하지 말고, **읽기 전용**으로 분석한다:

1. `Glob`, `Grep`, `Read`로 관련 파일과 구조를 파악한다.
2. 프로젝트의 CLAUDE.md, 아키텍처 문서를 참고한다.
3. **핵심 코드 스니펫을 수집한다** — 각 스텝에서 Codex가 참고할 10~20줄짜리 코드 조각을 미리 뽑아둔다. Phase 2에서 CONTEXT에 포함할 것.
4. 작업을 **원자적 단위**로 분해한다 (최대 5개 스텝).

사용자에게 계획을 보여주고 `AskUserQuestion`으로 확인.

## Phase 2: Codex 위임 실행

각 스텝마다:

### 2a. Codex에 위임

**5요소** 프롬프트로 구성:

```
TASK: [원자적 목표 — 한 문장]
EXPECTED: [성공 기준 — 기계적으로 검증 가능한 것]
MUST NOT: [금지 행동 — 아키텍처 제약, 스타일 규칙 등]
CONTEXT: [핵심 코드 스니펫 10~20줄 + 파일 경로. 경로만 넘기지 말 것]
VERIFY: [Codex가 완료 전 실행할 검증 커맨드. pass/fail 결과를 응답에 포함]
```

- **CONTEXT**: 파일 경로만 넘기면 Codex가 읽느라 토큰 낭비. 스니펫 직접 포함.
- **VERIFY**: Codex 자체 검증으로 퇴고 루프 감소. 테스트 없으면 lint 체크라도.
- **파이프라이닝**: Codex 실행 중 다음 스텝 파일을 미리 Read로 읽어 스니펫 준비.

### 2b. 결과 검증 & 퇴고

1. `git diff --stat`으로 변경량 확인 — 삽입 대비 삭제가 현저히 적으면 중복 의심
2. `Read` + `Grep`으로 핵심 파일 검증 (EXPECTED, MUST NOT, 컨벤션, 중복, 과도한 변경, 누락)
3. **이슈 발견 시 즉시 Codex에 수정 위임** (`--resume-last` 사용, 보고만 하지 말 것)
4. 이슈 → 수정 위임 → 재검증 루프 최대 3회

### 2c. 스텝 전환

- 통과 → 다음 스텝
- 3회 실패 → 사용자 보고, 요청 시 Claude 직접 수정
- **컨텍스트 정리**: 3스텝 이상 진행했으면 `/compact`로 요약 (완료/현재/남은 스텝 + 핵심 파일)

## Phase 3: 퇴고 & 최종 리뷰

1. `git diff --stat` 전체 변경 요약
2. Codex 리뷰 실행 (`codex-companion.mjs review`)
3. 리뷰 이슈 발견 시 Codex에 수정 위임
4. 사용자에게 **코드 완료 보고** 후 Phase 4를 백그라운드로 실행

## Phase 4: 문서 정리 (백그라운드)

`--background`로 실행. 사용자는 기다리지 않아도 됨.

### 4a~4c. 문서 업데이트
1. 변경된 기능/모듈 키워드로 `Grep` → 관련 md 탐색
2. 기존 md 우선 수정 (없을 때만 새 파일)
3. md 1,000줄 이상이면 분할 / 같은 주제 3개 이상이면 폴더 묶기
4. Codex에 문서 수정 위임 (`--background`)

### 4d. 대청소 (조건부)
트리거 체크는 `Glob("docs/**/*.md")` + `wc -l` + `git log`로. `find` 사용 금지 (느림).
트리거: 1,000줄 초과 md / 폴더당 md 10개+ / 최근 2주 docs 커밋 5개+
→ 하나라도 해당하면 정리안 수립 → **사용자 승인** 후 Codex 위임
→ 모두 해당 없으면 스킵

### 4e. 완료 알림
문서 작업 끝나면 수정된 md 목록 + 대청소 여부 간단히 알림.

## 핵심 규칙

- **Claude는 코드를 직접 수정하지 않는다.** Edit, Write 사용 금지.
- 분석/검증에만 Read, Glob, Grep을 사용한다.
- 모든 코드/문서 변경은 `codex-companion.mjs task --write`를 통해서만.
- md 파일은 1,000줄을 넘기지 않는다. 넘으면 분할.
- 같은 주제의 md가 3개 이상이면 폴더로 묶는다.
- Codex 사용 불가 시 사용자에게 알리고, 직접 코딩 전환 여부를 물어라.
- 각 스텝 사이에 불필요한 지연을 넣지 마라. 바로 다음 스텝으로.
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
