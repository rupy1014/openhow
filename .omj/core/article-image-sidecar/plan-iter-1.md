# Plan — article-image-sidecar (iter 1)

## Goal

blog/docs 워크스페이스의 본문 우측 aside 슬롯을 TOC에서 **스크롤-싱크 이미지 패널**로 전환. 저자는 본문에 `:::figure-side src="..."` 블록을 감싸 "이 구간 진입 시 이 이미지" 를 선언한다.

## Architecture Decision

- **매칭 문법**: `:::figure-side src="URL" caption?="..."` 컨테이너 (기존 `:::endpoint`/`:::responsibility` 라인과 정합). 블록 본문 = 매칭 범위. heading anchor 매핑은 저자가 heading 구조를 의도적으로 설계해야 해서 기각.
- **DOM 설계**: SSG/SPA 모두 `<figure class="figure-sidecar" data-figure-src="..." data-figure-caption="...">{본문}<img class="figure-sidecar__inline" src="..." alt="..."/></figure>` 렌더. 인라인 img 는 기본 숨김, 좁은 뷰포트에서 표시. `data-figure-src` 는 sidecar 패널 JS 가 스크롤 시 읽음.
- **전환 연출**: opacity 페이드 200ms (cross-dissolve/slide 는 산만).
- **폴백 정책**: 뷰포트 ≥ 1440px → sidecar panel 표시, 인라인 img 숨김. < 1440px → sidecar 숨김, 인라인 img 표시 (세로 스크롤 재발하지만 모바일에선 불가피). 매칭 범위 밖 구간 → 직전 이미지 유지 (빈 패널 금지).
- **aside 슬롯 재사용**: `DocumentPreset.toc` prop 재사용 (signature 변경 없음). `UnifiedLayout.tsx:736` 에서 `<TableOfContents />` → `<ImageSidecar />` 교체 (blog/docs type 한정). `TableOfContents` 컴포넌트 자체는 남겨둠 (다른 레이아웃/preset 에서 재사용 여지).

## Files to Modify

### New
- `core/packages/viewer/src/components/ImageSidecar.tsx` — 우측 sticky panel React 컴포넌트. IntersectionObserver 로 `.figure-sidecar[data-figure-src]` 감지, 현재 src state, 페이드 전환.
- `core/packages/viewer/src/components/ImageSidecar.css` — panel 스타일.

### Existing
- `core/packages/cli/src/ssg/renderMarkdown.ts` — figure-side marked extension 추가 (기존 `endpoint`/`responsibility` 패턴 참고, 라인 ~290-330 구간).
- `core/packages/viewer/src/utils/markdown.ts` — 동일 parser (SPA 이중 관리).
- `core/packages/cli/src/ssg/hydrateScript.ts` — SSG 측 IntersectionObserver 로직. SPA `ImageSidecar` 와 동일 동작을 vanilla JS 로.
- `core/packages/viewer/src/styles/markdown.css` — `.figure-sidecar`, `.figure-sidecar__inline`, `.figure-sidecar-panel` CSS + < 1440px media query fallback.
- `core/packages/cli/src/ssg/ssgStyles.ts` — 동일 CSS 이중 관리.
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — `toc={<TableOfContents />}` → blog/docs type 분기로 `<ImageSidecar />` (라인 736 주변).
- `core/packages/cli/src/ssg/` — SSG HTML 템플릿에 sidecar container 엘리먼트 삽입 (blog/docs type 한정).
- `.omj/article-reading-ux.md` — 이미 superseded 표기 완료 (seed 단계에서 수정됨).

### Tests
- `core/packages/cli/src/ssg/renderMarkdown.test.ts` — `:::figure-side` 파싱 스냅샷.
- `core/packages/viewer/src/utils/markdown.test.ts` — SPA 동일 검증.

### Smoke Sample
- `youtube/channels/bootpay-contents/blog/payment-intro/payment-basics.md` — `:::figure-side` 2개 블록 삽입 (placeholder 이미지 URL — 추후 저자가 교체).

## Estimated Scope

~400-600 LOC 변경 (CSS + 파서 + 컴포넌트 + hydrate), 9 files, 3 Codex steps.

## Prerequisites

- 없음. 외부 의존성 추가 없음 (IntersectionObserver 는 브라우저 기본 API).

## Reference

- 관련 intent:
  - `core/three-rail-nav.md` (done) — 중앙정렬 ghost-padding 트릭, 뷰포트 breakpoint 선례
  - `core/unified-layout.md` (iter 10, done) — DocumentPreset 셸 구조
  - `docs-semantic-containers.md` (iter 3, done) — `:::name` 확장 라인, SPA/SSG 이중 관리 패턴
  - `blog-workspace-style-polish.md` (iter 1, building) — 인라인 이미지 12px radius 스타일과 충돌 없음 (좁은 뷰포트 인라인 fallback 에 동일 radius 적용)

## Codex Step Breakdown

### Step 1: `:::figure-side` 파서 양쪽 추가 + 기본 CSS
- renderMarkdown.ts + markdown.ts 확장
- `.figure-sidecar` / `.figure-sidecar__inline` 기본 스타일 + 뷰포트 분기 CSS (markdown.css + ssgStyles.ts)
- 테스트: figure-side 파싱 스냅샷 (SPA + SSG)
- 확인: `pnpm --filter @openhow/cli test` 통과, `pnpm --filter @openhow/viewer test` 통과, 렌더 DOM 에 `data-figure-src` 속성 포함

### Step 2: ImageSidecar 컴포넌트 + 스크롤-싱크 hydrate + Layout wiring
- `ImageSidecar.tsx` + CSS (React IntersectionObserver)
- hydrateScript.ts 에 동일 로직 추가 (SSG)
- UnifiedLayout.tsx: blog/docs type 에서 `toc` 에 ImageSidecar 주입, TOC 주입 해제
- SSG HTML 템플릿에 sidecar 컨테이너 엘리먼트 삽입
- 확인: dev 서버(`pnpm --filter @openhow/viewer dev`) 에서 샘플 페이지에 `:::figure-side` 2개 넣고 스크롤 시 우측 이미지 전환, 좁은 뷰포트(<1440px)에서 sidecar 숨김 + 인라인 표시

### Step 3: bootpay-contents/blog smoke sample
- `payment-intro/payment-basics.md` 2곳에 `:::figure-side` 블록 추가 (placeholder 이미지 URL)
- 확인: `cd youtube/channels/bootpay-contents/blog && openhow serve` → localhost:3600/payment-intro/payment-basics 접속 → 스크롤 시 우측 이미지 연출 확인

## MUST NOT

- 본문 뷰포트 중앙정렬 깨뜨리는 레이아웃 변경 (유저 메모리 하드 제약)
- `TableOfContents` 컴포넌트 삭제 (UnifiedLayout 주입만 해제)
- 좌측 nav 구조 수정
- 기존 `:::endpoint`/`:::responsibility`/`:::canvas-*` 파서 동작 변경
- `md-code-group` / 기존 탭 핸들러 수정
