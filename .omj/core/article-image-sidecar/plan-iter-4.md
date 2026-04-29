# Plan — article-image-sidecar (iter 4)

## Goal

모바일 (≤767px) figure-sidecar 페이지에서 본문이 viewport 전체 폭을 차지하게 — `pub-preset-body--*-panel.has-right-aside` combo 셀렉터의 1679px 분기가 1279/767 단계 collapse 규칙을 cascade 에서 이기지 못하도록 specificity 조정.

## Architecture Decision

- **선택**: 1279px @media block 의 `--two-panel` / `--three-panel` / `--main-nav-only` collapse 규칙에 `.pub-preset-body--has-right-aside` combo 셀렉터 추가 (specificity 0,2,0 으로 1679 분기와 동급 + 더 좁은 viewport 분기가 cascade 후순위라 이김).
- **거절**: 모바일에서 right-aside 컬럼만 grid-template-columns 에서 제거 (예: `var(--main-nav-width) var(--publication-nav-width) 1fr`) — 이미 1679 분기가 그렇게 처리하고 있으나 200+200=400px 가 375px viewport 를 넘어 본문이 0px 됨. 단일 1fr collapse 가 정답.

## Files to Modify

### Existing
- `core/packages/viewer/src/layouts/PublicationPreset.css` — `@media (max-width: 1279px)` block 의 grid-collapse 규칙에 `.pub-preset-body--has-right-aside` combo 셀렉터 변형 추가
- `core/packages/cli/src/ssg/ssgStyles.ts` — SSG 측 cascade 검증 (이미 `.ssg-main:has(.ssg-figure-sidecar)` 1679 분기가 단일 컬럼 collapse 함; 외곽 `.ssg-layout` grid 의 모바일 collapse 누락 여부만 확인)

### Tests (smoke)
- `openhow serve` (port 3600) — Playwright 375×667 viewport 로 figure-sidecar 페이지 진입 → `.pub-preset-main` 실측 width = viewport width − padding 확인

## Estimated Scope

~30–60 LOC, 1–2 files, 1–2 Codex steps

## Reference

- `learnings-iter-3.md` → 2026-04-24 [signal] entry 의 Root cause 분석
- iter1 Step 5 (1679 cascade 수정) — 동일 패턴 반복 실수
- iter2 Step 5 (SSG 셀렉터 specificity 재발 + breakpoint drift) — SSG 미러 검토 시 참고

## Prerequisites

- `openhow serve` 실행 가능 (port 3600)
- Playwright 모바일 viewport smoke 가능
