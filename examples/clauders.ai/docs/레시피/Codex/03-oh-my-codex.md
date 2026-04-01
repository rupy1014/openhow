---
slug: Codex-oh-my-codex
title: "oh-my-codex"
nav: oh-my-codex
order: 3
---

**Codex를 혼자 오래 붙잡고 돌리는 대신, 역할이 갈린 팀처럼 굴리고 싶을 때 보는 글이야.**

OMX는 Codex를 대체하는 게 아니라 위에 얹는 운영 레이어야. 병렬 팀, 세션 복구, 알림 연동 같은 흐름이 필요할 때 체감이 확 온다.

---

## oh-my-codex는 어디에 끼우면 맛이 사냐?

[oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex), 줄여서 OMX는 Codex CLI 위에 올리는 멀티 에이전트 레이어야. 혼자 한 세션을 오래 끄는 대신, 역할이 갈린 팀처럼 굴리게 도와줘.

강점은 두 갈래야. 하나는 이미 짜인 운영 자산이고, 다른 하나는 팀 모드야. 처음부터 운영 패턴을 다 짤 필요 없이, 필요한 스킬과 흐름을 바로 꺼내 쓰기 편해.

설치 흐름은 짧아:

```bash
npm install -g oh-my-codex
omx setup
omx doctor
```

여기서 많이 쓰는 건 팀 모드와 HUD야:

```bash
omx team 6:executor "리팩토링"
omx hud
```

그런데 OMX는 "스킬 이름을 안다" 수준에서 끝내면 별로 체감이 안 커. 실전은 티어를 나눠서 익히는 쪽이 훨씬 좋아.

### Tier 1: 거의 매일 쓰는 스킬

| 스킬 | 언제 쓰냐 | 왜 많이 쓰냐 |
|------|-----------|--------------|
| `$ralph` | 끝까지 완료 보장을 걸고 싶을 때 | 구현, 검증, 리뷰, 정리까지 루프를 닫아 |
| `$team` | 병렬 팀을 열고 싶을 때 | 역할 분리와 분업 시작점이야 |
| `$plan` | 큰 작업 들어가기 전에 | 전략 분해가 빨라져 |
| `$autopilot` | 반복 실행을 길게 맡길 때 | 6단계 자율 실행 흐름을 바로 켜 |

이 중 핵심은 `$ralph`야. 단순히 "코드 짜는 스킬"이 아니라 "완료될 때까지 루프를 돌리는 운영자"에 가까워:

:::canvas-flow
{
  "nodes": [
    { "id": "impl", "label": "구현", "col": 0, "row": 0, "type": "process" },
    { "id": "verify", "label": "검증", "col": 1, "row": 0, "type": "process" },
    { "id": "review", "label": "아키텍트\n리뷰", "col": 2, "row": 0, "type": "process" },
    { "id": "deslop", "label": "deslop\n정리", "col": 3, "row": 0, "type": "process" },
    { "id": "done", "label": "완료", "col": 4, "row": 0, "type": "success" }
  ],
  "edges": [
    { "from": "impl", "to": "verify" },
    { "from": "verify", "to": "review" },
    { "from": "review", "to": "deslop" },
    { "from": "deslop", "to": "done" },
    { "from": "verify", "to": "impl" },
    { "from": "review", "to": "impl" }
  ],
  "direction": "LR",
  "cols": 5,
  "rows": 1
}
:::

실패하면 구현으로 되돌아가서 다시 도는 루프야. 막연한 태스크를 맡길수록 차이가 커.

### Tier 2: 품질 올릴 때 꺼내는 스킬

| 스킬 | 언제 켜냐 | 포인트 |
|------|-----------|--------|
| `$ai-slop-cleaner` | AI 냄새 나는 코드 정리할 때 | 불필요한 추상화, 장황한 헬퍼를 줄여 |
| `$deep-interview` | 요구사항이 애매할 때 | 소크라틱 질문으로 스펙을 좁혀 |
| `$visual-verdict` | UI 검토할 때 | 스크린샷 비교로 눈속임을 덜 타 |

실전 패턴은 더 중요해. 아래 네 개만 익혀도 OMX 체감이 확 올라가.

### 패턴 A: 막연한 아이디어를 코드로 바꿀 때

:::canvas-flow
{
  "nodes": [
    { "id": "di", "label": "$deep-interview\n요구사항 압축", "col": 0, "row": 0, "type": "process" },
    { "id": "pl", "label": "$plan --consensus\n전략 합의", "col": 1, "row": 0, "type": "process" },
    { "id": "ap", "label": "$autopilot\n자율 실행", "col": 2, "row": 0, "type": "success" }
  ],
  "edges": [
    { "from": "di", "to": "pl" },
    { "from": "pl", "to": "ap" }
  ],
  "direction": "LR",
  "cols": 3,
  "rows": 1
}
:::

아이디어 단계에선 바로 구현보다 질문이 먼저여야 해. `$deep-interview`가 요구사항을 압축해 주고, `$plan --consensus`가 실행 전략을 합의 형태로 정리하고, `$autopilot`이 실제 작업을 밀어.

이 패턴은 기능 아이디어만 있고 스펙이 없을 때, 이해관계자가 여러 명일 때, 작업량이 커서 구현 전에 순서를 고정해야 할 때 특히 좋아.

### 패턴 B: 확실한 작업을 완료 보장으로 밀 때

```text
$ralph "API 라우트 전부 v2로 마이그레이션"
```

이건 "무엇을 만들지"보다 "반드시 끝까지 밀어야 해"가 중요한 작업에서 잘 먹혀. 대규모 린트 정리, API 버전 마이그레이션, 테스트 전면 보강 같은 태스크에 잘 맞고, 요구사항 탐색처럼 방향을 먼저 넓게 봐야 하는 작업엔 덜 맞아.

