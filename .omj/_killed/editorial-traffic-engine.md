---
status: killed
created: 2026-04-21
updated: 2026-04-30
killed_at: 2026-04-30
killed_reason: 정체성 결정 게이트 통과 — 사용자 α(liveklass-aligned 순수 크리에이터 SaaS) 선택. 본 의도가 제안한 "에디터 SEO 엔진" 정체성은 폐기.
iteration: 1
related: creator-platform-discovery.md, _killed/platform-pro-plan.md
---

# editorial-traffic-engine — openhow 서비스 정체성을 "SEO 트래픽 엔진"으로 재정의 [KILLED 2026-04-30]

> **Status: killed.** 본 의도의 결정 게이트가 2026-04-30 사용자 결정으로 통과 — α(liveklass-aligned 순수 크리에이터 SaaS) 선택. "에디터 SEO 엔진" 정체성 폐기. 본 의도 산하 모든 hypothesis(외부 임포트, 에디터 파이프라인, 토픽 허브 1급화)는 v1+ 범위에서 제거. 부활 조건: 크리에이터 SaaS 정체성으로 12개월 운영 후에도 트래픽 엔진이 별도 필요한 경우. 부활 시 학습 자산: max5.ai 파이프라인, 한국 저작권 분석, gpters 구조 분석은 본 문서 Learnings 에 보존.


## Why

openhow의 현재 구조는 **멀티 크리에이터 플랫폼**(creator-platform done, gpters-seo-flywheel done)에 기반한다 — 각 creator가 자기 워크스페이스에서 글을 써서 발행하고, 플랫폼은 쓰기 도구·구독자 연결·SEO 플러밍만 제공한다. 유료 전환·구독 등은 creator 재량, 플랫폼 admin은 creator 콘텐츠를 검수·승격하지 않는다는 **creator-ownership 원칙**이 명시적으로 작동 중이다.

이번 의도는 그 정체성을 **"트래픽 모으는 SEO 위주 서비스"**로 재정의한다. 핵심 차이:

- **공급**: creator 자체 발행만이 아니라, **외부(예: gpters.org)에서 가져온 콘텐츠 + 직접 작성 콘텐츠**를 에디터가 큐레이션·가공한 뒤 발행
- **게이트**: creator의 `accessLevel: public` 토글 = 색인이 아니라, **에디터 처리 후 발행**이 공개·색인의 단일 게이트
- **홈/탐색 UI**: 워크스페이스 디스커버리 중심(public-blog-home)이 아니라, **콘텐츠 자체(토픽·유형·검색 랜딩)** 중심으로 UI 재구조화

이 재정의는 `creator-platform`, `gpters-seo-flywheel`, `public-blog-home`의 전제를 정면으로 건드린다 — 따라서 **단일 기능 의도가 아니라 서비스 포지셔닝 결정**이며, 커밋 전에 모델을 정리해야 다른 의도들의 피봇·킬 범위가 결정된다.

## What

- [hypothesis] **모델 결정 게이트** — creator 자율 발행 루트의 존폐 결정(유지 / 제거). 색인 게이트·홈 큐레이션 가중치는 제품 결정에서 분리된 운영 policy knob (아래 Context 참조) → **metric**: 유지/제거 중 하나로 문서화 + 기존 의도 `creator-platform` / `gpters-seo-flywheel` / `public-blog-home`의 피봇·킬 여부 결정
- [hypothesis] **외부 콘텐츠 임포트 정책** — gpters.org 등 외부 원본의 라이선스·attribution·canonical 처리 규약 → **metric**: 임포트 가능한 출처 목록 + 허용 액션(요약/번역/재편집)이 정의되어 SEO canonical/noindex 정책과 호환
- [hypothesis] **에디터 처리 파이프라인** — 드래프트(임포트 또는 직접 작성) → 에디터 가공·태깅·CTA → 발행. 기존 creator 자율 발행 루트와의 관계(공존/대체/선택) 명시 → **metric**: 에디터 1명이 1시간 내에 1개 임포트 글을 처리·발행 가능
- [hypothesis] **홈 UI 재구조화 범위** — 현 `public-blog-home`(워크스페이스 카드 + contentType 섹션)에서 **토픽 허브 / 검색 랜딩 / 관련글**이 1급 구성이 되는 형태로 전환. 기존 워크스페이스/creator 프로필 경로의 지위 결정 → **metric**: 홈 뷰포트의 상위 요소 3종이 에디토리얼 큐레이션 기반(토픽·유형·검색)

