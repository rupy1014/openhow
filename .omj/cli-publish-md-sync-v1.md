---
name: cli-publish-md-sync-v1
description: 외부 MD를 CLI sync로 토픽 게시판에 publish — openhow = publishing/discovery layer, 작성 UI 아닌 발견 layer (5-13 lock).
status: building
iteration: 1
domain: product
stage: planning
created: 2026-05-13
updated: 2026-05-13
related:
  - openhow-positioning-clauders-seo.md
  - study-community-board.md
  - creator-platform-discovery.md
---

# cli-publish-md-sync-v1

## Why

5-13 잠금 (옵시디언 차별 정리 + 정체성 한 칸 더 좁힘):

**openhow = MD 자산 publishing/discovery layer**. 작성 도구 아님. 사용자는 옵시디언/VS Code/Claude Code/Notion 등 외부 도구로 .md 작성, openhow 는 그걸 web 으로 publish + 토픽 게시판에 자동 라우팅 + 큐레이터 추천 layer 입힘.

**옵시디언과의 차별 3축**:
1. **AI 도메인 lock** — 범용 vault 가 아닌 AI 주제별 게시판 1급 entity (`/t/claude-code`, `/t/cursor`, `/t/mcp`)
2. **큐레이션 레이어** — 에디터(큐레이터) 가 메인 노출 요청 + 작성자 동의 게이트 (별 의도 `editor-approval-gate`)
3. **Discovery + SEO + 토픽 응집력** — Reddit subreddit 결, 같은 관심사 사람들이 모이는 곳

5-07 잠금 (study-community-board.md, 토픽 게시판 1급 entity + 가입자 1급 시민) 은 그대로 유지. **글의 출처 mechanic 만 진화** — UI composer → 외부 MD sync. Pivot 아니고 refinement.

**왜 콘텐츠 펌프가 첫 순서**: 토픽 게시판이 비어 있는 채로 디자인/노출 흐름 다듬어도 검증 못 함. 큐레이터(태섭) 본인이 책 챕터/노트를 sync 로 채우는 게 가장 빠른 cold start. 콘텐츠 들어와야 디자인 약점이 진짜로 보임 (`surface-tone-pass` 의도가 이 뒤에 오는 이유).

## What

### (v1) CLI publish 흐름 — `openhow publish` v2

- (v1) `openhow publish <file.md>` — **frontmatter 자동 라우팅** (5-13 결정): `topic: <slug>` 있으면 토픽 publish, `workspace: <slug>` 있으면 큐레이션 publish, 둘 다 있으면 명시 에러. 같은 명령에 분기 흡수 — 사용자 마찰 0, 명시성은 `--dry-run` preview 가 보완.
- (v1) frontmatter 컨벤션: `topic` (required for topic publish), `accessLevel` (default `private`), `title`, `slug` (optional, 미지정 시 파일명 → kebab), `tags`
- (v1) Dry-run preview (`--dry-run`) — 어떤 토픽에, 어떤 제목/slug 로, public/private 으로 publish 될지 표시. 실제 호출은 안 함.
- (v1) 토픽 미존재 시 안내 — `GET /api/topics` 결과로 사용 가능 토픽 리스트 표시 + 신규 토픽은 superadmin 요청 안내.
- (v1) 인증: 기존 API key 또는 better-auth session 재사용 (`cli/src/auth/` 인프라). publish flow 와 동일 토대.
- (v1) Update 흐름 — 같은 source `.md` 재 publish 시 기존 글 update (slug 기준 동일 글 식별). 새 글로 안 만듦.
- (v1) 큐레이터 본인이 first dogfooding — 책/노트 5~10 건 publish 해서 cold start (검증 + 시드).

### (v2) 후속 — 별 의도로 분리

- (v2) Notion sync — 기존 `notion-sync.ts` 인프라 위 토픽 publishing 흐름 확장
- (v2) GitHub repo sync — repo watch + push 시 자동 publish
- (v2) Web 기반 paste fallback — 비기술자용 최소 paste 폼 (composer 와 다름, 발행 전용 — composer 부활 아님)
- (v2) frontmatter `topic` 미지정 시 AI 추론 (제목/본문에서 후보 토픽 제안)

