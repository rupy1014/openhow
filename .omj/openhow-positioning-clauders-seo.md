---
status: exploring
created: 2026-05-04
updated: 2026-05-13
iteration: 1
---

# openhow-positioning-clauders-seo — openhow = 큐레이션 서비스 (롱블랙-style), LMS 분리

## Why

사용자 발화 (2026-05-04, 3차 픽셋):
1. *"이 프로젝트는 명확히하자. seo 최적화 서비스라고 보면 돼. clauders 를 위한거. 라이브클래스 관련 lms 서비스는 다른 프로젝트로 fork 하는게 나을지 검토해봐."*
2. *"그럼 이 프로젝트를 clauders core 로 두고 lms 를 openhow 로 네이밍 하는건 어떨까? 이 프로젝트는 clauders core 라기 보다는 opendocs 에 더 가까운 느낌이긴 하네."*
3. **(최종)** *"아냐 이 서비스는 그냥 openhow 고, seo 위주 서비스로 하고 lms 는 분리하자... openhow 는 큐레이션 서비스로 하자. 롱블랙같은."*

2026-04-30 lock-in *"liveklass-aligned 순수 크리에이터 SaaS"* (각 워크스페이스가 독립 스토어 + 모든 type 지원) 을 좁힘:
- **신 정체성**: openhow = SEO 기반 **큐레이션 콘텐츠 서비스** (롱블랙-style). 에디터리얼 publication 이 1급 type, paywall + subscription 이 핵심 비즈니스 모델, SSG/SEO 가 free preview/discovery 메커니즘.
- **LMS 분리**: course/lesson/quiz/cohort/cert/admin CRM/community → 별도 repo (가칭 미확정).
- 이름: openhow 유지 (직전 안 *opendocs* 폐기).

Longblack (롱블랙) 모델 참고:
- 에디터리얼 팀이 1일 1편 큐레이션 글 발행
- 구독료 (₩4,900/월), 무료 프리뷰 / paywall reveal
- 시리즈/태그 큐레이션, 메일/푸시 알림
- 큐레이션은 *first-party editorial* (사용자 콘텐츠 큐레이션 X — 2026-04-30 에 killed 된 editorial-traffic-engine 과 다름)
- LMS/course/quiz 없음

openhow 는 multi-tenant 버전 — 각 워크스페이스 = 한 큐레이션 publication (clauders.ai 가 첫 사용자). 향후 다른 큐레이션 publisher 가 자기 워크스페이스로 운영.

## Context — 코드베이스 split (재분류)

### STAYS — openhow (큐레이션/SEO/SSG 축)

**viewer pages**:
- `DocPage.tsx` (글 본문 — 큐레이션 article)
- `PublicBlogHome.tsx` (publication 홈 — 글 목록)
- `AuthorProfile.tsx` (에디터 프로필)
- `CreatorSaasHome.tsx` (랜딩)
- `Onboarding.tsx`, `Login.tsx`, `Pricing.tsx`, `Privacy.tsx`, `Terms.tsx`
- `SearchResults.tsx`
- `workspace/` (WorkspaceDocs 등 publication 뷰)
- `admin/`: AdminDocs, AdminSite, AdminSettings, AdminPayments, AdminMembers (구독자), AdminMembership (membership space — 구독 tier), AdminAnalytics (필요), Dashboard, EditorPage

**viewer components**: WorkspaceHub, WorkspaceSideNav, MarkdownRenderer 전체, navigation, paywall UI

**cli package**: SSG 빌드 전체 (`ssg/`, `ssgStyles.ts`, `link-card-resolver`, `og-fetch`), markdown 확장 (link-card/canvas-flow/responsibility/endpoint/parameters 등 전부), `openhow publish/serve` 명령어

**worker routes**:
- `documents.ts`, `assets.ts`, `ssg.ts` (SSG 본체)
- `public-feed.ts`, `search.ts`, `settings.ts`
- `workspaces.ts`, `dashboard.ts`, `authors.ts`
- `webhooks.ts`, `payments.ts` (Bootpay paywall + subscription)
- `notion-sync.ts`, `ingest.ts`
- `memberships.ts` (workspace membership space — Longblack subscription tier)
- `subscriptions.ts` (단, courseId/cohortId target 분기 제거 — membershipSpaceId 만 유지)
- `announcements.ts` (publication 알림 — 새 글 발행)
- `keys.ts`, `invites.ts` (구독자/에디터 초대)
- `reviews.ts` (글에 대한 리뷰면 stay, course 리뷰면 fork — 코드 확인 필요)
- `ai.ts` (AI 기능 — 콘텐츠 생성 보조면 stay, course AI 면 fork)

