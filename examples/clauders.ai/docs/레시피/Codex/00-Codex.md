---
slug: Codex
title: "Codex"
nav: Codex
order: 0
---

**OpenAI가 만든 코딩 에이전트야. Claude Code처럼 터미널에서 돌아가.**

근데 결은 좀 달라. Claude Code가 대화형 오케스트레이터에 가깝다면, Codex는 배치 실행과 자동화 쪽에 더 강해.

---

## 뭐가 어떻게 다르냐?

| | Codex CLI | Claude Code |
|--|-----------|-------------|
| 만든 곳 | OpenAI | Anthropic |
| 기본 모델 | gpt-5.4 | Claude Opus/Sonnet |
| 설정 파일 | AGENTS.md, config.toml | CLAUDE.md, settings.json |
| 서브에이전트 | multi_agent (config.toml) | Agent tool (내장) |
| 실행 모드 | codex exec (비대화형 배치) | 대화형 중심 |
| 샌드박스 | Seatbelt (macOS), Landlock (Linux) | 자체 샌드박스 |
| MCP | config.toml 연결 | settings.json 연결 |
| 플러그인 | - | Skills, Hooks, Plugins |
| 병렬 실행 | 서브에이전트 + worktree | Agent tool 병렬 스폰 |
| 비용 | ChatGPT 구독 또는 API 키 | Claude Pro/Max 구독 |

표만 보면 비슷해 보이는데, 실제 체감은 "대화형으로 밀어붙이냐"와 "작업을 배치처럼 쪼개 굴리냐"에서 갈려.

---

## 언제 뭘 쓰면 되냐?

### Claude Code가 잘하는 것

- 전략, 분석, 기획
- 코드 리뷰
- 복잡한 맥락 유지
- MCP 생태계

### Codex가 잘하는 것

- 배치 실행(`codex exec`)
- 병렬 서브에이전트
- 비용 효율적 반복 작업
- full-auto 모드

### 같이 쓰면 왜 세냐?

Claude가 기획하고 분석한 다음, Codex가 실제 실행을 맡으면 제일 깔끔해. 흔히 `/cowork` 같은 패턴으로 굴려. 자세한 건 다음 문서인 `01-codex-plugin.md`에서 다뤄.

---

## 이 폴더에 뭐가 들어 있냐?

| 문서 | 뭘 다루냐 |
|------|----------|
| Codex 플러그인 | Claude Code에서 Codex 쓰는 법 |
| Codex 잘 쓰는 법 | AGENTS.md, 승인모드, 프롬프팅, 서브에이전트, config.toml |
| oh-my-codex | Codex 위에 올리는 멀티 에이전트 레이어 |

이 순서대로 보면 돼. 먼저 "어떻게 연결하냐"를 보고, 그다음 "실전에서 어떻게 굴리냐"로 넘어가고, 마지막에 OMX 같은 상위 레이어를 얹으면 감이 빨리 잡혀.

---

## 한 줄 정리

Codex는 Claude Code의 대체재라기보다 다른 축의 도구야. 대화와 전략은 Claude가, 배치 실행과 반복 자동화는 Codex가 더 잘한다.
