---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
parent: creator-saas-storyboard
loop:
  until: judge
---

# header-marketing-nav-v1 — AppShell 헤더에 marketing nav 슬롯 (Pricing/Platform/Features/Enterprise)

## Why

`creator-saas-storyboard` frame 1 (CreatorSaasHome) + frame 2 (Pricing) 빌드 후 사용자 발화: *"왜 상단에 서브페이지들은 없어? 헤더에?"*. mockup (`references/stitch-storyboard/frame-1-landing.html`, `frame-2-pricing.html`) 의 fixed top nav 에 Pricing / Platform / Features / Enterprise 4 링크가 있는데 본 repo `AppShell` 헤더는 brand + search + actions 3 슬롯만 제공해 marketing 링크가 들어갈 자리가 없다.

본 intent 는 AppShell 에 `centerNav` 옵션 슬롯을 추가하고 비로그인 + 마케팅 라우트(`/`, `/pricing`)에서만 4 링크를 노출한다. 다른 surface (workspace/dashboard/doc 등) 는 영향 없음.

## What

- [done] **iter 1**: `AppShell.tsx` 에 `centerNav?: ReactNode` prop 추가 + 헤더 grid 4 col 분기, `AppShell.css` 에 nav 스타일 (active border-bottom, primary color, hover) + responsive (md 미만 hide), `UnifiedLayout.tsx` 에 `marketingNav` useMemo (비로그인 + home/pricing 라우트 조건) 추가 후 AppShell 에 전달. Platform/Features/Enterprise 는 `#platform` 등 placeholder anchor (실제 라우트 없음). → **metric**: 본 변경 3 파일 typecheck 무결, token 검증 통과. 전체 빌드는 별도 untracked `LessonCard.tsx` 의 `CourseTag` 미정의 에러로 실패 — 본 iter 무관 (Backlog 분리).
- [planned] **iter 2** (선택): Platform/Features/Enterprise 실제 페이지 시드 → **metric**: 3 라우트 + 정적 LP 컴포넌트
- [planned] **iter 3** (선택): 모바일 hamburger 안에 marketing nav 항목 포함 → **metric**: 768px 미만에서 mobile menu 열면 nav 4 링크 가시

## Not

- **Platform/Features/Enterprise 페이지 신규 생성** — 본 iter 범위 밖. 4 링크 중 3 개는 `#` placeholder anchor.
- **router.tsx 변경** — 새 라우트 추가 없음.
- **로그인 후 헤더 변경** — 비로그인 한정. 로그인 후엔 marketing nav 숨김.
- **Mobile menu 통합** — iter 3 backlog. 본 iter 는 768px 이하에서 단순 hide.
- **Brand link 변경** — 기존 `homeLink` 그대로.
- **검색/actions 슬롯 동작 변경** — 동일.

## Context

**현재 AppShell.tsx 헤더 구조** (`core/packages/viewer/src/layouts/AppShell.tsx:264-328`):
- `<header className="app-shell-header">` sticky top, backdrop-blur, border-bottom
- inner `grid-template-columns: minmax(0, 1fr) minmax(200px, 420px) minmax(0, 1fr)` (3 col)
- 1열: brand (`app-shell-header-brand`) — mobile menu btn + `brandContent` + theme toggle
- 2열: search (`app-shell-header-search`) — pill 검색창
- 3열: actions (`app-shell-header-actions`) — Manage / Sign In / avatar

**Mockup 의 marketing nav** (frame-2-pricing.html:161-166):
```html
<a class="text-blue-600 font-bold border-b-2 border-blue-600 pb-1" href="#">Pricing</a> <!-- active -->
<a class="text-slate-600 hover:text-slate-900" href="#">Platform</a>
<a class="text-slate-600 hover:text-slate-900" href="#">Features</a>
<a class="text-slate-600 hover:text-slate-900" href="#">Enterprise</a>
```
gap-6, 768px 미만에서 hide (`hidden md:flex`).

**UnifiedLayout `routeName` 분기** (`UnifiedLayout.tsx:85-103`): 'home' / 'pricing' / 'login' / 'workspace-*' / 'doc' 등 분류. 본 intent 의 marketing nav 는 `routeName === 'home' || routeName === 'pricing'` AND `!authIsLoggedIn` 조건.

**UnifiedLayout `customWorkspace` 케이스**: `__CUSTOM_WORKSPACE__` 가 있으면 RootLayout 이 워크스페이스 경로로 라우팅 — 이 경우 home/pricing 이 의미가 없으니 marketing nav 도 숨김.

## Footprint

