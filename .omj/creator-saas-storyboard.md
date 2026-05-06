---
status: reviewed
created: 2026-04-30
updated: 2026-04-30
iteration: 2
related: creator-platform-discovery.md, creator-platform.md, public-blog-home.md, _killed/editorial-traffic-engine.md
domain: ux
stage: storyboard
---

# creator-saas-storyboard — liveklass 벤치마킹 스토리보드 (정체성 α 잠금 후 IA 재구성)

## Why

2026-04-30 정체성 α(liveklass-aligned 순수 크리에이터 SaaS) 잠금 후, 기존 surface 들 (홈, 워크스페이스 진입, 강의, 학생 게시판) 이 **여러 의도에 분산** 되어 있고 한 번도 한 시야로 그려진 적이 없다 → 사용자 발화 "ux 정리가 안되거든" 의 근원.

본 의도는 코드 변경 의도가 아닌 **스토리보드 의도** — Core Rule 11 ("UI intents need a storyboard before coding") 에 따라 liveklass.com 을 1차 레퍼런스로 삼아 openhow 의 핵심 사용자 여정 6 surface 를 ASCII 와이어프레임 + 모듈 단위로 합의한다. 이 합의가 끝나면 각 surface 의 build 의도 (public-blog-home 피봇, course-landing-redesign, lesson-player-v2 등) 가 본 스토리보드를 reference 로 삼아 분리 실행한다.

**핵심 질문**: openhow 가 liveklass 를 어디까지 그대로 따라가고, 어디서 갈라지는가?

## Context — liveklass 벤치마킹 요약 (firecrawl 2026-04-30)

### 플랫폼 surface (`www.liveklass.com`)

| Path | 목적 | 핵심 모듈 |
| --- | --- | --- |
| `/` | 크리에이터 가입 LP | Hero CTA / 크리에이터 쇼케이스 그리드 / 상품 4종 (라이브/VOD/1:1코칭/디지털) / 솔루션 4종 / 성공사례 캐러셀 / 파트너 / 누적 지표 / 가입 CTA |
| `/product` | 상품 유형 상세 | 4 상품 카드 + 솔루션 그리드 (웹사이트/CRM/커뮤니티/마케팅/매출) |
| `/solution` | 솔루션 상세 | 5 솔루션 카드 (웹사이트/마케팅/CRM/커뮤니티/매출) + 4 상품 유형 |
| `/pricing` | 가격 | 무료 + 유료 4티어 (마이크로 16k / 스몰 40k / 미디엄 80k / 라지 160k) + 비교표 + FAQ |
| `/creators` | 성공사례 list | 카드 그리드 |
| `/story/{slug}` | 개별 성공사례 | longform |

### 크리에이터 스토어 (`{slug}.liveklass.com` 예: dreamschoolkr)

| 영역 | 모듈 |
| --- | --- |
| Top | 띠 공지 (캠페인/시즌) |
| Hero | BEST 인기상품 큰 카드 — 썸네일 / 할인 / 패키지 태그 / 평점 / 모집기간 / 수강기간 / 인원 / 가격 / \[자세히 보기\] |
| 카탈로그 | 카테고리별 H2 + 강의 카드 그리드 |
| 카드 | 썸네일 / LIVE·VOD 태그 / 수강기간 / 인원 / 강사 / 제목 / 모집기간 / 가격 / 평점 (★+숫자(N)) |
| 공지 | 중요 공지 list (제목 + 본문 일부 + 일자 + 조회수) |
| Footer | 문의 (이메일/카카오) + "무료로 시작하기" (플랫폼 자체 CTA) |

### 핵심 패턴

1. **카드 모듈 일관성**: 강의 카드는 어디서나 동일 6요소 (태그/기간/인원/가격/평점/모집기간). 한 번만 디자인하면 끝.
2. **크리에이터 스토어 = SEO 자산 단위**: og:url 이 크리에이터 도메인. 플랫폼 홈은 SEO 가산점이 아닌 **세일즈 LP**.
3. **상품 유형 4 axis**: 라이브 / VOD / 1:1 코칭 / 디지털 콘텐츠. openhow v1 (creator-platform-discovery) 은 VOD-async 만 (인강/기수제), 그러나 vision 으로 4 axis 동일.
4. **공지·운영 영역**: liveklass 스토어에는 공지 list, 톡 상담, 카카오 알림 — 플랫폼이 인프라 제공.
5. **결제 모달**: 결제 페이지가 아니라 모달 (참가비/할인/쿠폰/총금액).

## Review — 2026-04-30 sanity check

