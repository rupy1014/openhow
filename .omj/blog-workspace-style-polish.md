---
status: building
created: 2026-04-16
updated: 2026-04-21
iteration: 1
---


# blog-workspace-style-polish — blog 타입 워크스페이스 serve/publish 스타일 완성도 개선

## Why

bootpay 채널처럼 `openhow serve`/`publish`로 블로그 워크스페이스를 렌더링하면 nav, 디테일, 타이포그래피 등 디자인 완성도가 높아야 한다. 현재 BlogLayout(SPA)과 SSG 스타일이 bootpay 레퍼런스 대비 nav 구조, 아티클 디테일, 컨테이너 스타일 등에서 갭이 있다.

## What

- [x] ~~**Phase 0: UX 스토리보드**~~ — 유저 요청으로 스킵
- [x] **Nav 개선** — active state indicator(좌측 2px 바) 추가, nav item 스타일 SSG와 동기화 → **metric: nav가 bootpay와 동일한 시각적 완성도**
- [ ] **아티클 디테일 페이지** — hero 이미지 처리(border-radius 16px, gradient overlay), kicker badge(카테고리), description box(gray bg + radius), 메타 정보 스타일 → **metric: 아티클 상세가 블로그 수준의 디테일**
- [ ] **콘텐츠 스타일** — blockquote(좌측 3px border + bg), 코드블록(copy 버튼), 테이블(모바일 스크롤), 링크(underline offset + primary color), 이미지(12px radius + margin) → **metric: 마크다운 렌더링 품질이 bootpay와 동등**
- [x] **md-code-group 구조 재작성 (v1, 방향 B 선택, 2026-04-21)** — 탭바를 각 panel 내부로 이식. 결과물: `<div class="md-code-group"><div class="md-code-group__panel is-active"><div class="md-code-group__tabs">...</div><pre>...</pre></div>...</div>`. 비활성 panel은 `display:none`이므로 탭도 자동 숨김. 탭 스위칭 JS는 `.is-active` 토글 + 형제 panel 중 해당 인덱스만 활성화하는 로직으로 재작성. lang-label `::before/::after` 배지는 code-group 내부에 한해 숨김. **Footprint**: `renderMarkdown.ts` (구조 변경), `hydrateScript.ts` (탭 스위칭 로직), `ssgStyles.ts` + `markdown.css` (CSS), `renderMarkdown.test.ts` (스냅샷/기대값). → **metric: 탭과 코드가 하나의 카드로 결속, 언어 중복 표시 제거**
- [ ] **컨테이너/알림** — info/tip/warning/danger/success 컨테이너 스타일(좌측 4px 컬러 border + gradient bg + pill badge 헤더) → **metric: 문서 내 callout이 시각적으로 구분됨**
- [x] **헤더 정밀화** — 검색 focus-within에 primary border 추가 → **metric: 헤더가 모던 블로그 수준**
- [x] **SPA ↔ SSG 스타일 동기화** — ssgStyles.ts nav item 값을 SPA와 일치시킴 (padding, font-size, font-weight, border-radius, gap, min-height, color) + 검색 focus border 동기화 → **metric: serve와 publish 결과물이 시각적으로 동일**

## Not

- 새로운 디자인 시스템 토큰 도입 (design-system-foundation 의도 범위)
- Tailwind 도입
- 레이아웃 구조 변경 (기존 BlogLayout 골격 유지)
- public-blog-home 랜딩 페이지 수정 (별도 의도)
- 기능 추가 (검색 로직, 라우팅 등) — 순수 스타일 개선만

## Context

