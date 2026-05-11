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

### Wedge R — 인기 rail v2: likeCount 가중 합산 (5-11, done)
- 배경: Wedge J 가 인기 rail 을 viewCount 만으로 정렬했고, Wedge Q 에서 likeCount 신호를 만들었지만 surface 에 연결 안 됨. 가입자 engagement 의 가장 강한 신호 (passive view 보다 accountable action) 를 정렬에 합산 — Wedge Q 의 직접 확장. 큐레이터 promotion 의 자동 후보 surface 와도 결이 같음 (좋아요 ↑ = 라인업 후보 ↑).
- Worker — `/api/public/feed` topicPostsFeed 정렬을 `desc(viewCount + likeCount * 5), desc(createdAt)` 로 변경. select 에 `likeCount` 추가. Drizzle `sql` 템플릿으로 컬럼 산술 표현 — 가중치 5 변경 시 한 곳만 수정. (`packages/worker/src/routes/public-feed.ts`)
- Viewer — PublicBlogHome `PublicTopicPost` 인터페이스에 `likeCount?: number` 추가, 인기 토픽 글 카드 meta 에 `♥ N` (likeCount>0 일 때만, 조회 옆 dot 구분자) — Wedge Q 의 TopicBoard 카드와 동일 패턴. 섹션 카피 "조회수 순" → "조회수 + 좋아요 가중". (`packages/viewer/src/pages/PublicBlogHome.tsx`)
- 결정: 가중치 5 — 1 like ≈ 5 views. 좋아요는 클릭 + 로그인 신원이 필요한 accountable action, view 는 passive (봇/실수 클릭 포함). 너무 작으면 (≤2) 신호 묻히고, 너무 크면 (≥10) view 신호가 무력화. 5 는 SNS engagement heuristic 의 보수적 중간값. 추후 트래픽 쌓이면 데이터로 검증 후 조정 가능.
- 결정: SQL 산술 (`viewCount + likeCount * 5`) vs 별 score 컬럼 — 컬럼 추가 안 함. score 는 두 카운트의 derived value 이고, 매번 like 시 score 컬럼도 같이 갱신해야 하면 정합성 부담. 인기 rail 은 limit 8 + index 가능한 작은 쿼리라 산술 비용 무시 가능.
- 결정: 가중치 변경 시 backward-compat 고민 안 함 — 정렬 기준일 뿐, 응답 shape 안 바뀜. 클라이언트가 점수 자체를 의존할 일 없음.
- 결정: TopicBoard list 정렬은 손 안 댐 — 보드 내부는 발행 순서 (최신 위) 가 기본 직관. 인기순 정렬 필요해지면 별 wedge (보드에 정렬 토글 추가).
- 검증: Worker/Viewer TS 0 에러. `temp/popular-rail-v2-smoke.cjs` Playwright — 글 A (views=30, likes=0, score=30) vs 글 B (views=5, likes=1, score=10) 시드 → feed 응답 정렬: A > B > 기존 tip(7) > smoke(3) > 0s 확인 / likeCount 필드 응답에 포함 / 홈 카드 6개 중 3개에 ♥ 배지 노출. 프로덕션 (Version 33a8a2ee) — openhow.io 200, `/api/public/feed` 200 (topicPosts=[], 새 컬럼 select 에러 없음).
- 다음 wedge 후보 (S 등): 큐레이터 promotion UI 에 좋아요 상위 글 자동 후보 표시 (Wedge L 의 후보 리스트를 likeCount desc 로 정렬) / 내가 좋아요한 글 모음 (`/me/likes`) / 좋아요 알림 (작성자에게 새 좋아요 시) / 워크스페이스 endorsed 토픽 글 rail 도 likeCount 노출 / 좋아요 카운트 drift reconcile cron / 인기 rail v3: 시간 감쇠 (오래된 글의 viewCount 가 영원히 상위 점유 막기).

