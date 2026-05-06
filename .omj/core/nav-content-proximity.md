---
status: done
created: 2026-04-20
updated: 2026-04-20
iteration: 1
---

# nav-content-proximity — 넓은 뷰포트에서 nav 를 콘텐츠 가까이 스냅

## Why

현재 게시글 상세(`PublicationPreset`)에서 본문은 브라우저 정중앙에 고정(`ghost right-padding` 트릭)이라 **nav(2-rail/3-rail 공통)는 뷰포트 왼쪽 끝에 고정**된다. 1920px / 27" 모니터에서는 nav 와 본문 사이에 200~400px 의 의미 없는 공간이 생기고, 시선이 **nav 끝 → 공백 → 본문 시작** 세 점프를 뛰어야 함.

사용자 관찰:
> "본문은 브라우저 중앙, nav 가 2개냐 3개냐 할것없이 좌측에 있는데, 브라우저 공간이 여유가 있다면 너무 왼쪽에 배치하는게 아니라 가능한 콘텐츠에 가까이 계산해서 배치할 수 있나?"

nav 의 목적은 **스캔 → 선택 → 본문 이동**. 물리 거리가 멀수록 이 경로의 인지 비용이 커짐. "넓으면 넓을수록 더 멀어진다" 는 현재 동작이 역행적임.

## What

- [validated] **옵션 B 확정: Nav 스냅, 본문 중앙 유지** — 본문 위치 무변화. nav 의 left 만 `max(baseline, content_left − nav_width − gap)` 로 계산. 넓은 뷰포트에서 nav 가 오른쪽으로 따라와 공백이 닫힘. `three-rail-nav` "본문 정중앙" 제약 **유지**. → **metric: 사용자 결정 (2026-04-20)** ✓
- [validated] **구현 방식: body `padding-left` = shift + main `padding-right` += shift** — `--proximity-shift = max(0, (100vw−C)/2 − G − L)` 을 body 에 padding-left 로 적용해 grid 전체를 우측으로 밀고, main 의 ghost `padding-right` 에 동일 shift 를 더해 content 를 viewport 정중앙에 재잠금. grid-template-columns / nav 자체 위치는 무변화. → **metric: 1920/2560px 에서 content_center = viewport_center ±0px, nav↔content 실측 gap 36px (=proximity_gap 24 + column-gap 12)** ✓
- [validated] **proximity_gap 기본값 24px** — `--nav-content-gap: 24px` CSS 변수로 정의. 실측 총 gap = 24 + column-gap(12) = 36px. 본문 가독 경계 확보 + 시각적 "가까이" 달성. → **metric: 2560px 에서 36px, 494px → 36px 로 축소 (92% 감소)** ✓
- [validated] **2-rail / 3-rail 일관성** — `PublicationPreset.css` 의 `.pub-preset-body--two-panel`, `.pub-preset-body--three-panel`, `.pub-preset-body--main-nav-only` 3분기 + 1439px 태블릿 breakpoint(3-rail track-rail drop) 모두 같은 원리. 2-panel 공식의 `2 * main-nav-width` 를 `main-nav-width + publication-nav-width` 로 변경(nav-rail-policy 비대칭 준비). → **metric: 각 body 클래스 `grep proximity-shift` 매칭 + 빌드 통과** ✓
- [validated] **DocumentPreset 동일 원리 적용** — `.doc-preset-grid` base rule 에 `--proximity-shift` 정의 + `padding-left` + ghost `padding-right` 에 shift 추가. 1279px tablet breakpoint 에서 shift 비활성. → **metric: 빌드 통과 + base rule `grep proximity` 3+ 히트** ✓

## Not

