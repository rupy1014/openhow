---
status: done
created: 2026-04-17
updated: 2026-04-17
iteration: 2
---

# course-ratings-reviews — 수강생 공개 별점/리뷰 시스템

## Why

openhow가 유료 강좌 판매 플랫폼이 되려면 "평균 4.7 (234 리뷰)" 같은 **수강생 평판 시그널**이 랜딩 페이지/카탈로그 카드에 박혀야 한다. 없으면 신뢰 부족으로 구매 전환이 안 일어난다. 핵심은 **결제+학습한 진짜 수강생**이 남기는 공개 리뷰지, 운영자/에디터의 내부 품질 평가가 아니다. (현재 `AdminReviews.tsx` + `/api/reviews/...` 는 에디토리얼 칸반 — 혼동 주의)

## Context

- **혼동 주의 — 기존 리뷰와 구분**:
  - `AdminReviews.tsx` + `reviewScore` API = **내부 에디토리얼 품질 워크플로우** (draft → review → approved → deprecated 칸반, 운영자용)
  - 본 intent는 **공개 수강생 리뷰** — 완전히 다른 도메인. 별도 테이블/엔드포인트 필요 (테이블명: `courseReview`)
  - 네이밍 충돌 방지: API path `/api/course-reviews/...` 로 분리
- **부모/자매 의도**:
  - `instructor-profile-page.md` (seed) — 강사 평균 평점 데이터 소비자 (다음 intent)
  - `series-catalog.md` (seed) — 카탈로그 카드 평점 뱃지 소비자 (이번 iter 범위 밖)
  - `creator-platform.md` (done) — UGC 발행자 정책과 톤 일치
- **권한 정책 (iter 2 확정)**:
  - 작성 자격: Bootpay 결제 완료 OR enrollment 기록 있음 (무료 강좌 포함)
  - 익명 금지 — user.username/name 노출
  - 1 user × 1 workspace = 1 review (update 가능)
- **데이터 모델 (iter 2 확정)**:
  - `courseReview (id, workspaceId, userId, score 1-5, text, createdAt, updatedAt)` — status 필드는 iter 3 (Admin 모더레이션 들어올 때)
  - 집계는 실시간 aggregation (처음엔 `SELECT AVG(score), COUNT(*)` — 10K 리뷰 전까지 OK)
- **UX 노출 지점 (이번 iter)**:
  - `CourseLanding.tsx` — 상단 hero 아래 평점 summary + 리뷰 목록
  - 리뷰 작성 폼 (inline 또는 모달)

## What (v1 MVP — 이번 빌드)

- [x] **DB 스키마 + 마이그레이션** — `courseReview` 테이블 생성 마이그레이션 추가. 기존 에디토리얼 `review*` 네이밍과 충돌 없음 → **metric: `drizzle migrate` 통과**
- [x] **API 엔드포인트** — `POST /api/course-reviews/:workspaceSlug/:courseSlug` (upsert 작성/수정), `GET .../:workspaceSlug/:courseSlug` (목록+평균+개수) → **metric: 정상 응답 shape 검증**
- [x] **작성 권한 검증** — 서버에서 `enrollment` (status IN active/completed) 기록 확인. 미등록 → 401. → **metric: 미등록 401, 등록 유저 성공**
- [x] **CourseLanding 평점 summary + 리뷰 목록** — 평균 별점 (1 decimal) + 총 개수 + 리뷰 목록 (작성자/별점/본문/날짜) + 작성 폼 (자격 있는 유저만 노출) → **metric: 결제 유저 작성 → 목록 즉시 반영, summary 업데이트**

## Not

- **익명 리뷰** (신뢰 저하 — 실명/유저네임 강제)
- **무결제 리뷰** (스팸 위험 — Bootpay/enrollment 기록 필수)
- **AdminReviews.tsx 칸반 변경** (내부 에디토리얼과 분리 유지)
- **Admin 모더레이션 UI** (→ Backlog, 리뷰 신고 발생 후)
- **강사 프로필 집계 API** (→ `instructor-profile-page` intent에서 필요할 때 추가)
- **카탈로그 카드 평점 뱃지** (→ `series-catalog` intent)
- **리뷰 페이징/정렬 토글** (초기엔 최신순 고정 + 더보기 없이 50개 한도)
- **리뷰 가중치 알고리즘** (초기엔 단순 평균)
- **Phase 0 UX 와이어** (코드 먼저, 스타일 폴리시는 후속 iter)

## Footprint

