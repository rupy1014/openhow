---
slug: automation/patterns
title: 사례 모음
nav: 사례 모음
description: '체인, 분류, 동시처리, 지휘자, 반복개선 패턴을 실제 업무 예시로 정리해 내 자동화 흐름을 설계할 때 참고하게 한다.'
thumbnail: /__content__/images/img-AT03.png
hook: '원리는 같지만 응용은 다양해요.'
status: 출시
tags: [자동화, patterns, chain, routing, parallel, orchestrator, evaluator]
access: public
---

## 핵심 요약

**자동화 패턴은 목차와 담당자를 어떤 순서로 움직일지 정하는 설계도예요.**

담당자를 만들었다면 다음은 흐름이에요.

- 순서대로 처리할지
- 종류별로 나눌지
- 동시에 돌릴지
- 상황을 보고 부를지
- 기준을 통과할 때까지 다시 돌릴지

입문 단계에서는 다섯 가지 흐름만 잡으면 돼요.

```text
체인
분류
동시처리
지휘자
반복개선
```

## 1. 체인 — 순서가 있는 일

체인은 앞 단계 결과를 다음 단계가 이어받는 방식이에요.

:::canvas-flow
{
  "nodes": [
    { "id": "career", "label": "career-reader\n경력 분석", "col": 0, "row": 0, "type": "default" },
    { "id": "story", "label": "story-writer\n스토리 작성", "col": 1, "row": 0, "type": "process" },
    { "id": "tone", "label": "tone-editor\n문체 정리", "col": 2, "row": 0, "type": "process" },
    { "id": "fit", "label": "fit-checker\nJD 적합성 검수", "col": 3, "row": 0, "type": "warning" }
  ],
  "edges": [
    { "from": "career", "to": "story" },
    { "from": "story", "to": "tone" },
    { "from": "tone", "to": "fit" }
  ],
  "direction": "LR",
  "cols": 4,
  "rows": 1
}
:::

자기소개서를 쓴다면 경력 분석이 먼저고, 그다음 스토리 작성, 문체 정리, 적합성 검수로 가요.

블로그 자동화도 체인에 가까워요.

:::canvas-flow
{
  "nodes": [
    { "id": "series", "label": "series-manager\n회차 맥락", "col": 0, "row": 0, "type": "default" },
    { "id": "writer", "label": "writer\n초안", "col": 1, "row": 0, "type": "process" },
    { "id": "editor", "label": "style-editor\n퇴고", "col": 2, "row": 0, "type": "process" },
    { "id": "proof", "label": "proofreader\n검수", "col": 3, "row": 0, "type": "warning" }
  ],
  "edges": [
    { "from": "series", "to": "writer" },
    { "from": "writer", "to": "editor" },
    { "from": "editor", "to": "proof" }
  ],
  "direction": "LR",
  "cols": 4,
  "rows": 1
}
:::

## 2. 분류 — 들어온 내용에 따라 흐름이 갈리는 일

분류는 먼저 내용을 보고 어디로 보낼지 정하는 방식이에요.

:::canvas-flow
{
  "nodes": [
    { "id": "router", "label": "router\n문의 유형 판단", "col": 0, "row": 1, "type": "process" },
    { "id": "payment", "label": "payment-agent\n결제 문의", "col": 1, "row": 0, "type": "default" },
    { "id": "refund", "label": "refund-agent\n환불 문의", "col": 1, "row": 1, "type": "warning" },
    { "id": "account", "label": "account-agent\n계정 문의", "col": 1, "row": 2, "type": "default" }
  ],
  "edges": [
    { "from": "router", "to": "payment" },
    { "from": "router", "to": "refund" },
    { "from": "router", "to": "account" }
  ],
  "direction": "LR",
  "cols": 2,
  "rows": 3
}
:::

분류가 필요한 일은 이런 것들이에요.

- 고객 문의 분류
- 채용 지원서 1차 분류
- 버그 리포트 유형 분류
- 콘텐츠 아이디어 카테고리 분류
- 영업 리드 우선순위 분류

분류 기준은 문서로 둬요.

```text
docs/routing-standard.md
```

`router`는 이 문서를 읽고 어느 담당자에게 보낼지 정해요.

## 3. 동시처리 — 서로 기다릴 필요가 없는 일

동시처리는 여러 담당자가 동시에 움직여도 되는 방식이에요.

:::canvas-flow
{
  "nodes": [
    { "id": "r1", "label": "researcher-1\n경쟁사 A 조사", "col": 0, "row": 0, "type": "default" },
    { "id": "r2", "label": "researcher-2\n경쟁사 B 조사", "col": 0, "row": 1, "type": "default" },
    { "id": "r3", "label": "researcher-3\n경쟁사 C 조사", "col": 0, "row": 2, "type": "default" },
    { "id": "analyst", "label": "analyst\n통합 분석", "col": 1, "row": 1, "type": "success" }
  ],
  "edges": [
    { "from": "r1", "to": "analyst" },
    { "from": "r2", "to": "analyst" },
    { "from": "r3", "to": "analyst" }
  ],
  "direction": "LR",
  "cols": 2,
  "rows": 3
}
:::

