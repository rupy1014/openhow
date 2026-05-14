---
name: editor-approval-gate
description: 큐레이터 "이 글 메인 노출 요청" + 작성자 동의 게이트 — 가입자 글이 동의 없이 큐레이션에 mirror 되지 않게.
status: done
iteration: 1
domain: product
stage: build
created: 2026-05-13
updated: 2026-05-14
iter_log:
  - "iter1 Wedge A: schema status + POST self/cross + GET accepted-only"
  - "iter1 Wedge B: author response endpoints (GET/PATCH /me/promotions/incoming)"
  - "iter1 Wedge C: author inbox viewer page (/me/promotions/incoming)"
  - "iter1 Wedge D: author revoke (PATCH revoke + inbox accepted rail + 수락 취소 버튼)"
  - "iter1 Wedge E: curator dashboard visibility (admin endpoint + 4-state grouping)"
related:
  - cli-publish-md-sync-v1.md
  - study-community-board.md
  - openhow-positioning-clauders-seo.md
  - creator-platform-discovery.md
---

# editor-approval-gate

## Why

`cli-publish-md-sync-v1` 로 콘텐츠 펌프를 켰다. 다음 단계는 **노출 mechanic**.

5-07 lock + 5-13 정렬:
> "가입자 자산은 기본 private, 큐레이터(에디터) 가 '메인/추천 노출하고 싶음' 요청 → 사용자 동의 → 노출. 사용자가 직접 공유/유료화 안 한 글은 큐레이터가 추천 후보로 잡을 수 있음."

**현재 인프라의 공백**:
- `workspace_topic_post_promotion` 테이블 + `POST/DELETE /api/workspaces/:slug/promotions` 이미 빌드 (Wedge L). 하지만 **큐레이터(workspace owner) 가 단독으로 promote/un-promote** — 작성자 동의 단계 없음. 작성자가 자기 글이 다른 워크스페이스 라인업에 mirror 됐다는 사실을 모를 수 있음.
- Wedge D 로 신규 토픽 글이 기본 `draft` 가 되면서 작성자 명시 opt-in 흐름은 시작됐지만, **promotion(노출 mirror) 차원의 동의 게이트는 별개** — 작성자가 `published` 로 올린 글도 큐레이션 라인업 mirror 는 별도 동의가 필요.

**왜 이게 다음 wedge 인가**:
- 콘텐츠 펌프(1) → **노출 게이트(2)** → 옛 UI 닫기(3) → 외부 톤 정렬(4) 의 2번째.
- 큐레이터(태섭) 의 dogfooding 흐름 그대로 — 본인 글은 자기 워크스페이스에 mirror 자동, 남의 글은 동의 필요.
- 작성자 신뢰 — "내 글이 마음대로 메인에 떠 있을 수 있다" 는 불신을 차단. opt-in 강제.

## What

### (v1) — 동의 게이트 코어

- (v1) **promotion 상태 모델** — `workspace_topic_post_promotion` 에 `status` 컬럼 추가: `pending` / `accepted` / `declined` / `revoked`. 기존 promotion 1건은 owner 본인 글 가능성이 큼 → 마이그레이션 정책 결정 필요 (Open question).
- (v1) **큐레이터 요청 흐름** — `POST /api/workspaces/:slug/promotions` 가 `pending` 으로 생성 (작성자가 owner 본인이면 즉시 `accepted`). 응답 변경.
- (v1) **작성자 응답 endpoint** — `PATCH /api/me/promotions/incoming/:promotionId` body `{ action: 'accept' | 'decline' }`. 작성자만 호출 가능, 자기 글 promotion 만 응답.
- (v1) **작성자 inbox surface** — `/me/promotions/incoming` 페이지 또는 기존 `/me` 라우트에 inbox rail. pending 목록 + accept/decline 버튼.
- (v1) **큐레이션 노출 필터** — `GET /api/workspaces/:slug/promotions` 가 `status='accepted'` 만 반환. pending/declined/revoked 는 제외. (큐레이터 본인이 보는 dashboard 는 모든 상태 노출, public 응답은 accepted only.)
- (v1) **revoke 흐름** — 작성자가 이미 accepted 한 promotion 도 언제든 revoke 가능. 큐레이터 측 DELETE 는 큐레이터 의도 (un-promote, status `revoked` 와 구분 — 큐레이터가 라인업에서 뺀 것).

### (v2) — 알림 + 큐레이터 UX

