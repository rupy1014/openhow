---
slug: 부록-claude-code-치트시트
title: "Claude Code 치트시트"
nav: 치트시트
order: 4
---

**Claude Code 단축키 + 커맨드 전부 한 장에.**

필요할 때 Ctrl+F로 찾아 써.

---

## 키보드 단축키

### 일반

| 단축키 | 기능 |
|--------|------|
| `Ctrl+C` | 입력/생성 취소 |
| `Ctrl+D` | 세션 종료 |
| `Ctrl+L` | 화면 지우기 |
| `Ctrl+O` | 자세한 출력 토글 |
| `Ctrl+R` | 히스토리 역방향 검색 |
| `Ctrl+G` | 프롬프트를 에디터로 열기 |
| `Ctrl+X Ctrl+E` | 에디터로 열기 |
| `Ctrl+B` | 백그라운드 실행 작업 보기 |
| `Ctrl+T` | 작업 목록 토글 |
| `Ctrl+V` | 이미지 붙여넣기 |
| `Ctrl+X Ctrl+K` | 백그라운드 에이전트 종료 |
| `Esc Esc` | 되돌리기 / 실행 취소 |

### 모드 전환

| 단축키 | 기능 |
|--------|------|
| `Shift+Tab` | 권한 모드 순환 |
| `Option+P` | 모델 전환 |
| `Option+T` | Thinking 토글 |

### 입력

| 단축키 | 기능 |
|--------|------|
| `\ + Enter` | 줄바꿈 |
| `Ctrl+J` | 줄바꿈 |

### 프리픽스

| 프리픽스 | 기능 |
|----------|------|
| `/` | 슬래시 커맨드 |
| `!` | 직접 bash 실행 |
| `@` | 파일 언급 + 자동완성 |

---

## 세션 피커

| 키 | 기능 |
|----|------|
| `↑ ↓` | 탐색 |
| `← →` | 펼치기 / 접기 |
| `P` | 미리보기 |
| `R` | 이름 변경 |
| `/` | 검색 |
| `A` | 모든 프로젝트 |
| `B` | 현재 브랜치 |

---

## MCP 서버

### 추가 방식

| 옵션 | 설명 |
|------|------|
| `--transport http` | 원격 HTTP (권장) |
| `--transport stdio` | 로컬 프로세스 |
| `--transport sse` | 원격 SSE |

### 설정 범위

| 범위 | 파일 | 용도 |
|------|------|------|
| Local | `settings.local.json` | 개인용 |
| Project | `.mcp.json` | 공유/VCS |
| User | `~/.claude.json` | 전역 |

### 관리 커맨드

| 커맨드 | 기능 |
|--------|------|
| `/mcp` | 인터랙티브 UI |
| `claude mcp list` | 모든 서버 나열 |
| `claude mcp serve` | Claude Code를 MCP 서버로 실행 |

작업 중 서버가 입력을 요청할 수도 있어 (Elicitation).

---

## 슬래시 커맨드

### 세션

| 커맨드 | 기능 |
|--------|------|
| `/clear` | 대화 지우기 |
| `/compact [focus]` | 컨텍스트 압축 |
| `/resume` | 세션 재개/전환 |
| `/rename [name]` | 현재 세션 이름 변경 |
| `/branch [name]` | 대화 브랜치 생성 (`/fork` 별칭) |
| `/cost` | 토큰 사용량 통계 |
| `/context` | 컨텍스트 시각화 |
| `/diff` | 인터랙티브 diff 뷰어 |
| `/copy [N]` | 마지막(또는 N번째) 응답 복사 |
| `/rewind` | 대화/코드 체크포인트 되돌리기 |
| `/export` | 대화 내보내기 |

### 설정

| 커맨드 | 기능 |
|--------|------|
| `/config` | 설정 열기 |
| `/vim` | Vim 모드 토글 |
| `/theme` | 컬러 테마 변경 |
| `/permissions` | 권한 보기/업데이트 |
| `/effort [level]` | effort 설정 |
| `/color [color]` | 프롬프트 바 색상 |
| `/keybindings` | 키보드 단축키 커스터마이즈 |
| `/terminal-setup` | 터미널 키바인딩 설정 |

