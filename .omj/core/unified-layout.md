---
status: done
created: 2026-04-15
updated: 2026-04-16
iteration: 10
---

# unified-layout — 통합 레이아웃 + type/layout 개념 분리

## Why

blog workspace와 나머지 workspace의 스타일 갭이 크다. 원인은 BlogLayout/MainLayout이 완전히 분리된 CSS 네임스페이스와 디자인 토큰을 사용하기 때문. 레이아웃(배치)만 바꾸고 싶은데 스타일(시각적 톤)까지 달라지는 문제. 기존 블로그를 망가뜨리지 않으면서 점진적으로 일관성을 확보해야 한다.

**디자인 기준: BlogLayout이 완성도가 더 높다. 통합 셸은 BlogLayout 품질을 기준선으로 삼고, 나머지 타입을 끌어올린다.**

## Context

### 현재 레이아웃 구조 (3개 독립 레이아웃)

| 레이아웃 | 라우트 | CSS 네임스페이스 | 헤더 높이 | max-width |
|----------|--------|-----------------|----------|-----------|
| BlogLayout | `/blog/:ws`, 커스텀 도메인 | `.blog-*` | `--publication-header-height: 60px` | `--publication-shell-max: 1360px` |
| MainLayout | `/`, `/d/:ws/*`, `/w/:ws` | `.header`, `.content-grid`, `.main-*` | `--publication-header-height` (이미 blog 토큰 사용!) | `--content-max-width: 768px` |
| AdminLayout | `/dashboard` | `.admin-*` | 별도 | 별도 |

### 이미 공유되는 것
- `main.css`의 시맨틱 토큰은 이미 전역 공유: 컬러, 서피스, 보더, 섀도, 라디우스, 모션
- MainLayout.css `.header`가 이미 `--publication-header-height` 참조
- 두 레이아웃 모두 MainNav, Navigation 같은 공유 컴포넌트 사용

### 실제로 다른 것 (갭의 원인)
1. **헤더 구조**: Blog=3-column grid (brand|search|actions), Main=flex (left|center|right) + 로그인/로케일/리딩모드 등
2. **콘텐츠 영역**: Blog=flex(sidebar+main), Main=CSS grid(nav+sidebar+content+toc)
3. **푸터**: Blog=커스텀 가능(소셜 링크 등), Main=고정 비즈니스 정보
4. **검색**: Blog=인라인 드롭다운, Main=/search 페이지 라우트
5. **CSS 클래스 네이밍**: 완전히 다른 네임스페이스

### type vs layout 개념
- **type** = 기능적 역할 (blog, docs, course, team, wiki, project)
- **layout** = 시각적 배치 (publication, document 등)
- DocPage의 `isBlogRoute` 분기는 type 기반 콘텐츠 렌더링 → layout 통합과 별개, 유지

### 핵심 제약
- 블로그 커스텀 도메인 운영 중 — 기존 BlogLayout 절대 망가뜨리면 안 됨
- 점진적 마이그레이션 필수 (빅뱅 리팩토링 금지)
- 각 Phase별 기존 레이아웃 병행 운영 → 롤백 가능

## What

### Phase 0: 타입 정의 (타입만, 리스크 제로) ✅
- [x] `config.ts`에 `LayoutPreset` 타입 추가 (`'publication' | 'document'`)
- [x] `TYPE_TO_DEFAULT_LAYOUT` 매핑 테이블 (blog→publication, docs→document 등)
- [x] `MdshareConfig`에 `layout?: LayoutPreset` 옵션 필드 추가

### Phase 1: AppShell 추출 (새 컴포넌트, 기존 안 건드림) ✅
- [x] `AppShell.tsx` — BlogLayout의 헤더 구조(3-column grid) 기준으로 공통 셸
  - 헤더: brand slot + 중앙 검색(인라인 드롭다운) + actions slot
  - 푸터: 커스텀 가능(FooterConfig) + fallback(Powered by openhow)
  - 테마 토글, 다크모드 래퍼
  - BlogLayout의 헤더/푸터 CSS를 `app-shell-*`로 리네이밍하여 복제
- [x] `AppShell.css` — BlogLayout.css의 헤더/푸터 스타일 기반

### Phase 2: 레이아웃 프리셋 (AppShell에 꽂는 slot) ✅
- [x] `PublicationPreset` — BlogLayout의 body 영역 추출 (sidebar + main, 카테고리 nav)
  - slot-based: sidebar, mainNavPanel, subSidebarPanel, mobileSidebarContent
  - single-panel + two-panel 모드 지원
  - 모바일 사이드바 (backdrop + drawer + ESC + body scroll lock)
- [x] `DocumentPreset` — MainLayout의 content-grid 추출 (nav + sidebar + content + toc)
  - slot-based: mainNav, sidebar, toc, footer, progressBar
  - 4가지 그리드 변형 (1~4 columns) + no-toc
  - 반응형: 1279px(TOC 숨김), 959px(단일 컬럼)
- [x] 각 프리셋은 AppShell의 children으로 렌더링

### Phase 3: 라우터 전환 (실제 교체, 가장 신중하게) ✅
- [x] 새 workspace 생성 시 `UnifiedLayout(AppShell + preset)` 기본 적용
- [x] 기존 `/blog/` 라우트는 BlogLayout 유지 (opt-in 전환)
- [x] `/d/`, `/w/` 라우트에서 MainLayout → UnifiedLayout + DocumentPreset 전환
- [x] 커스텀 도메인 blog은 BlogLayout 유지 (가장 보수적)

### Phase 4: 완성도 상승 (2026-04-16, iteration 2) ✅
- [x] **Width 토큰 의미 기반 재정의** — `--content-reading-max(720)` / `--content-landing-max(1080)` / `--content-wide-max(1200)` / `--content-full-max(=shell)` 신설, 기존 `--content-max-width`·`--publication-article-max`·`--publication-landing-max`는 legacy alias
- [x] **PresetContentWidth 타입 + type별 매핑** — `TYPE_TO_DEFAULT_CONTENT_WIDTH` 신설 (blog/docs=article, course/team=landing, wiki/project=wide). `MdshareConfig.contentWidth?` 옵션 필드 추가
- [x] **프리셋 contentWidth 수용** — DocumentPreset·PublicationPreset 모두 `contentWidth` prop 받아 `--preset-content-max` CSS 변수로 inner max-width 적용. PublicationPreset에 `.pub-preset-main-inner` 래퍼 신설하여 doc/pub 경로 간 본문 폭 통일
- [x] **DocPage `.blog-detail` 하드코딩 제거** — `max-width: var(--publication-article-max)` 블록 삭제, 프리셋이 폭을 결정. 결과: 같은 문서의 `/d/` vs `/blog/` 렌더링 폭 일치
- [x] **UnifiedLayout resolve 확장** — `resolvedContentWidth` useMemo 추가 (config.contentWidth > TYPE 기본 > 'article') → 두 프리셋에 prop 주입
- [x] **메인 마케팅 홈 신설** — `MarketingHome.tsx` 추가 (Home.css 고아 스타일 재활용: hero/steps/ws/ai/devtools/cta). `Home.tsx`의 guest 분기가 `PublicBlogHome` → `MarketingHome`로 교체. 블로그 피드는 `/feed` 라우트로 이관