## Not

- (X) UI 글쓰기 composer 강화 — 별 의도 `composer-deprecation` 에서 비활성화 + `// @deprecated`
- (X) draft/in-progress 흐름 변경 — v1 은 `published` 또는 `private` 상태로 publish (draft 흐름은 Wedge N 가입자 흐름 그대로 두되 publish CLI 와 분리)
- (X) 자동 토픽 분류 (v1) — frontmatter `topic` 명시 필수
- (X) 다중 워크스페이스 publish (v1) — 단일 publisher 가정
- (X) 메인 노출 자동화 — 큐레이터 동의 게이트는 별 의도 `editor-approval-gate`
- (X) markdown 변환/렌더링 변경 — 기존 `cachedRenderMarkdown` 그대로 사용
- (X) ingest.ts / notion-sync.ts 의 큐레이션 글 sync 동작 변경 — 토픽 publish 와 독립

## Context — 이미 빌드된 인프라

- `core/packages/cli/src/cli.ts`: `publish` 명령 이미 존재 (commander 기반). `publish/` 디렉토리에 구현. 현재는 큐레이션 워크스페이스 글 publish 용일 가능성 — 토픽 publish 와의 분기 결정 필요 (1) sub-command `openhow publish topic <file>` (2) frontmatter `topic` 있으면 자동 토픽 라우팅. (2) 가 사용자 마찰 작음.
- `core/packages/worker/src/routes/topics.ts`: `POST /api/topics/:slug/posts` 가 글 생성 흐름 (현재 viewer composer 가 호출). CLI 도 같은 endpoint 재사용 → 신규 endpoint 0.
- `core/packages/worker/src/routes/ingest.ts`: 외부 sync 받는 엔드포인트 존재 — Notion sync 등 v2 의 base.
- `topic_post` 테이블: `bodyMd`, `status`, `viewCount`, `likeCount` 등 inline 본문. 외부 sync 글도 같은 테이블. 신규 컬럼 0 (단, source path tracking 위해 v1.1 에서 `source_path` 추가 검토 가능).
- `core/packages/cli/src/auth/`: token-storage, client. 인증 재사용.

→ v1 의 변경 범위: CLI 명령 분기 + frontmatter parsing + 기존 POST endpoint 호출 + dry-run. **DB 변경 0, 신규 endpoint 0, viewer 변경 0**. 매우 작은 wedge 로 시작 가능.

## Build Progress (iter 1)

- **Wedge A done (2026-05-13)**: `openhow publish <file.md>` 가 frontmatter `topic:` 있으면 토픽 게시판 publish 로 라우팅. `--dry-run` preview 포함. 기존 워크스페이스 flow 무변경.
- 검증: `temp/topic-test.md` (`topic: claude-code`) → live publish 성공. `https://openhow.io/t/claude-code/wedge-a-cli-publish-623128ba`. `GET /api/topics/claude-code` 응답에 카드 포함 확인.
- Build: `pnpm --filter @openhow/cli build` 0 errors.
- **Wedge B done (2026-05-13)**: 같은 `.md` publish 시 `frontmatter.slug` 또는 파일명 kebab slug 로 기존 토픽 글을 probe 해서 update, 없으면 explicit slug 로 create. 서버 `POST /api/topics/:slug/posts` 는 optional client slug 를 받되 slug 생략 시 기존 random suffix 유지.
- 검증: `resolvePostSlug('temp/topic-test.md', {})` → `topic-test`, `resolvePostSlug('anything.md', { slug: 'foo-bar' })` → `foo-bar`.
- Live verification (production, 2026-05-13): `temp/topic-test.md` 에 `slug: wedge-a-cli-publish-623128ba` 추가 후 재 publish → CLI 가 GET probe → 200 → PUT 호출. 응답 `op: update`. `GET /api/topics/claude-code` 응답에서 post id `c5adcaed-...` 동일, slug 동일, title 만 갱신, 카드 1건 유지 확인.
- **Note**: production worker 에 신규 POST `slug` 수용 코드는 미배포. create-with-explicit-slug 경로는 build/type pass + 단위 helper 검증만 됐고 라이브 검증은 worker deploy 후. update 경로는 PUT 변경이 없어 production 에서 그대로 동작.
- Build: `pnpm --filter @openhow/cli build` 0 errors, `pnpm --filter @openhow/worker build` 0 errors.
- **2026-05-13 worker deploy**: production 에 신규 POST `slug` 코드 배포 완료 (`wrangler deploy`, Version `75bc90f1-aa25-43b8-84c6-15b8ae79fff5`). create-with-explicit-slug 라이브 검증: `temp/topic-create-test.md` (`slug: wedge-b-create-with-slug`) publish → post `b95d55c3-...`, slug 정확히 `wedge-b-create-with-slug` (random suffix 없음), 카드 2건.

