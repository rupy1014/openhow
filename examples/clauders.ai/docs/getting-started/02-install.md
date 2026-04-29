---
slug: getting-started/02-install
title: 설치하기
nav: 설치
description: '터미널이 처음이어도 Claude Code 설치와 첫 실행까지 끊기지 않게 안내하는 시작 문서다.'
thumbnail: /__content__/images/img-IM01.png
hook: 'Claude Code를 처음 설치하고 터미널에서 실행해보기'
status: 출시
tags: [getting-started, 설치, VSCode, claude-code]
---

## 그대로 따라 하면 돼

**한 줄 복사해서 붙여넣고 Claude Code를 한 번 실행해 보면 돼.** 단, 실제 사용을 하려면 Claude Code 사용 권한이나 결제가 필요할 수 있어.

처음엔 설치가 제일 큰 벽처럼 느껴질 수 있어. 그래서 이 문서는 설명보다 실행이 먼저야. 일단 설치하고, 한 번 켜보자.

## 1. 터미널 열기

터미널이 처음이라면, 검은 창에 텍스트를 입력하는 프로그램이라고 생각하면 돼. 겁먹지 않아도 돼.

- **Windows**: 시작 → `PowerShell` 검색 → **관리자 권한으로 실행**
- **Mac**: `⌘ + Space` → `터미널` 검색 → Enter

지금 하는 일은 그냥 **복사해서 붙여넣을 창을 여는 것**이야.

## 2. 설치 스크립트 실행

아래 스크립트를 그대로 복사해서 붙여넣고 Enter를 눌러.

뭔가 길게 설치되는 게 보여도 놀라지 말고 **끝까지 기다리면 돼**.

### Windows

```powershell
irm https://raw.githubusercontent.com/rupy1014/base-install/main/window-install.ps1 | iex
```

### Mac

```bash
curl -fsSL https://raw.githubusercontent.com/rupy1014/base-install/main/mac-install.sh | bash
```

이 스크립트가 설치에 필요한 것들을 한 번에 잡아줘. 원래는 여러 프로그램을 따로 설치해야 해서 30분 이상 걸릴 수 있는데, 한 줄로 실행할 수 있게 묶어둔 거야.

그래도 처음 보는 사람에게는 이 과정이 어렵게 느껴질 수 있어. 만약 에러가 나면 화면에 나온 **문구를 그대로 복사**해서 나에게 도움을 요청하면 돼.

## 3. 설치 확인

설치가 끝났으면 이렇게 실행해 봐.

```bash
claude
```

- 뭐가 진행되면 Claude Code가 설치는 된거야.
- 로그인 화면이나 Pro/결제 안내가 나와도 설치가 실패한 건 아니야. **설치는 끝났고**, 이제 사용 권한 안내가 뜬 거라고 보면 돼.
- 테마를 설정하라고 하거나 그런 초기 설정이 있을 수 있어. 그냥 영어 읽어보고 아무거나 선택해도 돼.

지금 단계에서는 **설치가 됐는지 확인하는 것**만 끝내면 충분해.

## 4. `claude`와 `dsclaude`는 뭐가 다르냐

설치가 끝나면 `dsclaude`도 같이 등록되어 있을거야. 이건 내가 만든 **alias 명령어**야.

|  | `claude` | `dsclaude` |
| --- | --- | --- |
| 파일 수정 전 | 확인을 거친다 | 바로 수정한다 |
| 속도 | 상대적으로 느리다 | 빠르다 |
| 추천 시점 | 처음 익힐 때 | 익숙해진 뒤 |

`dsclaude`는 `claude --dangerously-skip-permissions`의 단축 명령어야.

나는 처음부터 **`dsclaude`로 시작하는 걸 추천**해. Claude를 쓰다보면 자꾸 귀찮게 이것저것 확인을 요청하거든. 무슨 작업할때 Enter 를 누르지 않아도 돼.

## 5. `dsclaude`가 안 돼도 괜찮아

당장 `dsclaude`가 안 돼도 괜찮아. 지금은 `claude`만 되면 충분해.

그래도 나중에 필요하면 Claude에게 이렇게 시킬 수 있어.

```text
> dsclaude 명령어가 안 돼.
> claude --dangerously-skip-permissions를 dsclaude로 alias 등록해줘.
```

끝나면 터미널을 껐다가 다시 열어봐.

## 6. 뭐가 같이 설치됐어?

스크립트 한 번에 보통 이 세 가지가 같이 설치돼.

- **Node.js** — Claude Code가 돌아가는 기반
- **Git** — 파일 변경 기록을 남기는 도구
- **Claude Code** — 실제로 Claude에게 일을 시키는 도구 본체

세 개를 따로 설치할 필요는 없어. 스크립트가 순서대로 알아서 설치해줘.

## 자주 헷갈리는 포인트

- **Windows에서 관리자 권한 없이 시작함** — 설치가 중간에 막힐 수 있어.
- **설치 스크립트가 중간에 실패함** — 나에게 **화면에 나온 에러를 그대로 복사**해서 알려줘. 필요한 경우 스크립트를 고칠 수 있어.
- **설치 직후 터미널을 다시 안 열어 경로 반영이 안 됨** — 안 되면 터미널을 껐다가 다시 열어.
- **Claude Code 사용 권한이 없음** — 설치는 됐지만 실행 시 로그인이나 결제 안내가 나올 수 있어.
 