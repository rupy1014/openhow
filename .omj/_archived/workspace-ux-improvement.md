---
status: done
created: 2026-04-13
updated: 2026-05-03
iteration: 4
superseded_by: core/creator-admin-console-v1.md
---

# Workspace 관리 페이지 UX 개선

## Why
CLI/API로 기능은 갖춰졌지만, 실제 사용자가 UI에서 접근하고 활용할 수 있는 UX가 부족하다. 워크스페이스 생성 시 7개 타입 중 3개만 선택 가능하고, 타입별 레이아웃 미리보기가 없으며, 콘텐츠 관리 편의성을 높여야 한다.

## What
- 워크스페이스 생성 시 7개 타입 모두 선택 가능하게 (현재 onboarding에서 course/blog/docs만)
- 타입별 레이아웃 스켈레톤 미리보기 (생성 전에 어떤 모습인지 시각적으로 확인)
- 게시글 작성 UX 편의성 개선 검토
- 댓글 기능 대시보드 접근성 개선 검토
- [x] 대시보드 인덱스 페이지 개선 (빈 플레이스홀더 → 워크스페이스 허브) — **metric: `/dashboard` 진입 시 owned+member 카드 그리드 렌더, 자동 리다이렉트 제거 (2026-04-17)**
- 전반적 UX 갭 검토 및 개선
- [x] workspace home sub-nav 슬롯 "최근 본 문서" 패널 (허전함 해소) — **metric: MainNav 있는 workspace 홈에서 3-column 렌더 + 방문 이력 표시 (2026-04-17)**

## Not
(탐색하면서 채운다)

## Context
- 모노레포: `core/packages/viewer` (React 19 SPA), `core/packages/worker` (Hono + D1), `core/packages/types`
- 워크스페이스 타입 7종: docs, course, team, blog, wiki, project, book
- 타입별 프리셋: joinPolicy, defaultAccessLevel, navigationMode, freeSections 조합이 서버에서 적용
- 에디터: Plate.js 기반, 댓글: CommentsSection 컴포넌트 이미 존재
- 진입점: `AdminLayout.tsx`, `WorkspaceHub.tsx`, `Onboarding.tsx`, `AdminSettings.tsx`

## Footprint
- core/packages/types/src/config.ts — WORKSPACE_TYPE_META 추가 (2026-04-13)
- core/packages/viewer/src/components/WorkspaceHub.tsx — 타입 선택 + 스켈레톤 미리보기 (2026-04-13)
- core/packages/viewer/src/components/WorkspaceHub.css — 타입 카드/스켈레톤 스타일 (2026-04-13)
- core/packages/viewer/src/layouts/AdminLayout.tsx — 대시보드 타입 선택 UI (2026-04-13)
- core/packages/viewer/src/layouts/AdminLayout.css — 대시보드 타입 스타일 (2026-04-13)
- core/packages/viewer/src/pages/Onboarding.tsx — 7개 타입 확장 + 프라이버시 수정 (2026-04-13)
- core/packages/viewer/src/pages/Onboarding.css — 온보딩 그리드 스타일 (2026-04-13)

- core/packages/viewer/src/editor/PlateEditor.tsx — 이미지 업로드 (window.prompt → 파일 선택 + R2 업로드 + 드래그&드롭) (2026-04-13)
- core/packages/viewer/src/editor/PlateEditor.css — 업로드 버튼 스타일 (2026-04-13)
- core/packages/viewer/src/pages/admin/EditorPage.tsx — uploadContext 전달, 저장 후 에디터 유지 + 토스트, create→edit 전환 (2026-04-13)
- core/packages/viewer/src/pages/admin/EditorPage.css — 토스트 스타일 (2026-04-13)
- core/packages/viewer/src/pages/admin/AdminDocs.tsx — 빈 상태 "New Document" 버튼 추가 (2026-04-13)
- core/packages/viewer/src/pages/admin/AdminDocs.css — 빈 상태 스타일 개선 (2026-04-13)

- core/packages/worker/src/routes/comments.ts — GET /:workspaceSlug 워크스페이스 전체 댓글 목록 API (2026-04-13)
- core/packages/viewer/src/pages/admin/AdminComments.tsx — 댓글 관리 페이지 (신규) (2026-04-13)
- core/packages/viewer/src/pages/admin/AdminComments.css — 댓글 관리 스타일 (신규) (2026-04-13)
- core/packages/viewer/src/layouts/AdminLayout.tsx — 사이드바에 "댓글" 링크 추가 (2026-04-13)
- core/packages/viewer/src/router.tsx — /dashboard/:ws/comments 라우트 등록 (2026-04-13)

