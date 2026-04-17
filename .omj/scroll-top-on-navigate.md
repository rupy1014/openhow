---
status: done
created: 2026-04-13
updated: 2026-04-13
iteration: 1
---

# 페이지 이동 시 스크롤 위치 초기화

## Why
SPA에서 A 페이지 하단에서 B 페이지로 이동하면 스크롤이 top 0으로 안 돌아가고 하단 그대로 유지되어 UX가 어색하다. serve(개발)와 publish(배포) 양쪽 모두 동일 증상.

## What
- [ ] 페이지(route) 전환 시 자동으로 scrollTo(0, 0) 처리
- [ ] 브라우저 뒤로가기/앞으로가기 시에는 이전 스크롤 위치 복원 (네이티브 동작 유지)

## Not
(탐색하면서 채운다)

## Context
- React 19 SPA, `react-router` v7의 `BrowserRouter` 사용 (`core/packages/viewer/src/main.tsx`)
- 현재 `ScrollRestoration` 컴포넌트나 scroll-to-top 훅이 전혀 없음
- 레이아웃: `MainLayout`, `AdminLayout`, `BookLayout`, `BlogLayout` — 모두 `<Outlet>` 사용
- 스크롤 컨테이너가 `window`인지 특정 div인지 확인 필요 (레이아웃별 다를 수 있음)

## Footprint
- core/packages/viewer/src/hooks/useScrollToTop.ts — 신규 훅 (2026-04-13)
- core/packages/viewer/src/layouts/MainLayout.tsx — mainContentRef + useScrollToTop 적용 (2026-04-13)
- core/packages/viewer/src/layouts/AdminLayout.tsx — adminContentRef + useScrollToTop 적용 (2026-04-13)
- core/packages/viewer/src/layouts/BookLayout.tsx — bookContentRef + useScrollToTop 적용 (2026-04-13)
- core/packages/viewer/src/layouts/BlogLayout.tsx — blogMainRef + useScrollToTop 적용 (2026-04-13)

## Backlog
(아직 없음)

## Learnings

### 2026-04-13: scroll-to-top 구현
- **시도**: useScrollToTop 훅 생성 → 4개 레이아웃 스크롤 컨테이너에 ref 연결
- **결과**: Vite 빌드 성공. window.scrollTo가 아닌 레이아웃별 overflow-y:auto 컨테이너에 scrollTo 적용
- **배운 것**:
  - 이 프로젝트의 스크롤 컨테이너는 window가 아니라 레이아웃별 main/div 요소 (.main-content, .admin-content, .book-content-area, .blog-main)
  - react-router v7의 useNavigationType()으로 POP(뒤로가기/앞으로가기) 감지 → 스크롤 복원 유지