### Wedge Q — 토픽 글 좋아요 v1 (5-11, done)
- 배경: v1 What 모두 완료된 시점. v2 의 "좋아요/하이라이트 — 큐레이션 승격 후보 신호" 가 가장 strategic — 큐레이터 mirror (Wedge L) 가 사람이 직접 고르는 경로라면, 좋아요는 자동으로 surface 후보를 만들어주는 신호. 가입자 engagement 의 1차 metric 도 됨.
- DB — migration 0066: `topic_post_like` 신설 (composite PK `(topic_post_id, user_id)`, `created_at`, post/user 별 FK CASCADE, 보조 index 2개). `topic_post` 에 `like_count INTEGER NOT NULL DEFAULT 0` 추가 — 비정규화 카운트 (count 쿼리 매번 도는 것보다 cheap, +/- atomic update). schema.ts 에 `topicPostLike` 테이블 export + `primaryKey` helper import. (`packages/worker/migrations/0066_add_topic_post_like.sql`, `packages/worker/src/db/schema.ts`)
- Worker — `POST /api/topics/:slug/posts/:postSlug/like` (requireAuth): 좋아요 row 없으면 insert + `like_count` +1, 있으면 no-op (멱등). published 글 한정 (draft/deleted → 404). 응답 `{ ok, viewerLiked: true, likeCount }`. `DELETE` 동일 경로: row 있으면 delete + `like_count` -1 (`MAX(... - 1, 0)` 으로 음수 가드). status 제약 없음 — draft 로 전환된 글에서도 cleanup 가능. (`packages/worker/src/routes/topics.ts`)
- Worker — 응답 likeCount/viewerLiked: 토픽 보드 list (`GET /topics/:slug`) posts 에 `likeCount` 추가. detail (`GET /topics/:slug/posts/:postSlug`) post 에 `likeCount` + `viewerLiked` (로그인 안 했으면 false, 했으면 like row 존재 여부). draft 분기 후에도 안전하게 채워서 반환.
- Viewer — TopicPostDetail 좋아요 버튼: 본문 article 아래 중앙 정렬 토글 버튼 `♡ / ♥ + count`. optimistic update — 클릭 즉시 state 변경 + 카운트 ±1, 서버 응답으로 보정. 실패 시 이전 상태로 rollback. `is-liked` 클래스로 채워진 하트 + 핑크/빨강 톤 (`#fef2f2` bg, `#b91c1c` text, `#f87171` border). 비로그인 클릭 시 `/login` 으로 redirect. draft 글은 버튼 자체 미노출 (status !== published). (`packages/viewer/src/pages/TopicPostDetail.tsx/.css`)
- Viewer — TopicBoard 카드 meta 에 `♥ N` — `likeCount > 0` 일 때만 노출 (0 은 노이즈). 조회 옆에 dot 구분자로 추가. (`packages/viewer/src/pages/TopicBoard.tsx`)
- 결정: 비정규화 카운트 vs `COUNT(*)` 쿼리 — 비정규화. 좋아요는 listing 의 핫패스 (보드 한 번 열 때마다 N 글 카운트) 라 매번 join+count 는 N+1. trigger 대신 어플리케이션 레벨 +1/-1 (sqlite trigger 는 가능하지만 마이그레이션/디버깅 복잡도 ↑). 이론적으로 race condition 가능하지만 한 user-post pair 가 동시에 두 번 요청할 가능성 ≈ 0 + 멱등 가드 (existing check) 가 1차 방어. drift 가 누적되면 별 wedge 로 reconcile cron 추가 가능.
- 결정: 멱등 POST/DELETE — REST 정공법은 PUT 또는 POST/DELETE 의 멱등 보장. 두 번째 POST 가 throw 하면 클라이언트가 race 시 무작정 retry 못 함. existing check → no-op + 항상 200. 같은 패턴이 React 19 의 concurrent rendering 에서도 안전.
- 결정: viewerLiked 는 detail 만, list 는 미포함 — list 의 viewerLiked 를 채우려면 user_id 기준 join 1번 추가. 보드 한 번 열 때 N 행마다 viewerLiked 가 정말 필요한가? 일단 답: 카운트만 보여주고, 본인 좋아요 여부는 detail 에서 보임. 보드에서 "이미 좋아요한 글" 표시가 필요해지면 별 wedge.
- 결정: 좋아요 0 일 때 카드 meta 노출 안 함 — 0/0/0 행렬이 시각적 노이즈. `> 0` 일 때만 표시. 댓글 0/조회 0 도 같은 원리지만 조회는 항상 노출 — 조회는 SEO/관심도 기본 신호라 0 표시도 의미 있음. 좋아요는 social proof 라 0 = 없는 게 깔끔.
- 결정: 좋아요 UI 는 본문 article 아래 — Medium clap 위치 (본문 끝). 헤더 meta 에 넣으면 읽기 전 클릭이 빈번해질 수 있음. 본문 다 읽고 좋아요를 누르는 흐름이 가치 있는 시그널.
- 검증: Worker/Viewer TS 0 에러. Migration 로컬 + 프로덕션 양쪽 apply. `temp/like-smoke.cjs` Playwright — anon detail likeCount=0/viewerLiked=false / anon POST → 401 / authed POST → likeCount=1 viewerLiked=true / 멱등 (재 POST → 동일) / DELETE → likeCount=0 viewerLiked=false / UI 클릭 → is-liked + count++ / 재클릭 → is-liked 해제. 7 assertion 통과. 프로덕션 (Version 7ab69c56) — openhow.io 200, `/api/topics` 200, 익명 POST /like 401, 존재하지 않는 글 404.
- 다음 wedge 후보 (R 등): 좋아요 카운트를 인기 rail v2 정렬 신호로 (현재 viewCount only) / 큐레이터 promotion UI 에 좋아요 상위 글 자동 후보 표시 / 내가 좋아요한 글 모음 (`/me/likes`) / 좋아요 알림 (작성자에게) / 워크스페이스 endorsed 토픽 글 list 도 likeCount 노출 / 좋아요 카운트 drift reconcile cron.

### Wedge P — ?edit=1 자동 편집 모드 + composer draft → detail 직행 (5-11, done)
- 배경: Wedge N 회수 시그널이 "본인 프로필 '내 초안' 카드 클릭 시 글 상세로 가는데, 거기서 수정→게시까지 한 번 더 클릭 필요" 라고 명시. Wedge O 가 데이터 잃음을 막았다면 P 는 마찰을 줄임. 초안 = 이어쓰기 대기 상태 → 클릭 시 곧장 편집 모드가 의미적으로 맞다.
- Viewer — TopicPostDetail: `useSearchParams` 도입, mount 후 data + currentUser 로드되면 `?edit=1` & `currentUser.id === post.author.id` 일 때 자동으로 startEdit 본문 실행 (제목/본문 prefill + editing=true). `autoEditConsumedRef` 로 한 번만 실행 (재진입 방지). 소비 후 `setSearchParams({}, { replace: true })` 로 URL 에서 `edit` 제거 — 새로고침 시 다시 트리거 안 됨. (`packages/viewer/src/pages/TopicPostDetail.tsx`)
- Viewer — AuthorProfile "내 초안" 카드: `to` 에 `?edit=1` 추가. 본인 프로필 전용 섹션이므로 항상 owner 매칭 (isMe 가드는 섹션 자체에 이미 걸려 있음).
- Viewer — TopicBoard composer: "초안 저장" 성공 시 POST 응답의 `slug` 를 받아 `navigate('/t/:topic/:slug?edit=1')` 로 detail 페이지로 보냄. 보드 reload 스킵 (어차피 draft 는 public listing 에 안 보임). "등록" (published) 은 기존 동작 유지 — 발행 직후엔 보드에서 자기 글 확인이 자연스럽다.
- 결정: query param (`?edit=1`) vs path 분리 (`/t/.../edit`) — path 로 가면 detail 라우트를 새로 만들거나 nested route 깔아야 함. edit mode 는 일시적 + owner 전용 상태이지 별도 리소스가 아님 → query param 이 맞음. 동일 URL 을 다른 사람이 봐도 그냥 detail 보이는 게 깔끔.
- 결정: 자동 진입 후 URL 정리 (`replace: true`) — 사용자가 새로고침했을 때 무한히 edit mode 로 들어가지 않게 + 브라우저 뒤로가기 히스토리에 `?edit=1` 이 안 남게. `replace` 가 핵심 — `navigate` (push) 면 히스토리 중복.
- 결정: `useRef` 로 consumed 가드 — useEffect deps 에 `searchParams` 가 있어 setSearchParams 호출하면 effect 재실행. ref 로 "이미 처리함" 표시 안 하면 무한 루프 위험. ref 는 렌더 트리거 안 함 + mutable 이라 이런 일회성 가드에 적합.
- 결정: composer 초안저장 후 detail 직행 — Reddit "draft saved → continue editing" 패턴. 사용자가 "초안 저장" 클릭한 의도는 "잠시 저장하고 닫기" 도 있지만 "잠시 저장하고 계속 쓰기" 가 더 흔함. detail+edit 이 후자에 맞고, 사용자가 닫고 싶으면 "취소" 한 번이면 보드로 복귀.
- 검증: Viewer TS 0 에러. Playwright `temp/edit-mode-smoke.cjs` — composer 초안저장 → 자동으로 detail 이동 + ?edit=1 → 편집 폼 자동 표시 + URL 에서 edit 제거 + 제목/본문 일치 / 프로필 내 초안 카드 href 에 ?edit=1 + 클릭 시 편집 폼 자동 / `?edit=1` 없는 plain detail 은 read mode. 9 assertion 통과. autosave smoke 도 step 6 (보드 복귀) 만 조정 후 재통과. 프로덕션 (Version 1dfadf42) — openhow.io 200.
- 다음 wedge 후보 (Q 등): "내 초안" 빈 상태 친절한 안내 + 첫 글 쓰기 CTA / 큐레이터 draft 표시 (큐레이터 draft = 라인업 후보) / 모더레이션 흐름 (가입자 글 신고/숨김) / 가입자 글 RSS / 인기 rail v2 (de-dup, 기간 필터) / draft 자동 만료 (30일+ 미수정 draft 정리).

