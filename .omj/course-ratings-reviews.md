---
status: seed
created: 2026-04-17
updated: 2026-04-17
iteration: 1
---

# course-ratings-reviews — 수강생 공개 별점/리뷰 시스템

## Why

openhow가 유료 강좌 판매 플랫폼이 되려면 "평균 4.7 (234 리뷰)" 같은 **수강생 평판 시그널**이 랜딩 페이지/카탈로그 카드에 박혀야 한다. 없으면 신뢰 부족으로 구매 전환이 안 일어난다. 핵심은 **결제+학습한 진짜 수강생**이 남기는 공개 리뷰지, 운영자/에디터의 내부 품질 평가가 아니다. (현재 `AdminReviews.tsx` + `/api/reviews/...` 는 에디토리얼 칸반 — 혼동 주의)

## Context

- **혼동 주의 — 기존 리뷰와 구분**:
  - `AdminReviews.tsx` + `reviewScore` API = **내부 에디토리얼 품질 워크플로우** (draft → review → approved → deprecated 칸반, 운영자용)
  - 본 intent는 **공개 수강생 리뷰** — 완전히 다른 도메인. 별도 테이블/엔드포인트 필요 (예: `courseReview` 또는 `publicReview`)
  - 네이밍 충돌 방지: 테이블명 신중 선택, API path `/api/course-reviews/...` 같은 분리
- **부모/자매 의도**:
  - `instructor-profile-page.md` (seed) — 강사 평균 평점 데이터 소비자
  - `series-catalog.md` (seed) — 카탈로그 카드 평점 뱃지 소비자
  - `creator-platform.md` (done) — UGC 발행자 정책과 톤 일치 (에디터 모더레이션 가능)
- **권한 정책 (초안)**:
  - 작성 자격: Bootpay 결제 완료 + 최소 1개 레슨 완료 유저 (스팸 방지)
  - 익명 금지 — 실명/유저네임 노출 (신뢰 유지)
  - 무료 강좌의 경우: enrollment 기록 있으면 작성 가능 (기준 분리 필요)
- **데이터 모델 초안**:
  - `courseReview (id, courseId/workspaceId, userId, score 1-5, text, status: pending|approved|hidden, createdAt, updatedAt)`
  - 집계 뷰: `workspace_rating_summary (workspaceId, avgScore, reviewCount, distribution)`
- **모더레이션**: Admin에서 신고 처리 / 부적절 리뷰 숨김. `creator-platform` 에디터 큐레이션 톤과 일치.
- **UX 노출 지점**:
  - `CourseLanding.tsx` — 상단 평점 summary + 하단 리뷰 목록
  - 시리즈 카탈로그 카드 — 작은 별점 뱃지
  - 강사 프로필 — 전체 평균 집계

## What

- [hypothesis] **Phase 0 UX** — 작성 폼(별점 + 텍스트) / 목록 컴포넌트 / CourseLanding 평점 summary / 카드 평점 뱃지 와이어 → **metric: 와이어 1장 + 사용자 OK**
- [hypothesis] **DB 스키마 + 마이그레이션** — `courseReview` 테이블 + 집계 뷰 or 실시간 집계. 기존 에디토리얼 리뷰와 네이밍 완전 분리 → **metric: `drizzle migrate` 통과 + 기존 리뷰 영향 0**
- [hypothesis] **API 엔드포인트** — `POST /api/course-reviews` (작성), `GET /api/course-reviews?workspaceId=...` (목록), 권한 검증 포함 → **metric: 결제 안 한 유저 401, 결제한 유저 생성 성공**
- [hypothesis] **작성 권한 검증** — Bootpay 결제 완료 확인 + (course 타입일 때) 최소 1개 레슨 완료 체크. 무료 워크스페이스는 enrollment 기록만 확인 → **metric: 미결제 유저는 작성 UI 자체 안 뜸**
- [hypothesis] **CourseLanding 평점 summary** — 평균 별점 (1 decimal) + 분포 막대 + 총 리뷰 수. 랜딩 상단 hero 밑에 노출 → **metric: 리뷰 있는 강좌는 summary 표시, 없으면 "첫 리뷰가 되어주세요" CTA**
- [hypothesis] **리뷰 목록 컴포넌트** — 평점순/최신순 토글, 페이징. 작성자 이름/날짜/별점/본문 → **metric: 50+ 리뷰에서도 초기 렌더 10개 + 더보기**
- [hypothesis] **Admin 모더레이션 UI** — 신고 목록 + 숨김/복구. `AdminComments` 패턴과 유사 → **metric: 운영자가 신고된 리뷰를 한 화면에서 처리**
- [hypothesis] **강사 프로필 집계 노출** — `instructor-profile-page` 의 평균 평점 배지 데이터 공급자. API: `GET /api/users/{username}/rating-summary` → **metric: 강사 페이지에 전체 강좌 평균 노출**

## Not

- **익명 리뷰** (신뢰 저하 — 실명/유저네임 강제)
- **무결제 리뷰** (스팸 위험 — Bootpay 기록 필수)
- **강사 답글** (Backlog — 기본 플로우 먼저)
- **이미지/영상 첨부** (Backlog — 텍스트 우선)
- **평점 가중치 알고리즘** (초기엔 단순 평균)
- **AdminReviews.tsx 칸반 변경** (내부 에디토리얼과 분리 유지)

## Footprint

(None yet — auto-recorded after /omj:build)

## Backlog

- 강사 답글 ("이 리뷰에 대한 강사의 생각")
- "이 리뷰가 도움됐어요" 투표
- 완주 후 리뷰 작성 자동 리마인더 이메일
- 리뷰 이미지/영상 첨부
- 리뷰 가중치 (최신/완주도 반영)
- 리뷰 수집 전용 알림 시스템

## Learnings

### 2026-04-17: seed 생성 (iteration 1)

- **Background**: "이러닝 구성요소 종합 검토" 중 가장 임팩트 큰 갭으로 식별. "만들었으면 팔아라" 관점에서 **판매 전환 직결** 피처.
- **핵심 발견 — 혼동 지점**: `AdminReviews.tsx` 가 이미 있어서 "리뷰 있다"로 오해 가능. 실제로는 **내부 에디토리얼 워크플로우(draft/review/approved 칸반)** 로 수강생 공개 리뷰와 완전히 다른 도메인. Context에 혼동 주의 명시.
- **Initial notes**:
  - 테이블/엔드포인트 네이밍 — `review` 는 이미 에디토리얼이 쓰고 있음 → `courseReview` 또는 `publicReview` 권장
  - 결제 검증 로직이 핵심 블로커 — Bootpay enrollment 조회 함수 재사용 가능한지 확인
