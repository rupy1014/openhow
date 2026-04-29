---
hidden: true
---

# 블로그 연재 자동화 세팅

> 이 파일의 “=== 여기서부터 복사 ===” 부터 “=== 여기까지 복사 ===” 까지 복사해서 새 Claude Code 세션에 붙여넣으면 된다.

---

=== 여기서부터 복사 ===

아래 파일들을 생성해줘. 블로그 연재 자동화 환경 설정 파일들이야. 경로는 현재 프로젝트 루트 기준이야.

---

## 파일 1: `CLAUDE.md`

```markdown
# 블로그 프로젝트 규칙

## 이 프로젝트는 뭐냐

[블로그 이름, 주제, 타깃 독자 — 직접 채울 것]

## 결과물 기준

- 경험담처럼 읽혀야 한다.
- 강의체로 쓰지 않는다.
- 실패 가능성과 현실 비용을 숨기지 않는다.
- 각 글 마지막에는 독자가 바로 해볼 행동을 남긴다.
- 분량: 800~1500자

## 참조 문서

- 톤앤매너: `docs/tone-and-manner.md`
- 글 구조: `docs/article-structure.md`
- 검수 기준: `docs/checklist.md`
- 연재 목차: `series-plan.md`
```

---

## 파일 2: `docs/tone-and-manner.md`

```markdown
# 톤앤매너

## 기본 톤

- 친한 선배가 옆에서 말하듯 쓴다.
- 멋을 부린 문장 대신 바로 이해되는 문장을 쓴다.
- 과장된 성공담처럼 쓰지 않는다.
- 강의체("~합니다", "~하세요")를 피하고 경험담처럼 쓴다.

## 자주 쓰는 표현

- "처음엔 이렇게 보면 돼."
- "여기서 막히는 게 정상이다."
- "일단 작게 해보자."

## 피할 표현

- 무조건 성공한다 / 누구나 쉽게 / 이 방법만 알면 끝
- "안녕하세요, N번째 글입니다" 류 서두 인사
- "~인 것 같습니다" 같은 불필요한 완화 표현
```

---

## 파일 3: `docs/article-structure.md`

```markdown
# 글 구조 기준

## 서두

- 질문 또는 결론으로 시작.
- 직전 회차와 다른 패턴.

## 본문

- 한 문장에 한 가지만.
- 4문장 연속 구간 금지.
- 전문용어는 첫 등장 시 괄호로 짧게 설명.

## 마무리

- 이번 글에서 독자가 얻는 것 한 줄.
- 오늘 바로 해볼 행동 한 줄.
```

---

## 파일 4: `docs/checklist.md`

```markdown
# 검수 체크리스트

## 통과 기준 (80점 이상)

- [ ] 서두가 질문 또는 결론으로 시작하는가
- [ ] 직전 회차와 서두 패턴이 다른가
- [ ] 금지 표현이 없는가
- [ ] 4문장 연속 구간이 없는가
- [ ] 분량 800~1500자
- [ ] 마지막에 독자가 얻는 것이 명확한가
- [ ] 마지막에 오늘 해볼 행동이 한 줄 있는가

## 미달 시

- 80점 미만이면 `style-editor`로 다시 보낸다.
- 미달 사유는 `reviews/review-0N.md`에 기록한다.
```

---

## 파일 5: `series-plan.md`

```markdown
# 연재 기획

## 블로그 컨셉

[한두 줄로 — 직접 채울 것]

## 회차 목차

1. 1화 — [제목]
2. 2화 — [제목]
3. 3화 — [제목]

## 회차별 의도

- 1화: [무엇을 전달하는가]
- 2화: [무엇을 전달하는가]
- 3화: [무엇을 전달하는가]
```

---

## 파일 6: `.claude/commands/write.md`

