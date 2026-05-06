---
status: done
created: 2026-04-16
updated: 2026-04-30
iteration: 2
related: editorial-traffic-engine.md, creator-platform-discovery.md
---

# gpters-seo-flywheel — creator 콘텐츠를 검색 유입 자산으로 구조화

## Why

openhow는 `creator-platform`(done)에서 "creator 정체성 + 구독 + 이메일"을 깔았고, `public-blog-home`은 플랫폼 홈의 발견 채널을 만드는 중이다. 그러나 creator가 발행하는 개별 글은 아직 **아티클 / 사례 / 튜토리얼 / FAQ** 같은 구조 없이 평면적으로 노출된다. 그래서 검색엔진이 "이 글이 어떤 유형의 콘텐츠인지" 읽기 어렵고, creator도 "내 글이 어떤 CTA로 귀결되는지" 고정할 수 없다.

이번 의도는 **각 creator가 자기 워크스페이스 콘텐츠를 SEO cluster로 구조화**할 수 있게 한다 — 글마다 contentType / ctaType / topicTags를 붙이고, 메인 홈이 그 구조를 활용해 사례·튜토리얼·FAQ 섹션을 분리 노출한다. 발행(=accessLevel: public) 자체가 곧 검색 색인 자격이 되고, 메인 홈 노출만 operator가 featured로 큐레이션한다.

초기 creator는 본인 한 명. 본인 워크스페이스에서 dogfooding하고, 구조가 검증되면 타 creator 온보딩으로 확장한다.

## What

- [validated] **공개 콘텐츠 타입 4종 표준화** — `contentType: 'article' | 'tutorial' | 'case' | 'faq'`. creator가 자기 글에 설정하고, 문서 응답/공개 피드에 포함 → **metric**: 문서 저장/조회 API에서 contentType 읽기·쓰기 가능, public feed가 `tutorials / cases / faqs` 그룹 반환
- [hypothesis] **고정 CTA 시스템** — `ctaType: 'none' | 'waitlist' | 'course' | 'apply'`. creator가 글마다 1개만 지정, 문서 하단 공통 블록으로 렌더 → **metric**: ctaType별 CTA 블록이 문서 하단에 노출되고, 라벨이 ctaType에 따라 다르게 표시
- [hypothesis] **topicTags 입력** — 각 글에 `topicTags: string[]` 설정 가능. 이번 단계에선 입력·저장만. 허브 페이지는 Backlog → **metric**: 문서 수정 시 topicTags 저장·조회, 응답에 포함
- [hypothesis] **메인 홈 contentType별 섹션 추가** — `PublicBlogHome`에 "사례 / 튜토리얼 / FAQ" 섹션 신설. 기존 "추천 시리즈 / 최신 아티클"과 공존 → **metric**: 홈에서 case·tutorial·faq 각 섹션 3개 이상 노출, 카드에 타입 배지 표시
- [hypothesis] **creator 문서 설정 UI** — `contentType / ctaType / topicTags` 편집 UI를 기존 문서 설정 영역에 추가 → **metric**: creator가 admin에서 값 입력 → 저장 → 공개 페이지 반영
- [hypothesis] **SEO 색인 정책 단순화** — `accessLevel: public` + `status: approved` + `hidden: false` = 색인 허용 + sitemap 포함. 별도 승격 상태 게이트 없음 → **metric**: sitemap.xml에 public/approved 문서만 포함, 그 외 `<meta name="robots" content="noindex">` 자동 주입

## Not