- (v2) 이메일 알림 (작성자에게 pending 요청 도착 안내)
- (v2) 큐레이터 dashboard — pending/declined 카운트 + 사유 입력
- (v2) 작성자 거절 사유 frees 텍스트 (큐레이터에게 전달)
- (v2) cooldown — declined 후 N일간 동일 글 재요청 차단

## Not

- (X) 큐레이터 권한 시스템 변경 — workspace owner = 큐레이터 가정 그대로
- (X) 게시판(`topic_post`) 의 노출 정책 변경 — published 글은 `/t/:slug` 게시판에 항상 노출. promotion 은 **큐레이션 라인업** (워크스페이스 홈) 차원만.
- (X) draft 글의 promotion — published 글만 대상 (이미 코드에 있음)
- (X) 다중 큐레이터 동시 요청 처리 — 단일 워크스페이스 → 단일 글 1요청. 다른 워크스페이스의 동일 글 요청은 별 row.
- (X) AI 기반 추천 후보 자동 생성 — 큐레이터가 사람으로 고름
- (X) 작성자 의무 응답 SLA — 응답 안 해도 pending 영구 유지 (v2 에서 cooldown 검토)

## Context — 이미 빌드된 인프라

- `core/packages/worker/src/db/schema.ts:934` — `workspaceTopicPostPromotion` 테이블 (id, workspaceId, topicPostId, promotedAt). `status` 컬럼 추가 필요.
- `core/packages/worker/src/routes/workspaces.ts:1277-1382` — GET/POST/DELETE promotion endpoints. v1 변경 범위 핵심.
- `core/packages/cli/src/commands/publish-topic.ts` (Wedge D 까지 적용) — 신규 글이 `draft` 기본 → 작성자가 `accessLevel: public` 명시해야 게시판 노출. promotion 은 그 뒤 단계.
- `/me` 라우트 — 이미 viewer 에 가입자 surface 존재. inbox rail 추가 위치 후보.

→ v1 변경 범위: schema 1컬럼 + endpoint 2개 변경 + 신규 endpoint 1개 + 작성자 inbox UI 1개. **신규 테이블 0, viewer 신규 페이지 0~1, DB 마이그레이션 1**.

## Build Progress (iter 1)

- **Wedge A done (2026-05-13)**: `workspace_topic_post_promotion.status` 컬럼 추가 (default `'pending'`). 백필 SQL (production DB 의 기존 promotion row 는 0건이라 no-op). `POST /api/workspaces/:slug/promotions` 가 작성자 == workspace owner 면 즉시 `'accepted'`, 아니면 `'pending'` 으로 insert + 응답에 `status` 포함. `GET /api/workspaces/:slug/promotions` 가 public 응답에서 `status='accepted'` only.
- Build: `pnpm --filter @openhow/worker build` 0 errors. Migration `0071_add_promotion_status.sql` 적용 완료.
- Deploy: `wrangler deploy` Version `0f74e894-2aec-46aa-9cc5-3bdcbcfd910d`. viewer/dist 동봉.
- Live verification (production): ehowlsla → `clauders-ai` workspace 에서 본인 토픽 글 (`wedge-d-default-draft`) self-promote → 응답 `status: 'accepted'`, `GET /api/workspaces/clauders-ai/promotions` 카드 1건 등장. DB 행 status 컬럼 `'accepted'` 직접 확인.
- Cross-author end-to-end 는 Wedge B (작성자 응답 endpoint) 검증 시 자연 검증 (현재 production 에 ehowlsla 가 아닌 user 의 published topic 글 0건).
- **Wedge B done (2026-05-13)**: 작성자 응답 endpoint 2개 추가.
  - `GET /api/authors/me/promotions/incoming` — 작성자 자기 pending 목록 (workspace+topic+post join, `workspace.name` 으로 표시 라벨, limit 50, promotedAt desc).
  - `PATCH /api/authors/me/promotions/incoming/:id` — body `{ action: 'accept'|'decline' }`. 작성자 검증 (`topicPost.authorUserId === c.var.user.id`), pending 상태 가드 (else 409), accept→accepted / decline→declined.
  - HTTP codes: 200 ok, 400 invalid action, 403 non-author, 404 missing, 409 not-pending.
