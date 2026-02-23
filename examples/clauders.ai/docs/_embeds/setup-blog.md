---
hidden: true
---

# 블로그 연재 자동화 세팅

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.

---

=== 여기서부터 복사 ===

아래 파일들을 생성해줘. 블로그 연재 자동화 환경 설정 파일들이야. 경로는 현재 프로젝트 루트 기준이야.

---

## 파일 1: `CLAUDE.md`

```markdown
# 블로그 프로젝트 규칙

## 프로젝트 개요

[블로그 이름, 주제, 타깃 독자 여기 작성]

## 글쓰기 원칙

- 톤앤매너: `docs/tone-and-manner.md` 참조
- 독자 수준: 비개발자, 실무 중심
- 서론 없이 바로 본론으로
- 글 길이: 800~1500자

## 파일 구조

- `series-plan.md` — 전체 연재 기획
- `docs/tone-and-manner.md` — 말투와 스타일 기준
- `posts/` — 완성된 글
- `drafts/` — 작업 중인 초안
- `reviews/` — 퇴고 기록
```

---

## 파일 2: `docs/tone-and-manner.md`

```markdown
# 톤앤매너 가이드

## 말투

- 구어체. 독자에게 직접 말하는 느낌.
- "저는", "제가" 대신 "나는", "내가" — 편안한 거리감.

## 문체 원칙

- 짧은 문장 우선. 한 문장에 한 가지만.
- 전문용어는 첫 등장 시 괄호로 설명.
- 감정 직접 진술 금지 — 상황과 행동으로 전달.

## 금지 표현

- "상기와 같이", "전술한 바와 같이" — 공문투 금지
- "~하겠습니다" — 과도한 경어 금지
- "~인 것 같습니다" — 불필요한 완화 표현 금지
- "안녕하세요, N번째 글입니다" — 서두 인사 금지

## 서두

- 질문 또는 결론부터. 독자가 계속 읽게 만드는 첫 줄.
- 같은 서두 패턴 반복 금지.

## 마무리

- 다음 편 예고 한 줄 (있으면).
- 독자 행동 유도 한 줄 (있으면).
```

---

## 파일 3: `.claude/commands/plan.md`

```markdown
# 블로그 연재 기획 (/plan)

사용자 요청: $ARGUMENTS

## 개요

`/plan`은 시리즈 전체 목차를 `series-plan.md`에 작성한다.

## 실행 흐름

1. `CLAUDE.md` 읽기 — 프로젝트 개요, 독자 수준 파악
2. 기존 `series-plan.md` 있으면 읽기 (업데이트 모드)
3. 시리즈 구조 설계: 도입 → 심화 → 마무리
4. 각 회차: 제목, 핵심 포인트 2~3개, 독자가 얻는 것
5. `series-plan.md` 저장
```

---

## 파일 4: `.claude/commands/write.md`

```markdown
# 블로그 포스트 작성 (/write)

사용자 요청: $ARGUMENTS

## 개요

`/write`는 초안 작성부터 검수까지 에이전트 파이프라인으로 처리한다.

## 에이전트 파이프라인

1. `series-manager` — 시리즈 컨텍스트 파악
2. `outline-writer` — 이번 회차 개요 설계
3. `writer` — 초안 작성
4. `style-touch` — 문체 다듬기
5. `proofreader` — 기준 검수, 80점 이상이면 posts/에 저장

각 에이전트는 아래 파일을 참조한다:
- `CLAUDE.md`
- `docs/tone-and-manner.md`
- `series-plan.md`

## 저장 경로

drafts/0N-[제목]-draft.md
reviews/review-0N.md
posts/0N-[제목].md   ← proofreader 통과 시

## proofreader 통과 기준

- 서두: 질문 또는 결론으로 시작
- 이전 편과 다른 서두 패턴
- 금지 표현 없음
- 분량: 800~1500자
- 독자가 얻는 것 마지막에 명확히 전달

판정: 80점 이상 통과 / 미만 style-touch 재실행
```

