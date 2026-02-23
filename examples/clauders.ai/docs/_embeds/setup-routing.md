---
hidden: true
---

# 라우팅 패턴 — 고객 문의 자동 분류

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.

---

=== 여기서부터 복사 ===

아래 파일들을 생성해줘. 고객 문의를 자동 분류해서 전문 에이전트에게 보내는 환경이야. 경로는 현재 프로젝트 루트 기준이야.

---

## 파일 1: `CLAUDE.md`

```markdown
# 고객 문의 자동 분류 프로젝트

## 개요

고객 문의가 들어오면 유형을 판별하고, 전문 에이전트에게 배정해 답변을 생성한다.

## 패턴

라우팅(Routing) — 입력 유형에 따라 다른 전문가에게 보낸다. 분류가 정확해야 올바른 전문가에게 간다.

```
router → payment-agent / refund-agent / point-agent
```

## 파일 구조

- `docs/faq.md` — 자주 묻는 질문과 답변 기준
- `docs/policy.md` — 결제·환불·포인트 정책
- `input/` — 고객 문의 파일
- `output/` — 생성된 답변

## 커맨드

- `/respond` — 고객 문의에 대한 답변 생성
```

---

## 파일 2: `docs/faq.md`

```markdown
# FAQ

[자주 묻는 질문과 답변 기준을 여기에 작성]
```

---

## 파일 3: `docs/policy.md`

```markdown
# 정책

## 결제

[결제 관련 정책]

## 환불

[환불 관련 정책]

## 포인트

[포인트 관련 정책]
```

---

## 파일 4: `.claude/commands/respond.md`

```markdown
# 고객 문의 답변 (/respond)

사용자 요청: $ARGUMENTS

## 개요

`/respond`는 고객 문의를 분류하고 전문 에이전트가 답변을 생성한다.

```
/respond "결제가 안 돼요"
/respond input/inquiry-001.md
```

## 실행 흐름

1. `router` — 문의 유형 판별 (결제 / 환불 / 포인트 / 기타)
2. 유형에 따라 전문 에이전트 호출:
   - 결제 문제 → `payment-agent`
   - 환불 요청 → `refund-agent`
   - 포인트 문의 → `point-agent`
3. 전문 에이전트가 `docs/policy.md`, `docs/faq.md` 참조해 답변 생성

## 저장 경로

```
output/response-[문의번호].md
```

## 출력 요약

```
## /respond 완료

분류: [결제/환불/포인트]
담당: [에이전트명]
답변: output/response-[문의번호].md
```
```

---

## 파일 5: `.claude/agents/router.md`

```markdown
---
name: router
description: 고객 문의 유형을 판별하는 에이전트. 문의 내용을 읽고 결제/환불/포인트/기타로 분류해 반환한다.
model: haiku
---

# 문의 분류기

## 역할

고객 문의를 읽고 유형을 판별한다. 마스터가 이 결과를 보고 전문 에이전트를 호출한다.

## 분류 기준

| 유형 | 키워드·패턴 |
|------|-----------|
| 결제 | 결제 실패, 카드 오류, 승인, 결제 안 됨 |
| 환불 | 환불, 취소, 반품, 돌려받기 |
| 포인트 | 포인트, 적립, 사용, 소멸 |
| 기타 | 위에 해당 안 되는 것 |

## 출력

```
분류: [유형]
근거: [판별 이유 한 줄]
원문 요약: [문의 핵심 한 줄]
```
```

---

## 파일 6: `.claude/agents/payment-agent.md`

```markdown
---
name: payment-agent
description: 결제 문제를 처리하는 전문 에이전트. 결제 정책과 FAQ를 참조해 답변을 생성한다.
model: sonnet
---

# 결제 전문 에이전트

## 역할

결제 관련 문의에 대한 답변을 생성한다.

## 참조

- `docs/policy.md` — 결제 정책
- `docs/faq.md` — 기존 답변 패턴

## 답변 규칙

- 문제 원인 먼저 설명
- 해결 방법 단계별로
- 추가 도움 필요 시 안내
- 공감 표현은 한 줄만, 과하지 않게
```

---

## 파일 7: `.claude/agents/refund-agent.md`

```markdown
---
name: refund-agent
description: 환불 요청을 처리하는 전문 에이전트. 환불 정책을 참조해 가능 여부 판단과 답변을 생성한다.
model: sonnet
---

# 환불 전문 에이전트

## 역할

환불 관련 문의에 대한 답변을 생성한다.

## 참조

- `docs/policy.md` — 환불 정책
- `docs/faq.md` — 기존 답변 패턴

## 답변 규칙

- 환불 가능 여부 먼저 명시
- 가능하면: 절차 안내
- 불가능하면: 사유 + 대안 제시
- 정책 근거 포함
```

---

## 파일 8: `.claude/agents/point-agent.md`

```markdown
---
name: point-agent
description: 포인트 문의를 처리하는 전문 에이전트. 포인트 정책을 참조해 답변을 생성한다.
model: sonnet
---

# 포인트 전문 에이전트

## 역할

포인트 관련 문의에 대한 답변을 생성한다.

## 참조

- `docs/policy.md` — 포인트 정책
- `docs/faq.md` — 기존 답변 패턴

## 답변 규칙

- 현재 상태 확인 방법 안내
- 적립/사용/소멸 규칙 설명
- 필요 시 정책 근거 포함
```

---

이제 위 파일들을 모두 생성해줘. 생성 후:
1. `docs/`, `input/`, `output/` 폴더 생성
2. 어떤 파일을 만들었는지 목록만 간단히 알려줘.

=== 여기까지 복사 ===

---

## 세팅 후 할 것

### 1. docs/policy.md 작성

결제·환불·포인트 정책을 실제 내용으로 채운다.

### 2. docs/faq.md 작성

자주 묻는 질문과 답변 패턴을 넣는다.

### 3. 실행

```
/respond "결제가 안 돼요"
```