### 도구

| 커맨드 | 기능 |
|--------|------|
| `/init` | CLAUDE.md 생성 |
| `/memory` | CLAUDE.md 편집 |
| `/mcp` | MCP 서버 관리 |
| `/hooks` | 훅 관리 |
| `/skills` | 사용 가능한 스킬 나열 |
| `/agents` | 에이전트 관리 |
| `/chrome` | Chrome 연동 |
| `/reload-plugins` | 플러그인 핫 리로드 |
| `/add-dir <path>` | 작업 디렉터리 추가 |

### 특수

| 커맨드 | 기능 |
|--------|------|
| `/btw <question>` | 사이드 질문 (컨텍스트 사용 안 함) |
| `/plan [desc]` | 플랜 모드 |
| `/loop [interval]` | 주기적 작업 스케줄링 |
| `/voice` | 푸시투토크 음성 |
| `/doctor` | 설치 상태 진단 |
| `/pr-comments [PR]` | GitHub PR 댓글 가져오기 |
| `/stats` | 사용 연속일 & 선호도 |
| `/insights` | 세션 리포트 분석 |
| `/desktop` | 데스크톱 앱에서 계속하기 |
| `/remote-control` (`/rc`) | claude.ai/code 브릿지 |
| `/usage` | 플랜 한도 & 레이트 상태 |
| `/schedule` | 클라우드 예약 작업 |
| `/security-review` | 변경 내용 보안 분석 |
| `/feedback` (`/bug`) | 피드백 보내기 |
| `/release-notes` | 변경 로그 보기 |

---

## 메모리 & 파일

### CLAUDE.md 위치

| 위치 | 용도 |
|------|------|
| `./CLAUDE.md` | 프로젝트 (팀 공유) |
| `~/.claude/CLAUDE.md` | 개인 설정 |
| `/etc/claude-code/` | 조직 전체 관리 |

### 규칙 / 임포트

| 경로 | 설명 |
|------|------|
| `.claude/rules/*.md` | 프로젝트 규칙 |
| `~/.claude/rules/*.md` | 사용자 규칙 |
| `paths:` frontmatter | 경로별 규칙 |
| `@path/to/file` | CLAUDE.md 안에서 임포트 |

### 자동 메모리

- 저장 위치: `~/.claude/projects/<proj>/memory/`
- `MEMORY.md` + 토픽별 파일이 자동으로 로드돼

---

## 워크플로 & 팁

### 플랜 모드

| 방법 | 설명 |
|------|------|
| `Shift+Tab` | Normal → Auto-Accept → Plan 순환 |
| `--permission-mode plan` | 플랜 모드로 시작 |

### Thinking & Effort

| 방법 | 설명 |
|------|------|
| `Option+T` | Thinking on/off |
| `"ultrathink"` | 해당 턴 최대 effort |
| `Ctrl+O` | Thinking 상세 로그 보기 |
| `/effort low` | 가볍게 |
| `/effort med` | 보통 |
| `/effort high` | 깊게 |

### Git 워크트리

| 방법 | 설명 |
|------|------|
| `--worktree name` | 기능별 워크트리 분리 |
| `isolation: worktree` | 에이전트를 전용 워크트리에서 실행 |
| `sparsePaths` | 필요한 디렉터리만 체크아웃 |
| `/batch` | 워크트리 여러 개 자동 생성 |

### 보이스 모드

| 방법 | 설명 |
|------|------|
| `/voice` | 푸시투토크 활성화 |
| `Space` 누르고 유지 | 녹음 |
| 떼면 | 전송 |

20개 언어 지원.

### 컨텍스트 관리

| 방법 | 설명 |
|------|------|
| `/context` | 사용량 + 최적화 팁 |
| `/compact [focus]` | 지정 포커스로 압축 |
| Auto-compact | 약 95% 사용 시 자동 압축 |
| Opus 4 | 1M context |

---

## 한 줄 정리

Claude Code는 세션 관리 / MCP / 슬래시 커맨드 / 워크트리 / 메모리 / 음성 / 원격제어까지 다 갖춘 에이전트형 CLI야. 이 치트시트 하나 북마크 해두면 돼.