### Wedge O — 작성/편집 composer draft auto-save (localStorage) (5-11, done)
- 배경: Wedge N 이 "초안 저장" 버튼은 깔았지만 사용자가 클릭 안 하고 닫거나 새로고침하면 작성 내용이 그대로 증발. localStorage 로 자동 저장 + 복원 배너를 깔면 클릭 한 번을 빠뜨려도 회수 가능 — viewer-only, DB/API 변경 0건. Reddit "Draft saved" / Medium "Restore draft" 패턴.
- Viewer — `packages/viewer/src/hooks/useLocalDraft.ts` 신설: `{ key, enabled, debounceMs=800 }` 입력. `save(title, body)` 는 debounce 후 `{ title, body, savedAt }` JSON 으로 `localStorage.setItem(key, ...)`. title+body 둘 다 빈문자열이면 자동 `removeItem` (빈 입력 저장 안 함). `clear()` 는 즉시 remove + 대기 중인 timer 취소. `stored` 는 hook 마운트 시 한 번 읽고 state 로 노출 — 사용자가 폼 채워가는 동안 값이 매번 갱신되며 비교 시 form 과 다르면 "복원하기" 띄움. SSR/private mode 안전 가드 (`typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'`) + try/catch (quota error silent).
- Viewer — TopicBoard composer 연동: key = `topic-draft:${topicSlug}`. composer 열린 동안만 enabled. formTitle/formBody useEffect 로 saveDraft 호출. stored 가 form 과 다를 때만 황색 복원 배너 표시 — "이전에 쓰던 내용이 있어요." + 복원하기 (form 에 채움 + storage 는 유지) / 버리기 (storage 제거 + 배너 닫힘). 등록/초안 저장 성공 후 `clearDraft()` 호출. (`packages/viewer/src/pages/TopicBoard.tsx/.css`)
- Viewer — TopicPostDetail 편집 폼 연동: key = `topic-post-draft:${topicSlug}:${postSlug}` (글마다 분리 — 다른 글 편집 시 섞이지 않음). editing 모드 진입 시 hook enable, 종료 시 disable. 저장 성공 후 `clearEditDraft()`. (`packages/viewer/src/pages/TopicPostDetail.tsx/.css`)
- 결정: localStorage key 네임스페이스 — `topic-draft:${slug}` 와 `topic-post-draft:${topic}:${post}` 로 분리. 한 토픽에 글 여러 개 동시 편집해도 충돌 없음. 작성 composer 와 편집 폼은 의미가 달라 prefix 다르게 (`topic-draft` vs `topic-post-draft`) — 편집 폼이 새 글 키를 덮지 않게.
- 결정: 800ms debounce — 타이핑 한 글자마다 write 하면 IO 과다 + 텍스트 입력 중 빈 상태로 잠깐 저장될 위험. 800ms 는 대충 "한 문장 다 쓰고 멈춤" 정도. 너무 길면 (>1500ms) 새로고침 직후 잃을 위험 ↑.
- 결정: 복원 배너 vs 자동 prefill — 자동으로 폼에 채우면 사용자가 의도적으로 새로 쓰려던 입력을 덮어쓸 수 있음. 명시적 "복원하기" 클릭으로 의도 확인. "버리기" 도 함께 제공해서 이전 draft 가 영원히 따라다니지 않게.
- 결정: title+body 둘 다 빈문자열이면 자동 remove — 사용자가 입력 후 다 지우면 storage 도 비움. 다음 세션에 빈 draft 가 복원 배너로 보이지 않게.
- 검증: Viewer TS 0 에러. Playwright (`temp/autosave-smoke.cjs`) — dev login → 토픽 보드 composer 열고 제목/본문 입력 → 1.2s 대기 → localStorage 에 저장 확인 → reload (composer 닫힘) → composer 다시 열기 → 복원 배너 표시 → 복원하기 클릭 → 필드 값 일치 + 배너 사라짐 → 초안 저장 클릭 → localStorage null → 재타이핑 + 새로고침 → 버리기 클릭 → localStorage null. 6단계 모두 통과. 프로덕션 배포 (Version 37e02401) — openhow.io 200 OK.
- 다음 wedge 후보 (P 등): 큐레이터가 draft 작성 시 표시 (큐레이터 draft = 라인업 후보) / 토픽 admin 의 모더레이션 흐름 (가입자 글 신고/숨김) / 가입자 글 RSS / mirror copy semantics v2 (큐레이터 코멘트 첨부) / 라인업 ↔ 엔도스 rail "더 보기" 링크 / 인기 rail v2 (de-dup, 기간 필터) / "내 초안" 카드 클릭 시 자동 편집 모드 (`?edit=1`).

