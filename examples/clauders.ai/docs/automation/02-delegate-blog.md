---
slug: automation/02-delegate-blog
title: 작업 맡기기
nav: 작업 맡기기
description: '반복되는 산출물 하나를 골라 필요한 목차와 업무 문서를 실행 흐름에 붙이고, 한 줄 명령어로 처리하는 자동화 입문 실습이다.'
thumbnail: /__content__/images/img-AT01.png
hook: '반복되는 작업을 이제 나만의 워크플로우로 만들어보자.'
status: 출시
tags: [automation, delegation, commands, agents, writing]
---

## 핵심 요약

**워크플로우는 반복되는 산출물이 나오기까지의 과정을 실행 순서로 묶어둔 거야. 여기에 필요한 목차, 업무 문서, 담당자를 붙이고, 한 줄 명령어로 실행되게 만들면 자동화가 된다.**

여기서는 블로그 연재를 예시로 쓸게. 블로그가 특별해서가 아니야. 연재 글은 구조가 반복되고, 톤이 흔들리기 쉽고, 회차별 맥락이 쌓인다. 그래서 자동화 감각을 익히기 좋다.

회사 업무로 바꾸면 리포트, 제안서, 회의록, 고객 메일, 유튜브 대본도 같은 방식으로 만들 수 있어.

핵심은 이거야.

> 반복되는 결과물이 있다면, 그 결과물이 나오는 과정을 문서와 담당자 흐름으로 분해한다.

## 1. 복붙 한 번이면 환경이 잡힌다

본문에서는 폴더 구조부터 담당자 파일까지 하나씩 풀어서 만들어 볼 거야. 그런데 처음부터 직접 만드는 게 부담스럽다면, 먼저 **복붙 세팅 파일**을 돌려도 된다.

세팅 파일에는 본문에서 다룰 `CLAUDE.md`, 톤앤매너 문서, 검수 체크리스트, `/write` 명령어, 다섯 명의 담당자 파일이 전부 들어있다. 통째로 복사해서 Claude Code에 붙여넣으면 파일 구조와 기준 문서를 알아서 만들어줘.

**Step 1.** `my-blog` 폴더를 만들고 VS Code로 열기

바탕화면에 `my-blog` 폴더를 만들고 → VS Code → `File` → `Open Folder` → 선택.

**Step 2.** 터미널에서 `dsclaude` 실행

```bash:터미널
dsclaude
```

**Step 3.** 아래 세팅 파일을 열어서 통째로 복사한 뒤 Claude 세션에 붙여넣기

:::copy-embed embeds/setup-blog 블로그 연재 자동화 세팅 파일
:::

처음엔 안에 있는 내용을 다 읽지 않아도 돼. 통째로 복사해서 붙여넣으면 Claude가 파일을 알아서 만든다.

세팅이 끝났으면 본문으로 넘어가자. 아래에서는 **이 파일들이 왜 이렇게 생겼는지**, 그리고 본인 업무에 맞게 고치려면 어디부터 손봐야 하는지 하나씩 풀어서 설명한다. 그대로 복붙만 해도 돌아가지만, 결과물 완성도는 본인이 기준 문서를 얼마나 잘 다듬느냐에서 갈린다.

## 2. 먼저 작업 폴더를 만든다

예시는 `my-blog`로 갈게. 이름은 바꿔도 된다.

```text
my-blog/
├── CLAUDE.md
├── series-plan.md
├── docs/
│   ├── tone-and-manner.md
│   ├── article-structure.md
│   └── checklist.md
├── references/
│   ├── raw/
│   └── processed/
├── drafts/
├── posts/
├── reviews/
└── .claude/
    ├── commands/
    │   └── write.md
    └── agents/
        ├── series-manager.md
        ├── story-planner.md
        ├── writer.md
        ├── style-editor.md
        └── proofreader.md
```

각 파일의 역할은 이렇게 보면 된다.

| 파일/폴더 | 역할 |
| --- | --- |
| `CLAUDE.md` | 프로젝트 전체 맥락 |
| `series-plan.md` | 전체 연재 목차와 회차별 의도 |
| `docs/tone-and-manner.md` | 말투, 문체, 금지 표현 기준 |
| `docs/article-structure.md` | 서두·본문·마무리 구조 기준 |
| `docs/checklist.md` | 검수 항목과 통과 점수 기준 |
| `references/raw/` | 원본 PDF, PPT, 기존 산출물 |
| `references/processed/` | Claude가 읽기 쉽게 바꾼 `.md` 자료 |
| `drafts/` | 작업 중인 초안 |
| `posts/` | 발행 가능한 최종본 |
| `reviews/` | 검수 기록 |
| `.claude/commands/write.md` | `/write` 실행 흐름 |
| `.claude/agents/` | 목차별·역할별 담당자 |