경쟁사 조사는 서로 기다릴 필요가 없어요. 각자 조사한 뒤 `analyst`가 합치면 돼요.

동시처리가 맞는 일은 이런 것들이에요.

- 여러 경쟁사 조사
- 여러 제목 후보 만들기
- 여러 관점의 코드 리뷰
- 여러 광고 문구 후보 만들기
- 여러 고객군별 메시지 작성

마지막에는 통합 담당자가 필요해요. 동시에 나온 결과를 한곳에 모아야 하기 때문이에요.

## 4. 지휘자 — 상황을 보고 필요한 담당자를 부르는 일

지휘자는 미리 정해진 순서대로만 가지 않아요. 결과를 보며 다음 담당자를 골라요.

:::canvas-flow
{
  "nodes": [
    { "id": "orch", "label": "orchestrator\n전체 판단", "col": 0, "row": 1, "type": "process" },
    { "id": "market", "label": "market-reviewer\n시장성 검토", "col": 1, "row": 0, "type": "default" },
    { "id": "finance", "label": "finance-reviewer\n수익성 검토", "col": 1, "row": 1, "type": "default" },
    { "id": "risk", "label": "risk-reviewer\n리스크 검토", "col": 1, "row": 2, "type": "warning" },
    { "id": "legal", "label": "legal-reviewer\n법무 검토", "col": 1, "row": 3, "type": "warning" },
    { "id": "synth", "label": "synthesis-writer\n최종 판단 정리", "col": 2, "row": 1, "type": "success" }
  ],
  "edges": [
    { "from": "orch", "to": "market" },
    { "from": "orch", "to": "finance" },
    { "from": "orch", "to": "risk" },
    { "from": "orch", "to": "legal" },
    { "from": "market", "to": "synth" },
    { "from": "finance", "to": "synth" },
    { "from": "risk", "to": "synth" },
    { "from": "legal", "to": "synth" }
  ],
  "direction": "LR",
  "cols": 3,
  "rows": 4
}
:::

사업 기획서에 법무 이슈가 없으면 `legal-reviewer`를 부르지 않아도 돼요. 리스크가 크면 `risk-reviewer`에게 깊게 보게 할 수 있어요.

지휘자 흐름은 예외가 많은 작업에 어울려요. 초반에는 체인으로 시작하고, 갈림길이 많아질 때 지휘자 흐름을 붙이면 돼요.

## 5. 반복개선 — 만들고, 평가하고, 고치는 일

반복개선은 초안을 만들고 평가한 뒤, 기준에 못 미치면 다시 고치는 방식이에요.

:::canvas-flow
{
  "nodes": [
    { "id": "writer", "label": "writer\n초안 작성", "col": 0, "row": 0, "type": "process" },
    { "id": "eval", "label": "evaluator\n기준 평가", "col": 1, "row": 0, "type": "warning" },
    { "id": "pass", "label": "통과\n저장", "col": 2, "row": 0, "type": "success" }
  ],
  "edges": [
    { "from": "writer", "to": "eval" },
    { "from": "eval", "to": "pass" },
    { "from": "eval", "to": "writer" }
  ],
  "direction": "LR",
  "cols": 3,
  "rows": 1
}
:::

예를 들어 마케팅 문구를 만든다면 이렇게 돌 수 있어요.

:::canvas-flow
{
  "nodes": [
    { "id": "d1", "label": "1회차 초안\n작성", "col": 0, "row": 0, "type": "process" },
    { "id": "e1", "label": "평가\n너무 평범함", "col": 1, "row": 0, "type": "warning" },
    { "id": "f1", "label": "수정 지시\n다시 작성", "col": 2, "row": 0, "type": "default" },
    { "id": "d2", "label": "2회차 수정본\n작성", "col": 0, "row": 1, "type": "process" },
    { "id": "e2", "label": "평가\n혜택이 약함", "col": 1, "row": 1, "type": "warning" },
    { "id": "f2", "label": "수정 지시\n다시 작성", "col": 2, "row": 1, "type": "default" },
    { "id": "d3", "label": "3회차 수정본\n작성", "col": 0, "row": 2, "type": "process" },
    { "id": "e3", "label": "평가\n기준 통과", "col": 1, "row": 2, "type": "success" },
    { "id": "save", "label": "저장\n완료", "col": 2, "row": 2, "type": "success" }
  ],
  "edges": [
    { "from": "d1", "to": "e1" },
    { "from": "e1", "to": "f1" },
    { "from": "f1", "to": "d2" },
    { "from": "d2", "to": "e2" },
    { "from": "e2", "to": "f2" },
    { "from": "f2", "to": "d3" },
    { "from": "d3", "to": "e3" },
    { "from": "e3", "to": "save" }
  ],
  "direction": "LR",
  "cols": 3,
  "rows": 3
}
:::

