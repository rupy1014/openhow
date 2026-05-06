---
status: done
created: 2026-04-29
updated: 2026-04-29
iteration: 1
domain: docs
stage: build
---

# members-only-ssg-gate — 멤버 전용 워크스페이스 SSG 본문 보호 + SEO 유지

## Why

`joinPolicy: invite_only` / `defaultAccessLevel: team` 인 멤버 전용 워크스페이스(예: class.clauders.ai)에서 `openhow publish` 가 정적 HTML 에 풀 본문을 그대로 박는다. 비로그인 방문자가 URL 만 알면 거의 모든 내용을 읽을 수 있어 멤버십 가치가 깨진다.

그렇다고 SSG 자체를 빼면 검색 유입을 잃는다. **"검색은 가능 + 본문은 멤버만"** 양립이 필요하다. `paywalled-seo-v1` 이 paid 워크스페이스용으로 같은 양립을 풀었으므로, 같은 메커니즘을 access-level 차원으로 확장한다.

## What (iter 1)

핵심 결정 — 사용자 확인 (2026-04-29):
- **무료 미리보기 문서 N개** + **per-doc accessLevel override** 둘 다 지원 (Stripe/Coursera 패턴)
- 무료 문서: 풀 SSG (SEO 최강)
- 멤버 전용 문서: title + description + H1 + 첫 H2 까지만 + CTA. body 누수 차단
- nav 모든 문서 노출, 잠긴 문서엔 락 아이콘
- Google paywalled content 권장 JSON-LD (`isAccessibleForFree: false` + `hasPart.cssSelector`)

### v1 항목

- [v1] **SSG access-level 게이트 확장** — `core/packages/cli/src/ssg/buildHtml.ts:264-270` `previewMarkdown` 결정 로직 확장. 현재 `isPaidWorkspace && docPrice > 0` 만 게이트 → 추가로 `effectiveAccessLevel in ('team', 'private')` 도 게이트. 두 조건 OR. → **metric: 멤버 전용 문서 SSG HTML grep 으로 본문 후반부 텍스트 미존재 확인**

- [v1] **freePreviewDocs 워크스페이스 설정** — `openhow.json` 에 `freePreviewDocs: number` 추가 (`commands/config.ts` WORKSPACE_KEYS, README 문서화). `publish.ts` 에서 nav 순서로 앞 N 개 문서는 effectiveAccessLevel = 'public'. per-doc frontmatter `accessLevel` 이 명시되면 그 값 우선. resolve 순서: **per-doc frontmatter > freePreviewDocs (앞 N개) > defaultAccessLevel**. → **metric: clauders.ai openhow.json 에 freePreviewDocs:4 publish → 1-4번 문서 풀, 5번부터 preview**

- [v1] **JSON-LD paywalled meta** — 멤버 전용 문서 HTML `<head>` 에 `<script type="application/ld+json">` 추가. `@type: "Article"`, `isAccessibleForFree: "False"`, `hasPart: { @type: "WebPageElement", isAccessibleForFree: "False", cssSelector: ".md-paywalled-body" }`. `buildSeoMeta.ts` 에 `paywalled: boolean` 옵션 추가. → **metric: 멤버 전용 페이지 view-source 에 JSON-LD 블록 + Google Rich Results Test 통과**

- [v1] **CTA 블록 + body 클래스** — preview markdown 에 본문 wrapper class `md-paywalled-body` (JSON-LD selector 와 일치). preview 끝에 자동 추가되는 CTA HTML: "이 문서는 멤버만 볼 수 있어요" + 로그인/가입 버튼. SSG_CSS 에 fade-out 그라디언트 + CTA 박스 스타일. → **metric: clauders.ai 5번째 이상 문서 끝에 fade + CTA 보이고, 로그인 버튼 클릭 시 `/login?redirect=...` 이동**

- [v1] **사이드바 락 아이콘** — `buildSidebarHtml` 에서 docSlug 별 effectiveAccessLevel map 받아, team/private 항목에 `data-locked="1"` + 🔒 SVG 추가. SSG_CSS 에 `.ssg-sidebar-link[data-locked="1"]::after` 스타일. → **metric: clauders.ai 사이드바에서 잠긴 문서 옆에 락 아이콘**

- [v1] **clauders.ai 적용** — `examples/clauders.ai/openhow.json` 에 `joinPolicy: "invite_only"`, `defaultAccessLevel: "team"`, `freePreviewDocs: 4` 추가. publish 후 Playwright 로 비로그인 모드에서 1-4번 풀 본문 + 5번부터 preview/CTA 검증. → **metric: 시나리오 5개 (풀 4개, 잠금 ≥1개, JSON-LD 존재, nav 락 아이콘, CTA 클릭 동작) 모두 pass**

## Not

- 결제/구독 플로우 — `paywalled-seo-v1` 영역
- 멤버 가입/초대 플로우 — joinPolicy 자체
- 워크스페이스 관리 UI 변경 — 본 의도는 SSG/publish 만 대상
- SPA 측 동작 — SSG publish 본만 다룸 (런타임 worker permission 은 이미 동작)
- 다국어/locale 별 CTA 문구 — Backlog
- 멤버 전용 문서의 결제 유도 패턴 — Backlog (이번엔 무료 멤버십 가입만)

## Context

### 부모 의도

- `core/paywalled-seo-v1` (done) — 같은 양립 (SEO + 본문 보호) 의 **paid** 버전. `buildPaywallPreviewMarkdown` (H2 절단), `buildSeoMeta`, manifest `accessLevel` 등 모든 메커니즘이 이미 있음. 본 의도는 게이트 조건만 access-level 차원으로 확장.

### 핵심 변경 지점

