---
status: building
created: 2026-04-30
updated: 2026-04-30
iteration: 9
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
- [done] **iter 4**: blog-detail 본문 width SPA 와 동일하게 (840px). 사용자 신고 *"toc 가 있으면 본문 width 가 줄어든다"*. 원인 3 단: (1) SSG 가 blog 에서도 `aside.ssg-toc-wrap` 렌더 → SPA 는 `pub-preset-right-aside { display: none }` (blog detail 은 TOC 미노출). (2) `.ssg-main` `padding-left: 48px` (SPA 0). (3) `.blog-detail` `padding: 0 1.5rem 0` (SPA 0). 해결: `template.ts` 에서 `isBlog && tocHtml` 조건 추가해 blog 는 TOC HTML 자체를 출력하지 않음. `.ssg-layout--two-panel .ssg-main { padding-left: 0 }` 추가. `.blog-detail` `padding: 0`. → article rect (x=428, w=840) px-perfect 매치.
- [done] **iter 5**: sub-sidebar active link 색상 정합. SPA 는 `.nav-link.active` 자체가 없고 모든 nav-link 가 `rgb(78,89,104)` 동일 색상 — sub-sidebar 에서는 active 링크를 시각적으로 구분 안 함. SSG 는 `.ssg-sidebar-link.active` 가 `rgb(25,31,40)` (더 진함) + 2px×16px `::before` 마커로 강조. 해결: `.ssg-sub-sidebar` 자손 한정 override 규칙 추가 (`.ssg-sub-sidebar .ssg-sidebar-link.active { color: var(--gray-700); background: transparent }` + `::before { content: none }`). primary sidebar 의 active 동작은 그대로 유지. → SSG active 링크 color `rgb(78,89,104)` + content:none, SPA 와 동일.
- [done] **iter 6**: blog-detail 헤더 3 격차 — (1) 날짜 위치 (SPA 상단 / SSG 하단), (2) subtitle 필드 (SPA `hook` / SSG `description`), (3) subtitle 스타일 (SPA `.doc-hook` 파란 tint card / SSG `.doc-description` 회색 박스). 해결: `template.ts` `blogHeaderHtml` 에서 meta 를 hero 위로 이동 + `hook` 우선 → fallback `description`, `BlogHeaderInfo` 에 `hook` 필드 추가, `buildHtml.ts` 가 `page.frontmatter.hook` 전달, `ssgStyles.ts` 에 `.doc-hook` (clamp(1.2rem,2vw,1.45rem) / fw 600 / primary 7% tint bg) + `.blog-detail-meta-top` 추가. → 헤더 시각 구조 SPA 와 일치 (image y=141 vs SPA 153, 12px micro-diff 만 잔여).
- [done] **iter 7**: blog-detail 헤더 잔여 12px micro-diff. probe 결과 SPA `.doc-title-actions` h=32px (action 버튼 4개 row), SSG `.blog-detail-meta-top` h=20px (text-only). hero y 차이는 row height 차이 12px 가 전부. 해결: `.blog-detail-meta-top` 에 `display: flex; align-items: center; min-height: 32px` 추가 — action 버튼 없어도 같은 row 높이 유지. → SSG hero y=152 = SPA y=152 px-perfect.
- [planned] **iter 8+**: docs/wiki 워크스페이스 TOC 렌더 검증, mobile breakpoint, action 버튼 (share/version/copy-md) 구현 여부.

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
- `core/packages/cli/src/ssg/template.ts` — `tocSection` 분기에 `!isBlog` 조건 추가. blog workspace 면 TOC HTML 을 출력하지 않음 (SPA `pub-preset-right-aside { display: none }` 매칭). iter 6: `BlogHeaderInfo.hook` 필드 추가, `blogHeaderHtml` 에서 meta 를 hero 위로 이동 + hook 우선 → description fallback (`.doc-hook` p / `.doc-description.blog-detail-summary` p), `.blog-detail-meta-top` 클래스로 상단 meta 식별.
- `core/packages/cli/src/ssg/buildHtml.ts` — iter 6: `blogHeader` 에 `hook: page.frontmatter.hook` 추가 (string 검증 후).
- `core/packages/cli/src/ssg/ssgStyles.ts` — iter 7: `.blog-detail-meta-top` 에 `display: flex; align-items: center; min-height: 32px` (SPA `.doc-title-actions` row height 매칭).
- `core/packages/cli/src/ssg/buildNavigation.ts` — iter 8: SubSidebar heading 에 `<svg class="ssg-toggle-icon ssg-toggle-icon--expanded" .../>` 데코레이션 chevron 추가 (SPA `.toggle-icon.expanded` 와 동일 markup, SSG 는 정적이라 토글 동작 없이 expanded 상태 고정).
- `core/packages/cli/src/ssg/ssgStyles.ts` — iter 8: `.ssg-toggle-icon` (`color: var(--gray-400)`, `flex-shrink: 0`) + `.ssg-toggle-icon--expanded { transform: rotate(90deg) }` 추가 (SPA `.toggle-icon` 색/회전 1:1 매칭).
- `core/packages/cli/src/ssg/ssgStyles.ts` — `.ssg-main-nav-badge` (SPA `.main-nav-badge` 와 px 일치), `.ssg-main-nav.ssg-main-nav--flat` selector specificity 우선 + `gap: 6px; padding: 14px 2px`, `.ssg-main-nav-button` `line-height: normal`, 아이콘 폭 `1.2em`. iter 3: `.ssg-sub-sidebar-heading` 11px/700/uppercase/letter-spacing 0.08em (SPA `.nav-group-label` 시각 매칭), `.ssg-sub-sidebar > .ssg-sidebar-inner { padding: 14px 10px }`, `.ssg-sub-sidebar > .ssg-sidebar-inner > .ssg-sidebar-nav { padding: 0 }`. iter 4: `.ssg-layout--two-panel .ssg-main { padding-left: 0 }` (SPA 와 동일 좌측 정렬), `body[data-workspace-type="blog"] .blog-detail { padding: 0 }` (24px 좌우 패딩 제거). iter 5: `.ssg-sub-sidebar .ssg-sidebar-link.active` 한정 color `var(--gray-700)` + background transparent + `::before { content: none }` override (primary sidebar active 는 보존).