### Wedge N — 가입자 draft 흐름 (5-11, done)
- 사전: DEV_LOGIN_EMAIL 정상화 (6 wedge 연속 미룬 약속 청산) — `.dev.vars` 의 `DEV_LOGIN_EMAIL=seed@local.dev` (기존 typo `rupy1008@gamil.com` 제거), `SUPERADMIN_EMAILS` 에 `seed@local.dev` 추가. wrangler 는 `.dev.vars` 를 hot-reload 안 함 → dev 서버 재시작 필수 (`pkill -f "wrangler.*dev"` → `pnpm dev`). gitignored 라 commit 0 변경.
- Worker — topic_post status 분기: `POST /api/topics/:slug/posts` body 에 `status: 'draft' | 'published'` 옵셔널 (디폴트 published, 'draft' 만 override). `PUT /api/topics/:slug/posts/:postSlug` body 에 옵셔널 status — 있으면 draft↔published 전환, 없으면 status 보존. 응답 body 에 status 포함. `GET /api/topics/:slug/posts/:postSlug` 를 `authMiddleware` 로 감싸서 c.var.user 받고, `status='published'` WHERE 필터 제거 후 가드 3개: deleted → 404 / draft + 비소유자 → 404 / 본인 draft → 정상 응답 (viewCount bump 는 published 만). 토픽 보드 목록 (`GET /api/topics/:slug`) 은 기존 `status='published'` 필터 유지 — draft 가 public listing 절대 노출 X. (`packages/worker/src/routes/topics.ts`)
- Worker — `GET /api/authors/me/drafts` (`requireAuth`): 본인의 status='draft' 토픽 글 최근 20개, topic slug/title join. 응답 `{ drafts: [{ id, slug, title, createdAt, updatedAt, topicSlug, topicTitle }] }`. (`packages/worker/src/routes/authors.ts`)
- Viewer — TopicBoard 작성 composer: `handleSubmit(e, status='published')` 로 시그니처 변경. "초안 저장" (type='button', status='draft') + "등록" (type='submit', published) + "취소" 3버튼. (`packages/viewer/src/pages/TopicBoard.tsx/.css`)
- Viewer — TopicPostDetail 편집/조회: 편집 폼 `handleSave` 에 옵셔널 statusOverride. 현재 draft 면 "초안 저장" + "저장 및 게시", 현재 published 면 "초안으로 전환" + "저장" (status 미전송). 조회 모드 (본인 + draft) 일 때 헤더에 `초안` 황색 배지 + nav 에 "게시하기" primary 버튼 (`handlePublishDraft` — title/body 그대로 PUT status='published'). 조회 모드에서 조회수도 draft 일 땐 숨김. (`packages/viewer/src/pages/TopicPostDetail.tsx/.css`)
- Viewer — AuthorProfile 자기 프로필 "내 초안" 섹션: `isMe` 일 때만 `/authors/me/drafts` fetch, 헤더 바로 아래·공간/최근 발행/토픽 글 보다 위. 황색 톤 박스 (`#fffbeb` bg, `#fde68a` border) + count 배지 + 카드 클릭 시 글 상세로 이동 (편집 모드는 자동 진입 안 함 — 본인은 "수정" 버튼이 표시되므로 한 번 더 클릭). (`packages/viewer/src/pages/AuthorProfile.tsx/.css`)
- 결정: detail GET 에 `authMiddleware` 만 (requireAuth 아님) — published 글은 비로그인도 봐야 하므로 사용자 식별만 하고 차단은 안 함. 가드는 핸들러 안에서 분기 (`!currentUser || currentUser.id !== post.author.id` → 404). 401 대신 404 로 통일해 draft 존재 자체를 노출 안 함 (정보 누설 방지).
- 결정: 가입자 자기 프로필 "내 초안" 위치 — 처음엔 토픽 글 다음을 생각했지만, 본인 입장에선 가장 actionable (이어쓰기 대기 중) → 헤더 바로 아래 첫 섹션으로. 다른 사람 프로필엔 노출 X (`isMe` 가드).
- 결정: 황색 톤 — draft 는 "아직 완성 아님" 신호. accent purple (큐레이터) / blue (라인업 게재) 와 시각적 충돌 없어야 함. 황색 (`#fffbeb`/`#92400e`) 은 GitHub draft PR 컨벤션 + 한국 사용자에게도 "미완성/주의" 직관 매핑.
- 결정: PUT status 미전송 = 보존 — 기존 published 글 단순 수정 시 status 가 실수로 바뀌면 안 됨. null 가드 (`nextStatus ?? post.status`) 가 invariant. draft 글 수정 후 단순 "저장" 은 의도적으로 안 만듦 (저장 시 draft 유지 → "초안 저장" 버튼이 그 역할). 의미 분기를 버튼이 강제.
- 검증: Worker/Viewer TS 0 에러. Playwright 로컬 — dev login (seed@local.dev) → POST draft → me/drafts 1건 ↑ → 토픽 보드 public listing 0건 (draft 비노출 OK) → 소유자 detail 200/draft → 익명 detail 404 + me/drafts 401 (SECURITY OK) → PUT published 전환 200 → public listing 등장. UI: TopicBoard 의 "초안 저장" 버튼 클릭 → draft 생성, AuthorProfile `/s/seed_author` 의 "내 초안" 섹션 + 카드 2개 렌더 확인 (스크린샷 `temp/draft-smoke-profile2.png`). 프로덕션 배포 (Version ed3d6c2b) — `/api/topics` 200, `/api/topics/claude-code` 200, `/api/authors/me/drafts` 익명 401 모두 정상. 마이그레이션 0건 (Wedge B+E 에서 이미 `status` 컬럼 존재).
- 다음 wedge 후보 (O 등): draft auto-save (페이지 떠나면 잃음 방지 — localStorage 임시저장) / mirror copy semantics v2 (큐레이터 코멘트 첨부) / 라인업 ↔ 엔도스 rail "더 보기" 링크 / 가입자 글 RSS / 큐레이터가 draft 작성 시 어떻게 표시할지 (큐레이터 draft = 라인업 후보) / 인기 rail v2 (de-dup, 기간 필터) / 토픽 admin 의 모더레이션 흐름 (가입자 글 신고/숨김).

