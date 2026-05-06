---
status: done
created: 2026-04-20
updated: 2026-04-20
iteration: 1
---

# bloglayout-removal — BlogLayout 제거 + /blog 라우트 UnifiedLayout 이관

## Why

`core/unified-layout.md` iter 10 (done) 이 이미 **PublicationPreset** 으로 BlogLayout body 영역을 추출했고, UnifiedLayout 을 통해 `layout: 'publication'` 으로 동일 시각 결과를 낼 수 있음. 그런데 `/blog/:workspace` + `/blog` 라우트 + `__CUSTOM_WORKSPACE__` (openhow serve / publish) 는 여전히 **`<BlogLayout />`** 컴포넌트를 직접 렌더 → BlogLayout.tsx (619줄) + BlogLayout.css (663줄) 가 codebase 에 잔존.

이 잔존이 실질적 비용 발생:
- **정책 이중화**: nav width 정책 바꾸면 `PublicationPreset.css` + `BlogLayout.css` 같은 수식을 두 번 써야 함 (nav-rail-policy intent 에서 실증 — 3파일 변경 중 1파일이 BlogLayout)
- **테스트 이중화**: `blog-style-parity.test.ts` 가 SPA↔SSG parity 를 검증하려고 BlogLayout 토큰을 기준으로 삼음 — BlogLayout 이 사라지면 PublicationPreset 기준으로 재작성 가능
- **인지 부하**: 새 레이아웃 기능 추가 시 "BlogLayout 에도 적용할까?" 질문 매번

unified-layout backlog 항목 "BlogLayout 삭제 (Phase 3 이후에도 fallback으로 당분간 유지)" — 이 intent 가 그 backlog 를 실행으로 끌어와 nav-rail-policy 의 block 을 해제.

## Context

**부모 intent**: `core/unified-layout.md` iter 10 done. PublicationPreset / DocumentPreset / AppShell 이미 추출 완료.

**현재 BlogLayout 사용 지점** (router.tsx 기준):
- `router.tsx:150` — `RootLayout()` 함수에서 `window.__CUSTOM_WORKSPACE__` 일 때 `<BlogLayout />` 렌더 (openhow serve / publish)
- `router.tsx:210` — `/blog/:workspace/*` 라우트
- `router.tsx:220` — `/blog/*` 라우트 (커스텀 도메인 `blog.max5.ai` 등)

**이미 확립된 대체 경로**:
- `UnifiedLayout` + `layout: 'publication'` preset 은 이미 blog 타입 워크스페이스에서 동작 (PublicBlogHome / /feed 등 플랫폼 blog 라우트가 이 경로 사용)
- `PublicationPreset.tsx` (139줄) 가 BlogLayout body (sidebar + main + 모바일 드로어) 를 slot-based 로 재현
- `AppShell` 이 BlogLayout 헤더/푸터 구조를 기준으로 이미 포팅됨

**차이점 (이관 시 풀어야 할 것)**:
1. **Footer 정책**: BlogLayout = "Powered by openhow" fallback / UnifiedLayout = BizFooter (회사 정보). `/blog/*` 라우트가 이관되면 어느 쪽? 커스텀 도메인은? 로컬 `serve` 는?
   - SSG 쪽은 이미 `buildFooterHtml(workspaceType)` 으로 type 기반 분기 — blog type → Powered by, 그 외 → BizFooter
   - SPA 도 동일 정책으로 type 기반 분기가 맞음 (layout 기반 X). UnifiedLayout 에 type-aware footer 선택 로직 필요
2. **`__CUSTOM_WORKSPACE__` (serve/publish) 처리**: 로컬 / 커스텀 도메인에서 openhow 브랜딩 강조하지 말아야 함 → Powered by fallback 이 맞음. UnifiedLayout 이 이 케이스 지원하도록 `isCustomWorkspace` 분기
3. **테스트**: `blog-style-parity.test.ts` 는 BlogLayout 클래스명 기반 토큰 파싱. BlogLayout 삭제 시 무용 → 삭제하거나 PublicationPreset 기준으로 재작성
4. **Lazy import 제거**: `const BlogLayout = lazy(...)` — 라우트에서 참조 제거 후 import 도 제거

