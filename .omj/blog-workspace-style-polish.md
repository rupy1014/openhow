---
status: building
created: 2026-04-16
updated: 2026-04-16
iteration: 1
---

# blog-workspace-style-polish — blog 타입 워크스페이스 serve/publish 스타일 완성도 개선

## Why

bootpay 채널처럼 `openhow serve`/`publish`로 블로그 워크스페이스를 렌더링하면 nav, 디테일, 타이포그래피 등 디자인 완성도가 높아야 한다. 현재 BlogLayout(SPA)과 SSG 스타일이 bootpay 레퍼런스 대비 nav 구조, 아티클 디테일, 컨테이너 스타일 등에서 갭이 있다.

## What

- [x] ~~**Phase 0: UX 스토리보드**~~ — 유저 요청으로 스킵
- [x] **Nav 개선** — active state indicator(좌측 2px 바) 추가, nav item 스타일 SSG와 동기화 → **metric: nav가 bootpay와 동일한 시각적 완성도**
- [ ] **아티클 디테일 페이지** — hero 이미지 처리(border-radius 16px, gradient overlay), kicker badge(카테고리), description box(gray bg + radius), 메타 정보 스타일 → **metric: 아티클 상세가 블로그 수준의 디테일**
- [ ] **콘텐츠 스타일** — blockquote(좌측 3px border + bg), 코드블록(copy 버튼), 테이블(모바일 스크롤), 링크(underline offset + primary color), 이미지(12px radius + margin) → **metric: 마크다운 렌더링 품질이 bootpay와 동등**
- [ ] **컨테이너/알림** — info/tip/warning/danger/success 컨테이너 스타일(좌측 4px 컬러 border + gradient bg + pill badge 헤더) → **metric: 문서 내 callout이 시각적으로 구분됨**
- [x] **헤더 정밀화** — 검색 focus-within에 primary border 추가 → **metric: 헤더가 모던 블로그 수준**
- [x] **SPA ↔ SSG 스타일 동기화** — ssgStyles.ts nav item 값을 SPA와 일치시킴 (padding, font-size, font-weight, border-radius, gap, min-height, color) + 검색 focus border 동기화 → **metric: serve와 publish 결과물이 시각적으로 동일**

## Not

- 새로운 디자인 시스템 토큰 도입 (design-system-foundation 의도 범위)
- Tailwind 도입
- 레이아웃 구조 변경 (기존 BlogLayout 골격 유지)
- public-blog-home 랜딩 페이지 수정 (별도 의도)
- 기능 추가 (검색 로직, 라우팅 등) — 순수 스타일 개선만

## Context

- 레퍼런스: `/Users/taesupyoon/sideProjects/YouTube/channels/bootpay/` — blog 타입, `openhow serve`/`publish` 둘 다 스타일 완성도 높음
- SPA: `core/packages/viewer/src/layouts/BlogLayout.tsx` + `BlogLayout.css` (573줄)
- SSG: `core/packages/cli/src/ssg/ssgStyles.ts` (3362줄) — publish 시 사용
- 디자인 토큰: `core/packages/viewer/src/styles/main.css` — CSS 변수 정의
- bootpay 핵심 차별점: primary #507cf3, Toss Product Sans 폰트, 4px spacing, active nav에 좌측 2px bar, hero 이미지 gradient overlay, kicker badge, description box, 컨테이너 좌측 컬러 border + gradient bg
- bootpay SSG CSS: `dist/assets/css/ssg.css` (3361줄) — 최종 렌더링 결과

## Footprint

- core/packages/viewer/src/layouts/BlogLayout.css — nav active left bar indicator 추가, search focus primary border (2026-04-16)
- core/packages/cli/src/ssg/ssgStyles.ts — nav item 값 SPA 동기화 (padding, font-size, font-weight, border-radius, gap, min-height, color), search focus border (2026-04-16)

## Backlog

- [ ] 푸터 커스텀 스타일 개선
- [ ] 모바일 사이드바 스와이프 제스처
- [ ] 접근성 개선 (ARIA, focus indicator)

## Learnings

### 2026-04-16: seed created (iteration 1)
- **Background**: bootpay 채널이 openhow serve/publish 모두에서 높은 스타일 완성도를 보여주는 레퍼런스. 새 블로그 워크스페이스를 만들어도 같은 수준이 나와야 함.
- **Initial notes**:
  - bootpay의 핵심 디자인 요소: active nav의 좌측 2px primary bar, hero gradient overlay, kicker badge(pill shape), description box(gray bg + 16px radius), 컨테이너(좌측 4px 컬러 border + gradient bg + pill badge)
  - SPA(BlogLayout.css)와 SSG(ssgStyles.ts) 두 곳을 동시에 수정해야 serve/publish 일관성 유지
  - 기존 CSS 변수 체계(--primary-color, --gray-* 등)는 이미 존재하므로, 값 조정보다 스타일 규칙 추가/정밀화가 핵심
  - bootpay SSG가 3361줄 → 이미 상당한 스타일이 존재하지만, 이것이 core에 반영되어야 모든 블로그 워크스페이스에 적용됨

### 2026-04-16: /omj:build Nav + 헤더 + SPA↔SSG 동기화
- **시도**: BlogLayout.css에 active nav left bar indicator 추가 + ssgStyles.ts nav 값 SPA 동기화
- **결과**: 2파일 변경 (BlogLayout.css +36줄, ssgStyles.ts 8값 수정). Codex scope creep 6파일 → 즉시 롤백.
- **배운 것**:
  - 분석 결과 blog-detail/콘텐츠/컨테이너 스타일(DocPage.css 1687줄)은 이미 bootpay 수준 — 추가 작업 불필요
  - 핵심 갭은 nav active indicator(::before 2px left bar)와 SPA↔SSG 값 불일치였음
  - Codex가 CSS만 수정하라고 해도 TypeScript/Router/Config까지 건드림 — MUST NOT에 파일 경로를 명시적으로 나열해야 효과적
  - SSG→SPA 동기화 방향보다 SPA→SSG 동기화가 맞음 (SPA가 디자인 source of truth)
- **의도 변경**: Phase 0(스토리보드) 스킵, Nav/헤더/SPA↔SSG 동기화 완료. 아티클 디테일/콘텐츠/컨테이너는 이미 완료 상태로 확인됨
