---
name: book
description: '마스터 오케스트레이터 — 상태 감지, 적절한 커맨드로 라우팅'
---

# /book — Claude Adapter

Canonical workflow: `.agent/workflows/book-workflow.md`

규칙:
- 먼저 canonical workflow를 읽고 그대로 따른다.
- 이 파일은 Claude Code 슬래시 커맨드 진입점만 제공한다.
- 절차 충돌 시 canonical workflow가 우선한다.

사용자 요청: $ARGUMENTS

## 사용법

```
/book                  ← 전체 상태 파악 + 다음 액션 제안
/book --chapter 05     ← 특정 챕터 상태 + 라우팅
/book --part 2         ← 특정 Part 상태 + 라우팅
```