```markdown
# /write

사용자 요청: $ARGUMENTS

인자로 받은 회차의 블로그 글을 소재 판단부터 검수까지 처리한다.

## 읽을 문서

- CLAUDE.md
- series-plan.md
- docs/tone-and-manner.md
- docs/article-structure.md
- docs/checklist.md
- references/processed/ 안의 관련 샘플

## 실행 흐름

1. `series-manager`가 series-plan.md에서 해당 회차의 위치를 확인한다.
2. `story-planner`가 독자 관점과 전개 방식을 정리한다.
3. `writer`가 말투와 구조 문서를 참고해 초안을 작성한다.
4. `style-editor`가 docs/tone-and-manner.md 기준으로 퇴고한다.
5. `proofreader`가 docs/checklist.md 기준으로 검수한다.
6. 80점 이상이면 posts/0N-[제목].md로 저장한다.
7. 80점 미만이면 style-editor로 다시 보낸다 (최대 3회).

## 저장 경로

- 작업 중: drafts/0N-[제목]-draft.md
- 검수 기록: reviews/review-0N.md
- 최종본: posts/0N-[제목].md
```

---

## 파일 7: `.claude/agents/series-manager.md`

```markdown
---
name: series-manager
description: 연재 흐름을 관리하는 담당자. series-plan.md와 posts/를 분석해 이번 회차의 컨텍스트를 요약해 반환한다.
model: haiku
---

# 시리즈 매니저

1. series-plan.md 읽기 — 해당 회차 의도 파악
2. posts/ 스캔 — 이미 쓴 편 확인
3. 직전 편 읽기 — 말투, 흐름 파악
4. 이번 회차 컨텍스트 요약 후 반환
```

---

## 파일 8: `.claude/agents/story-planner.md`

```markdown
---
name: story-planner
description: 회차 개요를 설계하는 담당자. series-manager 컨텍스트를 받아 서두 훅, 본문 섹션, 마무리 방향을 작성해 반환한다.
model: haiku
---

# 스토리 플래너

series-manager 컨텍스트를 받아 이번 회차 개요를 설계한다.

- 서두 훅 아이디어 2개
- 본문 섹션 3~5개 (각 핵심 포인트)
- 마무리 방향 (얻는 것 + 해볼 행동)
- 참조: docs/article-structure.md
```

---

## 파일 9: `.claude/agents/writer.md`

```markdown
---
name: writer
description: 블로그 초안을 작성하는 담당자. story-planner 개요와 docs/tone-and-manner.md를 기준으로 초안을 쓰고 drafts/에 저장한다.
model: sonnet
---

# 작가

story-planner 개요를 받아 초안을 작성한다.

## 맡는 문서

- CLAUDE.md
- docs/tone-and-manner.md
- docs/article-structure.md
- references/processed/ 관련 샘플

## 하는 일

- 분량: 800~1500자
- 금지 표현은 작성 중에 즉시 체크
- 서두 패턴은 직전 편과 다르게
- 저장: drafts/0N-[제목]-draft.md

## 하지 않을 일

- 전체 연재 목차를 새로 바꾸지 않는다.
- 최종 검수까지 혼자 하지 않는다.
```

---

## 파일 10: `.claude/agents/style-editor.md`

```markdown
---
name: style-editor
description: 초안 문체를 다듬는 담당자. 금지 표현 제거, 문장 길이 조정, 서두 패턴 다양화를 담당한다.
model: haiku
---

# 문체 편집자

writer 초안을 docs/tone-and-manner.md 기준으로 다듬는다.

- 금지 표현 제거
- 문장 길이 조정 (한 문장 한 가지)
- 4문장 연속 구간 끊기
- 서두 패턴 다양화
- 저장: drafts/0N-[제목]-draft.md 덮어쓰기
```

---

## 파일 11: `.claude/agents/proofreader.md`

```markdown
---
name: proofreader
description: 블로그 초안을 검수하는 담당자. docs/checklist.md 기준으로 점수를 매기고 80점 이상이면 posts/에 저장한다.
model: sonnet
---

# 검수자

style-editor 결과물을 최종 검수한다.

## 검수 기준

- docs/checklist.md 항목 전부 확인
- 점수: 80점 이상 통과
- 미달이면 style-editor로 재검수 판정 반환

## 저장

- 통과: posts/0N-[제목].md
- 기록: reviews/review-0N.md
```

---

이제 위 파일들을 모두 생성해줘. 생성 후:

1. `posts/`, `drafts/`, `reviews/`, `docs/`, `references/raw/`, `references/processed/` 폴더 생성
2. 어떤 파일을 만들었는지 목록만 간단히 알려줘.

=== 여기까지 복사 ===