## 3. 원본 자료는 `.md`로 전처리한다

회사에서 쓰던 산출물이 있으면 그대로 프로젝트에 넣어둔다. 다만 실제 자동화 기준으로 쓸 내용은 `.md`로 뽑아두자.

```text
references/
├── raw/
│   ├── old-post.pdf
│   └── brand-deck.pptx
└── processed/
    ├── old-post.md
    └── brand-deck.md
```

PDF도 읽을 수는 있어. 그런데 토큰을 많이 먹고, 매번 필요한 부분만 꺼내 쓰기 번거롭다. 자동화에 태울 기준은 마크다운이 편하다.

Claude에게 이렇게 시켜서 전처리하자.

```text
이 PDF 내용을 Claude가 글쓰기 기준으로 참고할 수 있게 마크다운으로 정리해줘.
목차, 반복되는 표현, 글 구조, 금지 표현을 분리해줘.
```

나온 문서는 꼭 읽어봐야 한다. 내 의도와 다르면 그 문서를 고친다. 자동화는 이 문서를 기준으로 움직이기 때문이야.

## 4. 프로젝트 맥락을 `CLAUDE.md`에 적는다

`CLAUDE.md`는 모든 작업의 첫 장이야.

```md
# My Blog

## 이 프로젝트는 뭐냐

카페 창업을 준비하는 과정을 기록하는 블로그다.

## 독자

카페 창업을 고민하지만 아직 실행 전인 직장인.

## 결과물 기준

- 경험담처럼 읽혀야 한다.
- 강의체로 쓰지 않는다.
- 실패 가능성과 현실 비용을 숨기지 않는다.
- 각 글 마지막에는 독자가 바로 해볼 행동을 남긴다.
```

이 파일이 있어야 `/write`가 매번 같은 방향으로 시작한다.

## 5. 목차별로 업무 문서를 둔다

말투 기준은 `docs/tone-and-manner.md`에 둔다.

```md
# 톤앤매너

## 기본 톤

- 친한 선배가 옆에서 말하듯 쓴다.
- 멋을 부린 문장 대신 바로 이해되는 문장을 쓴다.
- 과장된 성공담처럼 쓰지 않는다.

## 자주 쓰는 표현

- "처음엔 이렇게 보면 돼."
- "여기서 막히는 게 정상이다."
- "일단 작게 해보자."

## 피할 표현

- 무조건 성공한다
- 누구나 쉽게 월 천만 원
- 이 방법만 알면 끝
```

글 구조 기준은 따로 둘 수도 있다.

```text
docs/article-structure.md
docs/checklist.md
docs/seo-standard.md
```

특히 `docs/checklist.md`에는 검수 항목과 함께 **통과 점수 기준**을 적어둔다. 예를 들면 "체크리스트 80점 이상이면 통과, 미만이면 다시 보낸다" 같은 한 줄. 이 한 줄이 있어야 뒤에서 `proofreader`가 점수로 판정할 수 있다.

문서를 나누는 이유는 간단해. `/write` 하나 안에서 실제 글쓰기 업무가 차례로 돌 수 있기 때문이야. 소재를 고르고, 독자 관점을 잡고, 전개 방식을 정하고, 초안을 쓰고, 퇴고하고, 검수하는 단계마다 필요한 목차와 업무 문서를 다르게 배치하면 된다.

## 6. `/write`를 파이프라인 단축키로 만든다

`.claude/commands/write.md`에는 `/write`를 쳤을 때 실제 글쓰기 업무가 어떤 순서로 돌지 적는다.

```md
# /write

인자로 받은 회차의 블로그 글을 소재 판단부터 검수까지 처리한다.

## 읽을 문서

- CLAUDE.md
- series-plan.md
- docs/tone-and-manner.md
- docs/article-structure.md
- docs/checklist.md
- references/processed/ 안의 관련 샘플

## 실행 흐름

1. `series-manager`가 `series-plan.md`에서 해당 회차의 위치를 확인한다.
2. `story-planner`가 독자 관점과 전개 방식을 정리한다.
3. `writer`가 말투와 구조 문서를 참고해 초안을 작성한다.
4. `style-editor`가 `docs/tone-and-manner.md` 기준으로 퇴고한다.
5. `proofreader`가 `docs/checklist.md` 기준으로 검수한다.
6. 80점 이상이면 `posts/0N-[제목].md`로 저장한다.
7. 80점 미만이면 `style-editor`로 다시 보낸다 (최대 3회).

## 저장 경로

- 작업 중: `drafts/0N-[제목]-draft.md`
- 검수 기록: `reviews/review-0N.md`
- 최종본: `posts/0N-[제목].md`
```