- core/packages/viewer/src/hooks/useRecentDocs.ts — 최근 본 문서 tracking 훅 신설 (localStorage 기반, 최대 10개, 5초 debounce, storage 이벤트 동기화) (2026-04-17, iteration 2)
- core/packages/viewer/src/components/RecentItemsPanel.tsx — 최근 항목 패널 컴포넌트 신설 (empty state, 상대시간, 지우기) (2026-04-17, iteration 2)
- core/packages/viewer/src/components/RecentItemsPanel.css — 패널 스타일 (Navigation 톤 맞춤) (2026-04-17, iteration 2)
- core/packages/viewer/src/pages/DocPage.tsx — 문서 방문 시 `record()` 호출 useEffect 추가, index/readme는 워크스페이스 루트로 저장 (2026-04-17, iteration 2)
- core/packages/viewer/src/layouts/UnifiedLayout.tsx — `isWorkspaceHomeWithMainNav` 도입, workspace-docs + MainNav 있을 때 Publication/Document branch 모두 sub-nav 슬롯을 RecentItemsPanel로 주입 (2026-04-17, iteration 2)

- core/packages/viewer/src/pages/admin/Dashboard.tsx — 18줄 placeholder → 워크스페이스 허브 (fetch, 로딩 스켈레톤, 에러 재시도, 카드 그리드, 역할 뱃지, 액션 링크, member 역할은 "새 문서" 숨김) (2026-04-17, iteration 3)
- core/packages/viewer/src/pages/admin/Dashboard.css — 허브 카드/뱃지/스켈레톤/에러 스타일. `.action-btn`은 `.dashboard-view`로 scope해 글로벌 누수 방지 (2026-04-17, iteration 3)
- core/packages/viewer/src/layouts/AdminLayout.tsx — `/dashboard` 자동 리다이렉트 제거, `useSearchParams`로 `?create=workspace` 쿼리 one-shot 다이얼로그 트리거, `selectedWorkspace`는 `/dashboard` 루트에서만 클리어(`/dashboard/keys`는 유지) (2026-04-17, iteration 3)
- core/packages/viewer/src/locales/ko.ts, en.ts — `dashboard.hub.*` 키 블록 추가 (title, subtitle, role, actions, errorBody 등) (2026-04-17, iteration 3)

## Learnings

### 2026-05-03: (iteration 4) closeout — superseded by creator-admin-console-v1

- **결론**: 본 의도의 잔여 What 항목 (전반적 UX 갭 검토) 은 `core/creator-admin-console-v1.md` 의 8 surface 셸 신설 (P0~P2, 9 wedge) 로 완전 흡수. 본 의도 status → done.
- **흡수 매핑** (1:1):
  - "워크스페이스 생성 7타입 + 스켈레톤 미리보기" (이미 done, iter 1) → P0 admin-shell-ia-v1 의 `/dashboard/:workspace` 진입 → P1.1 WorkspaceOverview 가 첫 인상 차지.
  - "게시글 작성 UX" (이미 done, iter 1) → 영향 범위 그대로 유지. AdminEngagement 셸이 wrap 하지 않는 EditorPage 는 별도.
  - "댓글 dashboard 접근성" (iter 1 created `AdminComments`) → P2 admin-engagement-v1 의 `/dashboard/:workspace/engagement/comments` sub-tab 으로 wrap (컴포넌트 무수정).
  - "대시보드 인덱스 페이지 개선" (iter 3 done — `/dashboard` 카드 그리드) → 그대로 유지. 워크스페이스 내부 진입은 P1.1 WorkspaceOverview 가 담당.
  - "최근 본 문서 패널" (iter 2 done) → 워크스페이스 home sub-nav 슬롯에 그대로 유지. 본 의도 P0~P2 와 충돌 없음.
- **archive 결정**: 본 파일은 `_archived/` 로 이동 가능. iter 1~3 학습 (Codex review 패턴, locale 누수, generic class scope 누수, autonomous drift 등) 은 본 의도 + 후속 의도들이 patterns 로 흡수.
- **Scope**: _root → 흡수 후 무관

### 2026-04-17: (iteration 3) dashboard index 워크스페이스 허브
- **시도**: `/dashboard` 빈 placeholder를 워크스페이스 카드 그리드 허브로 전환. 자동 리다이렉트 제거, empty/error/loading/hub 4상태, 역할별 액션 노출.
- **결과**: 5개 파일(Dashboard.tsx/css, AdminLayout.tsx, ko.ts, en.ts), 490 lines 변경. Codex 리뷰 2라운드 총 5건(P2 4건 + P3 1건) 수정 후 완료. tsc 통과.
- **배운 것**:
  - `AdminLayout`에는 initial load useEffect 내부에 "workspace 있으면 첫 번째로 자동 이동" 분기가 있어 허브 페이지가 사실상 가려져 있었음. 허브를 살리려면 리다이렉트 제거가 선행 필요.
  - i18n 누수: 기존 컴포넌트가 locale store 사용 중이면 새 마크업도 반드시 locale에 키 등록해야 EN locale 사용자가 mixed-language UI를 안 보게 됨. 초기 프롬프트에서 scope 줄이려 locale 제외한 것이 P2 regression으로 돌아옴 — 같은 페이지의 i18n 부채는 fresh start가 아닌 한 `locales/` 포함 필수.
  - `.action-btn` 같은 generic 클래스명은 viewer 전역에서 이미 쓰고 있어(AdminDocs 아이콘 버튼, CommentsSection Reply 등) CSS page-level 파일에서 bare selector로 정의하면 페이지 전환 후 다른 화면까지 스타일이 바뀜. 페이지 전용 CSS는 반드시 컨테이너 클래스로 scope(`.dashboard-view .action-btn` 등).
  - `/dashboard/keys` 같은 workspace-agnostic 서브라우트는 `params.workspace`가 없지만 sidebar 컨텍스트는 유지해야 함. "params 없으면 selectedWorkspace 클리어"를 무조건 적용하면 keys 페이지에서 사이드바가 사라지는 regression. `pathname === '/dashboard'` 예외 처리 필요.
  - Codex가 `--resume-last`로 이전 세션 메모리를 잡을 때 무관한 파일까지 autonomous로 수정하는 drift 관찰 — 범위 이탈 발견 시 즉시 `git checkout HEAD -- <files>`로 되돌리고, surgical한 1-line fix는 Edit 도구 직접이 안전.
