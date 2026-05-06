---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
related: ../creator-saas-storyboard.md, three-rail-nav.md
scope: [viewer]
loop:
  until: judge
---

# workspace-subpages-stub-v1 — Workspace Notices/Assignments stub 라우트

## Why

frame 6 (`references/stitch-storyboard/frame-6-community.html` line 168-260) 좌측 nav 는 5개 entry: Home / Lectures / **Notices** / Community / **Assignments**. 현재 router 에는 `Home`, `Lectures(=My)`, `Community` 만 존재. Notices / Assignments 는 라우트 자체가 없어 nav 클릭 시 404. 본 wedge 는 *경로 + placeholder UI 만* 추가해 frame 6 nav 가 dead-link 없이 작동하게 함.

→ 데이터 의존 없음. Notices/Assignments 도메인 모델은 별도 의도 (`workspace-notices-data`, `workspace-assignments-data`).

## Context

- **Reference**: `references/stitch-storyboard/frame-6-community.html` line 168-260 (좌측 nav 5개 entry)
- **현재 라우트** (`core/packages/viewer/src/router.tsx` line 180-208):
  - `/w/:workspace` → WorkspaceHome
  - `/w/:workspace/my` → WorkspaceMy (=Lectures)
  - `/w/:workspace/community` → WorkspaceCommunity
  - `/w/:workspace/community/new` → CommunityPostEditor
  - `/w/:workspace/community/:postSlug/edit` → CommunityPostEditor
  - **누락**: `/w/:workspace/notices`, `/w/:workspace/assignments`
- **데이터/스키마**: 없음. stub UI 만.

## What (v1)

1. **NoticesPage 컴포넌트 신규** — `core/packages/viewer/src/pages/workspace/NoticesPage.tsx` + `.css`. UnifiedLayout publication preset 재사용 (workspace 헤더 동일). 본문은 "공지사항" 제목 + 빈 상태 placeholder (`아직 등록된 공지가 없습니다.`).
2. **AssignmentsPage 컴포넌트 신규** — `core/packages/viewer/src/pages/workspace/AssignmentsPage.tsx` + `.css`. 동일 패턴, 제목 "과제" + placeholder "아직 등록된 과제가 없습니다.".
3. **router.tsx 라우트 등록** — `community/:postSlug/edit` 다음 라인에 2개 entry 추가:
   - `{ path: '/w/:workspace/notices', element: <NoticesPage /> }`
   - `{ path: '/w/:workspace/assignments', element: <AssignmentsPage /> }`
4. **import 추가** — `NoticesPage`, `AssignmentsPage` 를 `pages/workspace/...` 에서 import.

## Not (v1 에서 제외)

- **데이터 모델 / API** — Notice / Assignment 엔티티, D1 스키마, Worker 라우트 모두 별도 의도.
- **글로벌 nav 에 link 추가** — UnifiedLayout / nav-rail 변경 안 함. frame 6 좌측 nav 자체 (`workspace-side-nav-v1`) 는 deferred. 현재는 직접 URL 진입만 가능.
- **CRUD UI** — 공지 작성 / 과제 제출 / 마감일 등 모두 v2.
- **권한 가드** — owner/student 분기 없음. 모두 placeholder 만 표시.
- **빈 상태 일러스트** — 텍스트 한 줄 만. 아이콘/일러스트는 추후.

## Footprint

| 파일 | 변경 유형 |
|------|-----------|
| `core/packages/viewer/src/pages/workspace/NoticesPage.tsx` | new — UnifiedLayout publication preset + placeholder |
| `core/packages/viewer/src/pages/workspace/NoticesPage.css` | new — placeholder 스타일 |
| `core/packages/viewer/src/pages/workspace/AssignmentsPage.tsx` | new — 동일 |
| `core/packages/viewer/src/pages/workspace/AssignmentsPage.css` | new — 동일 |
| `core/packages/viewer/src/router.tsx` | edit — import + 2개 라우트 등록 |

## 배포·검증 절차

1. `pnpm --filter @openhow/viewer build` 통과
2. localhost:5173 `/w/{workspace}/notices` 진입 → "공지사항" + placeholder 노출 확인
3. `/w/{workspace}/assignments` 진입 → "과제" + placeholder 노출 확인
4. 기존 `/w/{workspace}`, `/my`, `/community` 정상 동작 확인 (regression 체크)

## Backlog (v2 후보)

- `workspace-notices-data` — Notice 엔티티 + D1 스키마 + Worker 라우트
- `workspace-assignments-data` — Assignment 엔티티 + 동일
- `workspace-side-nav-v1` — frame 6 좌측 nav (UnifiedLayout cascade 위험으로 deferred)

## Learnings

### 2026-04-30: clarified — 라우트 + placeholder 만, 데이터 의존 없음

- **wedge 선정 근거**: 사용자 요청 "서브페이지도 구현하고" 의 minimal-viable 표면. frame 6 nav 5 entry 중 2개가 dead-link 인 누수만 막음. 데이터 모델 없이도 시각적으로 frame 6 nav 가 완성됨.
- **단일경로 선택**: workspace-side-nav-v1 (좌측 nav 자체) 는 UnifiedLayout cascade 위험. workspace-notices-data 는 D1 스키마 + Worker 변경 cascade. stub 라우트는 cascade 없음.
- **scope 잠금**: UnifiedLayout / nav-rail / D1 스키마 / API 라우트 모두 미변경. 본 의도는 *2개 라우트 + placeholder 페이지* 만.

### 2026-04-30: [done] — 1 step 빌드 완료

- **What 완료**: NoticesPage.tsx + AssignmentsPage.tsx (각각 자체 페이지 컴포넌트, useParams 로 workspaceSlug 추출, breadcrumb + header + empty-state placeholder). NoticesPage.css 에 `.subpage-*` 6종 룰 + 모바일 미디어쿼리. AssignmentsPage.css 는 `@import './NoticesPage.css'` 로 룰 재사용. router.tsx 에 lazy import 2건 + 라우트 2건 (`w/:workspace/notices`, `w/:workspace/assignments`) 등록.
- **Not 준수**: D1 스키마 / API 라우트 / store / RequireAuth 가드 / UnifiedLayout 변경 / 글로벌 nav link 추가 모두 미구현. 빈 상태는 텍스트 한 줄만.
- **빌드 검증**: 신규 파일 단독 `tsc --noEmit` 통과. 전체 viewer build 는 무관한 사전 에러 (LessonCard.tsx `CourseTag` 미export — 이전 세션 untracked 파일) 로 차단되지만, 본 wedge 가 추가한 TS 에러 0건. 본 wedge 의 5개 파일 변경은 isolation 통과.
- **시각 검증 한계**: localhost:5173 진입 + `/w/{workspace}/notices` `/w/{workspace}/assignments` 직접 진입 필요. 사용자 직접 확인.