## Not

- (확정 전) — 모델 결정 게이트 전까지 Not은 비워둔다. 결정 후 "creator 자체 발행 루트 완전 제거"와 같은 항목을 확정 추가.

## Context

### 결정 축 (2026-04-21 정제 — A/B 구분은 허위 축이었음)

초기 초안은 A(공존) / B(에디터 우선) / C(단선) 3안 구도였으나, 사용자 지적으로 **A와 B의 차이는 제품 구조가 아니라 운영 정책 knob의 값 차이**(색인 게이트 = 자율 vs 에디터 승인, 홈 큐레이션 가중치)임을 확인. 같은 DB·sitemap·에디터 툴 위에 토글 2개 차이일 뿐. → 진짜 결정 축은 두 개로 줄어든다.

**축 1 — creator 자율 발행 루트의 존폐**
- **유지**: creator 워크스페이스에서 자율로 글 쓰고 `accessLevel: public` 토글 가능. 기존 `creator-platform`/`gpters-seo-flywheel` 자산 재활용.
- **제거**: 자율 발행 루트 제거. 모든 공개는 에디터 처리 후. creator-ownership 원칙 폐기. 기존 자산 상당 폐기.

**축 2 — 외부 임포트 + 에디터 가공 파이프라인 도입**
- 사용자 요구의 핵심이므로 사실상 Y 고정. (gpters.org 원본 → 에디터 처리 → 발행)

→ 루트 "유지" 선택 시, 색인 게이트(자율 public = 색인 vs 에디터 승인만 색인)와 홈 큐레이션 가중치는 **운영 정책 knob**으로 분리. 제품 결정에서 빼고, 운영 판단으로 언제든 조정 가능.

### 루트 "유지" 하위 정책 (제품 결정 아닌 운영 knob)

- **색인 게이트 knob**: creator public 토글 → 색인 O (자율 우선) / 에디터 승인 필수 (품질 우선) / 워크스페이스 옵션 `requireReview` per-workspace (혼합)
- **홈 큐레이션 가중치 knob**: 에디터 픽 고정 슬롯 비중, creator 자율 글의 홈 노출 경쟁력 조정
- **sitemap 정책 knob**: 자율 발행분의 sitemap 포함 우선순위

이건 코드 구조가 아닌 설정/정책이라, 실 운영하면서 데이터 보고 조정 가능.

### 외부 임포트의 전제 조건

- **gpters.org 콘텐츠 활용 권한 명확화**: 출처가 본인/법인 소유인지, 기고 합의인지, 공개 재배포 허용인지, 원저자 attribution 방식은 어떻게 할지. SEO에선 `rel=canonical`을 원본으로 돌릴 것인지 openhow를 canonical로 선언할 것인지가 트래픽 전략과 직결.
- 이는 **기술 이전에 정책 결정**. 잘못 시작하면 원본 사이트의 중복 콘텐츠 패널티 또는 법적 분쟁 리스크.

### 기존 인프라 관점

- `gpters-seo-flywheel`(done)이 이미 `contentType / ctaType / topicTags`를 DB·API·UI에 깔았음 — 대안 B/C에서도 이 메타 레이어는 그대로 재사용 가능 (에디터가 처리하면서 태깅).
- `workspace-seo-v1`(building)의 sitemap·GA·verification 플러밍도 재사용 가능.
- 홈 UI는 현재 `public-blog-home`이 "워크스페이스 카드 + contentType 섹션" 구조 — 대안 A면 증분, B/C면 전면 재설계.

### 파급 범위

- 건드리는 기존 의도: `creator-platform`(done), `gpters-seo-flywheel`(done), `public-blog-home`(building), `workspace-ux-improvement`, `instructor-profile-page`(작가 신뢰 배지는 editor-curation에선 의미가 달라짐).
- 피봇 vs 킬 판단은 모델 결정(A/B/C) 후에 일괄 재정돈.

### 병행 정체성 의도와의 관계 (2026-04-30 추가)

`creator-platform-discovery` (exploring, 2026-04-30) 가 같은 시기에 **"openhow = 지식플랫폼 (클래스 + 학생-as-author)"** 정체성으로 v1 MVP 를 좁혔다 (인강 + 기수제 인강 + 학생 게시판 + SEO). 본 의도의 "에디터 트래픽 엔진" 정체성과 **두 정체성이 상호 배타적이지 않지만, 같은 인프라 위에서 서로 다른 1순위 트래픽 전략**을 가진다:

