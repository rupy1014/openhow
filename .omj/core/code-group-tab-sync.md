---
status: done
created: 2026-04-29
updated: 2026-04-29
iteration: 1
domain: docs
stage: done
---

# code-group-tab-sync — `:::code-group` 탭 선택의 문서 간 동기화

## Why

SDK 문서에서 `::: code-group` 으로 web / ios / flutter / node 등 플랫폼별 코드 예시를 탭으로 제공하는데, **현재는 페이지/그룹마다 독립**이다. flutter 사용자가 한 페이지에서 flutter 탭을 골라도:

- 같은 페이지 다른 code-group 은 디폴트(첫 탭 = web 같은) 그대로
- 다른 문서로 이동하면 또 디폴트로 리셋

→ 독자가 자기 플랫폼 코드를 보려고 매번 클릭해야 함. SDK 문서의 "내 환경에 맞는 코드만 깔끔히" 가치가 깨짐. 경쟁 (Mintlify Tabs, Stripe Docs SDK select, VitePress code-group) 은 모두 sync 동작.

## What (iter 1)

핵심 결정:
- **명시형 sync** — 저자가 `:::code-group sync=<key>` 로 그룹마다 sync-key 명시. 없으면 기존 페이지-로컬 동작 유지 (후방호환)
- **저장 매체**: localStorage + URL 쿼리 둘 다. URL 쿼리 우선 (공유 link 가능) → 적용 후 localStorage 도 동기화. URL 없으면 localStorage 에서 복원
- **라벨 정규화**: lowercase + trim 만. 변형 dictionary 는 Backlog

- [v1] **파서 — `:::code-group sync=<key>` 속성 추가** — `codeGroupExtension` (SSG `cli/src/ssg/renderMarkdown.ts:760` + SPA `viewer/src/utils/markdown.ts:1252`) 의 regex 를 `^(:{3,})[ \t]*code-group(?:[ \t]+sync=([\w-]+))?[ \t]*\n...` 로 확장. key 가 있으면 `<div class="md-code-group" data-sync-key="<key>">` 로 렌더. → **metric: `:::code-group sync=platform` 마크다운이 `data-sync-key="platform"` 속성과 함께 렌더, 미명시 그룹은 속성 없음 (회귀 0)**
- [v1] **hydrate sync 로직** — `cli/src/ssg/hydrateScript.ts:173` `initCodeGroupDelegation` 클릭 핸들러를 확장: `data-sync-key` 있을 때 (a) 같은 key + 같은 정규화 라벨의 모든 group 의 탭 active 토글 (b) localStorage `openhow:code-group-sync:<key>` 에 라벨 저장. → **metric: 한 그룹 클릭 시 같은 페이지 다른 sync 그룹 + localStorage 모두 동기화**
- [v1] **로드 시 복원** — hydrateScript `init()` 에 `restoreCodeGroupSync()` 추가. 페이지 hydrate 직후 모든 `[data-sync-key]` 그룹 순회: URL 쿼리 (`?<key>=<label>`) → localStorage 순서로 라벨 조회 → 매칭 탭 active. URL 우선 적용 시 localStorage 동기화. → **metric: 새로고침 / 페이지 이동 후에도 마지막 선택 라벨 유지, URL 쿼리로 진입 시 그 값 우선**
- [v1] **SPA hydrate 패리티** — viewer 측은 SSG 와 동일한 init 로직 필요. 단순화 위해 SPA `MarkdownRenderer` 마운트 시 SSG 의 `initCodeGroupDelegation` + `restoreCodeGroupSync` 와 동등한 React useEffect 구현. → **metric: viewer dev (`:5173`) 에서 동작 동일**
- [v1] **smoke 검증** — bootpay-contents 의 `recipes/billing.md` + `intro/getting-started.md` 등 2개 페이지에 `:::code-group sync=platform` 으로 web/ios/flutter 탭 추가. 한 페이지에서 flutter 클릭 → (a) 같은 페이지 다른 code-group 도 flutter 활성 (b) 다른 페이지 이동해도 flutter 활성 (c) `?platform=ios` 로 새로고침 → ios 활성. → **metric: Playwright 3 시나리오 모두 pass**

