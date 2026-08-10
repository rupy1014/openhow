---
slug: appendix/03-multi-tool-config
title: 멀티 툴 공유 설정
nav: 멀티 툴 공유 설정
description: 'Claude Code·Codex·Cursor·Gemini 같은 여러 AI 툴을 한 프로젝트에서 쓸 때 `.agents/` 정본 + 심볼릭 링크로 설정을 한 벌로 관리하는 방법이다.'
thumbnail: /__content__/images/img-AT06.png
hook: '툴마다 설정 폴더가 다르다. 따로 관리하면 무조건 어긋난다. 정본 한 벌만 두고 링크로 연결해라.'
status: 출시
tags: [appendix, multi-tool, agents-md, symlink, config]
---

# 멀티 툴 공유 설정

> **예상 시간**: 글 10분 + 따라하기 15분
> **바이브 4단계**: 사전 준비
> **이번 강의 끝나면**
> - 왜 여러 AI 툴 설정을 **한 벌로 관리**해야 하는지 이유가 잡힌다
> - `.agents/` + 심볼릭 링크로 **Claude·Codex·Cursor**를 동시에 맞추는 구조가 손에 잡힌다
> - `AGENTS.md`(공용) vs `CLAUDE.md`(전용) 역할 구분이 된다
>
> **인증물**: `ls -la .claude/commands` 결과 스크린샷 (심볼릭 링크 화살표 보이게)

## 핵심 요약

**Claude Code, Codex, Copilot, Cursor — 여러 AI 툴을 한 프로젝트에서 쓸 때, 설정을 따로 관리하면 망한다. `.agents/`에 한 벌만 두고 심볼릭 링크로 연결해라.**

같은 워크플로우를 `.claude/`에도 쓰고 `.codex/`에도 쓰면 한쪽만 고치고 다른 쪽은 잊어. 내용이 어긋나. 이 강은 그걸 구조적으로 막는 법을 알려줘.

- **정본 폴더** — `.agents/` 하나
- **나머지 툴 폴더** — 심볼릭 링크로 `.agents/`를 가리킨다
- **공용 규칙은 `AGENTS.md`, Claude 전용은 `CLAUDE.md`**

## 1. 왜 한 벌로 관리하냐

각 AI 코딩 툴은 자기만의 폴더 규약이 있어.

| 툴 | 지침 파일 | 커맨드/워크플로우 |
|----|----------|-----------------|
| Claude Code | `CLAUDE.md` | `.claude/commands/` |
| OpenAI Codex | `AGENTS.md` | `.codex/commands/` |
| GitHub Copilot | `AGENTS.md` | — |
| Cursor | `AGENTS.md` | `.cursor/rules/` |
| Antigravity (Gemini) | `GEMINI.md` | `.agent/workflows/` |

같은 워크플로우를 두세 군데에 복사하면? 수정할 때마다 전부 동기화해야 해. 사람이 이걸 실수 없이 할 수 있을까? 없어.

**해결: `.agents/`에 파일을 한 벌만 두고, 나머지는 심볼릭 링크로 연결해.**

```
내-프로젝트/
├── .agents/                    ← 여기가 정본
│   ├── workflows/
│   └── roles/
├── .claude/
│   ├── commands → ../.agents/workflows   ← 심볼릭 링크
│   └── agents   → ../.agents/roles
├── .codex/
│   ├── commands → ../.agents/workflows
│   └── agents   → ../.agents/roles
├── AGENTS.md                   ← 공용 지침
└── CLAUDE.md                   ← Claude 전용 추가 지침
```

## 2. 따라해봐

### Step 1. 정본 폴더 만들기

```bash
mkdir -p .agents/workflows .agents/roles
```

### Step 2. 기존 파일 옮기기

이미 `.claude/commands/`에 파일이 있으면:

```bash
mv .claude/commands/*.md .agents/workflows/
mv .claude/agents/*.md .agents/roles/
```

### Step 3. 기존 폴더 지우고 심볼릭 링크 걸기