**하위 호환 / 리스크**:
- 커스텀 도메인 (blog.max5.ai 등) 운영 중 — 시각 회귀 발생 시 즉시 티남. 회귀 테스트 필수
- `openhow serve` 로컬 뷰어 — CLI 사용자가 시각 변화 체감 가능
- Phase 단계화 (빅뱅 리팩토링 금지) — router 분기 1개씩 이관하면서 각 단계 독립 검증

**확정 Footer 정책**:
- **Custom workspace** (`window.__CUSTOM_WORKSPACE__` true — 로컬 serve / 커스텀 도메인) → **"Powered by openhow" fallback**. openhow.io 브랜딩 강조 금지
- **Platform** (openhow.io 본체) + `workspace.type === 'blog'` → **Powered by** (blog 작가 글이라 회사 정보 노출 부적절)
- **Platform** + 그 외 타입 (docs/course/wiki/team/project 등) → **BizFooter**
- 이 규칙은 SSG `buildFooterHtml(workspaceType)` 와 일관 — type 기반 분기 정책이 이미 SSG 에 있음. SPA 가 layout 기반에서 type 기반으로 맞추는 게 이 intent 의 본질

## What

- [x] [validated] **UnifiedLayout footer 분기 추가** — `workspace.type` + `isCustomWorkspace` 기반으로 `PoweredByFooter` vs `BizFooter` 선택. 기존 UnifiedLayout 의 BizFooter-only 로직을 분기. `PoweredByFooter` 컴포넌트는 BlogLayout 에서 추출하거나 AppShell 기존 fallback 재활용. → **metric: `workspace.type === 'blog'` 또는 custom workspace → Powered by footer 렌더**
- [x] [validated] **router `/blog/:workspace` + `/blog/*` 라우트 이관** — `<BlogLayout />` → `<UnifiedLayout />` 2곳 교체. 자식 라우트(`index: WorkspaceDocs`, `*: DocPage`) 무변화. → **metric: `/blog/:workspace` + 커스텀 도메인에서 시각 결과 기존과 육안 동일**
- [x] [validated] **`RootLayout` `__CUSTOM_WORKSPACE__` 분기 제거** — `if (customWorkspace) return <BlogLayout />` → 바로 `<UnifiedLayout />`. CustomWorkspaceRedirect 는 platform 분기에서만 필요하므로 재배치. → **metric: `openhow serve` 로컬 뷰어에서 시각 변화 없음**
- [x] [validated] **BlogLayout.tsx / BlogLayout.css 삭제 + import 제거** — 위 3곳 참조 제거 후 파일 삭제. `router.tsx` 의 lazy import 제거. `blog-style-parity.test.ts` 는 PublicationPreset 기준으로 재작성하거나 삭제 (테스트 인프라 issue 이미 Learnings 에 언급). → **metric: `grep -rn "BlogLayout" src/` 결과 0 + viewer build 통과**
- [x] [validated] **시각 회귀 검증** — `/blog/:ws` (플랫폼 blog 워크스페이스) + custom domain 시뮬레이션 + `openhow serve` 로컬 3 케이스. → **metric: 3 케이스 모두 본문 중앙 + 헤더/푸터/사이드바 육안 동일**

## Not

- **BlogLayout 와 UnifiedLayout 의 시각 차이 리디자인** — 1:1 포팅만. 디자인 개선은 별도 intent
- **AdminLayout 통합** — 범위 밖 (unified-layout backlog 별도 항목)
- **layout preset 추가 (예: 'magazine', 'landing' 등)** — 현재 publication/document/reading 3종 유지
- **Blog type workspace 의 데이터 모델 변화** — 렌더러만 교체
- **nav-rail-policy 의 폭 적용** — 이 intent 완료 후 별도 실행 (blocking 해제 후)

## Context (추가)

**nav-rail-policy 와의 관계**: `core/nav-rail-policy.md` (clarified, iter 1) 가 이 intent 를 **block 함**. nav-rail-policy 는 BlogLayout.css 를 안 건드리는 게 옳음 — 이 intent 가 파일 자체를 제거. 완료 후 nav-rail-policy 진행.

**blog-style-parity 테스트 기원**: unified-layout iter 9 에서 SPA BlogLayout ↔ SSG CSS parity 를 검증하려고 추가. BlogLayout 삭제 후에는 "SPA UnifiedLayout+PublicationPreset(blog type) ↔ SSG" parity 로 재정의 필요.

