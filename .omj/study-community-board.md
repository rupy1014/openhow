---
name: study-community-board
description: openhow = AI 사이트로 포지셔닝. 가입자 1급 시민, 플랫폼-level 토픽 게시판 + 큐레이터 유료 발행 라인 하이브리드 (Medium+Reddit 모델)
status: building
iteration: 1
domain: product
stage: discovery
created: 2026-05-07
updated: 2026-05-10
related:
  - openhow-positioning-clauders-seo.md
  - creator-platform-discovery.md
  - creator-platform.md
  - workspace-content-themes.md
---

# study-community-board

## Why

**5-07 lock**: openhow = **AI 사이트** (AI 스터디 커뮤니티 + 큐레이션 하이브리드). 5-04 의 "롱블랙-style 큐레이션 multi-tenant" 잠금은 유지하되, 그 위에 "AI 주제별 게시판 + 가입자 1급 시민" 레이어를 추가해서 정체성을 **AI 도메인-specific 사이트**로 좁힌다.

- 큐레이터 한 명이 모든 글을 쓰는 구조는 확장성이 약하다 — 같은 주제에 관심 있는 다른 가입자들이 자발적으로 글을 보태면 워크스페이스 자체가 "주제 허브" 가 된다.
- 그렇다고 큐레이터의 유료 발행 라인을 가입자 글에 흐리게 하면 안 된다 — 유료 시리즈는 큐레이터의 신뢰/문체/완성도가 셀링포인트.
- 답: **두 라인을 분리**. 큐레이션 라인업 (유료/공식) vs 가입자 기고 채널 (자유/연구 노트). 좋은 기고를 큐레이터가 큐레이션 라인업으로 승격할 수 있는 모더레이션 흐름.

**핵심 클러리피케이션 (5-07)**: 글 쓰는 주체는 워크스페이스 멤버가 아니라 **openhow 플랫폼 가입자**. openhow.kr 차원의 회원가입 → 어떤 워크스페이스의 게시판에든 글 작성 가능 (정확한 게이트는 explore 단계). 한 가입자가 여러 주제 워크스페이스에 글을 쓸 수 있고, 자기 프로필에 자기 글이 모임 ("내가 쓴 글"). → 가입자 = 단순 독자가 아니라 **읽고/쓰는 멤버 1급 시민**.

이건 피봇이 아니라 **포지셔닝 확장 + identity 모델 강화**. 큐레이션은 그대로 핵심 축, 그 옆에 커뮤니티 채널을 한 칸 추가하면서 사용자 identity 를 워크스페이스 단위에서 → 플랫폼 단위로 격상.

## Decision (5-07): 옵션 C 잠금

**옵션 C (하이브리드) 채택** — Medium (큐레이션 publication + 가입자 작가) + Reddit (토픽=게시판) 모델. 큐레이션 워크스페이스는 유료 발행 라인 그대로, 토픽 게시판은 플랫폼 1급 entity, 둘 사이 endorse/승격 bridge.

## Structural Fork (참고용)

**옵션 A — 워크스페이스-bound 게시판** (초기 가정)
- 큐레이션 워크스페이스 안에 "Community" 채널 = 워크스페이스 멤버 기고
- 큐레이터 모더레이션 강함, 게시판이 큐레이션 정체성에 흡수됨
- 단점: 같은 주제 (예: Claude Code) 글이 여러 워크스페이스에 흩어짐, 커뮤니티 응집력 약함

**옵션 B — 플랫폼-level 주제별 게시판** (사용자 5-07 제안)
- `openhow.kr/t/{topic}` 같은 토픽 게시판이 1급 entity, 워크스페이스 밖에 존재
- 가입자 누구나 토픽 게시판에 글 → 같은 주제 글이 한 곳에 모임
- 큐레이터 워크스페이스는 관련 토픽 글을 사이드바에서 surface / 큐레이션 라인업으로 승격 가능
- 단점: 토픽 분류 운영 비용, 큐레이터 통제력 약화

**옵션 C — 하이브리드 (가장 유력)**
- 토픽 게시판 = 플랫폼 1급 (옵션 B)
- 큐레이터 워크스페이스 = 유료 큐레이션 발행 라인 (그대로)
- 큐레이터가 자기 워크스페이스 주제와 매핑되는 토픽 게시판 1-N 개를 "channel" 로 endorse → 워크스페이스 사이드바에 노출
- 토픽 게시판의 좋은 글을 큐레이터가 자기 발행 라인업으로 **승격** (mirror/feature)
- **추천**: Medium (publication + tag discovery) + Reddit (topic community) 하이브리드. 큐레이션 정체성 유지 + 커뮤니티 응집력.

## Benchmarks (5-07 research)

| 서비스 | 모델 | 적합도 |
|--------|------|--------|
| **Medium** | publication (큐레이터 단위, 유료) + tag (주제 discovery) + 작가 프로필 | ★★★★★ — 큐레이션+토픽+가입자 정체성의 정석 |
| **Reddit** | subreddit (topic = community) | ★★★★ — 주제별 게시판 1급 entity 모델의 정석. 큐레이션 레이어는 없음 |
| **GPTers** | AI 학습 커뮤니티 — 카테고리 게시판 + 가입 | ★★★★ — 한국 AI 스터디 커뮤니티 결, 가입자 1급 시민 |
| **브런치 (Brunch)** | 큐레이션 + 작가 가입 + 에디토리얼 게이팅 | ★★★ — 큐레이션 강조, 게시판 모델은 약함 |
| **DEV.to** | tag = topic discovery, 가입자 자유 기고 | ★★★ — 토픽이 게시판이 아니라 discovery 축, 응집력 약함 |
| **OKKY / 클리앙** | 카테고리 게시판 + 가입자 자유 기고 | ★★ — 큐레이션 레이어 없음, 단순 forum |
| **Substack** | 큐레이터 단일 publication + Notes (작가간 cross-feed) | ★★ — 토픽 게시판 1급은 아님 |

→ **Medium + Reddit 하이브리드** 가 가장 가까운 모델 (옵션 C 와 일치).

## What (hypotheses to validate)

- (v1) **openhow 플랫폼 회원가입** — 이메일/소셜 로그인, 워크스페이스와 독립된 user identity
- (v1) 가입자 프로필 페이지 — `openhow.kr/u/{handle}`, 자기가 쓴 글 모음 ("내가 쓴 글")
- (v1) **토픽 게시판 = 플랫폼 1급 entity** — `openhow.kr/t/{topic}` (또는 `/b/{board}`), 누가 새 토픽 만드는지 정책 결정 필요 (admin 단독 vs 가입자 제안 + admin 승인)
- (v1) 가입자가 토픽 게시판에 자유롭게 마크다운 글 등록, 자기 프로필에 자동 집계
- (v1) **큐레이터 워크스페이스 ↔ 토픽 게시판 endorse 관계** — 큐레이터가 자기 주제와 매핑되는 토픽 1-N 개를 채널로 등록, 워크스페이스 사이드바에 토픽 게시판 글 surface
- (v1) 큐레이터 **승격 권한** — 토픽 게시판의 좋은 글을 자기 큐레이션 라인업으로 mirror (원본은 토픽에 남고, 큐레이션 라인업에 endorsed copy)
- (v1) 시각적 구분 — 큐레이션 라인업 (유료/공식 배지) vs 토픽 게시판 글 (가입자 배지)
- (v1) 가입자 글 default accessLevel = public
- (v2) 좋아요/하이라이트 — 큐레이션 승격 후보 신호
- (v2) 가입자 follow / 북마크 / 토픽 구독
- (v2) 토픽 내 sub-tag 또는 시리즈 — 게시판 흩어짐 방지
- (v2) 토픽 게시판 자체 모더레이터 (큐레이터와 별개) — 스팸/품질 관리

## Not (out of scope)

- **큐레이터 = 멤버 1인 워크스페이스 모델은 별 의도** (`creator-platform.md` done) — 여기서는 "한 큐레이터의 워크스페이스에 다른 멤버 기고를 받는다" 가 축
- **LMS / 강습 / 학생 게시판** 색은 빼기 — 5-04 에 openklass 로 fork 됐고, openhow 는 큐레이션·연구 노트 라인업
- **포럼/Discord 식 실시간 채팅** 아님 — 글(블로그) 단위 비동기
- **익명 / 가입 없는 댓글식 기여** 아님 — openhow 플랫폼 가입자 신원 기반
- **가입자가 자기 워크스페이스 만들기** 아님 — 그건 `creator-platform.md` (done) 의 영역. 여기서는 "기존 큐레이션 워크스페이스의 게시판에 가입자가 글 쓴다" 가 축

## Context

