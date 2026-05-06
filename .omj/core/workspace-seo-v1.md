---
status: done
created: 2026-04-16
updated: 2026-04-17
iteration: 2
---

# workspace-seo-v1 — 워크스페이스별 SEO·애널리틱스 설정 (v1)

## Why

현재 각 워크스페이스(`examples/*`, 프로덕션 워크스페이스)는 `title` / `description` / `ogImageUrl` 3개만 개별 지정 가능하다. 그래서 워크스페이스 소유자가 **Google Analytics 붙이기**, **Search Console로 사이트 등록**, **sitemap 제출** 같은 기본 SEO 루틴을 못 돈다 — 설정 훅 자체가 없어서 코드를 고치지 않는 한 불가능.

플랫폼으로서 워크스페이스에 "내 GA4 ID 넣고 검색엔진에 등록하면 유입 생긴다"를 주는 게 1차 목표. 마케팅 기능 추가가 아니라 **플랫폼 플러밍**을 까는 작업.

## What

- [validated] **(v1) MdshareConfig schema + DB 확장** — 새 필드 추가: `googleAnalyticsId`, `googleTagManagerId`, `siteVerification: { google?, naver?, bing? }`, `canonicalBaseUrl`, `favicons: { ico, touchIcon, ... }` → **metric**: `core/packages/types/src/config.ts` 타입 정의 + migration 추가되고 `pnpm build` 통과
- [hypothesis] **(v1) SSG 렌더링 반영** — `buildSeoMeta.ts` 가 GA/GTM `<script>`, verification `<meta>`, 커스텀 `<link rel="canonical">`, favicon `<link>` 세트 출력 → **metric**: `core/packages/cli/src/ssg/template.test.ts` 에 테스트 케이스 추가, `openhow publish` 결과물에 태그 포함 확인
- [hypothesis] **(v1) SPA 런타임 반영** — `useDocumentMeta` 또는 별도 훅이 GA4 페이지뷰 이벤트 발송, 클라이언트 라우팅 시 canonical 갱신 → **metric**: `/blog/clauders.ai` → `/blog/clauders.ai/article` 이동 시 GA 이벤트 2회 기록
- [hypothesis] **(v1) robots.txt + sitemap.xml 자동 생성** — SSG 빌드 시 워크스페이스별 `robots.txt` + `sitemap.xml` 산출, 공개 워크스페이스만 포함 → **metric**: `sitemap.xml` 에 published page URL 전부, `robots.txt` 에 sitemap 경로 명시
- [hypothesis] **(v1) Admin UI — Settings에 "SEO & 통계" 섹션 추가** — `AdminSettings.tsx` 에 입력 폼: GA4 ID, GTM ID, Search Console 인증 토큰 3개(Google/Naver/Bing), canonical URL → **metric**: Admin 페이지에서 입력·저장 → API 반영 → 퍼블리시 후 실제 태그 노출
- [hypothesis] **(v1) `openhow.json` 에서도 설정 가능** — DB 없는 로컬 SSG 경로에서도 `openhow.json` 의 동일 필드 읽어서 SSG에 주입 → **metric**: `examples/toss-tech/openhow.json` 에 GA ID 넣고 `openhow publish` 결과에 태그 확인

## Not

- v2 항목 (Clarity, Kakao/FB Pixel, 사업자 정보, 쿠키 동의 배너, AdSense) — 별도 인텐트
- v3 항목 (JSON-LD, hreflang, Algolia, Sentry, Ask AI 위젯, custom `<head>` injection, AI 크롤러 차단) — 별도 인텐트
- 마케팅 콘텐츠/카피/캠페인 기획 — 이 인텐트는 플러밍만
- 유료 SEO 서비스 API 연동 (Ahrefs, SEMrush 등)

## Context

### 현재 지원 범위 (스냅샷)

