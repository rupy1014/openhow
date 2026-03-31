---
slug: 부록-codex-plugin
title: "Codex 플러그인"
nav: Codex 플러그인
order: 6
---

**OpenAI가 경쟁사 도구에 공식 플러그인을 만들었어.**

[openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) — OpenAI가 직접 만든 Claude Code용 Codex 플러그인이야. 2026년 3월 30일에 공개됐고, 하루 만에 깃허브 스타 850개를 찍었어.

---

## 왜 OpenAI가 이걸 만들었냐

Claude Code가 코딩 에이전트 시장을 먹고 있거든.

하루 GitHub 커밋 13만 5천 개. 전체 퍼블릭 커밋의 4%. 연간 매출 25억 달러 규모.

한 개발자가 이렇게 말했어: *"내가 아는 프로그래머 전원이 Claude Code를 써. Codex 쓴다는 사람은 아직 한 명도 못 봤어."*

그래서 OpenAI가 택한 전략이 **"이길 수 없으면 들어가라"**야.

개발자가 Codex로 안 오니까, Codex를 Claude Code 안으로 넣은 거야. Slack, Figma, Linear, Notion 플러그인이랑 같은 날 20개 넘게 동시 출시했어.

핵심은 이거야:

| Claude Code | Codex |
|-------------|-------|
| 전략, 설계, 분석 | 코드 실행, 구현 |
| 개발자 점유율 압도 | 엔터프라이즈 타겟 |
| $100/월 (Max) | $200/월 (Pro) |

**"Claude로 설계하고, Codex로 짜라"** — 이게 OpenAI가 공식으로 밀고 있는 하이브리드 워크플로우야.

---

## 어떻게 설치하냐

**Step 1.** Codex CLI 설치 (이미 있으면 넘어가)

```bash
npm install -g @openai/codex
codex --version
```