평가 기준은 문서로 둬요.

```text
80점 이상이면 통과
최대 3회까지만 반복
미달 사유는 reviews/에 기록
```

멈추는 조건이 있어야 해요. 그래야 반복개선이 무한히 돌지 않아요.

## 6. 패턴은 다섯이지만 원리는 같다

다섯 가지 패턴을 따로 외울 필요는 없어요. 사실 워크플로우의 기본 원리는 다 비슷해요.

> 어떤 입력을 받아서, 누가 어떤 순서로 처리하고, 어떤 기준으로 결과를 확인할지 정한다.

체인이든 분류든 동시처리든 지휘자든 반복개선이든, 이 뼈대는 똑같아요. 차이는 어떻게 응용하느냐에서 나와요.

- 단계가 일직선이면 **체인**
- 입력 종류가 갈리면 **분류**
- 서로 기다릴 필요가 없으면 **동시처리**
- 결과를 보고 다음을 골라야 하면 **지휘자**
- 기준에 못 미치면 다시 돌려야 하면 **반복개선**

같은 뼈대인데 적용 지점이 다를 뿐이에요. 그래서 실제 업무에서는 한 패턴만 쓰지 않아요.

```text
앞 단계: 동시처리로 자료 모으고
중간 단계: 체인으로 정리하고
끝 단계: 반복개선으로 기준 통과시킨다
```

여기서 잡아야 할 감각은 이거예요.

**패턴 이름을 외우는 게 아니라, 내 업무 안에서 어디에 어떤 응용이 필요한지 보는 것.** 같은 사람이 만들어도 도메인이 다르면 응용 방식이 달라져요. 마케팅 담당자의 분류 흐름과 CS 담당자의 분류 흐름은 분기 기준부터 달라요. 원리는 같고, 응용이 본인 업무 지식에서 갈려요.

## 7. 내 업무 흐름에 붙여본다

처음엔 아래 질문으로 고르면 돼요.

| 질문 | 흐름 |
| --- | --- |
| 앞 단계 결과가 있어야 다음 단계가 가능한가? | 체인 |
| 들어온 내용에 따라 담당자가 달라지는가? | 분류 |
| 여러 조사를 동시에 해도 되는가? | 동시처리 |
| 결과를 보고 다음 담당자를 골라야 하는가? | 지휘자 |
| 기준에 맞을 때까지 고쳐야 하는가? | 반복개선 |

실제 업무는 섞여요.

:::canvas-flow
{
  "nodes": [
    { "id": "ad", "label": "광고 지표 조사\n동시처리", "col": 0, "row": 0, "type": "default" },
    { "id": "sales", "label": "세일즈 지표 조사\n동시처리", "col": 0, "row": 1, "type": "default" },
    { "id": "cs", "label": "고객 문의 지표 조사\n동시처리", "col": 0, "row": 2, "type": "default" },
    { "id": "merge", "label": "통합 분석\n체인 시작", "col": 1, "row": 1, "type": "process" },
    { "id": "draft", "label": "리포트 초안\n작성", "col": 2, "row": 1, "type": "process" },
    { "id": "review", "label": "대표 보고 기준\n검수", "col": 3, "row": 1, "type": "warning" },
    { "id": "done", "label": "통과\n공유", "col": 4, "row": 1, "type": "success" }
  ],
  "edges": [
    { "from": "ad", "to": "merge" },
    { "from": "sales", "to": "merge" },
    { "from": "cs", "to": "merge" },
    { "from": "merge", "to": "draft" },
    { "from": "draft", "to": "review" },
    { "from": "review", "to": "done" },
    { "from": "review", "to": "draft" }
  ],
  "direction": "LR",
  "cols": 5,
  "rows": 3
}
:::

## 자주 헷갈리는 포인트

### 패턴을 먼저 정해야 하나요?

아니에요. 먼저 내 업무 흐름을 적고, 그 흐름에 맞는 이름을 붙이면 돼요.

### 복잡하게 만들수록 자동화가 잘 되나요?

아니에요. 한 번에 되는 일은 한 번에 시키면 돼요. 반복되는 문제가 보일 때 흐름을 나누면 돼요.

### 언제 담당자를 추가하나요?

결과를 읽었을 때 같은 문제가 반복되면 추가해요. 문체가 흔들리면 문체 담당자, 검수가 약하면 검수 담당자, 자료 누락이 반복되면 자료 확인 담당자를 만들어요.

## 오늘 바로 해볼 것

내가 자동화하고 싶은 일 하나를 골라서 아래처럼 적어봐요.

```text
자동화할 일: 월간 성과 리포트 작성
흐름:
1. 지표 파일 읽기
2. 이상치 찾기
3. 핵심 메시지 정리
4. 리포트 초안 작성
5. 대표 보고용으로 검수

가까운 패턴:
체인 + 반복개선
```