- `core/packages/cli/src/ssg/buildHtml.ts:264-270` — `previewMarkdown` 결정 로직
- `core/packages/cli/src/ssg/buildSidebarHtml` (정확한 위치 확인 필요) — nav 락 아이콘
- `core/packages/cli/src/ssg/buildSeoMeta.ts` — JSON-LD paywalled
- `core/packages/cli/src/ssg/ssgStyles.ts` — fade/CTA/락 CSS
- `core/packages/cli/src/commands/publish.ts:1309-1339` — manifestDocs 의 effectiveAccessLevel 계산 (freePreviewDocs 반영)
- `core/packages/cli/src/commands/config.ts:9` — WORKSPACE_KEYS 에 freePreviewDocs 추가

### 후방호환

- 기존 paid 워크스페이스 동작 변경 X (paywall OR access-level)
- `freePreviewDocs` 미설정 + `defaultAccessLevel: public` (대부분 docs) → effectiveAccessLevel = public → 풀 본문 (현재 동작 유지)
- 영향: `defaultAccessLevel: team` 워크스페이스 (소수) 가 처음으로 게이트 받음

### 메모리 정합성

- "페이월 본문 가려도 좌측 카탈로그/nav 는 비회원에게 보여야" — 본 안 동일. nav 노출 + 락 표시
- "PRD 기술분석 노출 금지" — 본 의도 클로즈 시 사용자 출력은 결과 + 다음 행동만

## Footprint (iter 1, 2026-04-29)

### 변경 파일
- `core/packages/types/src/config.ts` — `WorkspaceConfig.freePreviewDocs?: number | null` 추가
- `core/packages/cli/src/commands/config.ts` — `WORKSPACE_KEYS` 에 `freePreviewDocs` + usage 출력문 갱신
- `core/packages/cli/src/commands/publish.ts` — `hasExplicitAccessLevel`, `buildEffectiveAccessLevelMap` 헬퍼 신설; `manifestDocs.accessLevel` 및 SSG/HTML/data export 모두 effective map 사용; `resolveSsgAssetHostDocumentSlug` 에 effective map 전달
- `core/packages/cli/src/ssg/buildHtml.ts` — `effectiveAccessLevelMap` param + `lockedSlugs` 도출 + member/paid OR 게이트 + `<div class="md-paywalled-body">` wrapper + `buildPaywallCta` (member/paid mode 분기) + `paywalled:true` 를 buildSeoMeta 로 전달
- `core/packages/cli/src/ssg/buildSeoMeta.ts` — `paywalled?: boolean` param + JSON-LD `Article` (`isAccessibleForFree:"False"` + `hasPart.cssSelector:".md-paywalled-body"`); `</script` 탈출 처리
- `core/packages/cli/src/ssg/buildNavigation.ts` — `BuildSidebarHtmlParams.lockedSlugs?: Set<string>` + `renderItems`/`renderGroups`/`renderInlineItems` 시그니처 확장 + `<a data-locked="1">` 출력 (sidebar/blog 양쪽)
- `core/packages/cli/src/ssg/ssgStyles.ts` — `.md-paywalled-body` (mask-image fade), `.ssg-paywall-cta*`, `.ssg-sidebar-link[data-locked="1"]::after` SVG lock icon, dark-mode 분기
- `examples/clauders.ai/openhow.json` — `joinPolicy:"invite_only"`, `defaultAccessLevel:"team"`, `freePreviewDocs:4`

### 검증 결과
- `pnpm --filter @openhow/cli build` 통과
- `dist/index.mjs` smoke-grep: `freePreviewDocs`, `md-paywalled-body`, `ssg-paywall-cta`, `isAccessibleForFree`, `data-locked`, `buildEffectiveAccessLevelMap`, `WebPageElement` 모두 포함됨 ✅
- `examples/clauders.ai/openhow.json` 유효 JSON ✅

### 미완 / Deferred
- (없음) — 컨텐츠 리스트럭처 별도 커밋 후 publish 완료. 프로덕션 검증도 완료.

### 프로덕션 검증 (2026-04-29, post-publish)
- `https://class.clauders.ai/getting-started/00-welcome` (free, idx 1): paywall 클래스 없음, sidebar `data-locked` 존재 ✅
- `https://class.clauders.ai/getting-started/04-create-project` (gated, idx 5): `isAccessibleForFree` + `md-paywalled-body` + `ssg-paywall-cta` + 한글 CTA "이 글은" 모두 존재 ✅
- `https://class.clauders.ai/claude-code-intro/01-model-choice` (gated, idx 6+): paywall 메타/wrapper/CTA 모두 존재 ✅
- 5/5 시나리오 pass

### 결정 메모
- 멤버 전용 문서 기본 `freeSections` 는 `defaultFreeSections ?? 1` 로 fallback (paid 와 동일 정책). per-doc frontmatter `freeSections` override 그대로 동작.
- per-doc `accessLevel` frontmatter 명시 시 freePreviewDocs 보다 우선. 즉 멤버 전용 워크스페이스에서도 frontmatter `accessLevel: public` 으로 특정 문서를 강제 공개 가능 (Stripe/Coursera 패턴).
- JSON-LD 안의 텍스트 값에 HTML escape 적용 안 함 (Google 파서가 entity decode 안 보장). 대신 `</script` 만 `<\/script` 로 안전 탈출 — script 탈출 방지.

## Backlog

- 다국어 CTA 문구
- 멤버 전용 문서별 미리보기 길이 커스텀 (`previewSections` per-doc)
- "처음 N 분간 무료" 같은 시간 기반 게이트
- 락 아이콘 hover tooltip ("로그인하면 읽을 수 있어요")
- 멤버 전용 문서의 OG 이미지에 "MEMBERS ONLY" 워터마크 자동 합성