**판정**: 전체 방향은 맞지만, v1 실행 기준으로는 **가격 surface** 와 **라우트 표기** 가 불명확했다. 아래를 반영해 스토리보드를 iteration 2 로 정리한다.

### 맞는 것

- liveklass 벤치마킹의 큰 구조는 현재 공개 페이지와 일치한다: 플랫폼 LP → product/solution 설명 → pricing → creator store → 강의/공지/문의 funnel.
- liveklass 가격 페이지는 무료 플랜 + 마이크로/스몰/미디엄/라지 4 paid tier + 연 결제 20% 할인 + 90/95% 정산 메시지 구조가 맞다.
- openhow 의 v1 정체성도 creator-platform-discovery 와 일치한다: 일반 workspace URL 은 `/w/{slug}`, 학생 게시판은 `/w/{slug}/community`, 자동 `{slug}.openhow.io` 는 v1 제외.
- 현 viewer 라우터도 `/w/:workspace`, `/w/:workspace/community`, `/w/:workspace/community/*`, `/c/:workspace/:course`, `/c/:workspace/:course/lesson/:lessonId` 를 이미 갖고 있어 frame 3~6 의 실행 표면은 존재한다.

### 보정한 것

- **Frame 2 Pricing**: 기존 문서는 liveklass 4-tier SaaS pricing 을 그대로 openhow 에 가져오는 모양이었다. 하지만 현재 `Pricing.tsx` 는 "월 구독료 없음, 거래액 5%" 단일 요금이고, `platform-cost-simulation.md` 는 Pro 요금제 killed + 커미션 10% 시뮬레이션을 남겨두고 있다. 따라서 v1 pricing storyboard 는 **수수료-first 단일 요금 + 정산 흐름 + FAQ** 로 바꾸고, liveklass 식 티어 그리드는 v2 옵션으로 내린다.
- **정확한 수수료율은 아직 잠그지 않는다**: 코드 현재값 5% 와 시뮬레이션 추천 10% 가 충돌한다. 본 문서는 surface 구조만 잠그고, 최종 숫자는 별도 pricing-policy 의도에서 결정한다.
- **Frame 4/5 route 표기**: v1 상세는 현재 라우터 기준 `/c/{workspace}/{course}` 와 `/c/{workspace}/{course}/lesson/{lessonId}` 로 표기한다. `/w/{slug}/lessons/{lesson-slug}` 는 반복 강의 canonical 후보이지 현재 build target 으로 쓰지 않는다.
- **상품 axis 노출**: v1 카드는 LIVE/1:1/디지털을 실제 기능처럼 노출하지 않는다. 태그 체계는 `VOD`, `기수제`, `패키지`, `무료 미리보기` 중심으로 시작하고, 4 axis 는 vision copy 에만 둔다.

## What — 스토리보드 (6 핵심 frame)

각 frame 은 ASCII wireframe + 모듈 inventory + openhow 매핑 + liveklass 와의 차이.

### Frame 1: openhow.io/ (플랫폼 가입 LP)

**Goal**: 크리에이터(강사·작가) 가입 전환. **학습자 진입은 후순위** (학습자는 검색·추천을 통해 크리에이터 스토어로 직접 진입).

```
┌──────────────────────────────────────────────────────────────────┐
│ [openhow]                          가격  성공사례  블로그  로그인 │ <- top nav
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│        나의 지식이 비즈니스가 되는 곳                             │
│        AI 시대, 5분 만에 나만의 클래스를 만드세요                │
│                                                                  │
│                  [지금 무료로 시작하기]                          │ <- hero CTA
│                                                                  │
│        [크리에이터 스토어 썸네일 캐러셀 — 5~10 카드]               │ <- creator showcase
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  누적 지표:  [N]+ 크리에이터  [N]+ 수강신청  [N]억 최고 월수익    │
├──────────────────────────────────────────────────────────────────┤
│  나만의 콘텐츠를 더 쉽게, 더 빠르게                              │
│  ┌──────┬──────┬──────┬──────┐                                   │
│  │ VOD  │ 라이브│1:1코칭│디지털│   <- 상품 유형 4 카드 (vision)   │
│  └──────┴──────┴──────┴──────┘                                   │
│  v1 강조: VOD 인강 / 기수제 인강                                  │
├──────────────────────────────────────────────────────────────────┤
│  All-in-one 플랫폼:                                               │
│  웹사이트 / CRM / 커뮤니티 / 마케팅 / 매출 / 결제 (Bootpay)      │
├──────────────────────────────────────────────────────────────────┤
│  성공 사례 카드 그리드 (3-up)                                     │
├──────────────────────────────────────────────────────────────────┤
│  파트너 로고 띠 (Bootpay, Cloudflare, KAIST 등)                  │
├──────────────────────────────────────────────────────────────────┤
│           지식 비즈니스의 시작, openhow 와 함께하세요             │
│                  [무료로 시작하기]                                │
├──────────────────────────────────────────────────────────────────┤
│ Footer: 회사 / 약관 / 개인정보 / 문의                            │
└──────────────────────────────────────────────────────────────────┘
```

