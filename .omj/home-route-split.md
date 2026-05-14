---
name: home-route-split
description: openhow.io 의 `/` 가 auth 상태로 분기 (anon → PublicBlogHome, login → WorkspaceHub) 되는 구조를 URL 로 명시 분리. 랜딩 (`/`) 은 항상 랜딩, 내 워크스페이스는 별도 URL. 5-13 정체성 lock 정렬.
status: clarified
iteration: 1
domain: product
stage: design
created: 2026-05-14
updated: 2026-05-14
related:
  - public-blog-home.md
  - openhow-positioning-clauders-seo.md
  - creator-saas-storyboard.md
  - composer-deprecation.md
---

# home-route-split

## Why

사용자 발화 (2026-05-14):
> "https://openhow.io/ 이제 여기도 명확하게 url 기반으로 나누자. 랜딩은 랜딩답게. 내 워크스페이스는 url 별도로 해서. 이 프로젝트 전체 검토 후 개선해줘"

현재 라우터 (`core/packages/viewer/src/router.tsx` + `pages/Home.tsx`) 상태:

```tsx
function RootIndex() {
  if (customWorkspace) return <WorkspaceDocs />   // 커스텀 도메인 — 별 surface
  return <Home />                                  // openhow.io
}

function Home() {
  if (isLocalMode) return <WorkspaceDocs />
  if (loading) return <div />
  if (isLoggedIn) return <WorkspaceHub />          // 로그인 → 내 워크스페이스 그리드
  return <PublicBlogHome />                        // 비로그인 → 공개 블로그 피드 (랜딩 역할)
}
```

**핵심 문제 3가지**:

1. **`/` 가 auth-state-overloaded** — 같은 URL 인데 anon 은 "openhow 가 뭔지 보여주는 화면", login 은 "내 워크스페이스 그리드". 5-13 정체성 lock ("openhow = MD publishing/discovery layer") 메시지가 사용자 상태에 따라 다르게 노출됨. 외부 공유 / SEO 인덱싱 / 첫인상 일관성 모두 망가짐.
2. **"내 워크스페이스" 진입 URL 부재** — 로그인 후 `/` 가 워크스페이스 허브를 보여주지만 그 URL 이 명시적으로 분리돼 있지 않다. 헤더 nav 가 "홈" 인지 "내 자리" 인지 모호. 북마크/공유/딥링크 모두 의도가 흐려짐.
3. **`/feed` 중복** — `/feed` 도 `PublicBlogHome` 을 렌더. anon 의 `/` 와 동일 컴포넌트. URL 두 개가 같은 surface 를 보여줌.

5-13 정체성 lock (composer-deprecation 마무리한 직후) 기준으로 보면, `/` 는 **항상 publishing/discovery layer 의 얼굴** 이어야 하고 "내 자리" 는 별도 URL 이어야 한다. 익명/로그인 무관 동일한 정체성 메시지 + 큐레이션 글 노출.

## Context — 현재 URL 인벤토리 (router.tsx 2026-05-14)

### Main layout (`/` 하위)

| Path | Component | 역할 | 비고 |
|------|-----------|------|------|
| `/` | `RootIndex` → `Home` | **분기** (anon=PublicBlogHome, login=WorkspaceHub) | ← **이번 의도의 본진** |
| `/login` | `Login` | 로그인 | OK |
| `/share/:token` | `ShareRedirect` | 공유 토큰 진입 | OK |
| `/s/:username` | `AuthorProfile` | 공개 작가 페이지 | OK (publishing/discovery) |
| `/me/likes` | `MyLikes` | 내가 좋아요한 글 | OK (가입자 surface) |
| `/me/promotions/incoming` | `MyPromotionsIncoming` | 큐레이터 promote 요청 inbox | OK (가입자 surface) |
| `/t` | `TopicIndex` | 토픽 index | OK (publishing/discovery) |
| `/t/:topic` | `TopicBoard` | 토픽 게시판 | OK |
| `/t/:topic/:postSlug` | `TopicPostDetail` | 토픽 글 상세 | OK |
| `/pricing` | `Pricing` | 가격 | OK |
| `/terms`, `/privacy` | 정적 | 정적 페이지 | OK |
| `/onboarding` | `Onboarding` (RequireAuth) | 온보딩 | OK |
| `/search` | `SearchResults` | 검색 | OK |
| `/feed` | `PublicBlogHome` | 공개 블로그 피드 | **← `/` (anon) 와 중복** |
| `/for-creators` | `CreatorSaasHome` | 크리에이터 SaaS 랜딩? | 5-13 정체성 lock 후 stale 가능성 — 검토 필요 |
| `/w` | `WorkspaceDocs` | 워크스페이스 docs (slug 없이) | 의도 불명 — 검토 필요 |
| `/w/:workspace` | `WorkspaceDocs` | 워크스페이스 docs 페이지 | OK |
| `/d/:workspace/*` | `DocPage` | 개별 문서 | OK |
| `/slide/:workspace/*` | `DocPage` | 슬라이드 모드 문서 | OK |
| `/*` | `DocPage` | catch-all (커스텀 도메인 워크스페이스) | OK |