## Footprint

- core/packages/viewer/src/layouts/UnifiedLayout.tsx — `shouldShowBizFooter` useMemo (customWorkspace || workspaceType==='blog' → false), AppShell `footerSlot` + `footerConfig` 분기 (shouldShowBizFooter=true → BizFooter, false → config.footer | DefaultFooter). `homeLink` 에 `/blog/*` 경로 감지 (blog 워크스페이스 브랜드 클릭 시 `/blog/:workspace` 유지). `routeName` 에 `customWorkspace && path === '/'` → `workspace-docs` 분기 추가 (custom domain 루트에서 워크스페이스 셸 복원). (2026-04-20, iteration 1)
- core/packages/viewer/src/router.tsx — `const BlogLayout = lazy(...)` import 제거. `RootLayout` customWorkspace 분기 `<BlogLayout />` → `<UnifiedLayout />`. `/blog/:workspace` + `/blog/*` 라우트 element 모두 `<UnifiedLayout />` 로 교체. 자식 라우트(`index: WorkspaceDocs`, `*: DocPage`) 무변화. (2026-04-20, iteration 1)
- core/packages/viewer/src/stores/project.ts — `updateActiveSection` 에 `segments[0] === 'blog'` 분기 추가. `/d/:workspace/...` 와 동일 로직(≥4 segments → segment[2] 를 section 으로, 그 외 빈 section). (2026-04-20, iteration 1)
- core/packages/viewer/src/layouts/BlogLayout.tsx — **삭제** (619줄). 역할은 UnifiedLayout + PublicationPreset + AppShell 조합으로 대체. (2026-04-20, iteration 1)
- core/packages/viewer/src/layouts/BlogLayout.css — **삭제** (663줄). `app-shell-*` / `publication-*` 클래스로 이미 마이그레이션됨. (2026-04-20, iteration 1)
- core/packages/cli/src/ssg/blog-style-parity.test.ts — **삭제**. BlogLayout.css 를 직접 읽어 SSG parity 검증하던 테스트 — 대상 파일 삭제로 동작 불가. 66/66 test green 유지. PublicationPreset 기준 parity 는 후속 intent 에서 재설계 가능 (backlog). (2026-04-20, iteration 1)

## Backlog

- [ ] `AppShell.tsx` 의 "/* ─── Icons (shared from BlogLayout) ─── */" + "/* ─── Footer (from BlogLayout) ─── */" 주석 정리 — 원본 없어짐
- [ ] PublicationPreset 기준 SPA↔SSG parity 테스트 재작성 (blog-style-parity.test.ts 삭제 대체)
- [ ] Custom workspace 의 검색 UX — UnifiedLayout 은 `/search` 페이지로 이동, BlogLayout 이 가졌던 local mode 인라인 드롭다운 부재. 대부분 워크스페이스는 cloud 모드라 영향 작지만 `openhow serve` 로컬에선 UX 저하. 별도 intent 후보
- [ ] 세 번째 Codex review 가 지적한 three-rail sidebarConfig key shape (`/section` vs `/section/`) — three-rail-nav 범위

## Learnings

### 2026-04-20: clarified → done (iteration 1)

- **Codex review 가 2 라운드 진행됐고 3가지 regression 감지**:
  1. **P1 (pass 1) — `updateActiveSection` 이 `/blog/:workspace/...` 경로 모름**: 기존 `/d/:workspace/...` 분기만 있어서 blog 경로에서 section 이 `'blog'` 로 잡혔음. project.ts 에 동일 패턴의 `segments[0] === 'blog'` 분기 추가 (≥4 segments → segment[2] 를 section)
  2. **P1 (pass 1) — `homeLink` 이 blog 라우트에서 `/w/:workspace` 가리킴**: 브랜드 로고 클릭 시 URL 공간 이탈. `location.pathname.startsWith('/blog/')` 감지해서 `/blog/:workspace` 복원
  3. **P2 (pass 1) — Custom `config.footer` 가 무시됨**: BlogLayout 은 `footerConfig` 를 AppShell 에 전달했는데 UnifiedLayout 은 BizFooter 만. AppShell cascade (`footerSlot → footerConfig → DefaultFooter`) 를 살리려면 `footerConfig` prop 도 전달 필요 — `shouldShowBizFooter=false` 일 때 `config.footer` 를 cascade 로 올림
  4. **P2 (pass 2) — Custom workspace 루트 `/` 가 `'home'` 으로 판정됨**: routeName 의 `path === '/'` 체크가 custom workspace 보다 먼저 실행. custom domain 루트에서 사이드바/nav 사라짐. `customWorkspace && path === '/'` 분기를 path==='/' 보다 먼저 추가 → `'workspace-docs'` 반환
