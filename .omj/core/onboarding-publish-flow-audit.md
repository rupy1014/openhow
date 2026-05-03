---
status: exploring
created: 2026-05-04
updated: 2026-05-04
iteration: 1
parent: creator-saas-storyboard
---

# onboarding-publish-flow-audit — 메인 랜딩 → 워크스페이스 생성 → 설정 → 콘텐츠 배포 end-to-end UX 점검

## Why

사용자 발화 (2026-05-04): *"메인 랜딩에서 워크스페이스 만들고, 설정해서 콘텐츠 배포하고 그런 ux 까지 검토하고 개선할게 있다면 나한테 보고해."*

`creator-saas-storyboard` (status: reviewed) 가 6 surface 의 비주얼 합의를 잡았고 `public-home-creator-saas-pivot` (status: done) 가 랜딩 swap 을 닫았다고 기록돼 있지만, **실제 first-time creator 가 가입→발행까지 가는 동선이 한 번도 통합 점검된 적 없음**. 본 의도는 코드 변경 의도가 아닌 **audit 의도** — 흐름을 1회차 직접 걸어보고 회귀·중복·끊긴 동선을 발굴해 별도 build 의도로 분리한다.

## Context — 발견된 entry points (2026-05-04)

| Surface | 파일 | 비고 |
|---------|-----|------|
| Loggedout 랜딩 | `Home.tsx` → `PublicBlogHome` | CreatorSaasHome 미스왑 — finding #1 |
| Loggedin 랜딩 | `Home.tsx` → `WorkspaceHub` | OK |
| Onboarding wizard | `Onboarding.tsx` (4 step) | `/api/workspaces/onboard` |
| Dashboard hub | `admin/Dashboard.tsx` | `?create=workspace` handler 없음 — finding #2 |
| WorkspaceHub dialog | `WorkspaceHub.tsx` | `/api/workspaces` |
| Workspace settings | `admin/AdminSettings.tsx` | OK |
| CLI publish | `cli/src/commands/publish.ts:822` | `/api/workspaces` |

## What — 발견된 격차 (audit findings)

- [done] **iter 1 audit**: 5173 viewer + 7877 worker dev 환경에서 비로그인/로그인 진입점 5개 walk + 코드 4개 (Home.tsx, Onboarding.tsx, WorkspaceHub.tsx, Dashboard.tsx) cross-read 완료. 8 findings 분류 (severity / type 별).

### Severity P0 — regression / 끊긴 동선

- **F1. CreatorSaasHome 미스왑 회귀**: `public-home-creator-saas-pivot.md` (done, 2026-04-30) 가 `Home.tsx` 의 비로그인 fallback 을 `<PublicBlogHome />` → `<CreatorSaasHome />` 로 swap 했어야 하는데 `Home.tsx:6,31` 은 여전히 `PublicBlogHome` 만 import/render. 비로그인 첫 방문자가 보는 화면이 article feed 그대로 — Frame 1 mockup (Hero/Showcase/KPI/4-grid/...) 미반영. **swap 회귀 또는 PR 미머지 가능성**. CreatorSaasHome.tsx 파일은 존재. → 한 줄 fix wedge.

- **F2. Dashboard "워크스페이스 만들기" CTA 무반응**: `admin/Dashboard.tsx:99,116` 의 `<Link to="/dashboard?create=workspace">` 두 곳이 query param 만 추가하고 끝 — Dashboard.tsx 전체에 `searchParams.get('create')` 핸들러 없음. 클릭 시 같은 페이지로 reload, 다이얼로그 안 뜸. **첫 워크스페이스 만들고자 하는 신규 사용자가 막히는 dead-end**. → query param 감지 + WorkspaceHub 다이얼로그 재사용 또는 `/onboarding` 으로 redirect.

### Severity P1 — 중복 / 일관성 깨짐

- **F3. 워크스페이스 생성 경로 3개 + API 2개 중복**: 
  - `/onboarding` 4-step wizard → `POST /api/workspaces/onboard` (goal 기반 preset, profile 설정 동시)
  - `WorkspaceHub` 다이얼로그 → `POST /api/workspaces` (type 직접 지정)
  - CLI `openhow publish` → `POST /api/workspaces` (auto-create from local files)
  
  동일 task 인데 UX (wizard vs dialog) 와 API contract 가 다름. `/onboard` 는 `goal` 만 받고 type 은 후속 PUT 으로 normalize (`Onboarding.tsx:197-213`) — 2 API call 패턴. → 단일 endpoint + onboarded 여부에 따라 wizard/dialog 분기.

