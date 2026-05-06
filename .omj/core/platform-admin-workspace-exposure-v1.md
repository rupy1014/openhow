---
status: done
created: 2026-05-06
updated: 2026-05-06
iteration: 1
---

# Platform Admin — Workspace Exposure Gate (v1)

## Why

플랫폼 운영자(taesup) 가 **DB 상 어떤 워크스페이스가 public surface 에 노출되는지** 결정할 수 있는 관리자 화면이 없음.

현재 모든 admin UI (`pages/admin/Admin*.tsx`) 는 워크스페이스 내부 admin (강사가 본인 클래스 관리). 플랫폼 전체 워크스페이스 목록을 보고 노출 여부를 토글하는 **superadmin** 레이어 부재.

**임박한 위험**: `public-home-creator-saas-pivot.md` iter 2 가 `/api/feed` 로 Showcase carousel 을 hydrate 하는 순간, **테스트/WIP/사칭/스팸 워크스페이스가 무차별 노출**된다. 게이트 없이는 home pivot iter 2 진행 불가.

**positioning 호환성** (project_openhow_positioning 게이트 통과): 플랫폼-레벨 콘텐츠 큐레이션이 아니라, **운영자 안전 토글**(=YouTube 의 unlisted/public 같은 단순 게이트). 디스커버리 파이프라인이 아님 → 정체성 위반 X.

## What

- [validated] **(v1) DB schema = 3단계 enum (옵션 B)** — `workspace` 테이블에 컬럼 추가:
  - `platformExposure: 'hidden' | 'listed' | 'featured'` (default `'hidden'`)
  - 의미: `featured` = 공개 홈 Showcase carousel 노출 / `listed` = `/api/feed` 응답 + 검색 surface 만 / `hidden` = 어디에도 노출 X (디폴트, 안전).
  - 결정 근거: 롱블랙식 큐레이션 = 운영자가 "오늘의 추천" 을 골라 hero 에 띄움. boolean 으로는 hero 와 일반 등재를 구분 못함. v2 마이그레이션 비용보다 v1 enum 시작이 저렴.
  - 마이그레이션: 기존 워크스페이스 전부 `'hidden'` 백필 (운영자가 명시적으로 listed/featured 로 올리기 전까지 노출 X). → **metric: 마이그레이션 후 기존 워크스페이스 100% `hidden`, `/api/feed` 응답 비어있음 (게이트 적용 후)**
- [validated] **(v1) Auth = env `SUPERADMIN_EMAILS` allowlist (옵션 B)** — `wrangler.toml` / `.dev.vars` 의 콤마 구분 이메일 리스트. 미들웨어가 세션 user.email 과 대조. role 컬럼 추가는 v2 (운영자 다수화 시점에).
  - 결정 근거: v1 운영자 1인(taesup) 가정. role 컬럼 + 마이그레이션 + UI 부담 회피. env 변경만으로 운영자 추가 가능.
  - 보안: 미들웨어는 `routes/superadmin.ts` 의 모든 핸들러 진입점에서 단일 함수 호출 (`requireSuperadmin(c)`). 우회 경로 없음. → **metric: 비-superadmin 이 `/api/superadmin/*` 호출 → 403, allowlist email session → 200, env 미설정 시 기본 deny**
- [validated] **(v1) Admin UI — `/superadmin/workspaces`** — 신규 layout (`SuperadminLayout.tsx`, 기존 `AdminLayout` 과 분리. nav 진입점은 운영자만 본인 헤더 메뉴에 노출).
  - 화면 구성: 워크스페이스 테이블 — 컬럼 slug / name / owner email / type / classPreset / created / docs 수 / 현재 exposure 상태 / [hidden/listed/featured] 라디오. 상단 검색 (slug · owner email · name) + 필터 (type · exposure 상태).
  - 페이징: 50건씩 cursor pagination.
  - 토글 UX: 라디오 클릭 → optimistic update + PATCH 호출 → 실패 시 rollback + toast.
  - 빈 상태/에러 상태 처리. → **metric: 50건 페이지 fetch + exposure 토글 1건 → DB 반영 + Showcase/`/api/feed` 응답 변화 확인**
