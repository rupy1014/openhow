---
status: superseded
created: 2026-04-20
updated: 2026-04-20
iteration: 1
supersededBy: core/nav-mode-collapse.md
---

# nav-rail-policy — 2-rail 폭 정책 + 모드별 스타일 명확화

## Why

현재 2레일 워크스페이스는 `--main-nav-width` = `--publication-nav-width` = **200px** 로 **동일**. L1(섹션 호퍼) 과 L2(컨텐츠 트리) 가 시각적 무게가 같고 둘 다 답답 — 제품 문서 1~2단 + 긴 제목 환경에서 눈이 깊어진 폴더 경로를 쫓다가 끊김.

`.omj/core/three-rail-nav.md` (iter 1, done) 는 3-rail 에서 **레일별 역할 차등화** 를 이미 합의 — L1 Track 72px icon-first / L2 Product 180px / L3 Feature 220px. 그런데 2-rail 은 그 합의의 바깥에 있어서 같은 프로젝트 안에서 **2-rail 과 3-rail 의 L1 시각 언어가 완전히 달라짐**. 사용자 요구:

> "애초에 nav 가 3개인지 2개인지에 따라 스타일이 명확히 정해져야해"

즉 모드 분기 정책을 **양쪽 다** 명시해서 한 프로젝트에서 2-rail 도 3-rail 도 "왜 이 폭인지" 의 답이 같은 설계 원리로 나오게 한다.

## Context

**Blocking 해제됨 (2026-04-20)**: `core/bloglayout-removal.md` iter 1 done — BlogLayout.css 삭제. 이 intent 는 `main.css` + `PublicationPreset.css` **2파일** 범위로 실행 가능.

**부모 intent**: `core/three-rail-nav.md` (iter 1, done). 3-rail 레일 차등화 원리를 이미 확립. 이 intent 는 그 원리를 2-rail 에도 적용해서 **모드 간 일관된 rail 정책** 을 만듦.

**현재 상수 (core/packages/viewer/src/styles/main.css)**:
- `--publication-nav-width: 200px`
- `--main-nav-width: var(--publication-nav-width)` — alias, 동일 폭
- `--content-reading-max: 740px`
- 중앙정렬 breakpoint: `2 × 200 + 740 = 1540px` (ghost right-padding 수식 기준)

**3-rail 에서 이미 합의된 원리** (three-rail-nav 에서 발췌):
- L1 = 트랙 스위칭 전용 → icon-first, 최소폭
- 워크호스 레일 = 트리 스캔 전용 → 충분히 넓게
- ghost right-padding 으로 본문 중앙 유지

**2-rail 의 현실**:
- L1 (MainNav) 역할 = 섹션 호핑 (docs/blog/course 같은 top-level)
- L2 (Sidebar) 역할 = 현재 섹션 내부 페이지 트리
- 둘의 항목 수 · 체류 시간 · 정보 밀도 가 다름 — 같은 폭을 줄 이유 없음

**제약 (three-rail-nav 와 공유)**:
- 본문 브라우저 정 가운데 고정 (ghost right-padding 기법 그대로)
- 기존 레이아웃 셸 · 스캐너 출력 shape 무변화
- AdminLayout 범위 밖

**확정 옵션: B — 역할별 차등 (label 유지)**.
- L1 MainNav = **150px** (label 유지, 현재 200 → 50px 좁힘)
- L2 Sidebar = **260px** (현재 200 → 60px 넓힘)
- 합 410px (현재 400). 중앙정렬 breakpoint: `2 × 410 + 740 = 1560px` (현재 1540 → +20px, 사실상 무변화)
- **원칙**: L1 은 호핑, L2 는 스캔. 폭 차이가 역할 차이를 드러냄
- Icon 도입 안 함 — three-rail-nav backlog 항목은 독립

## What

- [validated] **`main.css` CSS 변수 분리** — `--main-nav-width` 를 `--publication-nav-width` alias 에서 분리해서 독립 값으로. `--publication-nav-width: 260px`, `--main-nav-width: 150px`. `--nav-width` alias 는 `--publication-nav-width` 로 유지 (Sidebar 의미). → **metric: `grep -rn "main-nav-width: var" src/styles/main.css` 결과 0**
- [validated] **Ghost right-padding 수식 수정** — `PublicationPreset.css:54` 와 `BlogLayout.css:257, 268` 의 `2 * var(--main-nav-width)` 를 `calc(var(--main-nav-width) + var(--publication-nav-width))` 로 교체. asymmetric 레일 합으로 정확한 ghost 폭 계산. → **metric: 2-rail 워크스페이스(blog / docs) 에서 본문이 viewport 중앙에서 ±4px 이내**
- [validated] **DocumentPreset 정합성 확인** — `DocumentPreset.css:25-26, 52-53` 는 `--main-nav-width` + `--nav-width` 조합 사용 중. `--nav-width` = `--publication-nav-width` alias 라 자동으로 150 + 260 = 410px 로 따라옴. ghost-padding 수식이 `--doc-left-total` 을 쓰는지 재확인 후 필요시 보정. → **metric: document preset 페이지에서 본문 중앙정렬 유지**
- [validated] **회귀 검증** — 기존 2-rail 워크스페이스(blog home / docs page / course page) 3종 + 3-rail 워크스페이스(있으면) 1종 시각 확인. 3-rail 쪽은 자체 변수(`--track-rail-width` 등) 기반이라 영향 없어야 함. → **metric: 각 preset 에서 본문 중앙 + L1/L2 폭 육안 변화 일치 + `pnpm build` 통과**