- 레퍼런스: `/Users/taesupyoon/sideProjects/YouTube/channels/bootpay/` — blog 타입, `openhow serve`/`publish` 둘 다 스타일 완성도 높음
- SPA: `core/packages/viewer/src/layouts/BlogLayout.tsx` + `BlogLayout.css` (573줄)
- SSG: `core/packages/cli/src/ssg/ssgStyles.ts` (3362줄) — publish 시 사용
- 디자인 토큰: `core/packages/viewer/src/styles/main.css` — CSS 변수 정의
- bootpay 핵심 차별점: primary #507cf3, Toss Product Sans 폰트, 4px spacing, active nav에 좌측 2px bar, hero 이미지 gradient overlay, kicker badge, description box, 컨테이너 좌측 컬러 border + gradient bg
- bootpay SSG CSS: `dist/assets/css/ssg.css` (3361줄) — 최종 렌더링 결과

## Footprint

- core/packages/viewer/src/layouts/BlogLayout.css — nav active left bar indicator 추가, search focus primary border (2026-04-16)
- core/packages/cli/src/ssg/ssgStyles.ts — nav item 값 SPA 동기화 (padding, font-size, font-weight, border-radius, gap, min-height, color), search focus border (2026-04-16)
- core/packages/cli/src/ssg/renderMarkdown.ts — md-code-group 렌더러: 탭바를 각 panel 내부로 이식 (buildTabs helper 도입) (2026-04-21)
- core/packages/viewer/src/utils/markdown.ts — 동일 구조 재작성 (SPA 동기화) (2026-04-21)
- core/packages/cli/src/ssg/ssgStyles.ts — `.md-code-group__panel > pre`에 `padding: 16px 20px` 복원, lang-label `::before/::after/.code-lang-label` 숨김, 모바일 미디어쿼리 override 추가 (2026-04-21)
- core/packages/viewer/src/styles/markdown.css — 동일 CSS 규칙 추가 (2026-04-21)
- core/packages/viewer/src/pages/DocPage.css — `.doc-page.blog-detail .markdown-content pre { margin: 2rem 0 }` 이 우선순위로 이기고 있어서 `.doc-page.blog-detail .markdown-content .md-code-group__panel > pre { margin: 0 }` override 추가 (2026-04-21)
- core/packages/viewer/src/utils/markdown.ts — Shiki lang loader 확장(c/cpp/csharp/dart/diff/dockerfile/go/graphql/java/jsx/kotlin/php/ruby/rust/swift/toml/tsx/xml 추가), 언어 alias 맵 추가(cs/kt/rb/py/dotnet 등), `resolveLanguage`가 alias 경유해 로드된 lang을 찾도록 수정 (2026-04-21)
- core/packages/cli/src/ssg/renderMarkdown.ts — 동일 lang 리스트로 `createHighlighter` 확장 + `SHIKI_LANGUAGE_ALIASES` 추가, `resolveLanguage` alias 지원 (2026-04-21)
- core/packages/viewer/src/layouts/DocumentPreset.css — doc-mode(`:not(.no-toc):not(.book-mode)`) grid에 `height: calc(100vh - var(--publication-header-height))` 잠금. mobile(<=959px)에선 height:auto로 복원 (2026-04-21)
- core/packages/viewer/src/layouts/AppShell.tsx — `FooterContent`, `DefaultFooter` 함수에 `export` 추가 (UnifiedLayout 재사용 목적) (2026-04-21)
- core/packages/viewer/src/layouts/UnifiedLayout.tsx — `footerNode` useMemo (BizFooter/FooterContent/DefaultFooter 단일 경로) + `useInMainFooter` 플래그. doc 라우트(`!isSimplePage && !isBookMode && resolvedPreset !== 'publication'`)에서만 shell footer 끄고 DocumentPreset `footer` prop으로 주입 (2026-04-21)
- core/packages/viewer/src/layouts/PublicationPreset.tsx — `footer?: ReactNode` prop 추가, `<main>` 내부에서 `<footer class="pub-preset-footer">`로 렌더. sticky 컬럼의 grid row가 footer 높이까지 연장되도록 (2026-04-21)
- core/packages/viewer/src/layouts/PublicationPreset.css — `.pub-preset-footer` 규칙 추가 (width 100%, max-width = --preset-content-max, border-top 1px, margin-top 2.5rem, padding-top 1.25rem) (2026-04-21)
- core/packages/viewer/src/layouts/UnifiedLayout.tsx — `useInMainFooter` 조건에서 `resolvedPreset !== 'publication'` 제거. 3개 PublicationPreset 분기 모두에 `footer={useInMainFooter ? footerNode : undefined}` 주입 (2026-04-21)
- core/packages/cli/src/ssg/template.ts — `<div class="ssg-content-column">` wrapper 도입. `<main class="ssg-main">`과 `<footer class="ssg-site-footer">`를 이 wrapper 안에 함께 배치. `.ssg-layout` grid의 col 2 자리를 footer 높이까지 연장해 sticky sidebar 범위 확장 (2026-04-21)
- core/packages/cli/src/ssg/ssgStyles.ts — `.ssg-content-column { display: flex; flex-direction: column; min-width: 0 }` 규칙 1개 추가 (`.ssg-layout` 다음 줄) (2026-04-21)