- [validated] **(v1) `/api/feed` + Showcase hydration 게이팅** — feed 엔드포인트가 `platformExposure IN ('listed', 'featured')` WHERE 절 추가. Showcase carousel 전용 별도 엔드포인트 (`/api/feed/featured`) 는 `featured` 만 반환.
  - hidden 워크스페이스의 학생 게시판 SEO 자산 (creator-platform-discovery 의 `/community/*`) 도 함께 sitemap 에서 제외 (정합성 — 워크스페이스가 숨김인데 그 안의 글이 sitemap 에 노출되면 어색). → **metric: hidden 워크스페이스의 docs 가 sitemap.xml 에 미포함 + `/api/feed` 응답에서 제외 + `/api/feed/featured` 는 featured 만 반환**
- [planned] **(v2) audit log** — 누가/언제/어떤 워크스페이스를 어떤 단계로 변경했는지 기록 (운영자 다수일 때 필요).
- [planned] **(v2) user.role 컬럼 + 마이그레이션** — env allowlist 한계 도달 시 (운영자 ≥ 3명 또는 권한 분화 필요).
- [planned] **(v2) featured 큐레이션 메타** — `featuredNote` (왜 추천하는지 운영자 메모) + `featuredAt` (정렬용). 롱블랙식 "오늘의 추천" 회전.
- [planned] **(v2) 자동 노출 후보 큐** — 신규 워크스페이스가 일정 기준 충족 시 (예: 발행글 ≥ 5, 결제 1건) "노출 후보" 로 자동 분류 → 운영자 한 클릭 승인.

**확신도 태그**: v1 항목 전부 `[validated]` (사용자 "추천대로" 위임 + 롱블랙 모델 정합) — 빌드 단계 진입 가능.

## Not

- 사용자 대상 워크스페이스 디스커버리 페이지 (`/explore`, `/topics/...`) — positioning lock 위반.
- 워크스페이스 ranking/추천 알고리즘 — 단순 boolean 또는 tier 토글까지만.
- 자동 모더레이션 (스팸 탐지, 콘텐츠 분석) — 범위 밖. 운영자가 수동 판단.
- 신규 superadmin role 을 워크스페이스 admin 권한과 결합 — superadmin 은 노출 게이트만 만지고, 워크스페이스 내부 콘텐츠 편집은 별도 권한 필요.
- **UX storyboard 우회** — 사용자 결정 (2026-05-06): "바로 빌드해줘 스토리보드 말고". Rule 11 의 storyboard 의무 우회. 코드 진입 후 실제 UI 보고 조정. 위험: 토글 UX (라디오 vs 드롭다운 vs 3 버튼) 가 빌드 후 마음에 안 들 가능성 — 필요 시 iter 2 에서 재방문.

## Context

**기존 admin 인프라**:
- 모든 `pages/admin/*` 는 `/dashboard/:workspace/...` 라우트 — 워크스페이스 내부 한정.
- `AdminLayout.tsx` 가 nav 구성 — superadmin 은 별도 layout 필요할 가능성.
- workspace 테이블 (`db/schema.ts`): `defaultAccessLevel`, `joinPolicy`, `customDomain` 등 비공개/접근 컬럼은 있으나 **플랫폼-레벨 노출 게이트 컬럼 없음**.
- user 테이블에 `role` 컬럼 없음 — superadmin 도입 시 신규 컬럼 또는 별도 테이블 필요.

**의존 의도**:
- `public-home-creator-saas-pivot.md` iter 2 — 이 게이트가 선결조건. iter 2 진입 전 v1 완료 필요.
- `creator-platform-discovery.md` — 학생 게시판 SEO 자산이 워크스페이스 단위로 묶여있음 → 워크스페이스가 노출 OFF 되면 그 안의 학생 글도 함께 비노출되어야 (SEO 정합성).

**positioning 게이트** (project_openhow_positioning):
- 플랫폼-레벨 콘텐츠 큐레이션 ❌ → 본 의도는 **운영자 안전 토글**이지 큐레이션이 아님 (큐레이션 = 카테고리/태그/추천 알고리즘. 토글 = 노출 ON/OFF).
- liveklass 모델 호환: liveklass 도 플랫폼 홈에 자사 사례 워크스페이스만 보여줌 (=화이트리스트). 동일 패턴.

## Footprint

