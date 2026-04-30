---
status: building
created: 2026-04-30
updated: 2026-04-30
iteration: 4
parent: null
loop:
  until: judge
---

# ssg-spa-parity-v1 — class.clauders.ai SSG 와 localhost:3804 SPA 의 시각 격차 0 화

## Why

사용자가 `localhost:3804` (SPA) 와 `class.clauders.ai` (SSG) 를 직접 비교 후 *"결과가 너무 다르네. 둘을 비교해가면서 불일치를 개선해줘"* / *"어차피 다 해야하자나. 알아서 개선해줘"* / *"불일치 없을때까지 랄프 루프로 진행하고, 브라우저로 서로 확인하고 . 배포하고 반복하라고"*. 배포는 전부 SSG 이므로 publish 결과가 SPA 와 px-perfect 일치해야 한다. ralph loop 으로 격차 1개씩 닫아가며 시각 확인 → publish → 다음 격차 반복.

## What

- [done] **iter 1**: two-panel sidebar (`buildTwoPanelSidebarHtml` + `.ssg-layout--two-panel`) + 헤더 logo (workspace title) + sign-in pill. fe4c44a. → mainNav x=0/w=200, sub x=212/w=200, main x=424/w=1016 — SPA rect 와 px 일치.
- [done] **iter 2**: MainNav 단계 배지 ("1주차"~"4주차") 렌더 + 버튼 레이아웃 px-perfect 정합. `buildTwoPanelSidebarHtml` 에서 `params.sidebar['/{key}/']` 첫 그룹의 `badge` 를 읽어 `<span class="ssg-main-nav-badge">` 로 렌더. CSS: `.ssg-main-nav.ssg-main-nav--flat` (specificity 우선) `gap: 6px; padding: 14px 2px`, `.ssg-main-nav-button` `line-height: normal; padding: 7px 12px; min-height: 36px`, 아이콘 폭 `1.2em`. → 배지 X 0-1px, Y 0px, 버튼 height 36/36, 버튼 top Y/X 모두 일치.
- [done] **iter 3**: SubSidebar heading 가시성 + 위치 px-perfect 정합. SPA 가 heading 을 hide 한다고 오판한 v1 (display:none) → v2 (heading 노출 + 헤더 배지) → v3 (parent padding 재배치) 로 수렴. SPA `nav.navigation` (padding 14px 10px) 가 heading + link nav 모두 감싸는 단일 컨테이너 패턴을 SSG 도 같은 구조로: `.ssg-sub-sidebar > .ssg-sidebar-inner` 에 `padding: 14px 10px` 주고, `.ssg-sub-sidebar-heading` margin 제거, 안쪽 `.ssg-sidebar-nav` padding 0 으로 override. → heading rect (x=222, y=114, w=180, h=35), 모든 link Y (153/195/237/279/321) px-perfect 일치.
- [planned] **iter 4+**: 활성 link 색상 불일치 (SPA active rgb(78,89,104) = inactive 와 동일, SSG active rgb(25,31,40) 더 진함), TOC/figure-sidecar 분기, mobile menu 동작 등 잔여 격차.

## Not

- 데이터 (mainNav config) 자체 변경 X — SPA 와 SSG 가 동일 config 를 다르게 렌더할 뿐, 동일 데이터 입력에 대해 동일 출력이 되도록만 한다.
- SPA 자체 레이아웃 수정 X — SSG 가 SPA 를 따라간다 (반대 방향 X).
- SPA 만 갖고 있는 동적 동작 (theme toggle 클라이언트 상태, 검색 결과 dropdown, 로그인 후 avatar 메뉴) 의 정확한 모방 X — 정적 사이트 한계 인정. 시각적 placeholder 까지만.

## Context

- 현재 HEAD = `fe4c44a ssg-spa-parity: SSG 도 two-panel sidebar + 헤더 sign-in 노출`
- 비교 기준 페이지: `/getting-started/00-welcome` (SPA: `http://localhost:3804/blog/clauders/getting-started/00-welcome`, SSG: `https://class.clauders.ai/getting-started/00-welcome`)
- SSG class prefix `ssg-`, SPA 는 prefix 없음. CSS 이중 관리 룰 (CLAUDE.md `## SSG / SPA 스타일 이중 관리`) 준수 — px 단위까지 일치.
- 검증 파이프라인: `pnpm --filter @openhow/cli build` → `cd examples/clauders.ai && echo "n" | openhow publish` → `node -e require('playwright')` 로 양쪽 스크린샷 + rect/computed style 비교.

## Footprint