**Step 2.** Claude Code에서 플러그인 설치

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
```

**Step 3.** 설치 확인

```
/codex:setup
```

로그인이 안 돼 있으면:

```bash
codex login
```

:::tip
ChatGPT Free 계정이라도 Codex CLI는 쓸 수 있어. 사용량 제한만 다르지.
:::

---

## 뭐가 되냐

| 커맨드 | 역할 |
|--------|------|
| `/codex:rescue` | Codex에 작업 위임 (코딩, 버그 수정, 리팩토링) |
| `/codex:review` | 변경사항 코드 리뷰 |
| `/codex:adversarial-review` | 설계 결정까지 까는 심층 리뷰 |
| `/codex:status` | 백그라운드 작업 상태 확인 |
| `/codex:result` | 완료된 작업 결과 보기 |
| `/codex:cancel` | 진행 중인 작업 취소 |

---

## 어떻게 자동으로 쓰게 하냐

Claude가 직접 코드 쓰지 않고 Codex에 알아서 위임하게 하려면, 역할 분담을 설정 파일에 적어.

**프로젝트 단위**면 프로젝트 루트 `CLAUDE.md`에, **모든 프로젝트에 적용**하려면 `~/.claude/CLAUDE.md`(글로벌 설정)에 넣어.

````markdown
## 역할 분담

- **Claude**: 전략, 분석, 작업 분해, 아키텍처 설계, 최종 판단. **코드 직접 수정 금지.**
- **Codex**: 구현, 리팩토링, 테스트 작성, 버그 수정. `/codex:rescue`로 실행.

## 작업 흐름

1. 사용자 요청을 분석하고 작업을 분해한다.
2. 각 작업을 `/codex:rescue`로 위임한다. 위임 시 반드시 포함:
   - **TASK** — 원자적 목표 (한 문장)
   - **EXPECTED** — 성공 기준
   - **MUST NOT** — 금지 행동
   - **CONTEXT** — 파일 경로, 패턴, 이전 결과
3. Codex 결과를 확인하고, 필요하면 `/codex:review`로 리뷰한다.
4. 3번 연속 실패하면 Codex 위임 중단하고 직접 처리한다.

## Fallback 정책

Codex가 사용 불가할 때 (토큰 소진, 네트워크 오류, 인증 만료 등):
- `/codex:rescue` 실패 시 Claude가 직접 코드를 작성한다.
- "코드 직접 수정 금지" 규칙은 Codex 정상 작동 시에만 적용.
- Codex 복구되면 다시 위임 모드로 전환.

## 리뷰 정책

- 구현 완료 후 `/codex:review` 실행. 이슈 있으면 수정 후 재리뷰.
- Codex 리뷰가 불가하면 Claude가 직접 코드 리뷰한다.
- 설계가 복잡한 변경은 `/codex:adversarial-review`까지 실행.

## 백그라운드 작업

독립적인 작업이 2개 이상이면 `--background` 플래그로 병렬 실행:

```
/codex:rescue --background 백엔드 API 구현
/codex:rescue --background 프론트 UI 구현
/codex:status  ← 진행 확인
```
````

---

## 글로벌로 설정하냐 프로젝트별로 하냐

| 설정 위치 | 적용 범위 | 언제 쓰냐 |
|-----------|----------|----------|
| `~/.claude/CLAUDE.md` | 모든 프로젝트 | "난 항상 이렇게 일한다" |
| 프로젝트 루트 `CLAUDE.md` | 해당 프로젝트만 | "이 프로젝트만 위임" |

글로벌에 넣으면 어떤 프로젝트를 열어도 Claude가 Codex에 위임해. 특정 프로젝트에서 끄고 싶으면 프로젝트 `CLAUDE.md`에 "Codex 위임 안 함. Claude가 직접 코드 수정." 한 줄 넣으면 프로젝트 설정이 이겨.

:::tip
추천은 **글로벌에 역할 분담 + fallback을 넣고**, 프로젝트별로는 CONTEXT(파일 구조, 금지 패턴 등)만 추가하는 거야.
:::

---

## Codex가 안 될 때는?

Codex 토큰을 다 쓰거나 네트워크가 끊기면 `/codex:rescue`가 실패해.

위 `CLAUDE.md`에 fallback 정책을 넣었으니까, Claude가 알아서 직접 처리로 전환해. 사용자가 따로 명령할 필요 없어.

전환 기준:

| 상황 | Claude 행동 |
|------|------------|
| `/codex:rescue` 성공 | Codex 결과 확인 → 리뷰 |
| `/codex:rescue` 1~2회 실패 | 프롬프트 수정 후 재시도 |
| 3회 연속 실패 | Claude가 직접 코드 작성 |
| Codex 인증/토큰 에러 | 즉시 Claude 직접 처리 |
| Codex 복구 확인 | 다시 위임 모드 |

Claude가 직접 작업했을 때는 `/codex:review` 대신 Claude 자체 리뷰로 대체돼.

---

## exec 방식이랑 뭐가 다르냐

기존 [Claude + Codex 오케스트레이션](/부록-codex-orchestration)은 `codex exec` 래퍼를 직접 짜는 방식이야.

| | 플러그인 (`/codex:rescue`) | exec 래퍼 (`codex exec`) |
|--|--------------------------|-------------------------|
| 설정 | 플러그인 설치만 | 래퍼 스크립트 작성 필요 |
| 호출 방식 | 슬래시 커맨드 | Bash 도구로 쉘 호출 |
| 결과 전달 | Claude 컨텍스트에 자동 삽입 | JSON 파일 파싱 필요 |
| 백그라운드 | `--background` 플래그 | `&` + `wait` |
| 코드 리뷰 | `/codex:review` 내장 | 별도 구현 |
| 자동 리뷰 게이트 | `/codex:setup --enable-review-gate` | 없음 |
| 컨텍스트 절약 | 서브에이전트라 분리됨 | JSON 요약만 받아서 절약 |

**둘 다 써도 돼.** 간단한 위임은 플러그인, 정밀한 제어가 필요하면 exec 래퍼.

---

## 리뷰 게이트는 뭐냐

Claude가 응답할 때마다 Codex가 자동으로 리뷰하는 기능이야.

```
/codex:setup --enable-review-gate
```

이슈가 발견되면 Claude 응답이 차단되고, 수정 후 재시도돼.

:::warning
루프가 길어질 수 있어. 토큰 소모가 빠르니까 꼭 필요한 프로젝트에서만 켜.
끄려면 `/codex:setup --disable-review-gate`.
:::

---

## 모델은 뭘 쓰냐

Codex CLI 기본 모델은 `gpt-5.4`야. 별도 설정 안 하면 이걸 써.

바꾸고 싶으면 `~/.codex/config.toml`:

```toml
model = "gpt-5.4-mini"
model_reasoning_effort = "high"
```

커맨드별로 오버라이드도 돼:

```
/codex:rescue --model spark 빠른 유틸 함수 작성
```

| 모델 | 언제 쓰냐 |
|------|----------|
| `gpt-5.4` | 기본값. 코딩 + 추론 + 에이전트 통합 |
| `gpt-5.4-mini` | 빠르고 저렴한 작업 |
| `gpt-5.3-codex` | 복잡한 소프트웨어 엔지니어링 전문 |
| `spark` (`gpt-5.3-codex-spark`) | 실시간급 속도. ChatGPT Pro 전용 |

---

## 한 줄 정리

OpenAI가 경쟁사 도구에 공식 플러그인을 낸 건 Claude Code가 그만큼 시장을 잡았다는 뜻이야. `CLAUDE.md` 3줄이면 Claude는 기획, Codex는 코딩 — 래퍼 없이 알아서 돼.
