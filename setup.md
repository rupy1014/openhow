# mdshare — Setup & Architecture Guide

> AI가 만든 문서를 공유하고 과금하는 퍼블리싱 플랫폼

## 1. 프로젝트 위치

| 항목 | 경로 |
|------|------|
| **mdshare (SDK)** | `/Users/taesupyoon/bootpay-commerce/multi-manager/projects/mdshare` |
| **이 문서 (meta)** | `/Users/taesupyoon/sideProjects/mdshare` |

## 2. SDK 패키지 구조 — 4가지 성격의 복합 프로젝트

mdshare는 Turbo + pnpm 모노레포이며, 단일 SDK가 아니라 **CLI 도구 + 웹 뷰어(홈페이지) + API 서버 + AI 통합**이 하나의 모노레포에 내장된 복합 프로젝트다.

```
mdshare/
├── packages/
│   ├── types/    @max5/types   — 공유 TypeScript 타입 (npm public)
│   ├── cli/      @max5/cli     — CLI 도구 (npm public)
│   ├── viewer/   @max5/viewer  — Vue 3 SPA 프론트엔드 (private)
│   └── worker/   @max5/worker  — Cloudflare Worker API (private)
├── turbo.json
└── pnpm-workspace.yaml
```

**핵심 기술 스택:**
- Runtime: Cloudflare Workers (Hono)
- Database: D1 (SQLite) + Drizzle ORM
- Storage: R2 (마크다운 콘텐츠)
- Auth: Better Auth (GitHub, Google OAuth)
- Frontend: Vue 3 + Pinia + Tailwind CSS
- Build: Turbo + tsup (cli, types) + Vite (viewer)

### 2-1. CLI 도구 (`@max5/cli`) — 로컬 개발 + 클라우드 퍼블리시

npm으로 설치하는 커맨드라인 도구. 8개 명령어를 제공한다.

```
cli/src/
├── cli.ts              ← 엔트리포인트 (Commander.js)
├── commands/
│   ├── serve.ts        ← Vite dev server로 로컬 뷰어 실행 (:3600)
│   ├── publish.ts      ← 클라우드 퍼블리시 (인증→스캔→해시비교→에셋 리라이트→업로드)
│   ├── init.ts         ← mdshare.json + docs/ 샘플 생성
│   ├── config.ts       ← get/set/reset 설정 관리
│   ├── auth.ts         ← login/logout/whoami (OAuth 로컬 콜백 서버 :3602)
│   └── status.ts       ← 계정/워크스페이스 상태 조회
├── scanner/
│   └── index.ts        ← globby 스캔 + gray-matter 파싱 + _meta.json 네비게이션 생성
├── config/
│   └── index.ts        ← mdshare.json → .mdsharerc.json → ~/.mdshare/config.json 순서로 로드
├── auth/
│   ├── client.ts       ← AuthClient (API 통신, 토큰 관리)
│   └── token-storage.ts ← 로컬 토큰 저장/삭제
└── utils/
    └── logger.ts
```

**현재 구현된 핵심 기능:**
- `serve`: 뷰어 패키지를 Vite로 띄우고 `window.__PROJECT_DATA__`로 스캔 결과 주입
- `publish`: contentHash 비교로 변경분만 업로드, 에셋(이미지 등)은 R2 URL로 리라이트
- `init`: `mdshare.json` + `docs/{guide,api}/*.md` + `_meta.json` 스캐폴딩
- `login`: 로컬 HTTP 서버(:3602) → 브라우저 OAuth → 토큰 수신 → 로컬 저장

**설정 로딩 우선순위:** `mdshare.json` > `.mdsharerc.json` > `~/.mdshare/config.json` > 기본값

### 2-2. 웹 뷰어/홈페이지 (`@max5/viewer`) — Vue 3 SPA

클라우드에 퍼블리시된 문서를 보여주는 프론트엔드. Worker의 static assets로 배포된다.

