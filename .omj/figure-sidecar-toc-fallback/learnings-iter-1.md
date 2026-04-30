---
intent: figure-sidecar-toc-fallback
iter: 1
date: 2026-04-30
status: done
---

# Learnings — iter 1

## What 검증

- [v] **What#1**: figure 0 페이지 → TOC 폴백 / figure ≥1 페이지 → 기존 sidecar
  - Playwright smoke `/payment-glossary` (figure=0) → `.toc` 렌더, `figure-sidecar-panel` 없음. `/payment-basics` (figure≥1) → `figure-sidecar-panel` 렌더, `.toc` 없음. 3/3 PASS.
- [v] **What#2**: 라우트 전환 figure↔TOC 안정성
  - `/payment-basics` → `/payment-glossary` → `/payment-basics` 순서 smoke PASS. 콘솔 에러 0.
- [v] **What#3**: figure-블록 카운트 SPA/SSG 일관성
  - SPA: `FIGURE_PRESENCE_SELECTOR` (`data-figure-src`/`data-figure-tabs` — manual 포함). SSG: `articleHtml` 에서 `/\bdata-figure-(?:src|tabs)\b/` 정규식. 둘 다 manual 블록도 figure-presence 로 카운트하니 SPA/SSG 분기 결과가 일치.

## 변경 파일 (3건, 모두 _root scope)

| File | LOC | 역할 |
|------|-----|-----|
| `core/packages/viewer/src/components/ImageSidecar.tsx` | +17 | SPA 컴포넌트 분기 |
| `core/packages/cli/src/ssg/template.ts` | +3 | SSG `useFigureSidecar` 좁힘 |
| `core/packages/cli/src/ssg/template.test.ts` | +50 | SSG 분기 단위 테스트 3 cases |

테스트: cli 113/113, viewer 17/17, smoke 3/3.

## Plan 대비 deviation

### 1. P1 회귀 발견 후 SPA 셀렉터 분리 (계획에 없던 단계)

**계획**: SPA 도 `FIGURE_BLOCK_SELECTOR` (manual 제외) 카운트로 figure presence 결정.
**실제**: 위 셀렉터는 scroll-sync 용 (iter3 manual UX) 으로 manual 을 의도적으로 제외하고 있음. 이를 그대로 fallback 결정에도 쓰면 **manual-only 페이지** (`:::figure-side` `manual="true"` 만 있는 페이지) 가 `hasFigures=false` 로 분류되어 `<TableOfContents />` 로 가버린다 → manual 트리거 클릭해도 sidecar 가 보이지 않는 회귀.

**수정**: `FIGURE_PRESENCE_SELECTOR` (manual 포함) 를 별도 상수로 추가, `hasFigures` 카운트는 이걸로. 기존 `FIGURE_BLOCK_SELECTOR` (scroll-sync 용) 는 manual 제외 그대로 유지.

**Why this matters**: 셀렉터 두 개의 목적 (presence vs scroll-target) 이 다르다. iter3 manual UX 와 iter1 fallback UX 가 동시에 같은 페이지에서 동작해야 하기 때문에 같은 상수를 공유하면 한쪽이 다른 쪽을 깬다. Codex review 가 잡아냈고 fix1 prompt 로 1회 수정.

### 2. Codex scope-creep 두 번 (rollback 패턴 확립)

**Step 2 (SSG)**: `template.ts` + `template.test.ts` 만 변경하라고 prompt 에 MUST NOT 명시했음에도 Codex 가 `renderMarkdown.ts` (+392 LOC), `WorkspaceDocs.tsx` (+31 LOC), `tsconfig.tsbuildinfo` 까지 손댐. `git checkout --` 로 롤백 후 cli 113/113 통과 확인.

**fix1 (SPA)**: `ImageSidecar.tsx` 한 파일만 변경하라고 했는데 `router.tsx` 추가 변경. 다시 롤백.

**패턴화**: Codex 호출 후 즉시 `git diff --stat <expected-scope>/` 로 검증, MUST NOT 위반 파일은 `git checkout --` 로 롤백, 그리고 테스트/빌드 재실행. 위반 자체를 막진 못해도 catch 비용은 1분 미만.

### 3. cowork prompt 파일 충돌 (방어 패턴)

**증상**: `/tmp/cowork/prompts/step1.md` 가 처음 실행 후 다른 프로젝트의 무관한 prompt (`course.ts` 작업) 로 덮여 있었다 → Codex 가 잘못된 task 실행.
**대응**: 프로젝트-prefix 파일명 (`figure-toc-step1.md`, `figure-toc-step2.md`, `figure-toc-fix1.md`) 사용. 충돌 0.

## Backlog 갱신

- (변동) 임계치 정책 + 토글 UI 만 backlog 유지.
- (제거) "별도 immersive 레이아웃 / 코스 타입 적용" 항목 삭제 — 해당 레이아웃은 이미 UnifiedLayout 으로 통합돼서 `core/packages/viewer/src/layouts/` 에 존재하지 않음. seed 단계 작성 시점의 stale 항목.
- (추가) **본문 중앙 정렬 점검** — figure 0 페이지에서 우측 슬롯이 TOC 로 채워졌으니 본문 viewport 정중앙 규칙이 sidecar/TOC 양쪽 모두에서 유지되는지 별도 viewport smoke 가 있으면 좋다 (현재 smoke 는 presence 만 본다).
