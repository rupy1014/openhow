---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
iter1_learnings: ./learnings-iter-1.md
---

# figure-sidecar — 이미지 없는 문서는 우측 영역을 TOC로 폴백

## Why

`type: blog` / `type: docs` 워크스페이스는 `core/article-image-sidecar` 적용 후 우측 레일이 항상 figure-sidecar 슬롯으로 점유된다. 본문에 `:::figure-side` / `:::figure-tabs` 블록이 하나라도 있으면 의도한 대로 동작하지만, **블록이 0개인 페이지에서는 우측이 빈 공간으로 남는다** (`.figure-sidecar-panel--empty { opacity: 0 }`로 보이지 않을 뿐 자리만 차지).

실 사례: `bootpay-contents/developer/payments/payment-window/integration.md` — 헤딩 20+ 개의 SDK 가이드인데 본문에 인라인 이미지가 하나도 없다. 우측이 그대로 비어있고 사용자는 "TOC가 왜 안 나오나" 라고 물었다 (`http://localhost:3500/payment-window/integration?platform=react+native`).

현재는 워크스페이스 단위로 `type` 을 `blog`로 잡으면 figure-sidecar가 전체 사이트에 강제 적용되는 구조라 텍스트 위주 가이드와 시각 자료 위주 가이드가 한 워크스페이스에 섞여 있을 때 선택지가 없다. **figure 블록 유무를 페이지 단위로 감지해서, 없으면 같은 슬롯에 TOC를 렌더**하는 게 자연스러운 폴백이다.

## What

- [v1] **페이지에 figure 블록이 0개면 우측 슬롯을 TOC로 채운다** — `:::figure-side` / `:::figure-tabs` 가 한 개도 없는 페이지에서 `<ImageSidecar />` 자리에 `<TableOfContents />` 컴포넌트를 렌더한다. SSG 미러도 동일. → **metric: integration.md 같은 figure-블록-없는 페이지를 1920×1080으로 열면 우측에 TOC 헤딩 리스트가 보이고, sticky 동작 (스크롤 시 현재 섹션 하이라이트)이 살아있다. payment-basics.md 같은 figure-블록-있는 페이지는 기존대로 figure-sidecar가 동작한다**

- [v1] **하이드레이션 안전성** — SPA는 라우트 전환 시 figure 블록 카운트가 바뀌면 sidecar↔TOC 전환이 깨지지 않아야 한다. SSG는 페이지별 정적 HTML이라 빌드 시점에 결정. → **metric: SPA에서 figure-블록-있는 페이지 → 없는 페이지 → 있는 페이지 순서로 라우팅해도 우측 슬롯이 정상 렌더 (figure↔TOC 전환에 빈 프레임 없음, 콘솔 에러 0)**

- [v1] **figure-블록 감지 로직 위치** — 마크다운 파싱 단계에서 `data-figure-src` / `data-figure-tabs` / `data-figure-id` 속성 보유 노드 수를 카운트해서 페이지 메타로 노출하거나, 컴포넌트 mount 시 DOM 쿼리 1회. 어느 쪽이 SPA/SSG 양쪽 일관성에 유리한지 Explore에서 결정. → **metric: 결정한 방법으로 카운트 = 0 일 때 TOC 분기, ≥1 일 때 sidecar 분기. 두 분기 모두 현재 viewport breakpoint(≤1679px hide, ≥1680px show) 규칙 그대로 따름**

## Not

- 워크스페이스 `type` 체계 변경 (blog/docs 외 새 타입 추가) — 페이지 단위 폴백으로 충분
- TOC 컴포넌트 자체 리팩터 — 기존 `<TableOfContents />` 그대로 재사용
- 사용자 토글 UI ("TOC 강제 표시" 같은 옵션) — 자동 폴백으로 1차 해결
- figure 사이드카 내부에 TOC 미니뷰 같이 보여주는 하이브리드 UI — 명료성 위해 둘 중 하나만 렌더
- 이미지가 있더라도 적은 페이지 (예: 1개)에 TOC를 같이 보여주는 임계치 정책 — 0/≥1 이분법으로 시작

## Context

### 관련 인프라

