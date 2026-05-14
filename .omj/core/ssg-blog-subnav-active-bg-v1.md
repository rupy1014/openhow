---
status: done
created: 2026-05-14
updated: 2026-05-14
iteration: 2
related: ssg-spa-parity-v1.md
scope: [cli]
---

# ssg-blog-subnav-active-bg-v1 — SSG blog sub nav active 배경 정합

## Why

사용자가 SPA/SSG nav 스타일 불일치를 지적했다. 이중 구조 nav 에서 선택된 sub nav 도 main nav 처럼 active background color 가 보여야 한다.

## What

- [done] [validated] SSG blog sidebar 의 `.blog-nav-sub-item--active` 에 `background: var(--active-link-bg)` 를 추가해 선택된 sub nav 도 배경색을 갖게 한다.
- [done] [validated] dark mode active sub nav 도 같은 background token 을 명시해 light/dark 동작을 맞춘다.
- [done] [validated] 추가 감사에서 SSG flat main nav active font-weight 를 SPA `MainNav.css` 와 같은 700 으로 맞춘다.
- [done] [validated] SSG main/sub nav hover 에 SPA 와 같은 `translateX(1px)` 이동 효과를 추가한다.
- [done] [validated] SSG blog sub nav active font-weight 를 SPA `Navigation.css` active link 와 같은 600 으로 맞춘다.

## Not

- SPA `Navigation.css` 변경 없음 — `.nav-link.active` 는 이미 `background: var(--active-link-bg)` 를 적용한다.
- 일반 SSG two-panel `.ssg-sidebar-link.active` 변경 없음 — 이미 active background 를 적용한다.
- nav 데이터 구조, active 판정 로직, 링크 생성 로직 변경 없음.

## Footprint

- `core/packages/cli/src/ssg/ssgStyles.ts` — blog workspace SSG sidebar의 `.blog-nav-sub-item--active` / dark variant 에 active background 추가.
- `core/packages/cli/src/ssg/ssgStyles.ts` — SSG main nav/button/sidebar hover transform, flat main nav active weight, blog sub nav active weight 를 SPA nav CSS 와 정합.

## Learnings

- blog SSG sidebar 는 일반 two-panel `.ssg-sidebar-link.active` 와 별도 CSS 경로(`.blog-nav-sub-item--active`)를 쓰므로 active state 토큰을 각각 확인해야 한다.
- 추가 대조 결과 SPA `Navigation.css` / `MainNav.css` 의 hover 이동 효과와 active font-weight 가 SSG 일부 nav selector 에 누락되어 있었다. 레이아웃 값이 아닌 interaction state 스타일만 좁게 보정했다.
