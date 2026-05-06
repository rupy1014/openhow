---
status: done
created: 2026-04-13
updated: 2026-05-06
iteration: 5
related: creator-platform-discovery.md, creator-platform.md, core/platform-admin-workspace-exposure-v1.md, openhow-positioning-clauders-seo.md
---

# public-blog-home — openhow 홈을 공개 블로그 랜딩으로 전환

## Why

openhow 콘텐츠가 로그인 뒤에 숨어있어서 외부 유입 경로가 없다. 공개 블로그 형태의 홈으로 검색/SNS/유튜브에서 유입시키고, 무료 콘텐츠로 DAU/MAU를 쌓는다. 수익화(인강, 기수제)는 트래픽이 깔린 뒤에 붙인다.

## Context

- openhow는 workspace 기반 콘텐츠 플랫폼. 현재 홈은 워크스페이스 목록/대시보드 형태.
- `examples/toss-tech`에서 team-blog preset을 이미 검증함 — 카테고리, 저자, 썸네일, 에디토리얼 홈 구성.
- 이번 홈은 **개별 워크스페이스가 아니라 플랫폼 전체의 랜딩**. 여러 공개 워크스페이스의 아티클을 모아서 보여주는 "메타 블로그".
- 작가 = 워크스페이스명. 개별 워크스페이스가 하나의 매거진/칼럼 역할.
- 기존 auth-gate-ux 의도(공개 블로그 로그인 잔상 제거)와 시너지 — 홈이 공개되면 auth 잔상 문제도 함께 해결해야 함.
- **퍼널 구조 (2026-04-15 전환)**: 유튜브(발견) → openhow 무료 콘텐츠(DAU/MAU) → 인강(비동기 유료) + clauders 기수제(동기 유료). 구독 모델은 DAU가 충분히 쌓인 후 재검토.
- **2026-04-30 정합성 신호 — 정체성 결정 미해결**: `creator-platform-discovery` (exploring) 가 v1 MVP 를 "지식플랫폼 = 인강 + 기수제 인강 + 학생 게시판 + SEO" 로 좁힘. 본 home 의 "워크스페이스 그리드 + contentType 섹션" 구조는 그 정체성과 정합. 동시에 `editorial-traffic-engine` (exploring) 가 "에디터 큐레이션" 정체성으로 home 의 1순위 노출 단위를 **에디터 픽 글**로 바꿀 가능성 있음 — 결정 시 home 카드 모델 재설계 (워크스페이스 중심 → 토픽 허브 + 큐레이션 글 중심) 필요. 본 building iter 4 작업은 워크스페이스 중심 그대로 진행하되, editorial-traffic-engine 결정 채택 시 iter 5 피봇 가능성 인지.
- **openhow 기존 인프라**: 인증(Better Auth), CF Workers + D1 + R2, 결제(Bootpay) — 결제/구독 인프라는 구현 완료 상태이나 당분간 미사용. 무료 공개 우선.
- **초기 워크스페이스**: `vibe-coding`(바이브코딩 20챕터, sequential), `vibe-planning`(바이브기획, sequential), `ax-usecases`(AX 유즈케이스, blog)
- clauders.ai는 커뮤니티 브랜드 + 기수제 전환에 집중.
- **워크스페이스 유형별 콘텐츠 성격이 다름**:
  - `sequential` (course/book) — 커리큘럼, 챕터 순서가 중요. 최신글 단독 노출이 맥락을 깨뜨림.
  - `blog` — 독립 포스트, 시간순 나열 자연스러움.
  - `wiki/docs` — 레퍼런스, 홈에 노출할 성격이 아닐 수 있음.

## What

- [x] **Phase 0: UX 스토리보드** — toss.tech 레퍼런스 기반 화면 플로우 설계

- [x] 공개 피드 API (`/api/public/feed`) — 워크스페이스 + 아티클 데이터 제공

