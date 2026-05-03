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

## Naming proposal (2026-05-04 user)

사용자 발화: *"그럼 이 프로젝트를 clauders core 로 두고 lms 를 openhow 로 네이밍 하는건 어떨까? 이 프로젝트는 clauders core 라기 보다는 opendocs 에 더 가까운 느낌이긴 하네."*

| 후보 신규 이름 | 적용 대상 | 이유 |
|--------------|---------|------|
| **opendocs** | 이 repo (SSG/SEO/markdown/blog/docs/wiki + paywall) | SSG 가 핵심 자산이고 *docs/blog/wiki* 가 1급 workspace type. CLI 도 `openhow publish ./docs` — `docs` 가 입력 단위. clauders.ai 외 다른 사용자에게도 generic 하게 적용 가능한 "open documentation publishing platform" 정체성. 사용자가 직접 *"opendocs 에 더 가까운 느낌"* 이라고 표현. |
| **openhow** | fork (LMS — course/lesson/quiz/cohort/cert/admin CRM/community/membership) | "open how" = "여는 학습법" / learning-how. LMS/온라인 강의 서비스로서 의미상 fit. 기존 브랜드 자산을 LMS 쪽이 가져감. liveklass.com 모델의 alternative. |

**clauders core 안 (사용자 1차 제안) vs opendocs 안 (사용자 자체 수정)**:
- clauders 는 *사용자 (consumer)* 이름이지 *제품* 이름이 아님 — 다른 docs 사용자가 들어오면 의미 깨짐.
- opendocs 는 *제품* 이름 — clauders 가 첫 사용자일 뿐, 추가 docs 사용자 (gpters 등) 에게 그대로 적용.
- 사용자가 "opendocs 에 더 가까운 느낌" 으로 자체 수정한 라인을 그대로 채택 권장.

## Recommendation — 권장: **시나리오 A' (fork + rename)**

네이밍 안이 추가되면서 시나리오 C (archive) 보다 시나리오 A (fork) 가 더 정직해짐:

1. **fork 의 함정 (잠정 분석에서 지적했던) 이 네이밍으로 해결됨**: 단순 fork 만 하면 양쪽 모두 무인 상태였지만, *opendocs / openhow* 로 정체성을 분리하면 각 repo 가 명확한 single-purpose. opendocs = clauders 가 active user (single-user 라도 살아있는 사용자), openhow = inactive 지만 의도 자산 (creator-saas-storyboard, creator-admin-console-v1, lesson-player-* 5, course-* 4, community-* 13, liveklass-admin-benchmark) 보존.
2. **clauders.ai 가 active user 인 opendocs**: SSG-SPA parity (iter 26 done), markdown directives, link-card, members-only-ssg-gate, paywalled-seo, onboarding-publish-flow-audit (iter 1 done) 등이 단일 정체성으로 수렴. 다음 wedge 들 (workspace-seo-v1, gpters-seo-flywheel) 도 같은 축.
3. **openhow 는 inactive 자산 보관소가 아니라 의도 자산 + 코드 자산을 한 묶음으로 보내는 정직한 분리**: 향후 LMS 수요가 생기면 그 repo 에서 부활. 의도가 30개 가깝게 누적된 자산을 단순 archive 하면 의도 흐름이 끊기는데, fork 면 흐름 보존됨.
4. **시나리오 C (archive) 는 의도 28~30개를 `_killed/` 으로 보내는 것 — 폐기 의미가 강함**. 사용자는 LMS 를 "폐기" 하는게 아니라 "분리" 를 원함 (발화: *"다른 프로젝트로 fork"*).

## Rename cost (시나리오 A' 채택 시)

분리 작업의 실제 비용 — 결정 전 인지 필요:

- **repo**: 현재 `mdshare` (Gitea: `gitea.max5.ai/ehowlsla/mdshare.git`, GitHub mirror: `rupy1014/mdshare`) → opendocs/openhow 두 repo 로 split. Gitea/GitHub 양쪽에 신규 repo 생성.
- **npm scope**: `@openhow/cli`, `@openhow/types` 가 이미 npm 에 published. opendocs 가 SSG/CLI 보유 → `@opendocs/cli`, `@opendocs/types` 로 publish (기존 `@openhow/*` 는 deprecate notice). openhow scope 는 LMS fork 쪽으로 이전 (또는 보존하되 사용 안 함).
- **CLI 명령어**: `openhow publish` → `opendocs publish`. 사용자 PATH 의 기존 `openhow` 바이너리 deprecate.
- **production worker URL**: `openhow.io` → `opendocs.io` (또는 `clauders.ai` 가 직접 가리킴). clauders.ai 의 deploy 설정 (CNAME / wrangler routes) 변경.
- **리포 내부 import 경로**: `@openhow/types` → `@opendocs/types` 일괄 sed (수십 파일).
- **CLAUDE.md / 문서**: openhow → opendocs 일괄 갱신.
- **wrangler 바인딩 이름** (`mdshare-db`, `mdshare-docs`): D1/R2 자체는 유지 가능 (이름은 이미 mdshare). 새 환경 분리 원하면 D1/R2 도 새로 만들어야 — 데이터 마이그레이션 필요.

비용 큼. 단계화 가능 (1단계: 의도/`.omj/` 분리, 2단계: code split, 3단계: npm/repo/도메인 rename). 1단계만으로도 시각적 정체성 정리 효과 큼.

## What — 본 iter 검토 (업데이트)

- [ ] 사용자 결정: 시나리오 A' (fork + rename to opendocs/openhow) vs 시나리오 C (LMS archive) 중 채택.
- [ ] A' 채택 시 단계화: stage 1 (의도 분리 — `.omj/openhow/*` 신규 폴더로 LMS 의도 28~30개 이동) → stage 2 (코드 split, 신규 repo 생성) → stage 3 (npm scope/CLI/도메인 rename).
- [ ] memory 노트 갱신: `project_openhow_positioning.md` 의 *"liveklass-aligned 순수 크리에이터 SaaS"* → *"opendocs = clauders 를 위한 SSG/SEO 콘텐츠 서비스, openhow 는 별도 repo (LMS)"*.
- [ ] 결정 후 별도 build 의도로 stage 1 분리 작업 이관.

## Learnings

### 2026-05-04: iter 1 — 코드베이스 split 인벤토리 완료
- **Method**: `.omj/` 의 활성 의도 70+ 개를 LMS 축 / SEO 축 / 공통으로 분류. `core/packages/viewer/src/pages/`, `core/packages/worker/src/routes/`, `core/packages/cli/src/ssg/` 디렉토리 cross-read.
- **Surprise**: admin/ 페이지가 58개. 대부분 LMS CRM (Cohorts/Assessments/Certificates/Memberships/Announcements/Comments) 으로 SEO 축에 무관. SEO 축 admin 은 AdminDocs, AdminSite, AdminSettings 정도.
- **Surprise**: community-* iter 의도가 13개. LMS class 내부의 학생 게시판 — clauders 가 안 씀.
- **Surprise**: `clauders-ai-course-migration/` 폴더가 이미 `_killed/` 에 있음 — 과거 user 도 이미 같은 결론에 한 번 도달. 본 의도는 그 결정을 정체성 레벨로 끌어올리는 작업.

### 2026-05-04: iter 1 — 사용자 네이밍 제안 → 시나리오 A' (fork + rename) 로 권장 변경
- **Signal**: 사용자가 *"이 프로젝트를 clauders core 로 두고 lms 를 openhow 로 네이밍 / 이 프로젝트는 opendocs 에 더 가까운 느낌"* 발화. 단순 fork 는 양쪽 무인 상태가 함정이었는데, 정체성 분리 (opendocs / openhow) 가 추가되면 fork 가 정직해짐.
- **Decision pivot**: 잠정 권장 시나리오 C (archive) → 시나리오 A' (fork + rename to opendocs/openhow). 사용자 발화에서 "분리" 와 "폐기" 의 차이가 분명 — fork 가 사용자 의도에 더 정렬.
- **Naming choice**: clauders-core (1차 제안) → opendocs (사용자 자체 수정) 채택 권장. 이유: clauders 는 *사용자* 이름이지 *제품* 이름이 아니어서 다른 docs 사용자 들어오면 의미 깨짐. opendocs 는 generic.
- **Cost surface**: rename 비용 큼 — repo 2개 split, npm scope `@openhow` → `@opendocs`, CLI 명령어, production 도메인 (`openhow.io` → `opendocs.io` 또는 `clauders.ai` 직접). 단계화 가능 (의도 분리 → 코드 split → rename).
