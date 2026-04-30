---
status: done
created: 2026-04-22
updated: 2026-04-29
iteration: 4
iter1_learnings: learnings-iter-1.md
iter2_learnings: learnings-iter-2.md
iter3_learnings: learnings-iter-3.md
---

# article-image-sidecar — 우측 레일을 스크롤-싱크 이미지 패널로 전환

## Why

블로그/문서 본문에 16:9 이미지를 인라인으로 넣으면 독자가 한 단락을 읽기 위해 세로 스크롤을 더 해야 한다. 특히 `openhow serve`가 렌더하는 `bootpay-contents/blog` 같은 SDK·결제 가이드 문서는 이미지(화면 캡처, 시퀀스 다이어그램, UI 예시)가 설명의 핵심인데 세로로 차지하는 공간이 커서 글 리듬이 끊긴다.

현재 `UnifiedLayout/DocumentPreset`은 `nav | sidebar | 1fr | aside(220px)` 4열 그리드로 **우측 aside가 이미 TOC로 쓰이고 있지만 실제 본문 연출에는 거의 기여하지 못한다** (사용자 판단: "본문 연출할 때 막상 사용이 안 된다"). 이 슬롯을 TOC 대신 **스크롤에 맞춰 관련 이미지가 바뀌는 사이드카 패널**로 전환하면:
- 이미지가 본문 흐름을 끊지 않는다 (세로 스크롤 추가 X)
- 읽는 지점에 맞는 시각 자료가 실시간 연출된다 (읽기 몰입도 ↑)
- openhow가 SDK 문서 호스팅 도구로서 차별화되는 UX (경쟁: Mintlify 사이드 코드, Stripe Docs 우측 패널)

## What (iter 4)

iter3 [signal] = 모바일 (≤767px) 에서 본문 width 가 ~53% 로 찌그러지고 우측이 빈다. Root cause = `pub-preset-body--two-panel.has-right-aside` 의 `@media (max-width: 1679px)` grid-template-columns specificity (0,2,0) 가 `@media (max-width: 1279px) / 767px` 의 `--two-panel` 단독 셀렉터 (0,1,0) 를 cascade 에서 이김 → 1279/767 단계에서 grid 트랙이 collapse 안 됨.

- [v1] **PublicationPreset.css cascade specificity 수정** — `@media (max-width: 1279px)` 와 `@media (max-width: 767px)` 의 `.pub-preset-body--two-panel` / `--three-panel` / `--main-nav-only` grid-collapse 규칙을 `.has-right-aside` combo 변형까지 매치하도록 specificity 올려서 1679px 분기를 cascade 에서 이기게 한다. 모바일에서 grid-template-columns 가 단일 1fr 컬럼으로 collapse → 본문 100% 폭. → **metric: 375×667 viewport 에서 `.pub-preset-main` 의 실측 width = viewport width (− horizontal padding), 우측 빈 공간 0px**
- [v1] **SSG 미러 동일 수정** — `cli/src/ssg/ssgStyles.ts` 의 `.ssg-main:has(.ssg-figure-sidecar)` grid 분기도 동일한 cascade 구조 → 동일 수정. → **metric: `openhow publish` 후 SSG HTML 을 모바일 viewport 로 렌더 시 SPA 와 동일한 width 거동**

## What (iter 3, 완료 보관)

iter1–2 에서 scroll-sync + fade + tabs 완성. iter3 는 **명시적 트리거(readers-pull) 모드** 축 — 스크롤에 끌려가는 대신 독자가 "보기" 버튼을 눌러 우측에 시각 자료를 **의도적으로** 꺼내오는 UX.

- [v1] **본문 inline "보기" 버튼 → 우측 sidecar reveal** — 저자가 본문에 `[보기](figure-id)` 혹은 `:::figure-side` 의 `trigger="manual"` 같은 마커를 두면, 그 위치에 배지/버튼이 인라인 렌더. 독자가 클릭하면 우측 ImageSidecar 가 해당 figure 를 열고 — 또 누르거나 ESC 누르면 닫힌다. 기존 scroll-sync 와 **공존 vs 대체** 선택은 설계 시점 열린 질문. → **metric: 버튼 클릭 ≤160ms 내 panel fade-in + 해당 figure 표시, 버튼 state 가 active/inactive 반영, 닫기 동작으로 empty fade-out**

## 설계 결정 (iter3)

- **트리거와 데이터 분리 — event-like API**: 버튼이 figure 블록에 **바인딩되지 않는다**. figure 블록은 id 로 등록되는 데이터 소스, 트리거는 본문 어디에든(일반 버튼, 테이블 셀 안 버튼, 이미지, 커스텀 컴포넌트) `data-figure-show="<id>"` 속성만 달면 됨. `CustomEvent('openhow:figure-show', { detail: { id } })` 프로그램적 API 도 제공.
  ```markdown
  :::figure-side id="widget" src="/images/widget.png" caption="위젯 결제창"
  :::

  | 모드 | 설명 | 미리보기 |
  |------|------|---------|
  | 위젯 | 가벼운 결제창 | <button data-figure-show="widget">보기</button> |
  ```
