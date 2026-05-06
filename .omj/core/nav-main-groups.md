---
status: done
created: 2026-04-22
updated: 2026-04-22
iteration: 1
---

# nav-main-groups — MainNav 항목을 섹션 라벨로 그룹핑

## Why

`@openhow/types`의 `SidebarGroup`은 `text + items[]` 로 sub nav 의 그룹핑을 이미 지원한다. 그런데 `MainNavItem`은 `key/label/icon/path/divider/order`만 있고 **그룹 개념 자체가 타입에 없다**. 결과: main nav 는 항목이 7개를 넘어가기 시작하면 시각적으로 한 덩어리가 되어 눈이 훑기만 할 뿐 카테고리 판단이 안 된다.

재현 워크스페이스 — `/Users/taesupyoon/sideProjects/youtube/channels/bootpay-contents/blog/_meta.json`:
```
결제 도입 / 결제 상품 / 링크페이 / 구독 / 커머스 / 운영 / AI 활용
```
7개 모두 평평. 독자는 `결제` 영역 4개와 `판매 운영` 영역 2개, `심화` 1개의 성격 차이를 라벨만 보고 구분해야 함 — 메뉴가 IA 역할을 못 함.

sub nav 는 이미 그룹 헤더를 지원하니 **같은 시각 언어로 main nav 에도 올리자** 가 요청의 핵심. 3-rail 을 새로 추가하는(`three-rail-nav` iter 1, done) 해결이 아니라, **같은 레일 안에서 섹션 라벨** 만 붙이는 최소 범위 — Why 축이 다름.

## Context

**부모 intent**:
- `core/three-rail-nav.md` (iter 1, done) — 별도 L1 Track 레일로 계층을 올린 해결. 이 intent 는 Track 을 쓰지 않는 2-rail 워크스페이스(blog 포함)에서 main nav 자체를 분절하는 직교 접근.
- `core/nav-rail-policy.md` (iter 1, clarified) — 2-rail 폭 정책. 본 intent 는 폭 정책 유지 위에 섹션 헤더 라인만 추가.
- `core/nav-2rail-sync.md` (iter 2, done) — sub nav 동기화. 본 intent 와 상태 로직 직교.

**현재 타입 (실측)**:
- `core/packages/types/src/navigation.ts:10-17` `MainNavItem` — `{ key, label, icon, path, divider, order }`. 그룹 필드 없음.
- `core/packages/types/src/navigation.ts:19-24` `SidebarGroup` — `{ text, items, collapsed, badge }`. 그룹 헤더 + 접힘 지원.

**현재 렌더링 (실측)**:
- `core/packages/viewer/src/components/MainNav.tsx` 132- — `items.map` 한 번에 flat 렌더. 항목마다 `section-btn` + inline sub items 뿐.
- `core/packages/cli/src/scanner/index.ts:220-278` `generateMainNav` — root `_meta.json.nav[]` 그대로 또는 1단 폴더 스캔. 그룹 개념 없음.

**재현 `_meta.json` 예상 shape (확정)**:
```json
{
  "nav": [
    { "key": "payment-intro",    "label": "결제 도입", "icon": "📚", "group": "결제",      "order": 0 },
    { "key": "payment-products", "label": "결제 상품", "icon": "💳", "group": "결제",      "order": 1 },
    { "key": "payment-link",     "label": "링크페이",  "icon": "🔗", "group": "결제",      "order": 2 },
    { "key": "subscription",     "label": "구독",     "icon": "🔄", "group": "결제",      "order": 3 },
    { "key": "commerce",         "label": "커머스",    "icon": "🛒", "group": "판매 운영",  "order": 4 },
    { "key": "operations",       "label": "운영",     "icon": "⚙️", "group": "판매 운영",  "order": 5 },
    { "key": "ai",               "label": "AI 활용",   "icon": "🤖", "group": "심화",      "order": 6 }
  ]
}
```

**제약**:
- sub nav (`SidebarGroup`) 동작 무변화 — 본 intent 는 main nav 한정
- `divider: true` 기존 항목과 병존 (legacy path 유지)
- MainNav 클릭 동선(`navigateOnExpand`, `inlineSubItems`) 불변
- SSG 경로 영향 확인 필요 — main nav 가 SSG 에도 렌더되는지는 What 1-1 에서 검증