- [x] **Phase 1: 워크스페이스 display strategy 반영** — 워크스페이스의 `sort`/`type` 값을 기반으로 홈 카드 분기

  - `sort = 'menu'` 또는 `type = course/book` → **시리즈 카드** (전체 N화, 표지, 설명, "1화부터 시작" CTA)
  - `sort = 'date-desc'` 또는 `type = blog` → **최신 아티클 카드** (기존 방식)
  - 워크스페이스 오너가 설정한 값을 홈이 참조하는 구조 (기계적 판단 아님)
  - 헤더 없이 MainLayout 헤더만 사용 (완료)

- [ ] **워크스페이스 Admin UI에 display 설정 노출** — type/sort/navigationMode 변경 UI

  - 현재 DB 스키마에 필드 존재하지만 Admin UI에서 변경 불가
  - 최소: sort 모드 선택 (커리큘럼 순서 / 최신순 / 수동 정렬)
  - 이 설정이 홈의 카드 표현과 워크스페이스 내부 정렬 모두에 반영

- [x] **iter 5: 디스커버리 진열대로 / 복귀 (롱블랙-pivot)** — 2026-05-04 정체성 재잠금 + 5-6 admin gate(platform_exposure) 구현 후속 (완료 2026-05-06)

  - `Home.tsx` 비로그인 분기: `CreatorSaasHome` → `PublicBlogHome` 스왑 ✅
  - `router.tsx`: 마케팅 LP 는 `/for-creators` 로 이동 ✅
  - `public-feed` API: workspace SELECT 에 `platformExposure` 추가 + featured-first 정렬 ✅
  - `PublicBlogHome` 워크스페이스 그리드: featured 티어 시각 차별화 (outline + Featured 라벨) ✅
  - 데이터 출구 정합: superadmin 이 admin 화면에서 listed/featured 토글 → 홈에 즉시 반영 ✅ (코어 c5e3ae0 + 본 iter 3164844 두 단계로 닫힘)

- [x] 에디토리얼 섹션 구성 — 롱블랙처럼 테마/유형별 섹션

  - "시리즈 시작하기" (sort=menu인 워크스페이스) ← 구현 완료
  - "최신 아티클" (sort=date-desc인 워크스페이스의 개별 포스트만) ← 구현 완료
  - "워크스페이스 둘러보기" (전체 공개 워크스페이스 카드) ← 히어로로 대체

- [x] 공개 피드 API v2 — 워크스페이스별 아티클 수, sort/type 정보, 시리즈 정보(첫 화/마지막 화) 제공
  - 단, articleCount는 100개 슬라이스 기반. 대규모 확장 시 별도 쿼리 필요.

- [ ] 개별 아티클 공개 페이지 (SEO 메타, OG 태그, RSS)

- [x] **Phase 2: 카드/헤더 디자인 리뉴얼** — shadow-heavy → border 기반 플랫 스타일로 전환 완료
  - 카드: `box-shadow` 전부 제거, `border-color` 변화만으로 hover 표현
  - hero/media: 복잡한 radial-gradient → `var(--surface-elevated)` 단색
  - CTA 버튼: shadow hover → `opacity: 0.88` 전환
  - dark mode shadow 블록 삭제

- [x] **Phase 3: 비로그인 랜딩 스왑** — `Home.tsx`에서 `MarketingHome` → `PublicBlogHome` 교체
  - 현재: 비로그인 방문 시 hero/슬로건/3단계 CTA 등 마케팅 카피(MarketingHome)가 뜸
  - 목표: 랜딩 즉시 큐레이션된 콘텐츠(PublicBlogHome) 노출 — SSG 워크스페이스 홈과 동일한 톤
  - MarketingHome.tsx(252줄) / Home.css(408줄) 제거 완료