- **scroll-sync 와의 관계**: (x) **공존**. `:::figure-side` 에 `id` 가 있거나 `manual` flag 가 있으면 → scroll-sync 스캔에서 제외되고 manual 데이터 소스로만 등록. `id`/`manual` 없는 기존 블록은 iter1–2 그대로 scroll-sync (하위호환).
- **범위 매핑 (anchor range)**: 저자가 본문 내 트리거 위치로 "범위" 를 묵시적으로 그린다. 트리거 클릭 시 `clickedTrigger.getBoundingClientRect()` 를 읽어 range = `[top - vh*0.3, bottom + vh*1.0]` 생성. scroll 이 그 범위를 벗어나면 manual 자동 해제. 같은 id 를 가리키는 트리거가 여러 개여도 방금 클릭된 버튼의 위치가 range 기준.
- **닫기 조건 (B: anchor range)**:
  - scroll 이 active trigger 의 anchor range 를 벗어남 → 자동 닫기
  - 같은 트리거 재클릭 → 닫기
  - 다른 트리거 클릭 → 그 figure 로 전환 (새 anchor 로 range 재설정)
  - ESC → 닫기
  - `openhow:figure-close` CustomEvent → 닫기
  - scroll-sync 블록 range 진입 → manual 해제 후 scroll-sync 로 전환
- **DOMPurify allowlist 확장**: `data-figure-id`, `data-figure-trigger`, `data-figure-show`. 저자가 마크다운에 raw HTML `<button data-figure-show="...">` 를 넣어도 sanitizer 통과하도록.
- **렌더 규칙**:
  - Manual 블록 (id/manual 있음): `<div class="figure-sidecar-block figure-sidecar-block--manual" data-figure-id="..." data-figure-trigger="manual" data-figure-src="..." data-figure-caption="...">` + 내부에 기존 `.figure-sidecar-block__inline` 유지 (narrow fallback). 인라인 버튼 **자동 삽입 없음**.
  - scroll-sync 블록: 기존 그대로.
- **모바일 / narrow viewport (≤1679px)**:
  - Manual 블록의 inline fallback 은 그 위치에 이미지로 보임 (기존 규칙 재사용).
  - 트리거 버튼 클릭 시 우측 sidecar 가 숨겨진 상태 → 대신 대상 figure 블록으로 `scrollIntoView({ behavior: 'smooth', block: 'start' })`.
- **트리거 버튼 상태 동기화**: `manualOverride` 변경 시 `document.querySelectorAll('[data-figure-show]')` 를 순회하며 `aria-pressed` 를 "현재 active id 와 일치하냐" 로 세팅. 같은 id 를 가진 여러 버튼의 state 가 일관성 유지.

## What (iter 2, 완료 보관)

- [v1] **fade-in / fade-out transition 완성** — 현재는 block 진입 시 `figure-sidecar-panel__figure` 에 200ms fade-in 만 존재하고, 범위를 벗어나 empty 로 돌아갈 때는 **즉시 사라짐**. panel wrapper 자체에 `opacity` transition 을 걸어 empty ↔ active 전환, 탭 전환, 블록 간 이미지 교체 모두 부드럽게 → **metric: 블록 진입/이탈 시 panel 의 opacity 가 ≥160ms 에 걸쳐 0↔1 전환, 튀는 프레임 없음** ✅
- [v1] **`:::figure-tabs` — 한 블록에 여러 이미지 + 탭 바** — 저자가 "이 구간에선 탭 버튼으로 다른 이미지 보여주고 싶다" 를 마크업으로 선언. 예: Before/After, Step1/Step2/Step3, 성공/실패 화면. 블록 range 는 기존과 동일(다음 블록까지), 진입 시 첫 탭 활성, 사용자가 클릭하면 그 탭 이미지로 fade 전환. ImageSidecar 컴포넌트는 재사용 — 탭 UI 만 panel 위에 얹는다 → **metric: 2 탭 이상 정의된 block range 진입 시 탭 버튼 렌더, 클릭 시 ≤160ms fade 로 이미지 교체, 블록 이탈 시 상태 리셋** ✅

## 설계 결정 (iter2 진입 시점)

- **탭 문법**: 기존 `:::response` 가 `#### 라벨 + fenced code block` 패턴을 쓰는 것과 동일한 라인 — `:::figure-tabs` 안에 `### <label>` heading 뒤에 `![caption](src)` 이미지를 두면 탭 1개. `:::response` 에서 검증된 저자 UX.
  ```markdown
  :::figure-tabs
  ### 위젯 모드
  ![위젯 결제창](/images/widget.png)

  ### 창 모드
  ![결제창 모드](/images/window.png)
  :::
  ```