- **현재 슬롯 결정**: `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — `figureSidecarSlot` 상수가 PublicationPreset의 `rightAside` 로 주입 (3 곳, iter 2.5 / 7.1 정돈 결과)
- **SSG 슬롯**: `core/packages/cli/src/ssg/template.ts:135-140` — `useFigureSidecar = isBlog || isDocs` 분기에서 `<aside class="ssg-figure-sidecar figure-sidecar-panel figure-sidecar-panel--empty">` 무조건 삽입. 분기 자체를 페이지 단위로 정교화 필요
- **TOC 컴포넌트**: `core/packages/viewer/src/components/TableOfContents.tsx` (SPA), SSG 쪽은 `params.tocHtml` 로 이미 빌드 시 생성되어 있음 (`template.ts:138-140`의 else 가지)
- **마크다운 파서**: `core/packages/viewer/src/utils/markdown.ts` (`figureSideExtension` / `figureTabsExtension`), `core/packages/cli/src/ssg/renderMarkdown.ts` (SSG 미러)
- **figure 블록 셀렉터**: `FIGURE_BLOCK_SELECTOR` (`ImageSidecar.tsx`) — 이미 `[data-figure-src]`, `[data-figure-tabs]`, `[data-figure-id]` 를 인지

### 관련 intent

- `core/article-image-sidecar` (done, iter 4) — 본 intent의 base. 이 intent는 그 위에 0-figure 페이지 폴백 1단계만 추가
- `article-reading-ux` (seed) — "TOC 사이드바 감사" 항목이 article-image-sidecar 도입으로 한 번 무효화됐는데, 본 intent로 부분 부활하는 셈
- `nav-rail-policy`, `three-rail-nav` (done) — 좌측 레일 정책. 우측 폴백 결정에 좌측 레이아웃 영향 없음

### 미해결 설계 포인트 (Explore에서 풀 대상)

1. **블록 카운트 시점 (SPA)**: (a) 마크다운 파서가 페이지 메타에 `figureBlockCount` 노출 / (b) `<ImageSidecar />` mount 시 DOM 쿼리 1회 / (c) `MutationObserver` 로 라우트 전환마다 재카운트.
   → **권장 (b)+(c) 컴포넌트 자체 분기**: ImageSidecar 가 이미 `MutationObserver` + raf-throttled `compute()` 를 갖고 있고 (iter3, route-change 버그 해결 자산), `FIGURE_BLOCK_SELECTOR` 도 이미 `data-figure-src` / `data-figure-tabs` 를 인지. 동일 컴포넌트가 카운트 0 일 때 `<TableOfContents />` 를 렌더하면 라우트 전환 시 `figure↔TOC` 전환이 같은 dispatcher 안에서 처리됨. UnifiedLayout 의 `figureSidecarSlot` 결정은 그대로 두고, **컴포넌트 내부에서 분기**.
2. **SSG 시점**: 빌드 시점에 `articleHtml` 에서 `data-figure-src` / `data-figure-tabs` occurrence 를 정규식 카운트 → `template.ts:135` 의 `useFigureSidecar` 가 `(isBlog || isDocs) && hasFigures` 로 좁아짐. `hasFigures=false` 면 기존 else 가지 (`params.tocHtml` 사용) 로 자연 fallback. 별도 파이프라인 단계 불필요.
3. **헤딩 0 + figure 0 페이지**: 슬롯 hide 해서 본문 grid collapse 할지, 빈 placeholder 유지할지.
   → **iter1 결정: 빈 placeholder 유지** (`figure-sidecar-panel--empty { opacity: 0 }` 현재 동작 그대로). grid collapse 는 본문 width 가 갑자기 넓어져 페이지간 width-jump 이 보일 위험. 단순화 우선.
4. **하이브리드 페이지** (헤딩 20개 + figure 1개): 0/≥1 이분법으로 sidecar 채택 시 TOC 가치 손실. iter1 은 단순 이분법, iter2에서 임계치 (figure ≥3 일 때만 sidecar?) 또는 토글 검토.

### 첫 검증 페이지

- **figure 블록 0개 (TOC 폴백 기대)**: `youtube/channels/bootpay-contents/developer/payments/payment-window/integration.md`
- **figure 블록 ≥1개 (기존 sidecar 유지 기대)**: `youtube/channels/bootpay-contents/blog/payment-intro/understand/payment-basics.md` (iter3 manual-trigger smoke 페이지 — `:::figure-side` × 2 + `:::figure-tabs` × 1 보유)

## Footprint

### iter 1 (2026-04-30, done)

| File | Scope | Kind | Metric ref | Notes |
|------|-------|------|------------|-------|
| `core/packages/viewer/src/components/ImageSidecar.tsx` | _root | impl | What#1, #2, #3 | `FIGURE_PRESENCE_SELECTOR` 추가 (manual 블록 포함 카운트) + `hasFigures` state + `<TableOfContents />` 분기 |
| `core/packages/cli/src/ssg/template.ts` | _root | impl | What#1, #3 | `useFigureSidecar = (isBlog \|\| isDocs) && hasFigures` (articleHtml 정규식) |
| `core/packages/cli/src/ssg/template.test.ts` | _root | test | What#1 | figure-src/figure-tabs 분기 케이스 3개 추가 |

## Backlog

- 임계치 정책 (figure ≥N 일 때만 sidecar) — iter1 이분법 결정 후 회고
- 사용자 토글 UI (페이지별 TOC/sidecar 강제) — 자동 폴백이 부족할 때

## Learnings

상세는 `./learnings-iter-1.md` 참고.

### iter 1 핵심
- **manual-trigger UX 와 figure-presence 카운트 셀렉터 분리 필요**: `FIGURE_BLOCK_SELECTOR` 는 scroll-sync 용으로 manual 블록을 일부러 제외하고 있는데, fallback 결정에도 같은 셀렉터를 쓰면 manual-only 페이지가 false negative → TOC 폴백으로 가버려서 manual 트리거 클릭이 죽는다. presence 결정용 `FIGURE_PRESENCE_SELECTOR` 를 별도 상수로 두고 scroll-sync 용은 그대로 유지하는 게 정답.
- **SSG 정규식은 manual 구분 없이 OK**: SSG 쪽 `/\bdata-figure-(?:src|tabs)\b/` 는 manual 속성 유무를 신경쓰지 않으니 같은 회귀 없음. SPA 만 셀렉터 두 개로 분리하면 충분.
- **Codex scope-creep 두 번**: Step 2 (`renderMarkdown.ts`/`WorkspaceDocs.tsx` 임의 변경), fix1 (`router.tsx` 변경) — 모두 MUST NOT 명시했음에도 스코프 이탈. `git diff --stat` 검증 후 수동 롤백으로 처리. 다음 iter 부터는 prompt 에 "ONLY this file" 같은 화이트리스트 명시 + 검증 후 즉시 롤백 패턴 유지.
