---
status: seed
created: 2026-04-17
updated: 2026-04-17
iteration: 1
---

# instructor-profile-page — `/s/{username}` 강사(작가) 프로필 **신뢰 배지 확장**

## Why

openhow는 "만들었으면 팔아라" 크리에이터 수익화 플랫폼. 유료 강좌/콘텐츠 판매가 성립하려면 **강사 신뢰 시그널**(누가 만들었는지 / 얼마나 가르쳤는지 / 평판이 어떤지)이 판매 전환의 결정적 변수다. `creator-platform` 이 `/s/{username}` 기본 페이지(AuthorProfile.tsx)와 구독 모델을 이미 구현했지만, **판매 전환에 결정적인 신뢰 배지(총 수강생 / 평균 평점 / 커리큘럼 수)** 가 빠져있다. 이 갭을 메워 판매 전환 래퍼 역할까지 한다.

## Context

- **부모 의도 (재정리)**:
  - `creator-platform.md` (done) — `/s/{username}` 기본 프로필 + 구독 + 이메일 발송 완료. `AuthorProfile.tsx` / `authors.ts` / `authorFollow` 테이블 구현됨.
  - `series-catalog.md` (seed) — 카탈로그 카드에서 작가명 클릭 시 이 프로필로 진입
  - `course-ratings-reviews.md` (seed) — 평점/수강생 수 데이터 제공자
- **현재 코드 상태 (2026-04-17 재확인)**:
  - `router.tsx:178` → `/s/:username` 라우트 **존재** ✓
  - `pages/AuthorProfile.tsx` + `AuthorProfile.css` **존재** ✓
  - `user.username` 컬럼 존재 ✓ (migration 0052)
  - **미구현**: 총 수강생 수 / 평균 평점 / 누적 커리큘럼 수 뱃지, 판매 중심 카드 정렬(강좌 우선)
- **데이터 의존**:
  - 수강생 수 집계 = Bootpay 결제 완료 + 추후 enrollment 테이블
  - 평균 평점 집계 = `course-ratings-reviews` 의 공개 리뷰 테이블 (AdminReviews 내부 에디토리얼 스코어와 다름)
  - 커리큘럼 수 = `workspace where ownerId = user.id and isPublic = true`
- **라우팅 관례**: `/d/{ws}/{slug}`, `/w/{ws}` 와 자매 축으로 `/s/{username}` — creator-platform에서 이미 합의됨
- **SEO**: 작가명 검색 유입 채널 — SSG/메타태그 필요 (OG 이미지 포함)

## What

- [hypothesis] **Phase 0 UX 스토리보드** — 기존 AuthorProfile 위에 얹을 신뢰 배지 3종 + 카드 정렬 개편 와이어 → **metric: 와이어 1장 + 사용자 OK**
- [hypothesis] **강사 신뢰 배지 3종** — 총 수강생 수 / 평균 평점 / 누적 커리큘럼 수. 데이터 없으면 개별 뱃지 자동 숨김 → **metric: 데이터 있는 강사는 3종 모두, 신규 강사는 아무것도 노출 안 됨**
- [hypothesis] **커리큘럼 카드 정렬 재구성** — 현재 AuthorProfile의 워크스페이스 목록을 **판매 중심으로 재정렬**: 강좌(course+paid) 최상단, 블로그/위키 후순위. 카드에 평점/수강생 수 배지 → **metric: 한 강사의 강좌가 다른 타입보다 먼저 노출**
- [hypothesis] **집계 API** — `GET /api/users/{username}/trust-summary` : 총 수강생 / 평균 평점 / 커리큘럼 수. `course-ratings-reviews` + Bootpay enrollment 의존 → **metric: 프로필 렌더 시 단일 API 호출로 3종 데이터 수급**
- [hypothesis] **SSR 메타 보강** — 기존 `/s/:username` 페이지의 Open Graph / sitemap 보강 (기본 라우트는 있음) → **metric: 검색엔진이 강사별 페이지 색인**
- [hypothesis] **프로필 편집 UX 감사** — 계정 설정에서 username/avatar/bio 수정 가능 여부 확인. 없으면 추가 → **metric: 작가가 세팅에서 프로필 완성 가능**

## Not

- **강사 랭킹/리더보드** (Backlog — 기초 페이지 완성 후)
- **팔로워 목록 공개 페이지** (Backlog — 프라이버시 영향)
- **실시간 온라인 표시** (SNS 과잉)
- **이메일 발송 자체** (creator-platform의 이메일 What이 담당)
- **커스텀 도메인 강사 프로필** (`nara@openhow.kr` 같은 아이덴티티는 이미 workspace에 있음)

## Footprint

(None yet — auto-recorded after /omj:build)

## Backlog

- 강사 전문성 뱃지 (예: "AX 전문가", 카테고리 기반 자동 부여)
- 강사 간 추천/팔로우 그래프
- 월간 TOP 강사 랭킹
- 강사 페이지 테마 커스텀
- 팔로워 목록 공개/비공개 토글

## Learnings

### 2026-04-17: seed 생성 (iteration 1)

- **Background**: "이러닝 구성요소 종합 검토" 요청 중 신뢰 시그널 갭 식별. 당초엔 "creator-platform /s/{username} 미구현"으로 오판했으나 **재확인 결과 AuthorProfile.tsx + `/s/:username` 라우트 실존** — creator-platform은 기본 페이지까지 완료된 상태. 이 intent는 그 위에 얹는 **신뢰 배지 확장** 으로 재정의.
- **Initial notes**:
  - 신뢰 배지가 creator-platform 원안에는 없었음 — 판매 전환 래퍼 역할로 추가
  - 평점 데이터는 `course-ratings-reviews` 의존 — 의도 간 의존 순서 주의 (ratings 먼저 또는 배지 placeholder부터)
  - 수강생 수 집계는 Bootpay enrollment 조회 로직 재사용 필요