- **탭 DOM 구조**: `<div class="figure-sidecar-block figure-sidecar-block--tabs" data-figure-tabs='[{"label":"...","src":"...","caption":"..."},...]'>`. 기존 `figure-sidecar-block[data-figure-src]` 선택자에 `[data-figure-tabs]` 도 추가해서 ImageSidecar 가 둘 다 픽업. 인라인 fallback 은 탭을 세로 리스트로 나열.
- **ImageSidecar 확장**: `current` state 를 `{ src, caption, tabs?: TabEntry[], activeTabIndex: number, blockKey: string }` 로. block 이 바뀌면 activeTabIndex 0 리셋(blockKey 로 판단). 탭 버튼 클릭 시 activeTabIndex 만 갱신하고 src/caption 파생.
- **fade 구현 전략**: panel wrapper 에 `transition: opacity 160ms ease`. empty → active / active → empty / active A → active B 세 경우 모두 React state 중간에 한 프레임 opacity 0 상태를 거치는 2-step (requestAnimationFrame 으로 opacity:0 셋 → 다음 frame 에 content 교체 + opacity:1). 구현 단순화를 위해 panel 단일 opacity 만 건드리고, figure 내부 fade-in animation 은 제거(중복 방지).
- **SSG 패리티**: `hydrateScript.ts` 의 `initFigureSidecar()` 도 동일한 2-step opacity 전환 + 탭 버튼 위임 이벤트. `renderMarkdown.ts` / `markdown.ts` 양쪽에 `figureTabsExtension` 추가.

## Not

- 좌측 nav 구조 변경 (`nav-*` / `three-rail-nav` 의 영역)
- 본문 뷰포트 중앙정렬 깨뜨리는 변경 (유저 메모리 하드 제약: 본문은 뷰포트 정중앙 고정)
- 이미지 저장소/업로드 파이프라인 신설 (저자가 이미 갖고 있는 URL·상대경로만 소비)
- AdminLayout 적용 (blog/docs type 위주 — 필요 시 별도 intent)
- 에디터(Plate.js) 측 이미지 UX 변경 (저자 입력은 마크다운 그대로)
- 탭 **자동 순환 / carousel** — iter2 는 수동 클릭만 (autoplay 은 읽기 방해)
- 탭 내부 이미지 프리로드/CDN 최적화 (browser lazy 로드에 맡김)
- 라이트박스/이미지 확대 뷰어 (backlog 유지)

## Context

### 관련 인프라

- **레이아웃**: `core/packages/viewer/src/layouts/UnifiedLayout.tsx:736` 에서 `toc={<TableOfContents />}` 주입
- **Preset grid**: `core/packages/viewer/src/layouts/DocumentPreset.css` — `grid-template-columns` 에 `var(--aside-width)` 포함
- **토큰**: `core/packages/viewer/src/styles/main.css:44` — `--aside-width: 220px`
- **렌더 이중**: SPA(`viewer/src/utils/markdown.ts`) + SSG(`cli/src/ssg/renderMarkdown.ts`) — 양쪽 동시 지원 필요
- **hydrate**: `cli/src/ssg/hydrateScript.ts` — IntersectionObserver 기반 스크롤 싱크를 여기에 추가
- **채널 참조**: `/Users/taesupyoon/sideProjects/youtube/channels/bootpay-contents/blog/` (type: blog, workspace: bootpay-contents-blog) — 첫 검증 대상 (`/payment-intro/payment-basics`)

### 관련 intent

- `article-reading-ux` (iter 2, seed) — "TOC 사이드바 감사" 항목이 본 intent 실행 시 자동 무효화됨. 해당 intent 의 What에 `[superseded by core/article-image-sidecar]` 메모 필요
- `core/three-rail-nav` (done) — 레일 가로예산 · 중앙정렬 ghost-padding 트릭 선행 자산. 본 intent 도 동일 패턴 재사용
- `blog-workspace-style-polish` (iter 1, building) — 인라인 이미지 스타일(12px radius 등) 개선 중. 본 intent 는 인라인 이미지를 **사이드카로 옮기는** 상위 레이어. 양립 가능하지만 인라인 fallback 발생 시 스타일 일관성 고려 필요
- `docs-semantic-containers` (iter 3, done) — `:::endpoint` / `:::response` 같은 의미적 컨테이너 라인. `:::figure-side` 도 같은 라인의 확장으로 검토 가능

### 미해결 설계 포인트 (Explore에서 풀 대상)

1. **매칭 문법**: `:::figure-side src="..." range-start-heading="..."` / `::: figure-side` 블록 내부에 본문 일부 중첩 / heading anchor 기반 자동 매핑 중 어느 게 저자 친화적인가
2. **전환 연출**: 페이드 / 크로스디졸브 / 슬라이드 중 어느 것이 본문 읽기를 방해하지 않는가
3. **좁은 뷰포트 fallback**: 1280px 미만에서 (a) sidecar 숨기고 인라인으로 승격 / (b) 축소된 floating thumbnail / (c) 완전 숨김 중 어느 것이 "원래 세로 스크롤 문제"를 재발시키지 않는가
4. **저자가 매칭 안 한 구간**: 이전 이미지 유지 / 기본 이미지(표지) 표시 / 빈 패널 중 어느 게 덜 이상한가

