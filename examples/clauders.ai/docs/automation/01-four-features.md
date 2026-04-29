---
slug: automation/01-four-features
title: 4가지 기능
nav: 4가지 기능
description: 'CLAUDE.md와 업무 문서의 여러 목차를 실제 작업에서 지키게 만드는 자동화 장치 commands, agents, skills, hooks를 입문자 관점에서 정리한다.'
thumbnail: /__content__/images/img-AT00.png
hook: '자동화를 가능하게 하는 Claude Code의 4가지 요소'
status: 출시
tags: [automation, commands, agents, skills, hooks, context]
---

## 핵심 요약

**자동화는 AI가 매번 알아서 모든 목차와 업무 문서를 챙기길 기대하는 게 아니라, 어떤 일을 시킬 때 어떤 목차를 읽고, 어떤 순서로 처리하고, 어떤 기준으로 확인할지 실행 흐름으로 묶어두는 거야.**

앞에서 프로젝트 안에 `CLAUDE.md`와 업무 문서를 만들었지. 그게 시작이야. 그런데 문서가 많아지면 새로운 문제가 생겨.

- `CLAUDE.md` 안에 목차가 많아지고
- `docs/` 안에 파트별 업무 문서가 늘어나고
- 어떤 작업에는 A 문서가 필요하고
- 어떤 작업에는 B 문서와 C 문서가 같이 필요하고
- 어떤 작업에는 읽으면 안 되는 기준도 생겨

문서가 많아질수록 기준을 작업 흐름 안에 직접 배치해야 해. 어떤 작업에서 어떤 목차를 읽을지, 어떤 업무 문서를 참고할지, 어떤 순서로 처리할지 정해둬야 해.

자동화는 이걸 실행 가능한 흐름으로 묶는 거야.

> 이 작업은 이 목차를 읽고, 이 업무 문서를 참고하고, 이 순서로 처리하고, 마지막에는 이 기준으로 확인한다.

이런 실행 흐름을 워크플로우, 파이프라인, 오케스트레이션 같은 말로 부르기도 해. 용어는 뒤에서 정리하고, 지금은 감각만 잡자.

**업무매뉴얼을 그냥 쌓아두는 게 아니라, 실제 작업 순서 안에 배치하는 것.**

Claude Code에서 이 흐름을 만들 때 자주 쓰는 장치는 네 가지야.

- **commands** — 내가 자주 쓰는 업무를 한 줄로 부르는 단축키
- **agents** — 목차별·역할별로 일을 맡는 담당자
- **skills** — Claude가 상황을 보고 꺼내 쓰는 능력
- **hooks** — 특정 순간에 자동으로 실행되는 장치

이 파일들은 보통 프로젝트 안의 `.claude/` 폴더에 둬. 폴더 위치와 실제 동작은 본문에서 하나씩 보자.

## 1. commands는 자주 쓰는 업무 단축키다

`commands`는 `/write`, `/report`, `/script` 같은 명령어야. 내가 자주 쓰는 업무를 한 줄로 부르는 단축키라고 보면 돼.

파일은 보통 이렇게 둬.

```text
.claude/commands/write.md
.claude/commands/report.md
.claude/commands/script.md
```

예를 들어 `.claude/commands/write.md`를 만들면 Claude Code에서 `/write`처럼 불러 쓸 수 있어.

여기서 `/write`는 “글만 써라”는 뜻이 아니야. 이름은 `/write`여도 안쪽에는 전체 흐름을 넣을 수 있어.