## Backlog

- [ ] 푸터 커스텀 스타일 개선
- [ ] 모바일 사이드바 스와이프 제스처
- [ ] 접근성 개선 (ARIA, focus indicator)

## Learnings

### 2026-04-16: seed created (iteration 1)
- **Background**: bootpay 채널이 openhow serve/publish 모두에서 높은 스타일 완성도를 보여주는 레퍼런스. 새 블로그 워크스페이스를 만들어도 같은 수준이 나와야 함.
- **Initial notes**:
  - bootpay의 핵심 디자인 요소: active nav의 좌측 2px primary bar, hero gradient overlay, kicker badge(pill shape), description box(gray bg + 16px radius), 컨테이너(좌측 4px 컬러 border + gradient bg + pill badge)
  - SPA(BlogLayout.css)와 SSG(ssgStyles.ts) 두 곳을 동시에 수정해야 serve/publish 일관성 유지
  - 기존 CSS 변수 체계(--primary-color, --gray-* 등)는 이미 존재하므로, 값 조정보다 스타일 규칙 추가/정밀화가 핵심
  - bootpay SSG가 3361줄 → 이미 상당한 스타일이 존재하지만, 이것이 core에 반영되어야 모든 블로그 워크스페이스에 적용됨

### 2026-04-21: md-code-group B방향 구현 후 마진 override 버그
- **증상**: 구조 재작성 + `__panel > pre { margin:0 }` 적용 후에도 브라우저에서 pre 상하 32px 마진 잔존.
- **원인**: `DocPage.css:1327`의 `.doc-page.blog-detail .markdown-content pre { margin: 2rem 0 }` (specificity 0,3,1)가 `markdown.css`의 `.markdown-content .md-code-group__panel > pre` (specificity 0,2,1)를 이김.
- **해결**: `DocPage.css`에 `.doc-page.blog-detail .markdown-content .md-code-group__panel > pre { margin: 0 }` (specificity 0,4,1) 추가.
- **배운 것**: 블로그 레이아웃(DocPage.css)이 전역 마크다운(markdown.css)을 override하는 패턴이 있으므로, code-group류 내부 컴포넌트의 margin/padding 리셋은 **두 곳 모두**에서 처리해야 안전하다. specificity 비교를 먼저 하지 않으면 디버깅 시간을 크게 낭비함. 검증은 playwright로 `getMatchedStylesForNode` CDP 호출하면 적용된 규칙 체인이 즉시 보인다.