- 5-04 재잠금: openhow = 롱블랙-style 큐레이션 + 플랫폼 admin gate. 이 의도는 그 위에 "멤버 기고 채널" 한 면을 더하는 구조 확장.
- `creator-platform-discovery.md` (building, 4-30) 에 student/member board 정책이 일부 있으나 LMS 맥락이라 5-04 split 이후 stale — 이 의도가 **포스트-LMS-split 후의 community 채널 재정의**.
- 분리 vs 승격 모델은 큐레이션 신뢰도 문제 — 큐레이터 라인업과 멤버 기고를 시각적/슬러그상 구분하지 않으면 "큐레이션 = 보증" 시그널이 약해진다.
- 기존 access level (public/unlisted/team/private) + freePreviewDocs 페이월 인프라를 그대로 쓸 수 있을 것 — 멤버 글은 default public, 큐레이션 라인업은 기존대로.

## Build Progress (iter 1)

### Wedge A — 토픽 게시판 read-only 토대 (5-07, done)
- DB: `topic`, `topic_post` 테이블 + (topic_id, slug) unique index 추가 (`packages/worker/src/db/schema.ts`, `packages/worker/migrations/0062_add_topic_board.sql`)
- Seed: claude-code, cursor 2 토픽 (마이그레이션 안)
- API: `GET /api/topics` (postCount 포함), `GET /api/topics/:slug` (posts + author join) — 인증 불필요 (`packages/worker/src/routes/topics.ts`)
- Viewer: `/t/:topic` 라우트 + `TopicBoard.tsx` (`packages/viewer/src/pages/TopicBoard.tsx`, `.css`) — 빈 상태 메시지 포함
- 검증: TS 컴파일 통과, `/api/topics` JSON 응답 확인, `/t/claude-code` 페이지 정상 렌더 (Playwright 스크린샷)

### Wedge B — 게시글 작성 UI (5-08, done)
- API: `POST /api/topics/:slug/posts` (`requireAuth`, body `{ title, bodyMd }`, kebab+8자 random suffix slug, D1 inline body) — `packages/worker/src/routes/topics.ts`
- Validation: title 1–200자, bodyMd 1–100,000자, 비어있으면 400
- Viewer: `TopicBoard` 헤더에 "글쓰기" 토글 (로그인 시) / "로그인하고 글쓰기" 링크 (비로그인) — 인라인 폼 (제목 input + 마크다운 textarea + 제출/취소) — `packages/viewer/src/pages/TopicBoard.tsx` + CSS
- 제출 성공 시 `loadTopic()` 재호출로 리스트 리프레시 + 폼 닫음
- 0062 마이그레이션 시드의 `unixepoch() * 1000` 버그 수정 (schema `mode: 'timestamp'` 가 초 단위) — production 미적용이라 안전
- 검증: TS 컴파일 0 에러 (worker, viewer), `GET /api/topics/:slug` 응답에 D1 inserted post 정상 노출, `POST /api/topics/.../posts` 비로그인 → 401, viewer `/t/claude-code` 비로그인 스크린샷 (로그인 링크 + 시드 게시글 카드 표시) 확인

### Wedge C — 게시글 상세 라우트 (5-08, done)
- API: `GET /api/topics/:slug/posts/:postSlug` — topic + post + author 조인, 404 분기 (topic 없거나 published post 없거나) — `packages/worker/src/routes/topics.ts`
- Viewer: `/t/:topic/:postSlug` 라우트 + `TopicPostDetail.tsx` + CSS — `cachedRenderMarkdown` 으로 `bodyMd` HTML 변환 후 `dangerouslySetInnerHTML`, "← {topic title}" 백 링크, 작성자 → `/s/:username` 프로필 링크
- TopicBoard 카드 `<button>` → `<Link to>` 로 전환 (router 한 줄 추가, CSS `text-decoration: none` 보강)
- 검증: TS 0 에러 (worker, viewer), `GET .../posts/first-post-abc12345` 200 + `.../nonexistent` 404, Playwright 카드 클릭 → 상세 라우트 navigation 정상, 상세 페이지 마크다운 (`# 안녕` → h1) 렌더 정상, 404 페이지 백 링크 정상

### Wedge D — AuthorProfile 토픽 글 노출 (5-08, done)
- API: `GET /api/authors/profile/:username` 응답에 `topicPosts` 추가 — published 상태인 토픽 글만, topic join 으로 `topicSlug`/`topicTitle` 동봉, 최근 20건 (`packages/worker/src/routes/authors.ts`)
- Viewer: `AuthorProfile.tsx` `ProfileResponse` 에 `topicPosts: TopicPostBrief[]` 추가, "토픽 게시글" 섹션 렌더 (제목 + `topicTitle · 날짜` 메타, `/t/:topicSlug/:postSlug` 링크), CSS 신규 카드 (`.author-profile-topic-post-card`)
- 결정: `/u/:handle` 분리 라우트 만들지 않고 기존 `/s/:username` 한 화면에 큐레이션 글 + 토픽 글을 병렬 섹션으로 둠 — 가입자 1급 시민화 (intent 본문 정의) 의 가시화는 동일 프로필 안에서 두 라인을 같이 보여주는 게 더 강함
- 검증: TS 0 에러 (worker, viewer), `GET /api/authors/profile/seed_author` 응답에 `topicPosts: [{ id: post_test_1, title: "Wedge B 첫 글", topicSlug: "claude-code", ... }]` 1건 반환, Playwright 스크린샷 — "토픽 게시글" 섹션 + 카드 1개 렌더 정상

### Wedge E — 글 수정/삭제 (5-08, done)
- API: `PUT /api/topics/:slug/posts/:postSlug` + `DELETE /api/topics/:slug/posts/:postSlug` — `requireAuth` + author 본인 검증 (403), POST 와 동일 validation, soft-delete (`status='deleted'` — list/detail 쿼리는 `status='published'` 필터로 자동 숨김)
- Viewer: TopicPostDetail nav 우측에 "수정"/"삭제" 버튼 (작성자 본인만), 인라인 edit form (title + bodyMd 재사용), 삭제 confirm dialog → 200 후 토픽 보드로 `navigate(replace: true)`
- 검증: 401 unauth · 403 wrong user (별도 user + apikey 시드해서 재현) · 404 missing post · 400 empty body validation · 200 happy + soft-delete 후 GET 404 + D1 `status='deleted'` 확인 · Playwright 비로그인 화면 owner-actions 0개 확인
- 결정: hard delete 대신 soft-delete — `topic_post.status` 필드 이미 존재 (default 'published'), 모든 read 쿼리가 published 만 가져오므로 자연 숨김. 추후 복구·트래시 UI 가능. Edit/delete API key 흐름으로 검증한 패턴은 다음 wedge 의 dev-login 정상화 전까지 임시 — 운영 사용자는 better-auth 세션으로 동일 endpoint 호출.

### Wedge F — 디스커버리 진열대에 토픽 글 진입 (5-08, done)
- API: `GET /api/public/feed` 응답에 `topicPosts` 추가 — published 만, topic+author join, 최근 8 (`packages/worker/src/routes/public-feed.ts`)
- Viewer: PublicBlogHome 의 latest/popular 그리드 바로 아래 "토픽 게시판" 섹션 — `pbh-topic-post-card` (태그 + 제목 + 작성자·날짜), auto-fill grid, 빈 배열일 때 섹션 자체 숨김
- 결정: 위치는 "전체 아티클 + 인기 글" 다음, "시리즈 · 커리큘럼" 앞 — 큐레이션 라인을 위에 두면서 가입자 라인을 같은 첫 화면 안에 들임. hero 위로 올리지 않음 (큐레이션 우선 정체성 유지).
- 검증: TS 0 에러, 로컬 D1 에 4건 시드 → feed 응답 `topicPosts.length === 4` + Playwright 홈 스크린샷에 4개 카드 정상 렌더, 프로덕션 `topicPosts: []` (아직 글 없음, 응답 형 정상)

### Wedge G — 토픽 인덱스 라우트 `/t` (5-08, done)
- Viewer: `/t` 라우트 + `TopicIndex.tsx` + CSS — 기존 `GET /api/topics` (postCount 포함) 응답을 카드 그리드로 렌더, ai_domain_tag pill + post count + description, `/t/:slug` 링크 (`packages/viewer/src/pages/TopicIndex.tsx`, `.css`, `router.tsx`)
- 결정: 워커/DB 변경 0건 — Wedge A 의 `GET /api/topics` 가 이미 postCount 포함이라 viewer-only wedge 로 자연스럽게 닫힘. 디스커버리 루프 (Wedge F 홈 카드 → Wedge G 토픽 인덱스 → Wedge A 토픽 보드 → Wedge C 글 상세) 완결.
- 검증: TS 0 에러 (viewer), Playwright 로컬 — 카드 2개 (Claude Code 3개의 글 / Cursor 1개의 글) 정상 렌더 + 카드 클릭 → `/t/claude-code` 라우팅 확인, 프로덕션 배포 후 `/t` 200 + `/api/topics` 응답 정상

