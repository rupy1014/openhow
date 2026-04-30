---
status: killed
created: 2026-04-30
updated: 2026-04-30
iteration: 1
related: creator-platform-discovery.md, core/nav-rail-policy.md, core/bloglayout-removal.md, core/members-only-ssg-gate.md
killReason: '사용자가 cohort-online + two-panel 방향 뒤집고 blog 단순 sidebar 유지'
---

# 클로더즈 인강 워크스페이스 마이그 — `blog` → `course (cohort-online)` + 이중 nav

## Why

clauders.ai 는 **4주 기수제·멤버쉽 기반 비동기 인강** 인데 워크스페이스 type 이 `blog` 로 잡혀있다. 도메인 본질과 type 이 어긋나서 두 가지 부작용이 동시에 보인다.

1. **SSG 사이드바가 일중구조** — `buildBlogSidebarHtml` (`core/packages/cli/src/ssg/buildNavigation.ts:194`) 분기로 flat 한 한 줄 사이드바만 그림. SPA 셸로 가는 `openhow.io/w/jobdori-clauders-book` 은 같은 `type: blog` 인데 `UnifiedLayout` 자체 로직으로 이중 nav 처럼 보여서 사용자가 **렌더 비대칭** 을 직접 체감.
2. **인강 인프라 미활용** — `course` type 만 가진 cohortId / membershipSpaceId / classPreset 페이월 인프라 (`core/packages/worker/src/lib/permissions.ts`, `core/packages/worker/src/routes/workspaces.ts:206-208`) 를 못 씀. `freePreviewDocs: 4` 로 doc 단위 미리보기만 흉내내는 중.

`creator-platform-discovery.md` 에서 v1 [validated] 로 정한 **8 프리셋 중 cohort-online (async + 기수제 + online)** 가 clauders.ai 에 정확히 맞는 첫 적용 사례다. 이 의도는 그 모델을 **운영중 워크스페이스에 적용** 하는 것 — discovery 가 모델 정립이라면 본 의도는 그 모델의 첫 실전 마이그.

핵심 질문: **type 의미 정렬 (course/cohort-online) 과 nav 형태 (이중구조) 를 분리된 두 결정으로 풀되, SSG 가 `navigation.mode` 옵션을 실제로 honor 하게 만들어 한 운영 knob 으로 제어 가능하게 한다.**

## What

### v1 — clauders.ai 한 워크스페이스 마이그 + SSG nav.mode honor

- [validated] **`type: blog` → `type: course` 전환 (`examples/clauders.ai/openhow.json`)** + `classPreset: 'cohort-online'` 추가 + **결제 단위 = `cohortId`** (사용자 결정 2026-04-30 — 가격정책이 기수마다 달라질 수 있음, 따라서 `membershipSpaceId` 통째 결제 X) → **metric: clauders.ai publish 후 worker 의 cohort 권한 인프라가 cohort 단위로 페이월 동작, 4기 결제자가 5기는 별도 결제하도록 분리**

- [validated] **다기수 누적 모델 = 단일 워크스페이스 + `cohortId` 분리** (사용자 결정 2026-04-30) — clauders.ai 한 워크스페이스에 cohort 1, 2, 3 ... 누적. 콘텐츠는 share, 결제·접근 권한은 cohort 단위로 분리. 5기는 새 cohort row 추가 + 가격 별도 책정 → **metric: 한 워크스페이스에서 여러 cohort 운영 가능, cohort 별 doc 접근 제어 + cohort 별 가격 설정**

- [hypothesis] **SSG 가 `navigation.mode: 'two-panel'` 를 실제로 honor** — 현재 `buildSidebarHtml` 은 `workspaceType === 'blog'` 만 분기 (`buildNavigation.ts:194`). `navigation.mode` 가 `'two-panel'` 이면 type 무관하게 두-패널 시멘틱으로 렌더하도록 분기 수정. 사용자 직관과 `feedback_product_vs_policy_knob` 정렬 — nav 는 운영 knob 이지 type 결정이 아니다 → **metric: `class.clauders.ai/` SSG HTML 에서 main nav (섹션 호퍼) + sub menu (현 섹션의 doc 트리) 가 좌측 두 레일로 분리 렌더, `nav-rail-policy.md` 의 폭 정책 (L1=200/L2=200 또는 차등) 그대로 적용**

- [hypothesis] **`freePreviewDocs: 4` 정책 유지** — course type 이어도 비회원 SEO/판매 깔때기 4개는 그대로. 멤버 게이트는 5번째 doc 부터 → **metric: 비회원이 첫 4 doc 까지 정상 열람, 5번째에서 페이월 표시 + 좌측 카탈로그/nav 는 전체 노출 (`project_paywall_catalog_visibility` 정책 유지)**

