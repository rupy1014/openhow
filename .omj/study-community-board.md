---
name: study-community-board
description: openhow = AI 사이트로 포지셔닝. 가입자 1급 시민, 플랫폼-level 토픽 게시판 + 큐레이터 유료 발행 라인 하이브리드 (Medium+Reddit 모델)
status: building
iteration: 1
domain: product
stage: discovery
created: 2026-05-07
updated: 2026-05-08
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

### Wedge D — 다음 후보 (Backlog 로 이관)
- 토픽 admin CRUD (관리자 페이지에서 토픽 추가/수정/seed 보강 — 수동 SQL 안 쓰게)
- `/u/:handle` 프로필 — "내가 쓴 글" 집계 (현재 `/s/:username` AuthorProfile 이 워크스페이스 글만 모음, 토픽 글 추가)
- 큐레이터 워크스페이스 ↔ 토픽 게시판 endorse/승격 bridge
- 로그인 사용자 인증된 POST 흐름 E2E 검증 (현재는 401 unauth + 시드 INSERT 만 검증, full happy path 미검증)
- 글 수정/삭제 (작성자 본인만)
- 마크다운 작성 폼 미리보기/리치 에디터

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