## Not

- 라벨 변형 dictionary (web/Web/web-vanilla 같은 변형 정규화) — Backlog
- `:::response` / `:::figure-tabs` 등 비-`code-group` 탭 글로벌 sync — 별도 의도
- OS sniff / locale heuristic 으로 자동 디폴트 — 명시 라벨만
- 사용자 자주 쓰는 플랫폼 추론 / heuristic
- Plate 에디터 측 변경 (저자 입력은 마크다운 그대로)

## Context

### 관련 인프라

- **렌더**: `viewer/src/utils/markdown.ts:1252` `codeGroupExtension` (SPA), `cli/src/ssg/renderMarkdown.ts:760` `codeGroupExtension` (SSG). 둘 다 동일 regex `/^(:{3,})[ \t]*code-group[ \t]*\n([\s\S]*?)\n?\1[ \t]*(?:\n|$)/`
- **탭 동작**: `cli/src/ssg/hydrateScript.ts:173+` `initCodeGroupDelegation` — click delegation 으로 같은 group 내 탭/패널 토글, `data-tab-index` 매칭. 그룹 자체에 `data-active="N"`
- **DOM**: `<div class="md-code-group" data-active="N" data-group-id="N">` + `<button class="md-code-group__tab" data-tab-index="N">` + `<div class="md-code-group__panel" data-tab-index="N">`
- **`:::response` 별개**: `viewer/src/utils/markdown.ts:1214` `responseExtension` 이 같은 `md-code-group` DOM 을 재사용 (`md-code-group--response` variant). sync 는 명시형이므로 response 는 자연 제외 (sync-key 없음)

### 관련 intent

- `docs-semantic-containers` (done iter 3) — `:::code-group`, `:::response` 기반 정의. 본 intent 는 그 위에 동기화 layer 추가. Why 다름 (시각적 다양화 vs 독자 상태 영속화)
- `core/markdown-directive-nesting` (done iter 1) — fence 가변화. 본 intent 의 sync 속성도 같은 `(:{3,})` 패턴 안에 들어가므로 영향 없음

### 후방호환

기존 모든 `:::code-group` (sync 속성 없음) 은 그대로 페이지-로컬 동작. 신규 sync= 명시한 그룹만 동기화. 마이그레이션 작업 0.

## Backlog

- 라벨 변형 dictionary (`web` ≡ `Web` ≡ `web-vanilla`)
- 사용자 자주 사용 플랫폼 heuristic
- `:::figure-tabs` / `:::response` 글로벌 sync 확장

## Footprint

### Step 1 — `:::code-group sync=<key>` 명시형 문서 간 동기화 (2026-04-29)

- `core/packages/cli/src/ssg/renderMarkdown.ts` (+8) — `codeGroupExtension` regex 를 `^(:{3,})[ \t]*code-group(?:[ \t]+sync=([\w-]+))?[ \t]*\n([\s\S]*?)\n?\1[ \t]*(?:\n|$)/` 로 확장. capture index 시프트 (`match[2]` → `match[3]` for items). renderer 가 `data-sync-key="<key>"` 를 옵션으로 출력
- `core/packages/viewer/src/utils/markdown.ts` (+10) — SPA 동일 parser 패리티. DOMPurify allowlist 에 `data-sync-key` 추가
- `core/packages/cli/src/ssg/hydrateScript.ts` (+76) — `normalizeTabLabel` (trim+lowercase), `syncCodeGroupTab(key, label)` (페이지 내 같은 key 의 모든 그룹 라벨 매칭 토글), `restoreCodeGroupSync()` (URL 쿼리 → localStorage 순서 복원), `initCodeGroupDelegation` 클릭 핸들러 확장 (sync-key 있으면 syncGroups + localStorage + URL `replaceState`)
- `core/packages/viewer/src/pages/DocPage.tsx` (+65) — SPA 패리티 useEffect. 동일한 syncGroupsByKey + handleTabClick + 복원 로직. `CSS.escape` 로 selector injection 방어
- `core/packages/cli/src/ssg/renderMarkdown.test.ts` (+28) — `:::code-group sync=platform` 파싱 → `data-sync-key="platform"` + `match[3]` items, 미명시 그룹은 속성 없음 (회귀)
- `core/packages/viewer/src/utils/markdown.test.ts` (+33) — 동일 케이스 + DOMPurify 후 속성 보존
- 검증:
  - `pnpm --filter @openhow/cli test -- --run` → 110/110 pass (renderMarkdown 35 tests)
  - `pnpm --filter @openhow/viewer test -- --run` → 17/17 pass (markdown.test.ts)
  - `pnpm --filter @openhow/viewer build` → pass
  - `git diff --stat` → 6 파일 정확