:::canvas-flow
{
  "nodes": [
    { "id": "topic", "label": "소재 고르기\n무엇을 쓸지", "col": 0, "row": 0, "type": "default" },
    { "id": "reader", "label": "독자 관점 잡기\n누구에게 쓰는가", "col": 1, "row": 0, "type": "process" },
    { "id": "structure", "label": "전개 방식 정하기\n구조 잡기", "col": 2, "row": 0, "type": "process" },
    { "id": "draft", "label": "초안 작성\n일단 써보기", "col": 3, "row": 0, "type": "default" },
    { "id": "polish", "label": "퇴고\n문체 다듬기", "col": 0, "row": 1, "type": "process" },
    { "id": "review", "label": "검수\n기준 확인", "col": 1, "row": 1, "type": "warning" },
    { "id": "save", "label": "저장\n초안 보관", "col": 2, "row": 1, "type": "success" }
  ],
  "edges": [
    { "from": "topic", "to": "reader" },
    { "from": "reader", "to": "structure" },
    { "from": "structure", "to": "draft" },
    { "from": "draft", "to": "polish" },
    { "from": "polish", "to": "review" },
    { "from": "review", "to": "save" }
  ],
  "direction": "LR",
  "cols": 4,
  "rows": 2
}
:::

이렇게 실제 업무가 흘러가는 방식을 여러 단계로 묶은 걸 **파이프라인 단축키**라고 부르면 돼.

여기서 정교함이 나와. 작가가 실제로 어떤 순서로 판단하는지, 어떤 기준으로 소재를 고르는지, 어떤 단계에서 문체를 고치는지 아는 사람이 파이프라인을 잘 만들어. 그게 도메인 지식이야.

매번 이렇게 길게 말하지 않기 위해 만드는 거야.

```text
이 프로젝트의 CLAUDE.md를 읽고,
이번 작업에는 docs/tone-and-manner.md와 docs/output-standard.md를 참고하고,
series-plan.md에서 3화 정보를 확인한 다음,
소재를 고르고,
독자 관점을 잡고,
전개 방식을 정하고,
초안을 쓰고,
퇴고하고,
검수 결과까지 남겨줘.
```

이걸 매번 치면 피곤하잖아. 그래서 한 줄로 묶어.

```text
/write 3화
```

이 한 줄이 자동화의 입구야. 단축키를 실행하면 안쪽에 적어둔 파이프라인대로 일이 시작돼.

여기서 command의 역할은 단순해.

> 자주 쓰는 업무 흐름을 한 줄로 부르고, 그 안에서 어떤 목차와 업무 문서를 읽을지 지정하는 것.

예를 들어 `/write 3화` 하나 안에 실제 작가들이 글을 쓰는 업무 흐름을 넣을 수 있어. 소재를 고르고, 독자 관점을 잡고, 전개 방식을 정하고, 초안을 쓰고, 퇴고하고, 검수하고, 저장하는 흐름까지 한 번에 묶을 수 있어. 굳이 `/write`와 `/review`를 따로 나눌 필요는 없어.

## 2. agents는 목차별·역할별 담당자다

담당자를 만드는 이유는 LLM의 특성 때문이야.

LLM은 한 번에 참고할 수 있는 컨텍스트에 한계가 있어. 대화가 길어지고 문서가 많아질수록 앞에서 본 기준이 흐려지거나, 지금 작업과 상관없는 기준이 섞일 수 있어. 이걸 컨텍스트 메모리 한계라고 보면 돼.

그래서 sub agent를 만들어.

파일은 보통 이렇게 둬.

```text
.claude/agents/writer.md
.claude/agents/style-editor.md
.claude/agents/proofreader.md
```

각 파일 안에는 “이 담당자는 언제 쓰고, 어떤 기준을 보고, 어떤 결과를 돌려줘야 하는지”를 적어둬.

- **마스터 에이전트** — 나와 직접 대화하면서 전체 흐름을 잡는 Claude
- **서브 에이전트** — 마스터 에이전트가 특정 역할을 맡겨 부르는 담당자

내가 `/write 3화`를 실행하면 마스터 에이전트가 전체 파이프라인을 잡고, 안쪽에서 서브 에이전트들을 순차적으로 부를 수 있어.