```
viewer/src/
├── App.vue
├── main.ts
├── router.ts
├── views/
│   ├── Home.vue              ← 랜딩 페이지
│   ├── Dashboard.vue         ← 내 워크스페이스/문서 관리
│   ├── DocPage.vue           ← 마크다운 문서 렌더링 (marked + DOMPurify + Shiki)
│   ├── SearchResults.vue     ← 전문 검색 결과
│   ├── WorkspaceDocs.vue     ← 워크스페이스별 문서 목록
│   ├── WorkspaceSettings.vue ← 워크스페이스 설정 (멤버 관리 등)
│   └── Login.vue             ← 로그인 UI
├── components/
│   ├── MainNav.vue           ← 상단 탭 네비게이션
│   ├── Navigation.vue        ← 사이드바 네비게이션
│   └── TableOfContents.vue   ← 문서 내 목차 (h2/h3)
├── stores/
│   ├── auth.ts               ← 인증 상태 (Pinia)
│   ├── project.ts            ← 프로젝트 데이터 (로컬 serve 시 window.__PROJECT_DATA__)
│   └── theme.ts              ← 테마 설정
├── content/
│   └── (markdown 렌더링 유틸)
├── layouts/
│   └── (레이아웃 컴포넌트)
└── styles/
    └── (Tailwind CSS)
```

**두 가지 동작 모드:**
- **로컬 모드** (`mdshare serve`): Vite dev server로 실행, `window.__PROJECT_DATA__`에서 데이터 로드
- **클라우드 모드** (배포 후): Worker API에서 데이터 페치, Better Auth 세션 기반 인증

### 2-3. API 서버 (`@max5/worker`) — Cloudflare Worker

문서 저장/조회/검색/인증을 담당하는 서버리스 API.

```
worker/src/
├── index.ts            ← Hono 앱 + 특수 엔드포인트 (manual.md, llms.txt, CLI OAuth)
├── types.ts            ← Bindings, Variables 타입
├── db/
│   └── schema.ts       ← Drizzle ORM 스키마 (D1)
├── lib/
│   └── auth.ts         ← Better Auth 설정 (GitHub, Google)
├── middleware/
│   └── auth.ts         ← requireAuth 미들웨어
└── routes/
    ├── documents.ts    ← CRUD + by-slug 조회 + contentHash 기반 변경 감지
    ├── workspaces.ts   ← 워크스페이스 생성/조회/삭제
    ├── search.ts       ← 전문 검색 (D1 LIKE 쿼리)
    ├── members.ts      ← 멤버 초대/역할(owner/admin/editor/viewer)
    └── assets.ts       ← 에셋 업로드(base64→R2) + 서빙 (/api/assets/:ws/:doc/:path)
```

**Cloudflare 바인딩:**
| Binding | Type | 용도 |
|---------|------|------|
| `DB` | D1 | 문서 메타, 워크스페이스, 멤버, 세션 |
| `R2` | R2 bucket | 마크다운 콘텐츠 + 이미지 에셋 |
| `KV` | KV namespace | (세션 캐시 등) |
| `ASSETS` | Static Assets | `viewer/dist` (Vue SPA) |

**특수 엔드포인트:**
- `GET /manual.md` — 자동 생성 셋업 매뉴얼 (마크다운)
- `GET /llms.txt` — AI 어시스턴트용 프로젝트 가이드 (모네타이제이션 전략 포함)
- `GET /api/cli/auth/start` → `GET /api/cli/auth/complete` — CLI OAuth 플로우

### 2-4. 공유 타입 (`@max5/types`) — 패키지 간 계약

```
types/src/
├── index.ts
├── config.ts       ← MdshareConfig, ThemeConfig (preset: blue|green|purple|red), ScanConfig
├── project.ts      ← ProjectStructure (pages + navigation + config), Page, PageAssetReference
├── navigation.ts   ← MainNavItem, SidebarGroup, SidebarConfig (폴더 경로 → 사이드바 매핑)
├── workspace.ts    ← Workspace, WorkspaceMember (role: owner|admin|editor|viewer)
└── document.ts     ← Document (accessLevel: public|unlisted|team|private, freeSections, price)
```