| 축 | discovery (지식플랫폼) | editorial-traffic-engine (트래픽 엔진) |
|----|----------------------|--------------------------------------|
| 1순위 콘텐츠 공급 | 강사·학생 자율 발행 (클래스 단위) | 에디터 큐레이션 (외부 임포트 + 내부 가공) |
| SEO 자산 단위 | 클래스 워크스페이스 + 학생 게시판 | 토픽 허브 + 큐레이션 글 |
| creator-ownership 원칙 | 유지 (강사/학생 자율) | 재정의 (에디터가 게이트) |
| v1 검증 대상 | 클래스 + 게시판 SEO 양립 | 외부 임포트 정책 + 에디터 파이프라인 |

**사용자 결정 필요**: 두 정체성이 (a) 한 서비스 안에 양립 (창작자 자율 루트 + 에디터 큐레이션 루트 두 갈래), (b) editorial-traffic-engine 의 "축 1 = 자율 루트 제거" 가 채택되어 discovery 의 강사·학생 자율 모델이 사라짐, (c) discovery 가 메인 정체성이 되고 editorial-traffic-engine 은 별도 surface (예: `/topics/`) 로 격하 — 셋 중 하나로 정리되어야 함. 본 의도의 "축 1 결정 게이트" 와 discovery 의 v1 MVP 검증이 **같은 결정 공간에 들어와 있다** — 한쪽 결정이 다른 쪽 의도의 피봇/킬 범위를 좌우.

## Footprint
(None yet — 결정 게이트 통과 후 Phase 1부터 기록)

## Backlog
- 토픽 허브 `/topics/:slug` (P2 Backlog로 이미 존재 — gpters-seo-flywheel)
- 관련 문서 자동 연결 (P2.5)
- 에디터 워크플로우 도구(임포트 URL 붙여넣기 → 드래프트 초안화 → 편집기 → 발행)
- 중복 콘텐츠 감지 / canonical 정책 자동화

## Learnings
### 2026-04-30: [signal] UX 혼란 — "liveklass식 단순 클래스 SaaS 로 가야 하나?"
- **사용자 발화**: "지금 ux 정리가 안되거든. liveklass.com 여기 레퍼런스로 하면 되게 쉬운데, 우리는 뭔가 에디터가 seo 도 신경쓰로 그런 느낌이긴 해. 어떻게 정리해야할까? 아니면 liveklass 이쪽으로 더 명확히 할까?"
- **신호 해석**: 본 의도의 "축 1 = 자율 발행 루트 존폐" 결정이 미뤄진 채 `creator-platform-discovery`(building) v1 MVP 가 **인강 + SEO 게시판** 양립으로 진행 → 사용자 체감 UX 가 "크리에이터 SaaS" 와 "에디터 SEO 엔진" 두 정체성을 같은 surface 에 섞어 놓은 상태로 인식됨. UX 정리 안 됨 = 정체성 미결의 증상.
- **liveklass 레퍼런스 분석** (firecrawl 2026-04-30):
  - 포지션: "No.1 온라인 강의 홈페이지 플랫폼" — 크리에이터 각자 `{slug}.liveklass.com` 독립 스토어
  - 제품: 온라인 라이브 강의 / VOD / 1:1 코칭 / 디지털 콘텐츠 — **모두 판매 단위**
  - 플랫폼 홈: 크리에이터 쇼케이스 + 신규 크리에이터 가입 세일즈. **콘텐츠 디스커버리/SEO 토픽 허브 없음**
  - 부속 surface: 회원 CRM, 마케팅 자동화, 매출 관리 — 전형적 크리에이터 SaaS 스택
  - 본 의도 매핑: 본 의도의 "축 1 = 자율 발행 루트 제거" 와는 다른 차원. liveklass 는 **자율 발행은 유지하되 플랫폼-레벨 SEO/에디터 큐레이션 자체를 안 함**. → 본 의도에 **새 결정 옵션** 추가 필요: "editorial-SEO 자체 폐기 + 순수 크리에이터 SaaS"