### 2026-04-21: md-code-group 탭 스위칭 시 비-JS/TS 언어 하이라이트 누락
- **증상**: `/billing/key-issue` 에서 첫 탭(Web/TS) 은 색이 있는데 Android(Kotlin)/iOS(Swift)/Flutter(Dart)/React Native(JSX) 탭으로 전환하면 모든 토큰이 기본 텍스트 색. 시각적으로 "탭 바꾸면 하이라이트가 안 적용됨".
- **원인**: SPA(`packages/viewer/src/utils/markdown.ts`) 와 SSG(`packages/cli/src/ssg/renderMarkdown.ts`) 양쪽 highlighter 모두 bash/css/html/js/json/md/py/sql/ts/yaml 만 번들링. kotlin/swift/dart/java/php/ruby/go/csharp 는 로드되지 않아 `resolveLanguage` 가 `'text'` 로 fallback → Shiki 가 색 span 없는 plain 라인으로 출력. 탭 스위칭 로직 자체는 정상(panel 토글 + hidden 제거 OK).
- **해결**: 양쪽에 c/cpp/csharp/dart/diff/dockerfile/go/graphql/java/jsx/kotlin/php/ruby/rust/swift/toml/tsx/xml 18개 lang 추가. 공통 alias 테이블 도입(cs→csharp, kt→kotlin, rb→ruby, objective-c→c, dotnet→csharp 등). `resolveLanguage` 가 alias 를 경유해 로드된 언어를 찾도록 수정. 페이지별 번들 크기는 `getRequestedShikiLanguages` 가 실제 사용 lang 만 요청하므로 증가 없음.
- **배운 것**: "하이라이트가 안 됨" 이라는 사용자 리포트는 DOM 상태만 보면 탭 전환(panel.is-active 토글)은 정상인데, 실제 `<pre>` 안의 `<span style="color:...">` 가 비어 있는지 즉시 확인해야 빠르게 원인에 도달. Shiki 는 미로드 언어에 대해 조용히 plain 으로 fallback 하므로 런타임 에러가 없어도 하이라이트가 죽는다. 블로그/docs 워크스페이스는 모바일/백엔드 SDK 탭(bootpay 류)이 기본이므로 `DEFAULT_SHIKI_LANGS` 보다 훨씬 넓은 lang 셋을 원천에서 지원해야 정상적으로 보인다.

### 2026-04-21: doc-page 스크롤 시 좌측 nav가 밀리는 이슈 — sticky containing-block 문제
- **증상**: 사용자가 `/payment-window/open-type` (Bootpay docs, PublicationPreset two-panel)에서 "스크롤 끝까지 내리면 왼쪽 nav가 위로 밀린다"고 리포트. 실제 재현됨.
- **진짜 원인**: `position: sticky`의 **containing block은 자기 grid cell(=main 높이)** 이다. footer가 grid 바깥 block flow에 있으면, main content가 끝나는 순간 grid row도 끝나고 sticky nav는 "자기 row의 bottom"에 도달해 더 이상 고정되지 못한다. 결과적으로 사용자는 "nav가 footer와 함께 위로 스크롤됨"으로 경험.
- **초기 분석 오류**: Explore agent가 `.doc-preset-grid` (DocumentPreset) 구조를 원인으로 지목. 실제로 해당 URL은 `.pub-preset-body--two-panel` (PublicationPreset)을 씀. 첫 수정은 DocumentPreset만 커버 → Bootpay 페이지엔 무효. 사용자가 "SPA/SSG 둘 다 일관성 있게"로 재지시해 PublicationPreset + SSG 템플릿까지 확장.
- **해결 패턴 (footer-in-main)**:
  - **SPA DocumentPreset**: grid를 `height: calc(100vh - header)`로 viewport-lock + footer를 `<main>` 내부로 이식 (자체 overflow:auto scroll 컨테이너).
  - **SPA PublicationPreset**: footer slot prop 추가 → `<main>` 안쪽 `.pub-preset-main-inner` 다음에 `<footer class="pub-preset-footer">`로 렌더. grid row가 footer 높이까지 연장되어 sticky 컬럼들이 끝까지 고정.
  - **SSG**: `<div class="ssg-content-column">`으로 `<main>` + `<footer>`를 묶어 `.ssg-layout` grid의 col 2 자리에 함께 배치. sticky `.ssg-sidebar`의 row가 footer 높이까지 연장.