## Not

- **BlogLayout 의 레일 추가/삭제** — 폭만 조정, DOM 구조 불변
- **DocumentPreset 의 aside(TOC) 폭** — 별도 변수 (`--aside-width`), 이 intent 범위 밖
- **3-rail 의 폭 재조정** — three-rail-nav 에서 이미 확정 (72/180/220), 건드리지 않음
- **Mobile drawer 내부 IA** — 모바일은 `<768px` 에서 기존 드로어 동작 유지
- **워크스페이스별 폭 커스터마이즈** — `config.navigation.width` 같은 필드 도입 안 함. 전역 정책으로 충분
- **옵션 A (icon-first) 채택** — MainNav icon 채움 선행 필요해서 범위 초과. three-rail-nav backlog 와 별도 intent 로 언젠가
- **옵션 C (무차등 확대)** — "mode 에 따라 스타일 명확" 요구에 미흡. 기각

## Footprint

(None yet — auto-recorded after /omj:build)

## Backlog

- [ ] MainNav icon 세트 정의 (three-rail-nav backlog 와 공유)
- [ ] Mobile drawer 에서 L1 대응 (아마 현재대로 OK)
- [ ] DocumentPreset aside 와의 정합성 검증 (우측 aside 는 TOC 전용)

## Learnings

### 2026-04-20: seed → clarified (iteration 1)

- **옵션 B 확정**: L1 150 / L2 260 (역할별 차등, label 유지). 이유 — 사용자가 icon 도입(옵션 A) 의 선행 부담 없이 "답답함 해소 + mode 별 스타일 명확" 요구를 바로 충족하는 가장 경제적인 경로. 옵션 C 는 "mode 명확화" 요구를 절반만 만족해서 기각
- **중앙정렬 예산 변화 미미**: 410 vs 400 → 1560 vs 1540. 기존 ghost-padding 수식이 `2 * main-nav-width` 를 가정했던 부분만 asymmetric sum 으로 교정하면 됨. media query breakpoint 건드릴 필요 없음
- **3-rail 과 충돌 없음**: 3-rail CSS 는 `--track-rail-width` / `--product-rail-width` / `--feature-rail-width` 자체 변수. 이 intent 의 `--main-nav-width` / `--publication-nav-width` 변화는 2-rail 경로에만 영향
- **DocumentPreset 자동 정합**: `--nav-width` alias 가 `--publication-nav-width` 이므로 260 으로 자동 넓어짐. 다만 `--doc-left-total` 계산식이 `main-nav-width + nav-width` = 150 + 260 = 410 으로 따라옴 — 특별 수정 불필요

### 2026-04-20: seed created (iteration 1)

- **Background**: 3-rail 은 레일별 역할 차등화로 합의 (three-rail-nav iter 1 done) 됐지만 2-rail 은 여전히 L1/L2 모두 200px — 같은 프로젝트 내에서 2-rail 과 3-rail 의 L1 시각 언어가 불일치. 사용자가 "모드에 따라 스타일이 명확히 정해져야" 라고 요구
- **Initial analysis**: `main.css:41-43` 에서 `--publication-nav-width` 하나로 L1/L2 같은 폭을 유지. alias 구조라 모드 분기 삽입이 간단 (전역 변수 override). 중앙정렬 수식은 `2 × main-nav-width + two-panel-gap` 기반이므로 L1 이 바뀌면 수식 인자만 바뀜 — 구조 재설계 불필요
- **Design space**: 세 가지 방향 후보
  - **A. 3-rail 원리 이식 (icon-first)**: L1 72~100px icon-first + L2 260~280px. 모드 간 일관성 최대. 단 MainNav icon 필요 (three-rail-nav backlog 선행)
  - **B. 역할별 차등만 (label 유지)**: L1 140~160px label 좁힘 + L2 240~260px 확장. icon 필요 없음, 개념은 온건
  - **C. 둘 다 넓힘 (무차등)**: L1 220 + L2 260. 제일 안전하지만 "mode 명확화" 요구에 부족
- **Parent intent 관계**: three-rail-nav 와 같은 design space. 같은 CSS 변수 · ghost padding 수식 건드림. 하지만 Why 가 다름 (3단 IA 표현 vs 2-rail 답답함) → 병렬 intent 분리
