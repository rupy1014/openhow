---
status: building
created: 2026-04-30
updated: 2026-04-30
iteration: 3
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
- [planned] **iter 3+**: SubSidebar heading 가시성 (SPA 는 hide), TOC/figure-sidecar 분기, mobile menu 동작 등 잔여 격차.

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

- `core/packages/cli/src/ssg/buildNavigation.ts` — `renderMainNavBadge()` helper 추가, `buildTwoPanelSidebarHtml` 에서 `params.sidebar['/{key}/']` 첫 그룹 `badge` 를 읽어 버튼 안에 렌더.
- `core/packages/cli/src/ssg/ssgStyles.ts` — `.ssg-main-nav-badge` 클래스 (SPA `.main-nav-badge` 와 px 일치), `.ssg-main-nav.ssg-main-nav--flat` selector specificity 우선 + `gap: 6px; padding: 14px 2px` (sidebar-inner 8px 와 합쳐 SPA 10px 매칭), `.ssg-main-nav-button` `line-height: normal` (SSG body 1.75 inherit 차단), 아이콘 폭 `1.2em`.

## Backlog

- [ ] iter 3: SubSidebar heading 가시성 — SPA 는 active section heading 을 hide. SSG `.ssg-sub-sidebar-heading` 도 hide 하거나 SPA 와 같은 스타일로.
- [ ] iter 4: figure-sidecar 분기 — figure 있는 페이지에서 SSG 는 TOC 옆에 figure-sidecar panel 도 보이는데 동작/위치 SPA 와 비교.
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