- **본문이 중앙에서 이탈** — 하드 제약. 옵션 A(클러스터 중앙) 기각 사유. 본문은 항상 뷰포트 중앙 ±4px
- **본문 최대폭(`--content-reading-max: 740px`) 변경** — 가독성 튜닝은 별도 Why
- **Nav 폭 재조정** — `nav-rail-policy` 범위
- **좌→우 배치 반전** — nav 가 오른쪽으로 가는 변종은 아님
- **모바일/태블릿 (< 1280px)** — 이 영역은 기존 drawer/stacked 동작 유지. proximity 는 wide viewport 에서만 의미 있음
- **SSG 영향** — SPA 전용 관찰이라 우선 `PublicationPreset` 만. SSG 동일 문제면 iter 2 에서

## Context

**부모 intent**:
- `core/three-rail-nav.md` (iter 1, done) — "본문은 브라우저 정중앙에 고정" 하드 제약을 설정. 이 intent 의 옵션 A 는 그 제약을 **수정 제안**, B 는 **유지**.
- `core/nav-rail-policy.md` (iter 1, clarified) — 2-rail 폭 정책 (L1 150 / L2 260). 이 수치가 proximity 수식의 입력값.

**현재 ghost-padding 수식 (PublicationPreset.css:45-58)**:
```css
.pub-preset-body--two-panel > .pub-preset-main {
  padding-right: max(
    0.5rem,
    min(
      calc(2 * var(--main-nav-width) + 2 * var(--two-panel-gap, 1rem)),
      calc(100% - var(--preset-content-max, var(--content-reading-max)) - 0.5rem)
    )
  );
}
```
- 좌측 두 컬럼(MainNav + Sub) 폭만큼 main 오른쪽에 투명 패딩 → main-inner (`margin: 0 auto`) 가 뷰포트 중앙으로 이동
- 뷰포트가 커질수록 `100% - content - 0.5rem` 가 커져 ghost padding 이 계속 증가 → nav 와 content 간 공백도 같이 증가 (**문제의 근원**)

**영향 파일 (예상)**:
- `core/packages/viewer/src/layouts/PublicationPreset.css` — 2/3-panel ghost-padding 수식
- `core/packages/viewer/src/layouts/DocumentPreset.css` — 동일 패턴 가능성 있음
- `core/packages/cli/src/ssg/ssgStyles.ts` — SSG 동기화 (SPA/SSG 이중관리 규칙)

**제약**:
- 모바일/태블릿 동작 불변
- 기존 `--content-reading-max` 및 nav 폭 변수 재사용 (새 변수 최소화)
- 다크모드 / 스크롤 동기 / sticky 위치 영향 없어야

## Footprint

- `core/packages/viewer/src/layouts/PublicationPreset.css` — 2/3-panel + main-nav-only + 1439px 태블릿 breakpoint 에 `--proximity-shift` 도입, padding-left = shift, ghost `padding-right` += shift. 2-panel 공식 asymmetric 대응 (`2 * main-nav-width` → `main-nav + publication-nav`) (2026-04-20)
- `core/packages/viewer/src/layouts/DocumentPreset.css` — 동일 원리를 `--doc-left-total` 기반 공식에 적용. 1279px breakpoint 에서 비활성 (2026-04-20)

## Backlog
- [ ] 1440px 전후 오프센터 수정 — content 가 viewport_center 오른쪽으로 78px (pre-existing, 이 intent 밖). `--content-reading-max` 재정 또는 narrow viewport centering 로직 재검토
- [ ] SSG (`ssgStyles.ts`) 에도 proximity 반영 — SSG 는 정적 HTML + CSS 라 calc + 100vw 로 SPA 와 동일 동작 가능성
- [ ] `--nav-content-gap` 을 12px 로 조일지 사용자 피드백 수렴 후 결정 (현재 시각 gap 36px)
- [ ] 100vw 스크롤바 폭 이슈 — `100svw` 또는 `calc(100vw - var(--scrollbar-width, 0px))` 로 정밀화 (P3)

## Learnings