## What

- [validated] **Phase 0: SSG 영향 조사** — `packages/cli/src/ssg/buildNavigation.ts` 에 두 개 경로 존재: `buildSidebarHtml` (generic) + `buildBlogSidebarHtml` (blog). 둘 다 `mainNav` 를 순회하며 HTML 생성 — group 렌더 양쪽 모두 필요. `ssgStyles.ts` 이중 관리 대상 확인. → **metric: `grep "MainNav" packages/cli/src/ssg` → 16+ 히트, 양쪽 경로 수정 범위 확정** ✓
- [validated] **`MainNavItem` 에 `group?: string` 추가** — `packages/types/src/navigation.ts:17` 에 `group?: string` optional. → **metric: types 빌드 ✓, viewer 빌드 ✓, cli 테스트 71/71** ✓
- [validated] **Scanner pass-through** — `packages/cli/src/scanner/index.ts:24` `FolderMeta.nav[]` 타입에 `group?: string` 추가 + L220 `generateMainNav` 매핑에 `group: item.group` 전달. → **metric: cli 테스트 66→71 (+5 신규: 그룹 헤더 동작 + ungrouped 리셋)** ✓
- [validated] **MainNav 섹션 헤더 렌더 (SPA)** — `MainNav.tsx` `items.map` 앞에 `lastGroup` 트래커 + `Fragment` 로 synthetic divider 주입. 연속된 같은 group 에는 헤더 1회, ungrouped item 은 run 을 종료시켜 다시 헤더 출력. `divider: true` 는 lastGroup 건드리지 않음. → **metric: viewer 빌드 ✓ + MainNav.tsx diff 108 lines** ✓
- [validated] **라벨 스타일 (SPA + SSG 이중 관리)** — 신규 CSS 는 blog SSG 전용 `.blog-nav-section-header` (14px padding, 11px uppercase, text-tertiary) 한 블록만. SPA + generic SSG 는 기존 `.main-nav-divider` + `.divider-label` / `.ssg-main-nav-divider` + `.ssg-divider-label` 재사용. → **metric: CSS 신규 블록 1개 (+15 lines), 기존 스타일 0 변경** ✓
- [validated] **blog `_meta.json` 재편** — 7항목에 group 필드 추가: 결제(payment-intro/products/link/subscription) · 판매 운영(commerce/operations) · 심화(ai). → **metric: JSON +7/-7 (같은 구조 유지, group 필드만 추가)** ✓
- [validated] **회귀 검증 + review 반영** — `pnpm --filter @openhow/cli test run` 71/71 ✓, `pnpm --filter @openhow/viewer build` ✓. Codex review 에서 지적된 "ungrouped item 이 group run 을 끊어야 함" P2 이슈 fix + 전용 테스트 추가. 기타 리뷰 지적(DocPage selector, hydrateScript)은 본 intent 범위 밖 pre-existing 수정사항. → **metric: 71/71 pass, review 재실행 없이 로컬 확인** ✓

## Not

- **접히는 그룹 (collapsible)** — 유저 요청으로 제외 (2026-04-22, "접히는거 말고 그룹핑만 하면 돼"). 그룹 헤더는 정적 라벨. chevron/click/state 없음.
- **그룹 자체에 링크/네비게이션** — 섹션 헤더는 순수 라벨. 클릭 이벤트 바인딩 금지.
- **sub nav (`SidebarGroup`) 구조 변경** — 범위 밖. sub nav 는 이미 그룹 지원.
- **3-rail 도입** — `three-rail-nav` 범위. 본 intent 는 **같은 2-rail 안에서** 의 그룹핑.
- **`divider: true` 제거** — 기존 항목 병존. group 과 divider 둘 다 쓰는 경우는 비권장이지만 엄격 금지는 아님.
- **중첩 그룹 (그룹 안에 그룹)** — 1단 그룹만. 더 깊어지면 `three-rail-nav` 를 쓰라는 신호.
- **자동 그룹 추론** — 폴더 prefix/깊이로 자동 묶기 금지. `_meta.json` 에 명시적으로 선언해야만 동작.
- **mobile drawer 동작 변경** — 기존 그대로. 그룹 헤더가 drawer 에 어떻게 보일지는 What 검증 단계에서 자연 확인.

## Footprint

