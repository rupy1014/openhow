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

바이브 코딩의 진짜 문제는 코드가 아니라 의도의 휘발이야:

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

## 의도 문서 (INTENT.md)

의도 문서는 네 가지 핵심 + 세 가지 보조 섹션이야:

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

각 섹션의 역할:

| 섹션 | 역할 | 누가 쓰냐 |
|------|------|----------|
| **Why** | 근본 동기. 피벗해도 안 바뀜 | 사람 (인터뷰) |
| **What** | 해결책. 탐색하면서 진화 | 사람 + AI 제안 |
| **Not** | 금지. 실험에서 자라남 | 사람 + 실패에서 발견 |
| **Learnings** | 실험 기록. 실패의 자산 | AI가 자동 기록 |
| **Footprint** | 코드 발자국. 피벗 판단 근거 | /cowork가 자동 기록 |
| **Backlog** | 보류 항목. 다음 이터레이션의 씨앗 | 사람이 분류 |
| **Context** | AI에게 줄 배경 지식 | 사람 |

---

## 상태 전이

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

---

## /intent — 의도 관리

자연어로 말하면 알아서 추론해. 서브커맨드 안 외워도 돼:

```
"결제 느려서 고치고 싶어"     → 새 의도 생성 (new)
"Redis 방식 한번 해볼까"      → 탐색 (explore)
"이대로 가자"                → 확정 (clarify)
"방향 바꿔야 할 것 같아"      → 피벗 (pivot)
"이거 안 해"                 → 폐기 (kill)
"유저가 영수증 없어서 불안하대" → 시그널 기록 (update + [signal])
```

### 주요 기능

| 기능 | 설명 |
|------|------|
| 인터뷰어 모드 | Why → What → Not 순서로 한 질문씩 |
| 실험 파트너 | 불확실한 점 짚고 검증 방법 제안 |
| 자동 크기 체크 | What 7항목 이상이면 쪼개기 제안 |
| 시그널 착지 | 유저 피드백을 `[signal]` 태그로 기록 |
| 정체 감지 | exploring 14일+ → 경고 |
| done 이후 판단 | Why 같으면 재개, 다르면 신규 |

---

## /cowork — 오케스트레이션

Claude가 기획/분석하고, Codex가 구현하는 패턴이야.
코드를 직접 수정하지 않고 위임해.

```
Phase 0   — 자연어로 작업 파악
Phase 0.5 — intents/에서 의도 자동 로드
Phase 1   — 분석 & 계획 (최대 5스텝)
Phase 2   — Codex 위임 실행 (격리)
Phase 3   — 퇴고 & 최종 리뷰
Phase 4   — 문서 정리 + 의도 피드백 (백그라운드)
```

### Phase 0.5가 핵심

의도 파일이 있으면 자동으로 로드해서 모든 Phase에 반영해:

| 의도 섹션 | /cowork에서의 역할 |
|-----------|------------------|
| Why | 각 스텝의 목표 근거 |
| What | 스텝 분해의 스코프 경계 |
| Not | 각 스텝의 MUST NOT |
| Learnings | 이미 실패한 접근 회피 |
| Context | 코드 분석의 진입점 |

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

## 설치 방법

### Step 1. 커맨드 파일 복사

아래 두 파일을 프로젝트의 `.claude/commands/`에 넣어:

```
.claude/commands/
├── intent.md    ← 의도 관리
└── cowork.md    ← 오케스트레이션
```

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

### Step 3. Codex 래퍼 스크립트 (선택)

`/cowork`가 Codex를 호출할 때 쓰는 래퍼야. 없으면 Claude가 직접 코딩으로 전환해.

```bash
# ~/.claude/scripts/cowork-run.sh
# 설치: chmod +x ~/.claude/scripts/cowork-run.sh
```

래퍼 설정은 [Claude + Codex 오케스트레이션](./03-codex-orchestration.md)을 참고해.

### Step 4. 테스트

```bash
claude
> /intent 결제가 느려서 고치고 싶어
# → 인터뷰 시작, intents/payment-speed.md 생성

> /intent Redis 방식 한번 해볼까
# → exploring 상태, 가설 제안

> /intent 이대로 가자
# → clarified 상태

> /cowork
# → 의도 자동 로드, 계획 수립, Codex 위임
```

