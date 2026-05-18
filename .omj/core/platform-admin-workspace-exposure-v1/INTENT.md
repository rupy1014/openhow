---
status: done
created: 2026-05-06
updated: 2026-05-15
iteration: 3
---

# Platform Admin — Workspace Exposure & Curation (iter 3)

> iter 1 (DB enum + auth + 기본 토글 UI + public surface 게이트) → `learnings-iter-1.md` frozen.
> iter 2 (DS 도입 + 큐레이션 메타 + workspace featured 보드 + viewer 진입점 정리) → `learnings-iter-2.md` frozen.
> iter 3 는 **관리자 SPA 자체** 를 sidebar + header 구조로 재작성하고, "메인 노출 결정" 의 두 번째 축인 **아티클 큐레이션** 을 1급으로 추가한다.

## Why

iter 1 은 운영자가 "어떤 워크스페이스가 보일지" 를 **토글** 할 수 있게 했다. iter 2 는 **"무엇을 왜 어떤 순서로 메인에 띄울지"** 를 결정 가능하게 한다.

두 축에서 문제가 동시에 드러났다:

1. **큐레이션 결여**: `featured` 토글만 있고 *왜 featured 인지* / *어떤 순서로 보여줄지* 데이터가 없음. 메인 페이지가 hydrate 되어도 운영자는 단순 ON/OFF 외에 손쓸 게 없다. 롱블랙식 "오늘의 추천 + 회전" 이 v1 에선 불가능.
2. **디자인 시스템 부재**: admin SPA 가 ad-hoc CSS 로 짜여 있어 검색/필터/테이블/세그먼트 컨트롤이 일관성 없음. 큐레이션 UX (메모·정렬·노출 결정) 를 새로 짜려면 컴포넌트 인프라가 먼저 필요하다.

**positioning 호환**: 본 iter 도 운영자 안전 토글 + 운영자 명시 큐레이션. 디스커버리 알고리즘이 아님. project_openhow_positioning lock 그대로.

## What

### A. 디자인 시스템 (`@openhow/ds`) 도입

- [validated] **(iter2) admin 패키지에 `@openhow/ds` + `@openhow/ds-tokens` workspace 의존성 추가** — `/Users/taesupyoon/sideProjects/max-designsystem` 의 `core/react`(`@openhow/ds`, 94 컴포넌트) + `core/tokens`(`@openhow/ds-tokens`). 두 레포가 같은 npm scope 를 쓰므로 workspace 가 아닌 file:/local link 또는 build-and-publish 경로 결정 필요 (Phase 0 의사결정 항목).
  - 결정 기준: openhow monorepo 의 `pnpm-workspace.yaml` 에 max-designsystem 경로를 추가 (path link) vs 별도 `pnpm pack` 산출물 vendor. 빠른 길은 path link, 안정한 길은 vendored tarball. → 빌드 단계 첫 commit 에서 결정.
  - 테마: `data-theme="toss"` (DS 기본). admin 전역 wrapper 에 적용. → **metric: admin/superadmin 페이지에 DS token 변수(`--color-*`, `--space-*`) hydrate 확인 + DataTable 1개 렌더 성공**

- [validated] **(iter2) `/superadmin/workspaces` 재작성 — DS 컴포넌트로** — 기존 ad-hoc 테이블/세그먼트/검색 박스를 다음 컴포넌트로 교체:
  - `PageShell` + `PageHeader` (상단 타이틀·운영자 컨텍스트)
  - `FilterBar` + `SearchField` + `Chip` (type/exposure 필터)
  - `DataTable` (워크스페이스 행 — slug · name · owner · type · 게시글 수 · exposure · 액션)
  - `SegmentedControl` (`[숨김] [등재] [추천]` — iter 1 의 ad-hoc 3-button 대체)
  - `Badge` / `CountBadge` (exposure 현재 상태 + 게시글 수)
  - `Pagination` (iter 1 의 cursor pagination 유지하되 UI 만 교체)
  - `EmptyState` / `Skeleton` (로딩·빈 결과)
  - 토글 동작 (optimistic update + rollback, 300ms debounce) 은 iter 1 그대로 유지 — UI 만 교체. → **metric: 50건 페이지 fetch + exposure 토글 1건이 iter 1 과 동일하게 동작, 시각적으로는 DS 토큰 기반**

