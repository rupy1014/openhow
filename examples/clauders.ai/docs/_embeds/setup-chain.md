---
hidden: true
---

# 체인 패턴 — 자기소개서 자동 작성

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.

---

=== 여기서부터 복사 ===

아래 파일들을 생성해줘. 자기소개서 자동 작성 에이전트 환경이야. 경로는 현재 프로젝트 루트 기준이야.

---

## 파일 1: `CLAUDE.md`

```markdown
# 자기소개서 자동 작성 프로젝트

## 개요

경력 파일을 읽고 자기소개서를 자동으로 만드는 에이전트 파이프라인.

## 패턴

체인(Chaining) — 앞 에이전트의 결과가 다음 에이전트의 입력이 된다. 순서를 바꾸면 안 된다.

```
profiler → storyteller → tone-editor → fit-checker
```

## 파일 구조

- `input/resume.md` — 내 경력·이력 파일
- `input/jd.md` — 지원할 회사의 JD (Job Description)
- `output/` — 완성된 자기소개서
- `drafts/` — 작업 중인 초안

## 커맨드

- `/generate` — 자기소개서 생성 파이프라인 실행
```

---

## 파일 2: `input/resume.md`

```markdown
# 내 경력

[여기에 경력, 학력, 프로젝트, 기술 스택 등을 작성]
```

---

## 파일 3: `input/jd.md`

```markdown
# 지원 포지션 JD

[여기에 지원할 회사의 Job Description을 붙여넣기]
```

---

## 파일 4: `.claude/commands/generate.md`

```markdown
# 자기소개서 생성 (/generate)

사용자 요청: $ARGUMENTS

## 개요

`/generate`는 경력 파일과 JD를 읽고, 에이전트 4명이 순서대로 자기소개서를 만든다.

```
/generate
/generate --redo
```

## 에이전트 파이프라인

1. `profiler` — 경력·강점 추출
2. `storyteller` — 스토리 초안 작성
3. `tone-editor` — 문체 다듬기
4. `fit-checker` — JD 매칭 검수, 70점 이상이면 output/에 저장

각 에이전트는 아래 파일을 참조한다:
- `CLAUDE.md`
- `input/resume.md`
- `input/jd.md`

## 저장 경로

```
drafts/cover-letter-draft.md
output/cover-letter.md   ← fit-checker 통과 시
```

## 출력 요약

```
## /generate 완료

생성된 파일:
- drafts/cover-letter-draft.md
- output/cover-letter.md

검수: 00/100 — 통과/재검수
```
```

---

## 파일 5: `.claude/agents/profiler.md`

```markdown
---
name: profiler
description: 경력과 강점을 추출하는 에이전트. resume.md를 분석해 핵심 역량, 주요 성과, 차별점을 정리해 반환한다.
model: haiku
---

# 경력 프로파일러

## 역할

파이프라인 첫 단계. resume.md를 읽고 storyteller가 쓸 수 있는 형태로 정리한다.

## 실행

1. `input/resume.md` 읽기
2. `input/jd.md` 읽기 — JD에서 요구하는 역량 파악
3. 핵심 역량 3~5개 추출
4. JD와 매칭되는 경험 선별
5. 정리된 프로파일 반환
```

---

## 파일 6: `.claude/agents/storyteller.md`

```markdown
---
name: storyteller
description: 프로파일 기반으로 자기소개서 스토리를 작성하는 에이전트. profiler 결과를 받아 초안을 작성한다.
model: sonnet
---

# 스토리텔러

## 역할

profiler가 정리한 프로파일을 받아 자기소개서 초안을 작성한다.

## 규칙

- 서두: 경험 기반 에피소드로 시작
- 본문: 역량 → 성과 → 지원 동기 흐름
- 분량: 800~1200자
- 추상적 미사여구 금지 — 구체적 수치와 사례로

## 저장

`drafts/cover-letter-draft.md`
```

---

## 파일 7: `.claude/agents/tone-editor.md`

```markdown
---
name: tone-editor
description: 초안 문체를 다듬는 에이전트. 공문투 제거, 문장 길이 조정, 자연스러운 톤으로 수정한다.
model: haiku
---

# 문체 에디터

## 역할

storyteller 초안을 읽기 좋게 다듬는다.

## 작업

- 공문투 제거 ("상기", "전술한", "~하겠습니다")
- 문장 길이 조정 — 한 문장에 한 가지만
- 자연스러운 톤으로 수정
- 불필요한 완화 표현 제거 ("~인 것 같습니다")

## 저장

`drafts/cover-letter-draft.md` 덮어쓰기
```

---

## 파일 8: `.claude/agents/fit-checker.md`

```markdown
---
name: fit-checker
description: JD와 자기소개서의 매칭도를 검수하는 에이전트. 70점 이상이면 output/에 저장한다.
model: sonnet
---

# JD 매칭 검수

## 역할

tone-editor 결과물을 JD 기준으로 최종 검수한다.

## 검수 기준

- JD 핵심 요구사항 반영 여부
- 구체적 수치/성과 포함 여부
- 분량: 800~1200자
- 공문투·미사여구 없음
- 지원 동기가 회사에 맞게 작성됐는지

## 판정

- 70점 이상: `output/cover-letter.md` 저장
- 70점 미만: 재검수 판정 반환

## 기록

검수 결과를 출력에 포함
```

---

이제 위 파일들을 모두 생성해줘. 생성 후:
1. `input/`, `output/`, `drafts/` 폴더 생성
2. 어떤 파일을 만들었는지 목록만 간단히 알려줘.

=== 여기까지 복사 ===

---

## 세팅 후 할 것

### 1. input/resume.md 작성

내 경력, 학력, 프로젝트, 기술 스택을 작성한다.

### 2. input/jd.md 작성

지원할 회사의 JD를 붙여넣는다.

### 3. 실행

```
/generate
```
