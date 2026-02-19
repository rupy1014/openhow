# mdshare — Architecture & Roadmap (Internal)

> 내부 개발 문서. 코어 아키텍처, 로드맵, 구현 현황 기록.
> 사용자 문서는 `docs/` 폴더 참조.

---

## 1. 코어 아키텍처 — 4가지 성격의 복합 프로젝트

mdshare는 단일 SDK가 아니라, 하나의 모노레포에 4가지 성격이 공존한다.

| 성격 | 패키지 | 핵심 파일 | 역할 |
|------|--------|----------|------|
| **CLI 도구** | `@max5/cli` | `cli.ts`, `scanner/`, `commands/` | 로컬 뷰어 + 클라우드 퍼블리시 |
| **웹 뷰어** | `@max5/viewer` | `views/`, `components/`, `stores/` | 문서 열람 SPA |
| **API 서버** | `@max5/worker` | `routes/`, `db/`, `middleware/` | 인증, CRUD, 검색, 에셋 |
| **AI 통합** | worker 내장 | `/manual.md`, `/llms.txt` | LLM 온보딩 + 모네타이제이션 가이드 |

### CLI 내부 동작

```
mdshare serve [path]
  1. loadConfig()         mdshare.json > .mdsharerc.json > ~/.mdshare/config.json
  2. scanProject()        globby → gray-matter → _meta.json → MainNav + Sidebar 자동 생성
  3. createServer()       Vite dev server + window.__PROJECT_DATA__ 주입
  4. open(:3600)

mdshare publish [path]
  1. getValidToken()      ~/.mdshare/tokens.json → 만료 체크
  2. scanProject()        위와 동일
  3. resolveWorkspace()   slug 매칭 or 자동 생성
  4. for page:
     - contentHash 비교 → 변경분만 처리
     - rewriteContentWithAssets() → 상대경로 이미지를 /api/assets/... 로 리라이트
     - POST/PUT /api/documents + POST /api/assets (base64)
```

### Viewer 두 가지 모드

- **로컬 모드** (`mdshare serve`): `window.__PROJECT_DATA__`에서 직접 로드. API 호출 없음.
- **클라우드 모드** (배포 후): Worker API 페치. Better Auth 세션 인증.

### Worker 특수 엔드포인트

- `GET /manual.md` — 마크다운 셋업 가이드 (사람/AI 공용)
- `GET /llms.txt` — LLM 지시문: 셋업 순서, 가격 사다리(free/pro/team/enterprise), 결제 통합 플로우, 30/60/90일 체크리스트

---

## 2. Example 프로젝트 분석

`examples/` 디렉토리에 submodule로 연결된 3개 프로젝트. 각각 다른 도메인과 콘텐츠 구조를 가지며, 이들의 공통 니즈가 코어 기능 설계를 이끈다.

### ai-docs — 기업 개발자 매뉴얼

| 항목 | 내용 |
|------|------|
| submodule | `examples/ai-docs` |
| 원본 빌드 | VitePress |
| 콘텐츠 경로 | `content/{guide,payment,order,billing,subscription,...}/*.md` |

**특징:** 체계적 디렉토리 분류, API 레퍼런스 + 통합 가이드, `llms-full.txt` 빌드 스크립트, 코드 예시 중심.

**코어에 요구하는 것:**
- 다단계 사이드바/네비게이션
- 검색 (API endpoint, 파라미터)
- 코드 하이라이팅 (다중 언어)
- 버전 관리 (v2, v3 분리)

### ai-jobdori — 바이브코딩 강의

| 항목 | 내용 |
|------|------|
| submodule | `examples/ai-jobdori` |
| 원본 빌드 | Astro (블로그) + Remotion (영상) |
| 콘텐츠 경로 | `contents/vibe-coding-book/{00~19-*.md}`, `blog/`, `contents/youtube/` |

**특징:** 순서형 챕터(00~19), 블로그 + 전자책 + 유튜브 스크립트 혼재, RSS 자동화 파이프라인.

**코어에 요구하는 것:**
- 순서형 네비게이션 (이전/다음 챕터)
- 멀티 콘텐츠 타입 (book, blog, video script)
- 과금 모델 (유료 챕터 잠금)
- 미디어 에셋 관리

### slow-church — 교회 설교

| 항목 | 내용 |
|------|------|
| submodule | `examples/slow-church` |
| 원본 빌드 | Remotion (영상) |
| 콘텐츠 경로 | `sermons/{001~017-*.md}` |

**특징:** 단일 디렉토리 번호 기반, 마크다운 → TTS → 립싱크 → 영상 파이프라인, `references.yaml` 성경 구절 관리.

**코어에 요구하는 것:**
- 심플한 리스트형 네비게이션
- 커스텀 메타데이터 (날짜, 성경 구절, 시리즈)
- 공개/비공개 설정 (draft)
- 외부 미디어 임베드 (YouTube)

