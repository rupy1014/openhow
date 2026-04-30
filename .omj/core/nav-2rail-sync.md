---
status: superseded
created: 2026-04-20
updated: 2026-04-20
iteration: 2
supersededBy: core/nav-mode-collapse.md
---

# nav-2rail-sync — 2-rail 홈/섹션 전환 시 sub nav 상태 동기화

## Why

2-rail(two-panel) 워크스페이스에서 sub nav(L2 sidebar) 가 main nav(L1) 와 어긋남. 사용자(잡돌쌤, clauders-book)가 직접 겪는 버그:

1. **홈(`/`)에서 sub nav 가 보임** — 기대: 홈에는 섹션 컨텍스트가 없으니 sub nav 숨김. 현재: 첫 main nav 항목(`part-01`)의 sub items 가 기본 노출됨.
2. **main nav 를 바꿔도 sub nav 내용이 안 따라옴** — 기대: main nav 섹션 전환 시 sub nav 가 해당 섹션의 항목으로 즉시 갱신. 현재: URL 이 바뀌어야만 반영되거나, main nav 클릭이 expand(토글)만 하고 네비게이션이 안 일어나 sub nav 가 이전 섹션에 고정됨.

2-rail 은 "섹션 호핑(L1) → 문서 스캔(L2)" 이 핵심 UX. 두 레일이 어긋나면 두 panel 을 두는 의미 자체가 없음.

## Context

**재현 워크스페이스**: `/Users/taesupyoon/sideProjects/youtube/channels/jobdori/clauders-book` (docs, two-panel, 로컬 serve). `docs/_meta.json` 에 `part-01`~`part-05` main nav 정의.

**관련 코드 (예상)**:
- `packages/viewer/src/stores/project.ts:745-801` `updateActiveSection` — path 파싱 로직
  - L753-759: `segments.length === 0` (홈) 에서 `nav[0].key` 로 폴백 → **버그 #1 원인 의심**
- `packages/viewer/src/layouts/UnifiedLayout.tsx:254-277` `currentSectionSidebarItems` / `hasSidebar` — activeSection 기반 sub nav 계산
- `packages/viewer/src/components/MainNav.tsx` `handleToggle` — 클릭이 토글인지 navigation 인지
- `packages/viewer/src/layouts/UnifiedLayout.tsx:637-675` two-panel 렌더 분기

**부모 intent**: `core/nav-rail-policy.md` (2-rail 폭 정책, clarified). 같은 2-rail 영역이지만 scope 직교 — 이쪽은 **상태 동기화**, 저쪽은 **폭**. 동시/독립 진행 가능.

**제약**:
- 3-rail (`three-rail-nav`) 동작 불변 — activeProductIndex 로직 건드리지 않음
- 기존 `/d/`, `/blog/`, `/w/` 경로 분기 유지
- API 응답 shape / sidebar config shape 무변화

## What

- [x] [validated] **홈에서 activeSection 비우기** — `updateActiveSection:753-759` 의 `segments.length === 0` 분기를 `setSection('')` 한 줄로 축소. 홈에서 `currentSectionSidebarItems=[]` → `hasSidebar=false` → sub nav 숨김. → metric: `grep "nav[0].key" project.ts` 0건 ✓
- [x] [validated] **main nav 클릭 부작용 해결 (부산물)** — activeSection 이 비면 MainNav 의 auto-expand useEffect 가 발동 안 해 모든 섹션이 초기 collapsed. 클릭 시 `navigateOnExpand=true` 기본값대로 `getFirstPageInSection` 으로 navigate. 즉 bug #1 수정이 bug #2 를 자동으로 해결. → metric: 같은 파일 수정으로 커버
- [x] [validated] **회귀 검증** — `pnpm --filter @openhow/viewer build` ✓ + `pnpm --filter @openhow/cli test run` 66/66 ✓. `DocPage.tsx:1019` 는 non-empty slug 가드로 홈 분기 경로 안 탐 — 무영향.

## Not

- **3-rail 동작 변경** — track/product/feature 레일 상태 로직은 건드리지 않음
- **sidebar config shape 변경** — 데이터 계약 유지
- **폭 조정** — `nav-rail-policy` 범위
- **모바일 drawer** — 별도 동작, 이 intent 범위 밖
- **MainNav 아이콘 도입** — three-rail-nav backlog 항목