- Build: `pnpm --filter @openhow/worker build` 0 errors. Migration 없음 (Wedge A 스키마 그대로 사용).
- Deploy: `wrangler deploy` Version `d2d4118b-3d85-409a-996a-6d1d7d12a70e`. viewer/dist 동봉.
- Live verification (production cross-author): 픽스처 pending row 직접 insert (workspace=zeroggul/owner=rupy1014, post=wedge-d-default-draft/author=ehowlsla). ehowlsla 토큰으로 `GET /me/promotions/incoming` → 픽스처 1건 노출 (workspaceName=`톡대리 지식 위키`). PATCH accept → `{ status: 'accepted' }`. public `GET /api/workspaces/zeroggul/promotions` → 카드 등장. 재-accept → 409. bogus action → 400. nonexistent id → 404. 픽스처 cleanup 완료.

## Footprint

- `core/packages/worker/src/db/schema.ts`: `workspaceTopicPostPromotion` 에 `status` text 컬럼 (default `'pending'`).
- `core/packages/worker/migrations/0071_add_promotion_status.sql`: ALTER ADD COLUMN + 기존 row 모두 `'accepted'` 백필.
- `core/packages/worker/src/routes/workspaces.ts`: POST 는 self/cross 분기 + 응답에 status 포함, GET 은 `accepted` 필터 추가. DELETE 무변경.
- `core/packages/worker/src/routes/authors.ts`: `GET /me/promotions/incoming` + `PATCH /me/promotions/incoming/:id` (작성자 pending inbox + accept/decline).
- `core/packages/viewer/src/pages/MyPromotionsIncoming.tsx` + `.css`: 작성자 inbox 페이지 — 인증 게이트, pending 카드 그리드, 수락/거절 버튼, 응답 성공 시 row 제거, 에러 alert.
- `core/packages/viewer/src/router.tsx`: lazy import + `me/promotions/incoming` 라우트.
- `core/packages/worker/src/routes/authors.ts` (Wedge D 확장): GET inArray(pending|accepted) + PATCH action 'revoke' 추가 (accepted→revoked).
- `core/packages/viewer/src/pages/MyPromotionsIncoming.tsx` (Wedge D 확장): pending/accepted status 뱃지, status 별 액션 버튼 분기 (pending = 수락/거절, accepted = 수락 취소).
- `core/packages/viewer/src/pages/MyPromotionsIncoming.css` (Wedge D 확장): `.my-promotions-status*` + `.my-promotions-btn--revoke`.
- `core/packages/worker/src/routes/workspaces.ts` (Wedge E): owner-only `GET /:slug/promotions/admin` — 모든 status 반환 + `promotionStatus` 컬럼 + limit 100. 공용 `GET /:slug/promotions` 무변경 (accepted only).
- `core/packages/viewer/src/pages/admin/WorkspacePromotions.tsx` (Wedge E): admin endpoint 으로 전환, 4 status 섹션 (라인업/대기/거절/취소) + 카드별 status 뱃지, "라인업에서 내리기" 는 accepted 만.
- `core/packages/viewer/src/pages/admin/WorkspacePromotions.css` (Wedge E): `.workspace-promotions-status*` 4가지 + `.workspace-promotions-item-meta-row`.

## Recommendation — 첫 wedge 후보

**Wedge A 후보 (스키마 + 큐레이터 요청 흐름)**:
- `workspace_topic_post_promotion.status` 컬럼 추가 (default `'pending'`, 기존 row 는 `'accepted'` 백필 — owner 본인 글 가정).
- `POST /api/workspaces/:slug/promotions` 가 `status='pending'` 으로 생성. 단, **작성자 ID == 큐레이터 ID** 면 즉시 `'accepted'` (자기 글 큐레이션 셀프 mirror).
- `GET /api/workspaces/:slug/promotions` 가 public 응답에선 `status='accepted'` only.
- 검증: 큐레이터 본인 글 promote → 즉시 accepted, 라인업 등장. 남의 글 promote → pending, 라인업 미등장.

**Wedge B 후보 (작성자 응답 endpoint)**:
- `GET /api/me/promotions/incoming` (작성자 자기 pending 목록)
- `PATCH /api/me/promotions/incoming/:id` body `{ action: 'accept'|'decline' }`
- 검증: curl 로 pending → accept → 라인업 등장. decline → 라인업 미등장.

**Wedge C 후보 (작성자 inbox UI)**:
- `/me/promotions/incoming` 페이지 또는 `/me` rail. pending 목록 + accept/decline 토글.