이제 `/write 1화`를 치면 실제 글쓰기 업무 흐름이 한 번에 이어진다.

여기서 도메인 지식이 필요해. 글을 많이 써본 사람은 “초안 작성” 한 단계로 끝내지 않는다. 소재 판단, 독자 관점, 전개, 문체, 검수 기준을 나눠서 본다. 이걸 얼마나 정교하게 문서와 단계로 뽑아내느냐가 파이프라인의 품질을 결정한다.

## 7. 담당자는 중요한 작업을 맡기려고 만든다

담당자를 만드는 이유는 LLM의 컨텍스트 메모리 한계 때문이야.

나와 직접 대화하는 Claude를 **마스터 에이전트**라고 보면 된다. 마스터 에이전트는 나랑 대화하고, 프로젝트 문서를 읽고, 필요한 파일을 찾고, 결과를 보고하고, 다음에 뭘 해야 할지 판단한다.

쉽게 말하면 엄청 바쁘다.

마스터 에이전트의 컨텍스트 메모리는 이미 꽤 차 있다고 보면 돼. 대화 내용도 있고, 프로젝트 맥락도 있고, 내가 방금 한 요청도 있고, 읽어야 할 문서도 있다. 이 상태에서 초안 작성, 문체 퇴고, 검수까지 전부 혼자 하게 만들면 기준이 섞이기 쉽다.

그래서 중요한 작업은 별도 담당자에게 위임한다. 마스터 에이전트는 전체 흐름을 잡고, 서브 에이전트를 담당자로 불러서 순서대로 일하게 만든다.

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

이 방식은 시간이 더 걸린다. 토큰도 더 쓴다. 대신 결과만큼은 확실히 좋아진다. 각 담당자가 자기 역할과 자기 문서에 집중하기 때문이야.

빠르게 한 줄 답을 받아야 하는 상황이면 굳이 이렇게까지 안 해도 된다. 그런데 자동화는 반복해서 같은 품질의 결과물을 만들려고 쓰는 거잖아. 그래서 자동화에서는 이런 워크플로우를 기본으로 잡는 편이 좋다.

### 담당자는 문서를 맡는다

담당자를 나눌 때는 사람 이름부터 만들지 말고, 먼저 문서를 본다.

```text
CLAUDE.md
series-plan.md
docs/tone-and-manner.md
docs/article-structure.md
docs/checklist.md
```

그다음 각 문서를 누가 맡을지 정한다.

```text
series-manager  → series-plan.md
story-planner   → series-plan.md + article-structure.md
writer          → CLAUDE.md + article-structure.md + 관련 샘플
style-editor    → tone-and-manner.md
proofreader     → checklist.md
```

이렇게 하면 `/write`가 실행될 때 각 담당자가 자기 기준을 들고 들어간다.

실행 흐름은 이렇게 보면 된다.

:::canvas-flow
{
  "nodes": [
    { "id": "user", "label": "사용자\n/write 3화", "col": 0, "row": 0, "type": "default" },
    { "id": "master", "label": "마스터 에이전트\n요청 수신", "col": 1, "row": 0, "type": "process" },
    { "id": "series", "label": "series-manager\n회차 맥락", "col": 2, "row": 0, "type": "default" },
    { "id": "planner", "label": "story-planner\n전개 방식", "col": 3, "row": 0, "type": "default" },
    { "id": "writer", "label": "writer\n초안 작성", "col": 0, "row": 1, "type": "process" },
    { "id": "editor", "label": "style-editor\n퇴고", "col": 1, "row": 1, "type": "process" },
    { "id": "proof", "label": "proofreader\n검수", "col": 2, "row": 1, "type": "warning" },
    { "id": "report", "label": "사용자에게 보고\n최종 결과", "col": 3, "row": 1, "type": "success" }
  ],
  "edges": [
    { "from": "user", "to": "master" },
    { "from": "master", "to": "series" },
    { "from": "series", "to": "planner" },
    { "from": "planner", "to": "writer" },
    { "from": "writer", "to": "editor" },
    { "from": "editor", "to": "proof" },
    { "from": "proof", "to": "report" }
  ],
  "direction": "LR",
  "cols": 4,
  "rows": 2
}
:::

마스터 에이전트가 전체 흐름을 잡고, 서브 에이전트들이 각 단계의 담당자로 일하는 구조야.

### 역할별 담당자와 목차별 담당자를 섞는다

담당자는 보통 두 방식으로 나눈다.