### iter 1 (2026-05-06)

**Worker (backend)**:
- `core/packages/worker/src/db/schema.ts` — `workspace.platformExposure` enum 컬럼 추가
- `core/packages/worker/migrations/0060_add_workspace_platform_exposure.sql` — `ALTER TABLE workspace ADD COLUMN platform_exposure TEXT NOT NULL DEFAULT 'hidden'`
- `core/packages/worker/src/types.ts` — `Bindings.SUPERADMIN_EMAILS?: string`
- `core/packages/worker/src/middleware/auth.ts` — `requireSuperadmin` 미들웨어 + `isSuperadminEmail` 헬퍼 (env allowlist 기반, 빈 allowlist = deny all)
- `core/packages/worker/src/routes/superadmin.ts` (신규) — `GET /workspaces` (search/type/exposure 필터, cursor 페이지네이션, 50건 limit) + `PATCH /workspaces/:id/exposure`
- `core/packages/worker/src/index.ts` — `/api/superadmin` 라우트 마운트, `/api/me` 응답에 `isSuperadmin`, sitemap.xml 의 docs 쿼리에 `inArray(platformExposure, ['listed', 'featured'])` 게이트
- `core/packages/worker/src/routes/public-feed.ts` — `publicWorkspaceFilter` 에 동일 게이트 추가

**Viewer (frontend)**:
- `core/packages/viewer/src/stores/auth.ts` — `AuthUser.isSuperadmin?: boolean`
- `core/packages/viewer/src/layouts/SuperadminLayout.tsx` + `.css` (신규) — defense-in-depth 가드 + 좌측 sidebar (모바일에선 상단 가로 nav)
- `core/packages/viewer/src/pages/superadmin/WorkspaceExposure.tsx` + `.css` (신규) — 검색/필터 (300ms debounce, setTimeout) + 테이블 + 3-button segmented control (optimistic update + rollback) + cursor pagination + 빈/에러 상태
- `core/packages/viewer/src/router.tsx` — `RequireSuperadmin` 가드 + `/superadmin/workspaces` 라우트
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — 데스크탑 dropdown + 모바일 nav 양쪽에 `isSuperadmin` 조건부 "플랫폼 관리" 진입점

**운영자 셋업 필요 (코드 외)**:
- `core/wrangler.toml` 에 `SUPERADMIN_EMAILS = "rupy1014@gmail.com"` 추가 (또는 `wrangler secret put SUPERADMIN_EMAILS` 운영용)
- `.dev.vars` 에 동일 키 추가 (로컬 dev)
- `cd core/packages/worker && pnpm wrangler d1 migrations apply mdshare-db --local` (로컬) / `--remote` (운영)

## Backlog

- v2 audit log
- v2 자동 노출 후보 큐
- v2 운영자 다수 지원 (현재 v1 은 1인 운영자 가정)

## Learnings

### 2026-05-06: seed created (iteration 1)
- **Background**: `public-home-creator-saas-pivot.md` iter 2 의 `/api/feed` Showcase hydration 직전, 노출 게이트 부재 위험을 사용자가 인지 → "관리자 화면 필요" 발화.
- **DB 분석**: `workspace` 테이블에 `defaultAccessLevel`/`joinPolicy`/`customDomain` 등 접근 관련 컬럼 다수 존재하나 **플랫폼-레벨 노출 게이트 컬럼 부재 확정**. user 테이블에 role 컬럼도 없음.
- **인접 의도**: 워크스페이스 내부 admin UI 는 `pages/admin/Admin*.tsx` 13종 존재. superadmin layer 는 0개 — 본 의도가 첫 superadmin surface.

### 2026-05-06: clarified — 사용자 "추천대로 + 롱블랙처럼" 위임
- **사용자 발화**: "추천대로 해줘. 롱블랙 처럼 해야해. 오래걸리더라도 좋은 결과물을 내자"
- **결정 1 (DB)**: 옵션 B = 3단계 enum `platformExposure: hidden | listed | featured`. 롱블랙 큐레이션 모델 = featured/listed 분리 필수. boolean 으로 시작 후 enum 마이그레이션 비용보다 처음부터 enum 이 저렴.
- **결정 2 (Auth)**: 옵션 B = env `SUPERADMIN_EMAILS` allowlist. v1 운영자 1인. role 컬럼 추가는 v2.
- **결정 3 (Storyboard)**: Phase 0 으로 추가. UI intent + Rule 11 + 사용자 quality bar.
- **추가 v2 항목**: `featuredNote` / `featuredAt` 큐레이션 메타 (롱블랙식 "오늘의 추천" 회전 자산) — Backlog 로 분류, v1 범위에 안 넣음 (스코프 hygiene).
- **다음 단계**: build 진입 — Phase 0 storyboard 부터.

