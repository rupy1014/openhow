---
name: composer-deprecation
description: 가입자 작성 UI (TopicBoard 글쓰기 폼 + TopicPostDetail 인라인 edit 폼) 화면 노출 비활성화. 코드 즉시 삭제 안 함 — 플래그/주석 deprecated 로 남김.
status: done
iteration: 1
domain: product
stage: build
created: 2026-05-14
updated: 2026-05-14
iter_log:
  - iter: 1
    wedge: A
    status: done
    date: 2026-05-14
    summary: ENABLE_LEGACY_COMPOSER 빌드타임 플래그 + TopicBoard/TopicPostDetail 4 surface 가드. Vite dead-code 제거로 클라이언트 번들에 composer surface class 전부 미포함.
related:
  - editor-approval-gate.md
  - cli-publish-md-sync-v1.md
  - study-community-board.md
  - openhow-positioning-clauders-seo.md
---

# composer-deprecation

## Why

5-13 정체성 lock:
> "글의 출처는 외부 MD sync (CLI publish, Notion sync, 향후 GitHub sync) — openhow 는 작성 도구가 아니라 publishing/discovery layer."
> "UI 글쓰기 composer (TopicBoard 글쓰기 폼, TopicPostDetail 인라인 edit form 등) 화면 노출 비활성화 — 코드는 즉시 삭제 말고 주석/deprecated 로 남김."

cli-publish-md-sync-v1 (done) + editor-approval-gate (done, v1) 가 두 축을 닫았다:
- 외부 .md → cloud publish path 작동
- 큐레이터/작성자 동의 mechanic 완성

마지막 남은 surface 정렬: **브라우저 안에서 글을 작성하는 UI 가 사용자에게 보이면 정체성 메시지가 헷갈린다**. openhow 의 web 화면은 "외부에서 쓴 .md 를 소비/큐레이션" 만 보여야 함. 브라우저 composer 는 제거 대신 비활성화 — CLI 가 같은 worker endpoint 를 쓰기 때문에 backend 는 그대로 둔다.

## What

### (v1) — UI 노출 비활성화 코어

- (v1) **TopicBoard 글쓰기 진입 차단** — `/t/:topicSlug` 페이지의 "글쓰기" 버튼 + 로그인 CTA "로그인하고 글쓰기" + composer 폼 (`topic-board-composer*`) 화면에서 숨김. 로그인 여부와 무관.
- (v1) **TopicPostDetail 인라인 edit 차단** — `/t/:topicSlug/:postSlug` 의 owner 액션 (`수정` / `삭제` / `게시하기`) 버튼 + 인라인 edit 폼 (`topic-post-edit-form`) + `?edit=1` autoOpen effect 화면에서 숨김.
- (v1) **feature flag 한 곳에서** — `viewer/src/lib/featureFlags.ts` (또는 등가) 에 `ENABLE_LEGACY_COMPOSER = false` 상수. 두 페이지가 이 플래그를 import. 코드는 그대로 두되 렌더 분기 + 핸들러 호출 가드. 외부 .env 의존 없음 — 빌드 타임 상수.
- (v1) **백엔드 endpoint 무변경** — worker 의 `POST/PUT/DELETE /api/topics/.../posts/...` 그대로. CLI publish 가 같은 path 사용. 브라우저 composer 만 surface 차원에서 가린다.
- (v1) **autoEdit 진입 차단** — `?edit=1` query param 으로 자동 인라인 폼 진입 (`TopicPostDetail` `autoEditConsumedRef`) 도 차단. URL 직격으로 composer 열기 불가.

### (v2) — 외부 작성 onboarding (별 의도 후보)

- (v2) "글 쓰려면 CLI publish 사용하세요" 안내 surface (TopicBoard 빈 상태/내 글 목록 등)
- (v2) /me/likes, /me/promotions/incoming 등 가입자 surface 에서 "작성은 CLI 로" 일관 메시지
- (v2) /docs CLI publish 가이드 페이지 surface 정렬

## Not

