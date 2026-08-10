---
slug: more/mcp-basics
title: MCP 기초
nav: MCP 기초
description: 'Claude Code가 Slack·Notion·Google Drive 같은 외부 서비스와 소통하게 해주는 MCP(USB-C 같은 표준)를 한 줄 명령어로 연결하는 방법을 정리한 문서다.'
thumbnail: /__content__/images/img-nb-sec-more.png
hook: 'Claude Code는 기본으로 내 컴퓨터 안에서만 놀아요. MCP를 꽂으면 바깥 세상이랑 소통해요.'
status: 출시
tags: [더보기, mcp, integrations, notion, slack]
access: public
---

# MCP 기초

> **예상 시간**: 글 10분
> **바이브 4단계**: 사전 준비
> **이번 강의 끝나면**
> - **MCP가 무엇**이고 왜 USB-C에 비유되는지 감이 온다
> - Notion·Slack·웹 검색 등 **자주 쓰는 MCP 서버**가 뭐가 있는지 안다
> - `claude mcp add` 한 줄로 **어떻게 연결**하는지 손에 잡힌다
>
> **인증물**: `/mcp` 실행해서 연결된 서버 목록 스크린샷 1장

## 핵심 요약

**Claude Code가 기본으로 할 수 있는 건 파일 읽기·쓰기·터미널 실행이에요. MCP를 연결하면 Slack·Notion·Google Drive 같은 바깥 세상과 소통할 수 있어요.**

자동화 입문 본편에선 Claude가 내 컴퓨터 안에서 파일을 만들고 읽는 일만 다뤘어요. 이 부록에선 바깥 서비스로 팔이 뻗어요. 회의록을 Notion에 바로 올리고, Slack 채널을 요약하고, 웹을 검색하는 일까지 Claude가 직접 처리해요.

- **MCP = Model Context Protocol** — AI와 외부 도구를 잇는 표준 규격
- **USB-C와 같은 구조** — 하나의 규격으로 200개 넘는 서비스에 꽂혀
- **연결은 한 줄** — `claude mcp add ...`

## 1. MCP가 뭔가요?

**Model Context Protocol** — AI가 외부 도구에 연결되는 표준 규격이에요.

비유하면 **USB-C**. 예전엔 기기마다 충전기가 달랐잖아요. USB-C가 나오니까 하나로 다 꽂아요.

MCP도 똑같아요. 예전엔 AI 도구마다 Slack 연동을 따로 만들었어요. MCP가 나오니까 하나의 규격으로 뭐든 연결해요.

Anthropic이 2024년에 만들었어요. 지금은 Linux Foundation 소속이고, OpenAI·Google도 지원해요. 업계 공통 표준이 된 거예요.

## 2. 뭘 할 수 있나요?

| MCP 서버 | 하는 일 |
|----------|---------|
| **Notion** | 페이지 만들기, 데이터베이스 검색, 내용 수정 |
| **Slack** | 채널 읽기, 메시지 보내기, 스레드 요약 |
| **Google Drive** | 파일 검색, 문서 읽기, 정리 |
| **Brave Search** | 실시간 웹 검색 |
| **GitHub** | PR 만들기, 이슈 관리, 코드 리뷰 |
| **PostgreSQL** | 데이터베이스 조회, 스키마 확인 |

이 외에도 200개 이상의 MCP 서버가 있어요.

## 3. 어떻게 연결하나요?

Claude Code 터미널에서 한 줄이면 돼요.

**Notion 연결하기**

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

**웹 검색 연결하기**

```bash
claude mcp add --transport stdio brave-search --env BRAVE_API_KEY=네API키 -- npx -y @modelcontextprotocol/server-brave-search
```

연결 뒤에 Claude Code를 다시 시작하면 바로 써요. `/mcp` 치면 연결된 서버 목록이 나와요.

## 4. 실제로 어떻게 쓰나요?

MCP를 연결하면 그냥 말로 시키면 돼요.

**Notion에 회의록 정리**

```
오늘 회의 내용 정리해서 Notion "회의록" 데이터베이스에 새 페이지로 만들어줘.
참석자: 김팀장, 박대리
결정사항: 다음 주 수요일까지 프로토타입 완성
```

**Slack 채널 요약**

```
#general 채널에서 오늘 대화 요약해줘.
```

Claude가 Notion이나 Slack에 직접 접근해서 처리해요.

## 5. 기본 도구랑 뭐가 다른가요?

Claude Code에는 처음부터 쓸 수 있는 기본 도구가 있어요.

| 기본 도구 | MCP 서버 |
|-----------|----------|
| 파일 읽기/쓰기 | Notion, Google Drive |
| 터미널 명령어 | Slack, Gmail |
| 웹 검색 (기본) | Brave Search (더 강력) |
| 코드 검색 | GitHub, PostgreSQL |

기본 도구는 **내 컴퓨터 안**에서만 작동해요. MCP는 **인터넷 너머의 서비스**와 연결해주는 거예요.

## 6. 설정은 어디에 저장되나요?

| 범위 | 어디에 | 언제 써 |
|------|--------|--------|
| 나만 (기본) | `~/.claude.json` | 혼자 쓸 때 |
| 프로젝트 공유 | `.mcp.json` | 팀이 같이 쓸 때 |

API 키 같은 비밀 정보는 `.mcp.json`에 직접 넣지 마세요. 환경변수로 관리해요.

## 7. 지금 해야 하나요?

아니요. 처음부터 필요하진 않아요.

기본 도구만으로도 충분히 많은 걸 해요. Notion이나 Slack 연동이 필요해지면 그때 연결하면 돼요. 과하게 꽂아두면 `/mcp` 목록이 복잡해져서 오히려 Claude가 헷갈려해요.

## 자주 헷갈리는 포인트

- **MCP랑 agents는 뭐가 다른가요?** — agents는 **내 프로젝트 안의 담당자**, MCP는 **바깥 서비스로 나가는 팔**. agents가 일을 맡는 쪽이면, MCP는 일할 때 쓰는 도구예요. 담당자가 Notion이 필요하면 MCP를 통해 Notion을 써요.
- **연결했는데 Claude가 안 써** — 대화를 재시작했는지 먼저 확인. 그래도 안 되면 `/mcp`로 서버가 초록색(정상)인지 봐요. 빨간색이면 API 키나 권한이 문제예요.