### Wedge H — 마크다운 미리보기 토글 (5-08, done)
- Viewer: TopicBoard composer 와 TopicPostDetail edit form 양쪽에 "쓰기/미리보기" 탭 — 같은 `cachedRenderMarkdown` (DocPage 와 동일 토대) 으로 본문 렌더, 빈 본문 시 "미리볼 내용이 없어요." placeholder, 탭 active 색상은 인덱스/보드 일치 (`accent-soft`/`accent`) (`packages/viewer/src/pages/TopicBoard.tsx`, `.css`, `TopicPostDetail.tsx`, `.css`)
- 결정: 백엔드 변경 0건 — 마크다운 변환은 viewer-only 이고 detail 화면 렌더와 동일 함수 재사용으로 일치 보장. 별 컴포넌트 추출 안 함 — composer/edit form 두 곳만 쓰는 30줄 패턴이라 inline state 관리가 더 명확.
- 검증: TS 0 에러, Playwright 로컬 (dev-login → seed_author 세션) — composer 미리보기 h1=1/strong=1/li=2 + 탭 toggle 후 textarea 복귀, edit form 미리보기 h2=1/code=1/ol-li=2, 두 화면 스크린샷 확인. dev-login 으로 better-auth 세션 happy path 도 처음으로 검증됨 (기존엔 apikey 만).

### Wedge I — 토픽 admin CRUD `/superadmin/topics` (5-08, done)
- API: `GET/POST/PATCH/DELETE /api/superadmin/topics` (`requireSuperadmin`) — slug ascii kebab-case 검증, slug uniqueness 409, postCount > 0 인 토픽 삭제 차단 409 (`packages/worker/src/routes/superadmin.ts`)
- Viewer: `/superadmin/topics` 라우트 + `TopicsAdmin.tsx` + CSS — 인라인 create form (slug/제목/태그/설명), 행 수정 toggle (slug immutable), 삭제 confirm + postCount 가드 (`packages/viewer/src/pages/superadmin/TopicsAdmin.tsx`)
- Layout: `SuperadminLayout` 에 NavLink 두 개 (워크스페이스 / 토픽) — 활성 시 primary-color 배지 (`packages/viewer/src/layouts/SuperadminLayout.tsx`, `.css`)
- 결정: 백엔드는 GET 한 번만 leftJoin+groupBy 로 postCount 동봉 (Wedge A 와 동일 패턴) — 별 endpoint 분리 안 함. id 는 `topic_${slug.replace(/-/g, '_')}` 결정론적 — 시드 컨벤션 (`topic_claude_code`) 과 일치.
- 검증: Worker/Viewer TS 0 에러, Playwright 로컬 (seed_author 임시 superadmin 부여) — 생성/수정/삭제 happy path + 글 있는 토픽 삭제 버튼 disabled 확인. 프로덕션 배포 후 `/api/superadmin/topics` 401 (no auth) + `/superadmin/topics` 200 (SPA) + `/api/topics` 공개 응답 정상.

### Wedge J — 토픽 글 viewCount + 인기 rail (5-08, done)
- DB: `topic_post.view_count INTEGER NOT NULL DEFAULT 0` (migration 0063, schema.ts 동기화) — 로컬/프로덕션 모두 적용
- API: `GET /api/topics/:slug/posts/:postSlug` 가 응답 직전 best-effort `view_count = view_count + 1` 업데이트 후 새 값 반환 (try/catch — 카운터는 read 를 막지 않음). list/feed/profile select 도 `viewCount` 동봉 (`packages/worker/src/routes/topics.ts`, `public-feed.ts`, `authors.ts`)
- API: `/api/public/feed` 의 `topicPostsFeed` 정렬 `desc(viewCount), desc(createdAt)` — 같은 viewCount 안에서는 최신 글이 위, 점수 쌓이면 자연스럽게 인기순
- Viewer: 홈 rail "토픽 게시판" → "인기 토픽 글" (조회수 순), 카드 메타에 "조회 N" 추가 (`packages/viewer/src/pages/PublicBlogHome.tsx`). TopicBoard 카드 + TopicPostDetail 헤더에도 `조회 N` 노출 (`TopicBoard.tsx`, `TopicPostDetail.tsx`)
- 결정: 별 popularTopicPosts 필드 추가 안 함 — 기존 단일 rail 의 정렬 기준만 바꿈. 새 사이트라 인기/최신 두 rail 을 따로 띄우면 둘 다 비어 보이는 게 더 어색. 데이터 쌓이면 자연스럽게 "인기" 의미가 강해짐.
- 결정: detail GET 시 매번 +1 (de-dup 안 함) — 봇/같은 사용자 여러 번 등 노이즈 있지만 wedge 단계에선 단순 카운터로 시작. de-dup/세션 기준은 트래픽 쌓이면 separate wedge.
- 검증: Worker/Viewer TS 0 에러, 로컬 curl — 같은 글 3번 GET → viewCount 0→1→2→3, feed 응답이 viewCount=3 글을 첫 카드로 정렬, Playwright 홈/디테일/보드 세 화면 모두 "조회 N" 노출 확인. 프로덕션 migration apply 후 `/api/topics`, `/api/public/feed`, `/api/topics/claude-code` 정상 (글 0건이지만 컬럼 추가로 인한 select 깨짐 없음).

### Wedge K — 워크스페이스 ↔ 토픽 endorse bridge Phase 1 (admin CRUD) (5-08, done)
- DB: `workspace_topic_endorsement` (id, workspace_id, topic_id, created_at) — workspace/topic FK cascade, (workspace_id, topic_id) unique pair (migration 0064, schema.ts 동기화) — 로컬/프로덕션 모두 적용 (0063 d1_migrations 추적 누락은 수동 INSERT 로 보정 후 0064 정상 apply)
- API: `GET/POST/DELETE /api/workspaces/:slug/endorsements` — GET 은 누구나 (joined topic 메타 동봉), POST/DELETE 는 워크스페이스 owner 만 (`ws.ownerId !== user.id` → 403). POST 는 topicSlug 검증·중복 409·결정론적 id `endorse_${ws_id}_${topic_id_short}` 생성 (`packages/worker/src/routes/workspaces.ts`)
- Viewer: `/dashboard/:workspace/topics` 라우트 + `WorkspaceTopicEndorsements.tsx` + CSS — 토픽 picker 드롭다운 (이미 endorse 한 토픽은 자동 제외) + endorsement 리스트 (태그 pill + 제목 링크 + endorse 일자 + 해제 버튼) (`packages/viewer/src/pages/admin/WorkspaceTopicEndorsements.tsx`)
- Layout: AdminLayout 사이드바에 "토픽 endorse" 항목 추가 (canManage 게이트, 댓글 항목 다음) — 별 NavLink 스타일 변경 없이 기존 nav-item 재사용 (`packages/viewer/src/layouts/AdminLayout.tsx`)
- 결정: 옵션 C 의 "큐레이터 ↔ 토픽 bridge" 큰 promise 를 한 번에 안 닫고 Phase 1 (admin CRUD) 만 — 워크스페이스 화면에서 endorsed 토픽 글 surface 하는 public 렌더링은 별 wedge K2 로 분리. 한 wedge 가 너무 크면 결정/검증 압축됨.
- 결정: 새 admin 메뉴 surface 안 만들고 기존 워크스페이스 admin 사이드바 한 칸 추가 — Route-first Resource Admin (CLAUDE.md memory) 패턴, modal/dialog 안 씀.
- 결정: 결정론적 id (`endorse_${ws_id}_${topic_short_id}`) — uuid 안 씀, D1 console 에서 운영자 추론 가능.
- 검증: Worker/Viewer TS 0 에러, Playwright 로컬 (dev-login → seed@local.dev = vibe-coding owner) — 빈 상태 → claude-code endorse → cursor endorse → 2건 → 1건 제거 → 0건 정리 happy path, GET 200 (joined 메타 정상), POST 비로그인 401. 프로덕션 — `/api/workspaces/clauders-ai/endorsements` 200 + `[]`, POST no-auth 401.
- 다음 wedge 후보 (K2 등): 워크스페이스 화면에 endorsed 토픽 글 surface (Wedge F 홈 rail 패턴 재사용), 큐레이터 promotion (mirror 토픽 글 → 큐레이션 라인업), 작성자 draft 흐름, 인기 rail v2 (de-dup, 기간 필터), DEV_LOGIN_EMAIL 정상화.

