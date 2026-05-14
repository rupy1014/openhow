---
name: project-restructure-admin-mcp
description: openhow core 모노레포 재구성 — admin SPA 를 viewer 에서 분리 (localhost 전용), worker/mcp 를 1급 패키지로 추출 (공개 GitHub mirror via subtree push). types 잔재 정리.
status: building
iteration: 1
created: 2026-05-14
updated: 2026-05-14
related:
  - openhow-positioning-clauders-seo.md
  - composer-deprecation.md
  - home-route-split.md
---

# project-restructure-admin-mcp

## Why

`packages/viewer/` 안에 reader UI + admin UI + superadmin UI 가 한 빌드 산출물로 묶여 있다. 결과:

1. **공격 표면 확장** — `/admin/*`, `/superadmin/*` 라우트가 openhow.io 공개 SPA 번들에 ship. 코드 자체는 권한 가드되지만 라우트/UI/문자열은 공개 chunk 에 노출.
2. **viewer 번들 비대** — admin pages 8개 (AdminSettings 1402줄, AdminMembers 974줄 등) + superadmin pages 가 lazy chunk 라도 manifest 와 type 의존성 트리에 묶임.
3. **MCP surface 가 1.5급** — `worker/src/mcp/{index,directives}.ts` 588줄이 worker 안 폴더로 묻혀 있음. 5-13 정체성 lock ("openhow = AI agent 가 콘텐츠 접근하는 프로토콜 레이어") 의 진심을 코드 구조가 반영 못 함.
4. **공개·내부 결합** — 모든 게 한 private Gitea repo. mcp 만 외부에 공개하고 싶어도 분리 메커니즘이 없음. SDK/프로토콜로 외부 채택을 노리려면 mcp 가 자체 repo + npm package + GitHub issue surface 를 가져야 함.

User 결정 (2026-05-14):
- 솔로 운영 + admin 은 본인만 사용 → **admin 은 localhost 전용**, Cloudflare 배포 불필요
- mcp 만 공개 GitHub mirror → **subtree push** 로 single source-of-truth 유지
- core 위치 변경 없음 → `~/sideProjects/openhow/core/` Gitea 그대로

## What

### (v1) — Wedge A: admin SPA 분리

- (v1) [hypothesis] `packages/admin/` 신규 패키지 — Vite 6 + React 19, viewer 와 동일 stack. `pnpm --filter @openhow/admin dev` 로 localhost:5174 (가칭) 기동. → **metric: viewer build 후 dist/assets 에서 admin/superadmin chunk class 이름 0건**
- (v1) [hypothesis] `viewer/src/pages/admin/*` 11개 파일 + `viewer/src/pages/superadmin/*` 4개 파일을 `admin/src/pages/{admin,superadmin}/` 로 이동. → **metric: viewer 번들 사이즈 측정 — admin chunk 합산 만큼 감소**
- (v1) [hypothesis] `viewer/src/components/admin/` (DataTable, Checklist, Shell, etc.) 도 admin 패키지로 이동. viewer 가 import 안 함을 확인. → **metric: viewer src 에서 `from '../components/admin'` 검색 결과 0**
- (v1) [hypothesis] `viewer/src/router.tsx` 에서 `/admin/*`, `/superadmin/*`, `/dashboard/*` 라우트 제거. → **metric: viewer router lazy import 목록에서 admin 관련 chunk 0건**

### (v1) — Wedge B: admin localhost 운용 설정 (B-local 모드 — 2026-05-14 결정)

**Pivot 사유**: 원안의 production-proxy 안은 cookie 가 origin 종속이라 실제로 인증 안 흐름. CLI 의 bearer-token 패턴을 admin SPA 로 재구현하는 비용 vs 로컬 worker 1개 더 띄우는 비용 비교 → 후자가 훨씬 작음. Production data 검증은 별도 `dev:prod` 토글로 v2 검토.