**모듈 inventory**:

- TopNav, HeroCTA, CreatorShowcaseCarousel, KPIBand, ProductTypeGrid (4-card), SolutionStrip, SuccessStoryGrid, PartnerStrip, BottomCTA, Footer

**liveklass 차이**:

- 톤: liveklass = "온라인 강의" / openhow = "AI 시대 지식 비즈니스" (AX 톤 보존, creator-platform.md 의 기존 포지션 유지)
- 상품 유형 v1 노출: liveklass 는 4 axis 동시 광고, openhow 는 VOD 인강/기수제만 강조 + 나머지는 vision 표시
- 파트너: liveklass 는 결제·CDN·교육기관, openhow 는 Bootpay/Cloudflare/오픈클로 등

### Frame 2: openhow.io/pricing (v1: 수수료-first)

**Goal**: 가입 직전 마지막 가격 불안을 제거한다. liveklass 는 사용량 기반 4-tier SaaS pricing 이지만, openhow v1 은 current code + killed Pro 결정상 **월 구독료 없는 거래 수수료 모델** 이 더 일관적이다.

```
┌──────────────────────────────────────────────────────────────────┐
│       초기 비용 없이, 팔린 만큼만                                 │
│       월 구독료 없이 강의/콘텐츠 판매를 시작하세요                │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  통합 요금                                                  │  │
│  │  거래 수수료 X% (VAT 별도/포함 정책 별도 잠금)              │  │
│  │  카드/간편결제, 페이월, 멤버십, 코스, 커스텀 도메인 포함    │  │
│  │  [무료로 시작하기]                                          │  │
│  └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│  정산 흐름: 구매자 결제 → 취소/환불 기간 → 익월 말 정산           │
├──────────────────────────────────────────────────────────────────┤
│  포함 기능: VOD 코스 / 구독형 블로그 / 페이월 / 멤버십 / 결제     │
│           / 커스텀 도메인(운영자·고급 설정) / 취소 정책           │
├──────────────────────────────────────────────────────────────────┤
│  FAQ: 수수료 포함 범위, PG 수수료, VAT, 정산일, 환불, 타사 비교   │
├──────────────────────────────────────────────────────────────────┤
│  (v2 옵션) 사용량이 커진 크리에이터용 저장/수강신청 tier grid     │
│           — liveklass 마이크로/스몰/미디엄/라지 패턴 참조         │
└──────────────────────────────────────────────────────────────────┘
```

**모듈 inventory**: PricingHero, UnifiedFeeCard, SettlementFlow, IncludedFeatureGrid, PricingFAQ, TierGridV2Placeholder

**openhow 결정 보류**:

- **수수료율 X%**: current UI 는 5%, `platform-cost-simulation.md` 는 10% 가 수익성 sweet spot 이라고 본다. 이 충돌은 별도 pricing-policy 의도에서 잠근다.
- **월 구독 tier**: v1 에서 도입하지 않는다. liveklass 식 4-tier 는 사용량/저장공간 한도가 실제 병목이 된 뒤 v2 로 검토한다.

### Frame 3: 크리에이터 스토어 — `/w/{slug}` (학습자 진입 1차 surface)

**Goal**: 학습자가 (검색·SNS·SEO 통해) 도착해서 → 자기에게 맞는 클래스 발견 → 결제까지. **카탈로그 + 신뢰 시그널 + 결제 funnel**.

