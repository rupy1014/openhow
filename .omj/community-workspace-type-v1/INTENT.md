---
status: seed
created: 2026-05-14
updated: 2026-05-14
iteration: 1
---

# Community 워크스페이스 타입 (Notion-like 에디터 + 가입자 글 SEO)

## Why

clauders.ai 같은 큐레이터가 자기 가입자 커뮤니티 사이트 — 예: `community.clauders.ai` — 를 워크스페이스 단위로 운영해야 한다. 가입자가 직접 글을 쓰고, 그 글이 그대로 공개되어 검색에도 노출되는 형태. 5-07 positioning lock 의 두 축 중 "가입자 1급 시민 레이어" 를 **per-workspace** 로 manifest 하는 의도다 (플랫폼-level 토픽 게시판 = `openhow.kr/t/{topic}` 와는 별개 — 그건 cross-workspace 면).

현재 워크스페이스 타입 (`docs`/`course`/`team`/`blog`/`wiki`/`project`) 중 멀티 작성자 + UI 작성 + 즉시 공개를 함께 만족하는 게 없다. 가장 가까운 `wiki` 는 협업 위키 결이라 "개인 글" 단위가 약하고, `blog` 는 1인 작성자 가정. 큐레이션 본문은 5-13 부터 CLI MD sync 단일화 (composer-deprecation 진행 중) — 즉 UI 에디터를 **다시 부활**시키는 게 아니라, 타입별 정책 분기로 **community 타입에만** Notion-like 에디터를 둔다.

가입자 활동량을 살리려면 작성 마찰이 최소화돼야 하고 (즉시 공개), 동시에 브랜드 (clauders.ai) 노출을 보호하려면 사후 통제 수단 (모더레이션) 이 필수.

## What

- [hypothesis] `type: community` 워크스페이스 타입 신설 — `joinPolicy: open`, `defaultAccessLevel: public`, 멀티 작성자 멤버 권한, theme/navigation 기본값 정의 + `docs/workspace-types.md` 갱신 → **metric: clauders 운영자가 5분 이내 `community.clauders.ai` 신규 생성·publish 완료**
- [hypothesis] **Tiptap (ProseMirror) 기반 Notion-like 블록 에디터** 도입 — 슬래시 명령, 인라인 포맷, 헤딩/리스트/코드/이미지/임베드 블록. 저장은 ProseMirror JSON + 렌더용 HTML(또는 MD) 동시 보관 → **metric: 비개발자 가입자가 보조 없이 첫 글 작성·발행 성공률 ≥ 80%**
- [hypothesis] 작성 즉시 공개 + 사후 모더레이션 — 신고/숨김/삭제/작성자 차단 admin UI, 워크스페이스 owner 권한 → **metric: 신고 접수 24h 내 처리 가능, 차단된 작성자 재발행 0건**
- [hypothesis] 가입자 글 **SEO 인덱싱** — 글 단위 sitemap 엔트리, OG/Twitter 메타, JSON-LD `Article` structured data, canonical URL. customDomain (community.clauders.ai) 기준으로 동작 → **metric: 발행 후 7일 내 Google Search Console 에 가입자 글 indexed 비율 ≥ 50%**
- [hypothesis] **Anti-spam baseline** — 가입 직후 N분 cooldown, 첫 글 N개까지 throttle, 외부 도메인 차단 리스트, 본문 휴리스틱 (반복 링크/이모지 spam) → **metric: 첫 30일 운영 중 spam 으로 판정된 글 비율 < 1%**
- [hypothesis] 큐레이션 라인업 **승격 bridge** — 큐레이터가 가입자 글을 자기 큐레이션 라인업으로 endorse/mirror 하는 admin action (editor-approval-gate 와 연동) → **metric: 첫 1개월 안에 가입자 글 ≥ 1개가 큐레이션 라인업으로 승격됨**
- [hypothesis] `community.clauders.ai` **서브도메인 라우팅** 동작 검증 — 기존 customDomain 자산 reuse → **metric: 별도 코드 추가 없이 라우팅 성공**

**확신도 태그**: 전부 `[hypothesis]` — seed 단계 기본값. clarify 진입 전 metric 채움.

## Not