- [x] **Phase 4: 디자인 시스템 통일 + 데이터 품질 필터** — 워크스페이스 톤으로 재설계
  - Worker: 설명·OG·아티클 모두 없는 스텁 워크스페이스(9개) 서버측 제외
  - 프론트: 거대 Hero(460px) 제거 → 워크스페이스 그리드 우선. fallback 문구("워크스페이스에 담긴 공개 아티클을 차례대로 만나보세요.") 삭제. 빈 섹션 자동 숨김
  - 카드 톤: `.course-card`/`.team-blog-series-card`와 동일한 border + 16px radius + soft gradient + primary-color kicker + translateY hover
  - 0화 워크스페이스는 "N화 시리즈" 대신 타입 배지만 노출, CTA는 "둘러보기"
  - `--publication-card-radius-lg`, `--shadow-md`, `--surface-muted` 등 viewer 전역 토큰 사용 (하드코딩 제거)

## Not

- 구독/결제 게이트 (무료 우선. DAU 충분히 쌓인 후 재검토)
- 워크스페이스 오너 수익 분배 모델
- 비공개 워크스페이스 콘텐츠 노출
- CMS/에디터 기능 변경
- openhow 브랜드를 전면에 내세우기 (유저는 콘텐츠를 소비, 플랫폼 인식 불필요)
- **toss.tech 스타일 아티클 시간순 피드** — 커리큘럼 워크스페이스와 맞지 않음
- **개별 아티클만으로 홈 구성** — 시리즈 맥락 없이 챕터가 뜨면 혼란

## Learnings

### 2026-05-06: iter 5 [done] — 디스커버리 진열대 복귀 + DB 드리프트 정리

- **시도**: Home.tsx 스왑 (CreatorSaasHome → PublicBlogHome), router.tsx 에 `/for-creators` 추가, public-feed featured-first 정렬, PublicBlogHome featured 티어 시각화 (outline + Featured 라벨).
- **결과**: 5 파일 변경 (core@3164844). `/` 라우팅 검증 OK, `/for-creators` 라우팅 OK. featured 시각 차별화는 prod 데이터 또는 시드 필요 (로컬 DB 비어있음).
- **부수효과 — DB 드리프트 정리**: `/api/public/feed` 가 fresh 로컬 DB 에서 500 으로 깨지던 이슈를 끝까지 추적해 fix (core@9a09518).
  - 0017 `join_policy` ALTER 중복 (이미 0001 에 있음) → 중복 제거
  - 0020 `type/default_access_level/navigation_mode` ALTER 중복 (이미 0001 에 있음) → no-op 화
  - 0061 `document.thumbnail` 컬럼 누락 → 새 마이그레이션 추가 (schema.ts 에는 있었지만 어떤 마이그레이션도 만들지 않았음 — sequential drift)
  - 0059 SEO overrides 마이그레이션 등록
  - 결과: `rm -rf .wrangler/state/v3/d1 && pnpm wrangler d1 migrations apply mdshare-db --local` 한 줄로 fresh 재구축 가능. API 200 OK 검증.
- **배운 것**:
  - **Drizzle schema vs migration drift 는 자동 검출 안 됨** — `thumbnail` 처럼 schema.ts 에 직접 추가됐지만 마이그레이션 누락이면 production 환경에서는 prod 가 이미 hand-altered 라 안 깨지고, 신규 dev 환경만 깨진다 (silent footgun).
  - **migration dedup 은 prod safe** — idempotent ALTER (이미 컬럼 있으면 ALTER 가 fail) 라서, 중복 제거는 prod 영향 없음. 신규 dev 환경 살아남.
  - 이번 진열대 복귀의 데이터 출구는 superadmin gate (`workspace.platform_exposure`). featured 토글 → 홈 출력 흐름이 닫힘. 글 큐레이션 (featured_content 테이블 활용) 은 별도 의도로 분리 (현재 PublicBlogHome 의 editorPicks 섹션 자체는 이미 동작).
- **다음 행동**: 시각 차별화 검증은 prod 노출 후 자연스레 가능. 추가 의도 후보:
  - 로컬 시드 워크스페이스 (DAU 측정 / dev 검증용 더미 데이터)
  - Drizzle schema-vs-migration 정합성 lint
  - 글 단위 큐레이션 섹션 노출 (featured_content 활용)