```
┌──────────────────────────────────────────────────────────────────┐
│ [드림스쿨]                          공지  강의  소개   문의  로그인│ <- creator nav
├──────────────────────────────────────────────────────────────────┤
│ 🔔 BEST 인기 캠페인 띠 (선택사항, 운영 가능 시 표시)              │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ [큰 썸네일]   [할인 17%][패키지]                            │  │ <- hero featured
│  │              "14일 한시 판매 | All-in-One 풀패키지"          │  │
│  │              ★★★★★ 5.0 (15)  [공유하기]                    │  │
│  │              모집기간 2026.04.22 ~ 2026.05.05               │  │
│  │              30일 수강 / 인원무제한                          │  │
│  │              420,000원 → 349,000원                          │  │
│  │              [자세히 보기]                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│  강사 한 줄 소개 ("드림스쿨은 '합격'을 약속합니다.")              │
│  [모든 강의 한눈에 보기]                                          │
├──────────────────────────────────────────────────────────────────┤
│  ## 필수 공부법                                                   │
│  ┌────┬────┬────┐                                                │
│  │카드│카드│카드│  <- LessonCard grid                           │
│  └────┴────┴────┘                                                │
│  ## 객관식 마스터                                                 │
│  ┌────┬────┐                                                     │
│  │카드│카드│                                                     │
│  └────┴────┘                                                     │
│  ## 주관식 마스터 / ## 몰입과 멘탈관리 ...                        │
├──────────────────────────────────────────────────────────────────┤
│  📌 꼭 알아야할 공지사항                                          │
│  • [중요] 2026 특강 라이브 종료 안내    2026.04.22  163           │
│  • [중요] 4년의 준비 끝에 ...           2026.02.12  1,010         │
│  [전체보기]                                                       │
├──────────────────────────────────────────────────────────────────┤
│  ## 학생 게시판 미리보기 (최근 N개)                                │ <- openhow 추가
│  • 후기/Q&A/숙제 공유 카드 N개  [전체보기]                        │
├──────────────────────────────────────────────────────────────────┤
│  문의하기 (이메일 / 카카오)                                       │
├──────────────────────────────────────────────────────────────────┤
│  Powered by openhow  [무료로 시작하기]                           │
└──────────────────────────────────────────────────────────────────┘
```

**LessonCard 표준 6요소** (liveklass 따라):

```
┌──────────────────────┐
│ [썸네일]              │
│ [VOD] [기수제] [패키지]│  <- v1 type tags
│ 30일 수강 인원무제한  │  <- duration·capacity
│ DreamSchool 드림스쿨 │  <- creator
│ 1강. 모든 시험에…    │  <- title
│ 모집기간 03.26~05.05 │  <- enrollment window
│ 60,000원              │  <- price
│ ★ 5.0 (5)             │  <- rating + count
└──────────────────────┘
```

**모듈 inventory**:

- CreatorNav, CampaignBanner (optional), HeroFeaturedClass, CreatorBio, CategorySection (H2 + LessonCard grid), AnnouncementList, **CommunityPreview (openhow 추가)**, ContactBlock, PoweredByFooter

**liveklass 차이 — openhow 만의 추가 요소**:

- **CommunityPreview**: liveklass 스토어에는 학생 게시판이 강의 내부에만, openhow 는 워크스페이스 레벨 `/w/{slug}/community/` 가 있어 스토어 메인에도 미리보기 노출 (creator-platform-discovery v1 결정 — 학생 게시판 = SEO 자산 + 신뢰 시그널)
- **Powered by openhow**: liveklass 와 동일 (브랜드 노출 = 플랫폼 디스커버리 채널)
- 카드 6요소는 그대로 차용 — v1 부터 카드 컴포넌트 1개로 통일
- v1 태그는 `VOD`, `기수제`, `패키지`, `무료 미리보기` 중심. `LIVE`, `1:1`, `디지털` 은 실제 상품 생성/결제/운영 flow 가 열리기 전까지 vision copy 로만 둔다.

### Frame 4: 강의 상세 — `/c/{workspace}/{course}`

**Goal**: 학습자가 강의 카드 클릭 → 자세히 본 후 결제. **랜딩 형식의 longform + 커리큘럼 + 강사 + 후기 + 결제 CTA sticky**.