### 2026-04-20: seed created (iteration 1)
- **Background**: 2-rail UI 통일 작업(646623a) 직후, 넓은 뷰포트에서 nav-content 간 공백이 새로 거슬림을 사용자가 보고
- **Initial notes**:
  - `PublicationPreset.css` ghost-padding 수식이 "본문 중앙 + nav 좌측 고정" 의 원인
  - 옵션 A(클러스터 중앙) vs B(nav 스냅, 본문 중앙 유지) 가 실질 분기점
  - 부모 intent `three-rail-nav` 의 "본문 정중앙" 제약을 건드릴지 여부가 옵션 A/B 결정과 동치

### 2026-04-20: option B confirmed (iteration 1)
- **[signal] 사용자 결정**: "본문은 우측으로 밀리면 안돼" → 옵션 B 확정. 본문 중앙정렬은 하드 제약으로 남김
- **의미**: `three-rail-nav` 의 "본문 정중앙" 제약이 **강화**됨 (옵션 A 기각으로 공식화). proximity 는 nav 쪽 offset 으로만 구현
- **남은 분기**: (1) 구현 메커니즘 — ghost-padding 을 어떻게 cap 할지 (grid column auto / main margin-left / 별도 nav offset 변수), (2) proximity_gap 수치, (3) 다른 preset 영향 범위

### 2026-04-20: clarified → build (iteration 1)
- **[signal] 사용자 결정**: "구현방식은 알아서 해줘. 구현하자" → 구현 메커니즘 선택을 build 에 위임. proximity_gap 기본값 24px 로 잠정 (시각 여유 + 본문 가독 경계).
- **Build 진입 시 가이드**:
  - 본문 viewport-center 는 반드시 보존 (hard constraint)
  - `PublicationPreset.css` 의 `.pub-preset-body--two-panel` / `--three-panel` / `--main-nav-only` 3분기 모두 적용
  - wide viewport 기준점: `--publication-shell-max: 1360px` 를 넘는 순간부터 proximity 발동이 자연스러움 — 이 breakpoint 를 수식 내에 내장
  - 측정: playwright 로 1920/2560px 시 content 중앙 ±4px + nav↔content 간격 ≤ 50px

### 2026-04-20: build done (iteration 1)
- **구현 메커니즘 확정**: body `padding-left` = `var(--proximity-shift)` (grid 전체 우측 이동) + main `padding-right` 에 shift 추가 (ghost 보정). 수학적 증명: `content_center = main_start + (main_width − padding_right)/2 = V/2` 불변. grid-template-columns / media query 불변, 순수 calc() 기반.
- **실측 gap 36px, 목표 24px — 편차의 원인**: `--nav-content-gap` 은 "shift 계산식 변수" 지만 실제 시각 gap 은 `proximity_gap + column_gap(12px)` 이라 총 36px. PublicationPreset 의 column-gap 0.75rem 때문. DocumentPreset 은 column-gap 0 이라 순수 24px. 시각적으로 "가까이" 기준 만족이라 accept. 사용자가 더 조이고 싶으면 iter 2 에서 `--nav-content-gap: 12px` 로 조정 가능.
- **Asymmetric rail 준비**: 2-panel ghost 공식을 `2 * main-nav-width` → `main-nav + publication-nav` 로 변경. `nav-rail-policy` (clarified, 150/260) 가 실행될 때 추가 수식 변경 불필요.
- **1440px 기존 오프센터 확인**: 측정 중 1440px 뷰포트에서 content_center 가 viewport_center 보다 78px 오른쪽에 있음을 발견. 이는 pre-existing 동작 (shift=0 이 정확히 원 공식과 동일). wide viewport 문제와 직교. iter 2 후보로 backlog 추가.
- **Codex review**: 37줄 중 블로킹 이슈 0건. 100vw 가 스크롤바 폭 포함한다는 P3 관찰 — 실제 ~17px 영향이지만 accept. main-nav-only 의 모바일 drawer 미작동은 pre-existing.