- **Phase 0 UX storyboard 생략** (사용자 결정 2026-05-14) — 티스토리/Notion 결을 참고하되 stitch 우회.
- **플랫폼-level 토픽 게시판** (`openhow.kr/t/{topic}`) — 5-07 lock 의 다른 축, 이 의도 밖. cross-workspace 면은 별도 의도로 다룬다.
- **CLI publish 경로로 community 워크스페이스 글 작성** — composer-deprecation 정책은 큐레이션 본문에만 적용. community 타입은 UI 단일 경로.
- **가입자 글의 유료 paywall / 멤버십 등급별 가시성** — paywall 자산은 큐레이션 본문 전용 (1차 범위 외).
- **실시간 채팅/DM** — 블로그/포럼 결이지 Discord 결 아님.
- **알림 (이메일/푸시) 시스템** — 별도 의도로 분리.
- **AI 자동 모더레이션** — v1 은 수동 사후 모더레이션만. AI/큐 자동화는 v2 후보.
- **댓글 트리/스레드** — 1차는 글 publish flow 까지. 댓글 surface 는 backlog.

## Context

**Positioning lock (memory: project_openhow_positioning)**: openhow = AI 도메인 큐레이션 + 가입자 1급 시민 (Medium+Reddit 하이브리드). 이 의도는 두 축 중 "가입자 1급 시민" 축의 per-workspace manifestation. clauders.ai 가 첫 publisher.

**기존 자산 reuse**:
- `workspace` 엔티티 + `type` enum (`docs`/`course`/`team`/`blog`/`wiki`/`project` → `community` 추가)
- `customDomain` 라우팅 (community.clauders.ai)
- 가입자/멤버 모델 (`AdminMembers`, `AuthorProfile`)
- `SSG`/`members-only-ssg-gate` — community 는 public SSG, members-only 게이트는 작성 권한에만 적용
- workspace-scoped SEO

**관련 의도 (parent/sibling)**:
- `composer-deprecation.md` — UI composer off 정책이 **타입별 분기**가 되어야 함 (큐레이션 off / community on). 이 의도 진행 중 해당 파일에 정책 분기 조항 추가 필요.
- `editor-approval-gate.md` — 가입자 글의 큐레이션 라인업 승급 hook 이 여기서 활성화됨.
- `cli-publish-md-sync-v1.md` — 큐레이션 단일 publish 경로. community 는 영향 없음 (다른 경로).
- `public-blog-home.md` / `openhow-positioning-clauders-seo.md` — 가입자 글의 SEO surface 정책 참조.
- `docs/workspace-types.md` — 신규 타입 추가 위치.

**핵심 결정 (사용자 confirm 2026-05-14)**:
1. 에디터: **Tiptap (ProseMirror)**
2. 공개 모델: **작성 즉시 공개 + 사후 모더레이션** (Reddit/Discord 결)

**Why these decisions matter**: Tiptap JSON 저장은 향후 collaboration/AI 통합/렌더 분리에 모두 열려 있음 (BlockNote 보다 customization 자유도 큼). 즉시 공개 정책은 가입자 활동량 우선이라는 신호 — 모더레이션이 사후로 빠지므로 anti-spam baseline 과 신고/숨김 admin UI 가 동등 비중의 What 항목이 된다.

## Footprint

(None yet — auto-recorded after /omj:build)

## Backlog

- 댓글/리액션 surface
- 이메일/푸시 알림
- AI 자동 모더레이션 (텍스트 분류 / 신고 자동 격상)
- 가입자 reputation/badge
- 글 단위 분석 (조회수/체류 시간)
- 워크스페이스 간 cross-post (community → 토픽 게시판)

## Learnings

### 2026-05-14: seed created (iteration 1)
- **Background**: clauders.ai 의 `community.clauders.ai` 서브사이트 — 가입자가 UI 에서 글 쓰고 즉시 공개·SEO 인덱싱되는 워크스페이스 타입. 5-07 lock 의 "가입자 1급 시민" 축을 per-workspace 로 manifest.
- **Initial notes**:
  - 5-13 composer-deprecation 과 정합: 큐레이션 본문은 CLI/MD sync, community 본문은 UI Tiptap — **타입별 정책 분기** 가 핵심 reframe.
  - 즉시 공개 + 사후 모더레이션 결정은 "가입자 활동량 > 사전 품질 보호" 라는 trade. 브랜드 보호는 anti-spam + 모더레이션 admin UI 두 What 항목이 분담.
  - 에디터 스택은 Tiptap (ProseMirror) 확정. BlockNote/MD 확장 후보는 기각.
  - customDomain (community.{publisher-domain}) 은 기존 자산 reuse — 신규 작업 없음 가정. 검증은 What 의 마지막 항목.