### 패턴 C: 병렬 팀 실행

```bash
$plan
omx team 3:executor "작업"
omx team status
omx team shutdown
```

여기서 초보자가 제일 많이 헷갈리는 포인트가 입력 채널이야.

| 입력 | 어디에 치냐 |
|------|-------------|
| `$ralph`, `$team`, `$plan` | Codex 채팅 안 |
| `omx team ...` | 터미널 CLI |

의도는 비슷해도 입력 위치가 달라. `$...`는 세션 안 명령, `omx ...`는 바깥 운영 명령이라고 기억하면 덜 헷갈려.

병렬 팀 모드는 강하지만 tmux 의존성이 커서 여기서 삐끗하는 경우가 제일 많아. 커뮤니티에서도 릴리스 절반이 tmux 핫픽스 같다는 농담이 괜히 나오는 게 아니야. 그래서 팀 모드를 쓸 땐 종료 습관이 중요해. 작업 끝나면 꼭 `omx team shutdown`으로 내려.

### 패턴 D: 조사와 분석

`$analyze`를 걸면 좋은 분석 출력은 이 흐름을 닮아:

:::canvas-flow
{
  "nodes": [
    { "id": "h", "label": "가설 수립", "col": 0, "row": 0, "type": "process" },
    { "id": "e", "label": "증거 수집", "col": 1, "row": 0, "type": "process" },
    { "id": "r", "label": "file:line\n레퍼런스", "col": 2, "row": 0, "type": "process" },
    { "id": "a", "label": "다음 액션\n제시", "col": 3, "row": 0, "type": "success" }
  ],
  "edges": [
    { "from": "h", "to": "e" },
    { "from": "e", "to": "r" },
    { "from": "r", "to": "a" }
  ],
  "direction": "LR",
  "cols": 4,
  "rows": 1
}
:::

"느낌상 여기 문제 같아"가 아니라 "이 파일 몇 줄 근처가 왜 의심되는지"를 뽑아야 해.

### 세션 복구도 꽤 강해

OMX는 `.omx/` 디렉토리에 세션 상태를 꽤 많이 남겨. 대표적으로 `.omx/state/`, `.omx/project-memory.json`, `.omx/logs/` 같은 파일이 있어. 그래서 중단된 세션을 다시 붙일 때 완전히 처음부터 설명하지 않아도 돼.

```bash
omx resume
```

장시간 작업, 터미널 종료, tmux 충돌, 일시적 rate limit 뒤에 이어붙일 때 특히 좋아.

### 멀티 프로바이더 팀도 가능해

한 팀 안에 Codex, Claude, Gemini 워커를 섞는 패턴도 있어:

```bash
OMX_TEAM_WORKER_CLI_MAP=codex,claude,gemini omx team 3:executor "작업"
```

이런 조합은 "빠른 탐색은 Gemini, 긴 코드 수선은 Codex, 리뷰는 Claude"처럼 역할 배치를 다르게 줄 때 재미가 나. 다만 운영 난도는 확 올라가. 모델마다 맥락 유지 방식, 검증 습관, 파일 수정 스타일이 달라서 팀 리드 역할을 하는 사람이 공통 AGENTS.md를 더 빡빡하게 적는 편이 좋아.

### 알림 연동도 걸어두면 편해

장시간 작업이면 결과 기다리는 시간이 제일 아깝다. OMX는 Telegram, Discord, Slack 웹훅 연동도 지원해.

```bash
export OMX_TELEGRAM_BOT_TOKEN=xxx
export OMX_DISCORD_WEBHOOK_URL=xxx
```

이런 식으로 걸어두면 팀 작업 끝났을 때 바로 알림이 와. queue-and-review 패턴이 더 잘 굴러가.

### 함정도 몇 개 알고 가

| 함정 | 대응 |
|------|------|
| tmux 의존성 | 팀 모드 후 `omx team shutdown` 습관 들여 |
| Ralph 무한 루프 | 이상하면 `omx cancel`로 끊어 |
| macOS Intel 경고 | `syspolicyd` 팝업 가능성 감안해 |
| 메이저 업데이트 호환성 | 깨지면 `omx setup --force`로 재설치해 |

특히 `$ralph`는 강력한 만큼 루프가 길어질 수도 있어. 완료 기준이 애매하면 더 그래. 그래서 `$ralph`를 쓸 땐 "끝의 정의"를 꼭 같이 적어.

예를 들면:

```text
$ralph "worker의 공유 링크 삭제 API 추가. 완료 기준은 타입 체크와 통합 테스트 통과."
```

### oh-my-claudecode도 같은 계열이야

같은 저자가 만든 Claude Code 버전도 있어. 거긴 더 많은 에이전트와 스킬을 앞세우는 쪽으로 가고, 자동 재시작처럼 "rate limit가 풀릴 때까지 기다렸다가 다시 이어가는" 운영 기능도 강조해.

짧게 요약하면, OMX는 Codex를 대체하는 도구가 아니야. Codex 위에 팀 운영 레이어를 얹는 도구야. 혼자 한 세션을 오래 끄는 방식보다 병렬 큐, 역할 분리, 세션 복구, 알림 연동이 중요한 순간에 진가가 나.

---

## 한 줄 정리

oh-my-codex는 Codex를 더 똑똑하게 만드는 모델이 아니라, 여러 에이전트를 팀처럼 굴리게 해주는 운영 레이어야. 병렬 실행, 완료 보장 루프, 세션 복구가 필요할 때 꺼내면 된다.
