---
intent: clauders-ai-course-migration
iteration: 1
created: 2026-04-30
---

# Plan — clauders.ai course migration + SSG navigation.mode honor

## Goal

clauders.ai 워크스페이스를 `type: blog` → `type: course (cohort-online)` 로 옮기고, **SSG 와 SPA 가 동일한 두-레일 nav 를 렌더하게** `navigation.mode: 'two-panel'` 운영 knob 을 SSG 가 honor 하도록 한다.

User constraint: **"SPA, SSG 불일치는 없어야 해."** — `class.clauders.ai/` (SSG) 와 `openhow.io/w/clauders` (SPA) 의 좌측 nav 구조·간격·active 상태가 시각적으로 동일해야 한다.

## Architecture Decision

| 결정 | 선택 | 사유 |
|------|------|------|
| type 변경과 nav mode 분리 | 두 결정 분리 | `feedback_product_vs_policy_knob` — type 은 도메인, nav 는 운영 knob |
| classPreset 노출 | `MdshareConfig.classPreset` 추가 | worker 측은 이미 enum validation 존재 (`workspaces.ts:206-208`); types 패키지 schema 만 누락 |
| SSG 두-레일 HTML 구조 | SPA `pub-preset-main-nav-panel` + `pub-preset-sub-sidebar` 와 1:1 대응 | DOM 구조 일치 → CSS 만 ssg- prefix 추가하면 시각 parity 확보 |
| 두-레일 분기 위치 | `buildSidebarHtml` 내부에서 `navigationMode === 'two-panel'` 우선 분기 | `workspaceType === 'blog'` 분기보다 앞. course 외 type 도 옵트인 가능 |
| 결제 단위 | cohortId | 가격정책이 기수마다 다를 수 있음 (사용자 결정) |
| 다기수 누적 | 단일 워크스페이스 + cohortId 분리 | 콘텐츠 share, 결제·접근만 cohort 단위 |
| SPA `WorkspaceHub` `TWO_PANEL_TYPES` 수정 | **제외 (backlog)** | 그것은 create-dialog 미리보기 cosmetic 만 영향, 실제 워크스페이스 렌더는 `navigation.mode` 가 결정 |

## Files to Modify

### 1. Types schema
- `core/packages/types/src/config.ts`
  - `MdshareConfig` interface 에 `classPreset?: 'self-paced' | 'cohort-online' | 'cohort-offline'` 필드 추가

### 2. SSG navigation honor (핵심)
- `core/packages/cli/src/ssg/buildNavigation.ts`
  - `BuildSidebarHtmlParams` 에 `navigationMode?: 'sidebar' | 'two-panel' | 'three-rail'` 파라미터 추가
  - `buildSidebarHtml` 진입부:
    1. `navigationMode === 'two-panel'` 이고 `mainNav` 가 비어있지 않으면 → 새 `buildTwoPanelSidebarHtml` 호출 (먼저 분기)
    2. `workspaceType === 'blog'` (기존)
    3. 기존 collapsible 분기 (그대로)
  - 새 함수 `buildTwoPanelSidebarHtml`: SPA `MainNav inlineSubItems={false}` + `Navigation items={effectiveSidebarItems}` 두 레일에 1:1 대응
    - 출력 HTML 구조:
      ```html
      <nav class="ssg-main-nav-rail" aria-label="Main navigation">
          {section labels — 클릭 시 섹션 첫 doc 으로 이동, 활성 섹션 표시}
      </nav>
      <nav class="ssg-sub-nav-rail" aria-label="Section navigation">
          {현재 활성 섹션의 sidebar items only — sub-tree 펼침}
      </nav>
      ```

### 3. SSG template — sidebarHtml 위치
- `core/packages/cli/src/ssg/template.ts`
  - 두 개의 `<nav>` 가 들어와도 정상 동작하는 구조 (현재 `<aside class="ssg-sidebar">` 안에 그대로 placement → CSS 가 grid 로 분리)
  - 또는 `body data-nav-mode="..."` 속성 추가 → CSS 가 `[data-nav-mode="two-panel"] .ssg-sidebar` 로 grid 처리