### B. 큐레이션 메타 + 노출 결정 UX

- [validated] **(iter2) DB schema 확장** — `workspace` 테이블에 두 컬럼:
  - `featuredNote TEXT` (운영자 메모 — 왜 이걸 추천하는지. nullable, max 200자)
  - `featuredAt INTEGER` (epoch ms — featured 로 올린 시각. nullable. NULL 이면 정렬 후순위)
  - 마이그레이션: `0072_add_workspace_featured_meta.sql` — 두 컬럼 모두 nullable, 기존 데이터 영향 없음. (0061~0071 은 다른 의도들이 이미 점유)
  - 의미: featured 토글 시 `featuredAt = now()` 자동 기록 (서버), `featuredNote` 는 운영자 입력. featured→listed/hidden 으로 내릴 때 두 값 NULL 로 reset (다음 featured 진입 시 새 타임스탬프). → **metric: 마이그레이션 후 기존 워크스페이스 전부 두 컬럼 NULL, featured 토글 시 자동 채움**

- [validated] **(iter2) `/superadmin/workspaces` 추가 surface — 큐레이션 입력 UI**:
  - DataTable 행에서 exposure = `featured` 인 워크스페이스만 `featuredNote` 인라인 편집 (또는 `Dialog` 모달) 활성화
  - 메모 입력 → PATCH `/api/superadmin/workspaces/:id/featured-meta` → 즉시 반영
  - exposure 가 `featured` 가 아닌 경우 메모 입력 UI 비활성 (회색 처리 + 안내)
  - → **metric: featured 워크스페이스에 메모 저장 → DB 반영 + 메인 페이지 `/api/feed/featured` 응답에 `featuredNote` 포함**

- [validated] **(iter2) 메인 노출 결정 surface — "오늘의 추천" 보드** — `/superadmin/workspaces` 내 별도 tab 또는 상단 카드:
  - 현재 `featured` 워크스페이스 N개를 `featuredAt DESC` 정렬로 보여줌 (가장 최근에 띄운 것이 위)
  - 각 카드에 `featuredNote` preview + slug + 게시글 수 + "내리기" 버튼
  - 메인 페이지가 hydrate 할 때 이 정렬·메모를 그대로 소비 (`/api/feed/featured` 응답에 `featuredAt`, `featuredNote` 노출)
  - → **metric: 메인 페이지 Showcase carousel 이 `featuredAt DESC` 순으로 정렬되고 각 카드에 운영자 메모 노출**

### C. 진입점 정리

- [validated] **(iter2) viewer 측 "플랫폼 관리" 링크 정리** — viewer SPA 의 햄버거 메뉴에 남아있는 `/superadmin/workspaces` 링크는 viewer SPA catchall 이 잡아서 404. 두 가지 옵션:
  - (a) viewer 헤더에서 해당 링크 자체 제거 (admin 은 dev-admin 스크립트로만 진입)
  - (b) 링크 클릭 시 `window.location.href = 'http://localhost:5172/superadmin/workspaces'` (로컬 only)
  - → 빌드 단계에서 결정. 기본 권고: (a) — admin 이 로컬 전용이므로 viewer UI 에 노출할 이유 없음. project_admin_local_only 정합.

### Backlog (iter 3+ 후보)

- (v3) **audit log** — 누가/언제/어떤 워크스페이스를 어떤 단계로 변경했는지 + featuredNote diff. 운영자 다수일 때 필요.
- (v3) **user.role 컬럼 + 마이그레이션** — env allowlist 한계 도달 시.
- (v3) **자동 노출 후보 큐** — 신규 워크스페이스가 일정 기준 충족 시 (발행글 ≥ 5, 결제 1건) "노출 후보" 로 자동 분류.
- (v3) **메인 노출 순서 명시 드래그** — `featuredAt DESC` 자동 정렬 외에 운영자가 수동으로 순서 픽스. 현재는 자동 정렬만.

**확신도 태그**: A/B/C 전부 `[validated]` — 사용자 "디자인 + 큐레이션 UX" 선택. 빌드 진입 가능. 의사결정 항목 (workspace link 방식, viewer 링크 정리 옵션) 은 빌드 단계 첫 commit 에서 결정.

## Not