## Backlog

- [ ] iter 9: action 버튼 (share/version/copy-md) — 정적 사이트에서 share 만 client JS 로 가능, version/copy-md 는 인증/API 의존이므로 시각 placeholder 만.
- [ ] iter 10: docs/wiki 워크스페이스의 TOC 렌더 검증 — iter 4 는 blog 만 끄도록 처리. docs/wiki 는 TOC 노출이 정상이므로 grid layout 도 SPA 와 일치하는지 별도 probe (현재 clauders.ai 에는 published docs workspace 없음 → blocked).
- [ ] iter N: mobile (< 1024px) breakpoint.

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

### 2026-04-30: iter 4 build done [done]

- **사용자 신고로 발견한 새 wedge 우선순위 변경**: 원래 iter 4 plan 은 활성 link 색상 (iter 3 backlog) 였는데 사용자가 *"toc 가 있으면 본문 width 가 줄어든다"* 라고 더 큰 시각 격차를 지적해서 우선순위 변경. 사용자가 직접 본 격차는 backlog 의 색상 미세조정보다 항상 위에 둔다. 색상은 iter 5 로 deferred.
- **3 단 격차 누적**: 본문 width SPA 840 vs SSG 474 (366px 차이) 의 원인이 단일 CSS 가 아닌 3 layer 누적이었음. (1) blog 워크스페이스에서 TOC 노출 자체 (SPA 는 hide), (2) `.ssg-main` `padding-left: 48px`, (3) `.blog-detail` `padding: 0 24px`. 한 번에 한 layer 만 고치고 probe 로 측정하면서 진행 — 첫 fix (TOC 제거) 후 752, 두 번째 (main 좌측 padding) 후 792, 세 번째 (blog-detail 좌우 padding) 후 840 px-perfect. 누적 격차는 layered debugging 이 잡기 쉬움.
- **`pub-preset-right-aside { display: none }` 신호**: SPA blog detail 페이지에서 TOC 컨테이너가 DOM 엔 있되 hide 되어 있음. body class `pub-preset-body--has-right-aside` modifier 까지 붙어 있음에도 hide. 이건 SPA 가 layout 모드는 right-aside 를 켜놨지만 컨텐츠가 없거나 blog 타입이라 가려놓은 것. SSG 는 같은 효과를 데이터 미생성 (HTML 자체에 aside 안 넣기) 으로 달성. CSS hide vs HTML omit 두 접근이 px-perfect 면에서는 동등.
- **probe-driven 사용자 신고**: 사용자가 정성적으로 *"본문 width 줄어든다"* 라고 한 신고를 probe 로 정량화 (SPA 840 vs SSG 752 → 88px 부족) 한 뒤 layer 별 원인을 잘라가며 잡았다. 정성 신고 → 정량 측정 → layered fix 가 ralph loop 의 표준 step.