---

## 3. 콘텐츠 구조 패턴

세 프로젝트에서 3가지 패턴이 추출된다. 코어의 config와 scanner가 이를 모두 수용해야 한다.

| 패턴 | 구조 | 대표 Example | 네비게이션 |
|------|------|-------------|-----------|
| **계층형** | `topic/subtopic/*.md` | ai-docs | 다단계 사이드바 |
| **순서형** | `01-제목.md`, `02-제목.md` | vibe-coding-book, sermons | 이전/다음 + 진행률 |
| **블로그형** | 날짜 기반 + 카테고리 태그 | ai-jobdori blog | 최신순 리스트 + 태그 필터 |

**목표 config 스펙:**

```ts
// mdshare.config.ts (향후)
export default {
  title: "My Docs",
  content: "./docs",
  type: "hierarchical",       // "hierarchical" | "sequential" | "blog"
  theme: { preset: "blue" },
  monetization: {
    freeSections: 3,
    price: 5000,
  },
}
```

**각 example에 적용하면:**

```ts
// ai-docs
{ title: "Bootpay Developers", content: "./content", type: "hierarchical" }

// ai-jobdori (book)
{ title: "바이브코딩 완전정복", content: "./contents/vibe-coding-book", type: "sequential", monetization: { freeSections: 5, price: 9900 } }

// slow-church
{ title: "느린교회", content: "./sermons", type: "sequential", theme: { preset: "green" } }
```

---

## 4. 개선 로드맵

### Phase 1: 콘텐츠 어댑터 (단기)

현재 scanner는 계층형만 잘 지원한다. 순서형/블로그형을 수용하려면:

1. `mdshare.config.ts` 로딩 지원 (현재 `.json`만)
2. config에 `type` 필드 추가
3. `init`에 인터랙티브 타입 선택
4. scanner에 순서형 패턴 지원 (숫자 접두사는 이미 파싱하지만, ChapterNav 데이터 생성이 없음)

### Phase 2: Viewer 컴포넌트 (단기~중기)

| 컴포넌트 | 용도 | 관련 Example |
|----------|------|-------------|
| `ChapterNav` | 이전/다음 + 진행률 바 | ai-jobdori |
| `PayWall` | 유료 섹션 잠금 UI | ai-jobdori |
| `MediaEmbed` | YouTube/오디오 임베드 | slow-church |
| 타입별 레이아웃 분기 | docs / book / blog | 전체 |
| 테마 프리셋 확장 | green/purple/red 구현 | slow-church |

### Phase 3: 퍼블리싱 자동화 (중기)

- `publish --watch` (파일 변경 → 자동 업데이트)
- `publish --ci` (non-interactive, `MDSHARE_TOKEN` 환경변수)
- GitHub Actions 템플릿

### Phase 4: 플랫폼 확장 (장기)

- 검색 개선 (D1 LIKE → full-text search)
- 모네타이제이션 실체 (Stripe/Paddle webhook → workspace plan)
- 커스텀 도메인 + 화이트라벨링
- 문서 버전 관리

---

## 5. 현재 구현 상태

### 완료

- [x] CLI 8개 명령어 (serve, publish, init, config, login, logout, whoami, status)
- [x] Scanner: globby + gray-matter + `_meta.json` 기반 2패널 네비게이션 생성
- [x] Scanner: 숫자 접두사 (`01-`, `02-`) 자동 정렬
- [x] Publish: contentHash 비교 → 변경분만 업로드
- [x] Publish: 상대경로 이미지/에셋 → R2 URL 리라이트 + base64 업로드
- [x] Viewer: 7개 View (Home, Dashboard, DocPage, Search, WorkspaceDocs, Settings, Login)
- [x] Viewer: MainNav + Navigation(사이드바) + TableOfContents
- [x] Viewer: marked + DOMPurify + Shiki 코드 하이라이팅
- [x] Worker: 5개 라우트 (documents, workspaces, search, members, assets)
- [x] Worker: CLI OAuth + `/manual.md` + `/llms.txt`
- [x] Types: Document에 accessLevel, freeSections, price 필드
- [x] Auth: Better Auth (GitHub, Google) + 멤버 역할 4단계
- [x] 메타 레포: core + 3 examples submodule 구성

### 미구현

- [ ] `mdshare.config.ts` 로딩 (현재 `.json`만)
- [ ] config `type` 필드 + 순서형/블로그형 지원
- [ ] `init` 인터랙티브 타입 선택
- [ ] `publish --watch`, `publish --ci`
- [ ] Viewer: ChapterNav, PayWall, MediaEmbed
- [ ] Viewer: 타입별 레이아웃 분기, 테마 프리셋 확장
- [ ] Worker: full-text search, 모네타이제이션 실체, 커스텀 도메인, 버전 관리