---

## 린스타트업 매핑

이 시스템이 린스타트업의 Build-Measure-Learn을 어떻게 커버하는지:

| 린스타트업 | 이 시스템 | 도구 |
|-----------|----------|------|
| **Ideate** | seed + exploring | `/intent new`, `/intent explore` |
| **Build** | clarified → building → done | `/cowork` |
| **Measure** | 사람이 유저를 만남 | (시스템 밖 — 사람 영역) |
| **Learn** | [signal] 기록 + 재개/피벗/신규 | `/intent "유저가 이렇게 말했어"` |
| **Pivot** | 의도 피벗 + Footprint 정리 | `/intent pivot` |
| **Kill** | 의도 폐기 + 학습 보존 | `/intent kill` |

**Measure는 사람의 영역이야.** 시스템은 사람이 시그널을 가져왔을 때 착지할 곳만 제공해.

---

## 의도 크기 가이드

| 신호 | 판단 | 행동 |
|------|------|------|
| What이 7항목 이상 | 너무 크다 | 쪼개기 |
| Why를 한 문장으로 못 쓴다 | 의도 두 개 섞임 | 분리 |
| exploring 2주+ | 범위 넓다 | 쪼개거나 Backlog로 |

쪼개는 기준: Why가 같으면 What 기준으로, Why가 다르면 완전히 별개.

---

## done 이후

| 상황 | 판단 | 행동 |
|------|------|------|
| Why가 같다 | 재개 | done → exploring |
| Why가 다르다 | 신규 | 새 intent |
| Backlog 구현 | 재개 | Backlog → What |
| 버그 수정 | 의도 불필요 | /cowork 직접 |

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

아래 두 파일을 `.claude/commands/`에 복사하면 바로 쓸 수 있어.