### 2026-05-06: [signal] iter 5 — 4-30 lock 폐기, 롱블랙 재잠금 후 디스커버리 진열대 복귀

- **사용자 결정 (2026-05-04 → 5-6)**: openhow = 롱블랙-style 큐레이션 multi-tenant. iter 4 Phase 3 의 PublicBlogHome 스왑이 4-30 lock 으로 CreatorSaasHome 으로 되돌아갔던 걸, 이번에 다시 복구.
- **새 데이터 출구**: `core/platform-admin-workspace-exposure-v1` (5-6 done) 가 superadmin gate (`workspace.platform_exposure` hidden|listed|featured) 를 깔았음. 본 의도 iter 5 는 그 데이터의 시각적 출구.
- **선택**: `/` 교체 (진열대를 메인 홈으로) + `/for-creators` 신설 (마케팅 LP). 단위는 워크스페이스 그리드 (글 큐레이션은 별도 의도 — featured_content 테이블에 있음, 추후 섹션화 가능).
- **남는 자산**: PublicBlogHome.tsx (401줄, 4-30 시점 자산) + public-feed API + featuredContent 테이블 — 모두 그대로 사용. 루트 라우트 스왑 + featured tier 시각화만.
- **logged-in 분기**: 일단 WorkspaceHub 유지 (creator 본인 자산 우선). 추후 로그인 사용자도 디스커버리 우선 노출 검토 가능.

### 2026-04-30: [signal] 정체성 결정으로 본 의도 피봇 필요 — "에디토리얼 홈" → "크리에이터 가입 LP"
- **사용자 결정 (editorial-traffic-engine kill, α 선택)**: openhow.io/ 홈을 **liveklass 식 크리에이터 가입 세일즈 LP** 로 재정의. 즉 본 의도의 toss.tech-style 에디토리얼 홈 (워크스페이스 카드 + contentType 섹션) 컨셉은 폐기 대상.
- **새 홈 골격 (α 옵션 미리보기 기반)**:
  1. Hero: "나만의 클래스 5분 만에" + [지금 시작하기] CTA
  2. 성공 사례 카드 그리드 (= 활성 크리에이터/클래스 쇼케이스)
  3. 기능 / 가격 / 파트너 / 신뢰 시그널
- **남는 자산**: workspace 메타 (creator name, contentType, 썸네일) 는 쇼케이스 카드 데이터로 재사용 가능. SSG 인프라도 그대로 사용.
- **다음 행동**: 본 의도 status `building` → 피봇 모드. Why·What 전면 재작성 필요. 별도 /omj:prd pivot 세션에서 처리.

- \[signal\] 콘텐츠 유입 경로가 없어서 성장이 막혀있다는 인식
- toss.tech 예제에서 blog + team-blog preset으로 에디토리얼 홈 구현 가능 확인 (examples/toss-tech)
- 롱블랙 모델 참조: 무료 미리보기 + 구독 전문 → 이번엔 전체 공개로 시작, 유입 확인 후 게이트 도입
- Worker 호출 최소화가 핵심 제약. 매 게시글마다 인증 Worker 호출하면 비용/성능 문제
- 구독 아키텍처 결론: JWT 클라이언트 게이팅 방식 채택 예정
  - 로그인/결제/갱신 시에만 Worker 호출 → 서명된 JWT 발급 (plan, expiresAt 포함)
  - 매 페이지 방문은 클라이언트에서 JWT decode로 구독 상태 판단 (Worker 0회)
  - 공개 홈/목록/미리보기는 정적 CDN에서 서빙 (Worker 0회)
  - 4,900원 콘텐츠에 DRM 수준 보호는 과잉 — 롱블랙/뉴닉도 클라이언트 게이팅
- 더 단단한 옵션: 유료 본문을 별도 API로 분리 로딩 (`GET /api/article/:id/body`) + Cloudflare Cache API 캐싱 → 같은 유저 재방문 시 Worker 스킵