### Phase 5: 구조 정리 (2026-04-16, iteration 3) ✅
- [x] **SSG CSS 토큰 동기화** — `ssgStyles.ts`의 `:root`에 `--content-reading-max/--landing-max/--wide-max/--full-max/--content-max-width` 신설 + `--publication-article-max/--publication-landing-max/--content-max` legacy alias. viewer `main.css`와 값 일치
- [x] **Footer 통합** — AppShell에 `BizFooter` 컴포넌트 + `footerSlot` prop 신설. UnifiedLayout의 인라인 `unified-footer-inner` JSX 제거, DocumentPreset `footer` prop 주입 제거 → AppShell footer로 단일화. 결과: Publication 경로에서도 biz footer 노출, DocumentPreset의 `footer` slot은 커스텀 용도로만 예약
- [x] **Mobile Sidebar 통합** — `useMobileSidebar(open, onClose)` 공유 훅 신설 (ESC + body scroll-lock). DocumentPreset에 `mobileSidebarOpen/onMobileSidebarClose/mobileSidebarContent/mobileSidebarTitle` props 추가, `.doc-preset-mobile-*` 드로어 내재. UnifiedLayout의 외부 `.mobile-sidebar` aside + backdrop 제거, 구조 관련 CSS(`.mobile-sidebar*`)도 제거. 컨텐츠 클래스(`.mobile-nav-link/--divider`)는 두 preset에서 공용으로 유지
- [x] **MarketingHome 폴리시 + OG** — `index.html`에 `og:type/title/description/url/locale` + Twitter `summary_large_image` + `theme-color` + `keywords` 메타 추가. MarketingHome `useEffect`로 locale별 `document.title`·`description` 동기화 + `html[lang]` 토글. 카피 다듬기 (heroSubtitle·CTA·workspaces·devtools·ctaTitle)

### Phase 10: 헤더 토큰 통일 + 비-blog 패리티 가드 (2026-04-16, iteration 10) ✅
- [x] **SSG 헤더 토큰 통일** — `ssgStyles.ts`의 `.ssg-header`/`.ssg-sidebar`가 사용하던 `var(--header-height)` 3곳을 전부 `var(--publication-header-height)`로 전환. 더 이상 참조되지 않는 `--header-height: 60px` 토큰 선언 삭제. SPA는 이미 `--header-height(56px)`를 Login/Onboarding fallback으로만 쓰고, 실제 헤더 레이아웃은 전부 `--publication-header-height(60px)` 기반이라 SSG를 SPA 실제 렌더링과 토큰 단위로 일치
- [x] **비-blog `--content-max` 패리티 테스트 추가** — `blog-style-parity.test.ts`에 `SSG workspace-type → content-max cascade` describe 블록 신설. `@openhow/types`의 `TYPE_TO_DEFAULT_CONTENT_WIDTH`를 import해서 `article`→`--content-reading-max`, `landing`→`--content-landing-max`, `wide`→`--content-wide-max`, `full`→`--content-full-max` 매핑 보장. `:root` 기본값도 `article` 프리셋과 일치 보장(blog/docs/book가 cascade 규칙 없이도 720px 상속). docs/course/wiki/project/team 타입 전용 패리티 테스트가 없던 공백을 메움 (40/40 green)

### Phase 9: SSG ↔ SPA 시각 패리티 (2026-04-16, iteration 9) ✅
- [x] **SSG 타입별 본문 폭 매핑** — `ssgStyles.ts`의 `:root`에 type-resolved `--content-max`를 두고, `body[data-workspace-type="course|team"] { --content-max: var(--content-landing-max) }` / `wiki|project { --content-max: var(--content-wide-max) }` 오버라이드 추가. SPA `TYPE_TO_DEFAULT_CONTENT_WIDTH`와 동일한 매핑 (blog/docs=720, course/team=1080, wiki/project=1200)
- [x] **SSG 본문 패딩 정렬** — `.ssg-main { padding: clamp(2rem, 4vw, 3.5rem) }` → `var(--publication-start-offset) 48px 96px`. SPA DocumentPreset의 `.doc-preset-content-inner` 패딩과 동일
- [x] **SSG biz footer 추가** — `template.ts`에 `buildFooterHtml(workspaceType)` 신설하여 `.ssg-layout` 뒤에 `<footer class="ssg-site-footer">` 렌더. blog 타입은 "Powered by openhow" fallback(SPA BlogLayout default footer), 나머지는 biz footer(리쪼/사업자등록번호/이용약관/개인정보처리방침/Pricing/GitHub — SPA UnifiedLayout BizFooter와 동일). `ssg-site-footer-*` 스타일 추가 (색상/레이아웃 토큰은 SPA AppShell `app-shell-footer-biz-*`와 1:1 매칭)
- [x] **SSG 정리** — 미사용 `.ssg-header-btn/-outlined/-primary` 블록(~40줄) 삭제, 미사용 `.ssg-group-title` co-selector(3곳) 제거
- [x] **`.blog-nav-sub-item` padding 보정** — SSG의 `0.5rem 0.8rem` → `0.5rem 0.85rem`으로 수정하여 SPA BlogLayout과 px 단위까지 일치
- [x] **`ssgStyles.test.ts` search assertion 최신화** — stale `border-color: transparent` 검사를 `color-mix(in srgb, var(--primary-color) 45%, transparent)` (SPA BlogLayout와 일치)로 업데이트
- [x] **패리티 테스트 인프라 수정** — `blog-style-parity.test.ts`의 `extractRuleBodies`가 @media/@print/@supports 블록을 flat regex로 스캔해 `.blog-mobile-menu-btn display`가 @print의 `display: none !important`를 집어오던 버그를 `stripAtRuleBlocks` 헬퍼(브레이스-밸런스드)로 수정. base(screen) 선언만 비교하게 됨 → 38/38 green
- [x] **모바일 패딩·TOC 브레이크포인트 정렬** — `.ssg-main`의 모바일 패딩을 `padding-top: 1rem`(부분 덮어쓰기)에서 SPA DocumentPreset의 `calc(var(--publication-start-offset) - 0.5rem) 16px 60px`으로 전량 교체, `@media (max-width: 960px)`를 SPA 기준 `959px`로 맞추고, TOC 숨김 쿼리도 `1280px`→`1279px`로 정렬 (SPA DocumentPreset.css와 px 단위 일치)

### Phase 8: 레거시 제거 + 스크롤 컨테이너 셀렉터 복구 (2026-04-16, iteration 8) ✅
- [x] **MainLayout 완전 삭제** — `layouts/MainLayout.tsx` (592줄) + `layouts/MainLayout.css` (688줄) 제거. iteration 3에서 router가 UnifiedLayout으로 교체된 이후 어떤 모듈도 MainLayout을 import하지 않았음 (주석 2곳만 잔존)
- [x] **TableOfContents / ReadingProgressBar 스크롤 컨테이너 셀렉터 교체** — 두 컴포넌트 모두 `.main-content`(MainLayout 전용)를 하드코딩 → `.doc-preset-content`(DocumentPreset)으로 변경. TOC 활성 하이라이트와 북모드 진행바가 `/d/*` 경로에서 드디어 동작
- [x] **레거시 immersive 레이아웃 CSS 잔재 정리** — MainLayout 전용 셀렉터 (구 immersive 모드 chrome-hide 블록) 삭제. DocumentPreset.css 가 이미 동일 책임을 대체. 유지: 진행바 / 타이틀 행 / immersive 페이지 타이포 규칙 (당시 페이지 뷰 컴포넌트가 사용)
- [x] **잔존 주석 정리** — `router.tsx:197` "no MainLayout" → "not wrapped by UnifiedLayout", `DocumentPreset.css:1` "extracted from MainLayout" → "content grid (nav + sidebar + content + toc)"
- [x] **Home.tsx 불필요 import 제거** — `import './Home.css'` 삭제. `.home*` 클래스는 MarketingHome에서만 사용, Home 컴포넌트는 스타일 없이 WorkspaceDocs/WorkspaceHub/MarketingHome으로 분기만 함