## Footprint

### Step 1 — parser + DOM scaffold
- `core/packages/cli/src/ssg/renderMarkdown.ts` — added `figureSideExtension` and registered it after `containerExtension`
- `core/packages/viewer/src/utils/markdown.ts` — added matching `figureSideExtension`, sanitizer allowlist for figure-side DOM attrs/tags
- `core/packages/cli/src/ssg/renderMarkdown.test.ts` — SSG parser coverage (`src+caption`, `src only`, missing-`src` fallback)
- `core/packages/viewer/src/utils/markdown.test.ts` — SPA parser coverage (same 3 cases)
- `core/packages/viewer/package.json`, `core/packages/viewer/tsconfig.json` — viewer-local test command, excluded `*.test.ts` from app build
- `core/packages/viewer/src/styles/markdown.css`, `core/packages/cli/src/ssg/ssgStyles.ts` — inline `<figure>` fallback CSS for `.figure-sidecar-block__inline`

### Step 2 — sidecar panel + scroll sync + SSG aside
- `core/packages/viewer/src/components/ImageSidecar.tsx` — React component, `IntersectionObserver` + `MutationObserver` for async-loaded markdown, keeps previous image when no block visible
- `core/packages/viewer/src/components/ImageSidecar.css` — sticky panel, 200ms fade, `<1440px` panel hide
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — `DocumentPreset.toc` slot switches to `<ImageSidecar />` for blog/docs (kept even though these types actually take the PublicationPreset path, so other flows stay safe)
- `core/packages/cli/src/ssg/hydrateScript.ts` — `initFigureSidecar()` vanilla observer, called from `init()`
- `core/packages/cli/src/ssg/template.ts` — added `<aside class="ssg-figure-sidecar">` for blog/docs
- `core/packages/cli/src/ssg/ssgStyles.ts` — `.ssg-main:has(.ssg-figure-sidecar)` grid + panel CSS + `<1440px` hide

### Step 5 — sub-body 배치 (body 고정폭 + trailing filler + border 제거)
- `core/packages/viewer/src/layouts/PublicationPreset.css`:
  - has-right-aside 조합 grid 에서 body 컬럼을 `minmax(0,1fr)` → `var(--preset-content-max)` 고정폭으로 변경
  - aside 뒤에 `minmax(0,1fr)` trailing filler 컬럼 추가해서 남는 viewport 공간을 우측으로 밀어냄 (aside 가 viewport edge 에 붙는 대신 body 옆에 붙음)
  - `.pub-preset-right-aside` 의 `border-left` + gradient `background` 제거, padding-left 1.25rem 으로 gap 확보 (sub-body 느낌)
  - aside hide breakpoint `1439px → 1679px` 상향 (body+aside 총 폭이 커져서 이전보다 더 넓은 뷰포트 필요)
  - 1680~1823px 중간 구간: three-panel 일 때 track-rail 만 숨겨 공간 확보
  - `@media (max-width: 1679px)` 의 `--pub-right-total: 0px` 오버라이드에 각 combo (two/three/main-nav-only/with-sidebar) 셀렉터 명시 — 공통 셀렉터가 combo 셀렉터에 specificity 밀려 안 먹히던 CSS 버그 수정
  - main padding-right 공식을 기존 분기용만 유지하고, aside 가 보일 때만(`@media (min-width: 1680px)`) has-right-aside main 의 padding 을 0 으로 덮어써서 body 컬럼 고정폭과 충돌 방지
- `core/packages/cli/src/ssg/ssgStyles.ts` — SSG 동일 패턴 (grid trailing filler + border/background 제거 + 1679px breakpoint)
- 검증: 1920 → aside 400 + body 840 + gap 12, 1680 → 동일, 1679 이하 → aside hidden, body 본문 padding-right 공식으로 centering

### Step 4 — figure-sidecar 폭 TOC 디커플 + 400px
- `core/packages/viewer/src/layouts/PublicationPreset.css` — `.pub-preset-body` 스코프에 `--figure-sidecar-width: 400px` 신설, 모든 `has-right-aside` 조합(default / with-sidebar / two-panel / main-nav-only / three-panel)에서 `var(--aside-width)` → `var(--figure-sidecar-width)` 로 교체. 각 조합별 `--pub-right-total: var(--figure-sidecar-width)` 명시해서 three-panel 기본값 0이 덮던 버그 수정
- `core/packages/viewer/src/components/ImageSidecar.css` — panel `max-width` 을 `--figure-sidecar-width` 로 연결
- `core/packages/cli/src/ssg/ssgStyles.ts` — SSG `.ssg-main:has(.ssg-figure-sidecar)` grid 와 `.ssg-figure-sidecar` 패널 폭도 400px 로 (SPA/SSG 패리티)
- 검증: 1440/1600/1920px 모두 aside 400px, 본문 center vs viewport center 차이 ≤2px. 1280px 이하는 aside hidden(기존 동작 유지)

