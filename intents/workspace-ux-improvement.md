---
status: building
created: 2026-04-13
updated: 2026-04-13
---

# Workspace 관리 페이지 UX 개선

## Why
CLI/API로 기능은 갖춰졌지만, 실제 사용자가 UI에서 접근하고 활용할 수 있는 UX가 부족하다. 워크스페이스 생성 시 7개 타입 중 3개만 선택 가능하고, 타입별 레이아웃 미리보기가 없으며, 콘텐츠 관리 편의성을 높여야 한다.

## What
- 워크스페이스 생성 시 7개 타입 모두 선택 가능하게 (현재 onboarding에서 course/blog/docs만)
- 타입별 레이아웃 스켈레톤 미리보기 (생성 전에 어떤 모습인지 시각적으로 확인)
- 게시글 작성 UX 편의성 개선 검토
- 댓글 기능 대시보드 접근성 개선 검토
- 대시보드 인덱스 페이지 개선 (빈 플레이스홀더 → 워크스페이스 허브)
- 전반적 UX 갭 검토 및 개선

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

## Backlog
(아직 없음)

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
