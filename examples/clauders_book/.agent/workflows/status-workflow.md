# status-workflow — 진행 현황 표시

`.progress`와 `docs/toc-final.md`를 읽어 전체 프로젝트 진행 상태를 테이블로 출력한다.
에이전트를 스폰하지 않는다. 읽기 전용.

---

## Step 1: 데이터 수집

1. `.progress` 읽기 (없으면 전체 pending으로 처리)
2. `docs/toc-final.md` 읽기 → 17장 제목 목록 추출
3. 각 챕터별 `docs/part-{NN}/{XX}-chapter.md` 존재 여부 확인

---

## Step 2: 테이블 생성

### 기본 출력 (`/status`)

```markdown
## 클로더스 북 진행 현황

### Part 1. ChatGPT 시대, Codex로 자동화 시작하기
| Ch | 제목 | 유형 | 상태 | 점수 |
|----|------|------|------|------|
| 01 | 한 줄 설치, 바로 실행 | practice | PASS | 8/10 |
| 02 | 자동화, 감 잡기 | practice | writing | — |
| 03 | 여기서 잠깐 — 초보자를 위한 설명 | concept | pending | — |
| 04 | 웹소설도 자동화된다고? | practice | pending | — |

### Part 2. 기초 체력 — 바이브코딩 입문
| Ch | 제목 | 유형 | 상태 | 점수 |
|----|------|------|------|------|
| 05 | ... | ... | pending | — |
...

### Part 3. 자동화 구조 읽기 — OpenClaw와 함께
...

### Part 4. 실전 자동화 유즈케이스 — OpenClaw로
...

---
전체: 1/17 완료 (5.9%)
현재 배치: part-01
권장: /resume (02장 이어쓰기)
```

### 상세 출력 (`/status --detail`)

기본 테이블에 에이전트별 상태 컬럼 추가:

```markdown
| Ch | 제목 | rewriter | story/trouble | quality | 라운드 | 상태 |
|----|------|----------|---------------|---------|--------|------|
| 01 | ... | done | trouble:done | 8/10 | 1 | PASS |
| 02 | ... | done | — | pending | 0 | writing |
```

### Part 필터 (`/status part-02`)

해당 Part만 표시.

---

## Step 3: 권장 다음 액션

상태에 따라 하나의 권장 커맨드를 제안:

| 상황 | 권장 |
|------|------|
| 전체 pending | `/batch part-01` |
| 진행 중 챕터 있음 | `/resume` |
| 현재 배치 완료 | `/batch next` |
| 전체 완료 | `/review all` (최종 검토) |
| 실패 챕터 있음 | `/write {XX}` (해당 챕터 재작성) |