```bash
# Claude Code용
rm -rf .claude/commands .claude/agents
ln -s ../.agents/workflows .claude/commands
ln -s ../.agents/roles .claude/agents

# Codex용
mkdir -p .codex
ln -s ../.agents/workflows .codex/commands
ln -s ../.agents/roles .codex/agents
```

### Step 4. 확인

```bash
ls -la .claude/commands
# → ../.agents/workflows  (화살표가 보이면 성공)
```

이제 `.agents/workflows/01-publish.md`를 고치면 `.claude/commands/`에서도 `.codex/commands/`에서도 바로 반영된다.

## 3. AGENTS.md — 크로스 툴 표준

`AGENTS.md`는 여러 AI 툴이 공통으로 읽는 지침 파일이야. Linux Foundation이 주도하는 업계 표준이고, Codex·Copilot·Cursor·Windsurf가 네이티브로 지원해.

**단, Claude Code는 `AGENTS.md`를 자동으로 읽지 않아.** Claude Code가 직접 읽는 건 `CLAUDE.md`뿐이야. 그래서 공용 규칙을 `AGENTS.md`에 두고 싶으면, `CLAUDE.md`에서 `@AGENTS.md`로 임포트해서 같이 읽게 해.

```md
# CLAUDE.md
@AGENTS.md

(여기 아래에 Claude 전용 규칙)
```

이러면 Codex·Cursor는 `AGENTS.md`를 그대로 쓰고, Claude는 `CLAUDE.md`를 통해 같은 내용을 끌어와. 그래서 역할 분담은 이대로 유지돼.

| 넣을 곳 | 내용 |
|---------|------|
| `AGENTS.md` | 워크플로우 목록, 실행 조건, 가드레일 (공용) |
| `CLAUDE.md` | 프로젝트 구조, 개발 명령어, Claude만 아는 설정 + `@AGENTS.md` 임포트 |

## 4. 새 AI 툴 추가할 때

`.agents/` 파일은 건드릴 필요 없어. 심볼릭 링크만 하나 더 걸면 돼.

```bash
mkdir -p .새툴
ln -s ../.agents/workflows .새툴/commands
```

## 5. Antigravity (Gemini) 설정

Antigravity는 다른 툴과 다르게 **3가지를 동시에 맞춰야** 워크플로우가 인식돼.

| 조건 | 없으면 |
|------|--------|
| `.gemini/settings.json`에 `enableAgents: true` | 기능 자체가 꺼져 |
| 워크플로우 파일에 `description:` frontmatter | 패널에 안 뜸 |
| `.agent/skills/{이름}/SKILL.md` 파일 존재 | 스킬로 인식 안 됨 |

하나라도 빠지면 워크플로우가 보이지 않아. Claude한테 `.gemini/settings.json`와 `.agent/skills/` 구조를 한 번에 세팅해달라고 시키면 몇 분 안에 끝난다.

## 6. 주의할 점

- **수정은 `.agents/`에서 해.** 심볼릭 링크를 지우고 새 파일을 만들면 연결이 끊겨.
- **Git은 심볼릭 링크를 추적해.** `git add .claude/commands` 하면 링크 자체가 저장돼. clone해도 같은 구조가 복원된다.
- **Windows에서는** 심볼릭 링크에 관리자 권한이 필요할 수 있어. 안 되면 복사 스크립트(`cp -r .agents/workflows/* .claude/commands/`)로 대체해.

## 자주 헷갈리는 포인트

- **Claude Code 하나만 쓰면 필요 없지?** — 맞아. 지금 Claude만 쓰고 당분간 그럴 거면 `.claude/`에 바로 둬도 된다. 나중에 Codex나 Cursor를 붙일 때 이 강으로 돌아와.
- **AGENTS.md랑 CLAUDE.md가 둘 다 있으면 충돌 안 해?** — 안 해. Claude Code가 직접 읽는 건 `CLAUDE.md`뿐이고, `AGENTS.md`는 `CLAUDE.md`에서 `@AGENTS.md`로 임포트해야 같이 읽혀. 공용 규칙은 AGENTS.md에, Claude 전용은 CLAUDE.md에 두고 임포트로 연결 — 이 경계만 지키면 깔끔해.