## Learnings

### 2026-04-29: 명시형 sync-key + URL 우선 + localStorage 복원 = oh-selector 패턴의 자연 재사용

DocPage.tsx 의 `oh-selector` 가 이미 URL 쿼리 우선 → localStorage 복원 → 클릭 시 양쪽 동기화 + `history.replaceState` 패턴을 채택해 두었다. code-group sync 도 같은 패턴을 그대로 차용 (단지 selector id 대신 sync-key, value 대신 정규화 라벨). 새 추상화 만들지 않고 동일 의미 모델을 두 번째 도메인에 적용한 것.

**Why**: 두 모듈 모두 "전역 상태 + 페이지 간 영속 + 공유 가능 URL" 이 공통 요구. 다른 형태로 풀면 사용자에게도 다른 멘탈 모델을 강요하게 됨.

**How to apply**: 차후 `:::figure-tabs` / `:::response` 도 sync 확장 시 같은 패턴 (key + URL `?key=value` + `openhow:<domain>-sync:<key>` localStorage). 라벨 정규화는 trim+lowercase 만, 변형 dictionary 는 첫 iter 에서 의도적으로 제외.

### 2026-04-29: capture index 시프트는 nesting iter 와 동일한 기계적 변환

`markdown-directive-nesting` 에서 `(:{3,})` fence 추가로 group 1 이 점유되어 모든 capture 가 +1 시프트된 직후, 본 의도가 group 2 (sync key) 를 추가로 점유 → items 가 group 3. tokenizer 와 renderer 모두 match index 를 정확히 따라가야 함. 테스트가 이 시프트 검증의 1차 방어선.

**Why**: regex 에 옵션 capture group 을 추가할 때 일괄적인 index 변경이 누락되면 런타임 undefined 참조로 깨짐. 기존 테스트가 통과해도 새 옵션 미사용 케이스만 검증한 것일 수 있음.

**How to apply**: 새 옵션 capture 추가 시 (a) tokenizer 가 옵션 unset 시 `null`/`undefined` 처리 (b) renderer 가 옵션 truthy check (c) 미명시 + 명시 둘 다 테스트 — `match[N]` 시프트는 mechanical 이지만 **회귀 테스트가 진짜 안전망**.

### 2026-04-29: URL `replaceState` 가 sync 퍼시스턴스의 silver bullet

탭 클릭 시 URL 에 `?<key>=<label>` 를 `replaceState` 로 동기화 → (a) 같은 페이지에서 새 탭 클릭이 history 에 쌓이지 않음 (b) 페이지 이동 시 URL 도 같이 자연스럽게 따라감 (c) 사용자가 URL 복사 → 공유하면 타인도 같은 탭 상태로 진입. localStorage 만 쓰면 (c) 가 빠지고, pushState 만 쓰면 (a) 가 깨짐.

**Why**: SDK 문서에서 "내 환경 코드 보여줘" 가 핵심 가치인데, 공유성과 영속성을 분리해서 풀면 둘 중 하나가 포기됨.

**How to apply**: 페이지 간 영속 + 공유 가능한 사용자 선택 상태를 다룰 때는 URL `replaceState` + localStorage 둘 다 쓰는 dual-write 가 표준. 클릭 핸들러에서 두 곳에 동시 쓰고, 복원 시 URL → localStorage 순서로 읽는다.
