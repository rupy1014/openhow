---
slug: 부록-codex-plugin
title: "Codex 플러그인"
nav: Codex 플러그인
order: 6
---

**OpenAI가 경쟁사 도구에 공식 플러그인을 만들었어.**

[openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) — OpenAI가 직접 만든 Claude Code용 Codex 플러그인이야. 2026년 3월 30일에 공개됐고, 이틀 만에 깃허브 스타 1,000개를 넘었어.

---

## 왜 OpenAI가 이걸 만들었냐

Claude Code가 코딩 에이전트 시장을 먹고 있거든.

하루 GitHub 커밋 13만 5천 개. 전체 퍼블릭 커밋의 4%. 연간 매출 25억 달러 규모.

ZDNet 기자 David Gewirtz가 이렇게 말했어: *"내가 아는 프로그래머 전원이 Claude Code를 써. Codex 쓴다는 사람은 아직 한 명도 못 봤어."*

그래서 OpenAI가 택한 전략이 **"이길 수 없으면 들어가라"**야.

개발자가 Codex로 안 오니까, Codex를 Claude Code 안으로 넣은 거야. Slack, Figma, Linear, Notion 플러그인이랑 같은 날 20개 넘게 동시 출시했어.

| Claude Code | Codex |
|-------------|-------|
| 전략, 설계, 분석 | 코드 실행, 구현 |
| 개발자 점유율 압도 | 엔터프라이즈 타겟 |
| $20~200/월 (Pro~Max) | $20~200/월 (Plus~Pro) |

**"Claude로 설계하고, Codex로 짜라"** — 이게 OpenAI가 공식으로 밀고 있는 하이브리드 워크플로우야.

---

## 이게 하네스냐

이 패턴을 "하네스"라고 부르는 사람이 많은데, 정확히 말하면 좀 달라.

**하네스(harness)**는 모델을 둘러싼 **전체 인프라**야. 도구, 권한, 세션 관리, 안전장치 — 모델 자체를 제외한 모든 것. [Anthropic 공식 문서](https://code.claude.com/docs/en/how-claude-code-works)에서도 Claude Code를 "에이전트 하네스(agentic harness)"라고 부르거든.

> *"Agent = Model + Harness"* — 모델이 지능이면, 하네스는 그 지능을 실제로 작동하게 만드는 인프라야. ([LangChain](https://blog.langchain.com/the-anatomy-of-an-agent-harness))

그러니까 Claude Code **자체가** 하네스야. Claude Code가 하네스 **역할을 한다**는 게 아니라.

Claude + Codex 관계에서 Claude가 하는 건 **오케스트레이터(orchestrator)** 또는 **플래너(planner)**야:

```
Claude Code (하네스)
  └── Claude (오케스트레이터) ← 계획, 분석, 판단
        └── Codex (실행자) ← 코딩, 리팩토링, 리뷰
```

| 용어 | 뜻 |
|------|-----|
| **하네스** | 모델을 감싸는 전체 인프라 (Claude Code 자체) |
| **오케스트레이터** | 작업 흐름을 제어하고 위임하는 역할 |
| **플래너** | 목표를 분해하고 단계를 설계하는 역할 |
| **실행자** | 실제 코드를 쓰고 수정하는 역할 |

OpenAI도 "하네스 엔지니어링(harness engineering)"이라는 용어를 쓰기 시작했어. [martinfowler.com](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)에서도 하나의 엔지니어링 분야로 다루고 있고.

---

## 어떻게 세팅해?

아래 세팅 파일을 복사해서 Claude Code에 붙여넣어.

:::copy-embed _embeds/setup-codex-plugin Codex 플러그인 자동 위임 세팅 파일
:::

Codex CLI 설치, 플러그인 설치, `~/.claude/CLAUDE.md` 역할 분담 추가까지 Claude가 알아서 해.

:::warning
Codex는 ChatGPT **Plus 이상** 플랜이 필요해. Free 계정으로는 쓸 수 없어.
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

평소처럼 "결제 API 만들어줘" 하면 Claude가 분석 → `/codex:rescue`로 위임 → `/codex:review`로 리뷰까지 알아서 돌려.

Codex 토큰을 다 쓰거나 에러가 나면? Claude가 알아서 직접 코딩으로 전환해. 복구되면 다시 위임 모드로 돌아가.

---

## 모델은 뭘 쓰냐

Codex CLI 기본 모델은 `gpt-5.4`야. 별도 설정 안 하면 이걸 써.

바꾸고 싶으면 `~/.codex/config.toml`:

```toml
model = "gpt-5.4"
model_reasoning_effort = "high"
```

| 모델 | 언제 쓰냐 |
|------|----------|
| `gpt-5.4` | 기본값. 코딩 + 추론 + 에이전트 통합 |
| `gpt-5.3-codex` | 복잡한 소프트웨어 엔지니어링 전문 |
| `spark` (`gpt-5.3-codex-spark`) | 실시간급 속도. ChatGPT Pro 전용 |

---

## 한 줄 정리

OpenAI가 경쟁사 도구에 공식 플러그인을 낸 건 Claude Code가 그만큼 시장을 잡았다는 뜻이야. 세팅 파일 붙여넣으면 Claude는 기획, Codex는 코딩 — 알아서 돼.