- [hypothesis] **SPA `WorkspaceHub` 의 `TWO_PANEL_TYPES` 에 `course` 추가** (`core/packages/viewer/src/components/WorkspaceHub.tsx:9-10`) — SSG 와 SPA 가 같은 워크스페이스 type+nav.mode 조합에서 동일한 nav 형태로 렌더되어야 사용자가 도메인 전환 시 비대칭을 안 느낌 → **metric: 같은 워크스페이스를 `class.clauders.ai/` (SSG) 와 `openhow.io/w/{slug}` (SPA) 양쪽에서 봤을 때 nav 레이아웃 동일**

- [hypothesis] **단계적 마이그 (publish 단위 비파괴)** — `examples/clauders.ai/openhow.json` 변경 → `openhow publish` → 이슈 발생 시 `git revert` 로 즉시 복귀 가능. 운영중 도메인이지만 publish 가 R2 덮어쓰기라 롤백 비용 낮음. 단 D1 의 workspace.type 컬럼이 publish 시 갱신되는지 확인 필요 → **metric: 마이그 commit 1개로 전환 가능, revert 1개로 복귀 가능, D1 workspace.type 도 함께 갱신됨**

## Not

- **SPA `course` hub 화면 신규 디자인** — `WorkspaceHub` 의 `course` type 전용 랜딩(과정 카드 그리드 등) 은 별도 의도. 이번엔 `TWO_PANEL_TYPES` 추가로 nav 형태만 맞춤.
- **결제 / 멤버쉽 / cohort 판매 surface 신규 구현** — `course` type 의 worker 인프라는 이미 있음. clauders.ai 에 실제 결제 흐름 붙이는 건 별도 의도 (`creator-platform-discovery` 의 게시판 / 학생 콘텐츠와 묶어 진행).
- **8 프리셋 전체 노출** — v1 은 `self-paced / cohort-online / cohort-offline` 3개만 (discovery v1 [validated]). live/hybrid/정기/일회성/멘토링/멤버십 type 추가는 v2 backlog.
- **customDomain 셀프서비스** — clauders.ai 처럼 운영자 본인 도메인은 유지하되, 일반 사용자에게 셀프서비스 노출은 v2 (discovery 결정).
- **clauders-book 도서 원고와의 콘텐츠 동기화** — `project_clauders_book_restructure` 와는 별개 자산. 콘텐츠 소스가 겹치면 후속 의도에서 다룸.

## Context

### 코드 지점
- **type schema**: `core/packages/types/src/config.ts:1` `WorkspaceType = 'docs'|'course'|'team'|'blog'|'wiki'|'project'`. `course` 의 default `contentWidth: 'landing'` 이라 article 글 폭과 다름 — `examples/clauders.ai/openhow.json` 에 `contentWidth: 'article'` 명시 필요할 수 있음.
- **nav schema**: `core/packages/types/src/config.ts:136` `NavigationConfig.mode: 'sidebar'|'two-panel'|'three-rail'` — 이미 정의돼 있으나 SSG 가 honor 하지 않음.
- **SSG sidebar 분기**: `core/packages/cli/src/ssg/buildNavigation.ts:194` `if (params.workspaceType === 'blog') return buildBlogSidebarHtml(params)`. 여기에 `navigation.mode === 'two-panel'` 우선 분기 추가 검토.
- **SPA two-panel 매핑**: `core/packages/viewer/src/components/WorkspaceHub.tsx:9-10` `TWO_PANEL_TYPES = ['docs', 'wiki']` — `course` 추가, 또는 `nav.mode` 기반으로 재설계.
- **Worker 권한**: `core/packages/worker/src/lib/permissions.ts` — courseId/cohortId/membershipSpaceId 페이월 인프라.
- **classPreset validation**: `core/packages/worker/src/routes/workspaces.ts:206-208` `'self-paced' | 'cohort-online' | 'cohort-offline'`.

### 사전 결정 (재확인 불요)
- **8 프리셋 모델** — discovery v1 [validated]. clauders.ai = `cohort-online` 으로 확정.
- **이중 nav = 운영 knob** — type 결정과 분리. `navigation.mode` 옵션으로 처리.
- **페이월 노출 정책** — 페이월 본문 가려도 좌측 카탈로그/nav 는 비회원에게 노출 (`project_paywall_catalog_visibility`).
- **결제 단위 = cohort 단위** (2026-04-30 사용자 결정) — 가격정책이 기수마다 달라질 수 있어 cohort 마다 별도 가격·결제. `membershipSpaceId` 통째 결제는 v2 backlog.
- **다기수 누적 모델 = 단일 워크스페이스 + cohortId 분리** (2026-04-30 사용자 결정) — 5기, 6기는 같은 clauders.ai 안에 cohort row 추가. 콘텐츠는 share, 결제·접근만 cohort 단위.
- **`freePreviewDocs: 4` 유지** — 비회원 SEO 깔때기는 cohort 결제 모델과 직교적으로 작동.