- (v1) [hypothesis] `admin/vite.config.ts` 의 proxy target 기본값을 `http://localhost:7877` (worker dev) 로 변경. `VITE_API_TARGET` env override 는 유지 (`dev:prod` 같은 향후 토글 대비). → **metric: admin localhost:5174 가 worker localhost:7877 로 `/api/*` proxy**
- (v1) [hypothesis] worker `CORS` allowlist + Better Auth `trustedOrigins` 둘 다 `http://localhost:5174` 추가. → **metric: admin 5174 에서 worker 7877 의 `/api/me` 호출 시 CORS 통과 + cookie 보존 (`useSecureCookies: false` 는 isLocalhost 분기로 이미 처리됨)**
- (v1) [hypothesis] admin 패키지 README — 운영 흐름 (`worker pnpm dev` + `admin pnpm dev` + GitHub OAuth 로그인), local D1 seed 안내, 포트 표. → **metric: README 존재 + 신규 머신에서 5분 안에 admin 띄움**

### (v1) — Wedge C: mcp 패키지 추출

- (v1) [hypothesis] `packages/mcp/` 신규 패키지 — `@openhow/mcp` (npm 발행 가능 형태, 단 v1 단계에선 private). MCP 표준 SDK (`@modelcontextprotocol/sdk` 또는 Hono 기반 fastmcp) 사용. → **metric: `packages/mcp/src/` 생성 + types 의존성 명시**
- (v1) [hypothesis] `worker/src/mcp/{index,directives}.ts` 588줄 → `packages/mcp/src/` 로 이동. worker 는 mcp 패키지 import 해서 mount. → **metric: worker `src/mcp/` 삭제, `worker/src/routes/` 또는 entry 에서 `import { mcpHandler } from '@openhow/mcp'`**
- (v1) [hypothesis] worker → mcp 단방향 의존성 (mcp 는 worker 를 모름). mcp 는 types 만 의존. → **metric: `packages/mcp/package.json` deps = `@openhow/types` + MCP SDK 만**

### (v1) — Wedge D: mcp 공개 GitHub mirror

- (v1) [hypothesis] GitHub repo 신규 — `github.com/rupy1014/openhow-mcp` (public). README, LICENSE (MIT 또는 Apache-2.0), 간단한 사용 예. → **metric: 공개 repo URL 존재 + 첫 commit 푸시 완료**
- (v1) [hypothesis] core/ 에서 `git subtree push --prefix=packages/mcp github-mcp main` 으로 초기 발행. → **metric: 공개 repo 에 packages/mcp 내용만 보임 (다른 패키지 누출 0)**
- (v1) [hypothesis] `scripts/publish-mcp.sh` (또는 root `package.json` script) — subtree push 자동화. → **metric: `bash scripts/publish-mcp.sh` 한 줄로 mcp 변경 → public repo 반영**

### (v1) — Wedge E: types 잔재 정리

- (v1) [hypothesis] `packages/types/src/{cohort,certificate,assessment}.ts` 3개 파일 삭제. `types/src/index.ts` 의 re-export 도 정리. → **metric: viewer + worker + admin + mcp + cli build 0 errors after deletion**
- (v1) [hypothesis] `types/src/course.ts` 사용처 (Admin 3개 페이지) 검토 — 실제로 lesson/course 개념을 쓰는지, 아니면 라벨/문자열 용도인지. lesson/course 의존성 명확히 분리 가능하면 삭제, 아니면 라벨로 인라인. → **metric: course.ts 도 삭제 or 명확한 잔존 사유 기록**

### (v2) — backlog

- (v2) mcp 자체 별도 Cloudflare Worker 배포 (`mcp.openhow.io`) — 현재는 본 worker 가 mount. 트래픽이나 격리 요구가 생기면 분리.
- (v2) admin 패키지 PWA 화 또는 별도 보안 — 현재는 localhost 운용으로 충분.
- (v2) types 의 `cohort`/`certificate`/`assessment` 가 openklass-fork 에 합류 — openklass 가 별도 monorepo 라면 그 쪽으로 옮길지 결정.
- (v2) mcp 외부 PR / issue triage 정책 — 공개 후 traction 생기면 contributor guide 작성.