### Wedge K2 — 워크스페이스 화면에서 endorsed 토픽 글 surface (5-10, done)
- API: `GET /api/workspaces/:slug/endorsed-topic-posts?limit=N` (public) — endorsed 토픽 ids 조회 → `inArray` 로 published topic_post 묶음 추출 (topic + author 조인), `viewCount DESC, createdAt DESC` 정렬, default limit 8, cap 24. 빈 endorsement 면 `{topics:[],posts:[]}` 즉시 반환 (`packages/worker/src/routes/workspaces.ts`)
- Viewer: WorkspaceDocs 의 blog/team-blog 두 랜딩 변형 모두에 "엔도스 토픽 글" rail 추가 — 카드(태그 pill + 제목 + author·날짜·조회수). endorsedPosts 배열이 비면 섹션 통째 숨김. `useEffect` 로 workspace slug 변경 시 fetch (`packages/viewer/src/pages/workspace/WorkspaceDocs.tsx`)
- CSS: `wsd-endorsed-*` 클래스 — Wedge F 홈 rail 의 `pbh-topic-post-*` 톤 그대로 (260px auto-fill grid, accent-soft tag, 2-line title clamp) (`packages/viewer/src/pages/workspace/WorkspaceDocs.css`)
- 결정: 새 endpoint `endorsed-topic-posts` 분리 — 기존 `/documents?workspace=` 응답에 끼워넣지 않음. manifest 캐시(SSG/CDN) 가 워크스페이스 문서를 fronting 하는데, 토픽 글은 자주 바뀌는 viewCount 가 키라 캐싱 라이프사이클이 다름. fetch 실패는 silent (catch → setEndorsedPosts([])) — 메인 랜딩 렌더를 막지 않음.
- 결정: blog 랜딩과 team-blog 랜딩 두 곳에 동일 `renderEndorsedRail()` 헬퍼 — viewer 한 파일 안 inline closure (별 컴포넌트 추출 안 함). 두 변형은 wrapper 컨테이너(`blog-post-list-container` vs `blog-post-list-container--team`)만 다르고 rail 자체는 같은 grid.
- 결정: tag 표시 우선순위 = `topicAiDomainTag || topicTitle` — Wedge F 홈 rail 과 동일 컨벤션, 토픽 ai_domain_tag (예: "claude-code") 가 있으면 그걸, 없으면 한글 제목 fallback.
- 결정: K 의 promise 였던 "endorsed 토픽 글 public surface" 를 큐레이션 promotion (mirror) 보다 먼저 — promotion 은 토픽-글 ↔ 큐레이션-라인업 mapping table 등 결정 5개 이상이라 wedge 한 칸 더 무거움. 우선 surface 까지 박고 데이터 흐름 검증.
- 검증: Worker/Viewer TS 0 에러, Playwright 로컬 (vibe-coding owner=seed@local.dev) — 빈 상태 → 2 endorse → 4 카드 노출 (claude-code 3 / cursor 1, viewCount 5/0/0/0 정렬), cleanup 후 섹션 카운트 0. 프로덕션 — `/api/workspaces/clauders-ai/endorsed-topic-posts` 200 + `{topics:[],posts:[]}` (clauders-ai 에 endorsement 0건), 404 분기 정상.
- 다음 wedge 후보 (K3 등): 큐레이터 promotion (mirror 토픽 글 → 큐레이션 라인업) / endorsed rail "더 보기" 링크 (토픽 인덱스로) / draft 흐름 / 인기 rail v2 (de-dup, 기간 필터) / DEV_LOGIN_EMAIL 정상화 / d1_migrations 추적 prudence.

### Wedge L — 큐레이터 promotion (mirror 토픽 글 → 큐레이션 라인업) (5-10, done)
- DB: `workspace_topic_post_promotion` 테이블 + 마이그레이션 0065 — `(workspace_id, topic_post_id)` pair UNIQUE, 양쪽 cascade delete. 새 endorsement 처럼 lineage 가 아닌 평면 join 테이블 (mirror copy 가 아닌 reference). (`packages/worker/migrations/0065_add_workspace_topic_post_promotion.sql`, `packages/worker/src/db/schema.ts`)
- API: `GET /api/workspaces/:slug/promotions` (public, post+topic+author 조인, `promotedAt DESC`, default 12 cap 24, status=published 필터) / `POST` (owner-only 403, body topicPostId, target.status==='published' 검증 → 400, dup 체크 → 409, deterministic id `promo_{wsid_underscored}_{post_short}`) / `DELETE /:topicPostId` (owner-only 403). (`packages/worker/src/routes/workspaces.ts`)
- Viewer admin: `/dashboard/:workspace/promotions` 페이지 + canManage-gated "큐레이션 promote" sidebar nav. 두 섹션 — "현재 라인업" (라인업에서 내리기 버튼) + "후보" (라인업에 올리기 버튼, endorsed-topic-posts 가 후보 풀, 이미 라인업에 있는 글은 제외). (`packages/viewer/src/pages/admin/WorkspacePromotions.tsx/.css`, `packages/viewer/src/router.tsx`, `packages/viewer/src/layouts/AdminLayout.tsx`)
- Viewer landing: WorkspaceDocs 두 랜딩 변형에 `wsd-promoted-*` 라인업 rail (purple-bordered 박스 + 큐레이션 태그, accent-soft 배경) — 엔도스 rail 위에 배치. promotedPosts 배열 비면 섹션 통째 숨김. (`packages/viewer/src/pages/workspace/WorkspaceDocs.tsx/.css`)
- 결정: mirror copy semantics (post 본문 복제) 가 아닌 reference (join row) — 토픽 글 변경 시 자동 동기화, 작성자 attribution 자연 보존, 글 삭제 시 cascade. 큐레이션 라인업이 "큐레이터의 추천 stamp" 이지 "큐레이터가 다시 쓴 글" 이 아님. mirror 는 v2 (큐레이터가 본문에 코멘트 첨부하는 케이스).
- 결정: 후보 풀 = endorsed-topic-posts (K2 endpoint 재사용) — 모든 토픽 글이 아닌 endorse 한 토픽 의 글만 promote 가능. endorse 가 "이 토픽을 따른다" 의 의미라면 promote 는 "그 토픽 안에서 이 글을 골랐다" 의 의미 — 두 단계 게이트. 별 토픽 검색 UI 안 만들어도 자연.
- 결정: 라인업 rail 의 purple border + 큐레이션 태그 — 엔도스 rail (회색 dashed border, 회색 태그) 보다 시각적으로 한 층 강함. "이 큐레이터가 직접 골랐다" 시그널 차별화. 큐레이션 워크스페이스 본 콘텐츠 다음 → 라인업 → 엔도스 순서로 시각적 위계.
- 결정: deterministic id (`promo_{ws}_{post}`) — UUID 안 씀. 기존 wedge (endorse_*, post_*, topic_*) 와 일관, debug/log 시 의미 추적 가능.
- 검증: Worker/Viewer TS 0 에러. Playwright 로컬 (vibe-coding owner=seed@local.dev) — endorse claude-code → 후보 3개 → 1개 promote → 라인업 rail 1 카드 노출 + 엔도스 rail 1 카드 별도 (이미 라인업 있는 글 endorsed rail 에는 그대로 — 이중 노출 의도, 라인업/엔도스 두 시그널은 독립). 어드민 페이지 두 섹션 카운트 일치. 엣지: dup POST 409, no-auth POST 401, DELETE 200 → list 비움 확인. 프로덕션: 0065 remote D1 apply 성공, worker 배포 완료, GET 404 (엔드포인트 존재 확인 — 노출 워크스페이스 없음).
- 다음 wedge 후보 (M 등): mirror copy semantics v2 (큐레이터 코멘트 첨부) / 라인업 rail "더 보기" → 토픽으로 / draft 흐름 / 인기 rail v2 (de-dup, 기간 필터) / DEV_LOGIN_EMAIL 정상화 / 라인업 ↔ 엔도스 rail 시각 위계 더 분명히 (혹은 통합).

## Footprint (initial guess, validate during explore)

- **Auth/Identity**: 플랫폼-level user 테이블 (이미 존재 여부 확인 필요), handle/profile 필드, 소셜 로그인 연동
- **Routing**: `openhow.kr/u/{handle}` 프로필 페이지, 자기 글 목록 라우트
- DB: documents 테이블에 `kind` 또는 `lane` 분기 컬럼 (curation / community), `author_user_id` (워크스페이스 admin 이 아닌 가입자 id)
- viewer: 사이드바 섹션 분리, 가입자 글 작성 UI (현재는 admin/CLI 만 글 쓸 수 있음), 프로필 페이지
- worker: 가입자 권한 검증 (워크스페이스 차원의 게이트 정책 + 플랫폼 차원의 가입 검증), 가입자 글 publish endpoint
- CLI: `openhow publish` 흐름은 큐레이션만 — 가입자 글은 viewer UI 에서 직접 작성
- 정책: 가입자 글 default accessLevel, 모더레이션 (큐레이터 승인 필요 여부), 워크스페이스별 join 게이트 vs 자유 기고