### Step 2.5 — PublicationPreset rightAside (correction: blog/docs routes through PublicationPreset, not DocumentPreset)
- `core/packages/viewer/src/layouts/PublicationPreset.tsx` — added `rightAside` prop, `pub-preset-body--has-right-aside` modifier, `<aside class="pub-preset-right-aside">` after main in every body-mode branch
- `core/packages/viewer/src/layouts/PublicationPreset.css` — introduced `--pub-left-total` / `--pub-right-total` / `--proximity-shift` variables mirroring `DocumentPreset`'s centering math; `has-right-aside` extends grid with `var(--aside-width)`; `<1440px` hides aside and reverts grid
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — injected `rightAside={workspaceType === 'blog' || 'docs' ? <ImageSidecar /> : undefined}` in all 3 PublicationPreset invocations (three-rail / two-panel / default)

### Step 3 — smoke sample
- `youtube/channels/bootpay-contents/blog/payment-intro/payment-basics.md` — 2 `:::figure-side` blocks (section 2 after canvas-flow with real gif; section 4 after canvas-flow with placehold.co placeholder)
- `youtube/channels/bootpay-contents/blog/images/inline/inline-026-payment-basics.gif` — copied smoke image

### Step 6.1 — aside overflow-y:auto 제거 (실 렌더 시 이미지 안 보이던 버그)
- `core/packages/viewer/src/layouts/PublicationPreset.css` `.pub-preset-right-aside` 에서 `overflow-y: auto` 한 줄 삭제
- 원인: aside 자체가 `overflow-y: auto` 라서 scroll container 를 생성. 내부 `.figure-sidecar-panel` 의 `position: sticky; top: 92px` 가 **aside 내부 scroll** 기준으로 고정 — 페이지를 스크롤하면 panel 이 aside top 에 stick 하긴 하지만 aside 자체가 뷰포트 위로 이동해버려서 panel 도 같이 위로 빠짐. 결과적으로 블록 range 안에 들어가도 panel 이 뷰포트 밖.
- 검증(Playwright): 수정 후 panel.rect.y = 92 (뷰포트 기준 fixed), 블록 range 진입 시 이미지 정상 렌더. 스크린샷으로 확인 완료.
- SSG 쪽은 영향 없음 — SSG 는 `.ssg-figure-sidecar` 가 aside 없이 panel 자체로 sticky

### Step 6 — range-based activation + route-change bug fix
- `core/packages/viewer/src/components/ImageSidecar.tsx` — IntersectionObserver 완전 제거. `scroll` + `resize` + `MutationObserver` 가 raf-throttled `compute()` 를 재호출. activation line = `scrollY + innerHeight * 0.3` (document y). 각 블록 range = `[block[i].top, block[i+1].top)`, 마지막 블록은 `block.bottom + 0.8 * vh` 까지. 어느 range 에도 안 들어가면 `setCurrent(null)` → panel empty
- `core/packages/cli/src/ssg/hydrateScript.ts` — `initFigureSidecar()` 동일 로직으로 재작성. panel 루트 `.ssg-figure-sidecar`, `textContent + appendChild` 로 figure 재구성, empty 시 `figure-sidecar-panel--empty` 클래스 토글
- CSS 변경 없음 — empty 상태는 기존 empty 클래스 그대로 재사용
- **route-change 버그 해결**: MutationObserver 가 DOM 변화를 감지하면 compute 재실행 → 블록 리스트가 비면 자동 empty. 이전 이미지가 다른 페이지로 넘어가도 남지 않음
- 검증 (Playwright, viewport 1920x1080):
  - `/payment-intro/payment-basics` y=0 → empty
  - block[0] range (activationY=2869) → `inline-026-payment-basics.gif`
  - block[1] range (activationY=4624) → placehold.co 이미지
  - tail buffer 이후 (activationY=5868 > last.bottom+0.8vh=5668) → empty
  - `/payment-intro/` 이동 → empty (이전 이미지 persist 버그 해결 확인)
- 테스트: `@openhow/viewer` 3 tests, `@openhow/cli` 76 tests 통과. CLI build 는 기존 `publish.ts` TS18004 무관 에러 (이번 변경과 무관)

