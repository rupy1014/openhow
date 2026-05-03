---
status: exploring
created: 2026-05-04
updated: 2026-05-04
iteration: 1
---

# openhow-positioning-clauders-seo — openhow = clauders 를 위한 SSG/SEO 서비스, LMS fork 분리 검토

## Why

사용자 발화 (2026-05-04): *"이 프로젝트는 명확히하자. seo 최적화 서비스라고 보면 돼. clauders 를 위한거. 라이브클래스 관련 lms 서비스는 다른 프로젝트로 fork 하는게 나을지 검토해봐."*

2026-04-30 정체성 lock-in (메모리: *"liveklass-aligned 순수 크리에이터 SaaS"*) 은 LMS (course/lesson/quiz/cohort/cert/admin CRM) + SEO (SSG/markdown/docs/blog/wiki + paywall/members-gate) 두 축을 한 코드베이스로 묶어 두는 결정이었다. 실제 단일 사용자 (clauders.ai) 는 SEO/docs 만 사용 — LMS 절반이 dead weight 일 가능성. 정체성을 *"clauders 를 위한 SSG-기반 SEO 콘텐츠 서비스"* 로 좁히고, LMS 는 fork 또는 archive 할지 검증.

## Context — 코드베이스 split

### LMS 축 (fork/archive 후보)
- **viewer pages**: `course/` 4개 (CourseLanding, LessonPlayer, QuizPlayer, CourseReviewsSection) + `admin/` 58개 중 다수 (AdminCourses, AdminCohorts, AdminAssessments, AdminCertificates, AdminMembership, AdminAnnouncements, AdminCommunityReview, AdminMembers, AdminEngagement, AdminAnalytics 등)
- **worker routes**: `courses.ts`, `lessons.ts`, `cohorts.ts`, `certificates.ts`, `assessments.ts`, `comments.ts`, `course-reviews.ts`, `qa.ts`, `memberships.ts`, `subscriptions.ts`, `slack-bot.ts`, `analytics.ts`, `announcements.ts`, `videos.ts`
- **components**: `LessonCard`, community-* 컴포넌트 셋
- **활성 의도 (.omj/core/)**: `course-*-v1` 4개, `lesson-*-v1` 5개, `community-*-v1` 13개, `creator-admin-console-v1`, `liveklass-admin-benchmark`, `per-course-settings-v1`. 추가로 `.omj/` 루트의 `course-ratings-reviews`, `learner-progress`, `instructor-profile-page`. 약 28~30개.
- **killed**: `clauders-ai-course-migration/` (이미 폐기), `editorial-traffic-engine.md`, `platform-pro-plan.md`, `design-system-foundation.md`

### SEO/콘텐츠 축 (clauders.ai 가 사용)
- **viewer pages**: `DocPage`, `PublicBlogHome`, `AuthorProfile`, `CreatorSaasHome`, `Onboarding`, `SearchResults`, `workspace/`
- **viewer components**: `WorkspaceHub`, `WorkspaceSideNav`, navigation, MarkdownRenderer
- **cli package**: SSG 빌드 전체 (`ssg/`, `ssgStyles.ts`, `link-card-resolver`, `og-fetch`), `openhow publish/serve` 명령어
- **worker routes**: `documents.ts`, `assets.ts`, `ssg.ts`, `public-feed.ts`, `search.ts`, `settings.ts`, `workspaces.ts`, `dashboard.ts`, `authors.ts`, `webhooks.ts`, `payments.ts` (paywall), `notion-sync.ts`, `ingest.ts`
- **활성 의도**: `ssg-spa-parity-v1` (iter 26 done), `workspace-seo-v1`, `paywalled-seo-v1`, `gpters-seo-flywheel`, `members-only-ssg-gate`, `public-home-creator-saas-pivot`, `creator-saas-storyboard`, `onboarding-publish-flow-audit` (iter 1 done), `markdown-directive-nesting`, `article-image-sidecar`, `markdown directive` 류

### 공통 인프라
- Cloudflare Workers + D1 + R2 + KV (workspace/user/session)
- Better Auth (OAuth)
- Bootpay (course 판매 + paywall 두 축 모두 사용)
- Workspace 모델 (`type` 이 두 축의 가르는 노브: `course/team` → LMS, `blog/docs/wiki/project` → SEO)

## What — 본 iter 검토