**Workspace types**: `blog` 만 1급 시민으로 좁힘. `docs`/`wiki` 는 *큐레이션 publication 의 documentation 변종* 으로 유지 (clauders 가 docs 로 운영 중). `course/team/project` 는 fork 또는 deprecate.

**활성 의도 (.omj/)**: `ssg-spa-parity-v1`, `workspace-seo-v1`, `paywalled-seo-v1`, `gpters-seo-flywheel`, `members-only-ssg-gate`, `public-home-creator-saas-pivot`, `creator-saas-storyboard`, `onboarding-publish-flow-audit`, `markdown-directive-nesting`, `article-image-sidecar/`, `ai-actuals-editorial`, `article-closing-blocks`, `article-reading-ux`, `auth-gate-ux`, `blog-workspace-style-polish`, `figure-sidecar-toc-fallback/`, `gpters-seo-flywheel`, `public-blog-home`, `reader-block-highlight`, `scroll-top-on-navigate`, `series-catalog`, `workspace-content-themes`, `docs-semantic-containers`, `core/code-group-tab-sync`, `core/local-prod-proxy`, `core/nav-*` (5개), `core/three-rail-nav`, `core/unified-layout`, `core/header-global-search-v1`, `core/header-marketing-nav-v1`, `core/pricing-page-v1`, `core/workspace-side-nav-*` (3개), `core/workspace-subpages-stub-v1`, `core/bloglayout-removal`. 약 35개.

### FORKS — LMS-fork (이름 미정 — `liveklass-fork` / `openclass` / `openlearn` 후보)

**viewer pages**:
- `course/` 전체 4개: CourseLanding, LessonPlayer, QuizPlayer, CourseReviewsSection
- `admin/` 다수 (about ~30 페이지 — LMS-specific):
  - AdminCourses, AdminCoursesShell, AdminCourseDetail
  - AdminCohorts (LMS 기수)
  - AdminAssessments (퀴즈/평가)
  - AdminCertificates
  - AdminAnnouncements (course 공지면 fork — workspace 공지면 stay; 코드 확인 필요)
  - AdminCommunityReview, AdminComments
  - AdminEngagement (course engagement 인 경우)
  - LMS-AI 류

**viewer components**: `LessonCard`, community-* 컴포넌트 전체

**worker routes**:
- `courses.ts`, `lessons.ts`, `cohorts.ts`, `certificates.ts`, `assessments.ts`
- `comments.ts` (course 댓글), `course-reviews.ts`, `qa.ts`
- `slack-bot.ts` (LMS-specific 인 경우)
- `videos.ts` (LMS lesson video. 단, hero video 등 generic 이면 stay — 확인 필요)

**활성 의도**:
- `course-*-v1` 4개 (`core/course-curriculum-redesign-v1`, `core/course-landing-redesign-v1`, `core/course-sticky-purchase-bar-v1`, `course-ratings-reviews`)
- `lesson-*-v1` 5개 (`core/lesson-card-system-v1`, `core/lesson-player-curriculum-v1`, `core/lesson-player-progress-header-v1`, `core/lesson-player-topnav-breadcrumb`, `core/lesson-player-video-skin-v1`)
- `community-*-v1` 13개 (board/list/cards/cta/edit/empty-state/filter-bar/result-count/search-input/sort-selector/list-card-meta/list-cards/list-eyebrow)
- `core/creator-admin-console-v1`, `core/liveklass-admin-benchmark`
- `core/per-course-settings-v1`
- `learner-progress`, `instructor-profile-page`

총 ~28개.

### KILLS / 후속 검토
- `core/community-*-v1` 13개 — student board 인데 공통 community 기능 (예: 큐레이션 글 댓글) 으로 살릴 부분 있는지 한 번 더 검토. 없으면 fork 와 함께 이동.
- `creator-platform.md`, `creator-platform-discovery.md` — discovery/curation 의도. 새 큐레이션 정체성과 정렬 필요 — 의도 자체는 살리되 *first-party editorial* 톤으로 재정의.
- Workspace type `team`/`project` — 사용 흔적 거의 없음. 정체성 정리하면서 deprecate 후보.
- Course-related schema (D1 테이블 `course`, `lesson`, `cohort`, `cert`, `assessment`, `quiz`, `community_post` 등) — fork 시 새 D1 으로 마이그레이션. 기존 D1 (`mdshare-db`) 에서는 drop 하거나 read-only 보존.