### Step 7 — iter2 fade + `:::figure-tabs`
- `core/packages/viewer/src/utils/markdown.ts`, `core/packages/cli/src/ssg/renderMarkdown.ts` — `figureTabsExtension` 추가. `###`/`##`/`####` heading + 바로 뒤 image 문법을 탭 배열 JSON으로 직렬화해 `data-figure-tabs` 에 넣고, 2탭 미만/형식 불일치면 기존 generic container fallback 유지. viewer sanitizer allowlist 에 `data-figure-tabs` 추가
- `core/packages/viewer/src/utils/markdown.test.ts`, `core/packages/cli/src/ssg/renderMarkdown.test.ts` — 2탭 / 3탭 / heading 없는 fallback 3케이스씩 추가
- `core/packages/viewer/src/components/ImageSidecar.tsx` — 단일 `data-figure-src` 와 멀티 `data-figure-tabs` 를 공통 `tabs[]` state 로 읽도록 확장. 같은 block range 안에서는 클릭한 탭 유지, block 이 바뀌면 `tabIndex` 0으로 리셋
- `core/packages/viewer/src/components/ImageSidecar.css`, `core/packages/cli/src/ssg/ssgStyles.ts` — panel wrapper `opacity 160ms` transition, empty 상태 `opacity:0`, 탭 버튼 row 스타일, figure fade-in 160ms 로 조정
- `core/packages/cli/src/ssg/hydrateScript.ts` — `initFigureSidecar()` 에 `WeakMap` 기반 block parse cache, 탭 버튼 delegated click, single/tabs 공통 렌더 경로 추가
- `core/packages/viewer/src/styles/markdown.css`, `core/packages/cli/src/ssg/ssgStyles.ts` — 좁은 뷰포트 inline fallback 용 `.figure-sidecar-block__inline-tab` / label 세로 스택 스타일 추가
- 검증:
  - `pnpm --filter @openhow/viewer test -- --run` 통과 (6 tests)
  - `pnpm --filter @openhow/cli test -- --run` 통과 (79 tests)
  - `pnpm --filter @openhow/viewer build` 통과
- smoke sample: `youtube/channels/bootpay-contents/blog/payment-intro/payment-basics.md` — 기존 `:::figure-side` (연동 3층 placeholder) 블록을 `:::figure-tabs` 3 탭 (Client SDK / Server API / Admin Console, 각각 placehold.co 색상 배지 이미지)으로 교체
- 수동 브라우저 검증 (Playwright, 1920×1080):
  - 상단 empty: opacity=0, transition='opacity 0.16s' ✅
  - block[0] figure-side 진입: 단일 이미지 opacity 1 로 fade-in ✅
  - block[1] figure-tabs 진입: 탭 3개 렌더, 첫 탭 active, 첫 이미지 표시 ✅
  - 2nd/3rd 탭 클릭: 이미지 교체 + active 상태 이동, fade-in 정상 ✅
  - tail 이후 / 블록 없는 페이지 이동: opacity=0 로 fade-out ✅

### Step 8 — iter3 event-driven trigger (parser + runtime + smoke)

- **Task #11 — parser + DOMPurify allowlist + tests** (Codex delegated, `.omj/tmp/iter3-parser-css.md`):
  - `core/packages/viewer/src/utils/markdown.ts` — `figureSideExtension` 파싱 `id="..."` (검증 `/^[A-Za-z0-9_-]+$/`) + `manual="true"` 리터럴 → DOM attr `data-figure-id` / `data-figure-trigger="manual"` + class `figure-sidecar-block--manual`. `figureTabsExtension` 에도 동일 파싱 적용
  - viewer `ALLOWED_ATTR` 알파벳순에 `data-figure-id`, `data-figure-show`, `data-figure-trigger` 3종 추가 (저자 raw HTML `<button data-figure-show="...">` 통과)
  - `core/packages/cli/src/ssg/renderMarkdown.ts` — 동일 로직 SSG 미러 (trusted HTML, sanitizer 불필요)
  - `markdown.test.ts` + `renderMarkdown.test.ts` — id-only / manual-only / id+manual / invalid id fallback 케이스 추가
- **Task #12 — runtime 상태머신 + event API** (Codex delegated, `.omj/tmp/iter3-runtime.md`):
  - `core/packages/viewer/src/components/ImageSidecar.tsx` — `ActiveState` union `null | scroll | manual` 로 리팩터. `FIGURE_BLOCK_SELECTOR` 에 `:not([data-figure-trigger="manual"])` 추가로 manual 블록을 scroll-sync 스캔에서 제외. document-level `click` 위임 + `openhow:figure-show` / `openhow:figure-close` CustomEvent + `Escape` key 지원. `syncAriaPressed(activeId)` 로 같은 id 의 모든 `[data-figure-show]` 동기화. `MutationObserver` 는 manual 모드일 때 gate (`if (activeRef.current?.mode !== 'manual') schedule()`). narrow viewport (≤1679px) 는 `scrollIntoView` fallback
  - `core/packages/cli/src/ssg/hydrateScript.ts` — `initFigureSidecar()` SSG 미러 (동일 state machine, document listener sentinel 가드, 별도 render cache 로 anchor 변동 시 불필요한 panel rebuild 회피)
  - CSS 변경 없음 (opacity transition / panel layout 은 iter2 자산 재사용)
