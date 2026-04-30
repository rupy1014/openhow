---
status: superseded
created: 2026-04-20
updated: 2026-04-20
iteration: 1
supersededBy: core/nav-mode-collapse.md
---

# nav-mode-stability — 워크스페이스 nav 모드 고정 (레이아웃 invariance)

## Why

워크스페이스는 `config.navigation.mode` / `workspace.navigationMode` 로 nav 모드(2-rail / 3-rail / single) 를 선언 — 워크스페이스 수명 동안 변하지 않는 상수. 그런데 `UnifiedLayout` 이 **페이지 단위 상태**(`hasSidebar`, `currentSectionSidebarItems.length`, `activeSection`) 로 **preset body class 를 재계산** → 같은 워크스페이스 안에서 페이지를 넘길 때마다 `.pub-preset-body--two-panel` ↔ `--main-nav-only` 로 바뀌고, proximity-shift 공식의 입력이 달라져 **content 가 좌우로 튀는** 현상이 생김.

사용자 관찰 (2026-04-20):
> "애초에 이 워크스페이스가 몇단 구조인지 알고있는 상태에서 css 를 잡아야 할거같아. 메뉴 클릭할때마다 nav 가 나오고 안나오고가 되면서 위치값이 달라지는 현상이 있어"

`three-rail-nav` 가 "본문 정중앙" 을 하드 제약으로 잠궜고 `nav-content-proximity` 가 viewport-center 를 보존했지만, 이 제약들은 **같은 preset class 안에서만** 성립. preset 자체가 페이지 이동 중에 바뀌면 content 는 여전히 viewport 중앙이더라도 **nav column 수/폭 합이 바뀌면서 레이아웃 전체가 리플로우** → 정적 안정감이 깨짐.

핵심 주장: **워크스페이스가 몇단인지 아는 상태로 CSS 를 잡는다.** 모드를 workspace-level 로 잠그면 같은 워크스페이스 내 모든 페이지에서 layout invariance 가 자동 확보.

## Context

**부모 intent**:
- `core/three-rail-nav.md` (iter 1, done) — 3-rail preset 도입. `isThreeRail` 은 이미 workspace-level 이라 3-rail 워크스페이스는 대체로 stable (확인 필요).
- `core/nav-rail-policy.md` (iter 1, clarified) — rail 폭 차등 원리. 이 intent 는 그 원리 위에 **모드 고정** 을 얹음.
- `core/nav-2rail-sync.md` (iter 2, done) — sub nav 콘텐츠 동기화. 이 intent 는 **preset 분기 동기화** (직교).
- `core/nav-content-proximity.md` (iter 1, done) — proximity shift. 모드가 고정되면 proximity 도 자동으로 stable.

**현재 버그 경로** (`core/packages/viewer/src/layouts/UnifiedLayout.tsx`):
- L245-249 `isThreeRail` — workspace 모드에서 도출 (✅ stable)
- L251 `hasMainNav` — mainNav 배열 길이 기반 (대체로 stable, 단 `isSimplePage` 조건 변동)
- L283-286 `hasSidebar` — `currentSectionSidebarItems.length` 또는 `workspaceNav.length` 기반 (**페이지 activeSection 변경마다 값이 바뀔 수 있음 → 불안정**)
- L574 `isThreeRail` 분기 — 3-rail 선택 OK
- L609-620 non-three-rail 분기 — `hasSidebar` 로 `sidebar` vs `mainNavPanel` 프롭 토글 → PublicationPreset 이 body class 선택
- L630 `subSidebarPanel` 이 `hasSidebar` 조건부 → `--two-panel` vs `--main-nav-only` 분기의 실제 원인

**재현 가정**: 2-rail 워크스페이스(예: `clauders-book`) 에서 sidebar items 가 있는 페이지와 없는 페이지를 오가면 body class 가 전환됨. 3-rail 워크스페이스는 `isThreeRail=true` 면 항상 three-panel branch 로 가지만, rail 내부 items 가 비면 column 이 있는데도 fallback 이 일어나는지 검증 필요.