- (X) 코드 삭제 — `composerOpen`, `handleSubmit`, `topic-board-composer*`, `topic-post-edit-form` 코드는 남기고 플래그로 가린다. 향후 다시 켤 수 있는 토글 형태.
- (X) worker route 변경 — `POST /api/topics/:slug/posts`, `PUT/DELETE /api/topics/:slug/posts/:postSlug` 무변경. CLI 가 의존.
- (X) admin/superadmin 글 편집 surface — `/admin/*` 의 큐레이터/관리자 글 관련 UI 는 별 surface (composer 와 다름). Wedge E 범위 밖.
- (X) 댓글 composer — `CommentsSection` 의 댓글 작성 UI 는 reader interaction 으로 유지. 정체성 lock 의 "작성 = 외부 MD" 는 1급 글 (topic_post) 한정.
- (X) 좋아요/조회수/북마크/팔로우 등 reader interaction — 모두 유지.
- (X) 글 작성 진입 surface 의 UX 메시지 (v2 후보) — 일단 hidden 만, "왜 안 보이지?" 안내 메시지는 후속 의도.
- (X) MyDrafts / 내 작성 목록 페이지 — 존재 여부 확인 후 별도 wedge 또는 plain hide 처리 (Wedge A 진입 시 확인).
- (X) 데이터 정리 — 기존 production 에 쌓인 draft/published topic post 는 그대로. CLI publish 또는 admin 수동 작업으로만 변경 가능해진다.

## Context — 이미 확인한 composer surface

스캔 결과 (2026-05-14):

- `core/packages/viewer/src/pages/TopicBoard.tsx`:
  - 글쓰기 버튼 + 로그인 CTA (line 217-222)
  - composer state (`composerOpen`, `composerMode`, formTitle/formBody, autoSave draft restore) (line 55-103)
  - composer 폼 + write/preview tab + 등록 + 임시저장 (line 227-322)
  - POST 핸들러 `handleSubmit` (line 152 method:'POST')
- `core/packages/viewer/src/pages/TopicPostDetail.tsx`:
  - owner action 버튼 (`수정` / `삭제` / `게시하기`) (line 360-384)
  - 인라인 edit 폼 (`topic-post-edit-form`) (line 387-508)
  - `?edit=1` autoOpen effect (line 159-174)
  - PUT 핸들러 (line 210/243), DELETE 핸들러 `handleDelete` (line 270)

영향 범위: viewer 2개 파일 + featureFlag 1개 파일 (신규 또는 기존 utils). worker/CLI 무변경.

## Recommendation — wedge 후보

**Wedge A 후보 (단일 wedge, 작은 의도)**:
- `viewer/src/lib/featureFlags.ts` 신규 (or 기존 위치) `ENABLE_LEGACY_COMPOSER = false`
- `TopicBoard.tsx`: 플래그 false 면 글쓰기 버튼 + composer 렌더 분기 차단. 핵심 핸들러 (`handleSubmit`, autoSave) 는 noop guard 추가 또는 dead-code 로 남김.
- `TopicPostDetail.tsx`: 플래그 false 면 owner action 버튼 + edit form + autoEdit effect 차단.
- 빌드 + 라이브 확인: anonymous + logged-in (글쓰기 권한 있는 user) 두 시점에서 composer surface 안 보이는지 검증.
- 의도 v1 = 1 wedge 로 충분 (작은 surface 분리). 더 쪼개면 churn.

## Decisions (5-14)

1. **렌더 가드 only, 코드 유지**: 함수/state/JSX 는 남기고 플래그로만 가린다. 향후 admin 토글 가능. (5-13 메모리: "코드는 즉시 삭제 말고 주석/deprecated 로 남김")
2. **빌드 타임 상수, env 의존 없음**: 운영 노브가 아니라 정체성 결정. 한 줄 바꿔서 다시 켤 수는 있되 런타임 토글 surface 는 두지 않는다.
3. **백엔드 무변경**: worker route + CLI 흐름 그대로. UI 만 닫는다.
4. **댓글 + reader interaction 유지**: composer = 1급 글 작성 UI 만 (topic_post). 댓글/좋아요/팔로우 무관.

## Open Questions