- **Task #13 — live Playwright smoke 검증**:
  - `openhow serve` port 3600 으로 로컬 서빙 (dev:prod 는 /api 를 production 으로 프록시해서 로컬 마크다운 없음 — 교체)
  - smoke sample: `/Users/taesupyoon/sideProjects/youtube/channels/bootpay-contents/blog/payment-intro/payment-basics.md` 에 "SDK 설치 모드 비교" 섹션 추가 — 2개의 manual `:::figure-side` (`id="sdk-widget"` / `id="sdk-popup"`, `manual="true"`) + `<button data-figure-show="...">` 트리거를 포함한 테이블. Codex 가 bootpay-contents 디렉터리 밖이라 쓰기 불가 → 수동 Edit
  - `/tmp/sidecar-smoke/run.mjs` — 20 assertion Playwright smoke (8 시나리오). 최종 **20/20 pass** (scroll-sync / trigger click / anchor hold / scroll-out auto-close / toggle / cross-trigger switch / ESC / CustomEvent)
- **Post-hoc bug fix — anchor range 넓히기**:
  - 초기 스펙: range = `[trigger_top - vh*0.3, trigger_bottom + vh*1.0]`. Playwright click 후 브라우저가 정착한 `scrollY` 가 `trigger_top - vh*0.3` 위에 떨어지는 케이스 발생 → raf 다음 frame 에 `activationDocY < anchorTop` 판정 → manual 즉시 해제 → 2a/2b/3 fail
  - 진단: `/tmp/sidecar-smoke/debug.mjs` 로 click 전후 `scrollY` 를 샘플 — BEFORE=3825, AT=4833 (Playwright auto-scroll), 500ms 후=4393, button docY=5273, anchorTop=5273-270=5003, `activationDocY=4663 < 5003` 확인
  - 수정: pad 를 **대칭 `vh*1.0` / `vh*1.0`** 로 확장 (SPA `getManualAnchor` at `ImageSidecar.tsx:111`, SSG hydrate at `hydrateScript.ts:577-578`). 동시에 anchor 비교 시점의 기준을 `scrollY` 원값이 아닌 `activationDocY = scrollY + vh*0.3` 로 통일 (`hydrateScript.ts:789-793`) — scroll-sync 와 같은 comparator 사용
- 검증:
  - `pnpm --filter @openhow/viewer test -- --run` → 통과
  - `pnpm --filter @openhow/cli test -- --run` → 통과
  - `pnpm --filter @openhow/viewer build` → 성공
  - Playwright 8 시나리오 smoke → **20/20 passed**

### Step 9 — iter4 모바일 cascade specificity 수정

- `core/packages/viewer/src/layouts/PublicationPreset.css` (1279px @media block, L444-459) — `.pub-preset-body--two-panel` / `--three-panel` / `--main-nav-only` 단독 셀렉터를 group selector 로 확장해 `.has-right-aside` combo 변형까지 매치 (specificity (0,1,0) → (0,2,0))
  ```css
  .pub-preset-body--two-panel,
  .pub-preset-body--two-panel.pub-preset-body--has-right-aside {
    grid-template-columns: minmax(0, 1fr);
    padding-left: 0;
  }
  /* --three-panel, --main-nav-only 동일 패턴 */
  ```
- `core/packages/cli/src/ssg/ssgStyles.ts` — **수정 없음**. L4110 `@media (max-width: 959px)` 가 이미 `.ssg-layout { grid-template-columns: minmax(0, 1fr); }` + `.ssg-sidebar { display: none; }` 를 갖고 있어 ≤767px 모바일도 자동으로 단일 컬럼 collapse. SSG 미러는 cascade 구조가 SPA 와 다름 (combo selector 충돌 없음)
- 검증 (Playwright, 375×667 viewport):
  - URL: `http://localhost:3600/payment-intro/understand/payment-basics`
  - bodyClass = `pub-preset-body pub-preset-body--has-right-aside pub-preset-body--two-panel` ✅
  - `bodyGridTemplate: "375px"` (이전: `200px 200px 0px`) ✅
  - `mainWidth: 375` (이전: ~200, 약 53%) — viewport 와 동일 ✅
  - `mainLeft: 0` — 좌측 정렬, 우측 빈 공간 0px ✅
- `pnpm --filter @openhow/viewer build` → 통과
- diff stat: `PublicationPreset.css` 1 file, 6 insertions(+), 3 deletions(-)

