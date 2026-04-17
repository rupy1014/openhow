---
status: seed
created: 2026-04-17
updated: 2026-04-17
iteration: 1
---

# learner-progress — 수강 진도 시각화 + 완주 수료 마커

## Why

유료 강좌를 판 다음 **완주율**이 지속 수익(환불 방지 + 재구매 + 리뷰 작성)의 핵심이다. `LessonPlayer.tsx` 로 레슨 재생은 되지만 "지금 몇 % 진행, 뭐가 남았는지"를 수강생이 한눈에 못 봐서 중도 이탈이 쉽다. 진도 바 + 완주 수료 마커로 학습 동기를 붙여야 한다. 우선순위는 `instructor-profile-page` / `course-ratings-reviews` 보다 낮음 — 판매 전환이 먼저, 완주율은 그다음.

## Context

- **기존 코드**:
  - `LessonPlayer.tsx` (273줄) — 레슨 재생 존재
  - `CourseLanding.tsx` (387줄) — 강좌 랜딩
  - `BookLayout` — 챕터/섹션 네비게이션
- **데이터 모델 (확인 필요)**:
  - `userLessonProgress (userId, lessonId, completed, watchedSec, updatedAt)` 테이블 존재 여부 불명 → 스키마 감사 먼저
  - 없으면 신규 추가, 있으면 필드 확장
- **자매 의도**:
  - `course-ratings-reviews.md` (seed) — 완주 시 리뷰 작성 유도 트리거 제공자/소비자
  - `instructor-profile-page.md` (seed) — 강사 프로필에 "완주자 N명" 표기 가능성 (Backlog)
- **완주 트리거 정의 (초안)**:
  - 레슨 단위: 시청 시간 80%+ 또는 스크롤 끝 도달 → 자동 완료
  - 강좌 단위: 모든 레슨 완료 → 수료 상태
- **수료 인증 범위**:
  - v1: 페이지 내 배지 + 공유용 이미지 (SVG/PNG)
  - v2(Backlog): 정식 PDF 수료증 / 법적 효력
- **우선순위 명시**: 이 intent는 Backlog 후보 — `instructor-profile-page` 와 `course-ratings-reviews` 선행 후 착수. 판매가 먼저 일어나야 완주 논의가 의미 있음.

## What

- [hypothesis] **Phase 0 UX** — 강좌 페이지 상단 진도 바(30%) + 레슨 목록 체크마크 + 완주 시 수료 배지 와이어 → **metric: 와이어 1장 + 사용자 OK**
- [hypothesis] **DB 스키마 감사/확장** — `userLessonProgress` 확인, 없으면 마이그레이션. 인덱스: (userId, lessonId) 유니크 → **metric: 스키마 감사 리포트 + 필요 시 마이그레이션 통과**
- [hypothesis] **LessonPlayer 완료 트리거 확장** — 시청 80% 자동 완료 + "완료 표시" 수동 버튼 → **metric: 재생 완료 시 progress 레코드 생성/업데이트**
- [hypothesis] **레슨 목록 체크마크** — BookLayout 사이드바에 완료 레슨 ✓ 표시 → **metric: 로그인 유저는 본인 진도 반영, 비로그인 빈 상태**
- [hypothesis] **강좌 카드 내 진도 뱃지** — 시리즈 카탈로그/내 강좌 카드에 "내 진도: 3/10" 또는 "진행률 30%" 표기 → **metric: 로그인 유저 카드에 뱃지, 비로그인 미표기**
- [hypothesis] **완주 수료 UI** — 모든 레슨 완료 시 모달/페이지에 배지 + 공유 이미지 다운로드 → **metric: 완주 시 수료 배지 자동 부여, 중복 방지**
- [hypothesis] **내 수강 대시보드** — `/me/learning` 페이지 (진행 중 / 완주 / 미시작 섹션) → **metric: 로그인 유저가 본인 수강 이력 한 화면에서 파악**

## Not

- **정식 PDF 수료증 + 법적 효력** (Backlog — v2)
- **학습 시간 통계 대시보드** (분/시간 누적 — Backlog)
- **오프라인 학습 동기화** (모바일 앱 필요 — 범위 외)
- **레슨별 퀴즈/과제** (Backlog — 별도 intent 가능성)
- **강사가 수강생 진도 추적** (프라이버시 검토 필요 — Backlog)

## Footprint

(None yet — auto-recorded after /omj:build)

## Backlog

- 퀴즈/과제 시스템 (레슨별 검증)
- 학습 스트릭 (연속 학습일)
- 완주자 공개 랭킹
- 강사용 수강생 진도 대시보드 (프라이버시 정책 포함)
- 정식 PDF 수료증
- 학습 시간 통계 (주간/월간)
- 진도 기반 추천 ("다음 레슨은 이거")

## Learnings

### 2026-04-17: seed 생성 (iteration 1)

- **Background**: "이러닝 구성요소 종합 검토" 중 파생. 판매 전환(instructor-profile-page + course-ratings-reviews)을 앞에 두고 완주율 개선은 후순위로 배치.
- **Initial notes**:
  - 스키마 감사가 첫 블로커 — `userLessonProgress` 존재 여부 모름
  - 수료 기준 정의가 애매 — 레슨 80% vs 100% 재생? 최소 스크롤? → 사용자 결정 필요
  - 우선순위 표기 중요 — 다른 두 intent 완료 전까진 Backlog처럼 다룸
