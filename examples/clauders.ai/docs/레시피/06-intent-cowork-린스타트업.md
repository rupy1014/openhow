---
slug: 레시피-intent-engineering
title: "Intent Engineering — 의도 중심 개발 세팅"
nav: Intent Engineering
order: 6
thumbnail: "./images/img-RC06.png"
---

**바이브 코딩 시대에 린스타트업을 실행하기 위한 엔지니어링 패턴이야.**

AI에게 "만들어줘"만 반복하면 코드는 쌓이는데 방향이 없어져.
의도(Intent)를 먼저 구조화하고, 그걸 AI에게 넘기는 패턴이야.

커맨드 두 개로 전체 사이클이 돌아가:

```
/intent — 의도를 발견하고 수렴시키는 도구
/cowork — 수렴된 의도를 AI에게 위임해서 구현하는 도구
```

---

## 왜 이렇게 해?

> 리포에서 AI가 재생성할 수 없는 것이 무엇인가?

코드? 다시 쓸 수 있어. 테스트? 파생물이야. 설정, 문서? 다 재생성 가능해.

**남는 건 의도뿐이야.** 왜 만드는지, 무엇을 만드는지, 무엇을 하지 않을지.
이 세 가지는 인간의 머릿속에서만 나와.

| 문제 | 증상 |
|------|------|
| 의도가 처음부터 완전하지 않다 | "이건 아닌데" → 다시 만들기 |
| 코드는 쌓이는데 의도가 없다 | "이 파일 왜 있지?" |
| 방향이 바뀌면 코드가 부채가 된다 | 피벗할 때 뭘 살릴지 판단 불가 |

의도를 구조화하면 이 세 가지가 해결돼.

---

## 전체 워크플로우

```
/intent new → explore → clarify → /cowork → done
  (발견)      (실험·학습)  (확정)    (실행)    ↓
                                          사람이 Measure
                                              ↓
                                    /intent "유저가 이렇게 말했어"
                                          (시그널 착지)
                                              ↓
                                    재개 or 새 intent → 반복
```

Build-Measure-Learn 루프가 이 두 커맨드 안에서 돌아가.
Build와 Learn은 AI가 하고, Measure는 사람이 해.

---

## 어떻게 쓰냐

### /intent — 자연어로 의도 관리

서브커맨드 안 외워도 돼. 자연어로 말하면 알아서 추론해:

```
"결제 느려서 고치고 싶어"     → 새 의도 생성 (new)
"Redis 방식 한번 해볼까"      → 탐색 (explore)
"이대로 가자"                → 확정 (clarify)
"방향 바꿔야 할 것 같아"      → 피벗 (pivot)
"이거 안 해"                 → 폐기 (kill)
"유저가 영수증 없어서 불안하대" → 시그널 기록 (update + [signal])
```

| 기능 | 설명 |
|------|------|
| 인터뷰어 모드 | Why → What → Not 순서로 한 질문씩 |
| 실험 파트너 | 불확실한 점 짚고 검증 방법 제안 |
| 자동 크기 체크 | What 7항목 이상이면 쪼개기 제안 |
| 시그널 착지 | 유저 피드백을 `[signal]` 태그로 기록 |
| 정체 감지 | exploring 14일+ → 경고 |
| done 이후 판단 | Why 같으면 재개, 다르면 신규 |

### /cowork — 의도 기반 오케스트레이션

Claude가 기획/분석하고, Codex가 구현하는 패턴이야. 코드를 직접 수정하지 않고 위임해:

```
Phase 0   — 자연어로 작업 파악
Phase 0.5 — intents/에서 의도 자동 로드 ← 핵심
Phase 1   — 분석 & 계획 (최대 5스텝)
Phase 2   — Codex 위임 실행 (격리)
Phase 3   — 퇴고 & 최종 리뷰
Phase 4   — 문서 정리 + 의도 피드백 (백그라운드)
```

Phase 0.5에서 의도 파일을 자동으로 로드해서, INTENT.md의 Why/What/Not/Learnings가 모든 Phase에 반영돼. AI가 "왜 만드는지" 알고 코드를 작성하는 거야.

:::tip
Codex 없이도 돼. Codex가 없으면 Claude가 직접 코딩으로 전환해. [Claude + Codex 오케스트레이션](./03-codex-orchestration.md)은 선택이야.
:::

---

## 어떻게 깔아?

### Step 1. 커맨드 파일 복사

아래 파일들을 프로젝트 또는 글로벌 `.claude/commands/`에 넣어:

