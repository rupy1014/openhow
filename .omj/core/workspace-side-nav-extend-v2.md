---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
related: ../creator-saas-storyboard.md, workspace-side-nav-v1.md
scope: [viewer]
loop:
  until: judge
---

# workspace-side-nav-extend-v2 — MyStamps 페이지에 WorkspaceSideNav 적용

## Why

`workspace-side-nav-v1` 에서 `WorkspaceSideNav` 컴포넌트를 만들고 NoticesPage / AssignmentsPage 두 stub 에만 적용했다. MyStamps 는 자체 `.stamps-page` layout 으로 UnifiedLayout 의존성이 없어 사이드 nav 적용 시 cascade 위험 0 — 자연스러운 v2 확장 후보.

→ CommunityList / WorkspaceDocs 는 UnifiedLayout preset 의존성으로 여전히 v3 deferred. 본 v2 는 **MyStamps 만** 적용 — workspace 영역 4페이지 (Notices/Assignments/MyStamps + 미적용 Community/Docs) 중 3페이지로 nav 일관성 확장.

## Context

- **Reference**: `references/stitch-storyboard/frame-6-community.html` line 168-215 (좌측 256px 사이드 nav 구조 — 이미 적용된 v1 과 동일 디자인)
- **현재 surface**: `core/packages/viewer/src/pages/workspace/MyStamps.tsx` — 자체 `.stamps-page` 외곽 (UnifiedLayout 미사용)
- **재사용 자산** (변경 없음):
  - `WorkspaceSideNav.tsx` (v1 에서 생성됨)
  - `WorkspaceSideNav.css`
  - `.workspace-shell` 룰 (NoticesPage.css 에 정의됨, AssignmentsPage.css 가 @import 로 재사용)
- **active 매칭**: v1 `useLocation` 로직이 이미 `/w/{slug}/my` → Lectures active 매핑 처리.
- **scope 제외 대상**:
  - `CommunityList.tsx` — 자체 layout + 방금 추가된 sticky filter bar 와 cascade 가능. v3.
  - `WorkspaceDocs.tsx` — UnifiedLayout preset 의존. v3.
  - `WorkspaceSideNav.tsx` / .css 자체 — 미수정. v1 컴포넌트 그대로 사용.

## What (v2)

1. **MyStamps.tsx layout 변경** — 기존 `<div className="stamps-page">` 를 `<div className="workspace-shell">` 으로 감싸고 좌측에 `<WorkspaceSideNav workspaceSlug={workspaceSlug} />` 추가, 우측에 기존 `.stamps-page` 본문 (`.workspace-shell-main` 안에).
2. **MyStamps.css `@import`** — `@import './NoticesPage.css';` 추가 (AssignmentsPage 와 동일 패턴) — `.workspace-shell` / `.workspace-shell-main` 룰 재사용.
3. **렌더 가드 유지** — 기존 `loading` 분기 / login redirect / `useEffect` / 스토어 / Bootpay 핸들러 모두 미변경. 외곽 wrapper 만 변경.

## Not (v2 에서 제외)

- **CommunityList / WorkspaceDocs 적용** — UnifiedLayout / sticky filter bar cascade 위험. v3.
- **WorkspaceSideNav 컴포넌트 / CSS 변경** — v1 그대로 사용. nav 항목 추가 / 아이콘 변경 / footer / 모바일 토글 모두 미구현.
- **MyStamps 내부 마크업 / 핸들러 / 스토어 로직 변경** — 외곽 wrapper 만. subscription / stamps / coupon 표현 그대로.
- **Lectures 라우트 변경** — `/w/{slug}/my` 그대로. Stamps/Subscriptions 별도 라우트 분리는 별도 의도.
- **워크스페이스 권한 / type 가드** — 모든 워크스페이스 동일 5 nav.
- **사이드 nav width / breakpoint 변경** — v1 의 256px / <768px hide 그대로.

## Footprint

