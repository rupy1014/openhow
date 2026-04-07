---
name: resume
description: '중단된 집필 세션 복구 — .progress 기반'
---

# /resume — Claude Adapter

Canonical workflow: `.agent/workflows/resume-workflow.md`

규칙:
- 먼저 canonical workflow를 읽고 그대로 따른다.
- 이 파일은 Claude Code 슬래시 커맨드 진입점만 제공한다.
- 절차 충돌 시 canonical workflow가 우선한다.

사용자 요청: $ARGUMENTS

## 사용법

```
/resume                 ← 자동 감지 후 복구
/resume --chapter 05    ← 특정 챕터 복구
```
