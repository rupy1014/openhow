---
status: seed
created: 2026-04-17
updated: 2026-04-17
iteration: 1
---

# instructor-profile-page — `/s/{username}` 강사(작가) 프로필 + 신뢰 시그널

## Why

openhow는 "만들었으면 팔아라" 크리에이터 수익화 플랫폼. 유료 강좌/콘텐츠 판매가 성립하려면 **강사 신뢰 시그널**(누가 만들었는지 / 얼마나 가르쳤는지 / 평판이 어떤지)이 판매 전환의 결정적 변수다. `creator-platform` 의도에서 `/s/{username}` 라우트가 `done` 으로 마킹됐지만 실제 라우트/컴포넌트는 구현 안 됨 — 그 갭을 채우고, 추가로 신뢰 배지(총 수강생 / 평균 평점 / 커리큘럼 수)를 얹어 판매 전환 래퍼 역할까지 한다.

## Context

- **부모 의도 (재정리)**:
  - `creator-platform.md` (done) — `/s/{username}` 은 What에 포함됐으나 실제 라우트/페이지 없음. 이 intent가 **미완 부분 승계 + 확장** 역할.
  - `series-catalog.md` (seed) — 카탈로그 카드에서 작가명 클릭 시 이 프로필로 진입
  - `course-ratings-reviews.md` (seed) — 평점/수강생 수 데이터 제공자
- **현재 코드 상태**:
  - `router.tsx` 에 `/s/:username` 라우트 **없음**
  - `UserProfile` / `AuthorPage` / `InstructorPage` 컴포넌트 **전무**
  - `user.username` 컬럼 존재 여부 불명 — `creator-platform` What에 "user 스키마 확장(username 유니크)" 있음, 실제 마이그레이션 확인 필요
- **데이터 의존**:
  - 수강생 수 집계 = Bootpay 결제 완료 + 추후 enrollment 테이블
  - 평균 평점 집계 = `course-ratings-reviews` 의 공개 리뷰 테이블 (AdminReviews 내부 에디토리얼 스코어와 다름)
  - 커리큘럼 수 = `workspace where ownerId = user.id and isPublic = true`
- **라우팅 관례**: `/d/{ws}/{slug}`, `/w/{ws}` 와 자매 축으로 `/s/{username}` — creator-platform에서 이미 합의됨
- **SEO**: 작가명 검색 유입 채널 — SSG/메타태그 필요 (OG 이미지 포함)

## What

- [hypothesis] **Phase 0 UX 스토리보드** — 헤더(아바타/이름/bio) → 신뢰 배지 3종 → 커리큘럼 카드 그리드 → 최근 글 → 구독 CTA. 모바일 1컬럼, 데스크톱 2컬럼. → **metric: 와이어 1장 + 사용자 OK**
- [hypothesis] **`/s/:username` 라우트 + SSR 메타** — 404 처리, Open Graph 메타, sitemap 등록 → **metric: `/s/rupy1014` 접근 시 프로필 렌더 + 검색엔진 크롤 가능**
- [hypothesis] **user 스키마 username 유니크 확정** — `creator-platform` 미완 부분 승계. 마이그레이션 + 기존 유저 백필(기본값: email prefix) → **metric: 모든 public workspace 소유자에게 username 할당됨**
- [hypothesis] **강사 신뢰 배지 3종** — 총 수강생 수 / 평균 평점 / 누적 커리큘럼 수. 데이터 없으면 개별 뱃지 자동 숨김 → **metric: 데이터 있는 강사는 3종 모두, 신규 강사는 아무것도 노출 안 됨**
- [hypothesis] **커리큘럼 카드 그리드** — 강사의 공개 워크스페이스 목록. 강좌(course+paid) 우선, 블로그/위키 후순위. 카드 = 썸네일/제목/강좌 뱃지/평점 → **metric: 한 강사의 모든 공개 워크스페이스 노출**
- [hypothesis] **구독 버튼** — `creator-platform` 구독 모델 연동. 구독 후 새 글 발행 시 이메일 알림 (creator-platform의 이메일 What이 담당) → **metric: 구독/해지 토글 + 구독자 수 표시**
- [hypothesis] **프로필 편집 UX** — 계정 설정 페이지에서 username/avatar/bio 수정. username은 초기 설정 후 제한 (월 1회 변경 또는 불변) → **metric: 작가가 세팅에서 프로필 완성 가능**

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

- **Background**: "이러닝 구성요소 종합 검토" 요청 중, `creator-platform` 이 `done` 인데 `/s/{username}` 실구현이 안 돼 있음을 발견. creator-platform에서 What을 재진입시키기보다 **신뢰 시그널까지 포함한 실행 intent**로 분리하는 게 낫다고 판단.
- **Initial notes**:
  - 신뢰 배지가 creator-platform 원안에는 없었음 — 이번 검토에서 추가
  - 평점 데이터는 `course-ratings-reviews` 의존 — 의도 간 의존 순서 주의 (ratings 먼저 또는 배지 placeholder부터)
  - username 유니크 컬럼이 최대 블로커 — 가장 먼저 확정해야 다른 What이 진행 가능