```
.claude/commands/
├── intent.md                  ← 라우터 (핵심 규칙 + NLP 추론)
├── intent-modes/              ← 모드별 상세 (필요할 때만 로드)
│   ├── new.md
│   ├── explore.md
│   ├── clarify.md
│   ├── pivot.md
│   ├── kill.md
│   ├── update.md
│   └── dashboard.md
├── cowork.md                  ← 라우터 (격리 원칙 + 위임 프로토콜)
└── cowork-phases/             ← Phase별 상세 (진입 시 로드)
    ├── phase0-intent.md
    ├── phase1-plan.md
    ├── phase2-exec.md
    └── phase3-review.md
```

라우터+분리 구조라서, `/intent explore` 하면 라우터(203줄) + explore.md(69줄)만 로드돼. 모노리스(573줄 전체 로드) 대비 토큰 52% 절감.

파일 내용은 이 문서 하단의 [설정 파일](#설정-파일)에 있어.

### Step 2. CLAUDE.md에 워크플로우 추가

프로젝트 또는 글로벌 CLAUDE.md에 아래를 추가해:

```markdown
## 의도 하네스 & Codex 연동

### 워크플로우

/intent new → explore → clarify → /cowork → done
  (발견)      (실험·학습)  (확정)    (실행)

### 커맨드

| 용도 | 커맨드 |
|------|--------|
| 의도 관리 | `/intent [자연어]` |
| 오케스트레이션 | `/cowork [작업]` |

### 핵심 원칙

- 의도 크기: What 7항목 이상이면 쪼개기
- 시그널 착지: 유저 피드백은 `/intent`로 [signal] 기록
- done 판단: Why 같으면 재개, 다르면 신규
```

### Step 3. 테스트

```bash
claude
> /intent 결제가 느려서 고치고 싶어
# → 인터뷰 시작, intents/payment-speed.md 생성

> /intent Redis 방식 한번 해볼까
# → exploring 상태, 가설 제안

> /intent 이대로 가자
# → clarified 상태

> /cowork
# → 의도 자동 로드, 계획 수립, 실행
```

---

## 쓰레기가 남지 않냐?

안 남아. 시스템이 알아서 정리해:

| 시점 | 자동으로 하는 것 |
|------|----------------|
| `/intent explore` 후 | Learnings에 실험 기록, What/Not 업데이트 |
| `/intent clarify` 후 | Learnings 패턴 추출 → What/Not 정제, 중복 제거 |
| `/intent pivot` 후 | What을 유지/백로그/삭제 분류, Footprint에 정리 대상 표시 |
| `/intent kill` 후 | `_killed/`로 이동, 학습만 보존 |
| `/cowork` 완료 (Phase 4) | Footprint 자동 기록, Learnings 피드백, status 전이, docs 업데이트 |
| `/cowork` Phase 4d | 1000줄+ md 분할, 10개+ md 폴더 묶기 (대청소) |
| `/intent` 현황 | 14일+ 정체 의도 경고, 크로스 Backlog 집계 |
| Learnings 5개+ | 단일 파일 → 폴더 승격 제안 |

의도 문서가 **살아있는 문서**야. seed로 시작해서 exploring → clarified → done으로 가면서 계속 정제되고, 폐기되면 `_killed/`로 격리돼서 학습만 남아.

---

## 의도 문서 (INTENT.md) 상세

설치하고 `/intent new`를 실행하면 이런 파일이 생겨:

```markdown
---
status: seed
created: 2026-04-12
updated: 2026-04-12
---

# 결제 속도 개선

## Why
결제 완료까지 평균 8초. 3초 이상이면 이탈률 40% 넘음.

## What
- DB 쿼리 최적화 (N+1 해결)
- 결제 프로세스 비동기화
- 결과 캐싱

## Not
- 결제 수단 추가는 스코프 밖
- Redis 세션: 이미 검토했고 효과 없음 (Learnings 참고)

## Context
- 진입점: src/payment/checkout.ts
- DB: PostgreSQL, ORM은 Prisma

## Footprint
(아직 없음 — /cowork 실행 후 자동 기록)

## Backlog
- [ ] OAuth 소셜 로그인 — PMF 확인 후

## Learnings

### 2026-04-10: Redis 세션 PoC
- **시도**: Redis 기반 세션 관리
- **결과**: 개선 미미 (12ms → 10ms)
- **배운 것**: 병목은 세션이 아니라 DB 쿼리
- **의도 변경**: What에서 Redis 제거, 쿼리 최적화 추가

### 2026-04-15: [signal] 유저 인터뷰 — 영수증 불안
- **출처**: 유저 3명 인터뷰
- **시그널**: "결제는 빨라졌는데 영수증이 안 와서 불안"
- **의도 변경**: What에 "영수증 즉시 발송" 추가
```

각 섹션이 하는 일:

| 섹션 | 역할 | 누가 쓰냐 |
|------|------|----------|
| **Why** | 근본 동기. 피벗해도 안 바뀜 | 사람 (인터뷰) |
| **What** | 해결책. 탐색하면서 진화 | 사람 + AI 제안 |
| **Not** | 금지. 실험에서 자라남 | 사람 + 실패에서 발견 |
| **Learnings** | 실험 기록. 실패의 자산화 | AI가 자동 기록 |
| **Footprint** | 코드 발자국. 피벗 시 정리 판단 근거 | /cowork가 자동 기록 |
| **Backlog** | 보류. 다음 이터레이션의 씨앗 | 사람이 분류 |
| **Context** | AI에게 줄 배경 지식 | 사람 |

### /cowork에서 이걸 어떻게 쓰냐

Phase 0.5에서 의도 파일을 자동으로 로드해서 각 섹션이 역할을 해:

| 의도 섹션 | /cowork에서의 역할 |
|-----------|------------------|
| Why | 각 스텝의 목표 근거 |
| What | 스텝 분해의 스코프 경계 |
| Not | 각 스텝의 MUST NOT에 자동 반영 |
| Learnings | 이미 실패한 접근 회피 |
| Context | 코드 분석의 진입점 |

AI에게 "결제 기능 만들어줘"라고 하는 것과,
"결제가 느려서 이탈하는 문제를 해결하려고 한다. 쿼리 최적화 방향이고, Redis는 이미 검토했는데 효과 없었다."라고 하는 것은 다르잖아.
후자가 INTENT.md가 자동으로 주입해주는 문맥이야.

---

## 레퍼런스

### 상태 전이

```
seed → exploring → clarified → building → done
  │        │           │
  └────────┴───────────┴──────→ killed
```

| 상태 | 의미 | 다음 행동 |
|------|------|----------|
| seed | Why만 있음 | `/intent explore` |
| exploring | 가설 실험 중 | 계속 탐색 or `/intent clarify` |
| clarified | What/Not 수렴 완료 | `/cowork`로 구현 |
| building | AI가 구현 중 | /cowork가 자동 전이 |
| done | 완료 | Measure → 재개 or 새 intent |
| killed | 폐기. 학습은 보존 | `_killed/`로 이동 |

**핵심: clarified가 /cowork의 입력이야.**
seed에서 바로 코드 만들면 삽질이고, exploring을 거쳐야 수렴해.

### 의도 크기 가이드

| 신호 | 판단 | 행동 |
|------|------|------|
| What이 7항목 이상 | 너무 크다 | 쪼개기 |
| Why를 한 문장으로 못 쓴다 | 의도 두 개 섞임 | 분리 |
| exploring 2주+ | 범위 넓다 | 쪼개거나 Backlog로 |

쪼개는 기준: Why가 같으면 What 기준으로, Why가 다르면 완전히 별개.

### done 이후 — 재개 vs 신규

| 상황 | 판단 | 행동 |
|------|------|------|
| Why가 같다 | 재개 | done → exploring |
| Why가 다르다 | 신규 | 새 intent |
| Backlog 구현 | 재개 | Backlog → What |
| 버그 수정 | 의도 불필요 | /cowork 직접 |

### 린스타트업 매핑

이 시스템이 Build-Measure-Learn을 어떻게 커버하는지:

| 린스타트업 | 이 시스템 | 도구 |
|-----------|----------|------|
| **Ideate** | seed + exploring | `/intent new`, `/intent explore` |
| **Build** | clarified → building → done | `/cowork` |
| **Measure** | 사람이 유저를 만남 | (시스템 밖 — 사람 영역) |
| **Learn** | [signal] 기록 + 재개/피벗/신규 | `/intent "유저가 이렇게 말했어"` |
| **Pivot** | 의도 피벗 + Footprint 정리 | `/intent pivot` |
| **Kill** | 의도 폐기 + 학습 보존 | `/intent kill` |

**Measure는 사람의 영역이야.** 시스템은 사람이 시그널을 가져왔을 때 착지할 곳만 제공해.

### Codex 위임 프로토콜

```markdown
TASK: [원자적 목표 — 한 문장]
EXPECTED: [성공 기준]
MUST NOT: [금지 행동]
CONTEXT: [핵심 코드 스니펫 10~20줄 + 파일 경로]
VERIFY: [Codex가 스스로 검증할 커맨드]
```

이 4+1가지가 있으면 Codex가 거의 한 번에 맞춰.

---

## 한 줄 정리

| 인사이트 | 요약 |
|---------|------|
| 코드는 파생물 | 의도가 명확하면 코드는 언제든 재생성 |
| 실패를 구조화해 | Learnings가 없으면 같은 삽질 반복 |
| 환경이 결과를 결정 | 프롬프트 튜닝 < 하네스 설계 |
| 작을수록 강하다 | What 7개 이상 → 쪼개라 |
| Build-Measure-Learn 연결 | [signal]이 다음 방향을 바꾼다 |

의도를 설계하고, AI에게 위임하고, 시그널을 받아서 반복해.
이게 바이브 코딩 시대의 린스타트업이야.

---

## 설정 파일

라우터 + 모드별 분리 구조야. 라우터만 항상 로드되고, 상세 파일은 필요할 때만 로드돼서 토큰을 아껴.

**전체 파일을 한 번에 받으려면** [GitHub 저장소](https://github.com/roboco-io/intent-engineering)에서 clone해.

여기서는 핵심 라우터 2개만 보여줄게. 모드/Phase 상세 파일은 저장소에 있어.

:::details intent.md — 의도 관리 라우터 (.claude/commands/intent.md)
```markdown
---
description: "의도(Intent) 관리 — 바이브코딩의 의도 하네스. 자연어로 말하면 알아서 처리한다."
argument-hint: "[자유롭게 — 예: '결제 느려서 고치고 싶어', '방향 바꿔야 할 것 같아', 빈 값이면 현황]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(git:*), Agent, AskUserQuestion, WebSearch
---

# Intent — 의도 하네스

당신은 **의도 설계자**다. 코드를 작성하지 않는다. 의도를 발견하고, 실험으로 검증하고, 수렴시킨다.

의도 문서는 프로젝트의 **단일 진실 소스**다.

## 모드별 상세 문서 (필요한 모드만 Read로 로드)

| 모드 | 파일 | 언제 로드 |
|------|------|----------|
| 생성 (new) | `.claude/commands/intent-modes/new.md` | 새 의도 생성 시 |
| 탐색 (explore) | `.claude/commands/intent-modes/explore.md` | 가설 실험 시 |
| 확정 (clarify) | `.claude/commands/intent-modes/clarify.md` | What/Not 수렴 시 |
| 피벗 (pivot) | `.claude/commands/intent-modes/pivot.md` | 방향 전환 시 |
| 폐기 (kill) | `.claude/commands/intent-modes/kill.md` | 의도 폐기 시 |
| 업데이트 (update) | `.claude/commands/intent-modes/update.md` | 섹션 수정 / 시그널 기록 시 |
| 현황 / 조회 | `.claude/commands/intent-modes/dashboard.md` | 현황 확인 / 개별 조회 시 |

**실행 순서**: 인자 추론 → 모드 확정 → 해당 모드 파일만 Read로 로드 → 실행.

(이하 핵심 규칙, NLP 추론 테이블, 상태 전이 등 — 전체는 GitHub 참고)
```
:::

:::details cowork.md — 오케스트레이션 라우터 (.claude/commands/cowork.md)
```markdown
---
description: Claude가 기획/분석하고 Codex가 구현하는 오케스트레이션 워크플로우.
argument-hint: "[자유롭게 — 예: '결제 기능 만들어줘', '아까 그거 진행해', 빈 값이면 문맥에서 추론]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(node:*), Bash(git:*), Bash(bash:*), Agent, AskUserQuestion
---

# Cowork — 오케스트레이션 모드

당신은 **오케스트레이터**다. 코드를 직접 수정하지 않는다.

## Phase별 상세 문서 (해당 Phase 진입 시 Read로 로드)

| Phase | 파일 | 내용 |
|-------|------|------|
| 0 + 0.5 | `.claude/commands/cowork-phases/phase0-intent.md` | 작업 파악 + 의도 로드 |
| 1 | `.claude/commands/cowork-phases/phase1-plan.md` | 분석 & 계획 |
| 2 | `.claude/commands/cowork-phases/phase2-exec.md` | Codex 위임 실행 (격리) |
| 3 + 4 | `.claude/commands/cowork-phases/phase3-review.md` | 퇴고 + 문서 정리 + 의도 피드백 |

**실행 순서**: Phase 0 → 1 → 2 → 3. 각 Phase 진입 시 해당 파일을 Read로 로드.

(이하 격리 원칙, 위임 프로토콜, 핵심 규칙 등 — 전체는 GitHub 참고)
```
:::

---

## 더 알아보기

- **Intent Engineering 설계 철학**: [intent.roboco.io](https://intent.roboco.io)
- **GitHub**: [roboco-io/intent-engineering](https://github.com/roboco-io/intent-engineering)
- **Claude Code 플러그인**: [roboco-io/plugins](https://github.com/roboco-io/plugins)
- **Codex 오케스트레이션 기초**: [Claude + Codex 오케스트레이션](./03-codex-orchestration.md)