:::details intent.md — 의도 관리 커맨드 (전체)
```markdown
---
description: "의도(Intent) 관리 — 바이브코딩의 의도 하네스. 자연어로 말하면 알아서 처리한다."
argument-hint: "[자유롭게 — 예: '결제 느려서 고치고 싶어', '방향 바꿔야 할 것 같아', 빈 값이면 현황]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(git:*), Agent, AskUserQuestion, WebSearch
---

# Intent — 의도 하네스

당신은 **의도 설계자**다. 코드를 작성하지 않는다. 의도를 발견하고, 실험으로 검증하고, 수렴시킨다.

의도 문서는 프로젝트의 **단일 진실 소스**다. 코드, 테스트, 문서는 파생물이다. 의도만이 인간이 만들 수 있는 것이다.

---

## 의도 폴더 규칙

intents/
├── auth-redesign.md              # 단순한 의도 → 파일 하나
├── pricing-v2/                   # 복잡해진 의도 → 폴더로 승격
│   ├── INTENT.md
│   └── learnings.md
└── _killed/                      # 폐기된 의도 (학습 자산)
    └── sse-realtime.md

**승격 규칙**: 단일 파일의 Learnings가 5개 이상이면 → 폴더로 승격 제안.

### Footprint — 코드 발자국

/cowork 실행 후 자동으로 기록되는, 이 의도에서 생성/수정된 파일 목록.

**용도**: 의도가 피벗하거나 폐기될 때, 이 코드들을 정리할지 판단하는 근거.

### Backlog — 보류된 항목

의도에서 빠졌지만 죽이진 않은 항목들. "지금은 아니지만 나중에"인 것.

**규칙**:
- 체크 해제 [ ] = 보류 중 (나중에 다시 What으로 올릴 수 있음)
- 체크 완료 [x] + 취소선 = 영구 제외

---

## 의도 크기 가이드

**원칙: 의도 하나 = /cowork 한 번에 끝낼 수 있는 크기.**

| 신호 | 판단 | 행동 |
|------|------|------|
| What이 7항목 이상 | 너무 크다 | 쪼개기 — 각각 별도 intent로 |
| Why를 한 문장으로 못 쓴다 | 의도가 두 개 섞여 있다 | 분리 — Why 하나당 intent 하나 |
| exploring이 2주 이상 지속 | 탐색 범위가 넓다 | 쪼개거나 일부를 Backlog로 |
| /cowork Phase 1에서 스텝이 6개 이상 | 구현 범위 초과 | What을 줄이고 나머지 Backlog로 |

**clarify 단계에서 자동 체크**: What 항목이 7개 이상이면 "의도가 큽니다. 쪼갤까요?" 제안.

---

## done 이후 — 재개 vs 신규 판단

| 상황 | 판단 | 행동 |
|------|------|------|
| Why가 같다 (같은 문제, 추가 작업) | **재개** | done → exploring으로 전이, What 추가 |
| Why가 다르다 (새로운 동기) | **신규** | 새 intent 생성, 기존은 done 유지 |
| Backlog 항목을 구현하려 한다 | **재개** | Backlog → What으로 이동, exploring으로 전이 |
| 버그 수정 / 사소한 변경 | **재개 불필요** | /cowork 직접 실행 (intent 없이) |

---

## 외부 시그널

Learnings에 [signal] 태그로 구분한다:
- [signal] = 사람이 외부에서 가져온 것 (유저 피드백, 지표, 시장 반응)
- 태그 없음 = 개발 탐색에서 배운 것

---

## 인자 처리 — 자연어 추론

사용자는 서브커맨드를 쓰지 않는다. 자연어로 말하면 의도를 추론한다.

| 사용자가 말한 것 | 추론 모드 |
|----------------|----------|
| (빈 값) | 현황 |
| "결제 느려서 고치고 싶어" | 생성(new) |
| "결제 쪽 어떻게 되고 있어?" | 조회 |
| "결제 Redis 방식 한번 해볼까" | 탐색(explore) |
| "결제 이거 확정이야" | 확정(clarify) |
| "결제 방향 바꿔야 할 것 같아" | 피벗(pivot) |
| "결제 이거 안 해" | 폐기(kill) |
| "유저가 영수증 없어서 불안하대" | 업데이트 + [signal] |

---

## 상태 전이 규칙

seed → exploring → clarified → building → done
  │        │           │
  └────────┴───────────┴──────→ killed

| 현재 상태 | 허용되는 전이 |
|-----------|-------------|
| seed | → exploring, killed |
| exploring | → clarified, killed |
| clarified | → exploring (재탐색), building, killed |
| building | → done, exploring (재탐색), killed |
| done | → exploring (다음 이터레이션) |
| killed | → seed (부활 시 새 seed로) |

building, done은 /cowork가 자동으로 설정.

---

## 모드별 동작

### 현황 모드 (인자 없음)
- 전체 의도 테이블 출력
- 정체 감지: exploring 14일+ → ⚠ 경고
- 크로스 Backlog: 모든 의도의 보류 항목 모아보기

### 생성 모드 (new)
- 인터뷰어: Why → What → Not → Context 순서, 한 질문씩
- 자연어에서 이미 파악된 정보는 다시 물어보지 않음
- intents/{kebab-case}.md 생성

### 탐색 모드 (explore)
- 가장 불확실한 부분 짚고 검증 방법 제안
- 탐색 결과를 Learnings에 기록
- 승격 체크: Learnings 5개+ → 폴더로

### 확정 모드 (clarify)
- 크기 체크: What 7개+ → 쪼개기 제안
- Learnings에서 패턴 추출 → What/Not 정제
- status → clarified

### 피벗 모드 (pivot)
- What 분류: 유지/백로그/삭제
- Footprint 영향 분석
- status → exploring

### 폐기 모드 (kill)
- 부검: 왜 폐기하는지, 뭘 배웠는지
- Footprint 코드 정리 판단
- _killed/로 이동

### 업데이트 모드 (update)
- 자유로운 수정
- 시그널 자동 판단: 외부 피드백이면 [signal] 태그

---

## 핵심 규칙

1. 의도 문서만 수정한다 — 코드를 직접 작성하지 않는다
2. 인터뷰는 한 질문씩
3. "이거 아닌데"는 금이다 — 반드시 Learnings에 기록
4. Not은 실험에서 자란다
5. 파일 구조를 강제하지 않는다 — 단일 파일로 시작, 필요할 때 폴더로 승격
6. Context는 AI를 위한 것
7. clarified 의도가 /cowork의 입력 — 이 연결이 하네스의 핵심
8. 의도는 작을수록 좋다 — What 7항목 이상이면 쪼개기
9. 시그널을 구분한다 — [signal] 태그
10. done은 끝이 아니다 — Why 같으면 재개, 다르면 신규
```
:::

