---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
related: ../creator-saas-storyboard.md, workspace-subpages-stub-v1.md, three-rail-nav.md
scope: [viewer]
loop:
  until: judge
---

# workspace-side-nav-v1 — frame 6 워크스페이스 좌측 사이드 nav (stub 페이지 한정)

## Why

frame 6 (`references/stitch-storyboard/frame-6-community.html` line 168-215) 좌측은 256px wide 고정 사이드 nav: 상단 워크스페이스 avatar + 이름, 중간 5개 nav (Home/Lectures/Notices/Community/Assignments), 하단 Settings/Support footer. 현재 `workspace-subpages-stub-v1` 로 추가한 NoticesPage / AssignmentsPage 는 breadcrumb 만 있고 사이드 nav 부재 — frame 6 의 직관적 nav 구조 미반영.

→ UnifiedLayout cascade 위험 회피: `WorkspaceSideNav` **컴포넌트** 만 신규 생성하고, 본 v1 에선 **NoticesPage / AssignmentsPage 두 stub 페이지에만** 적용. CommunityList / WorkspaceDocs 는 복잡도 + 기존 UnifiedLayout preset 의존성으로 v2 로 deferred.

## Context

- **Reference**: `references/stitch-storyboard/frame-6-community.html` line 168-215 (좌측 256px 사이드 nav 전체 구조)
- **현재 surface**:
  - `core/packages/viewer/src/pages/workspace/NoticesPage.tsx` — breadcrumb + header + empty placeholder (line 1-25)
  - `core/packages/viewer/src/pages/workspace/AssignmentsPage.tsx` — 동일 구조
- **scope 제외 대상** (cascade 위험):
  - `UnifiedLayout.tsx` — 670 라인, publication / two-panel / three-rail preset 시스템. 미수정.
  - `CommunityList.tsx` — 640+ 라인, 자체 layout 구조. v2 deferred.
  - `WorkspaceDocs.tsx` — workspace home, UnifiedLayout preset 의존. v2 deferred.
- **5개 nav 매핑**:
  - Home → `/w/{workspaceSlug}` (WorkspaceDocs)
  - Lectures → `/w/{workspaceSlug}/my` (MyStamps)
  - Notices → `/w/{workspaceSlug}/notices` (NoticesPage)
  - Community → `/w/{workspaceSlug}/community` (CommunityList)
  - Assignments → `/w/{workspaceSlug}/assignments` (AssignmentsPage)
- **active state**: `useLocation().pathname` 으로 현재 경로 매칭. exact 매칭 + Notices/Assignments/Community 는 prefix 매칭.
- **footer Settings/Support**: 라우트 미존재. v1 에선 **footer 자체 미구현** (5개 main nav 만).

## What (v1)

1. **`WorkspaceSideNav` 컴포넌트 신규** — `core/packages/viewer/src/components/WorkspaceSideNav.tsx` + `.css`. props: `{ workspaceSlug: string; workspaceName?: string }`. 256px wide, fixed left, 5 main nav items.
   - 상단 header: workspace avatar placeholder (회색 박스) + name (`workspaceName || workspaceSlug`).
   - 중간 nav: 5 entry, 각각 emoji 아이콘 + 라벨. emoji 사용 — Material Symbols 의존성 회피.
     - Home (🏠), Lectures (🎓), Notices (📣), Community (💬), Assignments (📋)
   - active state: 현재 pathname 매칭 시 파란 배경 + bold.
   - 모바일 (< 768px): hide (storyboard 동일 동작).
2. **NoticesPage / AssignmentsPage 레이아웃 업데이트** — 기존 `.subpage-stub` 외곽을 `.workspace-shell` (flex 2-col) 로 감싸고 좌측에 `<WorkspaceSideNav>` 추가, 우측에 기존 `.subpage-stub` 본문. NoticesPage.css / AssignmentsPage.css 는 기존 룰 유지하고 `.workspace-shell` 룰만 추가.
3. **route → workspaceName 추출** — useParams 에서 workspaceSlug 만 가져와도 됨. workspaceName 은 v1 에선 생략 (slug 노출). 도메인 데이터 fetch 회피.
4. **active 매칭 로직**:
   - `/w/{slug}` → Home active
   - `/w/{slug}/my` → Lectures active
   - `/w/{slug}/notices` → Notices active (현 페이지)
   - `/w/{slug}/community` 또는 prefix → Community active
   - `/w/{slug}/assignments` → Assignments active (현 페이지)

## Not (v1 에서 제외)

- **UnifiedLayout 변경 / preset 추가** — cascade 위험. 본 컴포넌트는 standalone, layout 시스템 미관여.
- **CommunityList / WorkspaceDocs 적용** — v2 (`workspace-side-nav-extend-v2`). 본 v1 은 stub 페이지 2종 한정.
- **Settings / Support footer** — 라우트 미존재, placeholder 도 미구현. v2.
- **워크스페이스 avatar 이미지 fetch** — workspace 도메인 데이터에 avatar URL 필드 fetch 안 함. 회색 박스 placeholder.
- **워크스페이스 type 별 nav 가변** — course / blog / docs 별 nav 달라지는 로직 없음. 모든 워크스페이스 동일 5개 nav.
- **권한 가드** — owner/student 분기 없음. 5개 nav 모두 표시.
- **Material Symbols 폰트** — frame 6 는 Material Symbols 사용. 의존성 추가 회피, emoji 로 대체.
- **모바일 햄버거 메뉴** — 모바일 (< 768px) 에선 sidebar 자체 hide, 햄버거 토글 미구현.
- **글로벌 nav-rail 와의 정합성** — UnifiedLayout 의 nav-rail 시스템과의 통합은 v2 이후 별도 의도.