### Step 7.1 — iter2 code review 정돈
- `core/packages/cli/src/ssg/ssgStyles.ts` — `.ssg-figure-sidecar.figure-sidecar-panel` 베이스 셀렉터를 `.figure-sidecar-panel` 로 낮춰 `.figure-sidecar-panel--empty` 가 cascade 에서 이김 (SSG fade-out 복구)
- `core/packages/viewer/src/styles/markdown.css` — 인라인 fallback breakpoint `1439px` → `1679px` (PublicationPreset aside 숨김과 동기화, 1440–1679px 공백 구간 해소)
- `core/packages/viewer/src/components/ImageSidecar.css` — 불필요한 `@media (max-width: 1439px) { .figure-sidecar-panel { display: none } }` 제거 (aside 가 1679 에서 이미 숨겨서 redundant)
- `core/packages/viewer/src/styles/markdown.css`, `core/packages/cli/src/ssg/ssgStyles.ts` — 빈 `.figure-sidecar-block {}` 룰 제거
- `core/packages/cli/src/ssg/ssgStyles.ts` — `@media (max-width: 1679px)` 안의 공 셀렉터 그룹 정리
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — DocumentPreset `toc` slot 의 ImageSidecar 분기 삭제 (blog/docs 는 PublicationPreset 로 라우팅되므로 DocumentPreset 에 도달 안 함, iter1 의 leftover). 3 곳 중복된 `workspaceType === 'blog' || 'docs' ? <ImageSidecar />` 를 `figureSidecarSlot` 상수로 추출
- 검증:
  - `pnpm --filter @openhow/viewer test -- --run` → 6/6 pass
  - `pnpm --filter @openhow/cli test -- --run` → 79/79 pass
  - `pnpm --filter @openhow/viewer build` → 성공
  - Playwright 1920/1500/1200 × 900 3종 viewport:
    - 1920: aside=block, inline=hidden ✅ sidecar 모드
    - 1500: aside=none, inline=block (840px width) ✅ fallback (이전엔 빈 화면)
    - 1200: aside=none, inline=block ✅ fallback

## Backlog

- 비디오 sidecar (image 검증 후 확장 후보)
- 이미지 확대 뷰 / 라이트박스
- ~~`:::` 블록 nesting 지원~~ — **superseded by `core/markdown-directive-nesting.md` (done 2026-04-29)**. 모든 directive 가 가변 fence 로 전환됨
- figure-sidecar breakpoint 단일 소스화 — `1679px` 가 PublicationPreset.css / markdown.css / ssgStyles.ts 세 파일에 각각 박혀 있음. CSS 커스텀 프로퍼티 또는 build-time 상수로 뽑아서 drift 방지

## Learnings

> iter1 Learnings 는 [learnings-iter-1.md](./learnings-iter-1.md) 로 freeze 됨 (8개 항목 — preset matrix / MutationObserver / CSS specificity / width token / `:::` nesting / sticky scroll container / IntersectionObserver → scroll+compute).
> iter2 Learnings 는 [learnings-iter-2.md](./learnings-iter-2.md) 로 freeze 됨 (4개 항목 — CSS-only fade / `:::figure-tabs` 문법 수렴 / single+tabs state 통일 / SSG 셀렉터 specificity 재발 + breakpoint drift).
> iter3 Learnings 는 [learnings-iter-3.md](./learnings-iter-3.md) 로 freeze 됨 (6개 항목 — 모바일 grid collapse [signal] root cause / anchor-range pad 대칭 / event-driven trigger / multi-trigger sync / serve vs dev:prod / Codex write scope).
> iter4 Learnings 는 이 섹션에 축적.

<!-- iter4 Learnings 시작 -->

### 2026-04-29: 모바일 cascade — group selector 가 별도 combo rule 보다 깔끔

iter3 [signal] root cause 였던 `.pub-preset-body--two-panel.has-right-aside` 의 1679px 분기가 1279/767px 단독 셀렉터를 cascade 에서 이기는 문제. 두 가지 해법:

1. **별도 combo 규칙 추가** (specificity 0,2,0 짜리 새 룰을 1279/767 분기에 한 줄씩 추가) — 매번 grid-template-columns 값을 중복 작성해야 하고, 추후 값 변경 시 두 군데 동기화 부담
2. **group selector 로 확장** (`A, A.B { ... }`) — 단일 룰이 두 specificity 레벨 모두 매치, 값 중복 0

(2) 채택. iter1 Learnings 의 "CSS specificity" 항목과 같은 패턴이지만 cleaner 한 표현. 향후 1679/1279/767 같은 cascade 충돌이 보이면 group selector 부터 검토.

### 2026-04-29: SSG 미러는 항상 같은 수정이 필요한 건 아님

SPA (PublicationPreset.css) 와 SSG (ssgStyles.ts) 가 figure-sidecar / scroll-sync 로직은 미러링되지만, **외곽 layout grid 는 구조가 다르다**. SSG `.ssg-layout` 은 `var(--sidebar-width) minmax(0,1fr)` 2 컬럼 단순 구조라 `.has-right-aside` combo 가 없고 따라서 specificity 충돌도 없다. 959px 분기에서 이미 collapse 되고 있어 추가 작업 0.

→ **How to apply**: SPA cascade 버그가 보일 때 SSG 도 자동으로 같은 버그라고 가정하지 말고 ssgStyles.ts 에서 동일 selector 가 존재하는지 grep 부터. 셀렉터 자체가 없으면 수정도 없음.

### 2026-04-29: 모바일 viewport smoke 는 `bodyGridTemplate` 한 줄로 충분

iter3 [signal] 진단 시 `getComputedStyle(body).gridTemplateColumns` 만 확인했어도 specificity 충돌이 즉시 보였을 것 (`200px 200px 0px` 이 명시적). Playwright 375×667 + 이 한 줄 측정이 cascade 회귀 검출의 1차 시그널. 향후 모바일 layout 회귀 의심 시 동일 패턴 재사용.