### Phase 7: 통합 워크스페이스 홈 — type 무관 일관된 landing (2026-04-16, iteration 5) ✅
- [x] **type별 분기 제거** — `RootIndex`가 `customWorkspaceType==='blog'`일 때만 `<WorkspaceDocs />`를 렌더하던 로직 제거. 이제 `customWorkspace`가 있으면 type과 무관하게 항상 `<WorkspaceDocs />` 렌더
- [x] **Home 로컬 모드 Navigate 제거** — `Home.tsx`가 `defaultLocalDocumentPath`로 `<Navigate />`하던 로직을 `<WorkspaceDocs />`로 교체. 서브 경로 없이 진입한 모든 custom workspace가 실제 홈 화면을 갖게 됨
- [x] **WorkspaceDocs auto-redirect 축소** — `workspace.type === 'blog'` branch의 early return 그대로 유지되지만, 비-blog 타입(`docs`/`wiki`/`project`/`team` 등)이 `navigate(first doc, { replace: true })` 되던 로직 삭제. `learning`은 `loadCourses` 유지
- [x] **랜딩 렌더를 모든 타입으로 확장** — `isBlog && documents.length > 0` 게이트를 `landingEnabled = !loading && documents.length > 0 && !isLearningWorkspace`로 완화. `sorted`는 blog일 때만 `createdAt` 기준 날짜 정렬, 나머지는 menu/sortOrder 기준. docBase도 type에 따라 `/blog/:ws` vs `/d/:ws` 분기
- [x] **카테고리 그리드/레이블 중립화** — `blogCategories` useMemo의 `!isBlog` 게이트 제거(docs workspace에서도 섹션 카드 렌더), 레이블 `전체 아티클`/`개의 아티클` → `{allLabel}`/`{countSuffix}` (`isBlog ? '아티클' : '문서'`), `getEyebrow`의 default도 type에 따라 분기. team-blog 변형은 `isBlog && isTeamBlog` 로 여전히 blog 전용으로 제한

### Phase 6: 동적 페이지 메타 + OG 이미지 바인딩 (2026-04-16, iteration 4) ✅
- [x] **`useDocumentMeta` 훅 신설** — `viewer/src/hooks/useDocumentMeta.ts`. `title/description/ogImage/ogType/ogUrl/canonical/locale` 옵션을 받아 `<title>`, `<meta name/property>`, `<link rel="canonical">`, `html[lang]`을 원자적으로 업서트. 언마운트 시 이전 값/요소 생성 여부를 역순 복원. SPA 네비게이션에서 브라우저 탭 + 사후 크롤러 스크레이프 일관성 확보
- [x] **첫 이미지 추출 유틸** — `utils/extractFirstImage.ts`. 렌더된 HTML에서 `data:` URI·`emoji/icon/avatar` 클래스를 제외하고 첫 의미 있는 `<img src>`를 추출. 순수 문자열 파싱으로 SSR/SPA 양쪽 호환
- [x] **DocPage OG 바인딩** — `useDocumentMeta({ title, description, ogImage, ogType:'article', ogUrl, canonical })`. `ogImage` 우선순위: (1) `frontmatter.thumbnail` (2) `document.thumbnail` (3) 첫 md 이미지 (4) `workspace.ogImageUrl` (5) worker `/og/:ws/:slug`. 상대경로는 `window.location.origin` 기반으로 절대화. 기존 `savedTitleRef` + `useEffect(title)` 제거
- [x] **MarketingHome 훅 전환** — 인라인 `useEffect` 제거, `useDocumentMeta` 사용. `ogImage`/`ogUrl`/`canonical`을 현재 origin 기반으로 주입 (`/og/home` 동적 엔드포인트)
- [x] **index.html OG 기본값** — `og:image`, `og:image:width/height`, `twitter:image`를 `https://openhow.io/og/home`으로 고정. 크롤러 초기 HTML 스크레이프에서도 이미지 노출

## Not

- BlogLayout 삭제 (Phase 3 이후에도 fallback으로 당분간 유지)
- MainLayout의 로그인/아바타/로케일 기능 제거 (AppShell actions slot에 합류)
- 빅뱅 스타일 리팩토링
- Tailwind 도입
- AdminLayout 통합 (별도 인텐트)
- SSG CSS 동기화 (후속)
- DocPage의 `isBlogRoute` 분기 변경 (type 기반 콘텐츠 렌더링은 유지)

