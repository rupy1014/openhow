# Plan — community-workspace-type-v1 (iter 1)

## Goal

community 워크스페이스에서 가입자가 Tiptap 으로 텍스트 글 작성 → 즉시 공개 → SEO sitemap 노출까지의 **끝-끝 walking skeleton**. 모더레이션 / anti-spam / 큐레이션 승급 bridge / 이미지 업로드 는 iter 2 wedge.

## Architecture Decision

- **선택**: 글 모델 = 기존 `document` 테이블 reuse + 권한 helper 분기.
  - 근거: workspace-scoped, R2 markdown 저장 + searchText 인덱싱 + accessLevel/status enum 이 이미 community 결과 그대로 부합. publish endpoint (`POST /api/ssg`) 가 워크스페이스 범위로 R2 업로드를 처리하므로 재사용 가능.
- **거절**: 새 `communityPost` 테이블 신설.
  - 근거: `topicPost` 와 동일 구조가 두 벌 생기고, sitemap/SSG/SEO 파이프라인을 별도로 깔아야 함. iter 1 wedge 가 4배로 커진다.
- **선택**: 권한 helper 는 시그니처 변경 대신 **새 helper** (`canCreateCommunityPost(role, workspaceType)`) 추가.
  - 근거: `canEditDocuments` 호출처 다수 (Grep 결과 ssg.ts 외에도 admin/document/lib 도처). 시그니처 변경은 drive-by 임. 작성 권한 분기를 별 helper 로 isolate.
- **선택**: 에디터 = **Tiptap** (사용자 confirm 2026-05-14). Plate.js 가 viewer 에 깔려 있지만 사용자 결정 유지.
  - 근거: 사용자 explicit choice. 의도 파일 그대로.

## Files to Modify

### New

- `core/packages/viewer/src/components/community/CommunityComposer.tsx` — Tiptap React 에디터 컴포넌트 (starter-kit 만, 이미지/임베드 제외)
- `core/packages/viewer/src/pages/CommunityNew.tsx` — `/c/:workspaceSlug/new` 작성 페이지
- `core/packages/viewer/src/pages/CommunityPost.tsx` — `/c/:workspaceSlug/:docSlug` 공개 페이지 (SSG render + 클라 hydrate 또는 SPA-only iter 1)
- `core/packages/worker/src/routes/community.ts` — `POST /api/community/:workspaceSlug/posts` (Tiptap JSON + HTML 받아 document 테이블 INSERT + R2 markdown 업로드)
- `core/packages/worker/migrations/{next}.sql` — workspace.type CHECK 제약 갱신 (`community` 추가)

### Existing

- `core/packages/types/src/config.ts` — `WorkspaceType` 에 `'community'` 추가. `TYPE_TO_CATEGORY`, `TYPE_TO_DEFAULT_LAYOUT`, `TYPE_TO_DEFAULT_CONTENT_WIDTH`, `WORKSPACE_TYPE_META` 에 community 엔트리.
- `core/packages/worker/src/db/schema.ts` — `workspace.type` enum 에 `'community'` 추가 (line 70).
- `core/packages/worker/src/lib/permissions.ts` — `canCreateCommunityPost(role, workspaceType)` 신규 helper. 기존 `canEditDocuments` 무변경.
- `core/packages/worker/src/routes/index.ts` (또는 라우트 등록 파일) — community 라우터 mount.
- `core/packages/viewer/src/router.tsx` (또는 등가) — `/c/:workspaceSlug/new`, `/c/:workspaceSlug/:docSlug` 라우트 추가.
- `core/packages/viewer/package.json` — `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm` 의존성 추가.
- `core/packages/cli/src/ssg/buildSitemapXml.ts` — community 워크스페이스 글도 sitemap 에 포함 (이미 accessLevel=public 필터 통과하면 자동 포함될 가능성 — 검증).
- `core/packages/cli/src/ssg/buildSeoMeta.ts` — JSON-LD `Article` structured data 추가 (community type 일 때).
- `core/CLAUDE.md` — "워크스페이스 유형은 blog (1급) 중심" 문장 갱신: blog + community 1급, docs/wiki 변종으로 정합.
- `docs/workspace-types.md` — community 타입 섹션 신설 (joinPolicy, defaultAccessLevel, init scaffold).

### Tests / Smoke

- `core/packages/worker/src/routes/__tests__/community.spec.ts` — community 워크스페이스에서 viewer role 가입자 publish 200, 다른 type 에서 viewer 403 검증.
- 수동 smoke: 로컬에서 community 워크스페이스 생성 → 가입 → 작성 → 공개 URL 접근 → `curl /sitemap.xml | grep {slug}` 매치.

## Estimated Scope

~600 LOC, 12 files, 4 Codex steps.

## Prerequisites

- `pnpm install` 후 Tiptap 패키지 설치 가능 (registry 정상).
- D1 local migration 적용 가능 (`wrangler d1 migrations apply`).

## Reference

- Memory: `project_openhow_positioning` (5-07 lock).
- 동시 의도: `composer-deprecation` (done 2026-05-14) — community type 은 그 lock 의 명시적 분기 ('타입별 분기' 가 INTENT Context 에 기록됨).
- 코드: `core/packages/types/src/config.ts:1-49`, `core/packages/worker/src/db/schema.ts:70,140-179,902-920`, `core/packages/worker/src/lib/permissions.ts:43-45`, `core/packages/worker/src/routes/ssg.ts:38-75`, `core/packages/cli/src/ssg/buildSitemapXml.ts:36-80`, `core/packages/cli/src/ssg/buildSeoMeta.ts:53-96`.