역할별 담당자는 작업 순서가 분명할 때 쓴다.

```text
planner → writer → editor → proofreader
```

목차별 담당자는 문서 기준이 선명할 때 쓴다.

```text
tone-manager      → docs/tone-and-manner.md
seo-manager       → docs/seo-standard.md
brand-reviewer    → docs/brand-guide.md
```

실전에서는 두 방식이 섞인다.

```text
story-planner가 전개 방식을 정리하고,
writer가 초안을 쓰고,
style-editor가 퇴고하고,
seo-manager가 제목을 잡고,
proofreader가 체크리스트로 확인한다.
```

이게 워크플로우고, 앞 단계 결과가 다음 단계로 넘어가면 파이프라인이라고 불러도 된다. 여러 담당자와 문서를 조율한다는 의미에서는 오케스트레이션이라고 부르기도 한다.

### 담당자는 필요한 문서만 본다

담당자를 나누면 각 담당자가 필요한 문서만 들고 시작할 수 있어.

`writer`는 이런 것만 보면 된다.

- `CLAUDE.md`
- `series-plan.md`
- `docs/article-structure.md`
- 관련 샘플 `.md`

`proofreader`는 이런 것만 보면 된다.

- `CLAUDE.md`의 결과물 기준
- `docs/checklist.md`
- 방금 나온 초안

검수 담당자가 모든 기획 대화와 모든 샘플을 볼 필요는 없어. 필요한 기준만 들고 보는 편이 안정적이다.

### 담당자 파일은 길 필요 없다

담당자 파일은 길 필요 없어. 어떤 문서를 맡는지만 선명하면 된다.

```md
# writer

너는 블로그 초안을 작성하는 담당자다.

## 맡는 문서

- CLAUDE.md
- docs/tone-and-manner.md
- docs/article-structure.md
- references/processed/ 관련 샘플

## 하는 일

- series-manager가 확인한 회차 의도를 바탕으로 초안을 쓴다.
- 말투와 구조 기준을 따른다.
- 모르는 사실은 단정하지 않는다.

## 하지 않을 일

- 전체 연재 목차를 새로 바꾸지 않는다.
- 최종 검수까지 혼자 하지 않는다.
```

담당자는 멋있게 많이 만드는 게 목적이 아니야. **컨텍스트를 분리하고, 각 목차와 업무 문서를 실제 처리 단계에 할당하려고 만드는 것**이야.

## 8. 검수가 미달이면 다시 돌린다

담당자 워크플로우가 힘을 발휘하는 지점은 검수야.

`proofreader`가 이렇게 판단했다고 해보자.

```text
점수: 76점
문제:
- 독자 수준에 비해 설명이 어렵다.
- 경험담처럼 읽히지 않는다.
- 마지막 행동 제안이 약하다.

수정 지시:
- 문장을 더 짧게 나눠라.
- 예시를 하나 추가해라.
- 마지막에 독자가 오늘 해볼 일을 넣어라.
```

그러면 다시 `writer`나 `style-editor`를 돌린다.

:::canvas-flow
{
  "nodes": [
    { "id": "writer", "label": "writer\n초안 작성", "col": 0, "row": 0, "type": "process" },
    { "id": "editor", "label": "style-editor\n문체 퇴고", "col": 1, "row": 0, "type": "process" },
    { "id": "proof", "label": "proofreader\n기준 검수", "col": 2, "row": 0, "type": "warning" },
    { "id": "pass", "label": "통과\n저장", "col": 3, "row": 0, "type": "success" }
  ],
  "edges": [
    { "from": "writer", "to": "editor" },
    { "from": "editor", "to": "proof" },
    { "from": "proof", "to": "pass" },
    { "from": "proof", "to": "writer" }
  ],
  "direction": "LR",
  "cols": 4,
  "rows": 1
}
:::

`proofreader`가 기준 미달로 판단하면 `writer` 단계로 다시 돌아가서 같은 흐름을 한 번 더 돈다. 자동화는 한 번에 완벽하게 쓰는 흐름이 아니다. 만들고, 읽고, 기준에 맞게 고치는 흐름을 안에 넣는 거야.

## 9. 실행한 뒤 기준 문서를 고친다

세팅이 끝났으면 실행해봐.

```text
/write 1화
```

결과물이 나오면 바로 다음 명령을 치지 말고 읽어야 한다.

확인할 건 세 가지야.

- 내가 의도한 독자에게 맞는가
- 내 말투와 비슷한가
- 결과물 기준을 지켰는가

안 맞으면 프롬프트를 길게 다시 쓰지 말고 문서를 고친다.

