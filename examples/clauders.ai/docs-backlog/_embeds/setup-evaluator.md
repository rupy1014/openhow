---
hidden: true
---

# 평가-개선 패턴 — 마케팅 문구 반복 최적화

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.

---

=== 여기서부터 복사 ===

아래 파일들을 생성해줘. 마케팅 문구를 반복 개선해서 최종본을 만드는 에이전트 환경이야. 경로는 현재 프로젝트 루트 기준이야.

---

## 파일 1: `CLAUDE.md`

```markdown
# 마케팅 문구 반복 최적화 프로젝트

## 개요

마케팅 문구를 작성하고, 평가하고, 피드백 반영해서 고치는 걸 반복한다. 기준 통과하면 끝.

## 패턴

평가-개선(Evaluator-Optimizer) — 만들고 → 평가하고 → 고치고를 반복한다. 초안이 바로 완성본인 적 없다.

```
writer ←→ evaluator (반복) → 통과 시 저장
```

## 파일 구조

- `input/brief.md` — 마케팅 브리프 (제품, 타깃, 목적)
- `docs/eval-criteria.md` — 평가 기준
- `output/` — 최종 통과된 문구
- `drafts/` — 작업 중인 초안과 피드백 기록

## 커맨드

- `/optimize` — 문구 최적화 반복 실행
```

---

## 파일 2: `input/brief.md`

```markdown
# 마케팅 브리프

## 제품/서비스

[제품명과 간단한 설명]

## 타깃 고객

[누구에게 보여줄 문구인지]

## 목적

[인지도 / 전환 / 이벤트 홍보 등]

## 채널

[SNS / 배너 / 이메일 / 랜딩페이지 등]

## 참고 사항

[톤, 금지 표현, 필수 포함 키워드 등]
```

---

## 파일 3: `docs/eval-criteria.md`

```markdown
# 평가 기준

## 채점 항목 (각 20점, 총 100점)

| 항목 | 기준 |
|------|------|
| 명확성 | 한 번 읽고 바로 이해되는가 |
| 매력도 | 멈추고 읽게 만드는 힘이 있는가 |
| 타깃 적합성 | 타깃 고객에게 맞는 톤과 메시지인가 |
| 행동 유도 | CTA가 명확하고 자연스러운가 |
| 브랜드 일관성 | 브랜드 톤에 맞는가 |

## 통과 기준

- **80점 이상**: 통과 → 최종본 저장
- **80점 미만**: 피드백과 함께 writer에게 반환
- **최대 반복**: 3회. 3회 후에도 미달이면 가장 높은 점수의 버전을 최종본으로 저장

## 피드백 규칙

- "별로다" 금지. 구체적으로 어디가 왜 안 되는지 명시
- 개선 방향을 반드시 포함
```

---

## 파일 4: `.claude/commands/optimize.md`

```markdown
# 문구 최적화 (/optimize)

사용자 요청: $ARGUMENTS

## 개요

`/optimize`는 문구를 만들고, 평가하고, 고치는 걸 기준 통과할 때까지 반복한다.

```
/optimize
/optimize --max-rounds 5
```

## 실행 흐름

반복 구조다. 최대 3회(기본값) 반복한다.

```
Round 1: writer(초안) → evaluator(평가) → 미달 시 피드백 반환
Round 2: writer(수정) → evaluator(평가) → 미달 시 피드백 반환
Round 3: writer(수정) → evaluator(평가) → 통과 또는 최고 점수 버전 저장
```

## 에이전트

1. `writer` — 초안 작성 / 피드백 반영 수정
2. `evaluator` — 평가 + 피드백 생성

각 에이전트는 아래 파일을 참조한다:
- `CLAUDE.md`
- `input/brief.md`
- `docs/eval-criteria.md`

## 저장 경로

```
drafts/copy-round-1.md
drafts/copy-round-2.md
drafts/copy-round-3.md
drafts/eval-round-1.md
drafts/eval-round-2.md
output/copy-final.md   ← 통과 시
```

## 출력 요약

```
## /optimize 완료

라운드: N/3
최종 점수: 00/100
결과: 통과 / 최고 점수 버전 채택
파일: output/copy-final.md
```
```

---

## 파일 5: `.claude/agents/writer.md`

```markdown
---
name: writer
description: 마케팅 문구를 작성하는 에이전트. 초안을 쓰거나, evaluator 피드백을 반영해 수정한다.
model: sonnet
---

# 카피라이터

## 역할

마케팅 문구를 작성한다. 첫 라운드에는 초안을, 이후에는 evaluator 피드백을 반영해 수정한다.

## 참조

- `input/brief.md` — 브리프
- `docs/eval-criteria.md` — 평가 기준 (어떤 기준으로 채점되는지 미리 파악)

## 초안 규칙

- 브리프의 타깃과 목적에 맞게
- 첫 줄에서 시선을 잡을 것
- CTA 포함
- 채널에 맞는 분량

## 수정 규칙

- evaluator 피드백을 **그대로** 반영
- 피드백에 언급 안 된 부분은 건드리지 않기
- 수정 전/후 비교가 가능하도록

## 저장

`drafts/copy-round-N.md`
```

---

## 파일 6: `.claude/agents/evaluator.md`

```markdown
---
name: evaluator
description: 마케팅 문구를 평가하는 에이전트. eval-criteria.md 기준으로 채점하고, 미달 시 구체적 피드백을 반환한다.
model: sonnet
---

# 평가자

## 역할

writer가 쓴 문구를 `docs/eval-criteria.md` 기준으로 채점한다.

## 채점

| 항목 | 점수 (/20) | 코멘트 |
|------|-----------|--------|
| 명확성 | | |
| 매력도 | | |
| 타깃 적합성 | | |
| 행동 유도 | | |
| 브랜드 일관성 | | |
| **합계** | **/100** | |

## 판정

- 80점 이상: **통과** → 마스터에게 통과 판정 반환
- 80점 미만: **미달** → 피드백과 함께 반환

## 피드백 규칙

- 점수가 낮은 항목 중심으로
- "이렇게 고쳐라"가 아니라 "이 부분이 이래서 안 된다 + 이런 방향으로"
- 구체적 예시 포함

## 저장

`drafts/eval-round-N.md`
```

---

이제 위 파일들을 모두 생성해줘. 생성 후:
1. `input/`, `output/`, `drafts/`, `docs/` 폴더 생성
2. 어떤 파일을 만들었는지 목록만 간단히 알려줘.

=== 여기까지 복사 ===

---

## 세팅 후 할 것

### 1. input/brief.md 작성

제품, 타깃, 목적, 채널을 실제 내용으로 채운다.

### 2. docs/eval-criteria.md 수정

평가 기준을 자기 상황에 맞게 조정한다. 통과 점수, 최대 반복 횟수도 여기서 바꾼다.

### 3. 실행

```
/optimize
```
