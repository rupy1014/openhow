---
name: write
description: '챕터 집필 — 아웃라인+백로그 → @rewriter → 조건부 에이전트 → @quality-reviewer → 품질 루프'
---

# /write — Claude Adapter

Canonical workflow: `.agent/workflows/write-workflow.md`

규칙:
- 먼저 canonical workflow를 읽고 그대로 따른다.
- 이 파일은 Claude Code 슬래시 커맨드 진입점만 제공한다.
- 절차 충돌 시 canonical workflow가 우선한다.

사용자 요청: $ARGUMENTS

## 사용법

```
/write <chapter_number>
```

- `chapter_number`: 01~17 (2자리 zero-pad)

예시:
```
/write 01          ← 01장 풀 파이프라인
/write 09          ← 09장 (OpenClaw 설치, practice)
/write 03          ← 03장 (초보자 설명, concept)
/write 05 --force  ← 이미 완료된 챕터 재작성
```