### 2-5. AI 통합 계층

Worker에 내장된 AI 친화적 엔드포인트들:

```
/manual.md          ← 사람/AI가 읽을 수 있는 셋업 가이드
/llms.txt           ← LLM 지시문 (setup 순서, 모네타이제이션 전략, KPI 체크리스트)
```

`llms.txt`에는 이미 다음이 정의되어 있다:
- 가격 사다리: free/pro/team/enterprise
- 결제 통합 플로우: Stripe/Paddle webhook → workspace entitlement
- 업셀 터치포인트: paywall denial + dashboard usage limit
- 퍼블릭→유료 퍼널: public docs → gated templates/checklists
- 30/60/90일 실행 체크리스트

## 3. Example 프로젝트 (콘텐츠 소비자)

mdshare SDK를 통해 퍼블리싱할 실제 문서 프로젝트들이다. 각기 다른 도메인과 콘텐츠 구조를 가지며, 이들의 공통 니즈가 mdshare의 기능 설계를 이끈다.

### 3-1. ai-docs — 기업 개발자 매뉴얼

| 항목 | 내용 |
|------|------|
| 경로 | `/Users/taesupyoon/bootpay-commerce/multi-manager/projects/ai-docs` |
| 성격 | Bootpay API 개발자 문서 |
| 빌드 | VitePress |
| 구조 | `content/{guide,payment,order,billing,subscription,...}/*.md` |

**특징:**
- 체계적인 디렉토리 분류 (결제, 주문, 구독 등 도메인별)
- API 레퍼런스 + 통합 가이드 + 레시피 패턴
- `llms-full.txt` 빌드 스크립트 (AI 학습용 전체 문서 추출)
- 전문적인 톤, 코드 예시 중심

**mdshare에 요구하는 것:**
- 복잡한 사이드바/네비게이션 (다단계 폴더 구조)
- 검색 기능 (API endpoint, 파라미터 검색)
- 코드 하이라이팅 (다중 언어)
- 버전 관리 (API v2, v3 분리)

### 3-2. ai-jobdori — IT 바이브코딩 강의

| 항목 | 내용 |
|------|------|
| 경로 | `/Users/taesupyoon/sideProjects/ai-jobdori` |
| 성격 | 바이브코딩 영상 시리즈 + 블로그 + 전자책 |
| 빌드 | Astro (블로그) + Remotion (영상) |
| 구조 | `contents/{vibe-coding-book,youtube,bootpay,clauders}/*.md`, `blog/` |

**특징:**
- 연재형 콘텐츠 (00-프롤로그 ~ 19-배포하기, 순서 있는 챕터)
- 블로그 + 전자책 + 유튜브 스크립트가 혼재
- RSS 피드 → 스코어링 → 드래프트 자동화 파이프라인
- Remotion 기반 영상 생성 (TTS, 타임라인)

**mdshare에 요구하는 것:**
- 순서형 콘텐츠 네비게이션 (이전/다음 챕터)
- 멀티 콘텐츠 타입 지원 (book, blog, video script)
- 과금 모델 (유료 챕터 잠금)
- 미디어 에셋 관리 (이미지, 영상 썸네일)

### 3-3. slow-church — 교회 설교

| 항목 | 내용 |
|------|------|
| 경로 | `/Users/taesupyoon/sideProjects/slow-church` |
| 성격 | 느린교회 설교 영상 파이프라인 |
| 빌드 | Remotion (영상) |
| 구조 | `sermons/{001-burning-bush,...,017-eating-with-sinners}.md` |

**특징:**
- 단일 디렉토리에 번호 기반 문서 (001~017)
- 설교 마크다운 → TTS → 립싱크 → 영상 자동 생성
- `references.yaml`로 성경 구절 관리
- 톤앤매너 가이드 별도 관리 (`tone-and-manner.md`)