## Backlog

- v2 항목들 (위 What 의 v2 마커)
- 멤버 글 RSS / 발행 알림
- 멤버 프로필 페이지 (작성한 글 목록)

## Learnings

### 2026-05-10: Wedge L 빌드 — 큐레이터 promotion (mirror 토픽 글 → 큐레이션 라인업)
- **Source**: 빌드 세션 (5-10, "다음 진행해줘")
- **Signal**: 옵션 C 의 마지막 큰 promise — "큐레이터 promotion (mirror 토픽 글 → 큐레이션 라인업)" 이 K2 끝났을 때 단독 candidate 로 남아 있었음. K 가 endorse 를 박고, K2 가 그걸 워크스페이스 화면에 surface 했고, L 이 그 위에서 "큐레이터가 라인업으로 골라 올린 글" 한 단계 더 강한 시그널을 만든다. 큐레이션 워크스페이스 ↔ 토픽 게시판 bridge 의 양방향 닫힘 — 큐레이터가 토픽을 endorse 하고 (K), 그 안에서 글을 골라 라인업으로 올린다 (L).
- **결정 / 학습**:
  - mirror copy 가 아닌 reference — `workspace_topic_post_promotion` 은 `(workspace_id, topic_post_id)` 평면 join, 본문 복제 안 함. 처음에 "mirror" 라는 단어 때문에 본문 복사를 떠올렸지만, 실제로 필요한 건 "이 큐레이터가 골랐다는 stamp" 일 뿐. 본문은 토픽 글 그대로, 클릭은 토픽 boards 의 원글로 이동. 작성자 attribution 자연 보존, 글 변경 시 자동 동기화, 글 삭제 시 cascade. 본문에 큐레이터 코멘트 첨부 케이스는 mirror copy 가 진짜 필요한 v2.
  - 후보 풀을 endorsed-topic-posts (K2 endpoint) 로 한정 — 모든 토픽 글이 promote 가능하지 않다. endorse 가 1차 게이트 ("이 토픽을 따른다"), promote 가 2차 게이트 ("그 토픽 안에서 이 글을 골랐다"). 별 검색 UI 만들지 않아도 자연스러운 흐름이 됨. 어드민 워크플로 = endorse 페이지 → promote 페이지 두 단계 (`canManage` 게이트 동일).
  - 라인업 rail 의 시각 위계 — purple border + accent-soft 배경 + "큐레이션" 태그. 엔도스 rail (회색 dashed border, 회색 태그) 보다 한 층 강함. 위치는 엔도스 rail 위 (큐레이션 본 콘텐츠 → 라인업 → 엔도스). "이 큐레이터가 직접 골랐다" 와 "이 큐레이터가 따르는 토픽의 인기 글" 이 다른 시그널이라 톤도 다르게.
  - 어드민 페이지의 두 섹션 (현재 라인업 / 후보) — 단일 리스트 + 토글 버튼 패턴 안 씀. 라인업/후보가 의미상 두 different states (라인업 = 골라진, 후보 = endorse 토픽의 인기). 두 섹션으로 가르고 각자 카운트 노출. 후보가 비면 "endorse 한 토픽에 글이 아직 없어요" 안내 — endorse → promote 의 흐름 가드.
  - deterministic id `promo_{ws_underscored}_{post_short}` — endorse 의 `endorse_{ws}_{topic}` 패턴 따름. UUID 안 씀. workspace id 의 hyphen 을 underscore 로 (sqlite 식별자 안 깨지게), `post_seed_2` 의 `post_` 접두 떼고 `seed_2` 만 — log/debug 시 ws ↔ post 연결을 한눈에. 동일 ws+post 는 자연스럽게 unique key.
  - dup → 409, non-published → 400, no-auth → 401, non-owner → 403 — 4가지 에러 분기를 모두 같은 endpoint 안에서 처리. unique index 가 dup 잡지만 응답 메시지 분기를 위해 SELECT 한 번 미리. owner check 는 `ws.ownerId !== user.id` inline (Wedge I 부터 굳어진 패턴, role-based 가 아니라 ownership-based).
  - DEV_LOGIN_EMAIL 정상화는 또 못 했음 — Wedge H 부터 다섯 wedge 째 "다음 후보" 에 적혀 있는 걸 또 미룸. `.dev.vars` typo 임시 변경 → 원복 워크플로가 매번 마찰. 다음 wedge 에서 진짜로 닫거나, 별 dev 계정 (rupy1014@gmail.com 도 superadmin) 하나 추가 시드해서 typo 무시하는 방향. 이번 wedge 는 검증 우선.
  - 검증 — 빈 promotion 상태 → endorse claude-code → 후보 3개 surface → 1개 promote → 라인업 rail 1 카드 + 엔도스 rail 1 카드 (같은 글 이중 노출) 가 의도. 라인업이 엔도스를 대체하지 않고 "골라진 일부" 만 강조하는 시그널. 같은 카드 두 곳 보이는 게 깨끗하지 않을 수 있지만, 라인업이 비면 그 자리를 다른 cue (큐레이터의 직접 추천 부재) 가 메우는 게 더 큰 손실. 시각 위계로 차별화로 충분.
  - 작은 sizing 한계 — 마이그레이션 + 3 endpoints + admin 1면 + landing rail 한 묶음 (~700줄) 한 wedge. K2 보다 무거웠지만 K 의 endorse CRUD 와 거의 동일 패턴 복사라 결정 비용은 낮음. mirror copy v2 / 큐레이터 코멘트 첨부 / draft 흐름 등 진짜 새 결정이 필요한 wedge 는 별도.
- **다음 wedge 후보**: mirror copy semantics v2 (큐레이터 코멘트 첨부) / 라인업 rail "더 보기" → 토픽으로 / draft 흐름 / 인기 rail v2 (de-dup, 기간 필터) / DEV_LOGIN_EMAIL 정상화 (이번엔 진짜) / 라인업 ↔ 엔도스 rail 시각 위계 더 분명히 (혹은 같은 글 이중 노출 dedup 옵션).

### 2026-05-10: Wedge K2 빌드 — 워크스페이스 화면에서 endorsed 토픽 글 surface
- **Source**: 빌드 세션 (5-10, "다음 진행해줘")
- **Signal**: Wedge K 가 admin endorse CRUD 만 박고 끝났음 — 사용자 입장에선 워크스페이스 화면에서 endorsed 토픽이 안 보이면 endorse 자체가 무의미한 운영자 메타. K2 가 그 promise 를 닫는다. 동시에 Wedge F 홈 rail 이 토픽 글을 플랫폼 차원에서 노출하므로, 워크스페이스 차원 surface 는 "이 큐레이터가 추천하는 같은 주제의 다른 가입자 글" 시그널 — 큐레이션 워크스페이스 ↔ 토픽 게시판의 첫 가시적 bridge.
- **결정 / 학습**:
  - 새 public endpoint `/endorsed-topic-posts` 분리 — `/documents?workspace=` 응답에 끼워넣지 않음. WorkspaceDocs 가 처음에 static manifest (CDN-cached `_data/{slug}/manifest.json`) 을 우선 시도해서 워크스페이스 문서를 즉시 그리는데, 토픽 글은 viewCount 가 자주 바뀌므로 manifest 캐싱 라이프사이클과 충돌. 별 endpoint 라 실시간 fetch 가 자연스럽고 fetch 실패도 메인 랜딩을 막지 않음.
  - `inArray` + 기존 Wedge F 의 topicPostsFeed select shape 재사용 — drizzle 의 `inArray(schema.topicPost.topicId, topicIds)` 한 번에 묶음 쿼리. 토픽별 round-robin (각 토픽에서 N개씩) 같은 균등 분배 안 함 — 새 사이트라 어차피 한쪽 토픽이 비면 다른 토픽 글이 채우는 게 더 자연. 데이터 쌓이면 별 wedge 로 균등화.
  - rail 위치는 standard blog 변형의 `rest.length > 0` 이후 (모든 워크스페이스 글 다음), team-blog 변형은 articles-section 다음 series 앞 — 큐레이션 워크스페이스의 자기 콘텐츠 우선, 커뮤니티 토픽 surface 는 "여기 더" 자리. Wedge F 홈에서 "전체 아티클/인기 글 → 토픽 게시판 → 시리즈" 순서와 동형.
  - `renderEndorsedRail()` 인라인 헬퍼 — 두 랜딩 변형이 wrapper 만 다르고 rail 자체 동일이라 클로저 한 칸으로 충분. 별 `<EndorsedTopicRail>` 컴포넌트 추출하면 부모 css scope 에서 분리돼서 톤 일치 보장이 어려움 (Wedge H 의 마크다운 미리보기 헬퍼 결정과 동형 패턴).
  - tag 우선순위 `topicAiDomainTag || topicTitle` — Wedge F 의 `pbh-topic-post-tag` 와 동일 컨벤션 의도적으로 맞춤. 같은 토픽 라벨 (`claude-code`) 이 홈 rail / 워크스페이스 rail / 토픽 보드 헤더 세 곳에 동일 시각으로 보여 "같은 entity" 인식 강화.
  - empty endorsement 면 endpoint 가 즉시 `{topics:[],posts:[]}` 반환 — 빈 inArray 가 SQL 레벨에서 unsafe path 인데 (드라이버에 따라 `1=0` 으로 fallback 안 할 수 있음), endorsement 개수만 미리 보고 가지치는 게 안전.
  - viewer 의 fetch catch 가 silent — endpoint 실패해도 setEndorsedPosts 는 초기값 [] 유지. 워크스페이스 자체 문서는 제대로 보여야 하는데 토픽 surface 가 빠져도 큐레이션 정체성은 안 죽음. degrade graceful.
  - K2 의 sizing — endpoint 1개 + viewer 1면 + css 한 묶음 (~210줄) — 한 wedge 단위. promotion (mirror) 은 결정이 5개 이상 (토픽 글 ↔ 큐레이션 글 mapping table, mirror copy semantics, 작성자 attribution, mirror 후 토픽 글 변경 시 동기화 정책 등) 이라 별 wedge.
  - 프로덕션 smoke 가 endorsed 0건이라 비어 있는 형태만 검증된 한계 — 실제 endorsed 가 있는 prod 워크스페이스가 없어 "rail 이 prod 에서 그려지는지" 까지는 다음 endorsement 작업 후 자연스럽게 검증됨. 새 endpoint 추가는 보수적 가시성으로 시작.