## Naming (확정)
- 이 repo: **openhow** (유지). 큐레이션 + SEO + SSG.
- Fork repo: 미정. 사용자 결정 대기. 후보: `liveklass-fork`, `openclass`, `openlearn`, `openlms`. (PR 제안 가능)

## What — 검토 단계 (stage 분리 plan)

### Stage 1 — 의도 자산 분리 (코드 변경 0)
- [ ] `.omj/_lms-fork-staged/` 폴더 신규 생성 (이동 전 임시 staging — 실 fork repo 만들기 전).
- [ ] LMS 의도 ~28개를 `.omj/_lms-fork-staged/` 로 git mv.
- [ ] `.omj/MANIFEST-LMS-FORK.md` 생성 — 분리 대상 의도 / 코드 / 스키마 리스트, 분리 사유, 신규 repo 후보 이름.
- [ ] memory 노트 갱신: `project_openhow_positioning.md` 의 *"liveklass-aligned 순수 크리에이터 SaaS"* → *"큐레이션 서비스 (롱블랙-style), 각 워크스페이스 = 1 publication, LMS 별도 repo"*.
- 효과: 시각적 정체성 즉시 정리. 코드는 그대로지만 의도 흐름이 정렬.

### Stage 2 — 코드 disable + admin 정리
- [ ] viewer router (`router.tsx`) 에서 LMS 라우트 (`/c/:workspace/:course`, `/c/:workspace/:course/lesson/:lessonId`, `/c/:workspace/:course/quiz/:quizId`) 주석 처리 — 컴포넌트는 유지하되 진입로 차단.
- [ ] admin nav 에서 LMS 메뉴 (Courses, Cohorts, Assessments, Certificates, CommunityReview, Engagement) 숨김.
- [ ] worker `index.ts` 에서 LMS 라우트 (`courses`, `lessons`, `cohorts`, `certificates`, `assessments`, `comments`, `course-reviews`, `qa`) 등록 주석 처리.
- [ ] 효과: clauders.ai 사용자 시각으로 LMS 흔적 0. 코드는 보존 — 의도 흐름 보존, fork 시점에 그대로 옮김.

### Stage 3 — 신규 fork repo 생성 + 코드 이전
- [ ] 사용자 결정: 신규 repo 이름 (Gitea + GitHub 양쪽).
- [ ] git filter-repo 또는 단순 cp + commit 으로 LMS 코드 + 의도 이전.
- [ ] openhow repo 에서 LMS 코드 삭제 (의도는 `_archived/` 로 마무리).
- [ ] D1 스키마 migration: course/lesson/cohort/cert/quiz/community_post 등 LMS 테이블 fork repo 로. openhow D1 에서는 drop 또는 readonly.
- [ ] CLAUDE.md (openhow + fork) 양쪽 갱신.

### Stage 4 — 큐레이션 정체성 강화 (별도 의도)
- [ ] Workspace type 정리: `blog` 1급, `docs`/`wiki` 변종 유지, `course`/`team`/`project` deprecate.
- [ ] 큐레이션-specific 기능 의도 신규: 시리즈 큐레이션 v2, 1일 1편 발행 큐, 구독자 메일/푸시 알림, free preview / paywall reveal UX.
- [ ] 별도 의도로 분리.

## Not

- 즉시 코드 삭제 X — Stage 2 에서도 *주석 처리* 만, 삭제는 Stage 3 fork 후.
- D1 스키마 즉시 변경 X — 데이터 migration 은 Stage 3.
- npm scope `@openhow` 변경 X — 이름 유지 결정 (직전 opendocs 안 폐기).
- 도메인 `openhow.io` 변경 X.
- Bootpay/Auth 자체 변경 X.
- clauders.ai 콘텐츠 변경 X.
- LMS 코드를 즉시 `_killed/` 보내기 X — 자산 보존을 위해 fork 가 정직.
- 결정 전에 Stage 2 시작 X — 사용자 사인 필요.

## Recommendation — 잠정 권장: **Stage 1 즉시 시작**