**2026-04-22 iter 1 build**
- `core/packages/types/src/navigation.ts` — `MainNavItem.group?: string` 추가 (+1 line)
- `core/packages/cli/src/scanner/index.ts` — `FolderMeta.nav[]` 타입 확장 + pass-through (+2/-1)
- `core/packages/viewer/src/components/MainNav.tsx` — lastGroup 트래커 + Fragment synthetic divider (+108/-56)
- `core/packages/cli/src/ssg/buildNavigation.ts` — `buildSidebarHtml` + `buildBlogSidebarHtml` 양쪽 parts[] 루프 변환 (+124/-56)
- `core/packages/cli/src/ssg/buildNavigation.test.ts` — 신규 (87 lines, 5 tests: generic no-group byte-stable · generic grouped · generic ungrouped reset · blog grouped · blog no-group)
- `core/packages/cli/src/ssg/ssgStyles.ts` — blog 전용 `.blog-nav-section-header` CSS 블록 (+15 lines, 기타 변경은 pre-existing 이 intent 범위 밖)
- `youtube/channels/bootpay-contents/blog/_meta.json` — 7항목에 `group` 필드 (+7/-7)

**Test coverage**: 71/71 pass (+5 신규). `clauders-book` / `openhow.io` 등 group 없는 기존 워크스페이스는 DOM 무변화(byte-stable 테스트로 보장).

## Backlog

- 그룹 `icon` 지원 (요청 시)
- 그룹 `badge` 지원 — `SidebarGroup.badge` 와 동일한 의미론
- 접힘 기능 — 그룹 수 10+ 넘어가면 재등장할 수 있음. kill 이 아니라 deferred.

## Learnings

### 2026-04-22: seed created (iteration 1)
- **Background**: `MainNavItem` flat 구조라 7+ 항목 워크스페이스(blog)에서 IA 표현 불가. sub nav 는 이미 그룹 지원 — 동일 시각 언어를 main nav 에도 얹자.
- **Why 축 확인**: `three-rail-nav`(별도 Track 레일 추가)와 다른 축. Track 없이 같은 레일 안에서 라벨만 분절 — 최소 범위.
- **UI 결정 (2026-04-22)**: 고정 섹션 라벨로 확정. 접힘/네비게이션 없음 — "접히는거 말고 그룹핑만 하면 돼" (user). 접힘은 Backlog.
- **스키마 결정**: `MainNavItem.group?: string` attribute-only 접근. 중첩 객체(`{group, items[]}`)가 아닌 이유 — 기존 scanner 로직 변경 최소화 + order 정렬과 자연 호환.

### 2026-04-22: iter 1 build done
- **렌더 경로 2개 모두 수정 필요** — Phase 0 조사 결과: SSG 는 `buildSidebarHtml` (generic, `<details>` 기반) + `buildBlogSidebarHtml` (blog, flat `<a>` 기반) 둘로 분기. 각 경로의 CSS 도 별도(`.ssg-main-nav-divider` vs `.blog-nav-group`). 결과: SPA 1 + SSG 2 = 3곳에 lastGroup 트래커 + 헤더 주입.
- **Review 에서 발견한 contract hole**: 초안은 `group` 이 truthy 일 때만 `lastGroup` 업데이트 → ungrouped item 이 group run 을 못 끊음. `A(X) → B(no group) → C(X)` 에서 두 번째 X 헤더가 안 나옴. 수정: non-divider 이면서 group 없는 item 은 `lastGroup = undefined` 리셋. `divider: true` 는 여전히 lastGroup 보존 (manual divider 가 group 내부에 박혀도 헤더 중복 안 함).
- **CSS 이중 관리 최소화**: blog SSG 만 전용 클래스(`.blog-nav-section-header`) 필요했고 나머지는 기존 divider 스타일 재사용으로 해결. CSS 이중 관리 대상은 1개 블록만 (user CLAUDE.md "px 단위 일치" 규칙 적용 불필요 — SPA blog 는 동일 DOM 을 React 로 렌더하지 않고 SSG 전용이라 별도 SPA 스타일 불필요).
- **Codex review 의 다른 P2 지적(DocPage selector / hydrateScript)은 pre-existing 작업** — 이 intent 범위 밖이라 건드리지 않음. 해당 issue 는 별도 intent 로 다뤄야 함.
