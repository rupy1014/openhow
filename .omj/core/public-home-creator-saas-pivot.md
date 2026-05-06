---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
parent: creator-saas-storyboard
loop:
  until: judge
---

# public-home-creator-saas-pivot — 5173 비로그인 홈을 creator SaaS LP 로 피봇

## Why

5173 (`pnpm --filter @openhow/viewer dev`) 비로그인 진입 페이지는 현재 `PublicBlogHome` (`/feed` 와 동일) — **블로그 피드** 형태다. 사용자 첫인상이 "뭔가 articles 가 쭉 나열된 사이트" 라서 *"openhow 가 무엇을 파는 SaaS 인지"* 가 보이지 않는다.

`references/stitch-storyboard/frame-1-landing.html` 은 이 surface 의 **확정된 mockup**: Hero (gradient title + 데모 dashboard) → Showcase carousel → KPI band → Product type 4-grid → Solution strip 6-tile → Success stories → Partner logos → Bottom CTA. `creator-saas-storyboard.md:388` 의 execution split 에서 본 intent 가 마지막 단계 ("위 컴포넌트와 사례가 생긴 뒤 세일즈 LP 로 조립") 로 명시돼 있고, lesson-card / creator-store 가 이미 `done` 이라 의존 컴포넌트 (lesson-card-frame) 가 준비됐다.

사용자 발화: *"5173 포트보면 왜 google stich 결과 html 가져온거대로 퍼블리싱 안했어? 지금 ui 구조는 레거시거든. 개선해줘"*. 이게 ralph loop 첫 wedge — 다른 frame (4/6/5/2) 보다 surface impact 가 가장 크다.

## What

- [building] **iter 1**: `CreatorSaasHome` 컴포넌트 + CSS 신규 작성 + `Home.tsx` 의 비로그인 폴백을 `<PublicBlogHome />` → `<CreatorSaasHome />` 로 스왑. 8개 섹션 모두 (Hero / Showcase / KPI / Product 4-grid / Solution / Success / Partners / Bottom CTA) Frame 1 mockup 과 동일 구조. → **metric**: 빌드 통과 + Playwright `localhost:5173/` 비로그인 스크린샷 8개 섹션 모두 가시 + `/feed` 는 PublicBlogHome 으로 그대로 접근 가능
- [planned] **iter 2** (선택): 데이터 소스 연결 — Showcase carousel 을 `/api/feed` workspaces 로 hydrate, KPI 숫자 D1 쿼리 (또는 worker endpoint 신설), Success stories CMS 슬롯 → **metric**: 실제 워크스페이스 5개 카드 + 실제 KPI 3 셀 + 동적 testimonial 3 슬롯
- [planned] **iter 3** (선택): 모바일 / 1280px 미만 viewport 검증 + 다크모드 톤 정리 → **metric**: viewport 375/768/1280/1920 4 사이즈 무회귀

## Not

- **PublicBlogHome 제거** — `/feed` 라우트는 그대로 유지. blog 피드는 살린다 (관심층용 별도 surface).
- **로그인 후 화면** (`WorkspaceHub`) 변경 — 본 intent 범위 밖.
- **워크스페이스 (`workspace/WorkspaceDocs`) 변경** — 본 intent 범위 밖.
- **router.tsx 수정** — `/` → RootIndex 분기 그대로. RootIndex 가 `<Home />` → `<CreatorSaasHome />` 로 흘러들어가는 체인만 갈아끼움.
- **Tailwind 추가** — 프로젝트는 Tailwind 미사용, 모든 스타일은 `.css` 파일 + 기존 CSS 변수 (`--primary-color`, `--bg-color`, `--text-color`, `--surface-base`, `--border-color`, `--gray-*`, `--blue-*`).
- **Material Symbols icon font 추가** — 설치돼 있지 않음. 아이콘은 **inline SVG** 로 작성 (또는 단순 unicode glyph).
- **외부 이미지 fetch** (lh3.googleusercontent.com) — mockup 의 placeholder URL 은 **사용 금지**. 이미지가 필요한 자리는 CSS gradient placeholder + 텍스트로 대체.
- **i18n / 다국어** — 한국어 카피 그대로.

## Context

**상위 intent**:
- `creator-saas-storyboard.md` (status: reviewed, iter 2) — 6개 frame 의 storyboard 합의. 본 intent 는 frame 1 의 surface execution.

**의존 intent (이미 done)**:
- `lesson-card-system-v1.md` (done) — Showcase carousel 카드의 시각 톤 reference.
- `creator-store-redesign-v1.md` (done) — Frame 3 store. 본 intent 는 Frame 1 hero 에서 *"크리에이터 스토어 보기"* 류의 진입을 가리킬 수 있음 (단, 이번 iter 는 정적 카피만).