**제약**:
- 기존 `config.navigation.mode` / `workspace.navigationMode` shape 불변
- 3-rail 워크스페이스 현재 동작 보존 (이미 stable 한 부분은 그대로)
- 모바일 drawer / 태블릿 fallback (≤1279px) 동작 불변
- `isSimplePage` (auth / legal / 404) 는 여전히 preset 바깥에서 렌더

## Storyboard

1. **3-rail 워크스페이스 홈 진입** — L1/L2/L3 column 3개 모두 렌더. activeSection 없어서 L2/L3 비어도 **column 유지**. content = viewport center.
2. **L1 클릭 → 섹션 진입** — L2/L3 채워짐. column 수 동일, content 위치 **무변화**.
3. **섹션 내 페이지 이동** — L3 active 표시만 변함. content 위치 **무변화**.
4. **2-rail 워크스페이스 진입** — L1 (MainNav) + L2 (Sub) column 2개 렌더. Sub 비어도 column 유지. content = viewport center.
5. **2-rail sidebar 없는 페이지** — 현재 버그: L2 column 사라짐 → content 위치 이동. **기대: L2 유지 (empty / workspace nav / 다른 fallback)**.
6. **반대 방향** — 3-rail 워크스페이스에서 어떤 조건으로 2-rail fallback 이 일어나면 column 수 변동. 이것도 방지.

## What

- [x] [validated] **Workspace mode → body class 1:1 매핑** — `UnifiedLayout.tsx:293-305` 에 `bodyMode: 'three-rail' | 'two-panel' | 'single'` 도출. `isSimplePage` 는 즉시 `'single'` 로 escape (auth/404 보호). mode 입력은 `config.navigation.mode | workspace.navigationMode | effectiveMainNav.length` 뿐 — `hasSidebar` / `activeSection` 의존 제거. → metric: `grep bodyMode UnifiedLayout.tsx` 3 hit ✓
- [x] [validated] **2-rail 빈 column 유지 (옵션 A)** — `bodyMode === 'two-panel'` 분기에서 `subSidebarPanel={<Navigation items={effectiveSidebarItems} defaultExpandAll />}` 을 **항상** 렌더. items 비면 Navigation 이 빈 결과만 반환 → column 은 유지, body class 는 `--two-panel` 유지. → metric: `grep "isTwoPanel && hasSidebar" PublicationPreset.tsx` 0 hit ✓
- [x] [validated] **PublicationPreset body class decision 재구성** — `showThreePanel = isThreePanel`, `showTwoPanel = !showThreePanel && isTwoPanel`, `showMainNavOnly = !showThreePanel && !showTwoPanel && hasMainNav && !!mainNavPanel && !hasSidebar` 로 교체. body class 가 runtime `hasSidebar` 에 의해 flip 되지 않음. → metric: `grep "isThreePanel && hasSidebar" PublicationPreset.tsx` 0 hit ✓

## Not

- **nav 항목 동기화** — `nav-2rail-sync` scope
- **rail 폭 정책** — `nav-rail-policy` scope
- **proximity shift 수식** — `nav-content-proximity` 에서 해결. 이 intent 로 자동 stable 해짐
- **config schema 변경** — 기존 `navigation.mode` shape 재사용
- **`isSimplePage` 예외 페이지 처리 방식 변경** — auth/404 는 기존대로 preset 바깥

## Footprint

- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — `bodyMode` 도입, publication 분기를 3-rail / 2-panel / single 로 재구성. 2-panel 분기는 `subSidebarPanel` / `isTwoPanel` / `hasSidebar` / `hasMainNav` 를 **항상 true / 항상 렌더** 로 고정 (2026-04-20)
- `core/packages/viewer/src/layouts/PublicationPreset.tsx` — `showThreePanel` / `showTwoPanel` 에서 `hasSidebar` 의존 제거. body class 는 workspace 에서 파생된 `isThreePanel` / `isTwoPanel` prop 만으로 결정 (2026-04-20)

