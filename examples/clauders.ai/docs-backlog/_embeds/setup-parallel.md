---
hidden: true
---

# 병렬 패턴 — SNS 포스팅 동시 생산

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.

---

=== 여기서부터 복사 ===

아래 파일들을 생성해줘. SNS 포스팅 5개를 동시에 만드는 에이전트 환경이야. 경로는 현재 프로젝트 루트 기준이야.

---

## 파일 1: `CLAUDE.md`

```markdown
# SNS 포스팅 동시 생산 프로젝트

## 개요

제품 정보를 읽고 5가지 앵글의 SNS 포스팅을 동시에 생성한다.

## 패턴

병렬(Parallelization) — 서로 독립된 작업을 동시에 돌린다. 5개를 순서대로 하면 5배, 동시에 하면 1배.

```
에이전트-1 (기능 소개)
에이전트-2 (고객 후기)     ← 5개 동시 실행
에이전트-3 (비하인드)
에이전트-4 (수치·데이터)
에이전트-5 (질문형 훅)
```

## 파일 구조

- `input/product.md` — 제품 정보
- `docs/brand-tone.md` — 브랜드 톤앤매너
- `output/` — 완성된 포스팅

## 커맨드

- `/post` — SNS 포스팅 5개 동시 생성
```

---

## 파일 2: `input/product.md`

```markdown
# 제품 정보

## 제품명

[제품명]

## 핵심 특징

- [특징 1]
- [특징 2]
- [특징 3]

## 타깃 고객

[누구를 위한 제품인지]

## 가격

[가격 정보]

## 고객 후기 (있으면)

[실제 고객 후기]
```

---

## 파일 3: `docs/brand-tone.md`

```markdown
# 브랜드 톤앤매너

## 말투

[브랜드의 말투 — 예: 친근하고 캐주얼 / 전문적이고 신뢰감 / 유머러스]

## SNS 포스팅 규칙

- 한 포스트 300자 이내
- 이모지 적절히 사용
- CTA(행동 유도) 마지막에 한 줄
- 해시태그 3~5개

## 금지 표현

[쓰면 안 되는 표현들]
```

---

## 파일 4: `.claude/commands/post.md`

```markdown
# SNS 포스팅 생성 (/post)

사용자 요청: $ARGUMENTS

## 개요

`/post`는 제품 정보를 읽고 5가지 앵글의 포스팅을 동시에 생성한다.

```
/post
/post --angle "기능 소개"
```

## 에이전트 (병렬 실행)

5개 에이전트를 **동시에** 실행한다. 서로 결과를 기다리지 않는다.

1. `angle-feature` — 기능 소개 앵글
2. `angle-review` — 고객 후기 앵글
3. `angle-behind` — 비하인드 스토리 앵글
4. `angle-data` — 수치·데이터 앵글
5. `angle-hook` — 질문형 훅 앵글

각 에이전트는 아래 파일을 참조한다:
- `CLAUDE.md`
- `input/product.md`
- `docs/brand-tone.md`

## 저장 경로

```
output/post-feature.md
output/post-review.md
output/post-behind.md
output/post-data.md
output/post-hook.md
```

## 출력 요약

```
## /post 완료

생성된 파일:
- output/post-feature.md
- output/post-review.md
- output/post-behind.md
- output/post-data.md
- output/post-hook.md
```
```

---

## 파일 5: `.claude/agents/angle-feature.md`

```markdown
---
name: angle-feature
description: 제품 기능 소개 앵글의 SNS 포스팅을 작성하는 에이전트.
model: haiku
---

# 기능 소개 앵글

## 역할

제품의 핵심 기능을 소개하는 포스팅을 작성한다.

## 규칙

- `input/product.md`에서 핵심 특징 중심으로
- `docs/brand-tone.md` 톤 준수
- 300자 이내
- "이 기능이 왜 좋은지"를 독자 관점에서

## 저장

`output/post-feature.md`
```

---

## 파일 6: `.claude/agents/angle-review.md`

```markdown
---
name: angle-review
description: 고객 후기 앵글의 SNS 포스팅을 작성하는 에이전트.
model: haiku
---

# 고객 후기 앵글

## 역할

고객 후기를 활용한 포스팅을 작성한다.

## 규칙

- 실제 후기가 있으면 인용·각색
- 없으면 타깃 고객의 전형적 경험으로 구성
- 공감 포인트 중심
- 300자 이내

## 저장

`output/post-review.md`
```

---

## 파일 7: `.claude/agents/angle-behind.md`

```markdown
---
name: angle-behind
description: 비하인드 스토리 앵글의 SNS 포스팅을 작성하는 에이전트.
model: haiku
---

# 비하인드 스토리 앵글

## 역할

제품이 만들어진 배경이나 과정을 담은 포스팅을 작성한다.

## 규칙

- 왜 만들었는지, 어떤 고민이 있었는지
- 브랜드의 진정성을 보여주는 톤
- 300자 이내

## 저장

`output/post-behind.md`
```

---

## 파일 8: `.claude/agents/angle-data.md`

```markdown
---
name: angle-data
description: 수치·데이터 앵글의 SNS 포스팅을 작성하는 에이전트.
model: haiku
---

# 수치·데이터 앵글

## 역할

숫자와 데이터를 활용한 포스팅을 작성한다.

## 규칙

- 제품 스펙, 성능 수치, 사용자 수 등 활용
- 비교 데이터가 있으면 활용 (전/후, 경쟁사 대비)
- 숫자가 임팩트 있게 보이도록 구성
- 300자 이내

## 저장

`output/post-data.md`
```

---

## 파일 9: `.claude/agents/angle-hook.md`

```markdown
---
name: angle-hook
description: 질문형 훅 앵글의 SNS 포스팅을 작성하는 에이전트.
model: haiku
---

# 질문형 훅 앵글

## 역할

질문으로 시작해 호기심을 유발하는 포스팅을 작성한다.

## 규칙

- 첫 줄: 독자가 멈출 수밖에 없는 질문
- 본문: 질문에 대한 답 = 제품 소개
- 마지막: CTA
- 300자 이내

## 저장

`output/post-hook.md`
```

---

이제 위 파일들을 모두 생성해줘. 생성 후:
1. `input/`, `output/`, `docs/` 폴더 생성
2. 어떤 파일을 만들었는지 목록만 간단히 알려줘.

=== 여기까지 복사 ===

---

## 세팅 후 할 것

### 1. input/product.md 작성

제품 정보를 실제 내용으로 채운다.

### 2. docs/brand-tone.md 작성

브랜드 말투와 SNS 규칙을 채운다.

### 3. 실행

```
/post
```
