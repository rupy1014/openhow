# Learnings — iter 2 (frozen)

> iter 2 implementation 완료 (2026-05-15). DS 도입 + 큐레이션 메타 + featured 보드 + viewer 진입점 정리. iter 3 는 admin shell 본격 재작성 + 아티클 큐레이션 surface 로 확장.

## 2026-05-15: iter 2 seed — DS 도입 + 큐레이션 UX 두 축
- **사용자 발화**: "관리자 페이지를 개선해보자. 디자인 시스템이 엉망인데 ? /Users/taesupyoon/sideProjects/max-designsystem 여길 참조해서 하고, 핵심은 메인페이지에 어떤 콘텐츠를 노출시킬건가 이거든. 그걸 잘 구현해야해"
- **분석**: iter 1 risk 였던 "토글 UX 마음에 안 들면 재작업" 이 실현. 동시에 Backlog 에 둔 `featuredNote`/`featuredAt` 가 사용자 핵심 관심사로 부상 → "메인페이지 노출 컨텐츠 결정" = 운영자 큐레이션 UX 가 의도의 본질.
- **DS 인벤토리**: `@openhow/ds` (94 컴포넌트, React 19), `@openhow/ds-tokens` (CSS vars).
- **사용자 의도 선택**: "디자인 + 큐레이션 UX (Recommended)" — DS 는 큐레이션 UX 의 품질을 위한 수단.
- **What 구조**: A(DS 도입) → B(큐레이션 메타 + UI) → C(viewer 진입점 정리).

## 2026-05-15: DS 연결 — pnpm workspace 실패 → tarball vendor 로 전환
- **문제**: max-designsystem 의 `@openhow/ds` 가 `"@openhow/ds-tokens": "workspace:*"` 로 자기 monorepo 내부에서 참조. openhow workspace 에 file: path link 로 끌어오면 nested workspace:* 가 해소 불가 → `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND`.
- **해결**: max-designsystem 양 패키지에 `pnpm pack` → tarball 산출 → `core/packages/admin/vendor/openhow-ds-{0.1.0,tokens-0.1.0}.tgz`. pack 시 workspace:* 는 version 0.1.0 으로 resolve 됨. admin package.json 은 `"@openhow/ds": "file:./vendor/openhow-ds-0.1.0.tgz"` 형태.
- **트레이드오프**: DS 변경 시 매번 repack/replace. 본 iter 동안 DS 측 변경 없으므로 비용 0. 빈도 늘면 별도 build:dev script 로 자동화.

## 2026-05-15: 마이그레이션 번호 충돌 — 0061 → 0072
- **현상**: 초안에 `0061_add_workspace_featured_meta.sql` 로 적었으나 0061 은 이미 `0061_add_document_thumbnail.sql` 이 점유.
- **해결**: 최신 번호 다음으로 jump (0072). plan-iter-2.md + INTENT.md 모두 정정 후 코드 진입.
- **교훈**: migration 번호는 plan 작성 시 `ls migrations | tail -1` 로 last 확인하고 +1 부터 사용. 의도 작성 시 추측 금지.

## 2026-05-15: `/api/feed/featured` 실제 URL 은 `/api/public/feed/featured`
- **현상**: plan/EXPECTED 에 URL 을 `/api/feed/featured` 로 적었으나 `publicFeed` 라우터는 worker `app.route('/api/public', publicFeed)` 로 마운트됨 → 실제 URL prefix 는 `/api/public`.
- **해결**: 라우터 내부 path 는 `/feed/featured` 그대로 두고 (codex 산출 그대로), 실 URL 은 `/api/public/feed/featured` 로 안내. 메인페이지 (`public-home-creator-saas-pivot` 의도) 가 이 prefix 로 fetch 하면 됨.
- **교훈**: plan 에 URL 쓸 때 라우터 mount prefix 먼저 확인. `grep "app.route" packages/worker/src/index.ts` 한 줄.

## 2026-05-15: iter 2 implementation 완료 시점 사용자 신호 — admin shell pivot
- **사용자 발화**: "현재 워크스페이스를 노출하는것도 좋지만, 메인에 아티클을 노출하는것도 중요하자나. 관리 기능 홈이 어디일까 ? 관리자 자체를 그냥 만들라니까. 좌측 메뉴, header 상단 구조로 해서 /Users/taesupyoon/sideProjects/opencourt/apps/admin 참고하고"
- **분석**: iter 2 의 What 은 다 닫혔지만 사용자는 "iter 2 = DS 도입 + 워크스페이스 큐레이션 한 페이지" 자체가 부족함을 지적. 관리자 SPA 가 "한 페이지 SPA" 가 아니라 "여러 큐레이션 도메인을 다루는 admin app" 이어야 한다는 직관. + 워크스페이스 외 **아티클 큐레이션** 이 동등 우선순위.
- **같은 Why 유지**: "운영자가 메인페이지에 무엇을 노출시킬지 결정". 워크스페이스 축 + 아티클 축 동시. Why 동일 → iter 3 로 확장 (새 의도 X).
- **레퍼런스**: `/Users/taesupyoon/sideProjects/opencourt/apps/admin/src/components/admin/AdminShell.tsx` — `<aside class="admin-sidebar">` (브랜드 + 그룹 nav) + `<div class="admin-frame">` (header + main + toast). 깔끔한 sidebar/header 분리.
- **인프라 확인**: `featuredContent` 테이블 (section: editor_pick | trending, sortOrder, curatedBy) 이 이미 schema 에 존재 — 아티클 큐레이션은 UI/route 만 추가하면 됨.
- **다음 단계**: iter 3 = (A) Superadmin shell 재작성 + (B) 관리자 홈 + (C) 아티클 큐레이션 surface.

## iter 2 implementation footprint (실제 변경 — verified via git diff)

- `core/packages/worker/migrations/0072_add_workspace_featured_meta.sql` (new)
- `core/packages/worker/src/db/schema.ts` (+5)
- `core/packages/worker/src/routes/superadmin.ts` (+86)
- `core/packages/worker/src/routes/public-feed.ts` (+28)
- `core/packages/admin/package.json` (DS tarball deps)
- `core/packages/admin/src/main.tsx` (DS imports + data-theme=toss)
- `core/packages/admin/vendor/openhow-ds-{0.1.0,tokens-0.1.0}.tgz` (new)
- `core/packages/admin/src/pages/superadmin/WorkspaceExposure.tsx` (rewrite — 281 → 452 lines, DS components + featured board)
- `core/packages/admin/src/pages/superadmin/WorkspaceExposure.css` (trim — 206 → 24 lines)
- `core/packages/viewer/src/layouts/UnifiedLayout.tsx` (3 사이트의 "플랫폼 관리" 링크 제거)

**Verification**: typecheck pass (admin / worker / viewer), 로컬 D1 0072 적용 확인, dev 서버 (worker :7877 + admin :5172) 가동 + `/api/public/feed/featured` JSON 응답 확인.