## Footprint
- core/packages/cli/src/ssg/ssgStyles.ts — `.ssg-header`/`.ssg-sidebar`의 `var(--header-height)` 3곳을 `var(--publication-header-height)`로 전환, 미사용 `--header-height: 60px` 토큰 선언 삭제 (SPA 실제 헤더 토큰과 일치) (2026-04-16, iteration 10)
- core/packages/cli/src/ssg/blog-style-parity.test.ts — 비-blog workspace-type 패리티 테스트 추가. `TYPE_TO_DEFAULT_CONTENT_WIDTH`(@openhow/types)와 SSG body[data-workspace-type] --content-max cascade 일치 검증 + :root 기본값이 article 프리셋과 일치 보장 (2026-04-16, iteration 10)
- core/packages/cli/src/ssg/ssgStyles.ts — type-resolved `--content-max` + body[data-workspace-type] 오버라이드, `.ssg-main` 패딩을 DocumentPreset 기준(`var(--publication-start-offset) 48px 96px`)으로 정렬, `.ssg-site-footer*` 스타일 추가, 미사용 `.ssg-header-btn*`/`.ssg-group-title` 제거, `.blog-nav-sub-item` padding `0.8rem → 0.85rem`, 모바일 `@media 960px → 959px`와 `.ssg-main` 모바일 패딩을 SPA DocumentPreset과 일치, TOC 숨김 쿼리 `1280px → 1279px` (2026-04-16, iteration 9)
- core/packages/cli/src/ssg/blog-style-parity.test.ts — `stripAtRuleBlocks` 헬퍼 추가하여 @media/@print/@supports를 `extractRuleBodies` 전에 제거. base(screen) 선언만 비교하므로 `.blog-mobile-menu-btn display` false positive 제거 (2026-04-16, iteration 9)
- core/packages/cli/src/ssg/template.ts — `buildFooterHtml(workspaceType)` 신설, 모든 페이지 HTML 하단에 타입별 footer 주입 (blog=Powered by openhow, 나머지=biz footer) (2026-04-16, iteration 9)
- core/packages/cli/src/ssg/ssgStyles.test.ts — search focus border-color assertion을 SPA BlogLayout 동등 값(`color-mix`)으로 업데이트 (2026-04-16, iteration 9)
- core/packages/viewer/src/layouts/MainLayout.tsx — **삭제** (592줄). iteration 3 이후 import 없음 (2026-04-16, iteration 8)
- core/packages/viewer/src/layouts/MainLayout.css — **삭제** (688줄). MainLayout.tsx 전용 (2026-04-16, iteration 8)
- core/packages/viewer/src/components/TableOfContents.tsx — 스크롤 컨테이너 셀렉터 `.main-content` → `.doc-preset-content` (TOC 활성 하이라이트 복구) (2026-04-16, iteration 8)
- core/packages/viewer/src/components/ReadingProgressBar.tsx — 기본 prop `.main-content` → `.doc-preset-content` (북모드 진행바 복구) (2026-04-16, iteration 8)
- core/packages/viewer/src/styles/ — 레거시 immersive 모드 CSS 의 MainLayout 전용 셀렉터 블록 삭제. 진행바/타이틀 행/immersive 페이지 타이포 규칙은 유지 (2026-04-16, iteration 8)
- core/packages/viewer/src/router.tsx — 주석 `no MainLayout` → `not wrapped by UnifiedLayout` (2026-04-16, iteration 8)
- core/packages/viewer/src/layouts/DocumentPreset.css — 주석 `content grid extracted from MainLayout` → `content grid (nav + sidebar + content + toc)` (2026-04-16, iteration 8)
- core/packages/viewer/src/pages/Home.tsx — 사용하지 않는 `import './Home.css'` 삭제. Home 컴포넌트 자체는 스타일 없이 분기만 하고, `.home*` 클래스는 MarketingHome 전용 (2026-04-16, iteration 8)
- core/packages/viewer/src/layouts/BlogLayout.tsx — two-panel 모드에서 `<main>` + `<footer>`를 `.blog-main-col` 플렉스 래퍼로 감싸고 footer를 body 내부(col 3)로 이동. 비-two-panel 모드는 footer를 body 바깥에 유지(기존 동작). footer JSX를 `footerNode` 상수로 추출해 중복 제거 (2026-04-16, iteration 7)
- core/packages/viewer/src/layouts/BlogLayout.css — `.blog-main-col` 추가(flex column, `min-height: calc(100vh - header)`, `flex: 1 1 auto` 상속받는 `.blog-main`은 `min-height: 0`으로 리셋), `.blog-main-col > .blog-footer`에 `border-top` 추가 (2026-04-16, iteration 7)
- core/packages/viewer/src/layouts/BlogLayout.tsx — two-panel sub 패널에 active 섹션 타이틀 추가, 단일 그룹일 때 group-title 자동 숨김, 그룹 필터링 단일화, **홈 활성/sub 그룹 없음일 때 sub aside 내부 content만 미렌더(컬럼 자리는 유지) + `aria-hidden`** (2026-04-16, iteration 6)
- core/packages/viewer/src/layouts/BlogLayout.css — `.blog-sidebar-sub-title` 추가(baseline 정렬용 섹션 헤더), `.blog-nav-group-title` 캡션 스타일 신설, `.blog-sidebar-sub .blog-nav-sub { margin:0 }`으로 two-panel 내 2rem 들여쓰기 제거, sub-item active 배경 강화 + left bar 14px/opacity 0.7, 다크모드 대응 추가 (2026-04-16, iteration 6)
- core/packages/viewer/src/pages/workspace/WorkspaceDocs.tsx — 비-blog 자동 redirect 제거, landing 렌더 게이트 `isBlog` → 모든 type, 정렬/라벨/카테고리 그리드 type 중립화, docBase type별 분기 (2026-04-16, iteration 5)
- core/packages/viewer/src/pages/Home.tsx — local mode Navigate 제거, `<WorkspaceDocs />` lazy 렌더로 교체 (2026-04-16, iteration 5)
- core/packages/viewer/src/router.tsx — `RootIndex` 의 `customWorkspaceType==='blog'` 분기 삭제, `customWorkspace`만 있으면 무조건 `<WorkspaceDocs />` (2026-04-16, iteration 5)
- core/packages/viewer/src/hooks/useDocumentMeta.ts — SPA용 공유 meta 훅 (title/description/og:*/twitter:*/canonical/html[lang], 언마운트 복원) (2026-04-16, iteration 4)
- core/packages/viewer/src/utils/extractFirstImage.ts — 렌더된 HTML에서 첫 의미 있는 이미지 src 추출 (2026-04-16, iteration 4)
- core/packages/viewer/src/pages/DocPage.tsx — `useDocumentMeta` 적용, `ogImage` 우선순위(프런트매터 thumbnail → doc.thumbnail → 첫 md 이미지 → workspace OG → /og/:ws/:slug), `savedTitleRef`/title-only useEffect 제거 (2026-04-16, iteration 4)
- core/packages/viewer/src/pages/MarketingHome.tsx — 인라인 `useEffect` 제거, `useDocumentMeta` 사용 (og:image=`/og/home`) (2026-04-16, iteration 4)
- core/packages/viewer/index.html — 기본 `og:image`/`og:image:width`/`og:image:height`/`twitter:image`를 `/og/home` 동적 엔드포인트로 지정 (2026-04-16, iteration 4)
- core/packages/cli/src/ssg/ssgStyles.ts — `:root` 섹션에 width 토큰 신설 + legacy alias 동기화 (2026-04-16, iteration 3)
- core/packages/viewer/src/hooks/useMobileSidebar.ts — 공유 ESC+scroll-lock 훅 (2026-04-16, iteration 3)
- core/packages/viewer/src/layouts/AppShell.tsx,css — `BizFooter` 컴포넌트 + `footerSlot` prop, `.app-shell-footer-biz-*` 스타일 (2026-04-16, iteration 3)
- core/packages/viewer/src/layouts/DocumentPreset.tsx,css — mobile drawer props 내재, `.doc-preset-mobile-*` 스타일 추가 (2026-04-16, iteration 3)
- core/packages/viewer/src/layouts/PublicationPreset.tsx — 공유 훅 호출로 교체 (2026-04-16, iteration 3)
- core/packages/viewer/src/layouts/UnifiedLayout.tsx — 인라인 `unified-footer-*` + 외부 `.mobile-sidebar` aside 제거, BizFooter 연결, DocumentPreset에 mobile drawer props 주입 (2026-04-16, iteration 3)
- core/packages/viewer/src/layouts/UnifiedLayout.css — 미사용 `.unified-footer-*` + `.mobile-sidebar*` 구조 스타일 제거 (content class는 유지) (2026-04-16, iteration 3)
- core/packages/viewer/index.html — OG/Twitter/theme-color/keywords 메타 추가 (2026-04-16, iteration 3)
- core/packages/viewer/src/pages/MarketingHome.tsx — 카피 폴리시 + locale별 `document.title`·description 동기화 + `html[lang]` 토글 (2026-04-16, iteration 3)
- core/packages/types/src/config.ts — `LayoutPreset` 타입, `TYPE_TO_DEFAULT_LAYOUT` 매핑, `MdshareConfig.layout` 필드 추가 (2026-04-15); `PresetContentWidth` 타입, `TYPE_TO_DEFAULT_CONTENT_WIDTH` 매핑, `MdshareConfig.contentWidth` 필드 추가 (2026-04-16)
- core/packages/viewer/src/styles/main.css — `--content-reading-max`/`--content-landing-max`/`--content-wide-max`/`--content-full-max` 의미 기반 토큰 + legacy alias 정리 (2026-04-16)
- core/packages/viewer/src/layouts/DocumentPreset.tsx,css — `contentWidth` prop + `--preset-content-max` CSS 변수 (2026-04-16)
- core/packages/viewer/src/layouts/PublicationPreset.tsx,css — `contentWidth` prop + `.pub-preset-main-inner` 래퍼 + `--preset-content-max` (2026-04-16)
- core/packages/viewer/src/layouts/UnifiedLayout.tsx — `resolvedContentWidth` useMemo + 양 프리셋에 prop 주입 (2026-04-16)
- core/packages/viewer/src/pages/DocPage.css — `.doc-page.blog-detail { max-width: 720 }` 하드코딩 블록 삭제 (2026-04-16)
- core/packages/viewer/src/pages/MarketingHome.tsx — 신규 마케팅 랜딩 (Home.css 스타일 재활용) (2026-04-16)
- core/packages/viewer/src/pages/Home.tsx — guest 분기 PublicBlogHome → MarketingHome 교체 (2026-04-16)
- core/packages/viewer/src/router.tsx — `/feed` 라우트 추가하여 PublicBlogHome 이관 (2026-04-16)
- core/packages/viewer/src/layouts/AppShell.tsx — 통합 셸 (헤더 3-column grid + 검색 + 푸터 + 테마) (2026-04-15)
- core/packages/viewer/src/layouts/AppShell.css — BlogLayout 헤더/푸터 기반 `app-shell-*` 스타일 (2026-04-15)
- core/packages/viewer/src/layouts/PublicationPreset.tsx — BlogLayout body 영역 추출, slot-based (sidebar + two-panel + mobile) (2026-04-15)
- core/packages/viewer/src/layouts/PublicationPreset.css — `pub-preset-*` 스타일, 반응형 1279px/767px (2026-04-15)
- core/packages/viewer/src/layouts/DocumentPreset.tsx — MainLayout content-grid 추출, slot-based (nav + sidebar + content + toc) (2026-04-15)
- core/packages/viewer/src/layouts/DocumentPreset.css — `doc-preset-*` 스타일, 반응형 1279px/959px (2026-04-15)
- core/packages/viewer/src/layouts/UnifiedLayout.tsx — AppShell + DocumentPreset 조합, MainLayout 비즈니스 로직 포팅 (2026-04-15)
- core/packages/viewer/src/layouts/UnifiedLayout.css — 로고/액션/아바타메뉴/모바일사이드바/푸터 스타일 (2026-04-15)
- core/packages/viewer/src/router.tsx — RootLayout에서 MainLayout → UnifiedLayout 교체 (2026-04-15)
- core/packages/viewer/src/layouts/AppShell.tsx — `showFooter` prop 추가 (2026-04-15)