:::details cowork.md — 오케스트레이션 커맨드 (전체)
```markdown
---
description: Claude가 기획/분석하고 Codex가 구현하는 오케스트레이션 워크플로우. 자연어로 말하면 의도를 자동 로드하고 실행한다.
argument-hint: "[자유롭게 — 예: '결제 기능 만들어줘', '아까 그거 진행해', 빈 값이면 문맥에서 추론]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash(node:*), Bash(git:*), Bash(bash:*), Agent, AskUserQuestion
---

# Cowork — 오케스트레이션 모드

당신은 **오케스트레이터**다. 코드를 직접 수정하지 않는다. 분석하고, 계획하고, Codex에 위임하고, 결과를 검증한다.

래퍼 스크립트:
COWORK="$HOME/.claude/scripts/cowork-run.sh"

모든 Codex 호출에서 이 래퍼를 사용한다.

## 격리 원칙 (중요)

1. **프롬프트는 반드시 파일로** — /tmp/cowork_step{N}.md에 쓰고 파일 경로만 전달
2. **Claude는 JSON 상태만 받는다** — stdout은 JSON 상태 객체뿐
3. **Codex 결과는 필요할 때만 Read로**
4. **git diff로 검증한다**

---

## Phase 0: 작업 파악 (자연어 추론)

사용자 요청: $ARGUMENTS

1. 비어있으면 → 직전 대화 문맥에서 추론
2. 자연어면 → 키워드 추출, Phase 0.5에서 의도 매칭
3. 작업 파악되면 → Phase 0.5로

## Phase 0.5: 의도 로드 (선택적)

1. intents/ 폴더 확인 (없으면 Phase 1로)
2. Glob으로 intents/*.md, intents/*/INTENT.md 스캔
3. 키워드 매칭
4. clarified/building → Why/What/Not/Context를 계획 근거로 사용
5. seed/exploring → 확정 먼저 할지 확인

## Phase 1: 분석 & 계획

코드를 직접 수정하지 말고, 읽기 전용으로 분석:
1. Glob, Grep, Read로 파악
2. 핵심 코드 스니펫 수집
3. 원자적 단위로 분해 (최대 5스텝)
4. 사용자에게 계획 확인

## Phase 2: Codex 위임 실행 (격리)

각 스텝마다:
1. /tmp/cowork_step{N}.md에 프롬프트 작성 (TASK/EXPECTED/MUST NOT/CONTEXT/VERIFY)
2. cowork-run.sh task 호출
3. git diff --stat으로 검증
4. 이슈 있으면 수정 프롬프트 → 재위임 (최대 3회)

## Phase 3: 퇴고 & 최종 리뷰

1. 전체 git diff --stat
2. Codex 리뷰 호출
3. 이슈 수정 위임
4. 코드 완료 보고

## Phase 4: 문서 정리 (백그라운드)

4a. 관련 문서 탐색 & 수정
4b. 의도 피드백 (Phase 0.5에서 로드한 경우):
  - Footprint 업데이트
  - Learnings에 결과 기록
  - status 변경 (building → done)

---

## 핵심 규칙

- Claude는 코드를 직접 수정하지 않는다
- 모든 코드 변경은 cowork-run.sh task를 통해서만
- Codex 프롬프트는 반드시 파일로
- md 파일은 1,000줄 넘기지 않는다
- Codex 사용 불가 시 사용자에게 알리고 직접 코딩 전환 여부를 물어라
```
:::

---

## 더 알아보기

- **Intent Engineering 설계 철학**: [intent.roboco.io](https://intent.roboco.io)
- **GitHub**: [roboco-io/intent-engineering](https://github.com/roboco-io/intent-engineering)
- **Claude Code 플러그인**: [roboco-io/plugins](https://github.com/roboco-io/plugins)
- **Codex 오케스트레이션 기초**: [Claude + Codex 오케스트레이션](./03-codex-orchestration.md)