```
┌──────────────────────────────────────────────────────────────────┐
│ < 드림스쿨        공지 강의 소개 문의 로그인                      │
├──────────────────────────────────────────────────────────────────┤
│  Hero: 강의 제목 + 한 줄 / 큰 썸네일 또는 트레일러                │
│  태그(VOD/기수제/패키지), 평점, 수강기간, 인원, 강사              │
├──────────────────────────────────────────────────────────────────┤
│  ## 이 강의를 듣고 나면 (3-5 bullets)                             │
├──────────────────────────────────────────────────────────────────┤
│  ## 커리큘럼 (Section + Lesson tree, 진도율 미리보기)             │ <- accordion
├──────────────────────────────────────────────────────────────────┤
│  ## 강사 소개 (사진 + bio + 다른 강의 링크)                       │
├──────────────────────────────────────────────────────────────────┤
│  ## 수강 후기 (별점 + 텍스트 리뷰 + 평점 분포 막대)                │ <- course-ratings-reviews
├──────────────────────────────────────────────────────────────────┤
│  ## FAQ (강의 환불·기수·자료 등)                                   │
├──────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  결제 sticky bar (스크롤 따라옴):                            │ │ <- sticky CTA
│  │  349,000원 (정가 420,000)  [수강신청] [선물하기]             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

**모듈 inventory**: CourseHero, OutcomeBullets, CurriculumAccordion, InstructorBlock, ReviewSection (course-ratings-reviews 의도와 통합), FAQAccordion, StickyPurchaseBar, PaymentModal

**openhow 매핑**:

- 기존 `CourseLanding` 라우트 재사용: current router 기준 `/c/:workspace/:course`.
- `/w/{slug}/lessons/{lesson-slug}` 는 creator-platform-discovery 의 반복 강의 canonical 후보일 뿐, 본 build target 으로 쓰지 않는다.
- ReviewSection = `course-ratings-reviews.md` 의도 surface
- InstructorBlock = `instructor-profile-page.md` 의도 surface (요약판)

### Frame 5: 강의 시청 — `/c/{workspace}/{course}/lesson/{lessonId}`

**Goal**: 결제한 학습자가 차분히 학습 + 진도 + 학생 게시판 액세스.

```
┌──────────────────────────────────────────────────────────────────┐
│ [openhow] 드림스쿨 / 1강. 5단계 코어 공부법         프로필 ▼      │
├──────────┬───────────────────────────────────────────────────────┤
│ 커리큘럼 │  ┌─────────────────────────────────────────────────┐ │
│ 사이드바 │  │                                                 │ │
│ ─────────│  │       [VIDEO PLAYER]                            │ │
│ ✓ 1강    │  │       자막 / 속도 / 화질 / 노트                 │ │
│ → 2강    │  │                                                 │ │
│   3강    │  └─────────────────────────────────────────────────┘ │
│   4강 🔒│  ─────────────────────────────────────────────────── │
│   ...    │  [개요] [자료 다운로드] [노트] [Q&A 게시판]          │ <- tabs
│          │                                                       │
│          │  본문 (강의 노트 / 자료 / Q&A)                        │
│          │                                                       │
│          │  진도 표시 (mm:ss / 전체 mm:ss)                       │
└──────────┴───────────────────────────────────────────────────────┘
```

**모듈 inventory**: LessonNav (top), CurriculumSidebar (좌), VideoPlayer, LessonTabs (개요/자료/노트/Q&A), ProgressTracker

**openhow 매핑**:

- learner-progress.md 의도 (진도 표시)
- members-only-ssg-gate (잠긴 강의 표시)
- Q&A 탭 = 학생 게시판 클래스 내부 surface 진입점. 공개 SEO 글은 `/w/{slug}/community/{post-slug}` 로, 강의 내부 Q&A 컨텍스트는 탭에서 cross-link 한다.

### Frame 6: 학생 게시판 — `/w/{slug}/community/`

**Goal**: 학생이 후기·Q&A·숙제 공유 글 작성·열람. SEO 자산 (creator-platform-discovery v1).

```
┌──────────────────────────────────────────────────────────────────┐
│ < 드림스쿨        공지 강의 [커뮤니티] 소개 문의 로그인           │
├──────────────────────────────────────────────────────────────────┤
│  드림스쿨 커뮤니티                              [+ 글쓰기]        │
│  필터: [전체] [질문] [후기] [숙제] [회고]   기수: [전체 ▼]       │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ [후기]  3개월 만에 합격했습니다 - 5단계 코어 공부법 후기    │  │
│  │  by 김학생 (3기) · 2026.04.20 · 조회 234 · ★ 5.0           │  │
│  │  본문 첫 2줄 미리보기...                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ [질문]  암기법 적용 중에 막혔는데... by 박수강 (4기)        │  │
│  │  ...                                                         │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ...                                                              │
│  [page 1 2 3 ...]                                                │
└──────────────────────────────────────────────────────────────────┘
```

**개별 글 (**`/w/{slug}/community/{post-slug}`**)**:

```
┌──────────────────────────────────────────────────────────────────┐
│ < 커뮤니티                                                        │
├──────────────────────────────────────────────────────────────────┤
│  [후기]                                                           │
│  3개월 만에 합격했습니다 - 5단계 코어 공부법 후기                 │
│  by 김학생 (3기) · 2026.04.20 · 조회 234                          │
│  ─────────────────────────────────────────────────────            │
│                                                                   │
│  (본문 - 마크다운 렌더링)                                         │
│                                                                   │
│  ─────────────────────────────────────────────────────            │
│  관련 강의: 1강. 5단계 코어 공부법 [바로가기]                     │ <- cross-link
│  ─────────────────────────────────────────────────────            │
│  댓글 (v2)                                                        │
└──────────────────────────────────────────────────────────────────┘
```

**모듈 inventory**: CommunityNav (탭으로 노출), PostFilterBar (카테고리·기수), PostListCard, Pagination, PostDetailHeader, PostBody, RelatedLessonLink, CommentSection (v2)

**SEO 메타** (creator-platform-discovery v1 결정):

- canonical = 게시글 URL (`/w/{slug}/community/{post-slug}`)
- og:author = 학생 username
- schema.org `DiscussionForumPosting` JSON-LD
- articleSection = 클래스명 + 강사명

## Not (스토리보드 v1 범위 외)

- **결제 모달 wireframe** — Bootpay 위에서 paywalled-seo-v1 / members-only-ssg-gate 가 처리, 본 스토리보드는 진입점만 표시
- **크리에이터 admin (CRM/매출관리/마케팅 자동화)** — liveklass 의 `/admin/*` 영역. 본 스토리보드는 학습자 surface 우선, admin 은 별도 의도
- **/product, /solution 별도 LP** — liveklass 는 두 개 분리하지만 openhow v1 은 `/` 하나에 흡수, 별도 페이지 없음
- **/blog, /webinar, /academy** (콘텐츠 마케팅 자산) — Backlog. 가입 LP 가 먼저, 콘텐츠 마케팅은 그 후
- **로그인/회원가입 wireframe** — 표준 OAuth+이메일, 별도 의도 불필요
- **모바일 별도 wireframe** — 본 스토리보드는 데스크톱 1차, 모바일은 동일 모듈 stack 으로 가정
- **{slug}.openhow.io 서브도메인 패턴** — creator-platform-discovery v1 결정대로 v1 도입 안 함, `/w/{slug}` 만
- **마케팅 자동화·CRM·매출관리 surface** — liveklass 는 sell point 지만 openhow v1 은 인프라만 (UI 노출 v2)
- **다국어** — workspace-seo-v3 Backlog
- **상품 유형 4 axis (라이브/1:1코칭/디지털)** — v1 은 VOD 인강/기수제만 노출 (creator-platform-discovery 결정), 4 axis 는 vision 표기만
- **liveklass 식 4-tier 가격표** — v1 은 단일 거래 수수료. 저장공간/수강신청 한도 기반 tier 는 v2 옵션