- **갱신된 결정 공간 (3 옵션)**:
  - **(α) 순수 크리에이터 SaaS (liveklass-aligned)**: 플랫폼 홈은 크리에이터 가입 세일즈. 각 워크스페이스 = 독립 스토어 (subdomain/customDomain). editorial-traffic-engine 자체 kill, gpters-seo-flywheel/public-blog-home 도 대규모 피봇. 본 의도와 `editorial-traffic-engine` 둘 다 정리 대상.
  - **(β) 에디터 SEO 엔진 (본 의도 원안)**: 플랫폼 홈 = 토픽 허브 + 큐레이션 글. 크리에이터는 보조. creator-platform-discovery v1 MVP 의 학생 게시판/클래스 SEO 는 평면 위로 흡수.
  - **(γ) 분리된 양립 (현재 묵시적 상태)**: `openhow.io/` = 에디터 SEO 엔진, `{slug}.openhow.io` 또는 `/w/{slug}` = 크리에이터 SaaS. 두 surface 가 명확히 분리되면 UX 혼란 해소 가능. 단, 크리에이터-platform-discovery 의 "클래스 + 학생 게시판 + SEO 양립" 결정과는 다시 충돌 — 학생 게시판 SEO 가 플랫폼 토픽 허브로 흘러갈지 분리될지 별도 결정 필요.
- **다음 결정**: 사용자 선택 → 본 의도 status 변동 + creator-platform-discovery / public-blog-home / gpters-seo-flywheel 파급 일괄 정리

### 2026-04-21: seed 생성 (iteration 1)
- **배경**: 사용자 발화 — "오픈하우 서비스는 트래픽 모으는 SEO 위주 서비스로 가자. gpters.org 콘텐츠 원본 중 가져오는 경우도 있고, 에디터가 처리 후 발행. UI 구조도 바뀔 수 있음."
- **핵심 식별**: 이건 단일 기능 의도가 아니라 **서비스 포지셔닝 결정**. creator-ownership 모델과 editor-curation 모델은 설계 공간이 다르며, 기존 `gpters-seo-flywheel`은 전자에 "플랫폼 admin이 creator 콘텐츠를 검수/승격 결정 = creator-ownership 원칙 위반"으로 명시.
- **외부 임포트 정책 리스크**: gpters.org 원본 활용 권한, canonical 방향(원본 vs openhow), 중복 콘텐츠 패널티 관리 — 기술 이전에 정책 결정 필요.

### 2026-04-21: [signal] 결정 축 정제 — A/B는 허위 구분
- **사용자 지적**: "A, B는 무슨 차이야? 사실 운영 정책적인 거 아니야?"
- **확인**: 맞음. A(공존)와 B(에디터 우선)는 같은 DB·sitemap·에디터 툴 위에서 **색인 게이트(자율 vs 에디터 승인)**와 **홈 큐레이션 가중치**만 다르게 설정한 운영 정책 값 차이. 제품 아키텍처 동일.
- **정제 결과**: 진짜 결정 축은 두 개 — (1) creator 자율 발행 루트의 존폐, (2) 외부 임포트 + 에디터 가공 파이프라인 도입(사용자 요구로 Y 고정). "유지" 선택 시 색인/홈/sitemap의 세부 설정은 운영 knob으로 분리해 언제든 조정.
- **교훈**: 대안 제시할 때 "같은 인프라 + 다른 설정값"이 보이면 그건 제품 결정이 아니라 운영 knob. 제품 결정과 운영 결정을 섞으면 선택 피로만 늘어나고 핵심이 흐려진다.

### 2026-04-21: 리서치 — 임포트 파이프라인, gpters 구조, canonical/저작권

**파이프라인 재사용 (`ai-jobdori` + `www.max5.ai`)**
- `/Users/taesupyoon/sideProjects/ai-jobdori` 에 이미 `rss:fetch → rss:score → rss:drafts → rss:review` 4-스테이지 파이프라인 존재. `scripts/tools/lib/rss-sources.ts`에 ~55~60개 소스 (RSS/Atom/HN/RSSHub/Reddit).
- `/Users/taesupyoon/sideProjects/www.max5.ai` 가 **실제 프로덕션 운영 중** — Mac Mini launchd 매일 07:00 KST, 7-phase 파이프라인 (RSS수집 → 선별 → 초안 → 퇴고 → **승인 게이트** → 발행 → 카카오톡 보고), Supabase 백엔드, `content-workflow/` 폴더 기반 `deploy-content.sh --new-only`.
- **승인 게이트 4종** (max5.ai 기 구현): 한글 체크 / 배치 내 Jaccard ≥50% 중복 / DB 기발행 7일내 중복 / 품질점수(≥7 자동승인, 4~6 수동대기, ≤3 폐기).
- **openhow에서의 재사용 전략**: 파이프라인 스크립트는 복사·어댑트, 출력 타겟을 Supabase 대신 openhow Workers+D1로, 승인 게이트는 openhow의 에디터 Admin UI로, 발행 = `status: approved` + `accessLevel: public` + `editorReviewed: true`로 확장.