### 2026-04-13: toss.tech UX 레퍼런스 분석

- **시도**: toss.tech 홈 페이지 UI/UX 구조 분석
- **결과**: 콘텐츠 발견성에 최적화된 기술 블로그의 정석 패턴 확인
- **배운 것**:
  - **레이아웃**: 스티키 헤더 + 히어로 슬라이더(피처드 2\~3개) + 전체 아티클 그리드 + 인기글 사이드바 + 아티클 시리즈
  - **네비게이션**: 수평 카테고리 탭(Engineering/Design/Product) — openhow에서는 워크스페이스를 카테고리로 매핑 가능
  - **카드 UI**: 썸네일(상단) + 카테고리 뱃지(좌상단) + 제목(bold) + 부제목 + 저자명. 균등 간격 그리드
  - **시리즈**: 연속 콘텐츠를 묶어서 "아티클 시리즈" 섹션으로 노출 — sequential 워크스페이스와 1:1 매핑
  - **CTA 배치**: 구독하기 + 채용 바로가기가 헤더 우측 상단. openhow에선 "구독" + "콘텐츠 만들기"로 대응
  - **디자인 톤**: 시맨틱 CSS 변수(`--color-semantic-*`), 깔끔한 산세리프, 넉넉한 여백, 다크모드 대응 기반
  - **인터랙션**: 호버 시 링크 색상 변화 + 밑줄, 페이지네이션(번호식), GA 로깅 내장
  - **피드백**: 글 하단 독자 의견 수집 위젯, 댓글 게시판
  - **SEO**: OG 메타 풍부, primaryKeyword/relatedKeywords 내장, RSS 피드(/rss.xml)
- **의도 변경**: What에 UX 스토리보드 Phase 0 추가 필요. 기능 나열 → 화면 플로우 설계로 전환

### 2026-04-13: /omj:build 공개 블로그 홈 구현

- **시도**: Worker API(public-feed) + PublicBlogHome 컴포넌트 + CSS + Home.tsx 연결
- **결과**: 4개 스텝 구현 완료. Codex 리뷰에서 3개 이슈 발견 → 즉시 수정
- **배운 것**:
  - joinPolicy와 공개성은 다른 개념 — wiki(approval+public)처럼 가입 정책과 문서 공개 여부가 독립적. 피드 필터는 defaultAccessLevel만으로 판단해야 함
  - 글로벌 LIMIT으로 아티클을 자르면 특정 워크스페이스가 빈 탭으로 보이는 문제 발생 → limit을 100으로 완화
  - `'all'` 같은 평범한 문자열을 sentinel로 쓰면 워크스페이스 slug과 충돌 가능 → `'__all__'` 사용
  - core/는 git submodule이므로 Codex 변경 사항은 submodule 안에서 확인해야 함
- **의도 변경**: Phase 0 + 스티키 헤더 + 히어로 + 아티클 그리드 + 인기글 사이드바 완료. 시리즈 섹션과 SEO/RSS 미착수

### 2026-04-14: 디자인 피드백 — shadow-heavy 카드 스타일 거슬림
- **시도**: 구현된 홈 확인
- **결과**: 카드에 box-shadow가 과하게 사용됨. hover시 `0 18px 40px` 같은 강한 shadow + `translateY(-2px)` 조합이 "병신같은" 느낌을 줌. 헤더도 개선 필요.
- **배운 것**:
  - shadow 대신 border + subtle inset shadow가 블로그 톤에 더 맞음
  - 현재 `color-mix()` 기반 border는 유지하되, elevation(box-shadow) 효과를 걷어내야 함
  - 헤더부터 카드까지 전반적인 디자인 톤 리뉴얼 필요
- **의도 변경**: What에 Phase 2 "카드/헤더 디자인 리뉴얼" 추가