- **Wedge C done (2026-05-13)**: 미존재 토픽 publish 시도 시 CLI 가 `GET /api/topics` 호출 → 사용 가능 토픽 리스트 + 신규 토픽 요청 안내 (`rupy1014@gmail.com`) 출력 → exit 1. probe / POST / PUT 모든 경로에서 `Topic not found` 응답 catch.
- 검증 (production): `temp/topic-nonexistent.md` (`topic: not-real-topic`) publish → 안내 출력, exit code 1, `/api/topics/claude-code` 카드 수 2건 유지 (새 글 생성 0).
- Build: `pnpm --filter @openhow/cli build` 0 errors. CLI-only 변경, 서버/auth client 무변경.

- **Wedge D done (2026-05-13)**: frontmatter `accessLevel` 기본값 `private` 잠금. CLI 가 `resolveTopicAccessLevel` 로 해석 → server `status` 매핑 (`public → published`, `private → draft`). POST/PUT 본문 양쪽 적용. `unlisted`/`team` 은 명시 에러. `--dry-run` preview 에 `accessLevel:` + `status:` 두 줄 추가.
- 검증 (production): `temp/topic-wedge-d-draft.md` (no accessLevel) publish → `status=draft`, post id `74c84eda-...`, `/api/topics/claude-code` 카드 2건 유지 (draft 숨김). 같은 파일에 `accessLevel: public` 추가 후 재 publish → PUT, `status=published`, 카드 3건으로 노출 등장.
- Build: `pnpm --filter @openhow/cli build` 0 errors. CLI-only 변경, 서버/schema/auth/workspace publish 무변경. 의도된 동작 변경: 신규 topic publish 기본값 `published` → `draft`. editor-approval-gate 의도와 정렬.

## Footprint

- `core/packages/cli/src/publish/frontmatter.ts`: appended `resolveTopic`, `resolveWorkspaceField`, `resolveTitle`.
- `core/packages/cli/src/commands/publish-topic.ts`: added topic post publish flow using existing auth client and `POST /api/topics/:slug/posts`.
- `core/packages/cli/src/commands/publish.ts`: added early single `.md` / `.markdown` file-mode branch before existing workspace directory flow.
- `core/packages/worker/src/routes/topics.ts`: Wedge B added optional POST body `slug`, ascii kebab validation, topic-local conflict check returning 409, and preserved random suffix fallback.
- `core/packages/cli/src/publish/frontmatter.ts`: Wedge B added `resolvePostSlug` using frontmatter slug or filename kebab fallback.
- `core/packages/cli/src/commands/publish-topic.ts`: Wedge B added dry-run slug/op preview and publish-time GET probe to choose PUT update or POST create with explicit slug.
- `core/packages/cli/src/commands/publish-topic.ts`: Wedge C added tagged probe result (`exists` / `post-missing` / `topic-missing`), `fetchAvailableTopics` + `printTopicMissing` helpers, and topic-not-found UX on probe/POST/PUT error paths.
- `core/packages/cli/src/publish/frontmatter.ts`: Wedge D added `resolveTopicAccessLevel(frontmatter)` returning `'public' | 'private'` (default `private`, reject `unlisted`/`team`).
- `core/packages/cli/src/commands/publish-topic.ts`: Wedge D resolves accessLevel once, maps to server `status` (public→published, private→draft), uses mapped status in POST and PUT bodies, and surfaces both lines in dry-run preview.

