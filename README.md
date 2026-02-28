# openhow

**Write Markdown. Publish instantly. Collaborate as a team.**

마크다운 문서를 로컬에서 작성하고, CLI 한 줄로 클라우드에 퍼블리시하는 문서 플랫폼입니다.
API 문서, 튜토리얼 북, 블로그 — 어떤 유형이든 지원합니다.

```bash
npm install -g @openhow/cli
openhow init
openhow serve     # 로컬 프리뷰 localhost:3600
openhow publish   # 클라우드 배포 → openhow.io
```

> **Live**: [openhow.io](https://openhow.io)

---

## Quick Start

### 1. 설치 & 초기화

```bash
# CLI 설치
npm install -g @openhow/cli

# 프로젝트 초기화
mkdir my-docs && cd my-docs
openhow init
```

### 2. 문서 작성

```
my-docs/
├── openhow.json              ← 프로젝트 설정
└── docs/
    ├── _meta.json            ← 네비게이션 순서
    ├── getting-started.md
    ├── api/
    │   ├── _meta.json
    │   ├── authentication.md
    │   └── endpoints.md
    └── guides/
        └── deployment.md
```

각 마크다운 파일의 frontmatter로 접근 권한을 제어합니다:

```yaml
---
title: API 인증 가이드
description: OAuth 2.0 인증 흐름 설명
access: team          # public | private | team | subscriber
order: 1
---

# API 인증 가이드

여기에 내용을 작성합니다...
```

### 3. 로컬 프리뷰 & 퍼블리시

```bash
# 로컬에서 확인
openhow serve

# 로그인 (최초 1회)
openhow login --provider github

# 클라우드 배포
openhow publish
```

---

## Claude로 5분 만에 시작하기

Claude Code나 Claude Desktop에서 아래 프롬프트를 입력하면 프로젝트 셋업부터 퍼블리시까지 자동으로 진행됩니다.

### 새 프로젝트 생성

```
npm install -g @openhow/cli 설치하고,
my-docs/ 폴더에 openhow 프로젝트를 초기화해줘.
API 문서 구조로 만들어줘 — 인증, 결제, 웹훅 3개 섹션으로.
```

### 기존 마크다운을 openhow로 변환

```
이 폴더의 .md 파일들을 openhow 형식으로 변환해줘.
frontmatter에 title, description, access: public 추가하고,
_meta.json으로 사이드바 순서 잡아줘.
openhow serve로 로컬 프리뷰 띄워서 확인해줘.
```

### 팀 워크스페이스 설정

```
openhow login 하고, my-team-docs 워크스페이스로 publish 해줘.
alice@team.com, bob@team.com 을 editor로 초대해줘.
```

---

## 팀 협업

여러 팀원이 각자 로컬에서 문서를 수정하고, CLI로 퍼블리시하면 버전 이력이 자동 기록됩니다.

```
팀원 A (로컬)                    팀원 B (로컬)
────────────                    ────────────
docs/ 편집                      docs/ 편집
git commit                      git commit
openhow publish                 openhow publish
       ↓                               ↓
       └──────── openhow.io ────────────┘
                     ↓
              버전 이력 자동 기록:
              v3  Alice  "API 인증 가이드"
              v4  Bob    "배포 가이드 수정"
```

### 워크스페이스 설정

```bash
# 팀장: 로그인 + 첫 퍼블리시
openhow login --provider github
openhow publish --workspace my-team-docs

# 팀원 초대
openhow invite alice@team.com -w my-team-docs -r editor
openhow invite bob@team.com   -w my-team-docs -r editor
```

### 팀원 작업 흐름

```bash
git clone <repo-url> && cd my-docs
openhow login --provider github    # 최초 1회

# 수정 → 커밋 → 퍼블리시
openhow serve                      # 로컬 확인
git commit -m "API 인증 섹션 추가"
openhow publish                    # git 커밋 메시지가 버전 메시지로 자동 반영
```

### 권한 모델

| 역할 | publish | 초대 | 설정 변경 | 문서 삭제 |
|------|---------|------|----------|----------|
| **owner** | O | O | O | O |
| **admin** | O | O | O | O |
| **editor** | O | X | X | 본인 문서만 |
| **viewer** | X | X | X | X |

> 자세한 내용은 [팀 협업 가이드](docs/team-collaboration-improvements.md)를 참고하세요.

---

## 콘텐츠 유형

### API Docs (`hierarchical`)

계층적 사이드바 네비게이션. 개발자 문서, SDK 가이드에 적합.

### Tutorial Book (`sequential`)

이전/다음 순차 탐색. 숫자 prefix(`01-`, `02-`)로 정렬. 유료 콘텐츠 지원.

```yaml
---
access: subscriber
price: 9900
freeSections: 2    # 처음 2개 섹션만 무료 공개
---
```

### Blog (`blog`)

최신순 정렬. 날짜 prefix로 자동 정렬. 주간 뉴스레터, 설교, 개발 로그 등.

### 실제 사례

- [AI Vibe Coding Book](https://github.com/rupy1014/ai-jobdori) — 20챕터 프로그래밍 강의 (챕터 1-2 무료, 이후 유료)
- [Slow Church](https://github.com/rupy1014/slow-church) — 주간 설교 공유

---

## CLI 명령어

```bash
# 기본
openhow init                     # 프로젝트 초기화
openhow serve [path]             # 로컬 프리뷰 (port 3600)
openhow publish [path]           # 클라우드 퍼블리시
openhow publish -m "v2 업데이트"  # 버전 메시지 지정

# 인증
openhow login --provider github  # OAuth 로그인
openhow logout                   # 로그아웃
openhow whoami                   # 현재 사용자 확인
openhow status                   # 계정 + 워크스페이스 상태

# 팀
openhow invite <email> -w <workspace> -r editor

# 버전 이력
openhow versions <slug> -w <workspace>   # 클라우드 퍼블리시 이력
openhow history [file]                   # 로컬 git 이력
openhow diff [file]                      # 로컬 변경 사항
openhow show <file> -c <commit>          # 특정 커밋 시점 내용

# 설정
openhow config get <key>
openhow config set <key> <value>
```

---

## 설정

### openhow.json

```json
{
  "title": "My Documentation",
  "content": "./docs",
  "type": "hierarchical",
  "theme": {
    "preset": "blue"
  }
}
```

| 필드 | 설명 | 값 |
|------|------|-----|
| `title` | 사이트 제목 | 문자열 |
| `content` | 마크다운 폴더 경로 | `"./docs"` |
| `type` | 콘텐츠 유형 | `hierarchical` \| `sequential` \| `blog` |
| `theme.preset` | 컬러 테마 | `blue` \| `green` \| `purple` \| `red` |
| `workspace` | 워크스페이스 slug | 자동 생성 |

### Frontmatter

```yaml
---
title: 문서 제목
description: 요약 설명
access: public        # public | private | team | subscriber
order: 1              # 사이드바 순서
draft: false           # true면 퍼블리시에서 제외
price: 9900            # subscriber 접근 시 가격 (원)
freeSections: 2        # 유료 문서에서 무료 공개 섹션 수
---
```

### 환경 변수 (CI/CD)

```bash
OPENHOW_TOKEN=<auth-token>    # 비대화형 환경용 인증 토큰
OPENHOW_API_URL=<url>         # 셀프호스팅 시 API 엔드포인트 오버라이드
```

---

## Features

- **One-command deploy** — `openhow publish`로 변경된 파일만 동기화
- **Access control** — 문서별 접근 레벨 (public / private / team / subscriber)
- **Version history** — 퍼블리시마다 스냅샷 보존, 웹 뷰어에서 과거 버전 열람
- **Team collaboration** — 워크스페이스 + 역할 기반 권한 (owner/admin/editor/viewer)
- **Auto navigation** — 폴더 구조에서 사이드바/TOC 자동 생성
- **Code highlighting** — Shiki 기반 다국어 구문 강조
- **Full-text search** — 별도 설정 없이 내장
- **Dark mode** — 시스템 설정 자동 추적
- **Edge delivery** — Cloudflare 글로벌 네트워크

---

## Pricing

| Plan | Price | 주요 기능 |
|------|-------|----------|
| **Free** | $0/mo | 공개 문서, 검색, 구문 강조, 다크모드 |
| **Pro** | $9/mo | 비공개 문서, 유료 콘텐츠 (paywall) |
| **Team** | $29/mo | 무제한 워크스페이스, 팀원 + 역할 관리 |

> 결제 시스템은 준비 중입니다. 현재 모든 기능을 무료로 사용할 수 있습니다.

---

## Self-hosting

Cloudflare 인프라에서 직접 운영할 수 있습니다.

| 구성 | 서비스 |
|------|--------|
| Runtime | Cloudflare Workers |
| Database | D1 (SQLite) |
| Storage | R2 |
| Auth | Better Auth (GitHub / Google OAuth) |

> [Self-hosting 가이드](docs/self-hosting.md) 참고

---

## Documentation

| 가이드 | 설명 |
|--------|------|
| [Getting Started](docs/getting-started.md) | CLI 설치부터 첫 퍼블리시까지 |
| [CLI Reference](docs/cli.md) | 전체 명령어 레퍼런스 |
| [Configuration](docs/configuration.md) | openhow.json, frontmatter, _meta.json |
| [Content Types & Examples](docs/examples.md) | 콘텐츠 유형별 템플릿과 실제 사례 |
| [Team Collaboration](docs/team-collaboration-improvements.md) | 팀 협업 워크플로우, 권한 모델 |
| [Self-hosting](docs/self-hosting.md) | 자체 Cloudflare 인프라 배포 |

---

## Repository Structure

```
openhow/
├── README.md
├── docs/                  ← 공개 문서
│   ├── getting-started.md
│   ├── cli.md
│   ├── configuration.md
│   ├── examples.md
│   ├── self-hosting.md
│   └── team-collaboration-improvements.md
└── core/                  ← 플랫폼 소스 (private)
    └── packages/
        ├── cli/           ← @openhow/cli (npm)
        ├── types/         ← @openhow/types (npm)
        ├── viewer/        ← Vue 3 SPA
        └── worker/        ← Cloudflare Worker API
```

---

## License

`@openhow/cli`와 `@openhow/types`는 npm에 공개되어 있습니다.
플랫폼 백엔드 (Worker + Viewer)는 proprietary입니다. 자체 배포는 [Self-hosting 가이드](docs/self-hosting.md)를 참고하세요.