- `core/packages/cli/src/ssg/buildNavigation.ts` — `renderMainNavBadge()` helper 추가, `buildTwoPanelSidebarHtml` 에서 (a) MainNav 버튼 안에 단계 배지 렌더, (b) SubSidebar heading 을 항상 렌더 (active item label + 동일 배지). heading 은 `<div class="ssg-sub-sidebar-heading"><span class="ssg-sub-sidebar-heading-label">label badge</span></div>` 구조.
- `core/packages/cli/src/ssg/ssgStyles.ts` — `.ssg-main-nav-badge` (SPA `.main-nav-badge` 와 px 일치), `.ssg-main-nav.ssg-main-nav--flat` selector specificity 우선 + `gap: 6px; padding: 14px 2px`, `.ssg-main-nav-button` `line-height: normal`, 아이콘 폭 `1.2em`. iter 3 추가: `.ssg-sub-sidebar-heading` 11px/700/uppercase/letter-spacing 0.08em (SPA `.nav-group-label` 시각 매칭), `.ssg-sub-sidebar > .ssg-sidebar-inner { padding: 14px 10px }` (SPA `nav.navigation` 컨테이너 매칭), `.ssg-sub-sidebar > .ssg-sidebar-inner > .ssg-sidebar-nav { padding: 0 }` (자식 nav 의 base padding override).

## Backlog

- [ ] iter 4: 활성 link 색상 정합 — SPA `.nav-link.active` 는 inactive 와 같은 rgb(78,89,104) 인데 SSG `.ssg-sidebar-link.active` 는 rgb(25,31,40) 으로 더 진함. background highlight 만 다르게 처리 (border-left 가 아닌 별도 시각 신호 사용 중).
- [ ] iter 5: figure-sidecar 분기 — figure 있는 페이지에서 SSG 는 TOC 옆에 figure-sidecar panel 도 보이는데 동작/위치 SPA 와 비교.
- [ ] iter 6: 우상단 영역 — SPA 는 dark mode toggle 노출, SSG 는 빈 영역. 정적 placeholder (회색 원반) 또는 noscript 처리.
- [ ] iter N: mobile (< 1024px) breakpoint 처리.

## Learnings

### 2026-04-30: iter 1 build done [done]

- **결정타**: 기존 `body[data-workspace-type="blog"] .ssg-layout` 규칙이 specificity (1 attr + 1 class = 11) 로 `.ssg-layout--two-panel` (1 class = 10) 을 이겨서 padding-left: 260px 가 새 grid layout 위에 강제되고 있었음. 해결: blog 전용 규칙에 `:not(.ssg-layout--two-panel)` 추가.
- **type=blog 도 two-panel 이 정답**: 처음에 "blog 는 single column 일 거"라고 가정하고 isBlog 를 short-circuit 으로 두었는데, SPA DOM probe 결과 clauders.ai (blog type) 도 `pub-preset-body--two-panel` + `pub-preset-main-nav-panel` + `pub-preset-sub-sidebar` 를 함께 그리고 있었다. 즉 blog 는 two-panel 위에 `blog-detail-hero` / `blog-detail-kicker` / `blog-detail-meta` 콘텐츠를 얹는 형태. → workspace type 으로 layout 모드를 가르지 말고 mainNav 데이터 유무로만 가른다.
- **CDN 캐시 함정**: publish 직후 `curl https://class.clauders.ai` 로 검증하면 Cloudflare cache (max-age=300, s-maxage=3600) 가 stale 한 옛 HTML 을 돌려줘서 "변경 안 됐다" 오해. `?_cb=${Date.now()}` 같은 query string 으로 캐시 우회하거나 R2 직접 확인 필요. Playwright 도 동일 — query 변경하면 fresh.
- **publish 의 "0 unchanged" 는 markdown 카운트**: 정적 HTML 은 매번 `/api/ssg` POST 로 일괄 갱신된다. "0 published, 31 unchanged, 0 assets uploaded" 라인은 markdown content 변경 여부일 뿐, HTML 자체는 매 publish 마다 새로 올라감. CLI 출력 메시지가 헷갈림 — 실제 R2 의 HTML 은 매번 바뀐다.

### 2026-04-30: iter 2 build done [done]