### Blog routes (커스텀 도메인 + `/blog`)

| Path | Component | 비고 |
|------|-----------|------|
| `/blog/:workspace`, `/blog` | `UnifiedLayout` → `WorkspaceDocs` | 사용 빈도 확인 필요 |

### Dashboard (admin) / Superadmin

`/dashboard/...`, `/superadmin/...` — 큐레이터/관리자 surface. 본 의도 범위 밖 (이미 URL 명확).

### Standalone (layout 없음)

`/invite/:token`, `/join/:code` — 진입 토큰 페이지. OK.

## What

### (v1) — Wedge 0 + Wedge A 까지

- (v1) **[Wedge 0] URL 인벤토리 감사** — 코드 변경 없음. `router.tsx` 풀 트레이스 + 각 라우트의 컴포넌트 + 헤더 nav / footer link / 코드 내 `navigate`/`<Link to=...>` 호출 grep. `/for-creators`, `/w` (slug 없는), `/blog`/`/blog/:workspace` dead 여부 및 사용 흔적 결론. 결과를 본 의도 `## Context` 의 인벤토리 표에 갱신. → **metric: 인벤토리 표의 모든 "검토 필요" 항목이 유지 / 흡수 / 제거 중 하나로 라벨됨.**
- (v1) **[Wedge A.1] `/` 를 익명/로그인 무관 단일 랜딩으로 통일** — `Home.tsx` 의 auth 분기 제거. `/` 는 항상 `PublicBlogHome` 렌더 (5-13 정체성 lock 의 얼굴). `isLocalMode` 분기 (CLI 로컬 모드) 는 유지. → **metric: 익명/로그인 두 시점에서 `/` 가 `PublicBlogHome` 단일 컴포넌트 렌더 (Playwright DOM count 동일).**
- (v1) **[Wedge A.2] `/my` 라우트 신설 = 내 워크스페이스 허브** — `RequireAuth` 가드 + `WorkspaceHub` 렌더. 비로그인 시 `/login` 으로 보냄. → **metric: `/my` 진입 시 비로그인 → /login redirect, 로그인 → WorkspaceHub 렌더.**
- (v1) **[Wedge A.3] `/feed` → `/` redirect** — 라우트는 보존하되 `Navigate replace` 로 캐노니컬 `/` 로 보낸다. SEO 영향 없도록 client-side redirect. → **metric: `/feed` 진입 시 `/` 로 URL 치환되며 동일 컴포넌트 도착.**
- (v1) **[Wedge A.4] 헤더 nav 정합성** — 헤더의 로고/홈 링크 = `/`, 로그인 사용자에게 "내 자리" (또는 동등 라벨) 진입점 = `/my` 명시 노출. 기존 헤더 컴포넌트가 무엇이든 추가/조정만 — 새 디자인 시스템 도입 금지. → **metric: 헤더에 두 진입점 명시 + 클릭 시 의도한 URL 로 이동.**
- (v1) **[Wedge A.5] 로그인 직후 redirect 정책 유지** — `/` (랜딩) 으로 유지 결정. `Login.tsx` 의 success redirect 로직이 `/me` 같은 곳으로 강제 이동하지 않는지 확인 + (필요 시) `/` 로 정렬. → **metric: 로그인 후 `/` 또는 referrer 로 도착, `/my` 로 자동 이동하지 않음.**

### (v1.5 / 별 의도 후보) — Wedge 0 결과 따라

- (v1.5) **`/for-creators`, `/w` (slug 없는), `/blog`/`/blog/:workspace` 정리** — Wedge 0 의 감사 결과 dead 또는 stale 로 라벨된 path 제거 / 흡수. dead 가 아니라면 별 의도로 분리.

### (v2) — 사후 정리 후보 (Backlog)

- (v2) `/my` 하위 sub-nav 통합 — `/me/likes`, `/me/promotions/incoming` 을 `/my/likes`, `/my/promotions/incoming` 으로 재구성 후 공통 layout 으로 묶는다. (이번 v1 에서는 `/me/*` 그대로 유지 — URL 이동은 별 의도.)
- (v2) 워크스페이스 owner 진입 vs reader 진입 URL 헤더 표시 정합성 (`/w/:workspace` vs `/dashboard/:workspace`).
- (v2) 로그인 직후 redirect 정책 재검토 (`/my` 자동 이동 옵션).
- (v2) `RootIndex` 의 `customWorkspace` 분기는 그대로 유지 (커스텀 도메인 워크스페이스 — 별 surface, openhow.io 와 무관).

## Not