## Not

- (X) **mcp 외 패키지의 GitHub 공개** — viewer, worker, admin, cli, types 는 Gitea private 유지. 변경 없음.
- (X) **admin 의 Cloudflare 배포** — localhost 전용. worker `ASSETS` binding 도 viewer/dist 만. admin/dist 는 worker 가 안 봄.
- (X) **모노레포 → 멀티레포 분리** — 모든 패키지는 `core/packages/` 안에 거주. mcp 만 subtree 로 public mirror (single source of truth 는 여전히 core/).
- (X) **worker route 경로 변경** — `/api/admin/*`, `/api/superadmin/*` 그대로. admin SPA 가 이 경로를 호출. URL 정책 무변경.
- (X) **admin 의 인증 메커니즘 변경** — Better Auth + KV 세션 그대로. admin 은 production worker (또는 local worker) 호출, 동일 세션 사용.
- (X) **types/cohort/certificate/assessment 의 자동 마이그레이션** — openklass-fork 와의 동기화는 별 의도. 여기서는 삭제만 (또는 잔존 사유 기록).
- (X) **mcp 공개 후 contributor onboarding 문서화** — README + LICENSE 만. CONTRIBUTING/governance 는 v2 backlog.
- (X) **공개 GitHub 의 CI** — initial publish 만. CI 설정은 traction 후.
- (X) **공유 라이브러리 추출 (ui/lib)** — viewer + admin 이 공통 컴포넌트 (예: DataTable) 를 공유한다면 향후 `packages/ui/` 후보. 현재 Wedge A 에서는 admin 으로 옮긴 후 viewer 가 사용 안 함을 확인만.

## Context

### Current state (2026-05-14)

- `core/packages/viewer/` (React 19 SPA, Vite 6)
  - `src/pages/admin/` 11개 파일 (AdminSettings 1402줄 등, 총 ~5800줄)
  - `src/pages/superadmin/` 4개 파일 (TopicsAdmin 373줄 등)
  - `src/components/admin/` 7개 컴포넌트 (DataTable, Checklist, Shell, FilterBar, MetricCard, SaveBar, SectionHeader)
  - `src/router.tsx` 에서 `/admin/*`, `/superadmin/*`, `/dashboard/*` lazy mount
- `core/packages/worker/` (Hono + Cloudflare Worker)
  - `src/mcp/index.ts` 324줄, `src/mcp/directives.ts` 264줄
  - `wrangler.toml` ASSETS binding → `../viewer/dist`
- `core/packages/cli/`, `types/` — npm published (`@openhow/cli` 0.1.4, `@openhow/types` 0.1.1)
- Gitea repo `https://gitea.max5.ai/ehowlsla/openhow.git` — 모든 코드의 source of truth.
- GitHub 부모 dir `https://github.com/rupy1014/openhow.git` — `core/` gitignored, README/docs 만 미러.

### Deployment topology

