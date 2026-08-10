---
slug: build-service/overview
title: AI 시대의 린 스타트업 전체 흐름
nav: 전체 흐름
description: 'AI로 빠르게 만들 수 있는 시대에 왜 린 스타트업 흐름이 더 중요해졌는지, 고객 가설·MVP·배포·피드백·학습의 순서를 먼저 잡고 기술·프론트엔드·백엔드·Git을 어디서 쓰는지 안내하는 문서야.'
thumbnail: /__content__/images/img-nb-sec-build-service.png
hook: 'AI로 더 빨리 만들수록 더 작게 검증해야 해요.'
status: 출시
tags: [서비스만들기, overview, curriculum, lean-startup, MVP, PMF]
access: public
---

## 핵심 요약

**AI 시대의 서비스 만들기는 “AI에게 한 번에 만들어달라고 하기”가 아니라, 린 스타트업의 실험 주기를 빠르게 돌리는 일이에요.**

이 파트의 큰 흐름은 이거예요.

```text
고객 가설 → MVP 범위 → AI와 구현 → Git 저장 → 배포 → 피드백 → 다음 가설
```

예전에는 이 한 바퀴를 도는 데 몇 달이 걸렸어요. 기획하고, 개발자를 구하고, 외주를 맡기고, 화면을 만들고, 배포하고, 사람에게 보여주는 시간이 길었거든요.

지금은 AI 덕분에 훨씬 빨라졌어요. 그래서 더 중요한 건 코드를 많이 아는 게 아니라, **무엇을 검증할지 작게 정하고, AI를 써서 빠르게 고객 앞에 놓는 감각**이에요.

이 파트는 프론트엔드나 백엔드를 따로 외우는 수업이 아니에요. 먼저 **AI 시대의 린 스타트업 흐름**을 잡고, 그 흐름을 실제로 돌리기 위해 필요한 도구로 [기술·구조](/build-service/tech), [프론트·백엔드](/build-service/build-frontend), [Git](/build-service/git), [배포](/build-service/deploy), [피드백](/go-to-market/feedback)을 다뤄요.

## 먼저 기술보다 실험 흐름을 잡아요

초보자가 가장 자주 빠지는 함정은 이거예요.

```text
아이디어가 떠올랐다
→ AI에게 전체 서비스를 만들어달라고 한다
→ 뭔가 나왔다
→ 누구를 위한 건지, 어디부터 고쳐야 할지 모른다
```

AI가 못해서가 아니에요. 처음에 실험을 좁히지 않았기 때문이에요.

서비스 만들기는 “내 생각이 맞다”를 증명하는 일이 아니에요. **고객을 더 이해하기 위해 작은 실험을 반복하는 일**이에요.

그래서 순서는 이렇게 바뀌어야 해요.

```text
먼저 고객과 문제를 좁힌다.
그다음 검증에 필요한 만큼만 만든다.
그리고 고객 반응으로 다음 결정을 한다.
```

AI가 강해질수록 많이 만드는 건 쉬워져요. 대신 더 중요해지는 건 이 질문들이에요.

- 지금 확인하려는 고객은 누구예요?
- 그 고객의 어떤 문제를 줄이려는 거예요?
- 첫 버전에 꼭 필요한 기능은 뭐예요?
- 지금 안 만들어도 되는 건 뭐예요?
- 고객 반응을 어디서, 어떻게 받을 거예요?

## AI 시대의 린 스타트업 루프

이 파트에서 반복해서 보게 될 기본 루프는 이거예요.

1. **고객 가설** — [아이디어 찾기](/build-service/idea)에서 “이런 사람이 이런 문제를 겪을 것 같다”를 좁혀요.
2. **MVP 기획** — [바이브 기획](/build-service/lean-plan)과 [PRD 작성법](/build-service/prd)으로 만들 범위와 검증 기준을 적어요.
3. **기술·구조 판단** — [기술 선택과 구조 잡기](/build-service/tech)에서 프론트만으로 될지, 서버·API·DB가 필요한지 판단해요.
4. **구현 이해** — [프론트엔드와 백엔드 이해](/build-service/build-frontend)에서 고객이 보는 화면과 뒤에서 처리되는 일을 함께 봐요.
5. **저장과 복구** — [Git](/build-service/git)으로 “여기까지 정상” 지점을 남겨요.
6. **수정과 배포** — [고치는 법](/build-service/fix)으로 에러를 다루고, [배포](/build-service/deploy)로 URL을 만들어요.
7. **고객 피드백** — [피드백과 검증](/go-to-market/feedback)으로 실제 반응을 보고, [PMF 찾기](/go-to-market/pmf)에서 다음 방향을 좁혀요.
8. **모객과 첫 결제** — [모객](/go-to-market/distribution)으로 모르는 고객을 데려오고, [첫 결제와 PG 연동](/go-to-market/payment)으로 가격을 정해 돈을 받아봐요.