### 4. SSG buildHtml — 파라미터 propagation
- `core/packages/cli/src/ssg/buildHtml.ts:349`
  - `buildSidebarHtml({ ..., navigationMode: params.structure.config.navigation?.mode })` 추가
- 같은 파일에서 `buildPageHtml` 에 `navigationMode` 도 전달 (body data-attribute 용)

### 5. SSG CSS — 두-레일 시각 parity
- `core/packages/cli/src/ssg/ssgStyles.ts`
  - `body[data-nav-mode="two-panel"] .ssg-sidebar` → 가로 grid (rail1 + rail2)
  - `.ssg-main-nav-rail` / `.ssg-sub-nav-rail` 폭/패딩 — `nav-rail-policy.md` 의 L1=200/L2=200 (또는 차등) 적용
  - 다크모드, 모바일(< 768px) 세로 스택

### 6. clauders.ai config
- `examples/clauders.ai/openhow.json`
  - `"type": "course"`
  - `"classPreset": "cohort-online"`
  - `"navigation": { "mode": "two-panel" }`
  - `"contentWidth": "article"` (course 기본값 'landing' 오버라이드)
  - `"freePreviewDocs": 4` 유지

### 7. Tests
- `core/packages/cli/src/ssg/buildNavigation.test.ts`
  - `navigationMode === 'two-panel'` 인 경우 두 `<nav>` 엘리먼트 (`.ssg-main-nav-rail` + `.ssg-sub-nav-rail`) 가 출력되는지 snapshot
  - `navigationMode === 'sidebar'` 또는 미지정인 경우 기존 collapsible 동작 유지 회귀 테스트

## Estimated Scope

- **6 source files modified** (types/config.ts, cli/ssg/buildNavigation.ts, cli/ssg/template.ts, cli/ssg/buildHtml.ts, cli/ssg/ssgStyles.ts, examples/clauders.ai/openhow.json)
- **1 test file modified** (buildNavigation.test.ts)
- ~150-250 LOC net

## Verification (Phase 3)

1. `pnpm --filter @openhow/types build` — types 추가 컴파일
2. `pnpm --filter @openhow/cli build` — SSG 로직 컴파일
3. `pnpm --filter @openhow/cli test buildNavigation` — 두-레일 테스트 통과
4. **시각 parity**: `cd examples/clauders.ai && openhow publish` → `class.clauders.ai/` 와 `openhow.io/w/clauders` 두 쪽 좌측 nav 가 동일하게 두 레일로 렌더되는지 비교
5. `git diff --stat` — 변경 범위 6 파일 + 1 테스트 파일 확인

## MUST NOT

- SPA `WorkspaceHub.tsx` 수정 (backlog)
- worker `permissions.ts` 또는 `routes/workspaces.ts` 수정 (course 인프라 이미 존재)
- 기존 `workspaceType === 'blog'` 분기 동작 변경 (clauders-book 등 다른 blog 워크스페이스 회귀 방지)
- D1 schema 변경 (workspace.navigationMode 컬럼은 이미 존재, publish.ts 이미 sync)
- `classPreset` 을 worker 측에서 추가/제거 (이미 정의됨)

## Risk

- **CSS parity**: SPA 의 `pub-preset-*` 클래스와 SSG 의 `ssg-*` 클래스가 시각적으로 같아야 — 폭·padding·간격 px 단위 일치 필요. SSG / SPA 스타일 이중 관리 규칙 (CLAUDE.md) 준수.
- **publish 비파괴성**: `examples/clauders.ai/openhow.json` 변경 후 `openhow publish` 실행 시 D1 의 `workspace.type` / `workspace.navigationMode` 갱신 — `publish.ts:822, 860` 에서 이미 sync 로직 있음.