**gpters.org 구조 (Firecrawl map 결과)**
- 카테고리 기반 taxonomy: `/ax-lab`, `/ai-study-list-*`, `/ai-lecture`, `/book_podcast_study`, `/study-community`, `/study-explore`, 그리고 도메인별 `/wealth /research /media /ai-writing /dev /llm-service /uiux /health /chatbot /nocode /data-science /law /marketing /newsletter /news /question /hello /ai-status /notice /spotlight /events /directory /members-sns`.
- **핵심 관찰**: gpters의 콘텐츠는 **외부 임포트가 아니라 커뮤니티 멤버 자체 기고** — `/ax-lab/bbojjaks-openclaw-lesson-N`은 스터디 멤버가 직접 쓴 수업 로그, `/study-explore/...`는 개인 소개. "gpters가 외부에서 가져온다"는 해석은 틀림. gpters 자체가 **저작권 재배포 권한이 없음** (각 글은 멤버 개인 저작물).
- **사용자 발화 재해석**: "gpters에서 발행하는 콘텐츠의 원본은 가져오는 경우도 있다" → gpters의 **운영 모델**을 참고 레퍼런스로 언급한 것. openhow가 실제로 가져올 소스는 별도 결정 필요.

**한국 저작권법 / canonical 결론**
- **한국 저작권법 제35조5(공정이용)**: 4요소 — (1) 사용 목적·성격 (2) 저작물 유형 (3) 사용한 양 (4) 시장 영향. "전문 그대로 재배포"는 4요소 모두 불리. "요약 + 논평 + 독자적 해설"은 경계지만 성립 가능.
- **AI 재가공**: AI 산출물 자체는 저작권 無, 인간의 편집·추가·배열은 2차적 저작물로 보호. 즉 단순 AI 요약이 아닌 **에디터의 맥락 해설·교차 분석**이 있어야 법적·SEO적 지위 확보.
- **Canonical 딜레마**: (a) 원본에 cross-domain canonical — syndicator(openhow)가 organic 트래픽 ~40% 손실 (b) openhow 자체 canonical — 원본보다 독자적 가치 없으면 Google heuristic이 무시(84%), LLM은 canonical 자체를 무시. **결론**: 원문 전재는 불가. 독자적 가치 추가(요약+논평+맥락+교차비교)가 유일한 지속 가능 경로.

**실제 소스 후보** (gpters 외)
- Velog 개별 개발자 RSS (`velog.io/rss/@username`) — takuya·ravenkim·sunny_123 식 "일주일 사용 후기" 콘텐츠
- Tistory 개인 블로그 (Google SEO 우수)
- 기업 테크 블로그 RSS (toss·kakao·우아한형제들·라인·네이버 D2)
- Medium/Brunch 선별 블로거
- GitHub discussions·awesome-list 스타터
- **공개 네임드 개발자 리스트 우선** — 트위터/X 프로필에서 RSS 가능한 블로그만 큐레이션

**임포트 경로 3안 (사용자 의도 확인 필요)**
- (a) **self-migration** — 사용자 본인이 쓴 글만 가져옴 (저작권 안전)
- (b) **partnership** — 네임드 개발자들에게 기고·크로스포스트 합의 (법적 안전 + 원본 attribution)
- (c) **commentary-syndication** — 공개 RSS를 구독 → AI가 요약·논평 초안 → 에디터 가공 → 출처·원문링크 명시 + canonical은 원본으로 + 독자적 가치(한국어 정리·맥락·교차비교) 추가 발행 (공정이용 경계, 가장 확장성 높음)

### 2026-04-21: [signal] 주제 스코프 — "네임드 개발자 AI/AX 찐 후기·인사이트"
- 사용자 명시: "뉴스 이런거 말고 가능한 찐후기 같은거. 네임드 개발자들의 찐 후기. 또는 인사이트 등"
- max5.ai는 "AI 뉴스" 중심이라 소스·선별 기준이 다름. openhow는 **속보성 제외, 1인 실전·장기 경험 기반**만 선별하는 필터 필요.
- 품질 시그널 후보: (1) 저자 명성(Twitter 팔로워·GitHub star·기업 소속) (2) 실제 코드·스크린샷·수치 포함 (3) 최소 길이(예: 1500자 이상) (4) "일주일/한달/반년 써본" 식의 경험 기반 서사.