- **다음 wedge 후보**: 큐레이터 promotion (mirror 토픽 글 → 큐레이션 라인업) / endorsed rail "더 보기" 링크 (토픽 인덱스로) / draft 흐름 / 인기 rail v2 (de-dup, 기간 필터) / DEV_LOGIN_EMAIL 정상화 / d1_migrations 추적 prudence.

### 2026-05-08: Wedge K 빌드 — 워크스페이스 ↔ 토픽 endorse bridge Phase 1 (admin CRUD)
- **Source**: 빌드 세션 (5-08, "다음 진행해줘")
- **Signal**: 옵션 C 핵심 promise (큐레이션 ↔ 토픽 bridge) 의 첫 연결 — Wedge A~J 가 토픽 라인 (Reddit 축) 을 read/write/discover 까지 닫았고 Wedge F 가 홈에서 토픽 글을 노출했지만, 큐레이션 워크스페이스 (Medium 축) 와 토픽 사이는 여전히 분리된 두 라인이었음. endorse 가 두 축 사이의 첫 명시적 관계.
- **결정 / 학습**:
  - 옵션 C 약속을 한 wedge 로 안 닫고 Phase 1 (admin CRUD only) 으로 잘림 — 웍스페이스 owner 가 토픽을 endorse 하는 메커니즘을 먼저 박고, 워크스페이스 화면에서 endorsed 토픽 글 surface (public 렌더링) 는 K2 로 분리. 한 번에 schema + admin + public surface + 큐레이션 promotion 까지 다 잡으면 결정/검증 둘 다 얕아짐. wedge 사이즈는 "결정 5개, 검증 5분 안" 에 닫히는 게 기준.
  - 결정론적 id (`endorse_${ws_id}_${topic_short_id}`) — uuid 안 씀. 운영자가 D1 console 에서 어느 워크스페이스가 어느 토픽을 endorse 했는지 id 만 보고 추론 가능. Wedge I (`topic_${slug.replace(/-/g,'_')}`) 와 동형 패턴.
  - admin 사이드바에 "토픽 endorse" 한 칸 추가 — 별 modal/dialog 안 만듦. CLAUDE.md memory 의 "Admin UI architecture = Route-first Resource Admin" 정렬: list/new/edit 라우트로 정착, modal 은 작은 보조 작업일 때만.
  - workspace owner 검증은 `ws.ownerId !== user.id` 인라인 — middleware 분리 안 함. 토픽 admin 은 superadmin (Wedge I), 워크스페이스 endorse 는 owner — 권한 모델이 다른 두 surface 라 middleware 추출하면 한쪽 invariant 가 흐려짐.
  - 0063 d1_migrations 추적 누락 발견 — Wedge J 의 prod migration apply 가 view_count 컬럼은 추가했지만 d1_migrations 행을 안 적었음 (혹은 wrangler 버전 이슈). 0064 apply 시 0063 가 다시 시도돼 "duplicate column" 에러. d1_migrations 에 0063 row 수동 INSERT 하고 0064 정상 apply. 다음 wedge 부터 deploy 직후 `d1_migrations` 마지막 행 확인하는 절차 추가 권장.
  - public GET 은 모두에게 — endorsed 관계는 워크스페이스의 큐레이션 정체성을 비-멤버에게 보여주는 신호이기도 함. K2 의 public surface 가 이 endpoint 위에 자연스럽게 올라갈 수 있게 미리 공개 형태로 둠.
- **다음 wedge 후보**: K2 워크스페이스 화면에서 endorsed 토픽 글 surface (Wedge F 홈 rail 패턴 재사용) / 큐레이터 promotion (mirror 토픽 글 → 큐레이션 라인업) / 작성자 draft 흐름 / 인기 rail v2 (de-dup, 기간 필터) / DEV_LOGIN_EMAIL 정상화.

### 2026-05-08: Wedge J 빌드 — 토픽 글 viewCount + 인기 rail
- **Source**: 빌드 세션 (5-08, "다음 진행해줘")
- **Signal**: 글마다 인기 신호가 0이면 큐레이터가 "어떤 글을 라인업으로 승격할지" 의 후보 풀이 비어 있음. endorse bridge 의 전제 데이터. 동시에 가입자 입장에선 "내 글이 얼마나 읽혔는가" 가 다음 글 쓸 동력.
- **결정 / 학습**:
  - 별 popular rail 추가 안 함 — 기존 "토픽 게시판" rail 의 정렬을 viewCount DESC, createdAt DESC 로 바꾸고 헤더 카피만 "인기 토픽 글" 로 교체. 빈 사이트에서 두 rail (최신 / 인기) 이 둘 다 같은 글로 채워지면 어색. 데이터 쌓이면 의미가 살아남.
  - 검증을 위해 detail GET 으로 카운터를 직접 bump 함 — 새 사이트에서는 인기 신호가 0 누적 상태이므로 데모/테스트도 어렵다. 추후 인기 rail v2 에서 de-dup (세션 기반, IP 기반) 가능성. 현재는 hit = 1 의 단순 카운터.
  - SQL `view_count + 1` 은 race condition 에 안전 (atomic). drizzle 의 `sql\`...\`` template 으로 `set({ viewCount: sql\`...\` })` 패턴. JS 에서 +1 후 set 하면 동시 GET 시 손실.
  - 카운터 업데이트는 try/catch 로 감싸서 실패해도 read 가 깨지지 않게 함 — viewCount 는 부수 정보, prod 에서 락/타임아웃 같은 D1 건드림이 detail render 를 막으면 본질 손실.
  - "조회 N" 표기는 세 surface (홈 카드 / 보드 카드 / 디테일 헤더) 동일 톤으로 — 한 곳에서만 보이면 "이게 신호인가" 가 약해짐.
- **다음 wedge 후보**: 큐레이터 ↔ 토픽 endorse bridge / draft 흐름 / 인기 rail v2 (de-dup, 기간 필터) / DEV_LOGIN_EMAIL 정상화.

