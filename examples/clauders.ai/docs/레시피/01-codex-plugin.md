---
slug: 레시피-codex-plugin
title: "Codex 플러그인"
nav: Codex 플러그인
order: 1
---

**OpenAI가 경쟁사 도구에 공식 플러그인을 만들었어.**

[openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) — OpenAI가 직접 만든 Claude Code용 Codex 플러그인이야. 2026년 3월 30일에 공개됐고, 하루 만에 깃허브 스타 1,000개를 넘었어.

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

## 구조가 어떻게 되냐

```
Claude Code (하네스)
  └── Claude (오케스트레이터) ← 계획, 분석, 판단
        └── Codex (실행자) ← 코딩, 리팩토링, 리뷰
```

Claude Code 자체가 하네스야. 모델을 둘러싼 도구, 권한, 제약, 검증 — 이게 다 하네스거든. Claude가 작업을 분해하고, Codex가 실행하고, 하네스가 제약을 건다.

근데 이 하네스를 **네 프로젝트에 맞게 세팅**해야 제대로 돌아가. 그건 [다음 편: 하네스 엔지니어링](/레시피-harness-engineering)에서 다뤄.

---

## 어떻게 세팅해?

아래 세팅 파일을 복사해서 Claude Code에 붙여넣어.

:::copy-embed _embeds/setup-codex-plugin Codex 플러그인 자동 위임 세팅 파일
:::

Codex CLI 설치, 플러그인 설치, `~/.claude/CLAUDE.md` 역할 분담 추가까지 Claude가 알아서 해.

:::warning
Codex는 ChatGPT **유료 구독** 또는 **OpenAI API 키**가 필요해. Free 계정만으로는 쓸 수 없어.
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
| `/codex:cancel` | 실행 중인 백그라운드 작업 중단 |
| `/codex:setup` | 설치 및 설정 확인 |

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

세팅 파일 붙여넣으면 Claude는 기획, Codex는 코딩 — 알아서 돼. 근데 Codex가 엉뚱한 코드를 안 짜게 하려면 [하네스를 깔아야 해](/레시피-harness-engineering).