| Surface | Build | Host | Domain |
|---|---|---|---|
| viewer (reader) | `pnpm --filter @openhow/viewer build` → viewer/dist | Cloudflare Worker ASSETS | openhow.io |
| worker (API) | `cd packages/worker && pnpm run deploy` | Cloudflare Workers | openhow.io/api |
| admin (after restructure) | `pnpm --filter @openhow/admin dev` (only) | localhost:5174 | n/a |
| mcp (after restructure) | worker 가 mount; v2 에 자체 Worker 분리 가능 | Cloudflare Workers (현재는 본 worker) | openhow.io/mcp/* |
| cli | `pnpm --filter @openhow/cli build` → npm | npm | n/a |
| types | `pnpm --filter @openhow/types build` → npm | npm | n/a |

### Why subtree push (not separate repo)

- types 공유 — 같은 monorepo workspace 의존성으로 자동
- 단일 dev/build pipeline (Turbo cache)
- public commits 의 SHA 가 원본과 달라짐 (subtree 의 history 평탄화 특성). 이건 의도 — 공개·내부 거버넌스 분리 signal.
- 외부 PR 는 GitHub 에서 받아서 subtree pull 로 흡수 가능 (필요 시).

## Footprint

### 2026-05-14: Wedge A done — admin SPA 분리 완료

**A.1 — admin scaffold** (Codex `restructure-admin-mcp-A1.md`):
- Created `packages/admin/` with `package.json` (`@openhow/admin` private, Plate deps mirror viewer), `vite.config.ts` (port 5174 strictPort, proxy `/api → openhow.io`), `tsconfig.json`, `index.html`, `src/{main,App,router,styles}`
- Build: 3.501s, dist 282KB raw / ~91KB gz / 3 files

**A.2 — shared utilities 복제** (Codex `restructure-admin-mcp-A2.md` + `A2-fixup.md`):
- Byte-copied 11 files: `stores/{auth,locale,theme}.ts`, `lib/document-templates.ts`, `locales/{en,ko}.ts`, `editor/{PlateEditor.tsx, PlateEditor.css, SlashMenu.tsx, SlashMenu.css, plugins.ts}` → admin/src/
- Fixup: created `admin/src/vite-env.d.ts` (`/// <reference types="vite/client" />`) + added 3 deps (`lowlight ^3.3.0`, `remark-gfm ^4.0.1`, `remark-math ^6.0.0`) to admin/package.json
- `pnpm install` ran from host (sandbox blocked registry); workspace cache reused viewer's versions
- Build: 505ms, dist 282KB raw / ~90KB gz / 3 files

**A.3 — admin/superadmin 페이지 마운트** (Codex `restructure-admin-mcp-A3.md`):
- `cp -r` 63 files: 40 admin pages + 4 superadmin pages + 14 admin components + 4 layouts (AdminLayout, SuperadminLayout) + 1 hook (useScrollToTop)
- Rewrote `admin/src/router.tsx` — root `/` → Navigate `/dashboard`; `/dashboard/*` and `/superadmin/*` route trees verbatim from viewer (preserves hardcoded Links)
- Build: 2.36s, dist 1.7MB raw / 503KB gz / 59 files (lazy chunks per admin page)

**A.4 — viewer 정리** (Codex `restructure-admin-mcp-A4.md`):
- Router trim: `viewer/src/router.tsx` 281 → 158 lines (removed `Admin/SuperadminLayout` imports, all admin/superadmin lazy imports, `RequireDashboard`, `RequireSuperadmin`, the `/dashboard/*` + `/superadmin/*` route blocks). `RequireAuth` retained (used by `/onboarding`).
- Deletions (69 files): `pages/admin/`, `pages/superadmin/`, `components/admin/`, `layouts/AdminLayout.{tsx,css}`, `layouts/SuperadminLayout.{tsx,css}`, `layouts/adminSurface.ts`, `lib/document-templates.ts`, `editor/`
- Kept (verified non-admin usage): `stores/*`, `locales/*`, `hooks/useScrollToTop.ts` (still used by `UnifiedLayout`)
- Build: 1.09s, dist 4.3MB raw / 882KB gz / 83 files
- **Delta from before**: −1,335,843 raw bytes (−1.34MB), −401,023 gz bytes (−401KB), −64 dist files, build time 2.71s → 1.09s

**Metrics achieved**:
- `grep -r 'pages/admin\|pages/superadmin\|components/admin\|AdminLayout\|SuperadminLayout' packages/viewer/src` → 0 hits ✓
- viewer/dist 0 admin/superadmin-named chunks ✓
- admin package builds cleanly + hosts all 22 pages ✓

**Not yet committed**: viewer modifications (router.tsx + 69 deletions) + admin/ untracked. Awaiting commit step.

**Working-tree co-existence**: Wedge A operated alongside other agents' changes (worker/, cli/, viewer/SearchResults.tsx, viewer/stores/project.ts, untracked MyPromotionsIncoming, utils/analytics). None of those were touched.

**Follow-up (out-of-A.4 scope)**: viewer still has `/dashboard` and `/superadmin` Links inside `pages/Onboarding.tsx`, `components/WorkspaceHub.tsx`, `layouts/UnifiedLayout.tsx`. In the new architecture (admin localhost-only), these become 404 on openhow.io. Decision deferred to Wedge B prep or separate cleanup wedge.

### Wedge B done — 2026-05-14 (B-local mode)

**Codex prompt**: `.omj/.runtime/prompts/restructure-admin-mcp-B.md` (179 lines).

**Three edits + README** (all scope-clean):

- `admin/vite.config.ts:5` — default proxy target `https://openhow.io` → `http://localhost:7877`. `VITE_API_TARGET` env override preserved.
- `worker/src/index.ts:54` — CORS origin array appended `'http://localhost:5174'` (joined `:3600`, `:5173`).
- `worker/src/lib/auth.ts:19` — Better Auth `staticOrigins` appended `'http://localhost:5174'` (between `:5173` and `:3600`).
- `admin/README.md` — 55-line operating guide (worker dev + admin dev, GitHub OAuth flow, port table 5173/5174/3600/7877, local D1 seed reminder, production-direct unsupported note).

**Builds** (all exit 0):
- `pnpm --filter @openhow/admin build` — 2.28s Vite, 5s wall
- `pnpm --filter @openhow/worker build` — 4s wall
- `pnpm --filter @openhow/viewer build` — 1.09s Vite, 4s wall (CORS addition was purely additive, viewer unaffected)

**Boundary check** — `git status --short packages/admin/ packages/worker/src/index.ts packages/worker/src/lib/auth.ts`:
```
 M packages/worker/src/index.ts
 M packages/worker/src/lib/auth.ts
?? packages/admin/
```
No leakage outside Wedge B scope.

**Cookie path** (why B-local works): browser cookies are origin-bound, so `localhost:5174 → openhow.io` would never deliver session cookies regardless of Vite proxy `changeOrigin`. With both admin (5174) and worker (7877) on localhost, Better Auth's existing `isLocalhost` check (`auth.ts:29-31, 45`) auto-disables `__Secure-` prefix, so session cookies flow normally.

**Not yet committed**: Wedge A + Wedge B both pending commit. Awaiting user's commit step.

## Backlog

(See v2 section under What.)

## Decisions (2026-05-14)

1. **모노레포 단일 source of truth** — 멀티레포 분리 안 함. mcp 만 subtree mirror.
2. **admin localhost 전용** — Cloudflare 배포 미수반. 공격 표면 최소화 (관리자만 로컬에서 띄움).
3. **mcp 1급 패키지로 승격** — 5-13 정체성 lock ("openhow = AI 콘텐츠 프로토콜 레이어") 의 코드 구조 반영.
4. **types 잔재 (cohort/cert/assessment) 정리** — 5-04 openklass-fork 분기와의 명확한 이별 신호.
5. **Wedge 순서: A (admin 분리) → B (admin 운영) → C (mcp 추출) → D (mcp 공개) → E (types 정리)** — blast radius 큰 admin 분리 먼저, 공개 publish 는 안정화 후.

## Open Questions

- (resolved 2026-05-14) admin 패키지 이름: `@openhow/admin` private. → 확정
- (resolved 2026-05-14) mcp 공개 라이선스: MIT 또는 Apache-2.0. → Wedge D 진입 시 user 1회 결정 (둘 다 OK)
- (open) `types/src/course.ts` Admin 페이지 3개 의존성 — 실제 lesson/course 데이터 모델 잔존 여부 vs 단순 라벨 사용. → Wedge E 진입 시 코드 확인 후 결정.
- (resolved 2026-05-14) admin localhost dev 포트 — `5174` 확정 (worker 7877, viewer 5173).
- (resolved 2026-05-14) admin → API 교차출처 처리 — B-local mode 선택 (로컬 worker dev). cookie 가 origin 종속이라 5174 → openhow.io 직접 호출은 인증 불가. B-prod (bearer token 재구현) / B-hybrid 는 v2 backlog.

## Follow-up Intents

이 의도 완료 후 자연스럽게 따라오는 후속 후보:

1. **home-route-split** (clarified, 2026-05-14) — `/` 랜딩/`/my` 워크스페이스 분리. admin 분리와 무관하게 독립 진행 가능.
2. **surface-tone-pass** (deferred) — 콘텐츠 채워진 후 surface 톤 정렬.
3. **mcp public traction signals** (v2 후보) — public repo 에 README + 사용 예제 + 외부 PR 받기 시작하면 별 의도화.

## Learnings

### 2026-05-14: Wedge A done — orphan-detection saved one extra file

- `adminSurface.ts` in `viewer/src/layouts/` was orphaned after `AdminLayout` deletion. Codex caught it via the `*admin*` zero-hit invariant in the verification step — not via direct enumeration. The lesson: write the verification as a *property* ("zero hits in this pattern") rather than a *file list*, and follow-up orphans surface automatically.
- A.2 sandbox `pnpm install` failure was non-fatal: registry blocked but local pnpm cache had identical viewer-version deps. Running `pnpm install` from the host shell unblocked it in 2s. **Implication**: when sandbox networking blocks dep fetches, falling back to host install is safe iff versions are pre-aligned with another workspace package.
- The `cp` (not `git mv`) strategy let viewer stay fully functional throughout A.2/A.3 — only A.4 deleted from viewer. This made each wedge independently revertable (delete admin/ to undo A.1-A.3; revert viewer router.tsx + restore deleted files via git to undo A.4). Worth the duplication during the transition window.
- viewer's `/dashboard`-pointing Links in `Onboarding/WorkspaceHub/UnifiedLayout` are a real footgun: admin is localhost-only now, so these Links navigate to a 404 on openhow.io. Out-of-A.4-scope per the intent's metric, but should be the very first task in any follow-up "viewer surface cleanup" wedge.

### 2026-05-14: seed → clarified (iteration 1, single session)

- **Background**: 5-13 openhow 정체성 lock 후 첫 구조적 재정렬. UI 표면 정리 (composer-deprecation done) 와 콘텐츠 표면 정렬 (study-community-board) 와 별개로, **패키지 경계 자체** 가 정체성을 반영해야 한다는 인사이트.
- **User signal**: "core, admin, 그리고 이 프로젝트 자체는 mcp 에 가까운거같고" — openhow 자체가 *AI 콘텐츠 프로토콜* 이라는 한 단계 상위 framing. 단순 publishing tool 이 아니라 protocol layer.
- **Key decisions**:
  - 솔로 운영 → admin Cloudflare 배포 불필요 (공격 표면 축소 부수효과)
  - mcp 만 공개, 나머지 Gitea private → subtree push 로 single source-of-truth 유지
  - core 위치 그대로 — `~/sideProjects/openhow/core/` 이동 안 함
- **Why not 멀티레포**: 솔로 + 동일 Cloudflare 인프라 + types 공유 빈도 높음 → 모노레포가 운영비 더 낮음. mcp 만 외부 격리는 subtree 로 충분.
- **5 wedge 합의된 순서**: A (admin 분리, blast radius 최대 — 먼저) → B (admin 운영 설정) → C (mcp 추출) → D (mcp 공개 mirror) → E (types 잔재 정리).
- **Confidence**: clarified. wedge 별 metric 명시됨. Wedge A 부터 즉시 진입 가능.