(없음 — 5-13 정체성 lock + 위 스캔으로 결정 충분. 진입 OK.)

## Follow-up Intents (5-13 lock 유지)

1. cli-publish-md-sync-v1 — done
2. editor-approval-gate — done (v1)
3. **composer-deprecation** — done (v1, Wedge A)
4. surface-tone-pass — 콘텐츠 + 큐레이션 채워진 상태에서 surface 톤 정렬 (이 의도 후 진입)

## Footprint

- `core/packages/viewer/src/lib/featureFlags.ts` (신규, 13 줄) — `ENABLE_LEGACY_COMPOSER = false` 빌드타임 상수 + JSDoc 정체성 설명.
- `core/packages/viewer/src/pages/TopicBoard.tsx` (+3 import, 2 render 가드) — `.topic-board-actions` div + `.topic-board-composer` form 모두 `ENABLE_LEGACY_COMPOSER &&` gate. `composerOpen`/`handleSubmit`/draft autosave/restore state 전부 보존 (dead code at runtime).
- `core/packages/viewer/src/pages/TopicPostDetail.tsx` (+3 import, 2 render 가드, 1 effect 가드) — `.topic-post-owner-actions` + `.topic-post-edit-form` + `?edit=1` autoOpen `useEffect` early return. `editing`/`handleSave`/`handlePublishDraft`/`handleDelete`/`autoEditConsumedRef` 보존.
- Worker / CLI / types / admin / superadmin / 댓글 / reader interaction 전부 무변경.

## Learnings

### 2026-05-14: Wedge A (done) — composer surface 4종 일괄 가드 + 검증

- **Approach**: Codex 위임 (`cowork-run.sh task`). Single wedge — 단일 intent.
- **Codex brief**: `.omj/.runtime/prompts/composer-deprecation-wedge-a.md` (167 줄). 4-step plan: featureFlags 신규 → TopicBoard 가드 → TopicPostDetail 가드 → build 검증. MUST NOT 강하게 명시 (worker/CLI/admin/comments/reader 무변경, 코드 삭제 금지).
- **Result**: viewer build 0 errors, worker 배포 `188f6abb-b9a1-470b-a8bc-abd84ef40c38`.
- **Live verification (anonymous)**:
  - `/t/claude-code` — 글쓰기 버튼/로그인 CTA/composer form 전부 absent (Playwright count 0/0/0/0).
  - `/t/claude-code/wedge-d-default-draft` — owner action row / edit form absent (count 0/0).
  - `/t/claude-code/wedge-d-default-draft?edit=1` — autoEdit no-op, edit form absent (count 0/0).
- **Deployed-bundle verification (결정타)**: Vite 가 `ENABLE_LEGACY_COMPOSER = false` 상수 폴드 + dead-code 제거. 배포된 `TopicBoard-*.js`/`TopicPostDetail-*.js` chunk 에서 `topic-board-actions`/`topic-board-composer`/`topic-board-write-btn`/`topic-board-login-link`/`topic-post-owner-actions`/`topic-post-edit-form` class 이름 모두 0건. 클라이언트 번들에 surface 코드 자체가 ship 되지 않는다 — 안전.
- **Surprise**: 익명 검증만으로도 사용자가 보는 결과는 즉시 확정 (anon = 로그인 안 한 viewer = composer 가 isLoggedIn 가드로 이미 안 보임 — 하지만 dead-code elimination 으로 owner 로그인 경로도 동일하게 닫힘). 별도 owner-logged-in Playwright 시나리오 없이도 번들 grep 으로 충분히 보증됨.
- **Trade-off 기록**: src/pages/*.tsx 의 `handleSubmit`/`handleSave`/`handlePublishDraft`/`handleDelete` 등 dead 함수가 소스에 남는다. 5-13 메모리("코드 즉시 삭제 말고 deprecated") 가 의도적으로 요구한 형태. 다시 켜고 싶으면 `featureFlags.ts` 한 줄만 `true` 로 바꾸면 됨.
- **Next**: Follow-up Intent #4 `surface-tone-pass` — 콘텐츠/큐레이션 채워진 후 surface 톤 정렬.