**Wedge D 후보 (revoke + 큐레이터 dashboard 가시성)**:
- 작성자 revoke (accepted → revoked).
- 큐레이터 promotions 관리 화면에 pending/declined 상태 가시화.

## Follow-up Intents (5-13 lock 유지)

1. cli-publish-md-sync-v1 — **done (Wedge A~D)**
2. **editor-approval-gate** ← 현재 의도
3. composer-deprecation — UI 글쓰기 폼 비활성화 (Wedge A~B 완료 + 동의 게이트 검증 후)
4. surface-tone-pass — 콘텐츠 + 큐레이션 채워진 상태에서 surface 톤 정렬

## Decisions (5-13 lock)

1. **Opt-in 흐름**: 큐레이터 promote → `status='pending'` → 작성자 accept → `status='accepted'` → 라인업 노출. 작성자가 owner 본인이면 즉시 `accepted` (셀프 mirror).
2. **영구 거절**: 작성자 decline → `status='declined'`. 같은 워크스페이스가 동일 글 재요청 불가 (DB unique constraint + 409 응답). 재시도 필요 시 작성자가 인바운드에서 declined 상태 row 를 삭제해야 함 (별 endpoint, v1.1 후보).
3. **기존 promotion row 백필**: 모두 `status='accepted'` 로 일괄. dogfood 단계 가정 — owner 본인 글 셀프 mirror 만 존재. 신규 요청부터 동의 게이트 적용.

## Open Questions — v1 진행 중 결정 (build 진입 전 합의 필요)

4. **알림 채널** — v1 은 DB only 가정 (작성자 inbox 들어가야 봄). 이메일은 v2. (build 시작 시 재확인)
5. **inbox 위치** — `/me/promotions/incoming` 별 라우트 vs `/me` 메인 rail. Wedge C UI 진입 시 결정.

## Learnings

### 2026-05-13: seed → clarified — editor-approval-gate

- **Source**: cli-publish-md-sync-v1 의 Follow-up Intents 에서 다음 의도로 약속됨. Wedge D done 후 사용자 "editor-approval-gate 가자" 호출.
- **Why 비교 (auto-routing)**: `auth-gate-ux` (로그인 잔상 — 무관), `ai-actuals-editorial` (편집 규격 — 무관), `_killed/editorial-traffic-engine` (전체 트래픽 엔진 — 더 큰 의도, 이 의도는 그 안의 동의 mechanic 하나). → 새 의도 정당.
- **인프라 발견**: `workspace_topic_post_promotion` 이미 빌드되어 있고 큐레이터 단독 promote 동작. 동의 게이트만 추가하면 됨 — 신규 테이블 0, 신규 endpoint 1~2.
- **3가지 핵심 결정 lock (5-13 사용자 합의)**: opt-in 흐름 / 영구 거절 / 기존 row 모두 accepted 백필. seed → clarified 점프 (3개 핵심 결정 한 번에).
- **Wedge A 진입 가능**: schema 컬럼 추가 + 백필 + POST/GET 동작 변경. 검증 path 명확.

### 2026-05-13: Wedge A done — opt-in 게이트 서버 코어

- **What shipped**: schema status 컬럼 + 0071 migration + POST self/cross 분기 + GET accepted-only 필터. 워커 배포 (Version `0f74e894-...`).
- **Verification**: self-promote 라이브 통과. DB row 의 status 컬럼 `'accepted'` 직접 확인. cross-author 시나리오는 production 데이터셋에 다른 user 의 published topic 글이 0건이라 end-to-end 미검증 — Wedge B 에서 자연 검증.
- **Surprises**: production promotion table 이 비어 있어 백필이 no-op 이었다. dogfood 단계 데이터셋이라 이해됨.
- **Wedge B 진입 시점**: `GET /api/me/promotions/incoming` (작성자 자기 pending 목록) + `PATCH /api/me/promotions/incoming/:id` `{ action: 'accept' | 'decline' }`. 작성자만 호출 가능. 검증 path: 두 번째 계정 (rupy1014) 생성 + ehowlsla 글 promote → pending → rupy1014 가 accept → listing 등장.

### 2026-05-14: Wedge D done — 작성자 revoke