## Backlog
- [ ] playwright 로 실제 2-rail 워크스페이스 (예: clauders-book) 에서 sidebar 있는 페이지 ↔ 없는 페이지 간 content X 좌표 ±0px 확인 (iter 1 에서는 코드 경로 + build 만 검증)
- [ ] 3-rail 에서 activeSection 없을 때 L2/L3 empty-state 시각 처리 — 현재는 빈 column. 디자인 의도 명시 필요
- [ ] 모바일 drawer 진입 가능성 검토 — AppShell 의 메뉴 버튼 노출 조건이 `hasSidebar` 를 참조할 경우, 2-panel 모드에서 sidebar items 가 비어도 드로어가 여전히 열려야 함 (Codex P2 보류 관찰)
- [ ] `--main-nav-only` body class 제거 검토 — 현재 workspace 가 그 모드를 선언할 방법이 없음 (`navigationMode` enum 에 없음). dead branch 가능성

## Learnings

### 2026-04-20: seed created (iteration 1)
- **[signal] 사용자 관찰**: 메뉴 클릭마다 nav show/hide 로 content 위치가 흔들림. workspace-level 에서 rail 개수를 알고 있는데 CSS 가 per-page 상태로 재계산 중임을 지적.
- **Initial diagnosis**: `UnifiedLayout.tsx:283-286` 의 `hasSidebar` 가 `currentSectionSidebarItems.length` 에 의존 → 페이지별 sidebar items 유무에 따라 body class 전환 → proximity-shift 의 입력 변수(`--main-nav-width`, `--publication-nav-width`, column-gap 합) 자체가 바뀌는 게 원인.

### 2026-04-20: clarified (iteration 1)
- **[signal] 사용자 결정**: "A" → **옵션 A: 빈 column 유지**. 2-rail 워크스페이스에선 sidebar items 유무와 무관하게 L2 column 을 항상 렌더. 레이아웃 완전 invariance 가 최우선.
- **남은 판단 (build 에 위임)**:
  - `isSimplePage` 는 `Not` 에 명시된 대로 **예외 유지** (auth/404 는 preset 바깥)
  - 3-rail 에서 동일 증상 여부는 build 진입 시 playwright 로 확인 — 현재 `isThreeRail` 가 stable 하면 자동 해결, 아니면 같은 원리(rail items 비어도 column 유지) 적용
  - `--main-nav-only` body class 는 남겨둘지 제거할지 — workspace mode 로 "main-nav-only" 를 선언할 수 있으면 유지, 그렇지 않으면 제거 후보

### 2026-04-20: build done (iteration 1)
- **구현 요약**: `UnifiedLayout.tsx` 에 `bodyMode` 도입. 2-panel 분기는 `subSidebarPanel` 을 empty-items 에서도 항상 렌더. `PublicationPreset.tsx` 의 body class 결정에서 `hasSidebar` 의존 제거.
- **Codex review 반영**: P2 지적 — `isSimplePage` 시에도 2-panel 로 진입하던 문제. `bodyMode` 초입에 `if (isSimplePage) return 'single'` 추가해 intent 의 "simple pages 예외 유지" 제약 충족.
- **미처 검증 못한 것**: playwright 로 2-rail 워크스페이스에서 페이지간 content X 좌표 Δ=0 측정. 코드 경로 + build 만으로 확인. 사용자 눈으로 dev server 에서 체감 확인 후 iter 2 결정.
- **Codex 관찰 (backlog 로 이관)**: AppShell 의 mobile menu 버튼이 `hasSidebar` 를 참조할 수 있음 — 2-panel 모드에서 실제 items 가 비어도 드로어 열리는지 검증 필요. 현 iter 는 desktop layout invariance 에만 집중.