- 사용자 대상 워크스페이스 디스커버리 페이지 (`/explore`, `/topics/...`) — positioning lock 위반. iter 1 그대로.
- 워크스페이스 ranking/추천 알고리즘 — `featuredAt DESC` 만. 머신러닝 추천 X.
- 자동 모더레이션 — 범위 밖. 운영자 수동 판단.
- **DS 컴포넌트 자체 수정/추가 금지** — `@openhow/ds` 에 없는 컴포넌트가 필요하면 ad-hoc 으로 짜되, max-designsystem 레포 자체는 본 iter 에서 건드리지 않는다. DS 변경은 별도 의도.
- **메인 페이지 (`/`) 변경 사항 본 iter 에 포함 안 함** — `/api/feed/featured` 응답에 메타 추가까지만. 메인 페이지의 Showcase carousel 이 그 메타를 어떻게 렌더할지는 `public-home-creator-saas-pivot` 의도 책임.
- **storyboard 우회 (iter 1 결정 유지)** — UI 는 코드에서 즉흥. DS 컴포넌트 도입으로 위험 감소 (DS 가 일관성 보장).

## Context

**현재 admin 인프라**:
- `core/packages/admin` (`@openhow/admin`) — 로컬 전용 SPA, port 5172. 배포 안 됨.
- `/superadmin/workspaces` 페이지: iter 1 결과물. ad-hoc CSS, 3-button segmented control.
- `RequireSuperadmin` 가드 + `SuperadminLayout` (좌측 sidebar).
- 로컬 인증: `/api/dev/login` (`DEV_LOGIN_EMAIL` env, localhost-only).

**max-designsystem**:
- 경로: `/Users/taesupyoon/sideProjects/max-designsystem`
- 패키지: `@openhow/ds` (94 컴포넌트, React 19) + `@openhow/ds-tokens` (CSS variables + native tokens).
- 테마: `data-theme="toss"` (기본), `order-demo`/`29cm-shopping` 등 변종 존재 — admin 은 `toss` 사용.
- 빌드 산출물: `dist/index.mjs` + `dist/styles.css` + `dist/tokens.css`.
- **주의**: 동일 npm scope `@openhow`. openhow monorepo 의 `@openhow/types`/`@openhow/cli` 와 충돌 가능성 — workspace link 시 이름 충돌 검토 필요.

**의존 의도**:
- `public-home-creator-saas-pivot` — 메인 페이지가 `/api/feed/featured` 를 hydrate. 본 iter 가 `featuredNote`/`featuredAt` 를 응답에 노출하면 메인 페이지가 운영자 큐레이션을 그대로 활용 가능.
- iter 1 의 모든 v1 산출물은 그대로 살아있음 (`platformExposure` enum, `requireSuperadmin` 미들웨어, `/api/feed` 게이트, sitemap 게이트).

**positioning 게이트** (project_openhow_positioning):
- `featuredNote` + 정렬은 **운영자 명시 큐레이션** 이지 알고리즘이 아니다 — 롱블랙식 "오늘의 추천" 회전과 정합.
- 가입자 1급 시민 레이어와 무관 (운영자 surface).

## Footprint

### iter 1 (frozen — see `learnings-iter-1.md`)

- `core/packages/worker/src/db/schema.ts` — `workspace.platformExposure` enum
- `core/packages/worker/migrations/0060_add_workspace_platform_exposure.sql`
- `core/packages/worker/src/middleware/auth.ts` — `requireSuperadmin`
- `core/packages/worker/src/routes/superadmin.ts` — `GET /workspaces`, `PATCH /workspaces/:id/exposure`
- `core/packages/worker/src/index.ts` — `/api/superadmin` mount, `/api/me`.isSuperadmin, sitemap 게이트
- `core/packages/worker/src/routes/public-feed.ts` — `publicWorkspaceFilter`
- `core/packages/admin/src/...` (구 viewer/src/superadmin 에서 이전 완료) — `SuperadminLayout`, `WorkspaceExposure`, `RequireSuperadmin`, `LoginRedirect`, `initSession`

### iter 2 (planned)