- **`promotionStatus` 별도 승격 게이트** — 코호트 모델 전제. creator 소유 워크스페이스에서는 `accessLevel: public`이 곧 발행 의사 (나중에 워크스페이스 옵션 `requireReview`로 추가 가능)
- **에디터/점수 기반 SEO 큐레이션** — post-MVP. 지금은 creator가 발행하면 색인, operator가 `featured`로 메인만 큐레이션하는 2-트랙으로 충분
- **플랫폼 admin이 creator 콘텐츠를 검수/승격 결정** — creator-ownership 원칙 위반 (단, **`editorial-traffic-engine` (exploring, 2026-04-21) 이 이 원칙 자체를 재정의할 가능성** 있음 — 채택 시 본 의도의 SEO 색인 정책이 "에디터 승인 후 색인" 으로 피봇 필요. `creator-platform-discovery` (exploring, 2026-04-30) 는 강사·학생 자율 모델 유지하므로 본 의도와 정합.)
- **topic 허브 페이지 (`/topics/:slug`, `/w/{workspace}/topics/:slug`)** — Backlog (P2)
- **관련 문서 자동 추천 엔진** — Backlog (P2)
- **승격/검수 워크플로우 (internal→review→public)** — Backlog (P3, 워크스페이스 옵션)
- **analytics 이벤트 taxonomy + 성과 리포트** — Backlog (P4, `workspace-seo-v1` GA 플러밍 위에 쌓음)
- **오픈 마켓플레이스 / 추천 알고리즘**
- **CRM / 리드 스코어링 / 광고 자동화**
- **MVP 가격 정책** — `creator-platform` 영역

## Context

### 인접 인텐트 (경계)

| 인텐트 | 축 | 상태 |
|--------|-----|------|
| `creator-platform` | creator 정체성·프로필·구독·이메일 | done |
| `public-blog-home` | 플랫폼 홈 발견 채널 | building |
| `core/workspace-seo-v1` | 워크스페이스 SEO 플러밍 (GA/GTM/sitemap/verification/favicon) | building |
| **`gpters-seo-flywheel`** | **콘텐츠 구조화 (타입·CTA·topic)** | 이 인텐트 |

이 인텐트는 creator-platform 위에 쌓는 "콘텐츠 레이어". workspace-seo-v1의 플러밍이 깔려 있어서, 이번엔 콘텐츠 메타만 추가하면 SEO/피드/홈이 즉시 활용.

### 3층 노출 구조 (이번 의도 + 인접 의도)

- **메인 홈 `/`** — 발견. 아티클 중심 + 추천 시리즈 + **contentType별 섹션(case/tutorial/faq)** (이번 인텐트)
- **플랫폼 topic 허브 `/topics/:slug`** — 검색 랜딩, 여러 creator aggregate (P2 Backlog)
- **워크스페이스 topic `/w/{slug}/topics/:slug`** — creator 공간 내 탐색, 같은 데이터 (P2 Backlog)
- **워크스페이스/작가 홈 `/w/{slug}`, `/s/{username}`** — 몰입, creator-platform 기존

### SEO 정책 원칙

- **발행 = 검색 가능**. maily.so / tistory / Substack 패턴. creator가 `accessLevel: public`으로 낸 글은 검색 색인 자격이 생긴다.
- **메인 홈 노출 ≠ 검색 색인**. 메인은 operator가 `featuredContent`로 수동 큐레이션 (기존 인프라 그대로).
- 얇은 문서 걱정은 creator 본인의 `status: draft/approved` 토글로 관리. 초기 1인 시기엔 자연스럽게 통제됨.

### 저장 위치 결정

- 메타데이터는 **DB 컬럼** (진실 원천). frontmatter import/export는 후순위.
- 이유: 웹 에디터 수정이 핵심 경로고, 피드/SEO/sitemap이 서버에서 안정적으로 읽혀야 함.

## Footprint