:::canvas-flow
{
  "nodes": [
    { "id": "master", "label": "마스터 에이전트\n전체 흐름 잡기", "col": 0, "row": 0, "type": "process" },
    { "id": "series", "label": "series-manager\n회차 맥락", "col": 1, "row": 0, "type": "default" },
    { "id": "planner", "label": "story-planner\n전개 방식", "col": 2, "row": 0, "type": "default" },
    { "id": "writer", "label": "writer\n초안 작성", "col": 0, "row": 1, "type": "default" },
    { "id": "editor", "label": "style-editor\n문체 퇴고", "col": 1, "row": 1, "type": "default" },
    { "id": "proof", "label": "proofreader\n검수", "col": 2, "row": 1, "type": "warning" }
  ],
  "edges": [
    { "from": "master", "to": "series" },
    { "from": "series", "to": "planner" },
    { "from": "planner", "to": "writer" },
    { "from": "writer", "to": "editor" },
    { "from": "editor", "to": "proof" }
  ],
  "direction": "LR",
  "cols": 3,
  "rows": 2
}
:::

각 서브 에이전트는 자기 단계에 필요한 문서와 기준만 들고 일해. 그래서 기준이 섞이지 않고 작업이 더 선명해져.

담당자는 아무렇게나 늘리는 게 아니라, 보통 두 방식으로 나눠.

### 목차별 담당자

`CLAUDE.md`나 `docs/` 안의 목차가 분명할 때 쓰기 좋아.

예를 들어 유튜브 대본 프로젝트라면 이런 식이야.

```text
tone-manager       → docs/tone-and-manner.md 담당
structure-manager  → docs/script-structure.md 담당
seo-manager        → docs/seo-standard.md 담당
proofreader        → docs/checklist.md 담당
```

각 담당자는 자기에게 할당된 목차와 문서를 더 강하게 봐. 그래서 “문서가 있는데도 안 지키는 문제”가 줄어들어.

### 역할별 담당자

작업 단계가 분명할 때 쓰기 좋아.

:::canvas-flow
{
  "nodes": [
    { "id": "planner", "label": "planner\n기획", "col": 0, "row": 0, "type": "default" },
    { "id": "writer", "label": "writer\n초안", "col": 1, "row": 0, "type": "process" },
    { "id": "editor", "label": "editor\n문체 정리", "col": 2, "row": 0, "type": "process" },
    { "id": "proofreader", "label": "proofreader\n검수", "col": 3, "row": 0, "type": "warning" }
  ],
  "edges": [
    { "from": "planner", "to": "writer" },
    { "from": "writer", "to": "editor" },
    { "from": "editor", "to": "proofreader" }
  ],
  "direction": "LR",
  "cols": 4,
  "rows": 1
}
:::

이 방식은 일이 순서대로 흘러갈 때 편해. 앞 단계에서 만든 결과를 다음 단계가 이어받아.

실제로는 두 방식을 섞어.

```text
writer는 초안을 쓰되 tone-and-manner.md를 참고하고,
proofreader는 checklist.md를 기준으로 검수하고,
seo-manager는 seo-standard.md만 보고 제목 후보를 만들어.
```

핵심은 담당자를 만드는 행위 자체가 아니야.

**목차와 업무 문서를 실제 처리 단계에 할당하는 것.** 이게 담당자를 쓰는 이유야.

## 3. skills는 Claude가 상황 보고 꺼내 쓰는 능력이다

`skills`는 내가 매번 직접 부르는 단축키라기보다, Claude가 상황을 보고 꺼내 쓰는 기능에 가까워.

파일은 보통 폴더 하나에 `SKILL.md` 형태로 둬.

```text
.claude/skills/review-checklist/SKILL.md
.claude/skills/security-check/SKILL.md
.claude/skills/explain-code/SKILL.md
```

예를 들어 어떤 작업을 하다가 “이건 코드 리뷰 방식으로 봐야겠다”, “이건 보안 검토가 필요하겠다”, “이건 글쓰기 기준을 적용해야겠다”라고 판단하면 그때 맞는 skill을 꺼내는 식이야.

입문 단계에서 skills를 깊게 만들 필요는 없어. 지금은 이렇게만 이해하면 돼.