- (X) **URL 구조 1급 변경 — 슬러그/라우터 prefix 전면 갈아엎기 금지**. 기존 `/t/...`, `/s/...`, `/d/...`, `/dashboard/...`, `/superadmin/...` 모두 유지. 이번 의도는 `/` 의 auth 분기와 "내 자리" URL 명시화 + dead path 정리에 한정.
- (X) **새 페이지 디자인/콘텐츠 신규 생성 금지**. 기존 컴포넌트 (`PublicBlogHome`, `WorkspaceHub`) 의 위치 이동 + 약간의 헤더 nav 조정 위주.
- (X) **컴포저 surface 부활 금지** — composer-deprecation 의 `ENABLE_LEGACY_COMPOSER = false` 유지. 5-13 정체성 lock 함께 가져간다.
- (X) **로그인 후 redirect 정책 변경 금지** — 본 의도는 URL 만 분리. 로그인 직후 어디로 보낼지 (`/` vs `/me`) 는 별 의도 후보. 우선은 로그인 후 `/me` (또는 결정된 URL) 로 보내는 것까지가 자연스러우면 (v1) 에 포함, 아니면 (v2).
- (X) **`/w/:workspace` 등 워크스페이스 진입 URL 변경 금지** — slug-based 진입은 publishing/discovery 의 핵심 표면. 이건 별도 의도.
- (X) **검색·search index 변경 금지**.
- (X) **admin / superadmin URL 변경 금지**.

## Open Questions

(없음 — 아래 Decisions 로 모두 closure)

## Decisions (2026-05-14)

1. **내 자리 URL = `/my`** — 기존 `/me/*` 와 별도로 신설. `/me/likes`, `/me/promotions/incoming` 은 그대로 두고 (v2) 에서 `/my/*` 로 흡수 검토. `/dashboard` 는 admin 진입이라 의미 충돌, `/workspaces` 는 길고 비 워크스페이스 surface (likes/promotions) 흡수 시 어색 — 모두 폐기.
2. **(v1) 스코프 = Wedge 0 + Wedge A 까지** — URL 인벤토리 감사 + `/` 단일화 + `/my` 신설 + `/feed` redirect + 헤더 nav 정합. Wedge B (dead path 제거) 는 Wedge 0 감사 결과에 따라 v1.5 또는 별 의도로.
3. **로그인 직후 redirect = `/` 유지** — 자동 `/my` 이동 안 함. 사용자가 헤더 "내 자리" 명시 클릭으로 진입. (v2) 에서 정책 재검토 여지.
4. **`isLocalMode` 분기 유지** — CLI `openhow serve` 로컬 모드는 그대로 `WorkspaceDocs` 렌더. 본 의도는 클라우드 (`openhow.io`) URL 만 다룬다.
5. **`RootIndex` 의 `customWorkspace` 분기 유지** — 커스텀 도메인 워크스페이스는 별 surface. 본 의도 범위 밖.

## Recommendation — wedge 후보 (확정)

- **Wedge 0 — URL 인벤토리 감사** (코드 변경 없음): `router.tsx` 풀 트레이스 + 각 라우트의 컴포넌트 + 헤더/Footer/코드 내 `navigate`/`Link to` 호출 grep. `/for-creators`, `/w` (slug 없는), `/blog`/`/blog/:workspace` 사용 흔적 결론. 본 의도 `## Context` 인벤토리 표 갱신.
- **Wedge A — `/` 단일화 + `/my` 신설 + redirect/nav 정합**: 위 What (v1) 의 A.1~A.5 한 묶음. 작은 surface 변경이라 1 wedge.

(v1) = Wedge 0 + Wedge A. Wedge B 는 Wedge 0 결과 봐서 결정.

## Footprint

(None yet — auto-recorded after /omj:build)

## Backlog

- (v1.5) Wedge 0 감사 결과 따라 `/for-creators`, `/w` (slug 없는), `/blog`/`/blog/:workspace` 정리
- (v2) `/me/*` → `/my/*` 흡수 + sub-nav 통합 (likes + promotions/incoming + workspaces 한 layout)
- (v2) 로그인 직후 자동 `/my` redirect 정책 재검토
- (v2) 워크스페이스 owner vs reader 진입 URL 헤더 표시 정합성

## Learnings

### 2026-05-14: seed 생성 (iteration 1)

- **Background**: composer-deprecation v1 done 직후 사용자가 "URL 구조 정리" 요청. 5-13 정체성 lock (openhow = publishing/discovery layer) 정렬의 마지막 surface 정리.
- **핵심 발견**: `Home.tsx` 가 auth 상태로 두 컴포넌트 (PublicBlogHome / WorkspaceHub) 를 분기. 같은 URL 인데 다른 surface — 정체성 메시지 혼선 + SEO 일관성 부재.
- **Related**: `public-blog-home.md` (done iter 5) 가 `/` (anon) 의 PublicBlogHome 을 만들었음. 본 의도는 그 위에서 "auth 분기 제거 + 내 자리 URL 분리" 단계. parent reference.
- **Stale 의도**: `creator-saas-storyboard.md` (reviewed) 의 IA 가 liveklass-aligned creator SaaS 기준 (2026-04-30) — 5-04 / 5-13 정체성 pivot 후 stale. 본 의도 (v1) 에서 IA 정합성 다시 잡는다.

### 2026-05-14: clarified (iteration 1)

- 사용자 결정 (3): 내 자리 URL = `/my`, (v1) 스코프 = Wedge 0 + Wedge A, 로그인 직후 redirect = `/` 유지.
- Decisions section 으로 closure. Open Questions 비움.
