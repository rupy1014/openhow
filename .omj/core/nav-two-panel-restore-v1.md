---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
parent: null
---

# nav-two-panel-restore-v1 — two-panel BodyMode CSS/레이아웃 복원 + nav.mode 입력 노브는 도입 X

## Why

오늘 14:36 `95cb2d7 nav-mode-collapse: workspace nav.mode 통째로 제거` 가 (a) `workspace.navigationMode` / `NavigationConfig.mode` 입력 노브 + (b) `.pub-preset-body--two-panel` / `--three-panel` / `--main-nav-only` CSS 분기 + (c) `UnifiedLayout` `BodyMode` 도출 로직 — 세 가지를 동시에 제거했다. 결과: 모든 워크스페이스가 단일 sidebar 에 `MainNav + sub Navigation` 이 vertical nested 로 쌓여 active 그룹만 펼치는 형태가 됨.

사용자 발화 (2026-04-30): *"내 의도는 단일 sidebar 가 아니야. two-panel, three-rail 이 맞는거같아. 다시 바꿔. 기존 blog 스타일을 원한다고. 이 부분을 복잡하게 하지말고 type, layout 으로 가자고. 워크스페이스는 나중에 여러 레이아웃을 제공하는 쪽으로"*

→ (a) **노브 입력 삭제는 유지** (단순화 정신 보존), (b) **two-panel CSS + 레이아웃 분기 복원**, (c) **BodyMode 자동 도출 — 외부 노브 없이 `effectiveMainNav.length` 만으로**.

## What

- [done] **iter 1**: 95cb2d7 직전 (`9cd79aa`) 의 viewer 4 파일 (PublicationPreset.tsx/.css, MainNav.tsx, styles/main.css 의 `--two-panel-gap` 토큰) 을 그 시점 버전으로 회귀. UnifiedLayout 은 9cd79aa 의 `BodyMode` 분기 + `two-panel` JSX 갈래를 베이스로 하되, 본 세션의 marketingNav 작업 (centerNav prop) 보존, bodyMode 도출은 `effectiveMainNav.length > 0 → 'two-panel'` 단순 매핑 (외부 `navigation.mode` 입력 의존 제거). → **metric**: typecheck pass + SSG `localhost:3500/recipes/payment-window` (Bootpay docs 워크스페이스) 가 두 컬럼 (MainNav 184px | sub Navigation 137px) 으로 펼쳐 보이는 시각 확인.
- [planned] **iter 2**: workspace 가 layout 옵션 (single | two-panel | three-rail) 직접 선택. layout 노브 (`'publication' | 'document'`) 에 추가 옵션 도입.

## Not

- `workspace.navigationMode`, `NavigationConfig.mode` 등 **입력 노브 재도입 X** (사용자 요청)
- worker schema 변경 X (입력 노브 자체를 안 받음)
- cli init/publish 의 `nav.mode` 생성 X
- 95cb2d7 에서 이미 정리된 type 노브 (`MdshareConfig.preset` 등) 되돌리기 X
- three-rail 분기 — 이번 iter 범위 밖. CSS 는 9cd79aa 버전 그대로 들어오지만 `bodyMode` 매핑에서는 도출 안 됨 (iter 2 에서 layout 노브 확장 시 살림)

## Context

- HEAD = `95cb2d7` (push 됨, main 브랜치). force-push 위험 → 새 커밋으로 복원.
- 직전 = `9cd79aa figure-sidecar-toc-fallback iter1` — 회귀 reference.
- 워킹트리 modified: `AppShell.tsx/.css` (centerNav slot — 보존), `UnifiedLayout.tsx` (marketingNav useMemo — 보존), `LessonPlayer.*`, `CommunityList.*`, `MyStamps.*`, `WorkspaceDocs.*` (이전 세션 산물 — 본 wedge 무관, 그대로 둠).
- LayoutPreset 현재 상태: `'publication' | 'document'` 2 종. TYPE_TO_DEFAULT_LAYOUT 의 모든 type 은 `'publication'`. → 이번 iter 에서 매핑은 `effectiveMainNav.length` 단순 기반으로만 (layout 노브 확장은 iter 2).
- bodyMode 매핑 (확정):
  - `isSimplePage` → `'single'`
  - `effectiveMainNav.length > 0` → `'two-panel'`
  - 그 외 → `'single'`

## Footprint