### 2026-04-15: 퍼널 전환 — 구독 모델 → 무료 DAU/MAU 중심
- **시도**: 비즈니스 모델 재검토. 롱블랙형 월 4,900원 구독 + 인강 + 기수제 조합의 결이 맞는지 논의
- **결과**: 구독 모델 철회. 무료 배포로 DAU/MAU를 먼저 쌓고, 수익화는 인강(비동기) + 기수제(동기)로 분리
- **배운 것**:
  - 롱블랙형 "읽는 구독"과 기수제 "만드는 경험"은 타겟 고객의 온도차가 큼 (관망자 vs 실행자)
  - 무료 콘텐츠는 "퍼주는 것"이 아니라 매일 돌아오게 만드는 DAU 엔진
  - 결제 인프라(Bootpay, JWT 게이팅)는 이미 구현 완료 상태이므로 무료→유료 전환 비용이 낮음
  - 퍼널: 유튜브(발견) → openhow 무료(체류/습관) → 인강(입문 유료) → 기수제(실전 유료)
- **의도 변경**: Why, Context, Not, Backlog 전면 갱신. 구독 관련 항목 제거/보류 처리

### 2026-04-14: /omj:build Phase 2 카드 디자인 리뉴얼
- **시도**: PublicBlogHome.css에서 box-shadow 전면 제거, border-color 기반 hover로 전환
- **결과**: 1파일 26줄 변경 (6 삽입, 20 삭제). 빌드 통과.
- **배운 것**:
  - shadow 제거만으로 디자인 톤이 크게 달라짐 — 기존 BlogLayout과 일관성 확보
  - gradient 배경도 단색으로 단순화하니 카드가 훨씬 깔끔해짐
  - CTA 버튼은 shadow 대신 opacity 변화가 블로그 톤에 맞음
- **의도 변경**: Phase 2 완료 체크

### 2026-04-13: 피벗 — toss.tech 아티클 피드 → 롱블랙 스타일 워크스페이스 쇼케이스

- **시도**: 구현 후 로컬 확인 → 커리큘럼 워크스페이스 콘텐츠가 시간순 피드에 안 맞는 문제 발견
- **결과**: 피벗 결정. 아티클 중심 → 워크스페이스 중심으로 홈 구성 전환.
- **배운 것**:
  - openhow의 핵심 콘텐츠는 **sequential 워크스페이스(커리큘럼)**. 독립 블로그 포스트와 성격이 다름.
  - toss.tech 모델은 독립 포스트 기반 기술 블로그에 최적. 커리큘럼에는 맞지 않음.
  - 롱블랙 모델: 에디토리얼 큐레이션 + 테마별 섹션 + 시리즈 진입점 → openhow의 sequential 워크스페이스와 궁합이 좋음.
  - **워크스페이스 타입별 다른 카드 표현이 필요**: sequential = 시리즈 카드(N화, 1화부터 CTA), blog = 최신 아티클 카드.
  - 롱블랙 홈 구조: TODAY(긴급성) → 스테디셀러(인기) → 테마별 컬렉션(캐러셀) → 지난 노트(무한스크롤). 섹션마다 다른 레이아웃(carousel, list, rank).
  - 기존 구현(PublicBlogHome + public-feed API)은 유지하되, UI 구조를 워크스페이스 중심으로 재설계 필요.
- **의도 변경**: status를 exploring으로 되돌림. What에 "롱블랙 스타일 피벗" 항목 추가. Not에 "toss.tech 스타일 아티클 시간순 피드" 추가.

### 2026-04-14: 워크스페이스 display strategy 갭 발견

