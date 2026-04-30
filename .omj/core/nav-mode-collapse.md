---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
---

# nav-mode-collapse — workspace nav.mode 제거

## Why

two-panel / three-rail 은 디자인 완성도 대비 운영 복잡도가 크다. 사용자는 워크스페이스 노브를 `type` + `layout` 정도로 단순화하기로 결정했다. 특히 `navigation.mode` 명시가 없어도 `UnifiedLayout` fallback 이 `hasMainNav && hasSidebar` 로 two-panel 을 렌더하는 문제가 있어, config 되돌림이 아니라 코드에서 mode 개념 자체를 제거한다.

## What

- [done] `@openhow/types` 에서 `NavigationConfig.mode`, `NavigationConfig.homeRedirect`, `Workspace.navigationMode`, `MdshareConfig.preset`, `MdshareConfig.contentWidth` 제거
- [done] SPA `UnifiedLayout` / `PublicationPreset` / `MainNav` 에서 three-rail, two-panel, main-nav-only 분기 제거
- [done] workspace 생성/온보딩/허브 preview 에서 navigationMode 기본값과 검증 제거
- [done] Worker schema/select/insert/update 응답에서 `navigationMode` 참조 제거
- [done] CLI init/publish/scanner/fixture 에서 `navigation.mode` 전달과 생성 제거
- [done] SSG 는 단일 sidebar 구조만 유지하고 mode 분기는 만들지 않음
- [done] example dead config `nav.mode` 제거

## Not

- three-rail 사용처를 살리는 방향은 제외한다. 사용자가 일괄 kill 을 결정했다.
- D1 실제 `navigation_mode` 컬럼 drop 마이그레이션은 이번 변경에서 실행하지 않는다. 코드에서만 참조를 제거하고 DB drift 는 별도 후속으로 둔다.
- clauders.ai 를 `course/cohort-online` 으로 전환하지 않는다. 기존 blog + 단순 sidebar 방향을 유지한다.

## Context

- Parent: `.omj/core/unified-layout.md`
- Related: `.omj/core/bloglayout-removal.md`
- Supersedes: `.omj/core/three-rail-nav.md`
- Supersedes: `.omj/core/nav-rail-policy.md`
- Supersedes: `.omj/core/nav-mode-stability.md`
- Supersedes: `.omj/core/nav-2rail-sync.md`
- Kills: `.omj/core/clauders-ai-course-migration/`

## Footprint

- `core/packages/types/src/config.ts`
- `core/packages/types/src/workspace.ts`
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx`
- `core/packages/viewer/src/layouts/PublicationPreset.tsx`
- `core/packages/viewer/src/layouts/PublicationPreset.css`
- `core/packages/viewer/src/components/MainNav.tsx`
- `core/packages/viewer/src/components/WorkspaceHub.tsx`
- `core/packages/viewer/src/components/WorkspaceHub.css`
- `core/packages/viewer/src/layouts/AdminLayout.tsx`
- `core/packages/viewer/src/layouts/AdminLayout.css`
- `core/packages/viewer/src/pages/Onboarding.tsx`
- `core/packages/viewer/src/pages/workspace/WorkspaceDocs.tsx`
- `core/packages/viewer/src/stores/project.ts`
- `core/packages/viewer/src/styles/main.css`
- `core/packages/worker/src/routes/workspaces.ts`
- `core/packages/worker/src/routes/documents.ts`
- `core/packages/worker/src/lib/demo-content.ts`
- `core/packages/worker/src/db/schema.ts`
- `core/packages/cli/src/commands/init.ts`
- `core/packages/cli/src/commands/publish.ts`
- `core/packages/cli/src/scanner/index.ts`
- `core/packages/cli/src/__fixtures__/parity-workspace/openhow.json`
- `examples/clauders_book/openhow.json`
