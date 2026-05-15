---
title: "subagent Explore vs Plan, 언제 뭐 쓸지"
description: "둘 다 read-only 라 헷갈렸는데, 실제로 써보면 역할이 다르다. 내가 구분하는 기준."
date: 2026-05-09
author: "minji"
authorHandle: "@minji"
authorBio: "프론트엔드 개발자, 사이드로 백오피스 자동화 만지는 중"
tags: ["subagent", "워크플로우"]
slug: "explore-vs-plan"
---

Claude Code 의 subagent 중에 Explore 와 Plan 이 둘 다 read-only 인데, 처음엔 차이가 잘 안 보였다. 몇 주 써보고 정리.

## 한 줄 차이

- **Explore** — "이게 어디 있어?" 에 답한다.
- **Plan** — "이걸 어떻게 해야 해?" 에 답한다.

Explore 는 검색이고, Plan 은 설계다.

## Explore 가 좋은 순간

```
"OAuth 콜백 처리하는 코드 어디 있지?"
"이 회사 이름이 등장하는 파일 다 찾아줘"
"workspace type 정의가 어느 모듈에 있어?"
```

답이 파일 경로 + 5-10줄 발췌로 떨어지는 질문들. quick / medium / very thorough 로 검색 폭을 조절한다.

내 경험상 **3번 이상 grep 해야 될 것 같으면 Explore 한 번** 쓰는 게 본인 context 도 안 더럽히고 빠르다.

## Plan 이 좋은 순간

```
"세션 저장소를 Redis 로 옮기려면 뭘 건드려야 해?"
"이 마이그레이션 어떻게 쪼개야 안전해?"
"기능 A 추가하면서 기존 B 안 깨지는 순서는?"
```

답이 **단계 + 결정점 + 트레이드오프** 로 와야 하는 질문들. 코드 매핑은 부수적이고 핵심은 "어떤 순서로 어떤 결정을 내릴지" 다.

## 둘 다 read-only 인데 왜 갈리지?

각자 다른 잘하는 영역이 있어서 같다. 둘 다 코드를 안 고치지만:

- Explore 는 **scope 가 좁고 정답이 있는** 질문에 강하다 (검색)
- Plan 은 **scope 가 넓고 정답이 여러 개인** 질문에 강하다 (설계)

질문을 던질 때 "이건 어디 있어?" 인지 "이건 어떻게 해?" 인지 한 번 자문하면 결정이 깔끔하다.

## 내가 자주 하는 실수

큰 작업 들어갈 때 Plan 안 부르고 그냥 main agent 에 던지는 거. 한 번에 다 하려다가 context 폭발하고 다시 시작하게 된다.

요즘은 큰 작업은 무조건 **Plan → 결정 확인 → 실행** 흐름으로 간다. 결정 확인 단계가 5분 더 걸려도 전체는 빨라진다.