**현재 페이지 체인**:
1. `core/packages/viewer/src/router.tsx:163-170` — `/` → `<RootIndex />` → `__CUSTOM_WORKSPACE__` 면 `<WorkspaceDocs />`, 아니면 `<Home />`.
2. `core/packages/viewer/src/pages/Home.tsx:9-34` — `isLocalMode → WorkspaceDocs` / `isLoggedIn → WorkspaceHub` / **else → `<PublicBlogHome />`** (← 여기를 `<CreatorSaasHome />` 로 교체).
3. `core/packages/viewer/src/pages/PublicBlogHome.tsx` — `/feed` 라우트가 직접 import 하므로 본 파일은 건드리지 않는다.

**스타일 토큰**:
- `core/packages/viewer/src/styles/main.css` 의 `:root` 블록 — `--primary-color`, `--primary-light`, `--primary-soft`, `--surface-base/muted/strong/elevated`, `--text-color/secondary/tertiary`, `--border-color/subtle`, `--bg-color`, `--bg-soft`, `--bg-alt`. 다크모드 자동 대응.
- 그라디언트 (frame mockup 의 `tech-gradient-bg: linear-gradient(135deg, #004ac6, #645efb)`) — 본 컴포넌트 전용 로컬 변수 `--saas-gradient` 정의.

## Footprint

- `core/packages/viewer/src/pages/CreatorSaasHome.tsx` — 신규 280 LOC. 정적 컴포넌트, 8 섹션 (Hero / Showcase / KPI / Products / Solutions / Stories / Partners / CTA). hooks/fetch 없음, inline SVG 아이콘.
- `core/packages/viewer/src/pages/CreatorSaasHome.css` — 신규 764 LOC. `.csh-` prefix, 로컬 `--saas-gradient`, 기존 `--primary-color`/`--surface-*`/`--text-*` 변수 재사용. 다크모드 자동 대응.
- `core/packages/viewer/src/pages/Home.tsx` — 2 라인 swap (lazy import + JSX). PublicBlogHome 제거 — 비로그인 폴백이 CreatorSaasHome 으로 전환. `/feed` 라우트는 router.tsx 가 직접 PublicBlogHome 을 import 하므로 무영향.

## Backlog

- [ ] iter 2 — 동적 데이터 hydrate (showcase / KPI / testimonials)
- [ ] iter 3 — viewport / dark mode 회귀 검증
- [ ] /feed 진입 동선 정리 — 현재 nav 에 노출 안 되면 LP 의 "블로그" 링크가 dead link 가 될 가능성. 이번 iter 에서는 placeholder 링크.

## Learnings

### 2026-04-30: iter 1 build done [done]

- **결과**: 1440x1024 Playwright 스크린샷에서 8개 섹션 모두 가시. 8개 토큰 (`나의 지식이`, `데이터 기반 퍼포먼스 마케팅`, `1,200+`, `38만+`, `1.2억`, `오픈하우와 함께 성장한 이야기`, `Bootpay`, `지식 비즈니스의 시작`) 전부 매치. `pnpm --filter @openhow/viewer build` 통과 (2.62s).
- **Codex scope 준수**: 3 파일만 변경. timestamp 비교로 router.tsx / CourseLanding.tsx 등 기존 dirty 파일은 prior session 잔재로 확인됨 (1777516593 / 1777517601 < 1777518660). MUST NOT 위반 0건.
- **이미지 fetch placeholder 전략**: mockup 의 `lh3.googleusercontent.com` 외부 fetch 를 전부 CSS gradient 로 대체. tone (`primary` / `secondary` / `tertiary` / `neutral` / `accent`) 5종을 reuse 패턴으로 정의 — Showcase 카드 thumb 와 Stories 아바타가 동일 변수 셋을 공유. 이게 향후 iter 2 (실 데이터 hydrate) 에서 카드 컴포넌트화할 때 그대로 이전된다.
- **Tailwind 무사용**: mockup 은 Tailwind 였지만 본 repo 는 vanilla CSS + `--var` 토큰. `.csh-` prefix 로 collision 방지. clamp() + grid `auto` + 3개 breakpoint (1023 / 767 / 479) 로 반응형 처리.
- **Storyboard 순서 deviation**: 본 intent 가 storyboard 의 마지막 단계(6번)였지만 사용자 첫인상 surface 라 1번으로 끌어올림. lesson-card / creator-store 는 이미 done 이라 의존 카드 톤은 reference 로만 활용 가능했다. 카드 시각 톤이 두 컴포넌트와 자연스럽게 어울리는지는 iter 2 (동적 hydrate) 에서 확인.
- **남은 frame**: Frame 6 community-board-polish-v1 (intent 미생성), Frame 2 pricing-page-v1 (intent 미생성). 두 frame 모두 ralph loop 다음 wedge 후보.
