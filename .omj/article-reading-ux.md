---
status: seed
created: 2026-04-13
updated: 2026-04-22
iteration: 2
---

# article-reading-ux — 아티클 읽기 경험 고도화 (잔여 스코프)

## Why

공개 블로그 홈으로 유입된 독자가 아티클을 읽을 때, 읽기 경험이 좋아야 체류 시간이 늘고 다른 글로 이어진다. 초기 seed 이후 다수 항목이 다른 intent에서 실행되었고(아래 Context 참고), **본 intent는 잔여 항목(피드백 위젯 / 공유 버튼 / TOC 사이드바 감사)** 만 다룬다.

## Context

### 이 intent 스코프 재정의 (2026-04-17)

초기 What 6개 중 3개가 이미 실행됐거나 다른 intent로 분할됨:

| 원래 What | 현재 상태 |
|-----------|----------|
| 스크롤 프로그레스 바 | ✅ `ReadingProgressBar.tsx` 이미 구현됨 |
| 관련 글 추천 | → `article-closing-blocks.md` (building, iter 2) 로 이관 — 저자 기입 경로 |
| 시리즈 네비게이션 | → `series-catalog.md` (seed) 및 BookLayout 기본 동작과 중첩 — 별도 실행 불필요 |
| 아티클 TOC 사이드바 | 🔍 감사 필요 — MainLayout에 있으나 BlogLayout 적용 여부 확인 |
| 피드백 위젯 | ❌ 미구현 — 잔여 스코프 |
| 공유 버튼 | ❌ 미구현 — 잔여 스코프 |

### 인프라

- 아티클 뷰어: DocPage.tsx → Plate.js 기반 렌더링
- 레이아웃: BlogLayout(블로그), BookLayout(북/코스) — 읽기 맥락이 다름
- 댓글: CommentsSection 컴포넌트 이미 구현 완료
- sequential 워크스페이스: 이전/다음 네비게이션이 자연스러운 구조

## What

- [superseded] ~~**아티클 TOC 사이드바 감사**~~ — `core/article-image-sidecar` 가 우측 aside 슬롯을 이미지 패널로 전환하기로 결정됨 (2026-04-22). TOC 자체를 제거하는 방향이라 본 항목은 실행 대상 아님
- [hypothesis] **피드백 위젯** — 글 하단 "도움이 되었나요?" 👍/👎 반응 수집. 간단한 카운터 저장 → **metric: 반응 기록되고 집계값이 어드민에 표시**
- [hypothesis] **공유 버튼** — URL 복사 / X / 카카오톡. 본문 말미 고정 위치 → **metric: 클릭 시 해당 SNS 공유 또는 URL 복사 완료 토스트**

## Not

- 에디터(Plate.js) 기능 변경 (읽기 전용 뷰만 개선)
- 댓글 시스템 재구현 (기존 CommentsSection 활용)
- BookLayout 변경 (코스/북 레이아웃은 별도)
- 관련 글 추천 (→ `article-closing-blocks.md` 가 담당)
- 시리즈 네비게이션 (→ `series-catalog.md` 및 기존 BookLayout)
- 스크롤 프로그레스 바 (이미 구현됨)

## Footprint
(아직 없음 — /omj:build 실행 후 자동 기록)

## Backlog

- [ ] 읽기 시간 추정 표시 ("약 5분 읽기")
- [ ] 글꼴 크기 조절 위젯
- [ ] ~~하이라이트/북마크 기능~~ → `reader-block-highlight.md` 로 승격 (2026-04-22)
- [ ] 읽기 이력 기반 개인화 추천

## Learnings

### 2026-04-13: seed 생성
- **배경**: toss.tech 분석에서 프로그레스 바, 시리즈 네비게이션, 피드백 위젯 등 읽기 몰입 UX 확인
- **초기 메모**: public-blog-home 완성 후 착수 예정. 홈 → 아티클 동선의 두 번째 터치포인트

### 2026-04-17: 스코프 재정의 (iteration 2)
- **배경**: `.omj/` 전체 감사 중 다수 What이 이미 실행/분할됨을 확인
- **의도 변경**:
  - What 6개 → 3개로 축소 (TOC 감사 / 피드백 위젯 / 공유 버튼)
  - Not에 "이미 실행/타 intent로 이관된 항목" 명시 — 중복 실행 방지
  - iteration 1 → 2 (범위 축소는 스코프 변경이므로 iter++)
- **남은 의의**: kill 대신 재정의 — 피드백 위젯 + 공유 버튼은 여전히 독립 실행 가능한 스코프
