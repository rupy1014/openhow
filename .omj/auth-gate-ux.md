---

## status: done created: 2026-04-13 updated: 2026-04-17 iteration: 2

# auth-gate-ux — 공개 워크스페이스에서 로그인 잔상 제거

## Why

blog.bootpay.ai 같은 공개 블로그에 접속하면 로그인 페이지가 잔상처럼 잠깐 보인다. 첫인상이 "로그인해야 쓸 수 있는 서비스"처럼 느껴진다. 공개 콘텐츠는 로그인 없이 바로 보여야 한다.

## Context

- openhow는 workspace 기반 콘텐츠 플랫폼. workspace마다 type(blog, docs, course 등)과 접근 정책(joinPolicy, isPaid)이 다르다.
- 커스텀 도메인(blog.bootpay.ai)에서는 `__CUSTOM_WORKSPACE__`가 inject되어 SPA가 바로 해당 workspace를 로드한다.
- auth store의 `loading`이 기본 `true`로 시작 → `WorkspaceDocs`가 `authLoading` 끝날 때까지 workspace 로드를 지연 → 그 사이 빈 화면 또는 로그인 잔상이 보임.
- blog 타입은 cross-domain bridge를 스킵하지만, auth 초기화 완료를 기다리는 건 동일.

## What

- [x] 블로그 커스텀 도메인에서 auth 초기화 완료를 기다리지 않고 workspace를 즉시 로드

- [x] auth.loading 기본값을 blog 커스텀 도메인일 때 `false`로 시작

## Not

- 인증 자체를 제거하지 않는다 (로그인 유저에게는 댓글, 좋아요 등 기능 제공)
- 유료 워크스페이스의 paywall은 이 의도 범위 밖 (Backlog)

## Footprint

- `core/packages/viewer/src/pages/workspace/WorkspaceDocs.tsx` — authLoading selector + `if (authLoading) await initSession()` 게이트 제거. `load()`는 `loadWorkspace(workspaceSlug)` 직접 호출. 별도 `useEffect(() => { void initSession() }, [initSession])` 추가 (마운트 시 1회 fire-and-forget).
- `core/packages/viewer/src/stores/auth.ts` — `getInitialLoading()` 헬퍼 추가. store 초기값 `loading: getInitialLoading()` — `__CUSTOM_WORKSPACE_TYPE__ === 'blog'`일 때 `false`로 시작.

## Learnings

- \[signal\] 블로그 첫 접속 시 로그인 화면이 잔상으로 보여서 사용자가 "로그인 필수 서비스"로 인식할 위험
- 월페이퍼/스플래시 대안도 사용자가 언급 — 탐색 중 판단
- auth.ts:50-51 — loading 기본값 `true`, user 기본값 `null`
- WorkspaceDocs.tsx:123-129 — `if (authLoading) { await initSession() }` 후에야 loadWorkspace 호출
- BlogLayout.tsx:142-144 — cloak 제거는 useLayoutEffect로 빠르지만, workspace 데이터 로드는 auth 뒤에 순서가 밀림
- router.tsx — blog 커스텀 도메인은 RequireAuth를 거치지 않음 (BlogLayout 직접 렌더링). 잔상은 auth guard가 아니라 WorkspaceDocs의 authLoading 대기가 원인

### 2026-04-17: exploring → clarified

- **근거**: Learnings에 원인 지점 5개가 코드 라인번호까지 특정됨 (auth.ts:50-51, WorkspaceDocs.tsx:123-129, BlogLayout.tsx:142-144). What 2개가 구체적이고 실행 가능. 실행 준비 완료.

### 2026-04-17: clarified → done (iteration 2)

- **실행**: WorkspaceDocs에서 auth 게이트 제거 + auth store 초기값을 blog 도메인 조건부로 전환. blog 공개 도메인에서 workspace/auth 요청이 병렬.
- **검증**: viewer build 통과. Codex review가 해당 변경을 `"WorkspaceDocs change seem okay, since it's running in parallel"`로 승인. P1/P2는 `markdown.ts` 관련으로 이 intent 범위 밖.
- **측정**: blog.bootpay.ai 첫 접속 시 로그인 잔상 사라짐 + Network tab에서 `/api/workspaces/*` 와 `/api/auth/get-session` 동시 호출 — 실제 운영 환경에서 수동 확인 필요.

## Backlog

- [ ] 유료 워크스페이스용 paywall 화면 디자인

- [ ] 월페이퍼/스플래시 스크린 옵션