## Recommendation — 첫 wedge 후보

**Wedge A 후보 (가장 작은 검증)**:
- `openhow publish <file.md>` 가 frontmatter `topic` 있으면 `POST /api/topics/:slug/posts` 호출하도록 분기. 인증은 API key 우선. `--dry-run` flag 로 publish 전 preview.
- **검증**: 큐레이터 자기 .md 1건을 `topic: claude-code` frontmatter 로 publish → `/t/claude-code` 에서 노출 확인.
- **변경 범위**: CLI 1개 명령 분기 + frontmatter 파서 + Worker API 호출 클라이언트. DB 0건.

**Wedge B 후보**: Update 흐름 (같은 source `.md` 재 publish 시 update). slug 기준 식별 — frontmatter `slug` 또는 파일명 → kebab. Wedge A 검증 후.

**Wedge C 후보**: 토픽 미존재 안내 + 사용 가능 토픽 리스트 (CLI 가 `/api/topics` 호출).

**Wedge D 후보**: `--access-level` flag 또는 frontmatter 로 `private` default 보장 (큐레이터 동의 게이트 의도와 정렬).

## Follow-up Intents (5-13 정렬, 사용자 합의)

1. **cli-publish-md-sync-v1** ← 현재 의도. 콘텐츠 펌프 켜기.
2. **editor-approval-gate** (다음 의도) — 큐레이터 "이 글 메인 노출 요청" + 작성자 동의 게이트 + 라인업/홈 surface. 인프라: workspace_topic_post_promotion (이미 빌드, Wedge L) + 동의 토글 신규.
3. **composer-deprecation** — UI 글쓰기 폼 (TopicBoard 글쓰기 토글, TopicPostDetail 인라인 edit form, 마크다운 미리보기 토글) 화면 비활성화. 라우트/nav 진입로 제거. 코드는 `// @deprecated 5-13 cli-sync 로 전환` 주석 + 즉시 삭제 안 함. sync 흐름 검증된 후 (Wedge A~B done) 진행.
4. **surface-tone-pass** — 콘텐츠 채워진 상태로 토픽/프로필 surface (TopicBoard, TopicIndex, TopicPostDetail, AuthorProfile, /me/likes) 톤을 본 화면 (DocPage, PublicBlogHome, MarkdownRenderer) 과 정렬. 콘텐츠 빈 상태에서 다듬으면 검증 못 함 — 1~3 done 후 진행.

순서 근거: 콘텐츠 펌프(1) → 메인 노출 게이트(2) → 옛 UI 입구 닫기(3) → 외부 인상 톤 정렬(4). 각 wedge 가 다음 wedge 의 전제 조건을 만들어줌.

## Learnings

### 2026-05-13: Wedge A done — file-mode 분기 + live publish 검증

- **What shipped**: `core/packages/cli/src/publish/frontmatter.ts` 에 `resolveTopic`/`resolveWorkspaceField`/`resolveTitle` 추가. `core/packages/cli/src/commands/publish-topic.ts` 신규 — gray-matter parse → `POST /api/topics/:slug/posts`. `publish.ts` 진입에 `.md` / `.markdown` 파일 감지 분기. 워크스페이스 디렉토리 flow 무변경.
- **Verification**: live publish 성공. post id `c5adcaed-...`, slug `wedge-a-cli-publish-623128ba`. `GET /api/topics/claude-code` 응답에 카드 포함.
- **Surprises**: 0 — endpoint reuse, 인증 재사용으로 의도대로 매우 작은 wedge 였다. 신규 endpoint/DB/viewer 변경 0.
- **Wedge B 진입 시점**: 같은 source `.md` 재 publish → update (현재는 매번 새 글 생성, post slug 가 server-side random 이라 중복 누적). 식별자: frontmatter `slug` 또는 파일명 kebab. 서버는 PUT `/api/topics/:slug/posts/:postSlug` 이미 존재 — 클라이언트가 매핑만 추가.
- **Wedge B 결정 보류**: client-side mapping 파일 (`.openhow/topic-publish-state.json`) vs 서버 컬럼 (`source_path` 또는 `client_slug`) — Wedge B 진입 시 사용자 합의 필요. (다음 의도에서 묻는다, 지금 결정 X.)

