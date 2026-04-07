---
name: draft
description: '단순 직필 — 아웃라인+백로그+brain 읽고 바로 원고 작성 (에이전트 체인·품질 루프 없음)'
---

# /draft — 단순 직필 커맨드

Canonical workflow: `.agent/workflows/draft-workflow.md`

규칙:
- 먼저 canonical workflow를 읽고 그대로 따른다.
- 이 파일은 Claude Code 슬래시 커맨드 진입점만 제공한다.
- 절차 충돌 시 canonical workflow가 우선한다.

사용자 요청: $ARGUMENTS

## 사용법

```
/draft <target>
```

- `target`:
  - `05` — 단일 챕터
  - `05-08` — 범위
  - `part-01` ~ `part-04` — Part 전체
  - `all` — 미완성 챕터 전부
  - `--force` — 이미 완성된 챕터도 덮어쓰기

예시:
```
/draft 05              ← 05장 한 개 작성
/draft 05-08           ← 05~08장 순차 작성
/draft part-02         ← Part 2 전체
/draft all             ← 미완성 전부
/draft 01 --force      ← 완성된 챕터 덮어쓰기
```

## 핵심 동작

1. 대상 챕터 결정 (이미 chapter.md 존재 시 스킵, --force면 덮어쓰기)
2. 챕터별로 아웃라인 + source-map 백로그 + brain 가이드 + writing-guide 읽기
3. 에이전트 1개로 바로 원고 작성 → `docs/part-{NN}/{XX}-chapter.md`
4. 같은 Part 내 챕터는 병렬 에이전트로 동시 작성 가능 (최대 4개)
5. 완료 시 요약 보고
