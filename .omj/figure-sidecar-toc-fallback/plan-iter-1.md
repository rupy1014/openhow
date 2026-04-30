---
intent: figure-sidecar-toc-fallback
iter: 1
created: 2026-04-30
---

# Plan — figure-sidecar-toc-fallback (iter 1)

## Goal

`type: blog` / `type: docs` 워크스페이스의 우측 figure-sidecar 슬롯을, **페이지에 figure 블록이 0개일 때 TOC로 자동 폴백**시킨다 (figure ≥1 페이지는 기존 sidecar 그대로).

## Architecture Decision

- **선택 (SPA)**: ImageSidecar 컴포넌트 자체에서 figure 블록 카운트가 0이면 `<TableOfContents />` 를 그 자리에 렌더 — `MutationObserver` + scroll-compute 가 이미 갖춰진 dispatcher 안에서 figure↔TOC 전환을 함께 처리. UnifiedLayout 슬롯 분기는 그대로 유지.
- **거절 (SPA)**: 마크다운 파서가 페이지 메타에 `figureBlockCount` 노출 → 라우트 전환마다 별도 동기화 부담. 컴포넌트 내부 분기보다 추적 surface 큼.
- **선택 (SSG)**: `template.ts:135` 의 `useFigureSidecar = (isBlog || isDocs) && hasFigures` 로 좁힘. `hasFigures` 는 articleHtml 에서 `data-figure-src` / `data-figure-tabs` 정규식 occurrence 로 계산. 별도 파이프라인 단계 추가 X.
- **거절 (SSG)**: `BuildPageHtmlParams` 에 `hasFigures` 플래그 신설 → 호출자가 미리 카운트해서 넘김. articleHtml 1회 정규식이 더 자연스럽고 호출자 변경 0.
- **헤딩 0 + figure 0 페이지**: 기존 `figure-sidecar-panel--empty` placeholder 그대로 (slot collapse 안 함) — 페이지 간 width-jump 회피.

## Files to Modify

### Existing (SPA)
- `core/packages/viewer/src/components/ImageSidecar.tsx` — figure 블록 카운트 0 감지 시 `<TableOfContents />` 분기. MutationObserver dispatcher 에 카운트 결과 노출.

### Existing (SSG)
- `core/packages/cli/src/ssg/template.ts:135` — `useFigureSidecar` 분기에 `hasFigures` 추가 (articleHtml 정규식). figure 0 → 기존 `params.tocHtml` else 가지로 자연 fallback.
- `core/packages/cli/src/ssg/hydrateScript.ts` — `initFigureSidecar()` 가 `.ssg-figure-sidecar` 패널이 없을 때 안전히 no-op 하는지 확인만 (이미 그럴 가능성 큼; 변경 필요 시 가드 추가).

### Tests
- `core/packages/cli/src/ssg/template.test.ts` — articleHtml 에 figure 블록 없을 때 `ssg-toc-wrap` 으로 렌더, 있을 때 `ssg-figure-sidecar` 로 렌더 케이스 추가.
- `core/packages/viewer/src/components/ImageSidecar.test.tsx` (없으면 신규) — figure 블록 0개 마운트 시 TOC가 보이고, 1개 추가 시 sidecar로 전환되는 케이스.

### Smoke (수동/Playwright)
- `integration.md` (figure 0) → 우측 TOC + sticky 하이라이트.
- `payment-basics.md` (figure ≥1) → 우측 sidecar 유지.

## Estimated Scope

- 4–6 files, ~80–150 LOC
- Codex steps: 3 (SPA / SSG+test / smoke)

## Reference

- `core/article-image-sidecar` iter4 — figureSidecarSlot, FIGURE_BLOCK_SELECTOR, MutationObserver dispatcher 자산 재사용
- `template.ts:135-140` — useFigureSidecar 분기 진입점
- `TableOfContents.tsx` — `useProjectStore.tocHeadings` 읽고 active heading 하이라이트 (라우트 자동 갱신)
