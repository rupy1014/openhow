---
status: killed
created: 2026-04-13
updated: 2026-04-17
iteration: 1
---

# design-system-foundation — 디자인 시스템 기반 정비

## Why

toss.tech 같은 정돈된 UI는 개별 컴포넌트가 아니라 시맨틱 토큰 + 일관된 스케일에서 나온다. 현재 openhow는 컴포넌트별로 스타일이 산발적이라, 공개 블로그 홈을 만들어도 "정통 테크 블로그 느낌"이 안 나올 위험이 크다. 홈 구현 전에 기반을 잡아야 한다.

## Context

- openhow viewer: React 19 SPA, CSS 파일 직접 사용 (Tailwind 아님)
- toss.tech는 시맨틱 CSS 변수(`--color-semantic-*`) + 커스텀 폰트(Toss Product Sans) + 4px 기반 spacing 사용
- 현재 레이아웃: MainLayout, BlogLayout, BookLayout, AdminLayout — 각각 독립적 CSS
- public-blog-home 의도와 직접 연동 — 이 기반 위에 홈을 빌드

## What

- [ ] 시맨틱 컬러 토큰 체계 (`--color-text-primary`, `--color-bg-default`, `--color-accent` 등 CSS 변수)
- [ ] 타이포그래피 스케일 (제목 h1~h4, 본문, 캡션 — 크기·행간·자간 규칙)
- [ ] 여백 시스템 (4px/8px 기반 spacing scale: `--space-1` ~ `--space-12`)
- [ ] 카드 컴포넌트 표준화 (썸네일 비율, 뱃지 위치, 메타 정보 배치)
- [ ] 다크모드 대응 기반 (시맨틱 변수 + `prefers-color-scheme` 미디어 쿼리)

## Not

- Tailwind 도입 (현재 순수 CSS 체계 유지)
- 전체 기존 UI 리팩토링 (신규 화면부터 적용, 기존 화면은 점진적)
- Storybook 등 별도 도구 도입

## Footprint

(아직 없음 — /omj:build 실행 후 자동 기록)

## Backlog

- [ ] 아이콘 시스템 (SVG 스프라이트 또는 컴포넌트)
- [ ] 반응형 브레이크포인트 표준화
- [ ] 애니메이션/트랜지션 토큰

## Learnings

### 2026-04-13: seed 생성

- **배경**: toss.tech 분석에서 시맨틱 CSS 변수 + 일관된 디자인 스케일이 정돈된 느낌의 핵심임을 확인
- **초기 메모**: public-blog-home 의도의 전제 조건으로 생성. 홈 와이어프레임과 병행하여 토큰 정의 → 홈 구현 시 즉시 적용하는 흐름

### 2026-04-17: killed — 타 intent가 흡수 (absorbed by proxy)

- **사유**: 이 intent의 What 항목들이 실제로 다른 intent에서 실행됨:
  - **시맨틱 토큰 + 다크모드** → `core/unified-layout.md` (done, iter 10) 에서 main.css 전역 CSS 변수 체계로 구현
  - **카드 컴포넌트 표준화** → `public-blog-home.md` Phase 2 (카드/헤더 디자인 리뉴얼) 에서 실행
  - **타이포/여백/블로그 톤** → `blog-workspace-style-polish.md` (building) 에서 bootpay 레퍼런스 기반으로 구현 중
- **결론**: 독립 intent로 유지할 이유 없음. 별도 수행 필요가 아니라 이미 다른 축에서 진행됨
- **학습 자산**: 향후 "디자인 시스템 전면 정비"가 필요해지면 `core/` 하위 신규 intent로 다시 세울 것 (예: `core/design-tokens-v2.md`)