## Backlog

- [ ] layout preset 에디터 (어드민에서 레이아웃 미리보기 + 선택)
- [ ] workspace별 layout 오버라이드 저장 (DB: `workspaces.layout_preset` 컬럼)
- [ ] AdminLayout도 AppShell 기반으로 통합
- [ ] 워크스페이스 커스텀 FooterConfig가 있을 때 UnifiedLayout도 `footerSlot` 대신 `footerConfig` 사용하도록 분기 (현재는 biz 고정)
- [ ] WorkspaceDocs/WorkspaceHome/AuthorProfile 등 나머지 페이지에도 `useDocumentMeta` 적용 (DocPage·MarketingHome만 완료)
- [ ] `og:image` 정적 파일(`/og-default.png`) 준비 또는 워커 `/og/home` 엔드포인트 캐싱 보강 (현재 매 요청마다 동적 생성)
- [ ] 첫 이미지 추출을 마크다운 렌더 단계에서 pre-compute하여 렌더 의존성 제거 (현재 `renderedContent` 의존으로 초기 OG가 비어있을 수 있음)

## Learnings

### 2026-04-16: iteration 9 — SSG ↔ SPA 시각 패리티
- **문제 진단**: SPA는 iteration 2에서 `TYPE_TO_DEFAULT_CONTENT_WIDTH` + `--preset-content-max`로 type별 본문 폭을 직교 축으로 분리했는데, SSG는 아직 `--content-max: 700px` 단일 값만 쓰고 있어 course/team에서 1080, wiki/project에서 1200이 나와야 하는데 모두 720으로 렌더됨. 게다가 SSG는 푸터가 아예 없어서 스크롤 끝에 "문서 끝" 신호가 없었음 — SPA는 BizFooter가 붙음
- **해결 전략 — CSS 변수 기반**: React 컴포넌트의 `contentWidth` prop을 SSG 쪽에 동일하게 포팅하는 건 구조 침습. 대신 `body[data-workspace-type="..."]` 오버라이드로 `--content-max`만 바꾸고, `.ssg-main { grid-template-columns: minmax(0, var(--content-max)) }`가 자동으로 그 값을 consume하게 함. SPA의 인라인 `style={{ '--preset-content-max': ... }}` 대신 정적 CSS로 매핑 — SSG는 어차피 type이 body attribute로 고정이라 동적 주입 불필요
- **패딩 정렬**: SSG `.ssg-main { padding: clamp(2rem, 4vw, 3.5rem) }`은 viewport-scaling이라 SPA DocumentPreset의 고정 `var(--publication-start-offset) 48px 96px`과 시각적으로 갈라짐. 특히 와이드 뷰포트에서 SSG가 더 큰 패딩(최대 3.5rem=56px) 쓰면서 본문이 살짝 더 좁아 보임. `48px`로 고정해 SPA와 px 단위 일치
- **Footer 타입 분기**: SPA는 `/blog/*`=BlogLayout(Powered by fallback), 그 외=UnifiedLayout(BizFooter)로 footer가 갈림. SSG도 동일하게 `template.ts`의 `buildFooterHtml(workspaceType)`이 blog vs 기타로 분기. blog footer는 단순 "Powered by openhow" 링크, 비-blog는 사업자 정보+약관/개인정보/Pricing/GitHub 링크. SPA의 `BizFooter` JSX 구조를 HTML 문자열로 1:1 번역
- **테스트 정리**: `ssgStyles.test.ts`의 `border-color: transparent` 검사는 누군가가 SSG search focus 스타일을 SPA BlogLayout에 맞춰 `color-mix(...)`로 업데이트했는데 테스트만 안 고쳐서 남아있던 stale assertion. `blog-style-parity.test.ts`가 실제 패리티를 검사하므로 이걸 단일 기준으로 삼고 개별 토큰 단언은 SPA 값으로 맞춤. 남은 1 failure(`.blog-mobile-menu-btn display`)는 `extractDeclaration(order='last')`가 @print 블록까지 스캔해서 misleading — 시각 결과는 이미 동일. 별도 테스트 인프라 이슈
- **미사용 SSG 정리**: `.ssg-header-btn/-outlined/-primary` 40줄은 SSG 템플릿/네비에서 어떤 HTML도 렌더하지 않음 — `class=ssg-header-btn`을 emit하는 코드 경로 부재. `.ssg-group-title`은 `.ssg-sidebar-group summary,` 와 co-selector로만 정의됐고 실제 `<div class="ssg-group-title">`을 만드는 코드 없음. 둘 다 안전 삭제
- **검증**: `pnpm --filter @openhow/cli build` 통과(35ms), `vitest run` 38 tests 중 37 통과. 순수 추가: body[data-type] 오버라이드 10줄 + 푸터 CSS 68줄 + footer HTML빌더 35줄. 순수 삭제: `.ssg-header-btn*` 40줄 + `.ssg-group-title` co-selector 3곳