| 위치 | 이미 되는 것 |
|------|-------------|
| `core/packages/types/src/config.ts:85` | `MdshareConfig`: `title`, `description`, `ogImageUrl`, `theme`, `footer`, `teamBlog`, `navigation`, `layout`, `contentWidth`, `scan`, `sort` |
| `core/packages/types/src/workspace.ts:1` | `Workspace`: `description`, `ogImageUrl`, `logoUrl` |
| `core/packages/worker/migrations/0018_add_workspace_seo.sql` | DB `workspace` 테이블에 `description`, `og_image_url` 컬럼 |
| `core/packages/cli/src/ssg/buildSeoMeta.ts:29` | `<title>`, `meta description`, `og:title/description/image`, `twitter:card`, `canonical` 출력 |
| `core/packages/viewer/src/hooks/useDocumentMeta.ts:82` | SPA 라우팅 시 meta/canonical 동기화 |
| `core/packages/viewer/src/pages/admin/AdminSettings.tsx:57` | Admin SEO 섹션: description + ogImageUrl 입력 |

### 영향 파일 (예상)

- `packages/types/src/config.ts`, `workspace.ts` — 스키마
- `packages/worker/migrations/00NN_*.sql` — 새 컬럼 (analytics_ids, verification_tokens, canonical_url, favicon_urls)
- `packages/worker/src/db/schema.ts`, `routes/workspaces.ts` — Drizzle + API
- `packages/cli/src/ssg/buildSeoMeta.ts` — head 태그 확장
- `packages/cli/src/ssg/template.ts`, `buildHtml.ts` — GA/GTM script 삽입
- `packages/cli/src/ssg/` (신규) — robots.txt, sitemap.xml 생성기
- `packages/cli/src/commands/publish.ts` / `export.ts` — 생성물 업로드
- `packages/viewer/index.html` — GA/GTM 런타임 초기화 (프로덕션 워크스페이스)
- `packages/viewer/src/pages/admin/AdminSettings.tsx` — 입력 폼 추가
- 타겟 워크스페이스 (`examples/*/openhow.json`) — 필드 사용 예시

### 전제

- GA4 는 `gtag.js` 또는 GTM 두 경로 — 우선순위는 **GTM 있으면 GTM만 로드**, 없으면 `gtag.js` 직접.
- Canonical base URL 은 커스텀 도메인 워크스페이스에서만 의미 있음. 없으면 `openhow.io/d/{slug}` 자동.
- **2026-04-30 forward note**: `creator-platform-discovery` (exploring) 에서 v1 MVP URL 정책으로 워크스페이스 landing = `openhow.io/w/{slug}`, 개별 doc = 기존 `/d/`/`/blog/`/`/c/` 유지로 결정. customDomain 은 인프라 동작하나 셀프서비스 안 함 (운영자 본인용만 비공개 사용). 본 의도(done) 의 `/d/{slug}` 자동 fallback 은 그대로 유효하지만, discovery 채택 시 `/w/{slug}/` namespace canonical 케이스가 추가될 수 있음.
- Admin UI 에서 verification 토큰은 **저장만 하면 즉시 `<meta>` 로 노출** — 별도 "검증 요청" 버튼 불필요.
- Favicon 업로드는 R2 버킷 저장. sizes 자동 변환은 v1 에서 스킵하고 단일 원본 URL + `type` 힌트만.

### 의존성

- `@openhow/types` publish 필요 (0.1.2 예상) — cli 가 이걸 참조.
- DB migration 은 prod D1 에 반영해야 Admin UI 가 쓸 수 있음.

## Footprint

### 초기 플러밍 (iteration 1, 2026-04-16~17)
- `core/packages/types/src/config.ts` — `FaviconConfig` 추가, `MdshareConfig` 에 SEO/verification/favicon 필드 추가
- `core/packages/types/src/workspace.ts` — 워크스페이스 API 응답 타입에 `ga4MeasurementId` 및 확장 SEO 필드 추가
- `core/packages/worker/src/db/schema.ts` — `workspace` 테이블에 GTM, verification 3종, canonical, favicons JSON 컬럼 추가
- `core/packages/worker/migrations/0053_add_workspace_seo_extended.sql` — 신규 nullable 컬럼 6개 추가 migration 생성
- `core/packages/worker/src/routes/workspaces.ts` — settings PUT body 및 update 로직에 신규 필드 저장 추가
- `core/packages/worker/src/routes/documents.ts` — 워크스페이스 응답에 신규 필드 serialize, `faviconsJson` deserialize 추가
- `core/packages/worker/package.json` — 요청된 검증 명령을 위해 `build: tsc --noEmit` 스크립트 추가
- `core/packages/viewer/src/pages/admin/AdminSettings.tsx` — Settings UI에 GA4/GTM/verification/favicon 입력 섹션 추가