- commands는 **내가 실행하는 업무 단축키**
- agents는 **목차와 업무 문서를 맡는 담당자**
- skills는 **Claude가 필요할 때 꺼내 쓰는 능력**

## 4. hooks는 자동으로 걸어두는 장치다

`hooks`는 특정 순간에 자동으로 실행되는 장치야.

여기서 헷갈리기 쉬운 게 있어. hooks는 보통 두 부분으로 나눠서 생각하면 돼.

```text
.claude/settings.json        # 언제 실행할지 적는 설정
.claude/hooks/run-check.sh   # 실제로 실행될 스크립트
```

예를 들어 이런 식이야.

- 파일을 수정한 뒤 자동으로 포맷 정리하기
- 명령어 실행 전에 위험한 작업인지 확인하기
- 작업이 끝난 뒤 결과 로그 남기기
- 테스트가 실패하면 다음 단계로 못 넘어가게 막기

사람이 매번 “검수해”, “기록해”, “포맷 맞춰”라고 말하지 않아도 정해진 순간에 돌아가.

초반에는 hooks까지 욕심낼 필요 없어. 먼저 commands와 agents로 흐름을 잡고, 반복되는 검수나 정리 작업이 보이면 그때 hooks로 넘기면 돼.

## 5. 네 가지는 한 흐름으로 묶인다

자동화는 네 기능을 따로 외우는 공부가 아니야. 한 작업 안에서 어떻게 이어지는지 보면 돼.

예를 들어 `/write 3화`라는 파이프라인 단축키는 이렇게 돌아갈 수 있어.

이때 파일 위치로 보면 대략 이런 조합이야.

```text
.claude/commands/write.md        # /write 3화의 전체 순서
.claude/agents/series-manager.md # 시리즈 맥락 확인 담당
.claude/agents/writer.md         # 초안 작성 담당
.claude/agents/proofreader.md    # 검수 담당
.claude/skills/review-checklist/SKILL.md # 필요할 때 적용할 검수 능력
.claude/settings.json            # hook 연결
.claude/hooks/run-check.sh       # 자동 검수 스크립트
```

실행 흐름으로 보면 이렇게야.

:::canvas-flow
{
  "nodes": [
    { "id": "exec", "label": "/write 3화 실행\n사용자 입력", "col": 0, "row": 0, "type": "default" },
    { "id": "cmd", "label": "command\n읽을 문서 지정", "col": 1, "row": 0, "type": "process" },
    { "id": "series", "label": "series-manager\nseries-plan.md", "col": 2, "row": 0, "type": "default" },
    { "id": "structure", "label": "structure-manager\nscript-structure.md", "col": 3, "row": 0, "type": "default" },
    { "id": "writer", "label": "writer\ntone-and-manner.md", "col": 0, "row": 1, "type": "process" },
    { "id": "editor", "label": "editor\n퇴고", "col": 1, "row": 1, "type": "process" },
    { "id": "seo", "label": "seo-manager\nseo-standard.md", "col": 2, "row": 1, "type": "default" },
    { "id": "proof", "label": "proofreader\nchecklist.md", "col": 3, "row": 1, "type": "warning" }
  ],
  "edges": [
    { "from": "exec", "to": "cmd" },
    { "from": "cmd", "to": "series" },
    { "from": "series", "to": "structure" },
    { "from": "structure", "to": "writer" },
    { "from": "writer", "to": "editor" },
    { "from": "editor", "to": "seo" },
    { "from": "seo", "to": "proof" },
    { "from": "proof", "to": "writer" }
  ],
  "direction": "LR",
  "cols": 4,
  "rows": 2
}
:::

마지막에 `proofreader`가 기준을 통과시키지 못하면 `writer`로 다시 돌아가는 흐름까지 묶을 수 있어.

도입부에서 미뤄둔 용어를 여기서 정리하면 이래.

- **워크플로우** — 일이 흘러가는 전체 순서
- **파이프라인** — 앞 단계 결과가 다음 단계로 넘어가는 작업 라인
- **오케스트레이션** — 여러 역할과 문서를 조율해서 끝까지 처리하는 것