### 2026-05-13: 정체성 한 칸 더 좁힘 — MD publishing/discovery layer 잠금

- **Source**: 대화 중 사용자 발화 (openhow 트래픽 모으는 방법 → 게시판 ux 확인 → 옵시디언 차별 정리 → CLI 기반 합의)
- **Signal**: "md 기반의 문서화 서비스야. 이미 mcp 처럼 이 프로젝트가 그걸 제공하는거고... 결국 UI 로 md 를 글쓰는게 아닌거지." → "cli 기반의 문서 편집 플랫폼으로 가보자."
- **Question that locked it**: "그러면 옵시디언이랑 뭐가 달라?" — 답: layer 가 다름 (input vs publishing/discovery), 협력 관계, 차별 3축 (AI 도메인 lock / 큐레이션 / Discovery+SEO+토픽 응집력).
- **Decision**: 5-07 락 유지 (토픽 게시판 1급 + 가입자 1급 시민). 글 작성 메커니즘만 외부 MD sync 로 진화. UI composer 비활성화 (즉시 삭제 X, 주석 deprecated).
- **Priority lock**: cli-publish-md-sync-v1 → editor-approval-gate → composer-deprecation → surface-tone-pass. 콘텐츠 펌프가 디자인 톤 작업보다 우선 (빈 게시판에선 디자인 검증 불가).
- **Decision (5-13)**: CLI 분기 = **frontmatter 자동 라우팅**. `topic: <slug>` → 토픽 publish, `workspace: <slug>` → 큐레이션 publish. 둘 다 있으면 명시 에러. (vs sub-command 분리 / `--topic` flag — 둘 다 reject. 사용자 마찰 최소 + dry-run preview 가 명시성 보완.)
- **Status transition**: exploring → clarified (5-13). Wedge A 진입 가능.
- **Open questions (다음 wedge 에서 결정)**:
  - Update 흐름의 slug 식별자 (frontmatter `slug` vs 파일명 kebab vs `source_path` 컬럼) — Wedge B.
  - 신규 토픽 생성 요청 흐름 — 자동 vs admin 승인. 일단 admin 승인 가정.

### 2026-05-13: Wedge D done — default private + accessLevel→status 매핑

- **What shipped**: `resolveTopicAccessLevel(frontmatter)` 추가, `accessLevel`/`access_level`/`access` 어느 키든 `private` default 로 해석, `public`/`private` 외값은 명시 에러. `publish-topic.ts` 에서 accessLevel 1회 해석 → `status` 매핑 → POST/PUT body 양쪽 일관 사용. dry-run preview 에 두 줄 추가.
- **Verification (production)**: draft 검증 (accessLevel 없음 → `status=draft`, listing 숨김) + public 전환 (`accessLevel: public` 추가 후 재 publish → PUT, `status=published`, listing 3건).
- **Surprises**: 0. 서버 PUT/POST 가 이미 optional `status: 'draft' | 'published'` 받아서 신규 endpoint/컬럼 0. `resolveAccessLevel(fm, defaultLevel?)` 재사용으로 frontmatter 키 alias 처리도 무료로 따라옴.
- **의도된 동작 변경**: 신규 topic publish 의 기본값이 이제 `draft`. `accessLevel: public` 을 명시해야 게시판에 노출. editor-approval-gate 의도와 정렬 (큐레이터 추천 후보 layer 가 다음 단계).
- **Wedge backlog**: Wedge A~D 완료. v1 What 항목들 (라우팅, dry-run, update, 미존재 안내, 인증) 거의 충족. 남은 v1 항목은 "큐레이터 본인 first dogfooding" (5~10건 publish) — 의도 사용자 본인 작업이므로 코드 변경 없음.