- [ ] **clauders.ai 의 실 사용 surface 측정**: 워크스페이스 type 확인 + 실제 라우트 hit (course/lesson/admin 페이지 사용 흔적). 0 이면 LMS dead weight 확정.
- [ ] **3 시나리오 정량 비교**:
  - **A — fork (별도 repo)**: LMS → 새 repo (`liveklass-fork`), openhow 는 SEO 만. 인프라 (auth/payment/workspace/SSG) 분리 비용 평가.
  - **B — monorepo + feature flag**: 같은 repo 에서 type 별 surface 토글. workspace.type 으로 자동 분기.
  - **C — kill LMS (archive)**: openhow 에서 LMS 코드/의도 통째 archive. 향후 부활은 별도 repo 로.
- [ ] **결정 후 액션 분리**: fork/archive 가 결정나면 별도 build 의도로 이관 (코드 이동 + 의도 정리 + memory 갱신).
- [ ] **메모리 노트 갱신**: `project_openhow_positioning.md` 의 *"liveklass-aligned 순수 크리에이터 SaaS"* → 새 정체성 ("clauders 를 위한 SEO/SSG 서비스") 로 교체.

## Not

- 즉시 코드 분리/삭제 X — 본 iter 는 *결정 검토*. 결정 후 별도 build 의도로 이관.
- Bootpay/Auth 자체 변경 X — fork 결정 후 어느 repo 가 갖느냐만 정함.
- clauders.ai 자체 콘텐츠 변경 X.
- 다른 도메인 사용자 (gpters 등) 의 의존도 분석 X — 본 의도는 *clauders 단일 사용자 기준*.
- 결정 전에 활성 LMS 의도 (course/lesson/community-*) 의 새 wedge 시작 X — 결정 후 정리.

## Recommendation — 잠정 권장: **시나리오 C (LMS archive)**

1. **clauders.ai = 단일 사용자 + SEO/docs 전용**. course/lesson/quiz/admin CRM 페이지 사용 흔적 0 (확인 필요하지만 코드/콘텐츠 구조상 명백). LMS 는 누구도 안 씀.
2. **유지비 vs 활용도 비대칭**: 활성 LMS 의도 28~30개 + admin 페이지 58개 + worker route 14개 = 코드베이스의 절반 이상. 유지비 큼. 활용 0 → archive 가 정직.
3. **fork (시나리오 A) 의 함정**: fork 만들면 양쪽 모두 무인 상태. 살릴 power-user 부재. fork 는 *누군가 LMS 를 곧 띄울 의향이 있을 때만* 정직. 그게 아니라면 archive 후 부활 시 별도 repo 로 가져오는 것이 더 가벼움.
4. **monorepo + feature flag (시나리오 B)** 도 비합리: 사용 안 하는 코드를 feature flag 뒤에 숨겨도 빌드/타입체크/의존성 부담은 그대로. SSG-SPA parity 같은 핵심 작업이 LMS 코드를 거쳐서 영향받음 (실제로 `creator-admin-console-v1` 류가 nav/layout 의도와 얽힘).

대안 (시나리오 A) 가 정당한 케이스: 사용자 본인 또는 누군가가 6개월 안에 liveklass-style LMS SaaS 를 띄울 *구체* 의향이 있을 때. 막연한 "나중에 쓸 수도" 는 archive 가 정답.

## Learnings

### 2026-05-04: iter 1 — 코드베이스 split 인벤토리 완료
- **Method**: `.omj/` 의 활성 의도 70+ 개를 LMS 축 / SEO 축 / 공통으로 분류. `core/packages/viewer/src/pages/`, `core/packages/worker/src/routes/`, `core/packages/cli/src/ssg/` 디렉토리 cross-read.
- **Surprise**: admin/ 페이지가 58개. 대부분 LMS CRM (Cohorts/Assessments/Certificates/Memberships/Announcements/Comments) 으로 SEO 축에 무관. SEO 축 admin 은 AdminDocs, AdminSite, AdminSettings 정도.
- **Surprise**: community-* iter 의도가 13개 (community-board-polish/list/cards/cta/edit/empty-state/filter-bar/result-count/search-input/sort-selector/list-card-meta/list-cards/list-eyebrow). LMS class 내부의 학생 게시판 — clauders 가 안 씀.
- **Surprise**: `clauders-ai-course-migration/` 폴더가 이미 `_killed/` 에 있음 — clauders 에 course 를 도입하려다 폐기된 흔적. *과거 user 도 이미 같은 결론에 한 번 도달*. 본 의도는 그 결정을 정체성 레벨로 끌어올리는 작업.
- **Footprint candidate (decision pending)**: 시나리오 C 가 채택되면 archive 대상 — `course/`, `LessonPlayer.tsx`, `QuizPlayer.tsx`, admin/ 의 LMS 류 ~40 페이지, community/* 컴포넌트, worker routes 14개, 해당 의도 28~30개.