### 2026-04-16: iteration 8 — 레거시 제거 + 스크롤 셀렉터 드리프트
- **발견**: iteration 3에서 `router.tsx`가 MainLayout → UnifiedLayout으로 교체된 이후 `MainLayout.tsx`(592줄) + `MainLayout.css`(688줄)는 어떤 모듈도 import하지 않은 채로 5이터레이션을 유지 중이었음. 또한 레거시 immersive CSS 의 상단 블록 전체가 MainLayout 네임스페이스(`.content-grid`, `.main-nav-panel`, `.main-content`, `.content-container`, `.sidebar-left/right`, `.site-footer`) 기준으로 작성돼 DocumentPreset 그리드에는 전혀 매칭되지 않음 — immersive chrome-hide 는 DocumentPreset.css 가 이미 대체 수행
- **숨어있던 버그**: `TableOfContents.tsx:12`와 `ReadingProgressBar.tsx:7`이 `document.querySelector('.main-content')` 하드코딩. DocumentPreset은 `.doc-preset-content`를 스크롤 컨테이너로 렌더 → TOC 활성 하이라이트 + 북모드 진행바가 `/d/*` 경로에서 **무반응**. 시각적 증상이 "그냥 작동 안 함"이라 리포트 대신 잠복. 레거시 삭제 과정에서 셀렉터 참조를 grep하다 발견
- **레거시 immersive CSS 분할 판단**: 파일 안에 두 성격이 섞여 있었음 — (A) MainLayout chrome 숨김 블록, (B) 당시 페이지 뷰 컴포넌트가 쓰는 타이포/레이아웃. (A)는 전량 삭제 가능, (B)는 당시 활발히 쓰임. 진행바/타이틀 행 관련 규칙은 DocumentPreset이 렌더하는 요소에 여전히 매칭되므로 유지 (이후 (B) 와 페이지 뷰 컴포넌트도 통합 과정에서 모두 제거됨)
- **레거시 immersive 레이아웃은 자체 네임스페이스**: 당시 별도 레이아웃이 자체 스크롤 컨테이너와 자체 CSS 파일만 import하고 `.main-content` 같은 MainLayout 클래스를 렌더하지 않음 → 이 블록 삭제가 해당 레이아웃에 영향을 주지 않음을 확인 (해당 레이아웃은 이후 통합 과정에서 완전히 제거됨)
- **Home.tsx의 죽은 CSS import**: `Home.tsx` 자신은 `.home*` 클래스를 사용하지 않고 Suspense/분기 로직만 담당(`MarketingHome`이 실제 사용자). iteration 4에서 `MarketingHome`으로 뷰 컴포넌트를 분리하면서 `Home.css` import가 남았음. 제거해도 시각 변화 없음을 빌드 검증으로 확인
- **검증**: `pnpm --filter @openhow/viewer build` 통과 (2.79s, 오류 0). 제거 총량: 파일 2개(1,280줄) + 레거시 immersive CSS 32줄 + 주석 2개 + 불필요 import 1개 = **1,315줄 이상 삭제, 추가된 순수 코드 2줄(셀렉터 변경)**

### 2026-04-16: iteration 7 — two-panel 스크롤 시 nav가 footer와 함께 밀려 올라가는 현상
- **증상**: clauders_book(`nav.mode: two-panel`, port 3803) 글 상세에서 아래로 쭉 스크롤하면 footer가 뷰포트에 진입하는 순간 sticky 좌측 nav 2패널이 footer와 함께 위로 밀려 올라감. "사이드바가 내내 고정되어 있다가 마지막에 같이 사라지는" 바람직한 패턴이 아니라, 마치 sticky가 풀린 것처럼 보임
- **근본 원인**: sticky 요소의 containing block은 부모의 경계. `.blog-main-nav-panel`/`.blog-sidebar-sub`의 부모는 `.blog-body`인데, `.blog-footer`가 `.blog-body`의 **형제**로 바깥에 있어서 body.height 안에 footer가 포함되지 않음. 따라서 `body.bottom`이 viewport 안에 들어오는 순간부터 sticky 바운드가 다 쓰여 위로 밀림. 이 시점이 footer가 올라오는 시점과 일치해서 "nav가 footer에 딸려 올라가는" 것처럼 보임
- **선택지 비교**:
  - A) **footer를 body 내부의 main 컬럼으로 이동**(채택) — `.blog-body(grid)` 안에 `.blog-main-col` wrapper를 추가하고 그 안에 `<main>`+`<footer>`를 넣음. body.height = main.height + footer.height → sticky 바운드가 footer 끝까지 늘어남. footer가 col 3(본문) 폭만 차지해서 col 1/2 sticky sidebar와 가로로 겹치지 않음. two-panel 모드에서만 적용, 나머지 모드는 기존 구조 유지 — 보수적
  - B) nav를 `position: fixed`: 간단하나 스크롤 끝까지 가도 nav가 떠 있어 "문서 끝" 신호가 사라짐. grid 중앙정렬과 맞추려면 `left: calc(...)` 추가 필요
  - C) footer를 body 내 별도 row(`grid-column: 1 / -1`): 구조는 단순하나 sticky nav가 footer 위에 세로로 겹쳐 떠서 읽기 흐름이 어색해짐
- **구현 세부**:
  - `.blog-main-col`에 `min-height: calc(100vh - header)`를 둬서 본문이 짧은 홈/짧은 글에서도 footer가 뷰포트 하단에 붙도록 함
  - `.blog-main-col > .blog-main`의 `min-height: 0` + `flex: 1 1 auto` — 기존 `.blog-main`의 `min-height: 100vh - header`를 두 곳에서 걸면 합쳐져 불필요한 여백이 생기므로 main-col로 책임 이관
  - footer JSX를 `footerNode` 상수로 뽑아 two-panel 내부/그 외 외부 두 곳에서 같은 노드를 참조 → JSX 중복 제거
  - 비-two-panel 모드(blog-with-sidebar = position fixed, blog without sidebar)는 sticky가 아니거나 bounds 문제가 없어서 손대지 않음