가장 가벼운 첫 발걸음. 코드 0 변경, 의도 폴더만 정리. 효과:
1. 시각적 정체성 즉시 정리 — `.omj/` 를 열면 큐레이션 의도 ~35개 + `_lms-fork-staged/` 28개로 두 축이 명확히 분리.
2. 다음 PRD/build 세션에서 의도를 분류하기 쉬워짐 — *"이거 큐레이션 의도? LMS 의도?"* 가 폴더로 자명.
3. memory 노트 갱신으로 다음 세션부터 *큐레이션* 정체성이 자동 적용 (gpters-seo-flywheel 같은 의도 검토 시 자동 정렬).
4. Stage 2/3 로 갈지 여부는 Stage 1 후 의도 폴더가 정리된 시점에 다시 판단.

Stage 2/3/4 는 큐레이션 정체성 의도 들이 몇 개 새로 만들어진 후에 결정 (큐레이션 surface 가 구체화되어야 LMS 코드 disable/제거 결정이 정확).

## Learnings

### 2026-05-13: mechanic 진화 — MD publishing/discovery layer 잠금

- **Source**: 대화 중 사용자 결정 (옵시디언 차별 정리 + 우선순위 재정렬)
- **Insight**: openhow 의 차별축 = (1) AI 도메인 lock, (2) 큐레이션 레이어 (에디터 동의 게이트), (3) Discovery + SEO + 토픽 응집력. 옵시디언과 협력 관계 (input vs publishing/discovery layer), 경쟁자 아님.
- **Decision**: 글의 출처 = 외부 MD sync (CLI publish v2, 향후 Notion/GitHub sync). UI composer 화면 비활성화 방향 — 코드는 `// @deprecated` 주석으로 보존 (즉시 삭제 X).
- **Mechanic 진화이지 pivot 아님**: 5-04 큐레이션 (롱블랙) + 5-07 AI 사이트 (Medium+Reddit 하이브리드) 잠금 유지. 글의 작성 메커니즘만 진화.
- **Follow-up intents (5-13 정렬)**: `cli-publish-md-sync-v1` → `editor-approval-gate` → `composer-deprecation` → `surface-tone-pass`.
- **References**: [[cli-publish-md-sync-v1]], [[study-community-board]]

### 2026-05-04: iter 1 — 코드베이스 split 인벤토리
- **Method**: `.omj/` 활성 의도 70+ 개를 LMS / SEO / 공통으로 분류. `core/packages/viewer/src/pages/`, `worker/src/routes/`, `cli/src/ssg/` cross-read.
- **Surprise**: admin/ 페이지 58개 중 LMS-specific ~30개. SEO/큐레이션 admin 은 ~28개.
- **Surprise**: community-* iter 의도 13개 — 학생 게시판. 큐레이션에 살릴지 의문.
- **Surprise**: `_killed/clauders-ai-course-migration/` 가 이미 있음 — 과거 user 도 같은 결론에 한 번 도달.
- **Surprise (iter 2)**: subscriptions.ts 가 dual-target — courseId/cohortId/membershipSpaceId 셋 중 하나. fork 시 courseId/cohortId 제거하고 membershipSpaceId 만 유지로 좁힐 수 있음.

### 2026-05-04: iter 1 — 정체성 3차 픽셋 정리 → 큐레이션 (롱블랙) 채택
- **Pivot 1 (사용자)**: SEO 서비스 + clauders core. 잠정 권장 시나리오 C (archive).
- **Pivot 2 (사용자)**: opendocs 네이밍 제안. 권장 시나리오 A' (fork + rename).
- **Pivot 3 (사용자, 최종)**: openhow 이름 유지, 큐레이션 정체성 (롱블랙-style), LMS 만 fork. → 권장 *Stage 1 시작* (의도 분리만, 코드 0 변경).
- **Insight**: 첫 발화의 *"SEO 서비스"* 는 표면 framing 이었고, 실제 의도는 *큐레이션 콘텐츠 publication*. SEO 는 큐레이션의 discovery 메커니즘이지 정체성 자체가 아님. 이게 명확해지면서 fork 결정도 단순해짐 (LMS 는 큐레이션 publication 모델과 무관).
- **Naming decision**: opendocs 안 폐기. 사용자 발화 *"이 서비스는 그냥 openhow"* 로 직접 결정. LMS fork 이름은 미정.
- **Memory 노트 갱신 필요**: `project_openhow_positioning.md` 를 새 framing 으로 교체 — Stage 1 작업의 일부.