- `core/packages/viewer/src/layouts/PublicationPreset.css` — 9cd79aa 버전 (~301 LOC 회귀). `.pub-preset-body--two-panel` / `--three-panel` / `--main-nav-only` 분기 + 관련 sub sidebar 토큰 복원.
- `core/packages/viewer/src/layouts/PublicationPreset.tsx` — 9cd79aa 버전 (~70 LOC 회귀). `mainNav` / `subSidebar` slot 분기 추가.
- `core/packages/viewer/src/components/MainNav.tsx` — 9cd79aa 버전 (28 LOC 회귀).
- `core/packages/viewer/src/styles/main.css` — `--two-panel-gap` 등 1 토큰 라인 회귀.
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — 9cd79aa 베이스 + (a) `bodyMode` 매핑을 `effectiveMainNav.length` 단순 도출로 교체 (`workspace.navigationMode` / `config.navigation.mode` 의존 제거), (b) 본 세션 marketingNav useMemo + `centerNav={marketingNav}` 호출 보존, (c) three-rail JSX 갈래는 들어오되 매핑이 도출 안 하므로 사실상 dead branch (iter 2 에서 활성).

## Backlog

- [ ] iter 2 — workspace 가 layout 옵션 (`'publication-two-panel' | 'publication-three-rail' | 'document'` 등) 직접 선택. UI 노브 + LayoutPreset 확장.
- [ ] three-rail 자동 도출 정책 — type 기반 vs layout 기반 결정.
- [ ] 95cb2d7 에서 함께 단순화된 `MdshareConfig.preset` / `contentWidth` 가 정말 필요 없는지 후속 검토.
- [ ] LessonCard.tsx 의 `CourseTag` 미정의 (이전 세션 산물) — `pnpm build` 차단 중. 별도 wedge.

## Learnings

### 2026-04-30: iter 1 build done [done]

- **결과**: 7 파일 변경 (+658/-38). PublicationPreset.css +301, PublicationPreset.tsx +70, UnifiedLayout.tsx +227, MainNav.tsx +28, main.css +1, AppShell.tsx/.css 는 직전 wedge `header-marketing-nav-v1` 의 centerNav slot 보존. typecheck pass, build pass (2.69s). 사용자 시각 확인 — 두 컬럼 (MainNav | sub Navigation) 정상 노출.
- **부분 회귀 전략의 적합성**: 95cb2d7 은 (a) 노브 입력 삭제 + (b) CSS 분기 삭제 + (c) BodyMode 도출 단순화 — 세 가지를 한 번에 했다. 사용자 요구는 (a) 유지 + (b)(c) 회귀. 단순 `git revert 95cb2d7` 로는 (a) 까지 되돌아가서 노브 단순화 정신이 깨짐. **부분 회귀 (`git checkout 9cd79aa -- <viewer 4 파일>` + UnifiedLayout 의 외부 노브 의존만 매핑 함수로 교체)** 가 정확한 답이었음. revert 한 줄보다 careful 했지만 의도와 결과 일치.
- **`isThreeRail` dead branch 처리**: 9cd79aa 는 `workspace.navigationMode === 'three-rail'` 로 분기를 켰는데 그 노브 자체가 95cb2d7 에서 삭제. 본 iter 는 `const isThreeRail = false` 로 두고 JSX 갈래는 살려뒀다. 컴파일러는 dead branch 를 dead 로 인식하지만 코드는 그대로 — iter 2 에서 `LayoutPreset` 에 `'publication-three-rail'` 같은 옵션 추가하면 한 줄 (`isThreeRail = layoutPreset === 'publication-three-rail'`) 만 바꿔서 활성화 가능. 코드 보존 비용은 낮고 후속 wedge 진입 비용을 크게 줄임.
- **`MdshareConfig.contentWidth` 추가 정리**: 9cd79aa 의 `resolvedContentWidth` 가 `config.contentWidth` 를 read 했지만 95cb2d7 에서 그 type 필드도 삭제됐음. `TYPE_TO_DEFAULT_CONTENT_WIDTH` 자동 매핑 + `routeName === 'home' → 'landing'` 만으로 충분 — config override 노브는 다시 도입하지 않음 (사용자의 단순화 정신 유지).
- **SSG 영향 없음**: 95cb2d7 은 SSG (cli/ssg) 를 만지지 않았다. SSG 의 `ssg-sidebar` / `ssg-main-nav` 클래스 셋은 별도 prefix 로 관리되고 본 wedge 의 SPA viewer 변경은 SSG 출력에 영향 없음. 사용자가 본 `localhost:3500` 의 `pub-preset-sidebar` / `main-nav` 는 viewer SPA 의 클래스이므로 dev server 또는 정적 빌드로 SPA 결과를 띄우는 환경.