- **시도**: 피벗 후 "어떻게 워크스페이스별로 다른 카드를 보여줄까" 탐색
- **결과**: DB 스키마에 `sort`(date-desc/date-asc/menu), `type`(course/blog/...) 필드가 이미 존재. 백엔드 프리셋도 타입별 자동 설정됨. 그러나 Admin UI에서 변경 불가.
- **배운 것**:
  - `sort = 'menu'`면 커리큘럼(순서 중요), `sort = 'date-desc'`면 블로그(최신순). 이 구분이 홈의 카드 표현을 결정하는 자연스러운 기준.
  - CLI의 `_meta.json`은 sort를 수동 제어하지만, 웹 Admin UI에서는 이 설정에 접근 불가 — CLI 중심 설계의 잔재.
  - 워크스페이스 type 변경 UI도 없음. 생성 시 type이 결정되면 이후 바꿀 수 없음.
  - 공개 피드 API가 `sort`/`type` 필드를 이미 내려주므로, 프론트엔드가 이 값으로 카드 분기만 하면 됨.
  - Admin UI 설정 노출은 별도 의도(`workspace-ux-improvement`)로 분리하는 게 적정. 홈 피벗은 기존 DB 값을 읽기만 하면 됨.
- **의도 변경**: What에 "Admin UI display 설정 노출" 추가했으나, 홈 피벗과 독립적으로 진행 가능.

### 2026-04-17: [signal] 랜딩이 여전히 마케팅 카피 — 큐레이션 홈 원함
- **시도**: 로컬에서 `/` 접속 확인
- **결과**: `Home.tsx:31` 에서 `MarketingHome`(252줄, hero/슬로건/3단계/워크스페이스 타입 소개) 렌더. PublicBlogHome은 구현 완료됐으나 라우팅 연결 안 됨
- **배운 것**:
  - 2026-04-13 커밋이 유실된 상태 그대로 남아있었음 (footprint 기록과 실제 코드 불일치)
  - 유저 피드백: 거창한 카피 불필요, 바로 큐레이션 되는 홈이 맞음 — SSG 워크스페이스 홈과 톤 통일
- **의도 변경**: Phase 3 추가, status는 `building` 유지

### 2026-04-17: [signal] Phase 3 후 재확인 — 큐레이션이 상당히 별로
- **시도**: PublicBlogHome 렌더 후 스크린샷 검증
- **결과**: 3가지 근본 원인
  1. 공개 워크스페이스 14개 중 **아티클 0개** — feed의 popular/latest/tutorials/cases/faqs/featured/newAuthors 전부 빈 배열
  2. 스텁 워크스페이스 9개(Documentation x2, Felix, sermons, youtube 등)가 필터 없이 노출
  3. Hero 460px + "0화 시리즈" + 동일한 fallback description 반복 → 큐레이션이 아니라 placeholder grid로 보임
- **배운 것**:
  - 서버 피드 쿼리에 `articleCount === 0 && !description && !ogImage` 스텁 제외 필요
  - 프론트 fallback 문구는 "덜 별로"로 보이지 않음 — null이면 숨겨야 진짜 큐레이션 톤
  - 디자인 시스템 문제 이전에 데이터 현실을 그대로 노출하는 게 문제의 중심. 필터 + 빈 섹션 숨김만으로도 디자인이 살아남
  - 카드 톤을 viewer 전역 토큰(`--publication-card-radius-lg`, `--surface-muted`, `--shadow-md`)으로 맞추면 workspace landing과 시각 일체감이 확보됨
- **의도 변경**: Phase 4 추가 (Worker 스텁 필터 + 프론트 레이아웃 재설계), 완료

### 2026-04-14: /omj:build Phase 1 피벗 구현

- **시도**: 공개 피드 API v2 (sort/articleCount/firstArticleSlug 추가) + PublicBlogHome을 워크스페이스 쇼케이스로 피벗
- **결과**: 2스텝 + 1수정으로 완료. Codex 리뷰에서 라우트 미연결(P1) 발견 → 즉시 수정.
- **배운 것**:
  - 이전 세션에서 연결한 코드(index.ts import, Home.tsx 수정)가 커밋되지 않아 유실됨. 세션 종료 전 커밋 필수.
  - articleCount를 기존 articles 배열(limit 100)에서 계산하면 대규모 사이트에서 부정확해짐. 현재 3개 워크스페이스에서는 문제없지만 별도 COUNT 쿼리가 정석.
  - `isSeriesWorkspace`/`isBlogWorkspace` 헬퍼로 분기하면, 새 워크스페이스 타입이 추가돼도 fallback이 자연스러움.
  - WorkspaceLogo 컴포넌트에 fallback(이름 첫 글자)을 넣으면 로고 없는 워크스페이스도 깔끔하게 처리됨.