말은 달라도 감각은 하나야. 이 흐름을 어떤 이름으로 불러도 돼.

여기서 잡아야 할 감각은 이거야.

**어떤 파이프라인 단축키를 실행하면 어떤 목차와 문서를 읽고, 실제 업무를 어떤 순서와 기준으로 처리할지 정해두는 것.** 이게 자동화의 시작이야.

## 자주 헷갈리는 포인트

### 자동화하면 완전히 손 놓아도 돼?

처음엔 아니야. 결과물을 읽고 내 의도와 맞는지 계속 확인해야 해.

자동화 자체를 만드는 건 의외로 쉬워. 어려운 건 **내가 원하는 결과물대로 나오게 만드는 것**이야. 파이프라인 단축키를 만들고, 서브 에이전트를 나누고, 문서를 연결하는 건 금방 할 수 있어. 진짜 시간은 그다음부터 들어가.

나는 최소 2주 정도는 결과물을 보면서 품질 개선 작업이 필요하다고 봐.

:::canvas-flow
{
  "nodes": [
    { "id": "run", "label": "실행한다\n자동화 돌리기", "col": 0, "row": 0, "type": "process" },
    { "id": "read", "label": "결과물을 읽는다\n초안 확인", "col": 1, "row": 0, "type": "default" },
    { "id": "find", "label": "마음에 안 드는\n지점 찾기", "col": 2, "row": 0, "type": "warning" },
    { "id": "fix", "label": "업무 문서나\n담당자 기준 고치기", "col": 3, "row": 0, "type": "process" },
    { "id": "again", "label": "다시 실행한다\n다음 루프", "col": 4, "row": 0, "type": "success" }
  ],
  "edges": [
    { "from": "run", "to": "read" },
    { "from": "read", "to": "find" },
    { "from": "find", "to": "fix" },
    { "from": "fix", "to": "again" },
    { "from": "again", "to": "run" }
  ],
  "direction": "LR",
  "cols": 5,
  "rows": 1
}
:::

이 루프를 돌면서 자동화가 내 일에 맞아져.

결국 사람의 만족도나 취향은 디테일 차이야. 내가 원하는 결과물이 나오느냐는 내가 얼마나 의도를 잘 설명했고, 판단 기준을 얼마나 구체적으로 설계했느냐에 달려 있어. 자동화는 처음부터 완성품이 아니라, 돌리고 읽고 고치면서 품질을 맞춰가는 작업 환경이야.

## 오늘 바로 해볼 것

오늘은 실제로 자동화를 만들기보다, 내가 현업에서 하고 있는 업무를 하나 떠올려서 워크플로우로 설계해보자.

예를 들면 이런 업무들.

```text
매주 리포트 쓰기
회의록 정리하기
고객 메일 답변 초안 만들기
유튜브 대본 초안 만들기
채용 공고 초안 만들기
제안서 초안 만들기
```

아래 세 가지만 적어보면 돼.

```text
1. 내가 자주 하는 업무:
2. 이 업무에서 참고해야 할 문서나 기준:
3. 실제 업무 흐름:
```

예시는 이렇게 쓸 수 있어.

```text
1. 내가 자주 하는 업무:
주간 리포트 작성

2. 이 업무에서 참고해야 할 문서나 기준:
- 지난주 지표
- 이번 주 주요 이슈
- 대표 보고용 문체 기준
- 다음 액션 정리 기준

3. 실제 업무 흐름:
지표 확인 → 이상치 찾기 → 핵심 메시지 정리 → 초안 작성 → 표현 정리 → 검수 → 공유
```

여기서는 설계만 해보면 돼. 실제로 `.claude/commands/`, `.claude/agents/`, `.claude/skills/`, `.claude/settings.json`에 파일을 만들고 실행하는 건 다음 글에서 해볼 거야.

당장 뭘 해야 할지 모르겠다면 괜찮아. 다음 글에서 블로그 자동화 예시로 같이 해보면 돼.