### Wedge M — 토픽 글 작성자 큐레이터/가입자 배지 (5-11, done)
- Worker: 토픽 글 응답 author 객체에 `isCurator` (또는 flat 응답엔 `authorIsCurator`) 추가 — SQL EXISTS subquery: `EXISTS(SELECT 1 FROM workspace AS w_ic WHERE w_ic.owner_id = user.id)`. 워크스페이스 한 개라도 소유하면 1, 아니면 0. (`packages/worker/src/routes/topics.ts` 두 엔드포인트 nested author 객체, `packages/worker/src/routes/workspaces.ts` endorsed-topic-posts + promotions flat, `packages/worker/src/routes/public-feed.ts` topicPostsFeed flat)
- Viewer: 5곳에 `큐레이터` pill 배지 — TopicBoard 글 카드 meta / TopicPostDetail 헤더 author 옆 / WorkspaceDocs promoted+endorsed rail 카드 meta (공통 `.wsd-curator-badge`) / PublicBlogHome 인기 토픽 글 rail / AuthorProfile 헤더 (workspaces.length>0 로 viewer-side 추론). 모두 같은 톤 — `var(--accent-soft)` 배경 + `var(--primary-color)` 텍스트의 라운드 pill. (`packages/viewer/src/pages/{TopicBoard,TopicPostDetail,PublicBlogHome,AuthorProfile}.tsx/.css`, `packages/viewer/src/pages/workspace/WorkspaceDocs.tsx/.css`)
- 결정: SQL EXISTS — JOIN 으로 계산하면 워크스페이스 N개 소유한 사용자가 N번 join 되며 결과 중복/카운트 오작동 위험. EXISTS 는 단일 boolean (0/1) 반환이라 안전, 인덱스 lookup 1회. Drizzle `sql<number>` 템플릿 + `${schema.user.id}` 보간으로 outer query 와 안전하게 link.
- 결정: viewer-side 추론 vs DB 필드 — TopicBoard/TopicPostDetail/PublicBlogHome/WorkspaceDocs 는 author 가 다양해 행마다 다르므로 DB 필드로 가져옴. AuthorProfile 은 페이지 1인이라 응답에 이미 있는 `workspaces` 배열의 length 로 viewer 가 추론 — Worker 트래픽 절약 + DRY. 두 패턴 혼용 적정.
- 결정: 큐레이션 라인업 rail (이미 purple 박스로 묶여 있음) 안에서도 author 별 큐레이터 배지 노출 — "라인업 = 큐레이터 추천 stamp" 와 "글쓴이 = 큐레이터" 는 다른 시그널. 라인업이 게재 시 시그널이라면 배지는 사람 시그널.
- 검증: Worker/Viewer TS 0 에러. Playwright 로컬 — 토픽 보드 3 카드 모두 큐레이터 배지 (seed_author 는 vibe-coding owner) / 글 상세 1 배지 / 워크스페이스 랜딩 4 배지 (promoted 1 + endorsed 3) / AuthorProfile 헤더 1 배지. 콘솔 0 에러. 프로덕션: 배포 완료, /api/topics + /api/topics/:slug + /api/public/feed 200 (프로덕션 토픽 글 없어 isCurator=1 어설션 못 함 — 로컬에서 검증 완료).
- 다음 wedge 후보 (N 등): mirror copy semantics v2 (큐레이터 코멘트 첨부) / 라인업 ↔ 엔도스 rail "더 보기" 링크 / draft 흐름 (status='draft' + 편집 흐름) / 인기 rail v2 (de-dup, 기간 필터) / DEV_LOGIN_EMAIL 정상화 (6th consecutive wedge — 진짜 다음 wedge 의 첫 task 로 격상) / 가입자 배지 ("가입자" pill, 큐레이터 아닌 author 표시) — 현재는 큐레이터 만 배지, 가입자는 무표시 (디폴트). 시각적 대칭 필요하면 추가.

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

### 2026-05-11: Wedge R 빌드 — 인기 rail v2 likeCount 가중 합산
- **Source**: 빌드 세션 (5-11, "추천대로 진행", Wedge Q 직후 사용자 결정 — 코드 측 자연 확장)
- **Signal**: Wedge Q 가 likeCount 컬럼/엔드포인트/UI 를 만들었지만 surface 에 합산 안 됨. 인기 rail (Wedge J) 은 여전히 viewCount-only 정렬. 좋아요는 view 보다 강한 신호 (accountable action) 인데 인기 surface 에 반영 안 되면 신호 만든 의미 ↓.
- **결정 / 학습**:
  - 가중치 5 ("1 like ≈ 5 views") — 좋아요는 클릭 + 로그인 신원 필요한 accountable action, view 는 passive (봇/실수 포함). SNS heuristic 의 보수적 중간. <3 이면 신호 묻힘, >10 이면 view 자체가 무력화. 5 가 두 시그널의 균형점. 트래픽 쌓이면 A/B 로 검증 가능.
  - SQL 산술 vs derived score 컬럼 — 컬럼 추가 안 함. score = derived value 이고 매번 like 시 score 도 갱신하면 동기화 부담. 인기 rail 은 limit 8 + index-friendly 작은 쿼리라 산술 비용 무시. 가중치 변경 시 한 줄만 고치면 됨 (튜닝 비용 낮음).
  - 인기 ≠ 정렬 토글 — TopicBoard 보드 내부는 발행 순서 유지. 보드는 "최신 위에서 아래로" 가 직관적이고, 인기 surface 는 home rail 의 역할. 두 곳에서 같은 정렬을 쓸 필요 없음.
  - 가중치 변경 backward-compat 고민 X — 정렬 기준일 뿐 응답 shape 안 바뀜. 클라이언트가 score 자체를 의존할 일 없음. UI 는 두 카운트만 노출.
- **다음 후보 (S)**: 큐레이터 promotion 후보 자동 정렬 (likeCount desc) — Wedge L 의 후보 리스트 surface 가 viewCount 만 보고 있음. Wedge R 의 자연 후속.