### 리뷰 클로즈아웃 (iteration 2, 2026-04-17)
- `core/packages/viewer/src/pages/DocPage.tsx` — GA4/GTM init 정확도 및 trackEvent 이중 경로 해결
  - round 1: GTM 모드 trackEvent가 `dataLayer.push({event,...})` fallback 추가 (gtag shim 없는 GTM-only 워크스페이스에서 이벤트 유실 해결)
  - round 1: canonical root — custom `canonicalBaseUrl` + slug가 `index`/`readme`일 때 root 반환 (SSG와 동일)
  - round 2: SPA `initGA4`/`initGTM`의 전역 boolean flag → ID-keyed memo (`ga4LoadedId`/`gtmLoadedId`)로 워크스페이스 교차 네비 시 재초기화
  - round 3: `trackEvent` 가 현재 workspace의 `googleTagManagerId` 기준으로 dispatch (stale gtag로 GTM 이벤트가 흘러가지 않도록)
  - round 3: `lastTrackedSlugRef` 를 `workspace.id::slug` 조합으로 변경 (워크스페이스 교차 시 같은 slug 이벤트 유실 방지)
- `core/packages/viewer/src/hooks/useDocumentMeta.ts` — `verification` / `favicons` 옵션 추가, DocPage가 workspace 값 전달 (SPA에서 admin 설정이 실시간 반영)
- `core/packages/cli/src/ssg/buildSeoMeta.ts` — GA4 `gtag('config',...)` 에 `send_page_view:false` 추가 (SSG auto page_view ↔ 하이드레이션 트래킹 중복 제거)
- `core/packages/cli/src/ssg/buildHtml.ts` — `computeIsIndexable` 에 `accessLevel`/`access_level` 별칭 지원 (비공개 문서 색인 유출 방지)
- `core/packages/cli/src/ssg/buildSeoArtifacts.ts` — sitemap 필터에도 동일 access 별칭 반영
- `core/packages/cli/src/commands/export.ts` / `publish.ts` — sitemap/robots 아티팩트를 `artifactBase` 가 절대 URL일 때만 생성 (상대 base 시 경고 후 skip)

## Backlog

### Round 4 review findings — 별도 iteration으로 분리 (2026-04-17)
3 rounds의 review-fix 루프를 돌린 뒤 Round 4에서 발견된 4건 P1. 모두 현재 배포 상 즉각적 데이터 유출/장애는 없지만(SSG 퍼블리시 사이트가 아직 많지 않음, 커스텀 도메인 워크스페이스도 제한적), SSG 사이트가 늘어날 때 필수. 별도 scope로 다룰 것:

- **[P1] SSG manifest에 content metadata 직렬화** — `publish.ts:1268-1283`, `export.ts` 유사 지점. `manifestDocs` 에 `contentType`/`ctaType`/`topicTags` 추가. 없으면 하이드레이션 후 CTA 블록/콘텐츠 타입 UI 동작 안 함.
- **[P1] SSG manifest.workspace에 SEO 필드 포함** — `publish.ts:1297-1313`. `canonicalBaseUrl`, verification 3종, favicons, `ga4MeasurementId`, `googleTagManagerId` 추가. 현재 생략되어 SSG 하이드레이션 후 canonical/verification/favicon 미적용.
- **[P1] Custom domain에서 글로벌 sitemap fallback 차단** — `worker/src/index.ts:76-77`. `getCustomDomainSeoArtifact()` 가 null 반환 시 글로벌 generator로 떨어져, 해당 도메인에 다른 워크스페이스 URL이 섞여 노출. 커스텀 도메인 경로에서는 404 또는 404+재퍼블리시 안내로 종결해야.
- **[P1] GTM 컨테이너 교차-워크스페이스 teardown** — `DocPage.tsx:104-110` (round 3에서 재-init 허용했으나 이전 `<script>`/`dataLayer` 정리 안 함). 두 워크스페이스 모두의 GTM container가 shared dataLayer를 구독 → B의 이벤트가 A에도 전송. 해결책 후보: (a) init 전에 기존 GTM script 태그 제거 + dataLayer 초기화, (b) SPA 워크스페이스 전환 시 full reload 강제, (c) GTM loaded 후 워크스페이스 전환 시 경고.