- **F4. 빈 상태 메시지 두 곳 불일치**:
  - `Dashboard.tsx:93-104` 빈 상태: 짧은 CTA "워크스페이스 만들기" 1개 (위 F2 broken)
  - `WorkspaceHub.tsx:145-161` 빈 상태: CLI 설치 가이드 (`npm install -g @openhow/cli`, `openhow login && openhow publish ./docs`) + 다이얼로그 버튼
  - 같은 사용자 (워크스페이스 0개) 가 어느 화면을 먼저 보느냐에 따라 다른 안내 — Hub 는 CLI/UI 둘 다, Dashboard 는 UI 만.

### Severity P2 — 마이크로 카피 / 안내 부재

- **F5. 도메인 mismatch**: `Onboarding.tsx:250` 슬러그 프리뷰 `openhow.kr/s/{username}` — 실제 production 도메인은 `openhow.io` (CLAUDE.md 명시). `.kr` 도 점유 여부 불명. 사용자 혼란.

- **F6. 한글 워크스페이스 이름 → slug 빈 문자열 silent fail**: `Onboarding.tsx:44-49 toSlug()` 가 ASCII 만 살리는데, 한글 입력 시 `slugPreview` 가 `''` 라 `Onboarding.tsx:324` 의 `{slugPreview && ...}` 조건에서 안 보임. 사용자는 "주소가 뭐가 될지" 못 봄. → 빈 slug 일 때 명시 안내 ("영문 주소가 자동 생성되지 않아요. 직접 입력하세요" + slug input 노출) 또는 한글 transliteration.

- **F7. 워크스페이스 생성 후 콘텐츠 배포 가이드 부재**: `Onboarding.tsx:344-353` step 4 ("준비 완료!") 가 1.2초 후 `/dashboard/{slug}` 로 redirect. "어떻게 첫 콘텐츠를 올리지?" 안내 없음. CLI install/publish 안내는 WorkspaceHub 빈 상태 (워크스페이스 0개) 에만 있는데, 이미 1개 만든 후엔 그 뷰를 못 봄. → step 4 에 "다음에 할 일" 카드 (CLI 설치 1줄 + web editor 링크 1줄).

- **F8. CLI vs Web editor 가이드 부재**: 워크스페이스 생성 후 콘텐츠 입력 경로가 (a) `openhow publish ./docs` CLI, (b) `admin/EditorPage.tsx` web editor 둘 다 존재하는데 어느 것을 언제 쓰라는 안내 없음. blog/docs 사용자는 CLI 가 자연스럽고, course/team 은 web editor 가 자연스러울 수 있음 — type 별 권장 경로 분기 안내 부재.

## Not

- 코드 변경 X (audit 의도). 발견된 finding 은 별도 build 의도로 분리.
- 백엔드 / API contract 리팩토링 X (단, F3 통합은 다음 의도에서 검토).
- 결제·페이월·로그인 OAuth 자체 UX X (별도 surface).
- 비주얼 polish X (`creator-saas-storyboard` 에서 별도 처리).

## Recommendation — 다음 build wedge 우선순위

1. **F1 (CreatorSaasHome 회귀)** — 한 줄 swap, 비로그인 사용자 첫인상 즉시 회복. 1회 build 의도.
2. **F2 (Dashboard CTA)** — 새 사용자 dead-end 제거. 1회 build 의도.
3. **F7 + F8 (post-create 가이드)** — 첫 콘텐츠 발행까지의 완주율 직결. 1회 build 의도 ("post-onboarding next-step card").
4. **F4 (빈 상태 통합)** — 두 컴포넌트 메시지 sync. 1회 build 의도.
5. **F5 + F6 (마이크로 카피)** — 작은 polish 묶음.
6. **F3 (3 경로 통합)** — 가장 큰 작업, 별도 의도 (`workspace-creation-flow-unify-v1`).

## Learnings

### 2026-05-04: iter 1 audit 완료
- **Method**: dev 서버 5173/7877 기동 → 5 surface (`/`, `/onboarding`, `/login`, `/dashboard`, `/pricing`) Playwright walk + Home/Onboarding/WorkspaceHub/Dashboard 4 파일 cross-read.
- **Surprise**: `public-home-creator-saas-pivot` 가 done 인데 실제 swap 안 됨. 의도 done = 코드 done 이 아닐 수 있음 — 의도 닫을 때 실제 entry 파일에서 swap 검증 필요.
- **Surprise**: 워크스페이스 생성 entry 가 3개나 있고 endpoint 도 2개 — 누적 추가의 결과로 보임. 단일 사용자 시각으로 한 번도 통합 점검된 적 없는 흔적.
- **Method note**: 다음 audit 의도는 첫 단계에서 *"기존에 done 된 핵심 의도 spot-check"* 를 plan 에 명시. done 라벨만으로 회귀 가능성 못 잡음.
