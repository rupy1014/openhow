---
title: "Claude Code 첫 PR 만들기 — 한 시간 만에 끝낸 후기"
description: "타입 에러 두 줄 잡는 PR을 Claude Code 와 함께 한 시간 안에 머지까지. 어떤 식으로 일이 굴러갔는지 기록."
date: 2026-05-12
author: "rupy"
authorHandle: "@rupy"
authorBio: "Cloudflare Workers 로 SaaS 만들고 있는 사이드 프로젝트 운영자"
tags: ["후기", "워크플로우"]
slug: "first-pr-in-one-hour"
---

저녁에 짬이 나서 평소 미루던 PR 하나 정리하려고 Claude Code 를 켰다. 결론부터 — **한 시간 안에 PR 생성 → 코드 리뷰 응답 → 머지** 까지 끝났다. 어떤 순서로 일이 굴러갔는지 기록해둔다.

## 작업 자체는 단순했다

타입 정의가 두 곳에서 어긋나서 빌드가 깨지는 이슈. 손으로 잡으면 30분 정도 걸리는 작업.

```ts
// 한쪽은 string, 다른 한쪽은 string | null
type WorkspaceId = string
// vs
type Workspace = { id: string | null }
```

## Claude Code 가 한 일

`grep` 한 번에 호출처를 다 찾았고, 영향 받는 파일 5개를 한꺼번에 보여줬다. 내가 한 일은 "이 5개 중 어디를 source of truth 로 잡을지" 결정하고, 나머지를 그쪽으로 통일하라고 말한 게 전부.

PR 본문 초안도 자기가 써줬다. "왜 이렇게 고쳤는지" 부분은 내가 두 문장 정도 다듬었다.

## 한 시간 만에 머지된 이유

- 작업 단위가 작았다 (5개 파일, 12줄 변경).
- 테스트가 이미 있었다 — 변경 후 그린.
- PR 본문이 단단해서 리뷰어가 의문점이 없었다.

큰 작업이었으면 한 시간 안에 못 끝났을 거다. **작업 단위를 작게 자르는 게 결국 속도의 핵심**이라는 걸 또 배웠다.

## 다음에 해볼 것

- Husky 훅으로 PR 본문 템플릿 자동 채우기
- 모노레포에서 영향 패키지만 빌드 시키는 turbo 옵션 찾기