## Footprint

- 2026-04-30 review pass:
  - liveklass public pages 재확인: `/`, `/product`, `/solution`, `/pricing`
  - dreamschoolkr store shell/SEO meta 확인: `dreamschoolkr.liveklass.com`
  - openhow current router 확인: `core/packages/viewer/src/router.tsx`
  - openhow current pricing 확인: `core/packages/viewer/src/pages/Pricing.tsx`
  - 비용/정책 컨텍스트 확인: `.omj/core/platform-cost-simulation.md`

## Recommended execution split

스토리보드 기준으로 바로 build 의도로 분기한다면, **홈보다 크리에이터 스토어/강의 카드부터** 가 ROI 가 높다. 이유: 플랫폼 홈은 세일즈 카피 surface 라 데이터·컴포넌트 확정 없이도 바꿀 수 있지만, `/w/{slug}`·`/c/{workspace}/{course}`·커뮤니티가 같은 카드/메타를 공유해야 전체 UX 정리가 된다.

| 순서 | build 의도 | 포함 frame | 왜 먼저인가 | 완료 기준 |
| --- | --- | --- | --- | --- |
| 1 | `lesson-card-system-v1` | Frame 3/4 | 모든 surface 의 반복 단위. 태그·가격·평점·모집기간을 한 번 잠그면 스토어/강의 상세/홈 쇼케이스가 같이 정리됨 | 재사용 가능한 Course/Lesson card spec + 실제 viewer 컴포넌트 1개 |
| 2 | `creator-store-redesign-v1` | Frame 3 | 학습자 1차 랜딩. SEO/결제/커뮤니티 신뢰 시그널이 한 화면에 모임 | `/w/{slug}` 에 HeroFeaturedClass, CategorySection, CommunityPreview 반영 |
| 3 | `course-landing-redesign-v1` | Frame 4 | 결제 전환 surface. 기존 CourseLanding/Bootpay flow 와 직접 연결됨 | longform hero + curriculum + review + sticky purchase bar 정리 |
| 4 | `community-board-polish-v1` | Frame 6 | openhow 차별점. liveklass 대비 SEO 자산이 되는 학생 글 surface | 리스트/상세의 카테고리·기수·관련 강의 cross-link 명확화 |
| 5 | `lesson-player-v2` | Frame 5 | 구매 후 경험. 결제 전 funnel 이 정리된 뒤 다듬는 게 안전 | sidebar/tabs/progress/Q&A 진입점 통일 |
| 6 | `public-home-creator-saas-pivot` | Frame 1/2 | 위 컴포넌트와 사례가 생긴 뒤 세일즈 LP 로 조립 | creator SaaS hero + showcase + pricing link + CTA |

