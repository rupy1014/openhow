---
name: batch
description: '배치 처리 — Part 또는 커스텀 범위 순차 집필'
---

# /batch — Claude Adapter

Canonical workflow: `.agent/workflows/batch-workflow.md`

규칙:
- 먼저 canonical workflow를 읽고 그대로 따른다.
- 이 파일은 Claude Code 슬래시 커맨드 진입점만 제공한다.
- 절차 충돌 시 canonical workflow가 우선한다.

사용자 요청: $ARGUMENTS

## 사용법

```
/batch part-01          ← Part 1 (01-04) 순차 집필
/batch part-02          ← Part 2 (05-08)
/batch 05-06            ← 커스텀 범위
/batch next             ← writing-guide.md 순서 기준 다음 미완료 배치
/batch part-01 --skip-passed  ← 이미 pass된 챕터 건너뛰기
```