여기서 핵심은 완성도가 아니에요. **학습 속도**예요.

첫 버전은 어설퍼도 괜찮아요. 다만 무엇을 확인하려는 버전인지는 분명해야 해요. 그래야 AI에게도 정확히 시킬 수 있고, 고객 반응도 제대로 해석할 수 있어요.

## 기술은 목적이 아니라 실험 장비예요

이 시리즈에는 PRD, 기술 선택, 프론트엔드, 백엔드, Git, 배포 같은 말이 나와요.

하지만 이걸 개발자 시험 범위처럼 외우려는 게 아니에요. 각각은 린 스타트업 루프를 돌리기 위한 장비예요.

| 장비 | 왜 필요한가 | 바로 보기 |
| --- | --- | --- |
| 고객 가설 | 누구의 어떤 문제를 볼지 정한다 | [아이디어 찾기](/build-service/idea) |
| PRD | AI와 같은 목표·범위·검증 기준을 공유한다 | [PRD 작성법](/build-service/prd) |
| 기술·구조 | 이번 MVP에 필요한 만큼만 만든다 | [기술 선택과 구조 잡기](/build-service/tech) |
| 프론트·백엔드 | 화면과 화면 뒤 처리를 구분한다 | [프론트엔드와 백엔드 이해](/build-service/build-frontend) |
| Git | 망가져도 되돌아갈 저장 지점을 만든다 | [Git](/build-service/git) |
| 디버깅 | AI가 만든 결과를 고객에게 보여줄 수 있게 다듬는다 | [고치는 법](/build-service/fix) |
| 배포 | 내 컴퓨터 밖으로 꺼내 URL로 보여준다 | [배포](/build-service/deploy) |
| 피드백 | 고객 반응으로 다음 선택을 정한다 | [피드백과 검증](/go-to-market/feedback) |
| 모객 | 모르는 고객을 채널에서 데려온다 | [모객](/go-to-market/distribution) |
| 결제·PG | 가격을 정해 링크로 받다가, 팔리면 PG를 붙인다 | [첫 결제와 PG 연동](/go-to-market/payment) |

그러니까 [기술 선택과 구조 잡기](/build-service/tech)를 읽을 때도 “무슨 스택이 좋은가”만 보는 게 아니에요. **이번 실험에서 어디까지 만들면 충분한가**를 보는 거예요.

[Git](/build-service/git)을 읽을 때도 명령어를 외우는 게 아니에요. **AI와 빠르게 실험하다가 망가졌을 때 다시 돌아올 수 있는 안전장치**를 배우는 거예요.

## 전체 흐름은 이렇게 진행돼요

:::canvas-sequence
{
  "participants": [
    { "id": "me", "label": "나" },
    { "id": "claude", "label": "Claude" },
    { "id": "git", "label": "Git" },
    { "id": "service", "label": "MVP" },
    { "id": "user", "label": "고객" }
  ],
  "messages": [
    { "from": "me", "to": "me", "label": "고객·문제 가설 세우기", "type": "solid" },
    { "from": "me", "to": "claude", "label": "PRD 요청 / MVP 범위 좁히기", "type": "solid" },
    { "from": "claude", "to": "me", "label": "가설·기능·검증 기준 초안", "type": "dashed" },
    { "from": "me", "to": "me", "label": "이번 실험에서 안 만들 것 정하기", "type": "solid" },
    { "from": "me", "to": "claude", "label": "기술·구조 판단 요청", "type": "solid" },
    { "from": "me", "to": "git", "label": "시작점 저장 / 되돌릴 지점 만들기", "type": "solid" },
    { "from": "me", "to": "claude", "label": "검증에 필요한 화면·기능 구현 요청", "type": "solid" },
    { "from": "claude", "to": "service", "label": "프론트·백엔드 구현", "type": "solid" },
    { "from": "service", "to": "me", "label": "실행 결과 / 에러 / 부족한 점 확인", "type": "dashed" },
    { "from": "me", "to": "claude", "label": "로그와 기준을 주고 수정 요청", "type": "solid" },
    { "from": "me", "to": "service", "label": "배포 / URL 공개", "type": "solid" },
    { "from": "user", "to": "service", "label": "직접 사용", "type": "solid" },
    { "from": "user", "to": "me", "label": "반응·불편·요청 전달", "type": "dashed" },
    { "from": "me", "to": "me", "label": "학습 / 다음 가설 조정", "type": "solid" }
  ]
}
:::

외울 필요는 없어요. “AI로 서비스를 만든다”는 말이 사실은 **가설을 세우고, 작게 만들고, 고객 반응으로 다시 배우는 반복**이라는 점만 잡으면 돼요.

## 무엇부터 읽으면 되나요?

