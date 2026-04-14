---
status: exploring
created: 2026-04-13
---

# auth-gate-ux — 공개 워크스페이스에서 로그인 잔상 제거

## Why

blog.bootpay.ai 같은 공개 블로그에 접속하면 로그인 페이지가 잔상처럼 잠깐 보인다. 첫인상이 "로그인해야 쓸 수 있는 서비스"처럼 느껴진다. 공개 콘텐츠는 로그인 없이 바로 보여야 한다.

## Context

- openhow는 workspace 기반 콘텐츠 플랫폼. workspace마다 type(blog, docs, course 등)과 접근 정책(joinPolicy, isPaid)이 다르다.
- 커스텀 도메인(blog.bootpay.ai)에서는 `__CUSTOM_WORKSPACE__`가 inject되어 SPA가 바로 해당 workspace를 로드한다.
- auth store의 `loading`이 기본 `true`로 시작 → `WorkspaceDocs`가 `authLoading` 끝날 때까지 workspace 로드를 지연 → 그 사이 빈 화면 또는 로그인 잔상이 보임.
- blog 타입은 cross-domain bridge를 스킵하지만, auth 초기화 완료를 기다리는 건 동일.

## What

- [ ] 블로그 커스텀 도메인에서 auth 초기화 완료를 기다리지 않고 workspace를 즉시 로드
- [ ] auth.loading 기본값을 blog 커스텀 도메인일 때 `false`로 시작하거나, WorkspaceDocs에서 blog 타입이면 authLoading 무시

## Not

- 인증 자체를 제거하지 않는다 (로그인 유저에게는 댓글, 좋아요 등 기능 제공)
- 유료 워크스페이스의 paywall은 이 의도 범위 밖 (Backlog)

## Learnings

- [signal] 블로그 첫 접속 시 로그인 화면이 잔상으로 보여서 사용자가 "로그인 필수 서비스"로 인식할 위험
- 월페이퍼/스플래시 대안도 사용자가 언급 — 탐색 중 판단
- auth.ts:50-51 — loading 기본값 `true`, user 기본값 `null`
- WorkspaceDocs.tsx:123-129 — `if (authLoading) { await initSession() }` 후에야 loadWorkspace 호출
- BlogLayout.tsx:142-144 — cloak 제거는 useLayoutEffect로 빠르지만, workspace 데이터 로드는 auth 뒤에 순서가 밀림
- router.tsx — blog 커스텀 도메인은 RequireAuth를 거치지 않음 (BlogLayout 직접 렌더링). 잔상은 auth guard가 아니라 WorkspaceDocs의 authLoading 대기가 원인

## Backlog

- [ ] 유료 워크스페이스용 paywall 화면 디자인
- [ ] 월페이퍼/스플래시 스크린 옵션
