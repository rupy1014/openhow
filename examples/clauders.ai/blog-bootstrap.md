# 블로그 연재 자동화 부트스트랩 프롬프트

> 이 파일 전체를 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.
> 아래 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사.

---

=== 여기서부터 복사 ===

아래 파일들을 생성해줘. 내 블로그 연재 자동화 환경 설정 파일들이야. 각 파일의 내용을 그대로 만들어줘. 경로는 현재 프로젝트 루트 기준이야.

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

## 금지 표현

- "상기와 같이", "전술한 바와 같이" — 공문투 금지
- "~하겠습니다" — 과도한 경어 금지
- "~인 것 같습니다" — 불필요한 완화 표현 금지

## 서두

- 질문으로 시작하거나, 결론부터 먼저.
- "안녕하세요, N번째 글입니다" 형식 금지.

## 마무리

- 다음 편 예고 한 줄 (있으면).
- 독자 행동 유도 한 줄 (있으면).
```

---

## 파일 3: `.claude/skills/plan/SKILL.md`

```markdown
---
name: plan
description: 블로그 연재 기획 에이전트. 시리즈 주제와 편 수를 받아 전체 목차와 회차별 개요를 작성. "/plan [시리즈 제목] [N편]"으로 호출.
user-invocable: true
allowed-tools: "Read, Write, AskUserQuestion"
---

# 시리즈 기획 (/plan)

## 실행 흐름

1. `CLAUDE.md` 읽기 — 프로젝트 개요, 독자 수준 파악
2. 기존 `series-plan.md` 있으면 읽기 (업데이트 모드)
3. 시리즈 구조 설계:
   - 전체 흐름: 도입 → 심화 → 마무리
   - 각 회차: 제목, 핵심 포인트 2~3개, 이전/다음 편 연결
4. `series-plan.md` 저장

## 출력 형식 (series-plan.md)

# [시리즈 제목]

타깃: [독자 설명]
총 편수: N편

---

## 1화. [제목]
- 핵심: [포인트 1], [포인트 2]
- 이 편이 끝나면 독자가 할 수 있는 것: [행동]

## 2화. [제목]
...
```

---

## 파일 4: `.claude/skills/write/SKILL.md`

```markdown
---
name: write
description: 블로그 포스트 작성 에이전트. series-plan.md의 해당 회차 개요 기반으로 초안 작성. "/write [N화]"로 호출.
user-invocable: true
allowed-tools: "Read, Write, Glob"
---

# 포스트 작성 (/write)

## 실행 흐름

1. `series-plan.md` 읽기 → 해당 회차 개요 파악
2. `docs/tone-and-manner.md` 읽기
3. `posts/` 안 기존 글 1~2개 읽기 (문체 일관성 확인)
4. 초안 작성 — 금지 표현 즉시 체크
5. `drafts/0N-[제목]-draft.md` 저장

## 초안 파일 형식

---
화수: N
상태: draft
---

[본문]

---
다음 편: [N+1화 제목 한 줄 예고]
```

---

## 파일 5: `.claude/skills/review/SKILL.md`

```markdown
---
name: review
description: 블로그 퇴고 에이전트. 초안을 docs/tone-and-manner.md 기준으로 검토하고 수정본을 posts/에 저장. "/review [N화]"로 호출.
user-invocable: true
allowed-tools: "Read, Write, Edit, Glob"
---

# 퇴고 (/review)

## 실행 흐름

1. `drafts/0N-*-draft.md` 읽기
2. `docs/tone-and-manner.md` 읽기
3. 아래 기준으로 검토 후 수정:

| 항목 | 기준 |
|------|------|
| 톤앤매너 | 금지 표현 없음, 말투 일관 |
| 서두 | 바로 본론으로 시작 |
| 흐름 | 문단 간 전환 자연스러운가 |
| 독자 수준 | 가정한 독자에게 맞는가 |
| 분량 | 800~1500자 |

4. 리뷰 기록 → `reviews/review-0N.md`
5. 수정 적용 → `posts/0N-[제목].md` 저장

## 출력

## /review N화 완료

수정 사항:
- [내용]

저장: posts/0N-[제목].md
상태: 발행 준비 완료 / 재작성 필요
```

---

이제 위 파일들을 모두 생성해줘. 생성 후:
1. `posts/`, `drafts/`, `reviews/` 폴더 생성 (각각 `.gitkeep` 파일 하나씩)
2. `series-plan.md` — 빈 파일로 생성
3. 어떤 파일을 만들었는지 목록만 간단히 알려줘.

=== 여기까지 복사 ===

---

## 사용 후 추가로 할 것

### 1. CLAUDE.md 수정

`CLAUDE.md` 안의 `[블로그 이름, 주제, 타깃 독자]` 부분을 실제 내용으로 채운다.

### 2. docs/tone-and-manner.md 수정

기본 가이드가 들어있지만, 내 말투에 맞게 고친다.

### 3. 첫 시리즈 기획

```
/plan "내 블로그 시리즈 제목" 10편
```