```text
1화 초안을 읽어보니 너무 강의체야.
docs/tone-and-manner.md에 "강의체를 피하고 경험담처럼 쓴다"는 기준을 추가해줘.
proofreader가 이 기준을 검수하도록 docs/checklist.md도 수정해줘.
```

이 과정을 반복하면 자동화가 내 작업 방식에 가까워진다.

## 10. 결과물 완성도는 도메인 지식에서 나온다

여기서 한 번 짚고 가자. 지금까지 본 건 블로그 연재를 예시로 한 기술 데모야. `series-manager`, `writer`, `style-editor`, `proofreader` 같은 이름도 글쓰기 업무에서 가져온 거야.

이 책이 보여주는 건 자동화의 기술이야. 단축키 만들고, 담당자 나누고, 파이프라인 묶는 방식. 그런데 **결과물의 완성도를 결정하는 건 그 위에 올라타는 도메인 지식이야.**

예를 들어 마케팅 담당자가 블로그 자동화를 만든다고 해보자. 그 사람은 글쓰기 단계만 아는 게 아니야.

- 어떤 글이 검색에서 잘 잡히는지 SEO 기준을 안다.
- 첫 문단에서 이탈하는 독자 패턴을 안다.
- 자기 회사 브랜딩에 어떤 표현을 써야 하는지 안다.
- 사내 콘텐츠 가이드라인이 이미 있다.
- 어떤 회차에서 CTA를 어떻게 넣어야 전환이 나는지도 감이 있다.

그러면 그 사람이 만든 자동화는 이렇게 더 정교해진다.

- `seo-checker`가 따로 있어서 제목·메타·H1 구조까지 본다.
- `brand-reviewer`가 `docs/brand-voice.md`를 들고 표현을 점검한다.
- `cta-writer`가 회차별 CTA 후보를 따로 만든다.
- `docs/seo-standard.md`, `docs/cta-pattern.md`, `docs/persona.md` 같은 기준 문서가 더 정교하게 쪼개져 있다.
- 톤앤매너 문서도 “경험담처럼 쓰기”에서 끝나지 않고, 채널별·페르소나별로 분기된다.

같은 `/write` 구조라도 누가 만드느냐에 따라 결과물 차이가 큰 이유야.

```text
자동화 기술
  → 단축키, 담당자, 파이프라인 만드는 법
  → 이 책에서 따라할 수 있다

도메인 지식
  → 어떤 단계가 필요하고
  → 어떤 기준 문서를 만들어야 하고
  → 어떤 검수 항목이 결과를 가른다
  → 본인이 가장 많이 가지고 있다
```

본인이 자기 직무를 가장 잘 아는 사람이라면, 자동화는 그 지식을 문서와 단계로 꺼내는 도구일 뿐이야. 블로그가 아니라 채용 공고, 제안서, 회의록, 광고 문구, 영업 메일을 자동화한다면 거기서도 똑같아. 본인이 그 일을 잘하는 만큼 자동화도 잘 돌아간다.

이 책에서 보여주는 예시 이름과 단계는 그대로 따라 쓰지 않아도 돼. 본인 업무에 맞는 담당자, 본인 업무에 맞는 기준 문서, 본인 업무에 맞는 검수 포인트로 바꿔서 만드는 게 핵심이야.

**자동화의 품질은 결국 본인 업무에 대한 이해 수준에서 갈린다.**

## 자주 헷갈리는 포인트

### 블로그 말고 다른 업무도 가능해?

가능해. 블로그는 예시일 뿐이야. 반복되는 산출물이 있으면 같은 방식으로 만들 수 있다.

```text
/report       주간 리포트 초안
/meeting-note 회의록 정리
/reply        고객 메일 답변 초안
/proposal     제안서 초안
/script       유튜브 대본 초안
```

### 처음부터 담당자 5명이 필요해?

아니야. 처음엔 하나의 `/write` 파이프라인 안에 최소 단계만 넣어도 된다. 결과를 읽었을 때 문제가 반복되면 그때 문서나 담당자를 나누면 된다.

### 왜 샘플을 `.md`로 넣어야 해?

Claude가 읽고 재사용하기 편해서야. 원본 PPT/PDF는 보관해도 되지만, 실제 작업 기준으로 쓸 내용은 `.md`로 뽑아두는 편이 낫다.

## 오늘 바로 해볼 것

내가 자주 만드는 산출물 하나를 고르고, 아래 세 문서만 먼저 만들어봐.

```text
CLAUDE.md
work-plan.md 또는 series-plan.md
docs/output-standard.md
```

그다음 이 작업에 필요한 목차와 문서를 `/write`, `/report`, `/reply` 같은 업무 단축키에 연결해봐.
