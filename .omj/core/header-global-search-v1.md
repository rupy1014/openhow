---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
scope: [viewer, worker]
---

# header-global-search-v1 — 헤더 자동완성 + 검색 결과 복구 + 다국어 검색 보강

## Why

사용자가 헤더 검색에서 `pg` 를 입력하면 드롭다운/자동완성이 나오지 않고, Enter 후 `/search?q=pg` 로 이동해도 결과가 없다고 신고했다. 현재 `AppShell` 은 드롭다운 UI 를 갖고 있지만 `UnifiedLayout` 이 검색 결과를 공급하지 않으며, 검색 API 는 FTS5 결과가 0건이면 LIKE fallback 을 실행하지 않아 짧은 영문 약어/한글 부분 문자열 검색에 약하다.

## What

- [validated] 헤더 입력 2글자 이상에서 debounce 된 문서 검색을 실행하고, 결과/빈 상태 드롭다운을 표시한다.
- [validated] 드롭다운 항목 클릭 시 해당 문서로 이동한다.
- [validated] Enter 검색은 현재 워크스페이스 컨텍스트를 유지하며 `/search?q=...` 로 이동한다.
- [validated] 검색 결과 페이지 문구를 현재 locale(ko/en)에 맞게 렌더링한다.
- [validated] Worker 검색 API 는 FTS5 prefix + LIKE 부분 문자열 결과를 병합해 `pg`, 한글 키워드, slug 검색을 더 잘 찾는다.

## Not

- 새 검색 인덱스/외부 검색 엔진 도입 없음.
- 검색어 하이라이트, 최근 검색어, 키보드 상하 이동 선택은 v1 범위 밖.
- 전체 권한 모델 변경 없음 — 기존 `canReadDocument` 필터 유지.

## Context

- UI: `core/packages/viewer/src/layouts/AppShell.tsx` 는 `searchResults`, `onSearch`, `onSearchResultClick` prop 을 이미 지원하지만 `UnifiedLayout` 에서 미연결.
- 결과 페이지: `core/packages/viewer/src/pages/SearchResults.tsx` 는 영어 하드코딩 + `any[]`.
- API: `core/packages/worker/src/routes/search.ts` 는 FTS5 성공 시 LIKE fallback 을 건너뜀. FTS5 는 짧은 prefix/한글 부분 문자열에 약하고, workspace 필터도 SQL limit 이후에 적용됨.

## Footprint

- `core/packages/viewer/src/layouts/AppShell.tsx` — 검색 빈 상태 문구 prop 추가, 빈 input focus 에서 stale dropdown 이 열리지 않게 query length gate 추가.
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — 헤더 검색 query state + 180ms debounce 검색 + 상위 6개 드롭다운 결과 연결, 결과 클릭/Enter 이동 연결, custom workspace 포함 workspace query 유지.
- `core/packages/viewer/src/stores/project.ts` — `SearchDocumentResult` 타입 추가, `searchDocuments` 반환 타입 구체화 + local `__PROJECT_DATA__.pages` 검색 fallback 연결.
- `core/packages/viewer/src/pages/SearchResults.tsx` — 검색 결과 타입 적용, locale 기반 문구(ko/en), snippet 우선 표시.
- `core/packages/viewer/src/locales/en.ts`, `core/packages/viewer/src/locales/ko.ts` — 헤더 빈 상태 + 검색 결과 페이지 문구 추가.
- `core/packages/worker/src/routes/search.ts` — Unicode token 추출, Latin prefix FTS query, LIKE substring/slug fallback 항상 실행, workspace SQL pre-filter, 중복 merge, description snippet 반환.
- `core/packages/viewer/src/utils/localSearch.ts` — CLI serve/local md 파일 모드용 본문 검색 유틸 추가(title/description/slug/content scoring, draft/private path 제외).
- `core/packages/viewer/src/utils/localSearch.test.ts` — 로컬 markdown 본문 `pg`/한글 검색 회귀 테스트 추가.
- `core/packages/worker/src/routes/search.test.ts` — `pg` prefix, 한글 token, LIKE wildcard escaping 회귀 테스트 추가.

## Learnings

### 2026-04-30: [done] — 헤더 검색 자동완성 + 결과 복구

- **원인 1 (UI 미연결)**: `AppShell` 은 `searchResults/onSearch/onSearchResultClick` prop 과 dropdown UI 를 이미 갖고 있었지만 `UnifiedLayout` 이 `onSearchSubmit` 만 넘겨 Enter 이동만 동작했다. 부모에서 debounce 검색 결과를 공급하도록 연결해 dropdown 이 실제로 열린다.
- **원인 2 (local md 모드 미지원)**: CLI serve/localhost 의 md 기반 데이터는 `window.__PROJECT_DATA__.pages[].content` 에 이미 본문이 들어있지만 `searchDocuments` 는 항상 `/api/search` 만 호출했다. 로컬에서는 API/D1/FTS 가 없거나 비어 있으므로 본문 검색이 전부 0건처럼 보였다. `searchLocalPages()` 를 추가해 md 본문 자체에서 즉시 검색하도록 했다.
- **원인 3 (API recall 부족)**: Worker 는 FTS5 query 가 성공하면 0건이어도 LIKE fallback 을 실행하지 않았다. 짧은 영문 약어(`pg`), slug 조각, 한글 부분 문자열은 FTS token/prefix 한계에 걸릴 수 있어 FTS + LIKE 를 병합하는 방식으로 보강했다.
- **workspace filtering 순서**: 기존에는 FTS/LIKE LIMIT 이후 JS 에서 workspace 를 필터링해 해당 workspace 문서가 상위 20개 밖이면 누락될 수 있었다. SQL WHERE 에 `d.workspace_id` 를 먼저 넣어 current workspace 검색 안정성을 높였다.
- **검증**: `pnpm --filter @openhow/viewer test -- --run src/utils/localSearch.test.ts`, `pnpm --filter @openhow/viewer build`, `pnpm --filter @openhow/worker test -- src/routes/search.test.ts`, `pnpm --filter @openhow/worker build` 모두 통과.