- **What shipped**: worker `GET /me/promotions/incoming` 가 inArray 로 `pending` + `accepted` 둘 다 반환 + `PATCH` 가 `action: 'accept'|'decline'|'revoke'` 지원. revoke 는 `status='accepted'` 일 때만 허용 (else 409). viewer 가 카드별 status 뱃지 표시 + pending 에는 수락/거절, accepted 에는 "수락 취소" 버튼 렌더. CSS 에 status 뱃지 + revoke 버튼 (적색 outline + 호버 시 옅은 적색 bg) 추가.
- **Deploy**: Worker `a7ba59dd-4cc7-4773-b000-cf2404f84820` (viewer/dist 동봉).
- **Live verification (production, cross-author)**: Wedge C 픽스처 그대로 사용. `pending → accept` (200, status=accepted) → 공용 listing 등장 → `accepted → revoke` (200, status=revoked) → inbox 응답에서 사라짐 + 공용 listing 0개. 재-revoke (409 'in status revoked'), revoked 상태에서 accept (409), bogus action (400). 모든 통과.
- **상태 모델 final lock**:
  - `pending → accept → accepted | decline → declined`
  - `accepted → revoke → revoked`
  - declined / revoked 모두 영구. unique constraint `(workspaceId, topicPostId)` 가 재요청 자연 차단 (영구 거절 정책, decision #2).
- **Surprises**:
  - 의도의 v1 What 항목 중 #5 의 sub-item "큐레이터 본인이 보는 dashboard 는 모든 상태 노출" 만 미완 — 별도 Wedge E (큐레이터 dashboard 가시성) 후보. 그 외 6개 항목 다 closed.
  - cowork-run.sh task delegation 이 한번에 worker + viewer 양쪽을 깔끔하게 처리. Wedge B 의 인프라가 잘 깔려 있어서 확장이 minimal diff (worker 76 lines net).
- **Next: Wedge E** — 큐레이터 dashboard 가시성. `WorkspacePromotions.tsx` 에 pending/declined/revoked 카운트 + status 배지. server 측에 owner-only `?include=all` 또는 별 endpoint. 의도 status 는 Wedge E 후에 done 으로 옮긴다.

### 2026-05-14: Wedge E done — 큐레이터 dashboard 가시성 (의도 v1 done)

- **What shipped**: worker `GET /api/workspaces/:slug/promotions/admin` 신규 (owner-only, requireAuth, 404→403→200 가드, limit 100, 모든 status + `promotionStatus` 반환). viewer `WorkspacePromotions.tsx` 가 admin endpoint 으로 전환 + 4 섹션 (라인업/대기/거절/취소) + 각 카드 status 뱃지 + "라인업에서 내리기" 는 accepted 만. CSS 4가지 status 뱃지 (pending=중립, accepted=primary-tinted, declined=무거운 회색, revoked=옅은 적색) + meta-row.
- **Deploy**: Worker `486a7b5f-25b0-402d-a8ef-223648031fa2` (viewer/dist 동봉).
- **Live verification (production)**: clauders-book 워크스페이스 + 픽스처 4건 (cross-author 우하하/`OHhQGW...` → 같은 워크스페이스의 pending/accepted/declined/revoked 각 1건). admin endpoint 4건 모두 정확한 status + 시간 역순 정렬. 공용 endpoint 는 accepted 1건만 — 분리 동작 확인. 4가지 HTTP 코드: 200 (owner) / 401 (anonymous) / 403 (non-owner, zeroggul 검증) / 404 (unknown slug). 픽스처 cleanup 완료.
- **의도 v1 완료 조건 모두 충족**: opt-in 게이트 코어 (Wedge A) + 작성자 응답 + UI (Wedge B/C) + revoke (Wedge D) + 큐레이터 가시성 (Wedge E). What v1 6개 항목 + sub-item 모두 closed.
- **Surprises**:
  - Codex 한 번에 worker + viewer + CSS 동시 처리 (Wedge D 와 동일 패턴) — 의도 + 인프라가 잘 깔려 있어서 minimal diff (worker +50, viewer +139, css +41).
  - Better Auth session 이 D1 에 별 테이블 없음 — KV (secondaryStorage) 에만 보관. live verification 은 `~/.openhow/auth.json` 의 액세스 토큰으로 Bearer 인증 진행 가능.
- **Follow-up**: v2 가 알림 + 큐레이터 UX. v1 의 운영 mechanic (pending 취소/declined 재요청/dead row 정리) 는 v2 또는 별 의도. composer-deprecation 이 Follow-up 3 — 다음 의도 후보.

### 2026-05-14: Wedge C done — 작성자 inbox UI

- **What shipped**: `/me/promotions/incoming` 라우트 + `MyPromotionsIncoming` 페이지 (171 lines tsx + 134 lines css). MyLikes 패턴 재사용, 별도 prefix `.my-promotions-*`. 작동: 인증 안 됨 → 로그인 CTA / 인증 + pending 0 → 빈 상태 / 인증 + pending 1+ → 카드 그리드 (topic tag, workspace name strong, post title link, 요청 날짜, 수락/거절 버튼). PATCH 성공 시 optimistic row 제거. 실패 시 alert role 에러.
- **Verification**: viewer 빌드 0 errors. `wrangler deploy` Version `0e781dfb-e335-4da9-a934-ab3897ea0d9f`. dist 청크 `MyPromotionsIncoming-D1SGCn9i.js` + css 분리 청크 확인. Playwright (anonymous) 스크린샷 → 로그인 empty state 헤더 + CTA + 레이아웃 정상. API 라이브 픽스처 (cross-author pending row) 통과 — endpoint 가 다국어 워크스페이스 이름 / 한국어 토픽 타이틀 정상 반환.
- **Decision lock — 라우트 위치**: 별 라우트 `/me/promotions/incoming` (Open Q5 결정). `/me` 메인 페이지는 router 에 없고 `/me/likes` 와 동일 prefix 가 일관됨. `/me` rail 통합/뱃지/네비 surface 는 별 wedge 후보.
- **Live click-through 미실시**: Playwright 의 anonymous 세션은 가능하지만 인증 세션 쿠키는 사용자 브라우저 바인딩. 사용자 manual click 테스트 위해 픽스처 `9c0433e9-6dc7-4bda-8079-099baba70d9c` (cross-author pending) production DB 에 잔류 — 사용자 테스트 후 cleanup 필요.
- **Surprises**:
  - 초기 INSERT 시 `date +%s)000` 으로 ms 를 넣었는데 drizzle `timestamp` mode 가 seconds 기대 → year 58335 노출. 재insert 로 수정. 이후 픽스처 작성 시 seconds 만 쓸 것.
  - viewer build 가 `dist/assets/MyPromotionsIncoming-*` 청크와 CSS 청크를 따로 떼서 만든다 — Vite lazy chunk 정책 그대로.
- **Next: Wedge D** — 작성자 revoke (accepted → revoked) + 큐레이터 dashboard 상태 가시화 (pending/declined 카운트). 이미 worker 측 인프라 (status enum) 는 준비됨.

### 2026-05-13: Wedge B done — 작성자 응답 endpoint

- **What shipped**: `GET /api/authors/me/promotions/incoming` (pending only, workspace+topic+post join) + `PATCH /api/authors/me/promotions/incoming/:id` (accept/decline + 작성자 authz + pending precondition). 워커 배포 (Version `d2d4118b-3d85-409a-996a-6d1d7d12a70e`).
- **Final route shape**: `/api/authors/me/promotions/incoming` (의도 What 에 적었던 `/api/me/promotions/incoming` 가 아니라 `/api/authors/...` 마운트 — 기존 `/me/drafts`, `/me/likes` 와 동일 prefix). Wedge C UI 작업 시 이 경로로 호출.
- **Live verification (cross-author)**: production 에 ehowlsla 의 published topic 글 (`wedge-d-default-draft`) 을 zeroggul (rupy1014 owner) 가 promote 한 pending 픽스처 직접 insert → ehowlsla 의 incoming inbox 에서 노출 → PATCH accept → public listing 노출. 4가지 HTTP 코드 (200/400/404/409) 모두 통과. 픽스처 정리 완료.
- **Surprises**:
  - `cowork-run.sh task` 의 정확한 인자 형식은 `cowork-run.sh task <prompt-file>` 위치 인자 (예전에 `--prompt-file` 플래그로 호출하다 실패). prompt 파일은 반드시 .omj/.runtime/prompts/ 에 사전 작성.
  - 공용 `/api/workspaces/:slug/promotions` 응답의 `authorName` 필드가 실제 post 작성자 ID (`ehowlsla`) 가 아니라 다른 표시 라벨 (workspace owner 처럼 보임) — Wedge B 범위 밖 기존 동작. 별 의도 (`author-display-attribution`) 후보로 surface 검증 시 재확인.
- **Next: Wedge C** — 작성자 inbox UI. `/me/promotions/incoming` 별 라우트 vs `/me` 메인 rail 결정 (Open question 5). pending 카드 + accept/decline 버튼 + 빈 상태 텍스트.