**Worker (backend)**:
- `core/packages/worker/src/db/schema.ts` — `workspace.featuredNote TEXT`, `workspace.featuredAt INTEGER` 추가
- `core/packages/worker/migrations/0072_add_workspace_featured_meta.sql`
- `core/packages/worker/src/routes/superadmin.ts` — `PATCH /workspaces/:id/featured-meta` 신규 + 기존 exposure PATCH 가 `featured` 진입/이탈 시 `featuredAt` auto-set/clear
- `core/packages/worker/src/routes/public-feed.ts` — `/api/feed/featured` 응답에 `featuredNote`, `featuredAt` 노출 + `ORDER BY featuredAt DESC`

**Admin (frontend)**:
- `core/packages/admin/package.json` — `@openhow/ds`, `@openhow/ds-tokens` 의존성 추가 (workspace link or vendored)
- `core/packages/admin/src/main.tsx` — DS styles.css + tokens.css import + `data-theme="toss"` 루트 attribute
- `core/packages/admin/src/pages/superadmin/WorkspaceExposure.tsx` — DS 컴포넌트로 재작성
- `core/packages/admin/src/pages/superadmin/FeaturedBoard.tsx` (신규) — 또는 같은 페이지 내 별도 섹션
- `core/packages/admin/src/layouts/SuperadminLayout.tsx` — DS `PageShell` 적용 검토

**Viewer (frontend)**:
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — "플랫폼 관리" 링크 제거 (옵션 a) 또는 외부 URL 로 변경 (옵션 b)

**모노레포 설정**:
- `pnpm-workspace.yaml` 또는 별도 vendoring — DS 패키지 경로 등록

### iter 3 (implementation done — 2026-05-15)

**Worker (article curation)**:
- `core/packages/worker/src/routes/superadmin-articles.ts` (new, 268 lines) — list/candidates/create/delete/patch under `/api/superadmin/articles*`, `feat_${randomUUID-hex}` id, `requireSuperadmin`
- `core/packages/worker/src/routes/public-feed.ts` (+69) — `GET /feed/featured-articles` with `withTopicTags` + sortOrder asc
- `core/packages/worker/src/index.ts` (+4) — mount + CORS origin 5174→5172 (admin port)

**Admin SPA shell rewrite (opencourt pattern)**:
- `core/packages/admin/src/layouts/SuperadminLayout.tsx` (36→87) — `<aside .superadmin-sidebar>` + `<div .superadmin-frame>` with sticky header, NavLink groups (홈 / 콘텐츠), `getActiveTitle`
- `core/packages/admin/src/layouts/SuperadminLayout.css` — grid 240px/1fr desktop, single-column under 1024px

**Admin pages**:
- `core/packages/admin/src/pages/superadmin/SuperadminHome.tsx/.css` (new, 220+43) — 3 summary cards (workspaces / editor_pick / trending) + recent 5 curation activities, `Promise.all` fetch + AbortController
- `core/packages/admin/src/pages/superadmin/ArticleCuration.tsx/.css` (new, 328+78) — SegmentedControl tabs, IconButton chevron swap (optimistic + rollback), Modal candidate picker with 300ms debounced SearchField, `window.confirm` delete

**Router wiring**:
- `core/packages/admin/src/router.tsx` — lazy `SuperadminHome` + `SuperadminArticleCuration`, `/superadmin` index → home (not workspaces), `/superadmin/articles` route, `LoginRedirect` default → `/superadmin`

## Learnings

iter 1 의 history 는 [[learnings-iter-1]] 에 frozen. iter 2 learnings 만 아래 누적.

### 2026-05-15: iter 2 seed — DS 도입 + 큐레이션 UX 두 축
- **사용자 발화**: "관리자 페이지를 개선해보자. 디자인 시스템이 엉망인데 ? /Users/taesupyoon/sideProjects/max-designsystem 여길 참조해서 하고, 핵심은 메인페이지에 어떤 콘텐츠를 노출시킬건가 이거든. 그걸 잘 구현해야해"
- **분석**: iter 1 risk 였던 "토글 UX 마음에 안 들면 재작업" 이 실현. 동시에 Backlog 에 둔 `featuredNote`/`featuredAt` 가 사용자 핵심 관심사로 부상 → "메인페이지 노출 컨텐츠 결정" = 운영자 큐레이션 UX 가 의도의 본질.
- **DS 인벤토리**: `@openhow/ds` (94 컴포넌트, React 19), `@openhow/ds-tokens` (CSS vars). 후보 핵심 컴포넌트: `DataTable`, `SegmentedControl`, `FilterBar`, `SearchField`, `Badge`, `Pagination`, `EmptyState`, `Skeleton`, `PageShell`, `PageHeader`. 충분 — ad-hoc 부분 거의 없음.
- **사용자 의도 선택**: "디자인 + 큐레이션 UX (Recommended)" — DS 는 큐레이션 UX 의 품질을 위한 수단.
- **What 구조**: A(DS 도입) → B(큐레이션 메타 + UI) → C(viewer 진입점 정리). A 가 선결, B 가 본질, C 가 cleanup.
- **다음 단계**: 사용자 검토 후 `/omj:build platform-admin-workspace-exposure-v1` 자동 진입.