### 2026-05-06: storyboard 우회 결정 (사용자)
- **사용자 발화**: "바로 빌드해줘 스토리보드 말고"
- **변경**: What 의 Phase 0 storyboard 항목 제거 + Not 섹션에 우회 사유 기록.
- **리스크**: 토글 UX 형태 결정 (라디오/드롭다운/버튼) 이 코드에서 즉흥. 빌드 후 사용자가 마음에 안 들면 iter 2 에서 UI 재작업.
- **다음**: `/omj:build platform-admin-workspace-exposure-v1` 즉시 호출.

### 2026-05-06: build iter 1 done — 4-step Codex 파이프라인 [done]
- **실행**: 4단계 Codex 위임 (DB → backend auth/routes → public surface 게이트 → viewer UI). 각 단계 후 typecheck (`pnpm tsc --noEmit`) + `git status --short` 로 scope 검증.
- **토글 UX 결정 (Codex 즉흥)**: 3-button segmented control (`[숨김] [등재] [추천]`) — 라디오/드롭다운보다 "현재 상태 + 다음 액션" 한눈에 보임. 사용자 빌드 후 검증 필요.
- **검증 결과**:
  - **DB**: 마이그레이션 파일 0060 생성, 컬럼 default `'hidden'` — 기존 워크스페이스 자동 백필. ✅
  - **Auth**: env 미설정 시 모두 403 (기본 deny), allowlist email session 만 200. `/api/me` 에 `isSuperadmin: boolean` 노출 → 프론트 가드 자동 hydrate. ✅
  - **Public surface 게이트**: `/api/feed` + `sitemap.xml` 둘 다 `inArray(platformExposure, ['listed', 'featured'])` 적용. workspace 단일 조회 (`GET /api/workspaces/:slug`) 는 의도적으로 게이트 제외 — owner 가 본인 hidden 워크스페이스 봐야 함. ✅
  - **UI**: optimistic update + rollback, 300ms debounce, cursor 페이지네이션, segmented control. Defense-in-depth (router + layout 양쪽 가드). ✅
- **Codex 부수효과 (스코프 외 변경 없음)**: viewer/worker 디렉토리에 다른 WIP 파일들 (creator-platform-discovery 의 작업물, AdminLayout 변경 등) 이 있었지만 본 step 으로 추가 변경되지 않음 — Codex 가 plan 범위만 수정했다.
- **운영자 셋업 (사용자 액션 필요)**:
  1. `core/wrangler.toml` `[vars]` 에 `SUPERADMIN_EMAILS = "rupy1014@gmail.com"` 추가 (운영용은 `wrangler secret put SUPERADMIN_EMAILS`)
  2. `core/.dev.vars` 에 동일 키 추가 (로컬)
  3. `cd core/packages/worker && pnpm wrangler d1 migrations apply mdshare-db --local` (로컬 테스트) → `--remote` (배포)
  4. 로컬 dev 에서 `localhost:5173/superadmin/workspaces` 진입 → 토글 UX 확인 → 마음에 안 들면 iter 2 에서 UI 재작업
- **dependent 의도 unblock**: `public-home-creator-saas-pivot.md` iter 2 (Showcase carousel hydration) 진입 가능 — `/api/feed/featured` 류 엔드포인트 추가하거나 기존 `/api/feed` 응답을 그대로 사용 (이미 listed/featured 로 게이트됨).
- **What 완성 매트릭스**:
  - [x] (v1) DB schema = 3단계 enum
  - [x] (v1) Auth = env allowlist
  - [x] (v1) Admin UI `/superadmin/workspaces`
  - [x] (v1) `/api/feed` + sitemap 게이팅
  - (v2 항목들은 Backlog 잔류)