**mdshare에 요구하는 것:**
- 심플한 리스트형 네비게이션 (날짜/번호순)
- 커스텀 메타데이터 (설교 날짜, 성경 구절, 시리즈)
- 공개/비공개 설정 (draft 상태 관리)
- 외부 미디어 임베드 (YouTube 영상 링크)

## 4. Examples에서 추출한 공통 패턴

세 프로젝트를 분석하면, mdshare가 수용해야 할 **콘텐츠 구조 패턴**이 보인다.

```
┌─────────────────────────────────────────────────┐
│              콘텐츠 구조 패턴                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  [A] 계층형 (ai-docs)                            │
│      guide/                                     │
│        intro.md                                 │
│        setup.md                                 │
│      payment/                                   │
│        request.md                               │
│        cancel.md                                │
│                                                 │
│  [B] 순서형 (vibe-coding-book, sermons)          │
│      01-프롤로그.md                               │
│      02-바이브-코딩이란.md                         │
│      03-알아야-할-것.md                            │
│                                                 │
│  [C] 블로그형 (ai-jobdori blog)                   │
│      날짜 기반, 카테고리 태그                       │
│      RSS 피드 자동화                              │
│                                                 │
└─────────────────────────────────────────────────┘
```

**mdshare의 `mdshare.config.ts`가 이 세 패턴을 모두 수용해야 한다:**

```ts
// 예시: mdshare.config.ts
export default {
  title: "My Docs",
  content: "./docs",           // 콘텐츠 루트
  type: "hierarchical",        // "hierarchical" | "sequential" | "blog"
  theme: { preset: "blue" },
  navigation: {
    mainNav: [...],            // 상단 탭
    sidebar: {...},            // 사이드바 (자동 생성 가능)
  },
  monetization: {              // 과금 설정
    freeSections: 3,
    price: 5000,
  },
}
```

## 5. git submodules 구성 (구현 완료)

실제 사용 사례 프로젝트를 `examples/` 디렉토리에 git submodule로 연결했다.

### 현재 구조

```
mdshare/
├── packages/{types,cli,viewer,worker}
├── examples/                        ← git submodules
│   ├── ai-docs/                     # git.bootpay.co.kr/bootpay/docs.git
│   ├── ai-jobdori/                  # github.com/rupy1014/ai-jobdori.git
│   ├── slow-church/                 # github.com/rupy1014/slow-church.git
│   └── README.md
├── .gitmodules
└── pnpm-workspace.yaml              # packages/* 만 인식 → examples 간섭 없음
```

### .gitmodules

```ini
[submodule "examples/ai-docs"]
	path = examples/ai-docs
	url = https://git.bootpay.co.kr/bootpay/docs.git
[submodule "examples/ai-jobdori"]
	path = examples/ai-jobdori
	url = https://github.com/rupy1014/ai-jobdori.git
[submodule "examples/slow-church"]
	path = examples/slow-church
	url = https://github.com/rupy1014/slow-church.git
```

### 사용법

```bash
# 클론 시 submodule까지 한번에
git clone --recurse-submodules https://gitea.max5.ai/ehowlsla/mdshare.git

# 이미 클론한 경우
git submodule update --init --recursive

# submodule 최신 커밋으로 업데이트
git submodule update --remote

# 특정 example만 업데이트
git submodule update --remote examples/ai-docs
```

### CLI로 example 테스트

```bash
# CLI 링크 후 각 example에 대해 serve 실행
cd packages/cli && pnpm link --global

mdshare serve ../../examples/ai-docs/content         # 계층형 문서
mdshare serve ../../examples/ai-jobdori/contents/vibe-coding-book  # 순서형 전자책
mdshare serve ../../examples/slow-church/sermons      # 순서형 설교
```

### submodule 사용 이유

- **실제 콘텐츠로 SDK 검증**: 가짜 fixture가 아니라 실제 프로덕션 문서로 테스트
- **독립 릴리스**: 각 프로젝트는 독립 repo, 독립 커밋 주기 유지
- **빌드 격리**: pnpm workspace는 `packages/*`만 인식하므로 examples는 빌드에 무관
- **선택적 클론**: submodule 없이도 SDK 개발 가능 (`git clone` 만으로 충분)