---

## 파일 5: `.claude/commands/review.md`

```markdown
# 발행 전 최종 퇴고 (/review)

사용자 요청: $ARGUMENTS

## 실행 흐름

1. `posts/0N-[제목].md` 읽기
2. `docs/tone-and-manner.md` 읽기
3. 이전 편 1~2개 읽기 — 흐름·말투 일관성 확인
4. 수정 적용 → `posts/0N-[제목].md` 덮어쓰기
5. 리뷰 기록 → `reviews/review-0N-final.md`
```

---

## 파일 6: `.claude/agents/series-manager.md`

```markdown
---
name: series-manager
description: 시리즈 흐름을 관리하는 에이전트. series-plan.md와 posts/를 분석해 이번 회차 컨텍스트를 요약해 반환한다.
model: haiku
---

# 시리즈 매니저

1. `series-plan.md` 읽기 — 해당 회차 개요 파악
2. `posts/` 스캔 — 이미 쓴 편 확인
3. 직전 편 읽기 — 말투, 흐름 파악
4. 이번 회차 컨텍스트 요약 후 반환
```

---

## 파일 7: `.claude/agents/outline-writer.md`

```markdown
---
name: outline-writer
description: 이번 회차 상세 개요를 설계하는 에이전트. series-manager 컨텍스트를 받아 서두 훅, 본문 섹션, 마무리 방향을 작성해 반환한다.
model: haiku
---

# 개요 작성

series-manager 컨텍스트를 받아 이번 회차 상세 개요를 작성한다.

- 서두 훅 아이디어 2개
- 본문 섹션 3~5개 (각 핵심 포인트)
- 마무리 방향
```

---

## 파일 8: `.claude/agents/writer.md`

```markdown
---
name: writer
description: 개요 기반으로 블로그 초안을 작성하는 에이전트. docs/tone-and-manner.md 기준으로 작성하고 drafts/에 저장한다.
model: sonnet
---

# 블로그 작성

outline-writer 개요 기반으로 초안을 작성한다.

- `docs/tone-and-manner.md` 금지 표현 즉시 체크
- 분량: 800~1500자
- 서두 패턴: 직전 편과 다르게
- 저장: `drafts/0N-[제목]-draft.md`
```

---

## 파일 9: `.claude/agents/style-touch.md`

```markdown
---
name: style-touch
description: 초안 문체를 다듬는 에이전트. 금지 표현 제거, 문장 길이 조정, 서두 패턴 다양화를 담당해 반환한다.
model: haiku
---

# 문체 다듬기

writer 초안을 `docs/tone-and-manner.md` 기준으로 다듬는다.

- 금지 표현 제거
- 문장 길이 조정 (한 문장 한 가지)
- 서두 패턴 다양화
- 저장: `drafts/0N-[제목]-draft.md` 덮어쓰기
```

---

## 파일 10: `.claude/agents/proofreader.md`

```markdown
---
name: proofreader
description: 블로그 초안을 검수하는 에이전트. 톤앤매너, 분량, 시리즈 흐름을 검증하고 80점 이상이면 posts/에 저장한다.
model: sonnet
---

# 퇴고 검수

style-touch 결과물을 최종 검수한다.

- 서두: 질문 또는 결론으로 시작
- 이전 편과 다른 서두 패턴
- 금지 표현 없음
- 4문장 연속 구간 없음
- 분량: 800~1500자
- 독자가 얻는 것 명확

판정: 80점 이상 → `posts/0N-[제목].md` 저장 / 미만 → 재검수 판정 반환
기록: `reviews/review-0N.md`
```

---

이제 위 파일들을 모두 생성해줘. 생성 후:
1. `posts/`, `drafts/`, `reviews/`, `docs/` 폴더 생성
2. `series-plan.md` — 빈 파일로 생성
3. 어떤 파일을 만들었는지 목록만 간단히 알려줘.

=== 여기까지 복사 ===