### 2026-04-16: iteration 6 — two-panel sub 사이드바 폴리시
- **증상**: `nav.mode: two-panel`(clauders_book, port 3803)에서 우측 sub 패널이 "1. 코덱스로 시작하기" 라벨을 `blog-nav-group-title` div로 찍는데, 이 클래스에 CSS가 아예 없어서 그냥 일반 텍스트로 나옴 + 좌측 활성 섹션과 내용이 중복. 게다가 `.blog-nav-sub { margin-left: 2rem }`이 sub 패널(260px) 안에서도 먹어서 항목이 오른쪽으로 짜부라져 있었음
- **구조 판단**: 그룹이 1개일 때 group-title은 좌측 활성 섹션과 동일한 문자열 → 노이즈. 다만 그룹 여러 개(예: Part 안에 추가 섹션)인 경우에는 구분자로서 필요 → `nonEmptyGroups.length > 1`일 때만 캡션 스타일로 표시. 대신 패널 최상단에는 항상 active 섹션 타이틀을 한 번 큼직하게(보더 라인 포함) 찍어 "here" 랜드마크 역할 담당. Notion/Linear/Vercel 패턴
- **indent 스코핑**: single-panel에서 상위 nav 하위로 접히는 sub의 2rem 들여쓰기는 유지, two-panel sub 패널에서만 `.blog-sidebar-sub .blog-nav-sub { margin: 0 }`로 해제 (셀렉터 범위로 격리, 기본 동작 보존)
- **active 강조**: sub-item 활성 상태가 color만으로는 약해서 `background: var(--active-link-bg)` + 왼쪽 바 14px/opacity 0.7로 강화. main nav-item과 같은 배경 토큰 재사용 → 시각 리듬 통일. 다크모드도 동일 토큰 사용하므로 선언만 추가
- **홈에선 sub 내용만 비우고 컬럼은 유지**: 홈 활성 또는 sub 그룹이 없을 때 `<aside>` 자체는 렌더하되 내부 `.blog-sidebar-inner`만 조건 렌더(+ `aria-hidden` 부여). grid-template-columns는 항상 3열 유지. 이유는 본문 x 좌표가 페이지 전환마다 흔들리면 안 되기 때문(홈 ↔ 문서 이동 시 shift 방지). 빈 컬럼은 여백처럼 작동

### 2026-04-16: iteration 5 구현
- **문제 진단**: 같은 `openhow serve` 인스턴스라도 `type=blog`(3801 jobdori-vibe-coding)는 `/` 에서 카드 landing이 뜨고, `type=docs`(3802 jobdori-vibe-marketing)는 `Home.tsx`의 `Navigate to defaultLocalDocumentPath` 때문에 첫 문서로 강제 이동 → 사용자 입장에선 "홈 화면" 이 아예 존재하지 않음. 결과적으로 type에 따라 기능/구조가 완전히 달라지는 UX 비대칭
- **원인**: 분기가 3곳에 분산. ① `RootIndex`가 type==='blog'일 때만 WorkspaceDocs 렌더 ② `Home.tsx` 로컬 모드가 defaultDoc로 Navigate ③ `WorkspaceDocs` useEffect가 비-blog에서 `navigate(first doc, replace: true)`. 어느 한 곳만 바꿔도 나머지가 redirect 해버려 landing이 안 뜸
- **해결 원칙**: `WorkspaceDocs`를 "type 중립 workspace landing"으로 승격. Special-case는 `book` → `/read/` 리다이렉트(전용 e-reader), `learning`/`course` → course hub만 유지. 나머지는 모두 landing을 보여준다. 이 결정의 부수 효과: 클라우드 `/w/:workspace` docs 타입도 더 이상 자동 redirect하지 않고 landing을 가짐 → 플랫폼 전체가 일관된 구조
- **docBase 분기**: blog는 `/blog/:ws/*` 라우트를, 그 외는 `/d/:ws/*` 라우트를 사용해야 하므로 (non-custom-workspace 경로일 때) `docBase = isBlog ? '/blog/:ws' : '/d/:ws'`. 로컬/커스텀 도메인은 그대로 빈 문자열
- **라벨/정렬 type-awareness**: 블로그 어투의 "아티클/전체 아티클/개의 아티클"을 docs에서 "문서/모든 문서/개의 문서"로 교체. 정렬은 blog=날짜 desc, docs=menu(sortOrder) 기본
- **Team-blog 분기 강화**: `isTeamBlog` 는 `config.preset === 'team-blog'` 체크이지만 docs workspace가 우연히 같은 preset을 쓰는 경우를 방지하기 위해 `isBlog && isTeamBlog`로 이중 게이트. 이전 코드는 단순히 `if (isTeamBlog)` 였음
- **BlogLayout 유지**: iteration 3 결정(serve/custom workspace = BlogLayout)은 그대로. 이번 이터레이션은 layout 교체가 아닌 **landing 화면 자체의 존재 여부**를 맞추는 작업

### 2026-04-15: seed 생성
- **배경**: blog vs 비-blog 스타일 갭 문제를 대화에서 분석
- **사용자 방향**: "통합 레이아웃을 하나 만들고 점차적으로 바꾸면서 레이아웃을 선택하는 쪽", "type은 기능적, layout은 디자인적으로 분리"

### 2026-04-15: 코드 탐색
- **발견 (긍정적)**: 시맨틱 토큰은 이미 전역 공유. 갭은 토큰이 아닌 레이아웃 구조 수준. MainLayout이 이미 `--publication-header-height` 참조하여 수렴 시작점 존재
- **발견 (갭)**: 헤더 구조, 콘텐츠 영역 레이아웃, 푸터, 검색 방식, CSS 네이밍이 완전히 다름
- **판단**: Phase 0→1→2→3 순서가 안전. 각 Phase에서 기존 레이아웃 병행 가능

### 2026-04-15: clarify
- **사용자 결정**: "디자인 완성도는 blog type이 더 높아. 그걸 기준으로 하자"
- **반영**: AppShell의 헤더/푸터/검색을 BlogLayout 기준으로 설계. MainLayout의 추가 기능(로그인, 로케일, 리딩모드)은 actions slot으로 합류시키되, 시각적 톤은 BlogLayout 따름
- **Phase 0부터 시작**: 타입 정의는 리스크 제로이므로 즉시 빌드 가능

### 2026-04-15: Phase 2 구현
- **설계 결정**: slot-based 접근법 채택. 프리셋은 레이아웃 구조(CSS)만 담당하고, 네비게이션 컴포넌트는 ReactNode slot으로 받음
- **이유**: 네비게이션 로직을 프리셋에 복제하지 않고, Phase 3에서 부모(UnifiedLayout)가 조합하는 구조
- **PublicationPreset**: BlogLayout body (flex + sidebar + two-panel grid) 추출. 모바일 사이드바 상태는 controlled props로 부모에서 관리
- **DocumentPreset**: MainLayout content-grid (CSS grid 1~4 columns) 추출. book-mode, no-toc 등 기존 변형 모두 지원
- **기존 파일 무변경**: BlogLayout, MainLayout 일체 수정 없음. 새 파일 4개만 추가

### 2026-04-16: iteration 2 구현
- **문제 진단**: type별 본문 폭이 `/d/` 672px vs `/blog/` 720px로 달랐음. 원인은 `--content-max-width(768)`과 `.doc-page.blog-detail { max-width: 720 }`의 이원화 + DocumentPreset inner padding(48+48)의 합산. preset 레벨에서 width 개념이 없어 type마다 갭 발생
- **설계 결정**: `LayoutPreset`은 배치만, 폭은 **`PresetContentWidth` 직교 축**으로 분리. `TYPE_TO_DEFAULT_CONTENT_WIDTH` 병렬 매핑을 두어 `TYPE_TO_DEFAULT_LAYOUT`의 shape 불변 유지 → 기존 consumer(UnifiedLayout) 깨지지 않음
- **CSS 계약**: React 컴포넌트가 `--preset-content-max` 인라인 변수로 주입, CSS가 `max-width: var(--preset-content-max, var(--content-reading-max))`로 fallback. 런타임 toggle 가능, 정적 CSS 오버라이드도 가능
- **width 토큰 의미화**: `--content-max-width`는 값이 `768→720`으로 바뀌었지만 alias로 이름 유지(Terms/Privacy/PlateEditor 등 외부 consumer 영향 최소). 의미는 `reading(720)`, 새 사용은 `--content-reading-max` 권장
- **메인 홈**: `Home.css`가 hero/steps/ws/ai/devtools/cta 클래스를 풀세트로 정의해놓고 `Home.tsx`가 사용 안 하던 상태였음. `MarketingHome.tsx` 신설로 재활용. 블로그 피드는 `/feed`로 이관하여 공개 유입은 유지
- **보수성**: BlogLayout(커스텀 도메인), PublicBlogHome 모두 유지. 모든 기존 워크스페이스 영향 없음