**잠정 결정**:

- v1 build 는 `VOD/기수제` 중심으로 간다. LIVE/1:1/디지털은 홈의 vision 영역과 Backlog 에만 둔다.
- `pricing-policy` 는 UI 빌드 전에 숫자만 별도로 잠근다. 단, pricing page 의 구조는 단일 수수료형으로 진행해도 된다.
- `{slug}.openhow.io` 는 더 논의하지 않는다. v1 은 `/w/{slug}` 단일.

**진행 상태**:

- `lesson-card-system-v1`: 구현/재확인 완료. `/w/{slug}` course-grid 가 `LessonCard` 를 사용하고, `pnpm --filter @openhow/viewer build` 통과.
- `creator-store-redesign-v1`: 구현/재확인 완료. `/w/{slug}` 에 `courses[0]` 기반 `LessonCard variant="feature"` hero slot 을 추가하고, 나머지 코스는 default grid 로 유지. `pnpm --filter @openhow/viewer build` 통과.
- 다음 build 분기 후보: `course-landing-redesign-v1`.

## Backlog

- 결제 모달 wireframe
- pricing-policy 의도: 수수료율 5% vs 10%, VAT/PG 포함 커뮤니케이션, 정산 정책 잠금
- 크리에이터 admin dashboard wireframe (CRM·마케팅·매출)
- 모바일 stack wireframe
- 로그인/회원가입 onboarding flow
- 콘텐츠 마케팅 surface (`/blog`, `/webinar`, `/academy`)
- liveklass creator store 동적 카드 데이터 재수집/스크린샷 고정 (현재 HTML shell 만 서버에서 직접 확인 가능)
- 4 상품 axis (라이브 강의·1:1 코칭·디지털 콘텐츠) wireframe — v2

## Learnings

### 2026-04-30: seed 생성 — liveklass 4 페이지 + 1 크리에이터 스토어 벤치마킹

- **벤치마킹 범위**: liveklass.com `/`, `/product`, `/solution`, `/pricing` + dreamschoolkr.liveklass.com (실제 운영 스토어).
- **핵심 차용 모듈**:
  - LessonCard 6요소 (태그·기간·인원·가격·평점·모집기간) — 가장 강력한 일관성 자산
  - HeroFeaturedClass (스토어 최상단 큰 카드)
  - CategorySection (H2 + 카드 그리드)
  - StickyPurchaseBar (강의 상세 결제 sticky)
  - PaidTierGrid + FeatureComparisonTable (pricing) — liveklass benchmark only, openhow v1 은 UnifiedFeeCard 로 대체
  - PoweredByFooter (플랫폼 브랜드 노출 — 디스커버리 채널)
- **openhow 만의 차이점**:
  - 학생 게시판 (CommunityPreview on store + dedicated `/w/{slug}/community/`) — liveklass 는 강의 내부 Q&A 만, openhow 는 워크스페이스-레벨 SEO 자산
  - 톤: liveklass = "온라인 강의" / openhow = "AI 시대 지식 비즈니스"
  - 상품 유형 v1: VOD-async 만 (인강 + 기수제), 나머지 axis 는 vision
  - 가격 정책: v1 surface 는 단일 거래 수수료형으로 보정. 수수료율(현재 코드 5% vs 시뮬레이션 10%)은 별도 정책 의도 필요
- **본 의도의 위치**:
  - 부모: 정체성 α 잠금 결정 (memory: project_openhow_positioning.md)
  - 자식 (예정): public-blog-home pivot, course-landing-redesign, lesson-player-v2, community-board-v1, pricing-page-v1 — 각 surface 별 build 의도가 본 스토리보드를 reference 로 삼아 분리 실행
  - 자식 (분기됨 2026-04-30): `core/lesson-card-system-v1.md` (clarified) — execution split 1순위, WorkspaceDocs 의 course-grid 를 단일 LessonCard 컴포넌트로 교체