- `docs/gpters-seo-flywheel-p1-spec.md` — P1 기능명세 (2026-04-16 작성); 구현 완료 반영 (2026-04-17)
- `core/packages/types/src/document.ts` — `DocumentContentType`, `DocumentCtaType` 타입, Document 인터페이스 필수 3필드 추가 (2026-04-17)
- `core/packages/worker/src/db/schema.ts` — document 테이블 `contentType`, `ctaType`, `topicTagsJson` 컬럼 (drizzle enum/default) (2026-04-17)
- `core/packages/worker/migrations/0054_add_document_content_meta.sql` — 신규 컬럼 migration (2026-04-17)
- `core/packages/worker/src/routes/documents.ts` — safeParseTags helper, list/detail select·map, POST/PUT body 반영 (2026-04-17)
- `core/packages/worker/src/routes/public-feed.ts` — `tutorials / cases / faqs` 그룹 응답 + topicTags 매핑 (2026-04-17)
- `core/packages/cli/src/ssg/buildSeoMeta.ts` — `isIndexable` 옵션 기반 noindex,nofollow 주입 (2026-04-17)
- `core/packages/cli/src/ssg/buildHtml.ts` — `computeIsIndexable(frontmatter)` + buildSeoMeta 호출 (2026-04-17)
- `core/packages/cli/src/ssg/buildSeoArtifacts.ts` — sitemap에서 access/status 게이트 추가 (2026-04-17)
- `core/packages/cli/src/ssg/template.test.ts` — isIndexable 회귀 테스트 (2026-04-17)
- `core/packages/viewer/src/pages/PublicBlogHome.tsx` — 사례/튜토리얼/FAQ 섹션 3종 추가 (CSS 재사용) (2026-04-17)
- `core/packages/viewer/src/pages/DocPage.tsx` — ctaType 기반 문서 하단 CTA 블록 (2026-04-17)
- `core/packages/viewer/src/pages/admin/AdminDocs.tsx` — Content Meta 다이얼로그 (contentType/ctaType/topicTags 입력) (2026-04-17)
- `core/packages/viewer/src/stores/project.ts` — 로컬 모드 Document 리터럴 기본값 동기화 (2026-04-17)

## Backlog

### 후속 Phase (P2~P4)
- **P2: topic 허브** — `/topics/:slug` (플랫폼 전역) + `/w/{slug}/topics/:slug` (워크스페이스 내). 같은 데이터, 렌더만 다름
- **P2.5: 관련 문서 자동 연결** — 태그 기반 문서 하단 "관련 사례/튜토리얼/FAQ/다음 단계" 블록
- **P3: 승격/검수 워크플로우** — 워크스페이스별 옵션 `requireReview: true`. 코호트 운영 시 `internal → review → public` 단계 활성화. creator가 켤 때만 발동
- **P4: analytics + 성과 추적** — `public_doc_view`, `public_cta_click`, `topic_hub_view`, `waitlist_submit`, `apply_click` 이벤트. `workspace-seo-v1` GA 플러밍 위에 쌓음. weekly organic/CTA/전환 리포트

### 운영/정책
- CTA 클릭/전환 이벤트 taxonomy 확정 (P4)
- 초기 topic taxonomy 5~8개 설계 (P2)
- 관련 문서 추천 규칙 (태그 기반 우선, 수동 override 후순위) (P2.5)
- 에디터/점수 기반 SEO 큐레이션 설계 (post-MVP)

## Learnings

### 2026-04-30: [signal] 정체성 결정으로 일부 자산 무관해짐
- **사용자 결정 (editorial-traffic-engine kill, α 선택)**: 외부 임포트 + 에디터 큐레이션 컨셉 폐기. 본 의도가 깐 `contentType / ctaType / topicTags` 메타 레이어와 SEO sitemap·GA·schema.org 플러밍은 **각 클래스(=워크스페이스) 단위 SEO 자산** 으로 그대로 활용 — 본 의도 자체는 done 유지, 다만 "다른 의도가 본 의도 위에 토픽 허브를 쌓는다" 같은 후속 가설은 폐기.
- **무관해진 후속 가설**: 토픽 허브 `/topics/:slug` (P2 Backlog), 관련 문서 자동 연결 (P2.5), 크리에이터 콘텐츠 검수/승격 — 모두 α 정체성과 양립 불가.
- **남는 자산**: contentType/ctaType/topicTags 스키마, sitemap·GA·schema.org 자동화. workspace-scoped 로만 쓰면 됨.
- **재방문 조건**: 12개월 후 트래픽 엔진 재고려 시 본 의도와 _killed/editorial-traffic-engine.md 함께 부활 평가.