### 2026-05-08: Wedge I 빌드 — 토픽 admin CRUD `/superadmin/topics`
- **Source**: 빌드 세션 (5-08, "다음 진행해줘")
- **Signal**: 토픽이 늘어날 때마다 D1 SQL 직접 박는 마찰 — 첫 두 토픽 (claude-code, cursor) 은 마이그레이션 INSERT 로 박았지만, AI 도메인-specific 정체성을 살리려면 토픽 추가가 일상이 돼야 함. CLAUDE.md memory 의 "Admin UI architecture = Route-first Resource Admin" 과도 정렬.
- **결정 / 학습**:
  - GET 응답에 leftJoin+groupBy postCount 동봉 — Wedge A 의 공개 `GET /api/topics` 와 동일 패턴 재사용. 별 admin-전용 엔드포인트로 분리 안 함, 같은 데이터 형태에 권한 게이트만 다름.
  - id 컨벤션 `topic_${slug.replace(/-/g, '_')}` — 결정론적이라 seed/admin 양쪽이 같은 id 규칙. uuid 안 씀 (운영자가 D1 console 에서 추론 가능해야 디버그 빠름).
  - postCount > 0 인 토픽 삭제 차단 — soft-delete 안 하고 hard-delete 채택 이유. 토픽 자체는 게시글과 다르게 한 번 만들면 거의 안 지움 (정책적 결정), 지울 일이 있다면 글이 0건이어야 안전. Cascade 안 함.
  - SuperadminLayout 에 NavLink 두 개로 — 워크스페이스 페이지 한 장만 있던 시절엔 nav 가 없었지만, 두 장이 되니까 패턴이 안 맞아 졌음. 미래 superadmin 페이지가 생길 때마다 NavLink 한 줄 추가로 끝나는 구조.
  - 검증을 위해 `.dev.vars` 의 SUPERADMIN_EMAILS/DEV_LOGIN_EMAIL 임시 변경 후 원복 — Wedge H 학습에 적었던 이슈가 실제로 또 한 번 마찰. 다음 wedge 후보에 정상화 항목 명시.
- **다음 wedge 후보**: 큐레이터 ↔ 토픽 endorse bridge / draft 흐름 / viewCount + 인기 rail / DEV_LOGIN_EMAIL 정상화.

### 2026-05-08: Wedge H 빌드 — 마크다운 미리보기 토글
- **Source**: 빌드 세션 (5-08, "다음 진행해줘")
- **Signal**: 작성/수정 폼이 textarea 한 칸이라 글 등록 직전 형태 확인이 안 됨. 마크다운 문법 익숙한 사용자에게도 "내가 친 *문법* 이 의도대로 변환되나?" 가 가장 잦은 인지 부담. Medium/Reddit 모두 미리보기 탭이 기본.
- **결정 / 학습**:
  - 별 컴포넌트 추출 (`MarkdownBodyField` 같은) 안 함 — 두 곳만 쓰는 ~30줄 패턴이고 추출하면 부모 폼 CSS naming 과 분리돼서 시각 일치를 보장하기 더 어려워짐. 같은 코드를 두 번 쓰는 게 한 줄 추상화보다 나음.
  - 미리보기 함수는 `cachedRenderMarkdown` (DocPage / TopicPostDetail 과 동일) — 별 미리보기-only 렌더러를 만들지 않음. "미리보기 ≡ 실제 렌더" 가 사용자 약속.
  - 빈 본문 분기를 placeholder 텍스트로 — 빈 미리보기 박스가 그대로 보이면 "왜 안 나와?" 의 침묵이 더 무서움.
  - 탭 active 색상은 `accent-soft`/`accent` 로 TopicIndex 카드 태그 색과 일치 — 토픽 라인업 전체가 같은 시각 시그널.
  - dev-login (`/api/dev/login`) 의 better-auth 세션 cookie 가 viewer 의 `useAuthStore` 로 정상 전파됨 — Wedge E 까지 apikey 만 검증했던 happy path 가 이번에 처음으로 세션-기반으로도 닫힘. 다만 `.dev.vars` 의 `DEV_LOGIN_EMAIL` 이 여전히 typo (`rupy1008@gamil.com`) 라 임시 변경 후 원복하는 워크플로 — 다음 wedge 에서 정상화 필요.
  - 미리보기 v2 (코드 하이라이트, canvas-flow, link-card 등 SSG/SPA 확장 디렉티브) 는 backlog — 현재는 기본 마크다운만 확인. 토픽 글이 아직 노트 길이라 확장 디렉티브 사용은 드물 가정.
- **다음 wedge 후보**: 토픽 admin CRUD / 큐레이션 ↔ 토픽 endorse bridge / draft 흐름 / 토픽 글 viewCount + 인기 rail.

### 2026-05-08: Wedge G 빌드 — 토픽 인덱스 라우트 `/t`
- **Source**: 빌드 세션 (5-08, "다음 진행해줘")
- **Signal**: Wedge F 가 홈에서 토픽 글 카드를 띄웠지만 토픽 자체를 둘러볼 진입이 없음. `/t/claude-code` 만 있고 `/t` 가 비어 디스커버리 루프 한 칸이 빠진 채로 남아 있었음.
- **결정 / 학습**:
  - Worker 변경 0건 — Wedge A 의 `GET /api/topics` 가 이미 leftJoin + groupBy 로 postCount 까지 내고 있어 viewer-only wedge 로 닫힘. "다음 wedge = 백엔드+프론트 한 셋" 이라는 무의식적 가정 깨야 — 작은 viewer 한 장이 디스커버리 루프 한 칸을 메우는 게 더 정확.
  - 카드는 ai_domain_tag pill + post count + description — TopicBoard 헤더와 색상 톤 (accent soft blue) 일치시켜 인덱스→보드 진입이 같은 시각 라인업으로 보이게.
  - 빈 상태/로딩/에러 분기 모두 단일 main 안에서 — 별 라우트 안 쓰고 컴포넌트 안 분기 (TopicBoard 와 동일 패턴).
  - 토픽 보드에서 인덱스로 돌아가는 링크는 이번 wedge 에선 보류 — 헤더에 백 링크 넣으면 카드 헤더 레이아웃 비례가 깨짐. 별 네비 wedge 로 분리.
- **다음 wedge 후보**: 토픽 admin CRUD / 큐레이션 ↔ 토픽 endorse bridge / 마크다운 미리보기 / 토픽 글 viewCount + 인기 rail.

### 2026-05-08: Wedge F 빌드 — 디스커버리 진열대에 토픽 글 진입
- **Source**: 빌드 세션 (5-08, "다음 진행해줘")
- **Signal**: 작성→읽기→프로필→수정/삭제까지 됐지만 가입자 글이 홈에 안 잡히면 "1급 시민" 이 아니라 후방 구역. 가시성 wedge 가 가장 큰 임팩트.
- **결정 / 학습**:
  - 위치는 latest/popular 그리드 바로 다음 — 큐레이션 라인 (Featured/전체 아티클/인기 글) 을 위에 두면서 가입자 라인을 같은 첫 화면 안에 들임. Hero 위로 올리지 않음. 큐레이션-우선 정체성과 1급 시민화 가 양립 가능한 sequence: 위 → 큐레이션, 아래 → 커뮤니티.
  - 빈 배열일 때 섹션 통째로 숨김 (`feed.topicPosts?.length > 0`) — 새 사이트에서 "0건" 이 노출되면 어색.
  - "더 보기" 링크 안 만듦. 토픽 인덱스 라우트 (`/t` 만 누르면 모든 토픽) 가 아직 없어서 — 카드 자체로 진입.
  - 카드는 단순 (태그 + 제목 + 작성자·날짜). 워크스페이스 카드처럼 썸네일/desc 안 둠 — 토픽 글은 노트 성격이라 짧은 카드가 맞음.
  - 8건 limit (서버) → 6건 slice (클라이언트). 향후 "최근 + 인기 + 카테고리별" 분리 가능성 두면서 단순 시작.
- **다음 wedge 후보**: 큐레이션 ↔ 토픽 endorse/승격 bridge (featured_content 패턴 재사용?) / 토픽 admin CRUD / 토픽 인덱스 라우트 / 마크다운 미리보기.

### 2026-05-08: Wedge E 빌드 — 글 수정/삭제 (작성자 본인만)
- **Source**: 빌드 세션 (5-08, "다음 진행해줘")
- **Signal**: 작성→읽기→프로필 모음 (Wedge B/C/D) 흐름 다음, 작성자가 자기 글을 손볼 수 없는 게 가장 기본 빈칸. 댓글·보팅 같은 큰 wedge 보다 CRUD 완결을 먼저.
- **결정 / 학습**:
  - Soft-delete (`status='deleted'`) 채택 — `topic_post.status` 필드 이미 default 'published' 로 존재하고 모든 read 쿼리가 published 필터를 갖고 있어 변경 0. Hard delete 였으면 cascading 검토 필요했을 것.
  - Edit form 은 별도 라우트 (`/edit`) 안 만들고 Detail 화면 안 toggle — Wedge B 의 인라인 composer 패턴과 동형. 라우트 늘리면 작성→수정 mental model 분기.
  - 권한 체크는 endpoint handler 안에서 (`post.authorUserId !== user.id` → 403) — middleware 로 추출하기엔 path 의존도가 너무 높고 토픽/포스트 양쪽 lookup 이 묶여 있음.
  - 인증된 happy path 검증은 임시 API key 시드 + Bearer 헤더로 — dev-login 의 DEV_LOGIN_EMAIL 환경 변수 변경 부담 회피. 별도 user/apikey 시드해서 403 도 검증.
  - `crypto.subtle.digest` SHA-256 해시 == Node `crypto.createHash('sha256').digest('hex')` 동일 결과 — 시드 스크립트는 Node 로, 검증은 Worker 안에서 자연스럽게 일치.