### 2026-04-30: iter 5 build done [done]

- **잘못된 SSG URL 패턴으로 첫 probe 가 SPA 잡음**: ScheduleWakeup 프롬프트에는 `/blog/clauders/getting-started/00-welcome` (SPA URL) 만 적혔고 SSG URL 도 같은 패턴이라 가정. 실제 SSG 는 `https://class.clauders.ai/getting-started/00-welcome` (workspace prefix 없음, `/blog/` segment 없음). 잘못된 URL 로 probe 하면 SPA 의 React 라우터가 catch-all 로 잡아 비어 있는 (404 API 호출만 하는) SPA HTML 을 반환 → "DOM 비었음" 오류. 교훈: SSG URL 은 항상 `class.<custom-domain>/<page-slug>` 형태이며 workspace 이름은 host 에 흡수되어 있다.
- **active 시각 신호 = 색상 vs 위치 분리 패턴**: SPA 가 active link 를 hover/focus 외에 아예 시각 구분을 안 하는 (전부 동일 색) 패턴은 처음 봤을 때 "버그 아닌가?" 싶지만, 실제 sub-sidebar 는 좌측 main-nav 의 group selection 으로 위치 신호가 이미 들어가 있어 그 안에서 또 강조하면 시각 노이즈가 누적. SSG 도 같은 철학을 따라야 함. 정적 시각 신호의 누적 방지 패턴.
- **자손 selector 로 scope 격리**: `.ssg-sidebar-link.active` 가 primary + sub 양쪽 모두에 적용되는 generic 규칙. iter 5 에서는 sub 만 중립화하고 primary 는 그대로 둬야 했음. 해결: `.ssg-sub-sidebar .ssg-sidebar-link.active` (specificity=20 > 10) 으로 자손 한정 override. 부모 wrapper class 로 scope 가르는 패턴은 single-rule 광역 변경보다 안전 — 의도치 않은 site-wide 영향 없음.

### 2026-04-30: iter 6 build done [done]

- **DOM 카운트 격차는 SPA 의 다중 nav variant 때문 (false positive)**: iter 5 마지막 probe 가 SPA `nav.navigation` 10개 / SSG 5개 라고 보고했으나, 실제로 SPA 는 mobile/drawer/floating 등 4 variant 의 nav 를 모두 DOM 에 두고 visibility 만 다르게 처리. visible link 는 양쪽 5개 동일. 교훈: querySelectorAll 카운트만 보지 말고 visible rect (x,y > 0) 로 필터링하거나 단일 wrapper (`.ssg-sub-sidebar` / `nav.navigation:first`) 만 비교.
- **frontmatter `hook` vs `description` 필드 분리**: SPA `DocPage.tsx` 가 `currentFrontmatter.hook` 우선 → `currentDocument.description` fallback 으로 처리하면서 `description` 은 OG/SEO meta 전용으로 분리한 패턴. SSG 가 `description` 만 읽고 hook 은 무시했었음. 해결: `BlogHeaderInfo.hook` 추가, `buildHtml.ts` 에서 `page.frontmatter.hook` 직접 전달. SPA 와 SSG 가 같은 frontmatter 를 처리해야 한다면 frontmatter 의 모든 필드 매핑을 명시적으로 따라가야 한다 — 한 쪽이 추가 필드를 쓰면 다른 쪽도 즉시 따라가야 격차 안 생김.
- **헤더 요소 순서 (date 위치)**: SPA 는 `.doc-title-actions` row 안에 date 를 share/version/copy 버튼과 같이 두고 그 row 가 hero 위에 위치. SSG 는 정적 사이트라 action 버튼이 없지만 date 는 같은 위치 (hero 위) 로 옮겨야 시각 일치. 결과: blog-detail-meta 를 두 변형으로 (`.blog-detail-meta` body 내, `.blog-detail-meta-top` hero 위) 갖되 date 는 -top 쪽으로 이동. action 버튼은 별도 wedge (iter 9) 로 분리 — 데이터 fetch / API 의존성이 있는 기능은 정적 사이트 시각 placeholder 만 만들거나 deferred.
- **CSS card token 차이**: `.doc-hook` (SPA) 은 `var(--publication-card-radius-lg, 18px)` + `color-mix(... primary 7%, bg)`, `.doc-description` (SSG) 은 `border-radius: 16px` + `var(--gray-100)`. 같은 텍스트가 어느 클래스로 가는지에 따라 시각 톤이 완전히 달라지는 패턴 — SSG 가 텍스트를 .doc-description 으로 wrap 하고 있던 게 핵심 격차였다. 클래스 선택만 바꾸면 시각 톤이 한 번에 정렬됨.