### 2026-05-11: Wedge Q 빌드 — 토픽 글 좋아요 v1
- **Source**: 빌드 세션 (5-11, "다음 진행해줘", v1 What 완료 후 v2 strategic 항목 선택)
- **Signal**: v1 What 모두 완료된 시점에서 다음 strategic 진전은 두 갈래 — (a) prod 의 가입자 유입/콘텐츠 생성 push (지금 0건), (b) v2 에서 가장 핵심인 좋아요/하이라이트. (a) 는 마케팅·외부 활동, (b) 는 코드. 코드 쪽에서 다음 자연스러운 게 좋아요 — 큐레이터 promotion (Wedge L) 과 직접 시너지 (자동 후보 신호), 인기 rail (Wedge J) 의 viewCount-only 한계 보완, 가입자 engagement 의 시작점.
- **결정 / 학습**:
  - 비정규화 카운트 — 좋아요는 listing 한 번 열 때마다 N 글 카운트 필요. JOIN+COUNT 는 N+1, 매번 도는 게 부담. 어플리케이션 +/- 1 + 멱등 가드 패턴이 SQL trigger 보다 단순 (디버깅/마이그레이션). drift 가능성은 race 가 거의 없는 도메인 (한 user-post 쌍) 이라 실용적으로 무시. 향후 cron reconcile 만 두면 충분.
  - 멱등 POST/DELETE — REST 정공법 + 클라이언트 retry 안전. existing row 체크 후 no-op. 두 번째 호출이 throw 하면 race 시 client retry 가 깨짐. "성공 = 원하는 최종 상태가 됨" 으로 의미 정의하면 멱등이 자연스러움. 같은 패턴이 React 19 concurrent rendering 에서도 안전 (effect 중복 실행 시 동일 결과).
  - viewerLiked 는 detail 만 — list 에 넣으려면 user_id 기준 join 추가 (N 행마다). 비용 vs 가치 비교: 리스트에서 "내가 좋아요한 글" 강조하는 UX 가 검증 안 됐고, detail 에서 본인 상태 보여주는 것만으로 토글 정확성 보장. 미래 필요 시 별 wedge.
  - 좋아요 0 표시 안 함 — social proof 의 메커니즘은 "다른 사람이 좋아함" 시그널. 0 은 오히려 negative signal (아무도 좋아요 안 함). 조회수 0 은 표시해도 OK 인 이유: SEO/관심도 기본 정보. 좋아요는 사회적 의미라 0 = 숨김.
  - optimistic update + rollback — 클릭 즉시 UI 반영 (네트워크 지연 안 느끼게) + 실패 시 이전 상태로 복원. setData 콜백 안에서 prev 기반 업데이트로 stale state race 도 방지. 같은 패턴이 모든 토글 액션 (북마크, follow, 구독) 에 재사용 가능. 다음 wedge 에서 같은 코드 모양이 보이면 hook (`useOptimisticToggle`) 으로 추출 고려.
  - 좋아요 UI 위치 — 본문 article 아래. Medium clap, Reddit upvote (post detail) 와 같은 패턴. 헤더 meta 에 넣으면 읽기 전 클릭 가능성 ↑ — "다 읽고 좋아한 글" 시그널의 가치를 약화시킴. 읽는 시간이 짧은 SNS 라면 헤더 가까이가 맞지만, openhow 는 긴 글 (큐레이션 + 토픽 노트) 컨텍스트라 본문 아래가 시그널 품질에 맞음.
- **회수 시그널**: 가입자가 좋아요 누르는지 (현재 prod 가입자 글 0 이라 자체로는 측정 불가 — 큐레이션 글에도 좋아요 깔지 결정 필요할 수 있음). 좋아요 → 큐레이터 promotion 결정 → 라인업 mirror 의 흐름이 실제로 도는지가 진짜 검증. 만약 큐레이터가 좋아요 신호 보지 않고 promotion 한다면 후속 wedge 에서 promotion UI 에 "이 글 좋아요 N" 노출 필요.

### 2026-05-11: Wedge P 빌드 — ?edit=1 자동 편집 모드 + composer → detail 직행
- **Source**: 빌드 세션 (5-11, "다음 진행해줘", Wedge N 회수 시그널 + Wedge O close note 가 후보로 명시)
- **Signal**: 초안 = 이어쓰기 대기 상태인데 카드 클릭 → 글 상세 → 수정 버튼 → 편집 폼 까지 3-step. "이어쓰기" 라는 사용자 멘탈 모델에 1-step 이 맞다. Reddit 의 "draft" 도 클릭 즉시 composer 로 들어감. Wedge N/O 가 draft 데이터 layer 를 깔았으니 P 는 UX layer.
- **결정 / 학습**:
  - query param vs path — edit mode 는 owner 전용 + 일시 상태이지 별도 리소스 아님. path 로 (`/t/.../edit`) 가면 라우트 + 비owner 접근 시 처리 까지 복잡해짐. query param 은 "같은 detail 의 한 가지 보기 모드" 라는 의미와도 잘 맞고, 비owner 가 URL 받아도 그냥 detail 보임 (소비 안 됨). UI 토글 상태를 URL 에 노출하되 영구화하지 않는 패턴엔 query param.
  - `?edit=1` 소비 후 URL 정리 (replace) — 이걸 안 하면 사용자가 새로고침할 때마다 editing 모드로 들어가고, 뒤로가기 히스토리에 `?edit=1` 이 잔류. `setSearchParams(next, { replace: true })` 가 핵심 — `replace` 안 주면 push 라 히스토리 중복. 일회성 trigger 패턴엔 replace 가 default.
  - `useRef` 로 consumed 가드 — effect deps 에 `searchParams` 가 들어가는데 effect 안에서 setSearchParams 호출하면 effect 재실행됨. ref 로 "이미 처리함" 표시 안 하면 무한 루프. state 보다 ref 인 이유: 렌더 트리거 불필요 + mutable. 일회성 side effect 가드에 ref 가 적합.
  - composer 초안저장 후 detail 직행 — 처음엔 "보드에 머무는 게 안전한가" 고민. 하지만 "초안 저장 = 잠시 멈춤" 의미가 강함 + Reddit/Notion 도 작성 직후 자기 글 화면으로 보냄. 사용자가 닫고 싶으면 "취소" 한 번. 발행 (published) 은 보드 reload — 자기 글이 즉시 listing 에 나타나는 확인 가치가 큼. draft 와 published 의 post-save UX 분기는 의미상 정당.
  - "ref + effect + replace" 패턴 — 일회성 query-param trigger 의 정석. 다음에 `?action=X` 류 만들 때 그대로 재사용 가능 (예: `?ref=email`, `?invite=X`).
