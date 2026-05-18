---
parent: platform-admin-workspace-exposure-v1
iteration: 1
frozen_at: 2026-05-15
---

# iter 1 Learnings (frozen)

### 2026-05-06: seed created (iteration 1)
- **Background**: `public-home-creator-saas-pivot.md` iter 2 의 `/api/feed` Showcase hydration 직전, 노출 게이트 부재 위험을 사용자가 인지 → "관리자 화면 필요" 발화.
- **DB 분석**: `workspace` 테이블에 `defaultAccessLevel`/`joinPolicy`/`customDomain` 등 접근 관련 컬럼 다수 존재하나 **플랫폼-레벨 노출 게이트 컬럼 부재 확정**. user 테이블에 role 컬럼도 없음.
- **인접 의도**: 워크스페이스 내부 admin UI 는 `pages/admin/Admin*.tsx` 13종 존재. superadmin layer 는 0개 — 본 의도가 첫 superadmin surface.

### 2026-05-06: clarified — 사용자 "추천대로 + 롱블랙처럼" 위임
- **사용자 발화**: "추천대로 해줘. 롱블랙 처럼 해야해. 오래걸리더라도 좋은 결과물을 내자"
- **결정 1 (DB)**: 옵션 B = 3단계 enum `platformExposure: hidden | listed | featured`. 롱블랙 큐레이션 모델 = featured/listed 분리 필수. boolean 으로 시작 후 enum 마이그레이션 비용보다 처음부터 enum 이 저렴.
- **결정 2 (Auth)**: 옵션 B = env `SUPERADMIN_EMAILS` allowlist. v1 운영자 1인. role 컬럼 추가는 v2.
- **결정 3 (Storyboard)**: Phase 0 으로 추가. UI intent + Rule 11 + 사용자 quality bar.
- **추가 v2 항목**: `featuredNote` / `featuredAt` 큐레이션 메타 (롱블랙식 "오늘의 추천" 회전 자산) — Backlog 로 분류, v1 범위에 안 넣음 (스코프 hygiene).
- **다음 단계**: build 진입 — Phase 0 storyboard 부터.

### 2026-05-06: storyboard 우회 결정 (사용자)
- **사용자 발화**: "바로 빌드해줘 스토리보드 말고"
- **변경**: What 의 Phase 0 storyboard 항목 제거 + Not 섹션에 우회 사유 기록.
- **리스크**: 토글 UX 형태 결정 (라디오/드롭다운/버튼) 이 코드에서 즉흥. 빌드 후 사용자가 마음에 안 들면 iter 2 에서 UI 재작업.
- **다음**: `/omj:build platform-admin-workspace-exposure-v1` 즉시 호출.

### 2026-05-06: build iter 1 done — 4-step Codex 파이프라인
- **실행**: 4단계 Codex 위임 (DB → backend auth/routes → public surface 게이트 → viewer UI). 각 단계 후 typecheck (`pnpm tsc --noEmit`) + `git status --short` 로 scope 검증.
- **토글 UX 결정 (Codex 즉흥)**: 3-button segmented control (`[숨김] [등재] [추천]`) — 라디오/드롭다운보다 "현재 상태 + 다음 액션" 한눈에 보임. 사용자 빌드 후 검증 필요.
- **검증 결과**:
  - **DB**: 마이그레이션 파일 0060 생성, 컬럼 default `'hidden'` — 기존 워크스페이스 자동 백필.
  - **Auth**: env 미설정 시 모두 403 (기본 deny), allowlist email session 만 200. `/api/me` 에 `isSuperadmin: boolean` 노출 → 프론트 가드 자동 hydrate.
  - **Public surface 게이트**: `/api/feed` + `sitemap.xml` 둘 다 `inArray(platformExposure, ['listed', 'featured'])` 적용. workspace 단일 조회 (`GET /api/workspaces/:slug`) 는 의도적으로 게이트 제외 — owner 가 본인 hidden 워크스페이스 봐야 함.
  - **UI**: optimistic update + rollback, 300ms debounce, cursor 페이지네이션, segmented control. Defense-in-depth (router + layout 양쪽 가드).
- **운영자 셋업 (사용자 액션 필요)**: `wrangler.toml` + `.dev.vars` 에 `SUPERADMIN_EMAILS`, D1 마이그레이션 apply.
- **dependent 의도 unblock**: `public-home-creator-saas-pivot.md` iter 2 (Showcase carousel hydration) 진입 가능.
- **What 완성 매트릭스**: (v1) DB schema / Auth / Admin UI / public surface 게이팅 모두 done. v2 항목 (audit log, featuredNote, 후보 큐) 는 Backlog 잔류.

### 2026-05-15: iter 1 회고 — 사용자 시그널 [signal]
- **사용자 발화**: "관리자 페이지를 개선해보자. 디자인 시스템이 엉망인데? max-designsystem 참조해서 하고, 핵심은 메인페이지에 어떤 콘텐츠를 노출시킬건가 이거든."
- **회고**: iter 1 risk 였던 "토글 UX 마음에 안 들면 재작업" 이 실현. 동시에 v2 Backlog 의 큐레이션 메타 (featuredNote/featuredAt) 가 사용자 핵심 관심사로 부상 — "메인페이지 노출 컨텐츠 결정" 이 의도의 차세대 본질.
- **추가 축**: `/Users/taesupyoon/sideProjects/max-designsystem` (`@openhow/ds` + `@openhow/ds-tokens`, Toss-inspired, 58 React 컴포넌트, theme=toss) 도입 → admin UI 의 일관성 + 큐레이션 UX 의 품질 동시 해결.
- **다음 단계**: iter 2 진입 — INTENT.md 의 What 재정의.