- **다음 wedge 후보**: 토픽 admin CRUD / 큐레이션 ↔ 토픽 endorse bridge / 디스커버리 진열대에 토픽 글 진입 / 마크다운 미리보기.

### 2026-05-08: Wedge D 빌드 — AuthorProfile 에 토픽 글 섹션 추가
- **Source**: 빌드 세션 (5-08, "다음 진행해줘")
- **Signal**: Wedge C done 후 가장 자연스러운 후속은 "가입자 1급 시민" 의 가시화 — 글을 써도 자기 프로필에 모이지 않으면 작성 동기가 약함. `/u/:handle` 분리 라우트 vs `/s/:username` 확장 사이에서 후자 선택.
- **결정 / 학습**:
  - `/u/:handle` 새 라우트를 만들지 않고 기존 `/s/:username` AuthorProfile 한 화면에 큐레이션 글 + 토픽 글을 병렬 섹션으로 둠. URL 두 개 만들면 가입자 정체성이 분열되고 큐레이터/가입자 hybrid 정체성 (intent 의 "1급 시민" 정의) 도 약해짐.
  - API 추가는 Promise.all 한 칸 — author 의 topic post 쿼리 (published 만, topic join, 최근 20). 새 endpoint 안 만들고 기존 `/api/authors/profile/:username` 응답 확장.
  - `topicPosts` 빈 배열일 때 섹션 통째로 숨김 — 새 가입자 프로필이 빈 섹션으로 어색해지지 않도록.
  - 토픽 글 카드는 워크스페이스 글 카드보다 단순하게 (썸네일/설명 없이 제목 + 토픽명 · 날짜) — 토픽 글은 짧은 노트가 기본 가정이라 카드 레이아웃도 짧게.
- **다음 wedge 후보**: 토픽 admin CRUD / 큐레이션 ↔ 토픽 endorse bridge / 디스커버리 진열대에 토픽 글 진입 / 글 수정·삭제.

### 2026-05-08: Wedge C 빌드 — 게시글 상세 라우트 + 마크다운 렌더
- **Source**: 빌드 세션 (5-08, "추천대로 진행해줘")
- **Signal**: Wedge B 작성 UI 가 카드 onClick dead button 으로 끝나서 작성한 글이 어디로도 안 가는 미완 상태 → 배포 전에 클릭 동선부터 메우는 게 자연스러움.
- **결정 / 학습**:
  - viewer 마크다운 렌더는 기존 `utils/markdownCache.ts` (`cachedRenderMarkdown`) 재사용 — DocPage 와 동일 토대. 별 패키지/라이브러리 도입 없음.
  - 카드 element 를 `<button>` → `<Link>` 로 바꾸면서 CSS `text-decoration: none` 만 보강 — 시각/접근성 그대로 유지하면서 SPA navigation 동작.
  - 404 페이지에 "토픽 게시판으로" 백 링크 한 개만 — admin 같은 dead end 회피.
  - 작성자 username 있으면 `/s/:username` (기존 AuthorProfile) 으로 링크 — 토픽 글이 아직 거기 없어도 큐레이션 워크스페이스 글이 모임. "내가 쓴 글" 통합은 다음 wedge.
- **다음 wedge 후보**: 토픽 admin CRUD / `/u/:handle` 프로필 (토픽 글 + 워크스페이스 글 통합) / 프로덕션 배포.

### 2026-05-08: Wedge B 빌드 — 게시글 작성 UI (가입자 인증)
- **Source**: 빌드 세션 (5-08)
- **Signal**: 사용자 "다음 진행해줘" → "Wedge B — 작성 UI" 선택.
- **결정 / 학습**:
  - 게시글 본문은 R2 안 쓰고 D1 `topic_post.body_md` inline — 토픽 글은 100KB 이내, R2 의존성 줄여 단순화. (큐레이션 발행 라인은 R2 그대로 — 분리 정책 유지)
  - 작성 UI 는 별도 `/t/:topic/new` 라우트 안 만들고 `TopicBoard` 안 인라인 토글 — 첫 wedge 는 플로우 길이 최소화. 마크다운 미리보기/리치 에디터는 다음 wedge.
  - 비로그인 사용자에게 폼 자체를 안 보여주고 `/login` 링크로 안내 — 로그인 wall 단순화.
  - 0062 마이그레이션의 `unixepoch() * 1000` 시드는 schema `mode: 'timestamp'` (초) 와 단위 충돌 → 수정. production 미적용이라 무비용.
  - 인증된 POST happy path E2E 는 현재 환경에서 dev-login 변경 부담으로 skip — code review (`workspaces.community` 와 동일 패턴) 로 갈음. 다음 wedge 에서 로그인 후 폼 제출 한 번 검증 권장.
- **다음 wedge 후보**: 게시글 상세 라우트 / 토픽 admin / `/u/:handle` 프로필.

### 2026-05-07: Wedge A 빌드 — 토픽 게시판 read-only 토대 완료
- **Source**: 빌드 세션 (5-07)
- **Signal**: 사용자 "이제 빌드해줘" → 가장 작은 토대 wedge 부터.
- **결정 / 학습**:
  - `topic_post` 를 `document` 와 별 테이블로 분리 — workspace-bound 모델 오염 방지. (대안: `document.topic_id` 컬럼 추가는 거절)
  - Better Auth `user` 테이블 그대로 쓰고 가입자 identity 추가 작업 0 — 이미 충분.
  - Seed 토픽은 마이그레이션 SQL 안에 INSERT 로 박음. 운영 늘어나면 admin UI 로 이관.
  - 빈 상태 ("아직 글이 없어요. 첫 글을 써보세요.") 는 작성 UI 없는 상태에서도 일단 텍스트로 — 다음 wedge 에서 실제 작성 동선 연결.
- **다음 wedge 후보**: 위 Build Progress → Wedge B 목록.

### 2026-05-07: openhow = AI 사이트로 포지셔닝 잠금
- **Source**: 사용자 발화 (5-07 session)
- **Signal**: "오케이 이 프로젝트는 ai 사이트 로 포지셔닝 하자고."
- **Intent change**:
  - 5-04 의 "롱블랙-style 큐레이션 multi-tenant" 위에 "AI 도메인-specific" 레이어 추가
  - 옵션 C 잠금 (큐레이션 워크스페이스 + 플랫폼-level 토픽 게시판 하이브리드)
  - status: exploring → clarified
  - 다음: build 단계 진입

### 2026-05-07: 게시판은 워크스페이스 안이 아니라 플랫폼-level 토픽이어야 자연스러움
- **Source**: 사용자 발화 + 벤치마크 리서치 (5-07 session)
- **Signal**: "워크스페이스 라기보다는 공통 게시판이라고 하는게 어떤가? 채널이라고 해야하나? 사실 주제별 게시판이 맞는거같은데."
- **Intent change**:
  - 워크스페이스-bound 게시판 (옵션 A) 폐기 가까움 → 플랫폼-level 토픽 게시판 (옵션 B/C) 로 가설 이동
  - 큐레이터 워크스페이스 = 유료 큐레이션 발행 (그대로 유지)
  - 토픽 게시판 = 플랫폼 1급 entity, 가입자 자유 기고
  - 둘 사이 bridge: endorse / 승격 (mirror)
  - 벤치마크: Medium + Reddit 하이브리드 모델이 가장 근접

### 2026-05-07: identity 모델은 워크스페이스 단위 → 플랫폼 단위로 격상
- **Source**: 사용자 발화 (5-07 session)
- **Signal**: "openhow 에 서비스를 가입해서 게시판에 글 쓸수있는거지. 단순 독자만 되는게 아니라. 큐레이션 서비스이자 커뮤니티인거고, 게시판에 글 쓰면 내가 쓴글에서도 볼수있는거고."
- **Intent change**:
  - 글 쓰는 주체 = 워크스페이스 멤버 (X) → openhow 플랫폼 가입자 (O)
  - "내가 쓴 글" 페이지 = 자기 활동을 워크스페이스 가로질러 모으는 프로필
  - 가입자는 단순 독자/구독자가 아니라 **읽기+쓰기 1급 시민**
  - status: seed → exploring (Why 가 충분히 구체화돼서 가설 검증 단계 진입)
