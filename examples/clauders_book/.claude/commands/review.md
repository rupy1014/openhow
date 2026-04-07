---
name: review
description: '기존 챕터 품질 검토 — @quality-reviewer만 실행, 품질 루프 없음'
---

# /review — Claude Adapter

Canonical workflow: `.agent/workflows/review-workflow.md`

규칙:
- 먼저 canonical workflow를 읽고 그대로 따른다.
- 이 파일은 Claude Code 슬래시 커맨드 진입점만 제공한다.
- 절차 충돌 시 canonical workflow가 우선한다.

사용자 요청: $ARGUMENTS

## 사용법

```
/review 05             ← 05장 검토
/review 01-04          ← 범위 검토
/review all            ← 전체 검토
```