### 2026-04-17: (iteration 2) /omj:build 실행 피드백 — clarified → done
- **범위 분리 원칙 확인**: 기존 workspace-seo-v1이 building 상태로 working tree에 공존. 각 Codex step을 "MUST NOT touch workspace-seo-v1 scope"로 제약해서 교차 오염 방지. 1 intent = 1 build 원칙이 멀티 workstream 공존 시 효과적.
- **타입 변경 전파**: Document 인터페이스의 `contentType / ctaType / topicTags`를 **필수**로 만들자 로컬 literal 한 곳(`stores/project.ts`)에서 TS2322 발생 → 즉시 보정. 공유 타입을 optional로 내리는 것보다 엄격한 필수 + 리터럴 보정이 더 안전했음 (런타임 fallback 불필요).
- **storage 표현 vs API 표현 분리**: `topic_tags_json` (TEXT) ↔ `topicTags: string[]`. worker 라우트에 `safeParseTags()` + `withTopicTags<T>()` 헬퍼 한 쌍으로 경계 일원화 — try/catch + Array.isArray + 타입 필터로 악성/레거시 값 방어.
- **Codex 리뷰 결과**: 3건 모두 `workspace-seo-v1` scope (GTM dataLayer 미포워딩, verification/favicon live viewer 미주입, index/readme canonical root 미처리). 이번 인텐트 스코프 밖이라 별도 후속 과제로 분리 — 교차 오염 없음 확인.
- **Scope**: _root (core monorepo)

### 2026-04-16: seed → clarified (iteration 1)
- GPTERS의 방어력은 "콘텐츠 판매"보다 **커뮤니티 산출물의 공개 자산화**에 있다.
- openhow는 이미 공개 홈·워크스페이스·코호트 운영 문서 구조를 갖춰서 토대는 충분하다.
- 첫 실행은 "새 기능 대량 개발"보다 **문서 타입 표준화 + 승격 루프 + CTA 고정**.

### 2026-04-17: [signal] scope 재정돈 — 멀티 크리에이터 관점으로 재작성
- **배경**: 초기 인텐트는 GPTERS식 "커뮤니티 단일 퍼널"을 그대로 이식. Context에서는 creator-ownership 모델을 선언하면서 Plan은 직영 아카데미 패턴(플랫폼 전체 표준화·검수 파이프라인)이었음 — 내적 모순.
- **결정**: openhow는 멀티 크리에이터 플랫폼(초기엔 본인 dogfooding). 이 인텐트는 각 creator가 자기 콘텐츠를 SEO cluster로 구조화할 수 있게 하는 **레이어**로 재정의.
- **인접 인텐트와 경계 정리**:
  - creator-platform (done) = 정체성·구독
  - public-blog-home (building) = 플랫폼 홈 발견
  - workspace-seo-v1 (building) = SEO 플러밍
  - 본 인텐트 = 콘텐츠 구조화 (contentType / ctaType / topicTags)
- **MVP 가격 섹션 제거** — creator-platform 영역.
- **Phase 2-4를 Backlog로 이동** — 1 인텐트 = 1 build 원칙. P1에 집중.

### 2026-04-17: [signal] SEO 색인 정책 단순화 — promotionStatus 드롭
- **유저 피드백**: "모든 메인급 아티클이 SEO 적용되어야 하는 거 아니야? 개인 블로그/발행 서비스처럼 개인 브랜딩 원할 수 있잖아."
- **기존 설계 문제**: `accessLevel: public` (creator 결정) + `promotionStatus: public` (별도 승격) 2-게이트 — creator 입장에서 "발행했는데 검색 안 되는" 상황 발생. maily.so / tistory 사용자 기대와 어긋남.
- **결정**: `promotionStatus` 필드 드롭. SEO 색인 = `accessLevel:public` + `status:approved` + `hidden:false` 단일 게이트. `featured`는 메인 홈 노출만 결정 (기존 `featuredContent` 테이블 그대로).
- **리스크 대응**: 얇은 문서는 creator 자체 `status: draft/approved`로 관리. 코호트 운영 시 필요해지면 P3에서 워크스페이스 옵션 `requireReview`로 복원 가능.
- **MVP 판단**: 에디터/점수 기반 SEO 큐레이션은 post-MVP. 일단 "발행 = 색인"의 단순 모델로.
- **의도 변경**: What에서 promotionStatus 관련 항목 제거, Not에 명시적으로 추가. spec 파일(section 4.2, 5, 6, 7.3, 8, 10) 재작성 필요.

## Plan

구체 기능명세는 `docs/gpters-seo-flywheel-p1-spec.md`.