- **회수 시그널**: 가입자가 실제로 "내 초안" 카드 클릭 후 편집 → 발행까지 한 흐름으로 갈지. 발행 비율이 안 오르면 편집 폼 자체의 마찰 (마크다운 어려움, 미리보기 깜빡임 등) 이 진짜 병목. composer 초안저장 후 detail+edit 으로 직행해서 사용자가 "어 보드 어디갔지" 하는 인지 부담은 없는지도 시그널 — 만약 그렇다면 "초안 저장됨, 계속 편집 중" 류 toast 가 다음 wedge.

### 2026-05-11: Wedge O 빌드 — composer draft auto-save (localStorage)
- **Source**: 빌드 세션 (5-11, "다음 진행해줘", Wedge N close note 가 후보로 명시)
- **Signal**: Wedge N 이 "초안 저장" 버튼만 만들고 끝 — 누르지 않고 떠나면 잃음. 이 갭은 코드 부족이 아니라 UX 가정 부족 (사용자가 항상 클릭한다는 가정). Reddit/Medium 도 같은 이유로 자동 저장을 깔았다. server-side draft auto-create 까지 갈 수도 있었지만 그 길은 row 폭증 + 정리 정책 필요 → localStorage 가 단순 + 즉시 가치 + 회수 95%.
- **결정 / 학습**:
  - localStorage 자동저장 vs 서버 자동 draft 생성 — 처음엔 서버 쪽으로 흐를 뻔. 가입자가 composer 열기만 해도 row 생성 / 매 키스트로크마다 PUT / 빈 draft 자동 정리 등 정책 폭증. localStorage 는 viewer-only, DB 변경 0, 사용자 디바이스 한정이라 동기화 문제 없음. 멀티 디바이스 draft 동기화가 필요한 시점이 오기 전엔 이게 정답. "서버로 가는 건 마지막 수단" 룰의 좋은 예.
  - debounce 800ms — 너무 짧으면 (200ms) 매 입력마다 IO + 빈 상태 잠깐 저장 위험. 너무 길면 (2000ms+) 새로고침 직전 잃을 확률 ↑. 800ms 는 평균 문장 멈춤 직관 + 한국어 IME 조합 끝나는 시점과도 잘 맞음. 다음에 텍스트 입력 debounce 짤 때 시작값으로 800.
  - 복원 배너 vs 자동 prefill — 자동 prefill 은 일견 친절하지만 "새로 쓰려고 composer 연 사용자" 가 이전 draft 에 덮인다. 명시적 "복원하기/버리기" 한 단계는 마찰 같지만 안전. UI 미니멀리즘이 항상 정답은 아님 — 의도 확인 단계가 데이터를 살린다.
  - 빈 입력 자동 remove — 사용자가 다 지우면 storage 도 비워야 다음 세션에 빈 복원 배너가 안 뜸. "현재 form == 비어있음" 도 의도 신호로 해석. 이게 빠지면 "복원하기 눌렀더니 빈 폼" 같은 어색한 경험 발생.
  - key 네임스페이스 분리 (`topic-draft:` vs `topic-post-draft:`) — 작성 composer 와 편집 폼이 같은 토픽에서 동시에 열릴 일은 적지만 의미가 다르므로 분리. 편집 폼은 글마다 (post slug 포함) 다르게 — 여러 글 편집 동시 진행해도 섞이지 않음. URL 패턴이 곧 key 네임스페이스라는 단순한 매핑.
  - SSR 가드 + try/catch — `window.localStorage` 가 SSR 에서 없거나 private mode 에서 throw. 두 케이스 다 silent 무시 (앱 깨지지 않게). 자동 저장은 best-effort 기능이지 필수 기능이 아님 — 실패해도 폼은 계속 동작.
- **회수 시그널**: 사용자가 새로고침 후 "복원하기" 를 실제로 누르는지 (배너만 띄우고 무시되면 의미 없음). 향후 telemetry 가 붙으면 "draft restore 클릭률" 이 1차 지표. 그 전엔 prod 에서 가입자가 첫 draft 작성 시 패턴 관찰. "복원하기" 클릭 후 발행 vs "버리기" 후 새로 작성 비율도 시그널 — 후자가 많으면 자동저장이 오히려 노이즈.

### 2026-05-11: Wedge N 빌드 — 가입자 draft 흐름 + DEV_LOGIN_EMAIL 정상화
- **Source**: 빌드 세션 (5-11, "다음 진행해줘")
- **Signal**: Wedge M close note 가 "DEV_LOGIN_EMAIL 정상화 (6th consecutive wedge — 진짜 다음 wedge 의 첫 task 로 격상)" + "draft 흐름" 을 동시에 다음 후보로 적었다. 작은 운영 빚 (DEV_LOGIN) 과 가시적 사용자 흐름 (draft) 을 한 wedge 에 묶음 — 운영 정비를 wedge 시작점에서 청산하지 않으면 또 미뤄질 위험 (5번 미뤘던 패턴 자체가 시그널).
- **결정 / 학습**:
  - wrangler `.dev.vars` hot-reload 안 됨 — 소스 파일 변경엔 즉시 reload 되지만 `.dev.vars` 는 프로세스 시작 시점에만 읽음. 변경 후 `pkill wrangler.*dev && pnpm dev` 가 필수. 디버깅 시 첫 신호는 "env 값이 옛날 그대로" → 코드는 맞고 reload 가 안 된 케이스. 다음에 env 관련 헛디딤 시 이걸 먼저 의심.
  - detail GET 의 401 vs 404 분기 — draft 를 보호할 때 비소유자에게 401 (인증 필요) 을 주면 "draft 가 존재한다" 를 누설. 404 로 통일해 존재 자체를 숨김. 보안 원칙: enumeration prevention. published 글은 비로그인 200, draft 는 비소유자 모두 404 — 두 자원이 같은 URL 패턴이지만 다른 응답 코드는 추론 가능한 누설.
  - `authMiddleware` vs `requireAuth` 의 의도 분리가 이번 wedge 에서 처음 양쪽 다 활용됨. authMiddleware = c.var.user 셋팅만 (없으면 null), requireAuth = 401 차단. detail GET 처럼 "공개 자원 + 소유자만 추가 권한" 같은 분기엔 authMiddleware 가 정답. me/drafts 같은 본인 전용엔 requireAuth. 두 미들웨어가 의도적으로 다르게 만들어진 이유가 이제 명확.
  - PUT 의 status 보존 invariant — `nextStatus ?? post.status`. body 에 status 안 보내면 기존 값 유지. 처음엔 "status 항상 명시" 강제할까 고민했지만, viewer 가 단순 수정 (제목/본문) 만 보낼 때 status 를 매번 같이 보내야 하는 건 boilerplate. 옵셔널 + 보존이 invariant 면 호출자가 의미 있을 때만 보낸다. 같은 패턴이 PATCH 와 비슷한 시멘틱.
  - "내 초안" 위치 — 본인 입장에선 actionable item (이어쓰기 대기) 이 가장 위에 있어야 함. 다른 사람이 볼 땐 가려야 하므로 `isMe` 가드 필수. 자기 자신 vs 타인의 같은 페이지에서 다른 UI 를 보여주는 패턴이 늘어남 (구독 버튼, drafts) — 이런 분기가 3개 넘어가면 page split 해야 할 수도 (현재 2개로 아직 OK).
  - 황색 톤 = draft 컨벤션 — accent purple (큐레이터), blue (라인업), red (위험/삭제) 가 이미 쓰임. 황색 (`#fffbeb` bg, `#92400e` text) 은 비어 있던 슬롯 + GitHub draft PR 과도 충돌 없음. 색을 추가하기 전에 기존 팔레트와 의미 매핑을 확인하는 습관.
  - DEV_LOGIN_EMAIL 청산 — 6개 wedge 연속 미루던 일을 진짜로 닫음. 청산 자체가 다음 wedge 작업 (`/dev/login` 으로 Playwright smoke 실행) 의 길을 텄음. 운영 정비는 다음 작업의 인프라가 되는 경우가 많음 — "그냥 빚 갚기" 가 아니라 enabler.