### 2026-05-15: iter 3 pivot — admin 자체 + article 큐레이션 1급
- **사용자 발화**: "현재 워크스페이스를 노출하는것도 좋지만, 메인에 아티클을 노출하는것도 중요하자나. 관리 기능 홈이 어디일까? 관리자 자체를 그냥 만들라니까. 좌측 메뉴, header 상단 구조로 해서 /Users/taesupyoon/sideProjects/opencourt/apps/admin 참고하고"
- **분석**: iter 2 가 워크스페이스 큐레이션 축은 닫았지만, 사용자가 곧바로 두 번째 축 — 개별 아티클 — 을 1급으로 요청. 동시에 admin SPA 자체에 "홈" 이 없고 페이지 단건씩 떠있는 상태가 문제로 드러남. opencourt admin 의 sidebar + sticky header 패턴이 reference.

### 2026-05-15: iter 3 implementation done — admin shell + home + article curation
- **사용자 선택**: "한 번에 다 (Recommended)" — admin shell + home + article 큐레이션을 한 iter 에서 다 진행.
- **결정**: 기존 `featuredContent` 테이블 (`section: 'editor_pick' | 'trending'`, `sortOrder`, `curatedBy`) 을 재사용 — 새 마이그레이션 없음. ID format `feat_${randomUUID-hex}`. 신규 컬럼 0개.
- **DS 사용 검증 (vendored tarball)**: `Modal`, `SegmentedControl`, `SearchField`, `IconButton` (with `Icon` name `chevron-up`/`chevron-down`), `PageShell`/`PageShellBody`/`PageShellMain`, `PageHeader`, `SectionHeader`, `Card` (numeric padding props), `Badge` (`color="blue|gray"` `variant="weak"`), `EmptyState`, `Skeleton` (`variant="rectangular"`), `HStack`/`VStack`/`Text` (numeric `gap`, `variant="body2|caption|title1"`, `color="secondary"`) — 전부 vendored tarball 에 존재. ad-hoc 없음.
- **shell pattern**: opencourt `<aside .superadmin-sidebar>` + `<div .superadmin-frame>` 그대로 채택. NavLink 두 그룹 (홈 / 콘텐츠), sticky header 에 페이지 타이틀 + 로그아웃. 240px/1fr grid → 1024px 미만 단일 컬럼 + 가로 스크롤 nav.
- **optimistic reorder pattern**: `applySwap(index, direction)` 가 두 행의 sortOrder 를 메모리에서 swap → `Promise.all([patch(current, targetSortOrder), patch(target, currentSortOrder)])` → 실패 시 rollback. iter 1 의 exposure 토글 패턴 재사용.
- **drive-by accepted**: Codex 가 worker CORS origin 을 `5174→5172` 변경. admin 이 :5172 에서 동작 (`vite.config.ts`) 하므로 cross-origin fetch 가 동작하려면 필요한 변경 — 의도 외 수정이지만 functionally required.
- **smoke**: `tsc --noEmit` worker/admin 모두 exit=0. `curl 'http://localhost:7877/api/superadmin/articles?section=editor_pick'` → 401 (guard works). `curl 'http://localhost:7877/api/public/feed/featured-articles?section=trending'` → `{"articles":[]}` 200.
- **status**: `building → done`. Backlog 의 "메인 노출 순서 명시 드래그" 는 iter 3 의 sortOrder ± swap 으로 부분 충족 — full drag-and-drop 은 v4 후보로 유지.
- **다음 단계**: 사용자 UI smoke (superadmin 로그인 후 `/superadmin` 진입 → 카드 + 활동 + 큐레이션 보드 시각 확인). 그 다음 같은 Why 의 신호 들어오면 iter++ 재진입.