### 2026-04-16: iteration 3 구현
- **Footer 단일화 — Publication에도 biz footer 노출**: 이전에는 UnifiedLayout이 `showFooter={false}`로 AppShell footer를 꺼둔 채 DocumentPreset `footer` slot에만 인라인 `<div className="unified-footer-inner">`를 렌더 → Publication 경로는 footer가 완전히 없었음. iteration 3에서 `BizFooter`를 AppShell의 `footerSlot` prop에 넘겨 preset에 상관없이 동일한 biz footer 노출. DocumentPreset `footer` prop은 그대로 남겨 커스텀 워크스페이스가 필요하면 주입 가능한 slot으로 예약
- **Mobile drawer 대칭화**: PublicationPreset은 자체 CSS 드로어(`pub-preset-sidebar.is-open`), DocumentPreset은 drawer가 없어서 UnifiedLayout이 외부 `<aside className="mobile-sidebar">`를 추가로 렌더했음 → 두 preset의 mobile API 비대칭. iteration 3에서 DocumentPreset에 `mobileSidebarOpen/onMobileSidebarClose/mobileSidebarContent` props 내재하고 `.doc-preset-mobile-*` 드로어를 preset 내부에서 렌더. ESC+scroll-lock 로직은 `useMobileSidebar` 훅으로 추출해 두 preset이 공유
- **CSS 네임스페이스 정리**: mobile drawer 구조 클래스(`.mobile-sidebar`, `.mobile-sidebar-backdrop`, `.mobile-sidebar-header`, `.mobile-sidebar-title`, `.mobile-close-btn`, `.mobile-sidebar-nav`)는 더 이상 사용되지 않아 UnifiedLayout.css에서 제거. 반면 컨텐츠 클래스(`.mobile-nav-link`, `.mobile-nav-divider`)는 두 preset의 `mobileSidebarContent` JSX에서 쓰이므로 UnifiedLayout.css에서 공용 content class로 유지
- **SSG ↔ SPA 토큰 동기화**: viewer `main.css`가 iteration 2에서 `--content-reading-max(720)` 중심으로 재정의됐지만 SSG `ssgStyles.ts`는 `--content-max: 700px` 그대로였음 → 정적 퍼블리시와 SPA 퍼블리시의 본문 폭이 달랐음. iteration 3에서 ssgStyles `:root`에 동일 토큰 + legacy alias 추가. `body[data-workspace-type="blog"] .blog-detail`은 여전히 `--publication-article-max` 참조 → 이제 `720px`로 동기화
- **OG 메타 전략**: SPA 모드라 크롤러가 기본 index.html만 보므로, 사이트 레벨 OG/Twitter 메타를 index.html에 정적으로 넣음. 페이지별 동적 메타(og:image, 페이지 description)는 후속 과제로 backlog에 이관
- **기존 CLAUDE.md 가이드 준수**: `ssg-*` 접두어와 SPA 비접두어의 원칙 유지, SPA/SSG 공통 토큰만 동기화하고 클래스 네이밍은 각자 네임스페이스 유지

### 2026-04-16: iteration 4 구현
- **워커 vs 뷰어 meta 책임 분할**: 워커는 이미 `resolveDocumentMeta`/`resolveWorkspaceMeta`로 초기 HTML 스크레이프용 SEO 태그를 서버 사이드에서 주입 중. 그러나 SPA 네비게이션 후에는 브라우저 탭 제목과 `<meta>` 태그가 정체됨 → 사후 트위터/슬랙 링크 미리보기 재스크레이프 시 최초 경로의 메타가 남아 있음. `useDocumentMeta` 훅은 그 갭을 메우기 위한 클라이언트 측 동기화 계층
- **OG 이미지 우선순위 설계**: `frontmatter.thumbnail → doc.thumbnail(DB) → 첫 md 이미지 → workspace.ogImageUrl → worker /og/:ws/:slug`. 앞 두 단계는 작성자 명시 의도, 세 번째는 "페이지 삽화 자동 바인딩" (사용자 요청), 네 번째는 워크스페이스 레벨 대체, 마지막은 워커 동적 이미지 생성 fallback. 각 단계는 뷰어 측에서 단순 문자열 존재 검사로 해결 → 런타임 부하 제로
- **첫 이미지 추출: DOMParser 대신 정규식**: `DOMParser`는 Node SSR/CLI 환경에서 불가. 순수 문자열 파싱으로 `<img src>` 추출 + `data:` URI, `emoji/icon/avatar` 클래스 필터. Markdown 렌더 결과에 `md-content-card__thumbnail img` 같은 내부 이미지가 있어 클래스 필터 포함. 단, 현재는 `renderedContent` 의존이라 초기 페인트 시 OG가 비어있을 수 있음 → 향후 pre-compute 후처리 필요 (backlog)
- **title + 탭 복원의 중복 제거**: iteration 3 이전 DocPage는 `savedTitleRef` + `useEffect(title)`로 직접 `document.title` 조작 + 언마운트 복원. `useDocumentMeta`가 동일 역할을 포괄하므로 이중 복원이 되어 revert가 이상하게 동작할 수 있음 → 기존 ref/effect를 완전히 제거하고 훅 단일 경로로 통합
- **`useDocumentMeta`의 meta 업서트 패턴**: `querySelector` → 없으면 `createElement + appendChild`, 있으면 `setAttribute` → cleanup은 `didCreate`이면 DOM에서 제거, 아니면 `prevContent` 복원. 이 패턴으로 페이지 간 경합 없이 이전 상태로 확실히 되돌림
- **기본 og:image = /og/home 동적 엔드포인트**: 정적 `/og-default.png`을 준비하는 대신 워커의 이미 존재하는 `/og/home` 핸들러를 활용. 추후 캐싱/대체 정적 이미지로 전환 시 index.html과 MarketingHome 양쪽만 값 변경

### 2026-04-15: Phase 3 구현
- **핵심 변경**: router.tsx의 RootLayout에서 MainLayout → UnifiedLayout 교체. BlogLayout 라우트(/blog/*, 커스텀 도메인) 무변경
- **UnifiedLayout 구조**: AppShell(헤더+검색+actions) + DocumentPreset(content-grid) 조합. MainLayout의 ~290줄 비즈니스 로직 전체 포팅
- **검색 통합**: AppShell의 인라인 검색 UI + onSearchSubmit으로 /search 페이지 네비게이션 (기존 MainLayout 동작 유지)
- **actions slot 활용**: pricing 링크, manage 버튼, reading mode 토글, locale/auth UI를 AppShell actions slot에 배치
- **AppShell showFooter prop**: DocumentPreset의 footer slot에 사이트 푸터 배치, AppShell 푸터는 숨김
- **CSS 네임스페이스**: `unified-*` 접두사 (logo, footer), MainLayout.css의 header-btn/avatar/mobile-sidebar 스타일 추출
- **MainLayout 보존**: 삭제하지 않음, fallback으로 유지