## Backlog

- 8 프리셋 전면 노출 (v2) — `self-paced` 외 5개 프리셋 워크스페이스 setting UI 추가
- 결제 / 멤버쉽 / cohort 판매 surface — clauders.ai 에 실제 결제 버튼·주문 흐름 붙이기 (별도 의도)
- SPA `course` hub 랜딩 신규 디자인 — `WorkspaceHub` 의 course 전용 카드 그리드
- clauders-book 도서 ↔ clauders.ai 콘텐츠 동기화
- 학생 게시판 surface (discovery v1 hypothesis)

## Footprint

### 2026-04-30 — iter 1 build
- `core/packages/types/src/config.ts` (kind: types) — `MdshareConfig.classPreset` 필드 추가
- `core/packages/cli/src/ssg/buildNavigation.ts` (kind: code) — `BuildSidebarHtmlParams.navigationMode` 추가, 새 `buildTwoPanelSidebarHtml` 함수, `buildSidebarHtml` 진입부에 `navigationMode === 'two-panel'` 우선 분기
- `core/packages/cli/src/ssg/buildNavigation.test.ts` (kind: test) — 두-레일 렌더 + blog fallback 회귀 테스트
- `core/packages/cli/src/ssg/buildHtml.ts` (kind: code) — `navigationMode` 를 `buildSidebarHtml` 와 `buildPageHtml` 양쪽에 propagate
- `core/packages/cli/src/ssg/template.ts` (kind: code) — `<body>` 에 `data-nav-mode` 속성, `BuildPageHtmlParams.navigationMode` 추가
- `core/packages/cli/src/ssg/ssgStyles.ts` (kind: code) — `body[data-nav-mode="two-panel"]` 두-레일 grid + `.ssg-main-nav-rail` / `.ssg-sub-nav-rail` 스타일, mobile 768px 세로 스택, SPA 와 동일한 디자인 토큰 (`--gray-700`, `--active-link-bg` 등) 사용
- `examples/clauders.ai/openhow.json` (kind: config) — `type: blog` → `type: course` + `classPreset: cohort-online` + `contentWidth: article` + `navigation.mode: two-panel`. `freePreviewDocs: 4` 유지

## Learnings

### 2026-04-30: seed created (iteration 1)
- **Background**: clauders.ai 는 운영중인 4주 기수제 인강이지만 `type: blog` 로 잡혀 있어, SSG 사이드바 일중구조 + 인강 인프라 미활용 두 부작용이 동시에 노출됨. `class.clauders.ai/` (SSG) 와 `openhow.io/w/jobdori-clauders-book` (SPA 셸) 양쪽이 같은 type 인데 nav 가 달라 보이는 비대칭이 사용자에게 직접 보였던 게 트리거.
- **Why-비교 결과**: `creator-platform-discovery.md` 와 Why 가 겹치되 angle 다름 — discovery = 플랫폼 차원의 8 프리셋 모델 정립, 본 의도 = 그 모델의 첫 워크스페이스 적용. parent 로 묶고 별도 의도 유지.
- **8 프리셋 검증 [validated]**: 사용자 직감대로 8 프리셋이 이미 정의돼 있었음 (discovery 의 `클래스 유형 = 3차원 + 8 프리셋`). v1 노출은 3개 (`self-paced / cohort-online / cohort-offline`), clauders.ai = cohort-online.
- **운영 knob 분리 [validated]**: 이중 nav 는 `navigation.mode: 'two-panel'` 운영 knob 이지 type 결정 아님. `feedback_product_vs_policy_knob` 정렬.

### 2026-04-30: 결제·다기수 결정 (clarified)
- **결제 단위 = cohort 단위** (사용자 결정) — 기수마다 가격정책이 달라질 수 있어 cohort 마다 별도 가격·결제. `membershipSpaceId` 통째 결제는 v2 backlog.
- **다기수 누적 = 단일 워크스페이스 + cohortId 분리** (사용자 결정) — 5기·6기는 같은 clauders.ai 안에 cohort row 추가. 콘텐츠는 share, 결제·접근만 cohort 단위로 분리.
- **파급**: 4번째 hypothesis (SPA `TWO_PANEL_TYPES` 에 `course` 추가) 가 SSG/SPA 비대칭 해소 핵심. 5번째 (`freePreviewDocs: 4` 유지) 는 비회원 SEO 깔때기로 cohort 결제 모델과 직교 작동 — hypothesis 유지.
- **상태 전이**: seed → clarified. What 의 핵심 갈래가 사용자 결정으로 정렬됨. auto-continue to build 진입.
