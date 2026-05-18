# Plan — platform-admin-workspace-exposure (iter 2)

## Goal

운영자가 메인페이지에 어떤 워크스페이스를 어떤 순서·이유로 띄울지 결정하는 큐레이션 UX를, `@openhow/ds` 컴포넌트로 짠 `/superadmin/workspaces` 위에 구축한다.

## Architecture Decision

- **선택**: `@openhow/ds` link 방식 = **file: protocol** — admin/package.json 에서 `"@openhow/ds": "file:../../../../max-designsystem/core/react"`, `"@openhow/ds-tokens": "file:../../../../max-designsystem/core/tokens"`. admin 이 local-only 라 reproducibility 비용보다 즉시성·단순성이 우선.
- **거절**: pnpm-workspace.yaml 확장 — `core/pnpm-workspace.yaml` 이 `packages/*` 만 가리키고 max-designsystem 은 별도 repo. workspace 합치려면 양쪽 pnpm-lock 통합 + monorepo 재구성 필요. 비용 대비 효용 X.
- **거절**: pnpm pack tarball vendoring — DS 변경 시 매번 rebuild + 재배포. 본 iter 동안 DS 측 변경 의도 없음 → 불필요한 절차.

- **Admin route decision**:
  - Resource: `workspaces` (superadmin)
  - Routes: `/superadmin/workspaces` (list — search/filter/exposure 토글 + featured 보드 섹션 + featuredNote 인라인 편집)
  - Modal use: featuredNote 편집은 인라인 (작고 컨텍스트 의존, audit 없음 → modal gate pass; inline 이 가장 직관)
  - Featured 보드는 같은 페이지 내 상단 섹션. 별도 route 로 분리하지 않는 이유: 토글 → 메모 → 정렬 확인이 한 화면 워크플로우.

## Files to Modify

### New

- `core/packages/worker/migrations/0072_add_workspace_featured_meta.sql` — featuredNote/featuredAt 컬럼 추가

### Existing

- `core/packages/worker/src/db/schema.ts` — workspace 테이블에 `featuredNote: text`, `featuredAt: integer({ mode: 'timestamp_ms' })` 추가
- `core/packages/worker/src/routes/superadmin.ts` — PATCH `/workspaces/:id/featured-meta` 신규 + 기존 PATCH `/workspaces/:id/exposure` 가 featured 진입 시 `featuredAt = Date.now()` auto-set, featured 이탈 시 `featuredAt = null`, `featuredNote = null` clear
- `core/packages/worker/src/routes/public-feed.ts` (또는 동일 역할 파일) — `/api/feed/featured` 엔드포인트 신설: `platformExposure = 'featured'` 만 + `ORDER BY featuredAt DESC` + `featuredNote`, `featuredAt` 응답 포함. 기존 `/api/feed` 는 그대로.
- `core/packages/admin/package.json` — `@openhow/ds`, `@openhow/ds-tokens` file: 의존성 추가
- `core/packages/admin/src/main.tsx` — `@openhow/ds/styles.css` + `@openhow/ds-tokens/css` import, `document.documentElement.dataset.theme = 'toss'` 또는 root `data-theme="toss"` 적용
- `core/packages/admin/src/pages/superadmin/WorkspaceExposure.tsx` — DS 컴포넌트로 재작성: `PageShell` + `PageHeader` + `FilterBar` + `SearchField` + `DataTable` + `SegmentedControl` + `Badge` + `Pagination` + `EmptyState` + `Skeleton`. 상단에 "오늘의 추천" 섹션 (featured 워크스페이스 `featuredAt DESC` 정렬, featuredNote 인라인 편집)
- `core/packages/admin/src/pages/superadmin/WorkspaceExposure.css` — 기존 ad-hoc 스타일 trim (DS 가 커버하는 부분 제거, 잔여 layout 만)
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — 햄버거 메뉴의 "플랫폼 관리" 링크 제거 (project_admin_local_only 정합)

### Tests

테스트 없음 — admin 은 dev 도구. 검증은 로컬 수동 (worker + admin dev 띄우고 토글/메모/정렬 확인).

## Estimated Scope

~400-500 LOC, 8 files, 5 Codex steps

## Prerequisites

- max-designsystem 의 `core/react/dist`, `core/tokens/dist` 가 이미 빌드되어 있음 (확인 완료)
- 로컬 worker dev (7877) + 로컬 D1 + dev-login 세팅 (iter 1 에서 완료)
- D1 마이그레이션 apply: `cd core/packages/worker && pnpm wrangler d1 migrations apply mdshare-db --local`

## Reference

- 같은 intent prior iter: `learnings-iter-1.md` (frozen)
- 관련 의도: `public-home-creator-saas-pivot` (메인 페이지가 `/api/feed/featured` 를 소비할 의도 — 본 iter 가 그 응답을 제공)
- DS 인벤토리: `/Users/taesupyoon/sideProjects/max-designsystem/core/react/src/components` (94 컴포넌트)