## Footprint

| 파일 | 변경 유형 |
|------|-----------|
| `core/packages/viewer/src/components/WorkspaceSideNav.tsx` | new — 256px sidebar, 5 nav + workspace header |
| `core/packages/viewer/src/components/WorkspaceSideNav.css` | new — sidebar 스타일 + active state + 모바일 hide |
| `core/packages/viewer/src/pages/workspace/NoticesPage.tsx` | edit — `.workspace-shell` 외곽 + `<WorkspaceSideNav>` 좌측 추가 |
| `core/packages/viewer/src/pages/workspace/AssignmentsPage.tsx` | edit — 동일 |
| `core/packages/viewer/src/pages/workspace/NoticesPage.css` | edit — `.workspace-shell` 룰 추가 (flex 2-col) |

## 배포·검증 절차

1. `pnpm --filter @openhow/viewer build` 통과 (LessonCard.tsx 사전 에러는 본 wedge 무관)
2. localhost:5173 `/w/{ws}/notices` → 좌측 256px 사이드 nav 5개 entry 노출, Notices 활성 표시 확인
3. `/w/{ws}/assignments` → Assignments 활성 표시 확인
4. nav entry 클릭 → 해당 라우트 이동 확인 (Home → `/w/{ws}`, Community → `/w/{ws}/community` 등)
5. 모바일 viewport (< 768px) → 사이드 nav hide + 본문만 노출 확인
6. `/w/{ws}` (WorkspaceDocs) / `/w/{ws}/community` (CommunityList) 진입 → 본 wedge 무관, 기존 layout 그대로 (regression 체크)

## Backlog (v2 후보)

- `workspace-side-nav-extend-v2` — CommunityList / WorkspaceDocs / MyStamps 에도 사이드 nav 적용
- `workspace-side-nav-footer` — Settings / Support footer + 라우트
- `workspace-side-nav-mobile` — 모바일 햄버거 토글
- `workspace-avatar-fetch` — workspace 도메인 데이터에서 avatar URL fetch

## Learnings

### 2026-04-30: clarified — UnifiedLayout cascade 회피, stub 페이지 2종 한정

- **wedge 선정 근거**: 직전 wedge `workspace-subpages-stub-v1` 가 라우트 + placeholder 만 추가했고, 사이드 nav 부재로 frame 6 시각 미완성. 본 wedge 는 사이드 nav **컴포넌트** 만 만들어 stub 2종에 적용 — 다른 워크스페이스 페이지 (Community/Docs) 의 기존 UnifiedLayout 구조 미관여.
- **단일경로 선택**: UnifiedLayout 직접 수정은 670 라인 + 다중 preset cascade 위험. 새 layout 컴포넌트 신규 생성 + 적용 페이지 한정이 가장 안전. CommunityList / WorkspaceDocs 적용은 v2 deferred.
- **scope 잠금**: UnifiedLayout / CommunityList / WorkspaceDocs / MyStamps / 글로벌 nav-rail 미변경. 본 의도는 *WorkspaceSideNav 컴포넌트 + Notices/Assignments 적용* 만.

### 2026-04-30: [done] — 1 step 빌드 완료

- **What 완료**: WorkspaceSideNav.tsx 신규 (props: workspaceSlug + workspaceName?, useLocation 으로 active 매칭, 5 nav entry: Home/Lectures/Notices/Community/Assignments + workspace header avatar placeholder + name). WorkspaceSideNav.css 신규 (256px wide, fixed 좌측, active state 파란 배경, 모바일 < 768px display:none). NoticesPage.tsx + AssignmentsPage.tsx 를 `.workspace-shell` (flex 2-col) 로 감싸고 좌측에 `<WorkspaceSideNav>` 추가. NoticesPage.css 에 `.workspace-shell` 룰 append (AssignmentsPage.css 는 @import 로 재사용).
- **Not 준수**: UnifiedLayout / CommunityList / WorkspaceDocs / MyStamps / router.tsx / 글로벌 nav-rail 모두 미변경. Settings/Support footer / 모바일 햄버거 / Material Symbols / workspace avatar fetch / 권한 가드 모두 미구현. 사이드 nav 는 stub 2종에만 적용.
- **빌드 검증**: 5개 변경 파일 단독 `tsc --noEmit` 통과 (no output = success). 본 wedge 가 추가한 TS 에러 0건. router.tsx 무변경 (sanity check pass — git status 에 router.tsx 없음). grep WorkspaceSideNav JSX 4건 (2 import + 2 use), workspace-shell 7건 (4 JSX + 3 CSS), workspace-side-nav CSS 14건.
- **시각 검증 한계**: localhost:5173 `/w/{ws}/notices` `/w/{ws}/assignments` 진입 + 모바일/데스크탑 viewport 토글 필요. nav 클릭 시 라우트 이동 확인. 사용자 직접 확인.