처음부터 전부 이해하려고 하지 않아도 돼요. 지금 상황에 맞는 글부터 들어가면 돼요.

| 지금 상태 | 읽을 글 |
| --- | --- |
| 아이디어가 막연해 | [01 아이디어 찾기](/build-service/idea) |
| 만들고 싶은 건 있는데 범위가 커 | [02 바이브 기획](/build-service/lean-plan) |
| AI에게 줄 문서가 필요해 | [03 PRD 작성법](/build-service/prd) |
| 프론트만으로 될지, 서버·DB가 필요한지 모르겠어 | [04 기술 선택과 구조 잡기](/build-service/tech) |
| AI가 만든 화면과 API 파일이 헷갈려 | [05 프론트엔드와 백엔드 이해](/build-service/build-frontend) |
| 만들다 망가질까 봐 불안해 | [06 Git](/build-service/git) |
| 에러가 났어 | [07 고치는 법](/build-service/fix) |
| 다른 사람에게 보여주고 싶어 | [08 배포](/build-service/deploy) |
| 고객 반응을 어떻게 받을지 모르겠어 | [09 피드백과 검증](/go-to-market/feedback) |
| 다음 방향을 어떻게 정할지 모르겠어 | [10 PMF 찾기](/go-to-market/pmf) |
| 써줄 사람을 어디서 데려올지 모르겠어 | [11 모객](/go-to-market/distribution) |
| 얼마 받을지, 어떻게 받을지, PG는 언제 붙일지 모르겠어 | [12 첫 결제와 PG 연동](/go-to-market/payment) |

## 전체 목차

| 순서 | 글 | 한 줄 목표 |
| --- | --- | --- |
| 00 | [전체 흐름](/build-service/overview) | AI 시대의 린 스타트업 루프를 먼저 잡기 |
| 01 | [아이디어 찾기](/build-service/idea) | 거창한 아이디어를 고객·문제 가설로 좁히기 |
| 02 | [바이브 기획](/build-service/lean-plan) | PRD, 사용자 흐름, MVP 범위, 검증 기준 잡기 |
| 03 | [PRD 작성법](/build-service/prd) | AI가 이해할 수 있는 기획 문서로 정리하기 |
| 04 | [기술 선택과 구조 잡기](/build-service/tech) | 프론트만으로 될지 서버·API·DB가 필요한지 판단하기 |
| 05 | [프론트엔드와 백엔드 이해](/build-service/build-frontend) | 고객이 보는 화면과 뒤에서 처리되는 일을 함께 보기 |
| 06 | [Git](/build-service/git) | 정상 지점을 저장하고 망가졌을 때 돌아오기 |
| 07 | [고치는 법](/build-service/fix) | 에러와 로그를 AI에게 제대로 전달하기 |
| 08 | [배포](/build-service/deploy) | 내 컴퓨터 밖으로 꺼내 URL로 보여주기 |
| 09 | [피드백과 검증](/go-to-market/feedback) | 고객 반응으로 가설을 확인하기 |
| 10 | [PMF 찾기](/go-to-market/pmf) | 기능 추가보다 고객과 문제의 맞물림을 좁혀가기 |
| 11 | [모객](/go-to-market/distribution) | 고객이 모여 있는 채널에서 모르는 사람 데려오기 |
| 12 | [첫 결제와 PG 연동](/go-to-market/payment) | 가격 정해 링크로 받고, 팔리면 부트페이로 PG 붙이기 |

## 여기서 목표는 하나예요

완벽한 서비스를 만드는 게 목표가 아니에요.

**AI를 써서 린 스타트업의 한 바퀴를 끝까지 돌려보는 것.**

즉, 이런 문장을 실제 행동으로 바꾸는 거예요.

```text
이런 사람이 이런 문제를 겪고 있을 것 같아.
이 작은 기능을 보여주면 그 문제가 조금 줄어드는지 확인할 수 있어.
그래서 이번 주에는 이 범위까지만 만들고, 5명에게 보여본 뒤 다시 판단할 거야.
```

중요한 건 처음 가설이 틀릴 수도 있다는 점이에요. 오히려 틀렸다는 걸 빨리 알면 좋아요. AI가 만들어주는 속도가 빠르기 때문에, 틀린 방향으로 오래 가는 것보다 작게 만들고 빨리 배우는 편이 훨씬 낫거든요.

그러니까 이 파트에서 기술은 주인공이 아니에요. 주인공은 **고객 가설, 작은 MVP, 실제 피드백, 그리고 다음 선택**이에요.

Claude는 그 루프를 빠르게 돌리기 위한 강력한 도구고, Git·프론트엔드·백엔드·배포는 그 도구를 안전하게 쓰기 위한 최소한의 장비예요.

이제 먼저 아이디어를 거창한 서비스명이 아니라 [검증 가능한 고객 가설](/build-service/idea)로 바꾸는 것부터 시작해봐요.