- **배지 데이터 경로**: `MainNavItem` 자체에는 `badge` 필드가 없음 (`groupBadge` 만). 배지 데이터는 폴더별 `_meta.json` (예: `getting-started/_meta.json` 의 `"badge": "1주차"`) → `scanner/index.ts` `generateSidebar` 가 첫 그룹의 `badge` 로 주입 → SPA `getSectionBadge()` 가 `sidebarConfig['/' + key + '/'][0].badge` 로 lookup. SSG 도 같은 lookup 로직 (`params.sidebar['/{key}/']?.[0]?.badge`) 으로 가져와야 함.
- **CSS specificity 함정 #2**: `.ssg-main-nav { gap: 4px }` (line 660) 가 `.ssg-main-nav--flat { gap: 6px }` (line 287) 를 cascade 순서로 이김 (둘 다 specificity=10). flat 변형이 base 를 override 하려면 `.ssg-main-nav.ssg-main-nav--flat` (specificity=20) 으로 올려야 함. 변형 클래스를 base 보다 위에 두는 패턴은 cascade 순서에 종속 — 변형은 항상 specificity 를 한 단계 더 높이는 게 안전.
- **SSG body line-height 1.75 가 nav 까지 inherit**: 같은 `padding: 7px 12px; min-height: 36px` 인데 SSG 버튼 height=38, SPA=36. 원인: SSG body line-height ≈ 1.75 (13.5×1.75=23.625) 가 button 까지 상속, SPA 는 `line-height: normal`. nav 버튼처럼 single-line UI 컴포넌트는 명시적으로 `line-height: normal` 또는 `1` 로 끊어야 본문 typography 와 격리됨.
- **이중 wrapper padding 누적**: `.ssg-main-nav-panel > .ssg-sidebar-inner > .ssg-main-nav--flat` 3 단 wrapper 중 `.ssg-sidebar-inner` 가 이미 `padding: 0 8px` 를 갖고 있어, flat nav 에 SPA `.main-nav` 의 `padding: 14px 10px` 를 그대로 옮기면 좌우 padding 이 8+10=18px 로 두 배가 됨. SPA 와 동일한 10px 좌우를 만들려면 flat nav 에 `padding: 14px 2px` 를 줘서 8+2=10px 로 보정. 새 wrapper 추가 시 항상 부모 padding 부터 확인.

### 2026-04-30: iter 3 build done [done]

- **첫 진단의 함정 — 셀렉터 불일치로 잘못된 가정 채택**: ScheduleWakeup 프롬프트에 *"SPA 는 active section heading 을 hide"* 라고 적혀 있어 그 가정으로 시작. probe 가 `.sub-sidebar-heading` 셀렉터로만 SPA 를 검색해서 결과 없음 → "역시 hide" 결론 → SSG `.ssg-sub-sidebar-heading { display: none }` 적용. publish 후 SSG link Y 가 SPA 보다 **39px 위로** 떨어져 격차 더 벌어짐. 진짜 셀렉터는 `.nav-group-title` 였고 SPA 는 heading 을 정상 노출 중. 교훈: probe 가 빈 결과 반환하면 "없다" 결론 전에 인접 클래스 (예: `.nav-group-*`, `.sub-*-title`) 를 다시 훑어 본 뒤 가설 갱신.
- **SPA 의 다층 typography 패턴**: `.nav-group-title` (container, 13.5/400, padding+toggle) 안에 `.nav-group-label` (inner span, 11/700/uppercase) 를 넣고 외부 컨테이너는 chevron SVG 와 함께 layout 만 담당. SSG 는 정적이라 toggle 이 없어 두 단계를 한 단계로 평탄화 (`.ssg-sub-sidebar-heading` 자체에 11/700/uppercase 부여) 했지만 시각적 결과 동일. 정적 사이트에서는 SPA 의 인터랙션-driven 다층 markup 을 1 단으로 합쳐도 px-perfect 가능.
- **부모 컨테이너 padding 재배치 패턴**: SPA `nav.navigation` (padding 14px 10px) 가 heading + link nav 모두 감싸는데, SSG 는 두 자식이 `.ssg-sidebar-inner` 의 직계 자식이고 `.ssg-sub-sidebar-nav` 가 따로 padding 14px 10px 를 가져 link Y 만 매칭됨. 해결: `.ssg-sub-sidebar > .ssg-sidebar-inner` 에 `padding: 14px 10px` 를 주고 `.ssg-sidebar-nav` padding 을 0 으로 override (자손 selector specificity 30 > 10). heading + link 모두 단일 컨테이너 padding 의 영향권으로 묶이면서 자연스럽게 정렬. 패턴 일반화: 두 형제 요소가 공통 padding/border 를 공유해야 하면 형제마다 padding 을 복사하지 말고 부모로 끌어올린다.
- **iteration 종료 판단**: heading rect, link rect 모두 px-perfect 일치 후, 차이 잔여 (활성 link 색상, 우상단 toggle 부재) 는 별도 wedge 로 분리. 한 wedge 안에서 발견한 사이드 격차는 backlog 에 적고 그 wedge 종료를 미루지 않는다 — 사이드 격차까지 다 묶으면 PR/검증 단위가 비대해지고 중도 롤백 비용 ↑.