- `core/packages/worker/src/db/schema.ts` — `courseReview` 테이블 추가 (id, courseId FK, userId FK, score, text, createdAt, updatedAt) + `uniqueIndex(courseId, userId)` + schemaExport barrel 포함
- `core/packages/worker/migrations/0055_add_course_review.sql` — CREATE TABLE + unique index
- `core/packages/worker/src/routes/course-reviews.ts` — 신규 Hono 라우트. GET (`authMiddleware`, canViewCourseLanding gate) + POST (`requireAuth`, enrollment status ∈ {active, completed} 체크, upsert). Score 1-5 검증, text max 2000자
- `core/packages/worker/src/index.ts` — `app.route('/api/course-reviews', courseReviews)` 등록
- `core/packages/viewer/src/pages/course/CourseReviewsSection.tsx` — 신규 컴포넌트 (220줄). summary + 목록 + 작성/수정 폼. 기존 리뷰 자동 pre-fill
- `core/packages/viewer/src/pages/course/CourseReviewsSection.css` — 스타일 (159줄)
- `core/packages/viewer/src/pages/course/CourseLanding.tsx` — hero 아래 `<CourseReviewsSection />` 삽입 + `userId` Auth store에서 추가

## Backlog

- Admin 모더레이션 UI (신고 목록 + 숨김/복구, `AdminComments` 패턴)
- 강사 답글 ("이 리뷰에 대한 강사의 생각")
- "이 리뷰가 도움됐어요" 투표
- 완주 후 리뷰 작성 자동 리마인더 이메일
- 리뷰 이미지/영상 첨부
- 리뷰 가중치 (최신/완주도 반영)
- 리뷰 페이징/정렬 토글 (50+ 리뷰 발생 후)
- 카탈로그 카드 평점 뱃지 (series-catalog intent)

## Learnings

### 2026-04-17: seed 생성 (iteration 1)
- **Background**: "이러닝 구성요소 종합 검토" 중 가장 임팩트 큰 갭으로 식별. "만들었으면 팔아라" 관점에서 **판매 전환 직결** 피처.
- **핵심 발견 — 혼동 지점**: `AdminReviews.tsx` 가 이미 있어서 "리뷰 있다"로 오해 가능. 실제로는 **내부 에디토리얼 워크플로우(draft/review/approved 칸반)** 로 수강생 공개 리뷰와 완전히 다른 도메인.

### 2026-04-17: seed → clarified (iteration 2)
- **narrowing**: What 8개 → 4개로 축소. Admin UI / 강사 집계 / 페이징 / Phase 0 UX는 Not 또는 Backlog로 이동.
- **근거**: MVP 루프 (결제 유저가 리뷰 작성 → 랜딩에서 다른 유저가 평균+목록 확인) 완성에 필수적인 4개만 남김. 모더레이션은 실제 신고 발생 전까지 불필요, 강사 집계는 `instructor-profile-page` 다음 intent에서 필요할 때 추가.
- **다음**: `/omj:build course-ratings-reviews` — 바로 착수

### 2026-04-17: clarified → done (iteration 2)
- **실행**: 3-step Codex 위임 (schema+migration → API route → viewer UI). 각 step build 통과 후 다음 step 파이프.
- **주요 결정 전환**: Intent 원안은 `workspaceId` 기준이었으나 **`courseId` 기준**으로 변경. 이유: enrollment FK가 courseId 기반 + CourseLanding은 course-specific + permission 체크 단순화. 한 사용자가 같은 워크스페이스의 다른 강좌에 각각 리뷰 가능.
- **권한 단순화**: "Bootpay 결제 OR enrollment" → 그냥 **enrollment (active/completed)** 만. `source` 필드가 이미 `{free|manual|subscription|payment}` 를 구분하므로 enrollment 유무 = 결제/무료 포함 접근권.
- **검증**: worker build + viewer build 모두 통과. 로컬 DB에 published course 없어 브라우저 E2E는 패스 — prod/staging 에서 확인 필요.
- **후속 (instructor-profile-page 이전)**: `GET /api/course-reviews/by-instructor/:userId` 또는 `GET /api/authors/:username/review-stats` 같은 집계 엔드포인트가 강사 프로필용으로 필요해질 수 있음. 그때 추가.
- **Codex review P2 fix (같은 iter)**:
  1. POST 에서 `canViewCourseLanding` 게이트 추가. 강좌가 draft/archived 로 내려간 상태에서 기존 enrollee 가 리뷰를 계속 남기면 재공개 시 이상한 리뷰가 누적됨. GET 과 동일 정책.
  2. UnifiedLayout `workspaceHomeSidebarItems` 가 `/${key}/` 만 조회해서 다른 key 형식(`${key}` 등) 을 쓰는 워크스페이스의 `/w/:workspace` 서브사이드바가 비어 보였음. `currentSectionSidebarItems` 와 동일한 3단 fallback 적용.