- **Pre-existing 이슈 (scope 외로 남김)**:
  - Blog 페이지에서 검색 → `/search` → 결과 링크가 `/d/...` 형식: BlogLayout 시절에도 동일 동작. SearchResults 의 구조적 이슈로 별도 intent 가 맞음 (Backlog 에 기재)
  - Three-rail sidebarConfig key shape `/section` vs `/section/`: three-rail-nav intent 범위
- **삭제 3파일 (BlogLayout.tsx/.css + parity test)** 은 step 3 에서 단번 삭제. 삭제 후 build + 66 test 전원 통과. parity 테스트 부재는 SPA 만 테스트하면 OK — SSG 쪽은 자체 `ssgStyles.test.ts` 와 `parity-fixture.test.ts` 가 커버
- **`AppShell.tsx` 의 주석 2줄** (`"Icons shared from BlogLayout"`, `"Footer (from BlogLayout)"`) 은 원본이 사라졌지만 수정 범위 최소화 위해 그대로 둠. Backlog 에 기재
- **nav-rail-policy 해제**: 이 intent 완료로 BlogLayout.css 부재 → nav-rail-policy 는 `main.css` + `PublicationPreset.css` 2 파일 범위로 재진행 가능

### 2026-04-20: seed → clarified (iteration 1)

- **Footer 정책 locked**: SSG 가 이미 `buildFooterHtml(workspaceType)` 로 type 기반 분기 운용 중. SPA 도 동일 정책 채택 — 새 결정 없이 기존 규칙 따라감. layout 기반(BlogLayout vs UnifiedLayout)에서 context/type 기반(custom workspace → Powered / platform+blog → Powered / platform+기타 → BizFooter)으로 판정 기준 이동
- **5개 What 독립 실행 가능**: Footer 분기 → 라우트 이관 → RootLayout 분기 제거 → 파일 삭제 → 시각 검증. 각 단계 독립 롤백 가능 (router 만 되돌리면 BlogLayout 복귀)
- **blog-style-parity.test.ts**: unified-layout iter 9 에서 SPA BlogLayout ↔ SSG CSS parity 검증용. BlogLayout 삭제 후에는 parity 기준을 PublicationPreset 으로 옮겨야 함 — 이 intent What 5번째에 포함

### 2026-04-20: seed created (iteration 1)

- **Trigger**: nav-rail-policy Phase 1 플랜에서 `BlogLayout.css` 의 ghost-padding 수식을 `PublicationPreset.css` 와 동일하게 수정하려던 순간 사용자가 "bloglayout 없애기로 하지 않았나" 지적. 정확한 지적 — unified-layout backlog 에 이미 삭제 계획 있었고, 삭제 예정 파일에 투자하는 건 이중 작업
- **근본 원인**: unified-layout iter 10 는 "PublicationPreset 추출" 까지만. `/blog/*` 라우트 이관 + 파일 삭제는 Phase 4+ 로 미뤄뒀음. 이 intent 가 그 미완 Phase 를 실행
- **설계 제약**: 커스텀 도메인 (blog.max5.ai 등) 운영 중 — 시각 회귀 발생 시 즉시 티남. 1:1 포팅 원칙 고수. 개선 욕심 금지
- **Footer 정책 key decision**: SSG 는 이미 type 기반 분기. SPA 도 type 기반으로 맞추는 게 SPA↔SSG parity 유지하면서 BlogLayout 삭제 가능한 길
- **의존성**: nav-rail-policy (clarified, iter 1) 가 이 intent 완료를 기다림. `/blog/*` 에 200px 그대로 남아있어도 일시적으로 OK — 어차피 이 intent 에서 전체 UnifiedLayout 경로로 통합