- **iteration 2 잠정 결정**:
  1. **frame 우선순위**: `lesson-card-system-v1` → `creator-store-redesign-v1` → `course-landing-redesign-v1` → `community-board-polish-v1` → `lesson-player-v2` → `public-home-creator-saas-pivot`
  2. **pricing-policy**: 숫자(5% vs 10%)는 별도 정책 의도에서 잠그되, surface 는 단일 거래 수수료형으로 진행
  3. **상품 유형 axis**: v1 은 VOD/기수제만 build, 라이브/1:1코칭/디지털은 v2 vision
  4. **카드 컴포넌트 통합**: LessonCard 를 1차 build 의도로 분기

### 2026-04-30: iteration 2 review — pricing/route 보정

- **검토 결과**: liveklass 벤치마크 자체는 맞지만, openhow v1 문서로는 pricing 이 과하게 liveklass 를 따라가고 있었다.
- **pricing 보정**: `Pricing.tsx` 의 현재 단일 수수료 구조와 `platform-cost-simulation.md` 의 Pro killed 맥락을 반영해 Frame 2 를 UnifiedFeeCard + SettlementFlow + FAQ 로 수정. 4-tier grid 는 v2 옵션.
- **route 보정**: 강의 상세/플레이어 build target 을 현재 라우터 기준 `/c/:workspace/:course`, `/c/:workspace/:course/lesson/:lessonId` 로 명확히 함.
- **scope guard**: v1 LessonCard 태그는 VOD/기수제/패키지 중심. LIVE/1:1/디지털은 vision copy 로만 유지.
- **execution split 추가**: 홈보다 LessonCard/creator store/course landing 순서가 UX 정리 ROI 가 높다고 판단해 build 분기 순서를 문서화.
- **continuation 실행**: `lesson-card-system-v1` 의 WorkspaceDocs 적용부를 재확인해 legacy `.course-card` Link 를 `<LessonCard>` 로 교체하고 viewer build 통과.
- **creator-store continuation 실행**: frame 3 의 HeroFeaturedClass wedge 를 `/w/{slug}` 에 추가. 첫 course 는 feature card, 나머지는 default grid 로 렌더. viewer build 통과.

### 2026-04-30: stitch 6-frame 고화질 mockup 생성

- **목적**: ASCII 와이어프레임 → 실제 색·타이포·정보 밀도가 보이는 고화질 mockup 으로 의사결정 가속.
- **도구**: Google Stitch MCP (`stitch.googleapis.com/mcp`), Gemini 3.1 Pro, DESKTOP, 자동 design system "Openhow Core" (#2563EB primary, Pretendard/Inter, ROUND_FOUR, glassmorphism+minimalism).
- **프로젝트**: `2344295347161582566` — "openhow — Creator SaaS Storyboard (liveklass-aligned)"
- **6 frame 결과**:
  1. `b7a1301c2bc04c59bf67c6b6563dfb5e` — openhow.io Landing Page (h 7304)
  2. `40a89e387baa4ab78ea0e3d4c8178be1` — openhow.io Pricing (h 4580, UnifiedFeeCard 단일 수수료 모델)
  3. `40583010bf4d44d2957ea7ac54f5a6e1` — 드림스쿨 크리에이터 스토어 (h 2066)
  4. `f7d6f94cdc8d4503ab2cc6da65faf295` — 5단계 코어 공부법 강의 상세 (h 4518, sticky purchase bar)
  5. `13836b4c293644cfb3553965a3bec0d1` — 강의 수강 (2강. 회독의 본질) (h 2048)
  6. `a9387e48531846e29bda87b818a7ecf0` — 드림스쿨 워크스페이스 커뮤니티 게시판 (h 2086)
- **차후 활용**: 각 frame 의 mockup 을 build 의도(`lesson-card-system-v1`, `creator-store-redesign-v1` 등) reference 로 첨부. 디자인 시스템 토큰(#2563EB, Pretendard, ROUND_FOUR, 8pt grid)은 DesignTokens 합의 시 출발점.
- **HTML 참고용 저장**: 6 frame 모두 `references/stitch-storyboard/frame-{N}-*.html` 에 다운로드. Tailwind CDN + Pretendard/Inter, 단일 파일이라 `open` 으로 즉시 렌더 가능. README 에 매핑·활용 가이드. **프로젝트 design system 이 더 완성도 높으므로 실제 구현은 reference 로만 활용**, HTML 그대로 옮기지 않는다.
- **non-obvious**: Stitch 가 자동 채택한 "정보 밀도 높은 액티브 톤" + "글래스모피즘 부분 적용" 가이드라인이 liveklass 보다 한 톤 위(테크 프리미엄)로 나옴 — openhow 정체성 α 와 잘 맞음. 톤 보정 없이 채택 가능.