| 파일 | 변경 유형 |
|------|-----------|
| `core/packages/viewer/src/pages/workspace/MyStamps.tsx` | edit — `.workspace-shell` + `<WorkspaceSideNav>` 외곽 추가, 기존 `.stamps-page` 를 `.workspace-shell-main` 안으로 |
| `core/packages/viewer/src/pages/workspace/MyStamps.css` | edit — `@import './NoticesPage.css';` 1줄 추가 |

## 배포·검증 절차

1. 단독 `tsc --noEmit` 통과 (MyStamps.tsx)
2. localhost:5173 `/w/{ws}/my` 진입 → 좌측 256px 사이드 nav + Lectures active 표시 + 우측 stamps/구독 본문 확인
3. nav entry 클릭 → 라우트 이동 동작
4. 모바일 < 768px → 사이드 nav hide + stamps 본문 그대로
5. `/w/{ws}/community`, `/w/{ws}` regression 체크 — 미변경

## Backlog (v3 후보)

- `workspace-side-nav-extend-v3` — CommunityList / WorkspaceDocs 적용 (UnifiedLayout / sticky bar cascade 해결 필요)
- `workspace-side-nav-footer` — Settings/Support footer

## Learnings

### 2026-04-30: clarified — MyStamps 만, 자체 layout 페이지 선별

- **wedge 선정 근거**: v1 backlog 의 "MyStamps/CommunityList/WorkspaceDocs 적용" 에서 MyStamps 만 자체 layout (UnifiedLayout 미사용) 으로 cascade 위험 0. 다른 두 페이지는 layout cascade 위험 — 별도 wedge 로 격리.
- **단일경로 선택**: layout 의존성 없는 MyStamps 만이 isolated wedge. 나머지는 v3.
- **scope 잠금**: WorkspaceSideNav 컴포넌트 / CSS / CommunityList / WorkspaceDocs 모두 미변경. 본 의도는 *MyStamps wrapper 만*.

### 2026-04-30: [done] — 1 step 빌드 완료

- **What 완료**: MyStamps.tsx 에 `import WorkspaceSideNav` 추가 (line 5) + return JSX 의 `<div className="stamps-page">` 외곽을 `<div className="workspace-shell"> <WorkspaceSideNav workspaceSlug={workspaceSlug} /> <div className="workspace-shell-main"> <div className="stamps-page">` 3-layer 로 wrap (close 시 3 div). MyStamps.css 에 `@import './NoticesPage.css';` 1줄 prepend — `.workspace-shell` / `.workspace-shell-main` 룰 재사용.
- **Not 준수**: WorkspaceSideNav 컴포넌트 / CSS / NoticesPage.css / AssignmentsPage.css / CommunityList.tsx / WorkspaceDocs.tsx / UnifiedLayout / router.tsx 모두 미변경. MyStamps 내부 sections / sub-card / plan-list / stamp-card / coupon-card / Bootpay 핸들러 / useEffect / store 의존성 모두 미변경. 외곽 wrapper 만.
- **빌드 검증**: `git diff -w --stat` 본 wedge tsx +6 / css +2 (whitespace 제외 — 인덴트 변화로 raw diff 는 246 라인이지만 의미 변경은 import 1줄 + wrapper 2층 5줄 = 6줄). grep `WorkspaceSideNav` TSX 2건 (import + use). `workspace-shell` TSX 2건 (outer + main). `stamps-page` TSX 1건 (단일 inner wrapper 유지). `MyStamps.css` head `@import './NoticesPage.css';`. 프로젝트 단위 `tsc --noEmit` 본 wedge 추가 에러 0건 (LessonCard 사전 에러 무관).
- **시각 검증 한계**: localhost:5173 `/w/{ws}/my` 진입 → 좌측 256px 사이드 nav (Lectures active) + 우측 stamps/구독 본문. 모바일 < 768px 사이드 nav hide. 사용자 직접 확인.