- **Scope**: _root

### 2026-04-17: (iteration 2) workspace home sub-nav 슬롯 개선
- **시도**: workspace home (`/w/:ws`) 진입 시 2-nav 구조에서 sub-nav 자리가 비어 허전하다는 UX 피드백 → 최근 본 문서 패널로 채우기
- **결과**: DocPage에 방문 기록 + UnifiedLayout에서 workspace-docs + MainNav 존재 시에만 sub-nav 슬롯에 RecentItemsPanel 주입. Codex 리뷰에서 이번 변경분 이슈 0.
- **배운 것**:
  - `hasSidebar = (isSimplePage || hasMainNav) ? false : ...` 계산식 때문에 현재 2-nav 실동작이 거의 없었음. `isWorkspaceHomeWithMainNav` 같은 파생 플래그를 별도로 도입하면 `isSimplePage` 전역 의미를 건드리지 않고 예외 슬롯을 주입 가능.
  - localStorage 기반 최근항목은 SSR/로그아웃/공용 디바이스에서 그대로 남는 게 브라우저 기본 동작. privacy가 더 중요하다면 user-scoped storage + 로그아웃 시 정리 훅 필요.
  - Codex review가 working tree 전체를 보므로, 이전 세션에서 밀려 있던 변경이 함께 P1/P2로 잡힘 → 커밋 주기 짧게 유지하는 게 리뷰 신호/노이즈 구분에 유리.
- **Scope**: _root

## Backlog
- 최근 항목 패널 privacy 옵션 — user-scoped storage 또는 로그아웃 시 clear 훅
- 빈 workspace (MainNav 없는 blog/team 타입) 홈의 허전함은 별도 해결 필요 (지금은 풀폭 WorkspaceDocs 유지)

## Learnings

### 2026-04-13: /cowork 워크스페이스 타입 선택 UI 구현
- **시도**: WorkspaceHub/AdminLayout/Onboarding에 7개 타입 선택 + 스켈레톤 미리보기
- **결과**: 구현 완료. 리뷰에서 프라이버시 이슈(P1)와 비원자적 업데이트(P2) 발견 후 수정
- **배운 것**: 
  - worker 수정 없이 온보딩 타입 확장 시 2단계 처리 필요 (onboard→type update). 비원자적이므로 실패 처리 필수
  - team/project 타입은 onboard가 public welcome.md를 만들므로, 문서 접근 레벨도 별도 업데이트 필요
  - Codex가 범위 외 파일(20개)도 수정함 — 프롬프트에 MUST NOT을 더 구체적으로 써야 함
- **의도 변경**: What 첫 2항목(타입 선택 + 스켈레톤) 완료. 나머지 4항목 미착수

### 2026-04-13: /cowork 게시글 작성 UX 개선
- **시도**: 이미지 업로드 (PlateEditor), 빈 상태 개선 (AdminDocs), 저장 UX (EditorPage)
- **결과**: 3개 스텝 구현 완료. 리뷰에서 uploadContext.documentSlug 버그 발견 → 수정
- **배운 것**:
  - asset API의 GET 라우트가 documentSlug로 문서를 조회해 권한 확인하므로, 업로드 시 full slug(섹션 포함)을 반드시 사용해야 함
  - EditorPage에서 create→edit 전환 시 useEffect 재실행 방지를 위해 skipNextFetchRef 패턴 필요
- **의도 변경**: What 3번째 항목(게시글 작성 UX 편의성 개선) 완료. 4~6번 미착수

### 2026-04-13: /cowork 댓글 대시보드 접근성 개선
- **시도**: Worker에 워크스페이스 전체 댓글 API 추가 + AdminComments 페이지 생성 + 사이드바/라우터 연결
- **결과**: 2개 스텝 구현 완료. 리뷰에서 3개 이슈 발견 → 수정
- **배운 것**:
  - EditorPage의 edit 모드에서 slug을 leaf slug과 section으로 분리 저장해야 fullDocumentSlug 이중 접두사 방지
  - 문서 뷰어 라우트가 /d/:workspace/* (not /w/) — 댓글 링크 등에서 주의
  - 서버에서 자식 댓글 cascade 삭제 시 클라이언트도 parentId 필터 필요
- **의도 변경**: What 4번째 항목(댓글 기능 대시보드 접근성 개선) 완료. 5~6번 미착수
