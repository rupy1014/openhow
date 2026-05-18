# Plan — platform-admin-workspace-exposure (iter 3)

## Goal

관리자 SPA 자체를 **"한 페이지 superadmin"** → **"sidebar + header 가 있는 admin app"** 으로 재작성. 동시에 "메인에 무엇을 노출할지" 의 두 번째 축인 **아티클 큐레이션** surface 를 1급으로 추가. opencourt admin (`apps/admin/src/components/admin/AdminShell.tsx`) 의 layout 패턴을 시각·구조 레퍼런스로 차용.

## Architecture Decision

- **Shell pattern**: opencourt 의 `<aside class="admin-sidebar">` (브랜드 + 그룹 nav) + `<div class="admin-frame">` (header + main + toast) 구조 차용. DS 의 `PageShell` 은 단일 페이지 max-width 컨테이너 — admin shell 에는 부적합. layout 은 자체 CSS (opencourt 패턴), 내부 콘텐츠만 DS 컴포넌트.
- **Admin home**: `/superadmin` 진입 시 `SuperadminHome` (요약 카드 3장 + 최근 큐레이션 활동) 표시. 기존 default redirect (`/superadmin/workspaces`) 제거.
- **Article curation 인프라**: `featuredContent` 테이블 이미 존재 (section enum `editor_pick | trending`, sortOrder, curatedBy). 신규 컬럼 없이 worker 라우터/admin UI 만 추가.
- **거절**: 기존 `SuperadminLayout.tsx` (top-nav-only) 의 점진 개선. opencourt 패턴은 사이드바·헤더 분리가 핵심이므로 layout 자체를 재작성하는 게 결과적으로 더 작음.
- **거절**: 메인페이지 (`/`) 의 featured-articles 렌더 변경. 본 iter 는 admin surface + API 까지만. 메인페이지 렌더는 `public-home-creator-saas-pivot` 의도 책임.

- **Admin route decision**:
  - Resources: `workspaces` (iter 2 완료), **`articles`** (신규 — featured_content CRUD), `topics` (iter 1 완료).
  - Routes: `/superadmin` (home), `/superadmin/workspaces` (iter 2 그대로), `/superadmin/articles` (신규 — list + add + reorder + remove), `/superadmin/topics` (기존).
  - Modal use: 아티클 추가는 modal — document 검색 → 선택 → section 지정. modal gate 통과 (작고 컨텍스트 의존). 그 외 (sortOrder 변경, 제거) 는 인라인.

## Files to Modify

### New

- `core/packages/worker/src/routes/superadmin-articles.ts` — featured_content CRUD (list / add / remove / patch sortOrder|section)
- `core/packages/admin/src/pages/superadmin/SuperadminHome.tsx` — 관리자 홈 (요약 카드 + 최근 활동)
- `core/packages/admin/src/pages/superadmin/SuperadminHome.css`
- `core/packages/admin/src/pages/superadmin/ArticleCuration.tsx` — featured_content 관리 UI (editor_pick + trending 탭, list, add modal, reorder, remove)
- `core/packages/admin/src/pages/superadmin/ArticleCuration.css`

### Existing

- `core/packages/worker/src/index.ts` — 신규 라우터 mount (`app.route('/api/superadmin', superadminArticles)` — 기존 superadmin 과 같은 prefix)
- `core/packages/worker/src/routes/public-feed.ts` — `GET /feed/featured-articles` 신규 핸들러 (메인페이지 소비용)
- `core/packages/admin/src/layouts/SuperadminLayout.tsx` — sidebar + header 구조 재작성. 그룹 nav: "콘텐츠"(워크스페이스 / 아티클 / 토픽). 헤더에 active 페이지 타이틀 + 로그아웃·홈 액션.
- `core/packages/admin/src/layouts/SuperadminLayout.css` — sidebar/header/main 분리 layout
- `core/packages/admin/src/router.tsx` — `/superadmin` index 추가 + `/superadmin/articles` 추가

### Tests

테스트 없음 — admin 은 dev 도구. 검증은 로컬 수동 (worker + admin dev 띄우고 시나리오 확인).

## Estimated Scope

~600-750 LOC, 11 files (5 new + 6 modified), 5 Codex steps.

## Step Breakdown

1. **Step 1 — Worker 라우터**: `superadmin-articles.ts` 신규 (`GET /superadmin/articles?section=&search=`, `POST /superadmin/articles`, `DELETE /superadmin/articles/:id`, `PATCH /superadmin/articles/:id` for sortOrder/section). `public-feed.ts` 에 `/feed/featured-articles` 추가. `index.ts` 에 mount.
2. **Step 2 — SuperadminLayout 재작성**: opencourt AdminShell 패턴 차용. sidebar 그룹 nav (콘텐츠 그룹) + 헤더 (active 페이지 타이틀 + 로그아웃). 기존 RequireSuperadmin 가드 보존.
3. **Step 3 — SuperadminHome 페이지**: 요약 카드 3장 (featured 워크스페이스 N개 / editor_pick N개 / trending N개) + 최근 5개 큐레이션 활동 리스트. DS `Card`, `Badge`, `Stack`, `Text` 사용. 데이터 fetch: 기존 `/api/superadmin/workspaces?exposure=featured`, 신규 `/api/superadmin/articles?section=editor_pick`, `?section=trending`.
4. **Step 4 — ArticleCuration 페이지**: 두 섹션 탭 (editor_pick / trending). 각 탭에 list (sortOrder 정렬, 위/아래 화살표 액션 — sortOrder swap PATCH). "추가" 버튼 → modal 에서 document 검색 (slug + title) → 선택 + section 확정 → POST. 행에 "제거" 액션 (DELETE).
5. **Step 5 — Router + Smoke**: `/superadmin` index → SuperadminHome, `/superadmin/articles` → ArticleCuration. router.tsx 에 두 라우트 추가. typecheck + 로컬 manual smoke 시나리오 정리.

## Prerequisites

- iter 2 가 implementation-done (DS deps installed, data-theme=toss applied). 확인 완료.
- `featuredContent` 테이블 schema 존재. 확인 완료 (`schema.ts:872`).
- `document` 테이블 존재 (search 용). iter 1 이전부터 존재.

## Reference

- 같은 의도 prior iter: `learnings-iter-1.md`, `learnings-iter-2.md` (둘 다 frozen)
- 관련 의도: `public-home-creator-saas-pivot` (메인 페이지가 본 iter 의 `/api/public/feed/featured-articles` 를 소비)
- Layout 레퍼런스: `/Users/taesupyoon/sideProjects/opencourt/apps/admin/src/components/admin/AdminShell.tsx`
- DS 인벤토리: `/Users/taesupyoon/sideProjects/max-designsystem/core/react/src/components`
