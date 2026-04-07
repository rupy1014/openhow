---
name: status
description: '전체 진행 상태 표시 — .progress 기반 테이블 출력'
---

# /status — Claude Adapter

Canonical workflow: `.agent/workflows/status-workflow.md`

규칙:
- 먼저 canonical workflow를 읽고 그대로 따른다.
- 이 파일은 Claude Code 슬래시 커맨드 진입점만 제공한다.
- 절차 충돌 시 canonical workflow가 우선한다.

사용자 요청: $ARGUMENTS

## 사용법

```
/status                 ← 전체 현황
/status part-02         ← 특정 Part만
/status --detail        ← 상세 (에이전트별 상태 포함)
```