- **회수 시그널**: 가입자가 실제로 draft 를 쓰는지 (UI 클릭 흐름 vs API 직접). 본인 프로필 "내 초안" 카드 클릭 시 글 상세로 가는데, 거기서 수정→게시까지 한 번 더 클릭 필요 — 마찰 측정 후 자동 편집 모드 진입 (`?edit=1`) 옵션 검토. published 글이 0인 신규 사용자에게 "내 초안" 만 보이는 빈 프로필이 어떻게 느껴질지도 시그널.

### 2026-05-11: Wedge M 빌드 — 토픽 글 작성자 큐레이터/가입자 시각 배지
- **Source**: 빌드 세션 (5-11, "다음 진행해줘")
- **Signal**: What v1 에 적힌 "시각적 구분 — 큐레이션 라인업 (유료/공식 배지) vs 토픽 게시판 글 (가입자 배지)" 항목이 K/K2/L 모두 끝난 시점에 유일하게 남은 v1 unchecked. L 이 게재 시 (라인업/엔도스 rail) 시그널을 만들었으니, 사람 시그널 (큐레이터 vs 가입자) 이 자연스런 다음 layer. Medium+Reddit 하이브리드의 권위/평등 축 — 큐레이터 글이라는 표식이 가입자 글과 같은 보드에 섞여도 한눈에 구분되어야 한다.
- **결정 / 학습**:
  - SQL EXISTS vs JOIN — 처음엔 LEFT JOIN workspace + COUNT 패턴을 떠올렸지만 author 한 명이 워크스페이스 N 개를 소유하면 row 가 N 배되며 페이지네이션/정렬이 깨진다. `EXISTS(SELECT 1 FROM workspace AS w_ic WHERE w_ic.owner_id = user.id)` 가 boolean 0/1 단일 반환, outer query row 수에 영향 0. SQLite 에서 EXISTS 는 인덱스 lookup 만큼 빠름. 다음에 "행마다 다른 테이블 한 칼럼" 이 필요할 때 EXISTS 우선.
  - 같은 도메인 신호인데 nested author 와 flat authorFoo 가 응답마다 섞여 있음 (topics.ts 는 nested, workspaces.ts/public-feed.ts 는 flat) — 통일 안 하고 각자 패턴 유지. flat→nested 리팩터는 viewer 5곳 동시 변경이라 wedge 1 개 분량. 지금은 이름만 (`isCurator` nested, `authorIsCurator` flat) 다르게 두고 viewer 가 둘 다 읽음. 통일은 별 wedge 후보.
  - viewer-side 추론 vs DB 필드 혼용 — 행마다 author 가 바뀌는 곳 (TopicBoard 등) 은 DB 가 정답, 페이지 1인 (AuthorProfile) 은 이미 응답에 들어 있는 `workspaces` 배열 length 로 추론. 둘 다 같은 정의 (workspaces 1개 이상 owner) 라 일관됨. Worker 트래픽 절약 + DRY 이득. 작은 결정이지만 미러링 자제 — UI 가 이미 데이터를 들고 있으면 derive 한다.
  - 큐레이터 배지만 만들고 가입자 배지는 안 만듦 — "큐레이터" 가 marked, 가입자가 default. 가입자 배지를 의무화하면 게시판이 한국식 호칭 잔치가 되어 권위 위계가 오히려 강해지는 위험. 평등이 default, 큐레이터가 명시적 차별화. 시각 대칭 필요 시점 (예: 큐레이터/가입자 비율 불균형으로 보드 톤이 바뀜) 에 다시 본다.
  - 라인업 rail 안의 큐레이터 배지는 redundant 같지만 의도적으로 둠 — 라인업 = 게재 시 시그널 (큐레이터가 골랐다), 배지 = 사람 시그널 (글쓴이가 큐레이터다). 라인업에 큐레이터 글이 올라간 경우와 가입자 글이 올라간 경우 둘 다 가능하므로 두 신호 직교. K2 에서 결정한 "엔도스 vs 라인업 직교성" 의 연장.
- **회수 시그널**: 가입자 글 작성 흐름이 아직 없어 (현재 토픽 글 작성 자체가 일반 가입자 전용이지만 prod 에 가입자 토픽 글이 0). 즉 prod 에서 배지 차이가 실제로 보이려면 가입자 가입 + 글 작성 흐름이 흘러야 함. 다음 시그널 = "가입자 글 보드에 처음 올라오는 순간" — 그때 배지 톤/대비가 의도대로 차이를 만드는지 재확인.

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