## Footprint

- `packages/viewer/src/stores/project.ts:753-757` — home branch collapsed to `setSection('')` (−4 lines net)

## Backlog

- [ ] main nav 클릭 후 섹션 내부에서 sub nav 첫 아이템 auto-highlight
- [ ] 섹션 키 → 첫 문서 slug 매핑 유틸리티 공유화 (store 에서 계산)

## Learnings

### 2026-04-20: RecentItemsPanel 제거 (iteration 2)

- **[signal] 사용자 피드백**: workspace home 에서 `RecentItemsPanel`(최근 본 문서)과 "첫 섹션 sub nav 펼침" 이 **양쪽 다** 렌더돼 UX 혼동. "둘 중 하나"가 아니라 **둘 다 삭제** 결정 — sub nav 영역 통째로 제거가 `feedback_2rail_nav_sync` 원문 정책("홈에선 sub nav 숨김")과도 가장 일관
- **구조적 side effect**: `PublicationPreset` 은 `showThreePanel` / `showTwoPanel` / `hasSidebar-single` / `null` 4분기만 가지고 있어서, `hasSidebar=false && hasMainNav=true` 케이스가 `null` 로 떨어져 **메인 nav 까지 사라지는 회귀**. 원래는 `hasSidebar || isWorkspaceHomeWithMainNav` 로 강제 true 로 만들어 TwoPanel 로 렌더하고 sub 자리에 RecentItemsPanel 을 넣어 숨기던 셈. RecentItemsPanel 을 뺀 순간 이 enable trick 도 같이 사라져야 하지만 preset 레이아웃에 MainNav-only 브랜치가 없었음
- **처방**: `PublicationPreset` 에 `showMainNavOnly` 브랜치 + `.pub-preset-body--main-nav-only` 그리드(`--main-nav-width` + `1fr`) 추가. UnifiedLayout 은 `hasMainNav` prop 전달만. 이제 "mainNav-only" 가 1급 상태
- **파일 정리**: `RecentItemsPanel.tsx` / `RecentItemsPanel.css` / `useRecentDocs.ts` 삭제. `DocPage.tsx` 의 `record()` 호출 + import 제거. 스토리지 키(`openhow:recent-docs:*`)는 localStorage 에 잔존 — 기능 복원 없으니 자연 소멸

### 2026-04-20: build done (iteration 1)

- **1-file, 3-line fix**: 홈 분기 폴백 제거만으로 두 버그 동시 해결 — bug #2 는 bug #1 의 부산물이었음. 초기엔 MainNav/UnifiedLayout 에도 손을 대려 했지만 root cause 추적이 맞으면 최소 변경으로 충분
- **MainNav auto-expand 와 activeSection 폴백의 상호작용**: 홈에서 `nav[0].key` 폴백 → auto-expand 발동 → 사용자가 같은 key 클릭 시 `handleToggle` 이 collapse 분기로 빠져 navigate 안 됨. 폴백 제거 → auto-expand 안 함 → 클릭이 항상 expand+navigate 경로
- **Codex 위임 형태**: 3줄 수정도 prompt file + MUST NOT + VERIFY 를 갖춘 규격화된 위임으로 안전성 확보. 파일 1개, 라인 추적 가능

### 2026-04-20: seed created (iteration 1)

- **Background**: 사용자(잡돌쌤) clauders-book 로컬 serve 에서 2개 버그 동시 보고 — 홈에서 sub nav 노출, main nav 전환 시 sub nav 미갱신
- **Initial analysis**:
  - 버그 #1: `updateActiveSection` 홈 분기 (`segments.length === 0`) 가 `nav[0].key` 폴백 → activeSection 이 비어있지 않아 sub nav 렌더
  - 버그 #2 가설: MainNav `handleToggle` 이 expand-only 라 URL 이 바뀌지 않음 → activeSection 그대로 → sub nav 이전 섹션 유지. 또는 navigateOnExpand 기본값 동작이 실제 네비게이션까지 가지 않음
- **Scope**: 2파일 핵심 (`project.ts` store + `MainNav.tsx` or `UnifiedLayout.tsx`). 동작 스펙 명확, 탐색 불필요 — 빠르게 clarify 로 전환 가능