- `core/packages/viewer/src/layouts/AppShell.tsx` — +11 LOC (344 → 355). `centerNav?: ReactNode` prop 추가, JSX 에 brand 와 search 사이 `<nav className="app-shell-header-center-nav" aria-label="Marketing navigation">` 분기 렌더 (truthy 일 때만). Inner grid 클래스에 `app-shell-header-inner--with-center-nav` 토글.
- `core/packages/viewer/src/layouts/AppShell.css` — +58 LOC (398 → 456). `.app-shell-header-inner--with-center-nav` grid 4 col 분기, `.app-shell-header-center-nav` (flex gap 1.5rem), `.app-shell-header-nav-link` (active 시 `::after` border-bottom, primary 색), `@media (max-width: 1023px)` 에서 hide.
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` — +35 LOC (670 → 705). `marketingNav` useMemo (`!authIsLoggedIn && !customWorkspace && (routeName === 'home' || routeName === 'pricing')` 게이트, 4 nav item: Pricing route + Platform/Features/Enterprise placeholder), AppShell 에 `centerNav={marketingNav}` 전달.

## Backlog

- [ ] **untracked `LessonCard.tsx` cleanup** — `CourseTag` 미정의로 `pnpm build` 차단 중. 이전 `lesson-card-system-v1` wedge 의 미커밋 산출물로 추정. 별도 정리 intent 필요.
- [ ] iter 2 — Platform/Features/Enterprise 라우트 + LP 컴포넌트 신규 생성
- [ ] iter 3 — Mobile menu 안에 marketing nav 통합
- [ ] 한국어/영문 카피 토글 (locale 연동)
- [ ] 다른 비로그인 마케팅 surface 추가 시 routeName 화이트리스트 확장

## Learnings

### 2026-04-30: iter 1 build done [done]

- **결과**: Codex 정확히 3 파일만 수정. AppShell.tsx +11 LOC, AppShell.css +58 LOC, UnifiedLayout.tsx +35 LOC. token 검증 통과 (`centerNav`, `marketingNav`, `app-shell-header-center-nav`, `app-shell-header-nav-link--active::after` 모두 주입). 본 변경 3 파일 typecheck 자체는 무결.
- **빌드 실패는 본 iter 무관**: `pnpm --filter @openhow/viewer exec tsc --noEmit` 단일 에러 — `src/components/LessonCard.tsx(3,15): "@openhow/types" has no exported member named 'CourseTag'`. `LessonCard.tsx` 는 git untracked + mtime 1777515266 (본 iter pre-run baseline 1777526030 보다 약 3시간 이전). 이전 `lesson-card-system-v1` wedge 의 미커밋 산출물로 보임 — `@openhow/types` 가 `CourseTag` 를 export 하지 않아 깨진 상태가 본 wedge 시작 전부터 존재. Backlog 첫 항목으로 cleanup 분리.
- **AppShell 슬롯 vs 페이지-로컬 nav**: 두 옵션 (centerNav slot 추가 vs CreatorSaasHome/Pricing 자체 nav bar) 중 slot 방식 채택. 이유: (a) 헤더 search/actions 가 AppShell 의 다른 페이지에서 일관적으로 동작해야 하므로 페이지-로컬 nav 는 두 헤더가 겹치는 케이스 발생 (b) 마케팅 페이지 추가 시 `routeName === '...'` 라인 한 줄 추가만으로 확장 가능. tradeoff 는 `AppShell` 이 marketing 도메인 개념(Pricing 링크 위치)을 알게 된다는 점이지만, prop 으로 ReactNode 를 받기만 하므로 결합도는 낮다.
- **Active 표시 전략**: `Pricing` 만 실제 라우트 (`/pricing`) 라 `location.pathname === '/pricing'` 으로 active 판정. Platform/Features/Enterprise 는 `#anchor` placeholder + `onClick={(e) => e.preventDefault()}` 로 클릭 시 안전하게 무동작. 실제 페이지 시드(iter 2) 시점에 `kind: 'placeholder'` → `'route'` 전환만 하면 됨.
- **반응형 분기점**: 1023px 미만에서 nav hide. 모바일 hamburger 통합은 iter 3 backlog. mockup 의 `hidden md:flex` (768px) 보다 살짝 위로 잡은 이유: search 칸 (200~420px) + nav (4 링크 ≈ 240px) + actions (Sign In btn) 가 1023px 부근에서 겹치기 시작.
- **storyboard 외 wedge**: 이 intent 는 storyboard 6 frame 이 아닌 frame-1/2 build 후 사용자 발화에서 나온 후속 wedge. ralph 자율 반복 종료 ([done] 태그).