## Footprint

- core/packages/worker/src/routes/public-feed.ts — 공개 피드 API 엔드포인트 신규 (2026-04-13)
- core/packages/worker/src/index.ts — `/api/public` 라우트 등록 (2026-04-13)
- core/packages/viewer/src/pages/PublicBlogHome.tsx — toss.tech 스타일 공개 블로그 홈 컴포넌트 신규 (2026-04-13) → 피벗 대상
- core/packages/viewer/src/pages/PublicBlogHome.css — 공개 블로그 홈 스타일 신규 (2026-04-13) → 피벗 대상
- core/packages/viewer/src/pages/Home.tsx — 비로그인 시 마케팅 페이지 → PublicBlogHome으로 교체 (2026-04-13 기록됐으나 유실, 2026-04-17 재적용)
- core/packages/viewer/src/pages/MarketingHome.tsx — 삭제 (2026-04-17, 252줄)
- core/packages/viewer/src/pages/Home.css — 삭제 (2026-04-17, 408줄)
- core/packages/worker/src/routes/public-feed.ts — 워크스페이스 스텁(설명·OG·아티클 모두 없음) 제외 필터 추가 (2026-04-17)
- core/packages/viewer/src/pages/PublicBlogHome.tsx — Phase 4 재설계, 596줄 → 325줄 (Hero 제거, 워크스페이스 그리드 우선, 빈 섹션 자동 숨김) (2026-04-17)
- core/packages/viewer/src/pages/PublicBlogHome.css — 워크스페이스 톤으로 전면 재작성, `pbh-*` prefix (2026-04-17)
- core/packages/viewer/src/pages/Home.tsx — 비로그인 분기 CreatorSaasHome → PublicBlogHome 재스왑 (iter 5, 2026-05-06)
- core/packages/viewer/src/router.tsx — `/for-creators` 라우트 신설 (마케팅 LP 보존, iter 5, 2026-05-06)
- core/packages/viewer/src/pages/CreatorSaasHome.tsx, .css — 4-30 자산 신규 등록 (`/for-creators` 에서 사용, iter 5, 2026-05-06)
- core/packages/worker/src/routes/public-feed.ts — workspace SELECT 에 `platformExposure` + featured-first 정렬 (iter 5, 2026-05-06)
- core/packages/viewer/src/pages/PublicBlogHome.tsx, .css — featured 카드 시각 차별화 (outline + Featured 라벨, iter 5, 2026-05-06)
- core/packages/worker/migrations/0017_add_join_policy.sql — `join_policy` 중복 ALTER 제거 (iter 5 부수, 2026-05-06)
- core/packages/worker/migrations/0020_add_workspace_type.sql — type/default_access_level/navigation_mode 중복 ALTER 제거, no-op (iter 5 부수, 2026-05-06)
- core/packages/worker/migrations/0061_add_document_thumbnail.sql — schema.ts 에는 있었지만 누락된 컬럼 마이그레이션 신규 (iter 5 부수, 2026-05-06)

## Backlog

### DAU/MAU 엔진 (우선)
- [ ] RSS 피드 자동 생성
- [ ] 워크스페이스 간 통합 검색
- [ ] 콘텐츠 정기 릴리즈 파이프라인
- [ ] 유튜브 → openhow 유입 CTA 최적화

### 수익화 (DAU 충분히 쌓인 후)
- [x] ~~구독 모델 설계 (4,900원)~~ → 무료 배포로 전환 (2026-04-15). 인프라는 보존, 필요 시 재활성화
- [ ] 인강 판매 페이지 + 결제 연동
- [ ] 기수제 모집 페이지 + clauders.ai 동선 연결
- [ ] 유료 전환 검토 (DAU 지표 기반 판단)