## 6. SDK 개선 로드맵

### Phase 1: 콘텐츠 어댑터 (현재 → 단기)

현재 CLI의 scanner는 단순 glob 패턴이다. 세 프로젝트를 수용하려면 콘텐츠 어댑터가 필요하다.

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  ai-docs     │     │                  │     │              │
│  (VitePress) │────▶│  Content Adapter │────▶│  mdshare     │
│              │     │                  │     │  Publish API │
├──────────────┤     │  - scan()        │     │              │
│  ai-jobdori  │────▶│  - normalize()   │────▶│  - R2 저장    │
│  (Astro)     │     │  - buildNav()    │     │  - D1 메타    │
│              │     │                  │     │  - 검색 인덱싱 │
├──────────────┤     │                  │     │              │
│  slow-church │────▶│                  │────▶│              │
│  (Remotion)  │     │                  │     │              │
└──────────────┘     └──────────────────┘     └──────────────┘
```

**구현 우선순위:**

1. `mdshare.config.ts` 스펙 확장 — type, monetization, metadata 필드
2. 콘텐츠 스캐너 개선 — frontmatter 기반 자동 네비게이션 생성
3. `mdshare init` 개선 — 인터랙티브 프로젝트 타입 선택

### Phase 2: Viewer 컴포넌트 (단기 → 중기)

각 콘텐츠 타입에 맞는 Viewer 컴포넌트가 필요하다.

| 컴포넌트 | 용도 | 관련 Example |
|----------|------|-------------|
| `DocNav` | 계층형 사이드바 + 검색 | ai-docs |
| `ChapterNav` | 이전/다음 + 진행률 바 | ai-jobdori (book) |
| `SermonList` | 날짜순 카드 리스트 | slow-church |
| `CodeBlock` | 다중 언어 코드 하이라이팅 | ai-docs |
| `PayWall` | 유료 섹션 잠금 UI | ai-jobdori |
| `MediaEmbed` | YouTube/오디오 임베드 | slow-church |
| `TOC` | 문서 내 목차 (h2/h3) | 공통 |
| `SearchBar` | 전문 검색 | 공통 |

### Phase 3: 퍼블리싱 자동화 (중기)

```bash
# 목표: 한 줄로 끝나는 퍼블리싱
mdshare publish                    # 현재 디렉토리 기준
mdshare publish --watch            # 파일 변경 시 자동 업데이트
mdshare publish --ci               # CI/CD용 (non-interactive)
```

**CI 통합 예시 (GitHub Actions):**

```yaml
# .github/workflows/publish.yml
on:
  push:
    branches: [main]
    paths: ['docs/**', 'content/**']

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @max5/cli
      - run: mdshare publish --ci
        env:
          MDSHARE_TOKEN: ${{ secrets.MDSHARE_TOKEN }}
```

### Phase 4: 테마 & 커스텀 도메인 (장기)

- 프로젝트 타입별 프리셋 테마 (docs, book, blog, church)
- 커스텀 도메인 연결 (`docs.bootpay.co.kr` → mdshare viewer)
- 화이트라벨링 (로고, 파비콘, OG 이미지 자동 생성)

## 7. 각 Example 프로젝트에서 mdshare 연동 방법

### ai-docs (기업 문서)

```bash
cd /Users/taesupyoon/bootpay-commerce/multi-manager/projects/ai-docs

# mdshare 설정 초기화
mdshare init --type hierarchical

# content 디렉토리 기준으로 퍼블리시
mdshare publish --workspace bootpay-docs --content ./content
```

```ts
// mdshare.config.ts
export default {
  title: "Bootpay Developers",
  content: "./content",
  type: "hierarchical",
  theme: { preset: "blue" },
  scan: { exclude: ["**/public/**"] },
}
```

### ai-jobdori (연재 강좌)

```bash
cd /Users/taesupyoon/sideProjects/ai-jobdori