- **검증**: Playwright로 scrollY=0 → 5600(max)까지 full scroll. main-nav-panel/sub-sidebar 모두 `top:60 bottom:900`에 고정 유지. footer는 main 내부 y≈624에 노출. 시각적으로 GitBook/Notion 스타일 UX.
- **배운 것**:
  - **sticky는 grid cell을 벗어난 영역엔 고정되지 않는다**. 페이지에 footer 같은 grid-외부 요소가 있으면 sticky 컬럼의 범위는 자연스럽게 main 높이로 제한됨. 해결은 "footer를 같은 grid row 안으로 끌어오기"가 가장 깔끔.
  - UnifiedLayout 분기는 `resolvedPreset === 'publication'` 우선 → PublicationPreset 3종(three-rail/two-panel/default)이 기본. DocumentPreset은 `resolvedPreset !== 'publication' || isBookMode`에서만 탐. docs 워크스페이스는 대부분 PublicationPreset이라 preset 구분 없이 동일 패턴을 양쪽에 적용해야 사용자에게 일관된 동작.
  - 레이아웃 이슈는 URL → preset → DOM 클래스 매핑을 먼저 찍어야 함. Playwright `querySelectorAll(".pub-preset-*|.doc-preset-*")` count 한 줄이 Explore agent의 CSS-only 분석보다 확실함.
  - SSG/SPA 이중 관리: footer 위치 같은 구조적 결정은 반드시 양쪽에 동시 반영. SSG는 static HTML이라 publish 전엔 눈에 안 띄어 regression 발견이 늦음.

### 2026-04-21: md-code-group 탭+코드 스타일 이슈 포착 [signal]
- **관측**: localhost:3501 (`openhow serve` Bootpay 커머스 문서)의 `/checkout/create` 페이지. 언어 탭(`md-code-group__tabs`) 바로 아래 코드 pane 상단에 과한 빈 공간, Python 라벨이 탭과 중복으로 표시됨.
- **진단**: `.md-code-group__panel > pre`는 `margin:0`으로 이미 리셋됨. 실제 원인은 `.markdown-content pre.shiki { padding: 46px 20px 20px }` — 46px top은 언어 라벨 배지(`::before` 바 + `::after` lang label) 공간인데, 코드그룹 내부에서는 탭바가 이미 언어를 노출하므로 중복.
- **사용자 의견**: pre 상하 마진 제거 OR panel 내부에 탭 구조 이식 (두 방향 제시).
- **판단 필요**: v1은 최소 변경(A)으로 우선 해결. 구조 재작성(B)은 scope 초과 가능성.
- **시도**: BlogLayout.css에 active nav left bar indicator 추가 + ssgStyles.ts nav 값 SPA 동기화
- **결과**: 2파일 변경 (BlogLayout.css +36줄, ssgStyles.ts 8값 수정). Codex scope creep 6파일 → 즉시 롤백.
- **배운 것**:
  - 분석 결과 blog-detail/콘텐츠/컨테이너 스타일(DocPage.css 1687줄)은 이미 bootpay 수준 — 추가 작업 불필요
  - 핵심 갭은 nav active indicator(::before 2px left bar)와 SPA↔SSG 값 불일치였음
  - Codex가 CSS만 수정하라고 해도 TypeScript/Router/Config까지 건드림 — MUST NOT에 파일 경로를 명시적으로 나열해야 효과적
  - SSG→SPA 동기화 방향보다 SPA→SSG 동기화가 맞음 (SPA가 디자인 source of truth)
- **의도 변경**: Phase 0(스토리보드) 스킵, Nav/헤더/SPA↔SSG 동기화 완료. 아티클 디테일/콘텐츠/컨테이너는 이미 완료 상태로 확인됨