### 2026-04-30: iter 7 build done [done]

- **action 버튼이 없는 정적 사이트의 row height 보존**: SPA `.doc-title-actions` 는 share/version/copy-md/slide 4개 SVG 버튼 (각 32×32px) 이 들어가는 flex row 라서 자연 높이 32px. SSG 는 같은 위치에 date 텍스트만 있는 `.blog-detail-meta-top` 으로 대체 — 텍스트 line-height 때문에 자연 높이 20px 만 됨. 결과: 후속 hero/title 모두 12px 위로 당겨짐. 해결: `min-height: 32px` 명시 + flex centering. 정적 사이트가 동적 사이트의 시각 격을 맞추려면 빈 자리도 같은 공간을 차지해야 — 컨텐츠 부재가 layout 위치까지 흔들지 않게 row 높이를 명시적으로 lock.
- **단일 CSS 라인으로 12px 닫음**: 누적 cascade 가 아닌 단일 컴포넌트 height 규칙 한 줄이면 충분한 micro-diff 였음. probe 가 row height (h=20 vs 32) 를 정확히 노출해줘서 한 번에 적중. 12px 미세 격차는 padding/margin/transform 누적으로 추적이 어려운 경우가 많지만, 시각 단위 컴포넌트 (row/buttons) 의 자연 높이 차이가 원인이면 단일 min-height 으로 닫힘.

### 2026-04-30: iter 8 build done [done]

- **SubSidebar heading chevron 데코레이션**: SPA `.nav-group-title` 에 `<svg class="toggle-icon expanded">` chevron 이 12×12 / `var(--gray-400)` (rgb 176,184,193) 으로 항상 노출. expanded 상태에서 90deg 회전 (`>` → `v`). SSG 는 sub-sidebar heading 에 chevron 자체가 없어서 우측 빈 공간이 시각 격차로 남아 있었음. 해결: `buildNavigation.ts` heading template 에 동일 SVG markup + `.ssg-toggle-icon{--expanded}` CSS 클래스 추가. 정적 사이트라 토글 동작은 없지만 expanded 고정 상태로 시각만 1:1 매칭.
- **정적 site 의 데코레이션 vs 인터랙션 분리 패턴**: SPA chevron 은 토글 버튼 역할 + 시각 indicator 역할 두 가지를 동시 수행. SSG 는 토글 동작이 없으므로 시각 indicator 만 빌려옴. 동작-시각 결합된 SPA 컴포넌트를 SSG 에 옮길 때는 동작은 떼고 시각 측면만 가져와도 px-perfect 가능. 비기능 데코레이션을 추가한다는 거부감 < 시각 격차 0 이라는 목표 — px-perfect 컨텍스트에서는 후자가 우선.
- **server-side publish 차단**: iter 8 변경을 publish 하려 했으나 `openhow.io` API `/api/workspaces` 가 HTTP 500 (Internal Server Error) 를 반환. CLI 변경은 무관 — 직접 `curl /api/workspaces` 도 500. 로컬 빌드 / template 변경은 검증 완료, live class.clauders.ai 반영은 server 복구 후 재 publish 필요. iter 8 코드 변경은 commit + footprint 등록까지 완료, probe 검증만 deferred. 교훈: ralph loop 의 publish→probe 단계가 외부 dependency (live API) 에 묶여 있으면 변경 자체와 검증이 분리될 수 있다 — 변경 commit 은 진행하고 검증 deferred 로 표시.