# 바이브코딩 북 콘텐츠만 퍼블리시
mdshare publish --workspace vibe-coding --content ./contents/vibe-coding-book
```

```ts
// mdshare.config.ts
export default {
  title: "바이브코딩 완전정복",
  content: "./contents/vibe-coding-book",
  type: "sequential",
  monetization: { freeSections: 5, price: 9900 },
}
```

### slow-church (설교)

```bash
cd /Users/taesupyoon/sideProjects/slow-church

# 설교 문서 퍼블리시
mdshare publish --workspace slow-church --content ./sermons
```

```ts
// mdshare.config.ts
export default {
  title: "느린교회",
  content: "./sermons",
  type: "sequential",
  theme: { preset: "green", dark: false },
}
```

## 8. 현재 구현 상태 vs 목표

### 이미 구현된 것 (SDK 내부 파악 결과)

- [x] CLI 8개 명령어 (serve, publish, init, config, login, logout, whoami, status)
- [x] Scanner: globby + gray-matter + `_meta.json` 기반 2패널 네비게이션 자동 생성
- [x] Scanner: 숫자 접두사 (`01-`, `02-`) 기반 자동 정렬 (`parseNumericPrefix`)
- [x] Publish: contentHash 비교로 변경분만 업로드
- [x] Publish: 상대경로 이미지/에셋 → R2 URL 리라이트 + base64 업로드
- [x] Viewer: Home, Dashboard, DocPage, SearchResults, WorkspaceDocs, WorkspaceSettings, Login
- [x] Viewer: MainNav, Navigation(사이드바), TableOfContents 컴포넌트
- [x] Viewer: marked + DOMPurify + Shiki 코드 하이라이팅
- [x] Worker: documents, workspaces, search, members, assets 라우트
- [x] Worker: CLI OAuth 플로우 (로컬 :3602 → 브라우저 → 토큰)
- [x] Worker: `/manual.md`, `/llms.txt` AI 통합 엔드포인트
- [x] Types: Document에 `accessLevel`, `freeSections`, `price` 필드 (모네타이제이션 타입 기반)
- [x] Types: MainNavItem + SidebarConfig (폴더 경로 → 사이드바 매핑)
- [x] Auth: Better Auth (GitHub, Google OAuth) + 멤버 역할 (owner/admin/editor/viewer)

### 아직 없는 것 (개선 대상)

**CLI/Scanner:**
- [ ] `mdshare.config.ts` 로딩 지원 (현재 `mdshare.json`만 지원)
- [ ] config에 `type` 필드 추가 (`hierarchical` | `sequential` | `blog`)
- [ ] `init`에 인터랙티브 프로젝트 타입 선택 (현재 기본 hierarchical만 스캐폴딩)
- [ ] `publish --watch` (파일 변경 시 자동 업데이트)
- [ ] `publish --ci` (non-interactive, 토큰 환경변수 기반)

**Viewer:**
- [ ] `ChapterNav` — 순서형 콘텐츠용 이전/다음 + 진행률 바
- [ ] `PayWall` — 유료 섹션 잠금 UI (freeSections 이후 잠금)
- [ ] `MediaEmbed` — YouTube/오디오 임베드 컴포넌트
- [ ] 프로젝트 타입별 레이아웃 분기 (docs vs book vs blog)
- [ ] 테마 프리셋 확장 (현재 blue만, green/purple/red 실제 구현)

**Worker/API:**
- [ ] 검색 개선 (현재 D1 LIKE → full-text search 또는 KV 인덱스)
- [ ] 모네타이제이션 실체 구현 (Stripe/Paddle webhook → workspace plan)
- [ ] 커스텀 도메인 라우팅
- [ ] 문서 버전 관리 (v1, v2 분리)

**Examples:**
- [ ] `examples/` 디렉토리에 3가지 패턴 예제 생성 (minimal, tutorial-book, api-docs)
- [ ] ai-docs로 계층형 네비게이션 통합 테스트
- [ ] slow-church로 순서형 네비게이션 통합 테스트
- [ ] CI/CD 가이드 문서 (GitHub Actions 예시)