### 기존 Backlog
- **v2 파일** — `workspace-seo-v2.md` (Clarity, Kakao/FB Pixel, 쿠키 동의, 사업자 정보, AdSense)
- **v3 파일** — `workspace-seo-v3.md` (JSON-LD, hreflang, Algolia, Sentry, Ask AI, custom head, AI 크롤러 차단)
- IndexNow API 연동 — 퍼블리시 시 네이버/빙 즉시색인 자동 요청

## Learnings

### 2026-04-17: (iteration 2) 리뷰-수정 루프 3회로 초기 배포 가능 수준 확보 — building → done
- **배경**: gpters-seo-flywheel 완료 후 남겨진 Codex review 3건(GTM dataLayer 미포워딩, live viewer verification/favicon 미주입, index/readme canonical 미처리)을 클로즈아웃하는 과정에서 또 다른 regression들이 연쇄적으로 드러남. 3 rounds의 fix-review-fix-review 끝에 **SSG/live viewer 경로에서의 SEO/analytics 정확도**는 배포 가능 수준에 도달.
- **학습 1 — review loop는 수렴 보장 없음**: 각 수정이 새 엣지 케이스를 노출. Round 1 fix 1(GTM dataLayer fallback)이 round 2에서 "stale gtag 미처리" 버그로, round 2 fix C(global boolean → ID memo)가 round 4에서 "GTM 컨테이너 teardown 없음"으로 이어짐. **3 rounds 안에 critical은 잡지만, 그 이상은 스코프 드리프트 위험 증가**.
- **학습 2 — 초기 설계에서 SSG manifest 미고려**: SSG export/publish 경로가 `manifest.json`을 통해 `loadWorkspace`/`loadDocument`에 초기 상태를 넘기는데, workspace-seo-v1 + gpters-seo-flywheel 둘 다 manifest 직렬화를 업데이트하지 않음. SPA만 본 검증으로 "정답" 처리했으나, SSG 사이트에서는 새 필드가 `undefined` → CTA/SEO 미동작. Round 4에서 발견 → Backlog로 분리.
- **학습 3 — 멀티-워크스페이스 SPA 나비게이션은 analytics의 최대 엣지 케이스**: GA4/GTM 어느 쪽도 "한 SPA 세션 내 워크스페이스 전환" 시나리오를 완전히 커버하지 못함. GTM 컨테이너 교체는 특히 어려움(dataLayer 공유, script 누적, 재-init API 없음). 실전에선 풀 리로드 강제가 가장 안전할 수 있음.
- **학습 4 — accessLevel 별칭 일관성**: frontmatter에서 `accessLevel` / `access_level` / `access` 3가지가 허용되지만, 신규 SEO 게이트는 `access`만 체크. publish 파이프라인의 `resolveAccessLevel()` 헬퍼를 재사용하지 않아 발생. **공통 헬퍼를 SSG 쪽에도 노출**하는 것이 맞음 (future refactor).
- **결정**: Round 4에 새로 드러난 4건 P1은 현시점 배포 블로커가 아님(SSG 퍼블리시 사이트 적음, 커스텀 도메인 제한적). 별도 Backlog로 이관, 이번 iteration은 여기서 종료. 후속은 새 intent 또는 workspace-seo-v1 iteration 3로.
- **Scope**: _root (core monorepo — types / worker / viewer / cli 전역)

### 2026-04-16: seed created (iteration 1)
- **Background**: 8개 예제 워크스페이스 중 GA·Search Console 을 개별로 연결할 수 있는 곳이 0개. `openhow.json` 스키마에 훅이 없고 DB 에도 컬럼이 없음.
- **Initial notes**:
  - 이미 깔린 SEO 플러밍 (`buildSeoMeta.ts`, migration 0018, `useDocumentMeta`) 이 있어서 확장 포인트는 명확.
  - 분할 전략: v1(이 인텐트) = 한국 시장 진입에 필수인 최소 세트, v2 = 커머스·광고, v3 = 고급·escape hatch.
  - 마케팅 도메인 태그는 **안 붙였음** — 실제 작업은 스키마/DB/SSG 플러밍이라 `/omj:build` 의 마케팅 에이전트 스폰이 맞지 않음. 필요하면 사용자가 override.
