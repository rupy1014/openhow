---
status: building
created: 2026-04-30
updated: 2026-04-30
iteration: 1
related: editorial-traffic-engine.md, creator-platform.md, public-blog-home.md, _killed/platform-pro-plan.md, core/platform-cost-simulation.md
loop:
  until: judge
---

# creator-platform-discovery — 지식플랫폼 IA v1 MVP: 인강 + 기수제 인강 + 학생 게시판 + SEO 양립

## Why

openhow 를 **지식플랫폼** 으로 포지셔닝 — 누구나 **클래스** 를 개설해 콘텐츠를 운영하고, **수강생도 클래스 안에서 게시글·숙제 같은 콘텐츠를 만든다**. 이 콘텐츠가 SEO 자산이 되어 (1) 해당 클래스 / (2) 크리에이터 brand / (3) openhow 플랫폼 셋 다 트래픽을 받는 구조.

장기 vision 은 8 프리셋(인강/코호트/부트캠프/세미나/스터디/동네 모임/멘토링/멤버십) + 3차원 자유조합. **하지만 v1 MVP 는 그게 너무 큼** — 사용자 결정으로 **인강(async + 상시 + online) + 기수제 인강(async + 기수제 + online or offline) 만** v1 에 넣고, 나머지는 v1 검증 후 v2 로 미룸. 핵심은 **SEO + 비동기 콘텐츠 (영상/글) + 학생 게시판** 세 가지가 동시에 동작하는 최소 구성.

핵심 질문 (v1): **인강·기수제 인강 두 모드에서 강사 콘텐츠 + 수강생 게시판이 어떻게 한 워크스페이스 안에서 SEO 권위를 더해 가는가.**

## What

### v1 MVP — 인강 + 기수제 인강 + 학생 게시판 + SEO

- [validated] **(v1) 클래스 유형 = 인강 + 기수제 인강 2종만** (2026-04-30 사용자 MVP 좁힘) — 차원 fix: 콘텐츠 모드 `async` 만, 시간 구조 `상시` + `기수제` 만, 만남 형태 `online` + `offline` 만. v1 워크스페이스 setting 으로 노출되는 프리셋 = (1) **인강** (async + 상시 + online), (2) **기수제 인강 (온라인)** (async + 기수제 + online), (3) **기수제 인강 (오프라인)** (async + 기수제 + offline — 영상 + 오프라인 미팅, 트레바리식). live/hybrid 콘텐츠, 정기/일회성 시간 구조, 모임/멘토링/멤버십 등은 모두 Backlog (v2). → **metric: workspace settings 에 `classPreset: 'self-paced' | 'cohort-online' | 'cohort-offline'` 3-enum 만 추가 + 다른 프리셋은 UI 노출 X**

- [validated] **(v1) URL 구조 — workspace 진입은 `openhow.io/w/{slug}`, 개별 doc 은 기존 `/d/`·`/blog/`·`/c/` 유지** (2026-04-30 사용자 결정 + 코드 라우터 확인) —
  - **워크스페이스 landing** = `openhow.io/w/{slug}` (이미 `router.tsx:184` 에 존재, `WorkspaceDocs` 렌더)
  - **개별 doc URL** = 현재 `/d/{slug}/{doc}` (DocPage), `/blog/{slug}/{doc}` (BlogLayout), `/c/{slug}/{course}` (CourseLanding) 모두 유지. v1 에서 `/w/{slug}/...` 로 통일하는 마이그레이션은 **별도 의도** (필요 시)
  - **학생 게시판 (신규)** = `/w/{slug}/community/{post-slug}` 신설 라우트 (기존 `/w/:workspace/my` 와 같은 layer)
  - **`{slug}.openhow.io` 서브도메인 패턴은 v1 도입 안 함**
  - **customDomain** = 인프라 동작은 살아 있되 셀프서비스/모집 안 함. 운영자 본인 워크스페이스 (clauders.ai 등) 정도에만 비공개 사용
  → **metric: 신규 워크스페이스 생성 시 진입 URL = `/w/{slug}`, customDomain 입력 UI 미노출, `{slug}.openhow.io` 라우트 없음, 학생 게시판 라우트 신설**

- [validated] **(v1) 수강생 콘텐츠 위치 = 클래스 내부 공개 게시판, path = `/w/{slug}/community/{post-slug}`** (2026-04-30 사용자 결정 — path 는 SEO 우선으로 Claude 일임) — 학생 콘텐츠는 해당 워크스페이스(=클래스) 안에 쌓임 (인프런식 강의+Q&A 통합). **강의 본문은 비공개(paywall/members-only) 가능, 학생 게시판은 항상 공개 (indexable, SEO 자산)**. **워크스페이스별 분리 관리** — 클래스 A 의 게시판과 클래스 B 의 게시판은 surface·관리자·권한이 분리됨 (한 게시판에 여러 클래스가 섞이지 않음). path 결정 근거: ① `/community` segment 는 다양한 글 형식 (질문·후기·회고·숙제 결과 공유) 모두 수용 — 인강 + 기수제 인강 v1 범위에서 한 surface 면 충분, ② generic 영문 segment 라 SEO 가산점은 약하지만 일관성 명확 + 한국어 UI 라벨 "커뮤니티" 가 자연스러움, ③ 차후 surface 분화 (`/community/q-a`, `/community/reviews`) 로 확장 가능, ④ schema.org `DiscussionForumPosting` 으로 마크업해 SEO 권위 확보. → **metric: 클래스 워크스페이스 1곳 시뮬레이션 — 강의 본문 paywalled + 게시판 글 공개 + sitemap 등록 + Google indexable + DiscussionForumPosting JSON-LD 검증**

- [validated] **(v1) 학생 doc canonical = 클래스 URL** (2026-04-30) — 학생 글은 클래스(=워크스페이스) 안에 쌓이므로 canonical 도 클래스 path. 학생 doc 메타: `og:author`/`schema:Person` 으로 학생 username 명시, `articleSection` 으로 클래스명 + 강사명 표기 (E-A-T). 학생 공간(`/s/{username}`) 에서는 cross-list 만 (canonical = 클래스 URL 유지). → **metric: SSG 출력 학생 doc 1건의 canonical = 클래스 URL + og:author = 학생 username 검증**

- [hypothesis] **(v1) Canonical 정책 1줄 정의** — 강의 본문 + 학생 글 모두 `openhow.io/w/{slug}/...` 가 canonical. 운영자 customDomain 워크스페이스만 예외로 customDomain canonical (`workspace-seo-v1` 기존 동작 유지). → **metric: `buildCanonicalUrl` 케이스 분기 (`/w/` path / customDomain) 명시 + 워크스페이스 sitemap.xml 출력 검증**

- [validated] **(v1) 기수제 4가지 정책 잠금** (2026-04-30 사용자 결정):
  - **(a) 지난 기수 강의 indexable = ② 진행 중 기수만 indexable, 종료 기수 noindex** — 신규 모집 트래픽 집중 + "최신만 노출" 정책. cohort.status (active/ended) 기반 robots/sitemap 제외. paywalled-seo-v1 위에 추가 레이어로 동작.
  - **(b) 반복 강의 canonical = ③ cohort-agnostic URL (`/w/{slug}/lessons/{lesson-slug}`)** — 강의 본문 URL 에서 기수 번호 제거, 게시판만 기수 분리. duplicate content 분쟁 자체 없음.
  - **(c) 학생 게시판 = ③ 한 surface + post 메타 cohortNumber tag** — `/w/{slug}/community/{post-slug}` 한 곳, post 메타에 `cohortId` FK (이미 있음), UI 필터로 기수별 보기 가능. SEO 권위 집중.
  - **(d) 기수 메타 = 기존 `cohort`/`cohortMember`/`liveSession`/`attendanceRecord` 테이블 + `document.cohortId` FK 재사용**. workspace 에 cohort 메타 컬럼 추가 X.
  → **metric: 기수제 인강 1개 + 종료 기수 1개 시뮬레이션 — 종료 기수 강의 noindex robots, 강의 lesson URL 에 cohort 번호 없음, community post 에 cohortId 메타, sitemap.xml 에서 ended cohort 제외 검증**

  **추가 운영 결정 (Backlog 으로 미룸)**: 종료 기수 콘텐츠 접근 권한 (수강생 평생 / 기간 한정), 다음 기수 자동 복제 vs 수동 생성, 기수 명명 규칙 (1기 / cohort-1 / 2026-spring 등 — 일단 `cohortNumber: integer` 단일 필드로 시작).

  **[signal] paywalled = noindex 질문 (2026-04-30)**: 사용자 발화 "강의페이지가 유료면 노출안되는게 맞지 않나?" — 현 `paywalled-seo-v1` 정책 (유료여도 preview SEO) 과 정반대 방향. 본 의도 wedge 에서는 paywalled-seo-v1 호환 유지 (지난 기수만 noindex 추가 레이어). 전면 "유료=noindex" 정책 전환 원하면 paywalled-seo-v1 재검토 별도 의도 필요. → 별도 신호로만 기록.

- [validated] **(v1) 클래스 = 기존 워크스페이스(type=course) 확장 + 이미 있는 cohort 인프라 재사용** (2026-04-30 schema 감사) — 새 entity 추가 X. `workspace.type='course'` + `classPreset` (신규 enum) + `joinPolicy` 조합으로 인강/기수제 인강 표현. **기수 메타데이터는 이미 존재하는 `cohort`/`cohortMember`/`liveSession`/`attendanceRecord` 테이블 + `document.cohortId` FK 활용** — workspace 에 `cohortStartAt`/`cohortEndAt`/`cohortNumber` 추가 불필요. → **metric: workspace 설정 조합으로 self-paced + cohort-online + cohort-offline 3 케이스 표현 가능 검증, cohort 테이블 read/write 동작 확인**

- [hypothesis] **(v1) 공개 게시판 데이터 모델** — 게시판 doc schema: ① workspace doc 확장 (`accessLevel: 'public'` + `authorType: 'student'`) — 기존 인프라 재사용, ② 별도 `class_post` 테이블 — Q&A 스레드/답변 구조 명시. 1차 가설: **①** (빠르고 SEO 메커니즘 그대로 사용, paywalled-seo-v1 역방향). 답변/베스트답변 같은 Q&A 구조는 v2. → **metric: 데이터 모델 결정 + 멤버 권한 (draft/publish/edit-own) 정의**

- [hypothesis] **(v1) 게시판 글 publish 흐름** — 학생이 글 쓰면: (a) 즉시 공개, (b) 강사 승인 후 공개, (c) 학생 선택 (draft/publish). 공개 + 즉시 indexable = spam/품질 리스크 → 강사 toggle 필요. 1차 가설: 워크스페이스 setting `studentPublish: 'auto' | 'approval' | 'student-choice'`, 기본값 `'student-choice'`. → **metric: 3 모드 흐름 정의 + 기본값 결정 + UI 노출**

## Not (v1 MVP)

- **live / hybrid 콘텐츠 모드** — v1 은 async 만. 실시간 강의·진행은 v2
- **정기 / 일회성 시간 구조** — v1 은 상시 + 기수제 만
- **모임/부트캠프/세미나/스터디/동네 모임/멘토링/멤버십 6개 프리셋** — v1 검증 후 v2 로 점진 확장
- **3차원 자유 조합 UI** — v1 은 3-enum (`self-paced | cohort-online | cohort-offline`) 만 노출. 차원값 직접 조정 UI 는 v2
- **플랫폼 home SEO 자체 콘텐츠** (카테고리/태그 hub, 작가 디렉토리, 트렌딩) — `public-blog-home` 자체 iter 와 분리, MVP 외
- **크리에이터↔플랫폼 backlink/redirect 정책** — 매출 모델 정해진 뒤 다시 (현재는 매출 라인 자체 v1 외)
- **발견 surface 책임 분리** — 플랫폼 home / 작가 home 책임 가르기는 별도 의도
- **학생 reputation/평가 시스템** — 좋아요·댓글도 v1 외. v2 (Stack Overflow 식)
- **Q&A 스레드/답변/베스트답변 구조** — v1 게시판은 단순 글 모델만
- 결제/구독 플로우 변경 — `paywalled-seo-v1`, `members-only-ssg-gate` 영역
- 새 워크스페이스 타입 추가 — `course` 확장으로 충분
- 크리에이터 등급/뱃지 — `creator-platform` Backlog
- 다국어 SEO (hreflang) — `workspace-seo-v3` Backlog
- 자동 서브도메인 발급 인프라 (DNS API) — `{slug}.openhow.io` 패턴 자체를 v1 에서 안 씀
- customDomain 공개 모집 / 셀프서비스 UI — 인프라는 동작하지만 v1 에서 사용자 노출 안 함

## Context

### 부모 의도

- `creator-platform` (done, iter 1) — 작가 정체성 + 구독 + 큐레이션 UX. 본 의도는 그 위에 **도메인/IA 축** + **학생-as-author 축** 을 얹는다. (creator-platform 의 Why 도 "지식플랫폼" 으로 broaden 될 여지 있음 — 별도 iter 2 검토 가능)
- `public-blog-home` (building, iter 4) — 플랫폼 home 큐레이션 surface. 본 의도가 SEO/IA 정책으로 그 surface 의 책임을 정의.

### 병행 정체성 의도와의 관계 (2026-04-30 추가)

`editorial-traffic-engine` (exploring, 2026-04-21) 가 같은 시기에 **"openhow = 에디터 큐레이션 트래픽 엔진"** 정체성으로 동등한 정체성-레벨 결정을 진행 중. 본 의도의 "지식플랫폼 (강사 + 학생-as-author)" 정체성과 **두 정체성이 한 서비스 안에서 어떻게 양립하는지가 미해결**:

- 본 의도 v1 MVP = 강사·학생 자율 발행 (creator-ownership 원칙 유지)
- editorial-traffic-engine = 에디터가 외부 임포트 + 내부 가공 후 게이트 발행 (creator-ownership 재정의)

세 가지 양립 시나리오:
1. **양립 (두 갈래)** — 강사/학생 자율 루트 + 에디터 큐레이션 루트 동시 운영. 같은 인프라, 다른 surface
2. **에디터 우위** — editorial-traffic-engine 의 "축 1 = 자율 루트 제거" 채택 시 본 의도의 강사·학생 자율 모델 자체 폐기
3. **자율 우위** — 본 의도가 메인, editorial-traffic-engine 은 별도 surface (`/topics/`, `/curated/` 등) 로 격하

→ 사용자 결정 필요. 결정 전까지 본 v1 MVP 작업은 "강사·학생 자율 루트가 살아 있다" 전제로 진행하되, 시나리오 2 채택 시 본 의도 대부분 킬·재정의 됨을 인지.

### 포지셔닝 (2026-04-30 사용자 선언)

**openhow = 지식플랫폼**. 핵심 단위 = **클래스** (현 워크스페이스 type `course`/`book` 가 후보). 클래스 운영 모드 2종:

- **인강 (async)** — 비동기 콘텐츠, 자기 페이스 학습 (evergreen SEO)
- **모임 (cohort)** — 동기 진행, 기수제 (시즌제 SEO 정책 별도)

**수강생 = 콘텐츠 생산자**. 게시글, 숙제 제출, 토론 — 이 콘텐츠가 SEO 자산이 되어 클래스 + 플랫폼 둘 다 트래픽 받음.

**SEO 분배 3축**:

| 축 | 콘텐츠 | 권위 받는 곳 |
|----|-------|------------|
| Instructor (크리에이터) | 강의 본문, 강의 노트 | 클래스 워크스페이스 (customDomain or platform path) |
| Student (수강생) | 게시글, 숙제, 토론 | (미결정) 클래스 / 학생 공간 / 양쪽 |
| Platform (openhow) | 카테고리/태그 hub, 작가 디렉토리, 트렌딩 | openhow.io 자체 hub 페이지 |

### 클래스 유형 차원 분석 (2026-04-30)

사용자 인사이트: "기수제는 모임일 수도 있고 인강일 수도 있다" → 기수제는 **type 이 아니라 시간 축 modifier**. 진짜 type 은 차원 조합으로 표현.

**3개 차원**:

| 차원 | 값 | 함의 |
|------|-----|------|
| **콘텐츠 모드** | `async` (영상/글, 자기 페이스) / `live` (실시간 강의·진행) / `hybrid` (둘 다) | 콘텐츠 생산 비용·강사 부담·SEO 자산성 (async 가 evergreen SEO 강함) |
| **시간 구조** | `상시 (always-open)` / `기수제 (cohort, 시작·끝 정해짐)` / `정기 (recurring, 매주/매월 반복)` / `일회성 (one-shot)` | 학생 모집 흐름 / 게시판 archive 정책 / SEO 노출 기간 |
| **만남 형태** | `online` / `offline` / `hybrid` | 위치 메타데이터 (오프라인은 지역 SEO 가능) / 결제 모델 (오프라인은 인원 제한) |

**8 프리셋** (사용자 노출용 직관적 이름) — **v1 MVP 는 ✅ 표시 3종만**:

| v1 | 프리셋 | 콘텐츠 | 시간 | 만남 | 레퍼런스 |
|----|--------|-------|------|------|---------|
| ✅ | **인강 (셀프페이스)** | async | 상시 | online | 인프런, 클래스101, 코드잇 |
| ✅ | **기수제 인강 (온라인)** | async | 기수제 | online | Maven, On Deck, 헤이비스킷 |
| ✅ | **기수제 인강 (오프라인)** | async | 기수제 | offline | 트레바리 (영상+오프라인 미팅) |
|    | **부트캠프** | live + async | 기수제 | online or hybrid | 스파르타, 패스트캠퍼스, 멋사 |
|    | **세미나/특강** | live | 일회성 | online or hybrid | 강연, webinar, conference |
|    | **정기 스터디** | live + async | 정기 | online or hybrid | 독서모임, 코드리뷰, 스터디 |
|    | **동네 모임** | live | 정기 or 일회성 | offline | 소모임, 문토, 트레바리 (offline) |
|    | **멘토링/코칭** | live | 정기 | online or hybrid | 1:1 멘토링, 그룹 코칭 |
|    | **커뮤니티 멤버십** | hybrid | 상시 | hybrid | 트레바리(membership), 헤이조이스 |

각 프리셋 = 차원 조합의 추천 기본값. 사용자는 프리셋 고른 후 차원값 개별 조정 가능. SEO·게시판 정책은 차원에서 도출:
- `상시 + async` → evergreen, 게시판 항상 indexable
- `기수제` → 지난 기수 archive 정책 결정 필요 (noindex vs index)
- `offline` → 지역 키워드 SEO + Google 비즈니스/지도 연동 가능 (Backlog)
- `live + 일회성` → 행사 종료 후 video archive indexable 처리

### 비교 레퍼런스

| 서비스 | 학생 콘텐츠 SEO | 패턴 |
|-------|---------------|------|
| **liveklass** | 없음 | 크리에이터 인강 위주, 학생 콘텐츠 제로 |
| **인프런** | 강의 페이지 + Q&A 페이지 분리 SEO | 강사 콘텐츠 + 수강생 Q&A 양쪽 indexable |
| **Discourse forum** | 토론 자체가 검색 자산 | 카테고리 + 태그 + 사용자 페이지 SEO |
| **Discord (publicized)** | 채널 archive 가 검색에 잡힘 (제한적) | 비공식 |
| **Stack Overflow** | Q&A 가 핵심 SEO 자산 | reputation 시스템 + 답변자 brand |

openhow 가 가져갈 부분: **인프런식 강의+Q&A 분리** + **Discourse 식 토론 surface 의 SEO** + **SO 식 답변자 brand**.

### 이미 있는 인프라

| 위치 | 상태 |
|------|------|
| `core/packages/worker/src/db/schema.ts` `workspace.customDomain` | 워크스페이스가 자기 도메인 가질 수 있음 (예: class.clauders.ai) |
| `core/packages/worker/src/index.ts` hostname 라우팅 | 도메인별 워크스페이스 매핑 동작 |
| `core/packages/cli/src/ssg/buildSeoMeta.ts` `buildCanonicalUrl` | customDomain 있으면 canonical 자동 전환 (`workspace-seo-v1`) |
| `paywalled-seo-v1` (done) | 공개 유료 문서 = SEO 가능 + preview only |
| `members-only-ssg-gate` (done) | 멤버 전용 = SEO + body 보호 + JSON-LD `isAccessibleForFree:False` |
| `workspace-seo-v1` (done) | 워크스페이스별 GA, GTM, sitemap.xml, robots.txt |
| ~~`platform-pro-plan`~~ (killed 2026-04-30) | Pro 요금제 자체 폐기 — 매출 모델 v1 외, customDomain 은 운영자 본인용으로만 비공개 사용 |
| `public-blog-home` (building) | 플랫폼 home 큐레이션 시작 (워크스페이스 그리드 + 큐레이션 섹션) |
| `creator-platform` (done) `/s/{username}` | 작가 프로필 페이지 — 한 작가의 여러 워크스페이스 묶음 |

### liveklass.com 패턴 분석

- 주소: `{user}.liveklass.com` per-creator subdomain (플랫폼이 자동 발급)
- liveklass.com 자체는 강의 검색/카테고리 hub 위주, 크리에이터 brand 가 우선
- SEO 분배: 검색 결과 거의 `{user}.liveklass.com` 가 잡음. liveklass 본체는 "liveklass" 브랜드 키워드 위주

### openhow 와의 차이

- openhow 는 **무료 공개 콘텐츠가 주력 DAU 엔진** (`public-blog-home` Why). liveklass 는 유료 강의 위주.
- 따라서 SEO 분배 정책도 다르게 갈 수 있음 — 무료 글은 플랫폼이 흡수해도 안전, 유료·멤버는 크리에이터 보유.
- 자동 서브도메인 발급 (`{slug}.openhow.io`) 은 현재 미구현. customDomain 만 있음. URL 구조 결정에 따라 인프라 추가 필요할 수 있음.

### 결정 의존 관계 (2026-04-30 갱신 — MVP 좁힘 후)

| Hinge | 결정 | 함의 |
|-------|------|------|
| **URL 구조** | `openhow.io/w/{slug}` 단일, 서브도메인 패턴 X, customDomain 은 운영자 한정·비공개 | canonical = `/w/{slug}` path, customDomain 워크스페이스만 예외 |
| **수강생 콘텐츠 위치** | 클래스 워크스페이스 안 공개 게시판 | canonical = 클래스 URL, 학생 공간은 cross-list 만 |
| **클래스 유형 (v1 MVP)** | 인강 + 기수제 인강 (온/오프) 3-enum 만 | live/hybrid 콘텐츠·정기/일회성·6 프리셋 모두 v2. 차원 자유 조합 UI 도 v2 |

이 세 결정으로 v1 MVP 가 자동 도출:

- **워크스페이스 = 기존 `course` 타입 확장** (새 entity X). `classPreset: 'self-paced' | 'cohort-online' | 'cohort-offline'` enum + 기수제는 `cohortStartAt/EndAt/Number` 추가.
- **SEO 메커니즘 = 기존 인프라 그대로 재사용**: `paywalled-seo-v1` (강의 본문 paywalled) + `members-only-ssg-gate` (members) + `workspace-seo-v1` (sitemap/canonical). 학생 게시판은 paywalled-seo-v1 의 "공개" 케이스를 doc 단위로 적용.
- **신규 인프라 최소화**: 학생 게시판 surface (URL/CRUD) + `studentPublish` 토글 + 기수제 메타 3 필드. 그 외엔 기존 SSG/SEO 파이프라인 재사용.

남은 미결정 (v1 안에서 결정해야):
- ~~게시판 path~~ — 잠김 (`/w/{slug}/community/{post-slug}`, 2026-04-30)
- 게시판 글 데이터 모델 (workspace doc 확장 vs 별도 테이블) — 현재 가설 ①
- 학생 publish 흐름 (즉시 / 승인 / 학생 선택) — 현재 가설 `student-choice` 기본
- **기수제 정책 4가지** (위 What 항목 참조) — (a) 지난 기수 강의 indexable, (b) 반복 강의 canonical, (c) 게시판 기수별 분리, (d) 기수 메타 surface

### 확정된 주변 정책 (다른 의도에서 결정됨)

- 무료 콘텐츠 = 플랫폼 큐레이션 노출 / 유료·멤버 = 크리에이터 공간 한정 (`creator-platform` 결정)
- customDomain = 인프라 동작하나 셀프서비스/모집 안 함, 운영자 본인 워크스페이스만 비공개 사용 (`platform-pro-plan` killed 2026-04-30 의 후속 정리)
- "Powered by openhow" footer = 항상 노출 (Pro 면 제거 정책은 Pro 요금제와 함께 폐기)
- 멤버 전용 워크스페이스도 SEO 가능 (preview + JSON-LD) (`members-only-ssg-gate` done)
- **플랫폼 자체 매출 라인은 v1 외** — 무료로 트래픽/사용 검증 우선, 매출 모델은 별도 의도로 다시 설계

## Footprint

### wedge B-crud-4b — 강사 승인 큐 admin UI (2026-04-30, commit 3c0bd9f)

- **신규 admin 페이지**: `pages/admin/AdminCommunityReview.tsx` + `.css` — review 큐 fetch + 각 항목 옆 [승인]/[반려] 버튼 + 본문 미리보기 링크
- **상태 처리**: per-item pending state (approving/rejecting), optimistic remove on success, action error 분리 표시
- **정책 안내**: workspace.studentPublish !== 'approval' 일 때 "승인 대기 항목이 새로 쌓이지 않을 수 있다" 경고 — 잘못된 워크스페이스에서도 페이지가 작동
- **빈 상태 + 새로고침 버튼**: empty state 박스 + 수동 refresh
- **라우트 추가**: `/dashboard/:workspace/community-review` (admin layout 하위)
- **AdminLayout nav**: "커뮤니티" 그룹의 댓글 링크 바로 뒤에 "학생 글 승인" 항목 추가 — `canManage` 조건부, currentSection 매핑도 추가
- **codex scope creep 0건 (working tree pollution 회피)**: 다른 세션의 WIP (LessonCardSandbox, ImageSidecar, MCP directives 등) 가 working tree 에 잔존하던 상태에서 codex 가 정확히 본 wedge 4 파일만 추가/수정. router.tsx 는 partial staging (`git apply --cached`) 으로 본 wedge 2 line 만 commit. **이 패턴 — pre-existing WIP 명시 + partial stage** — 다른 세션과 병행 시 표준화.
- **Tip 잠재**: `git status` 가 본 wedge 외 파일도 보일 때 codex 가 임의 enrichment 안 하도록 prompt 의 CRITICAL #5 ("이미 working tree 에 다른 사람 WIP 가 있음 — 그 파일들 절대 건드리지 말 것") 가 효과적이었음.

### wedge B-crud-4 — 강사 승인 큐 endpoint (worker only) (2026-04-30, commit 787aeb6)

- **Worker**: `routes/workspaces.ts` 에 3개 핸들러 추가 (B-crud-2b 의 DELETE 바로 다음)
  - `GET /:slug/community/review` — admin only (`canEditDocuments`), `status='review'` AND `authorType='student'` AND `slug LIKE 'community/%'` 게시글 100개 반환. 응답에 workspace.studentPublish 포함.
  - `PATCH /:slug/community/:postSlug/approve` — admin only, `review` → `approved` + `publishedAt=doc.publishedAt ?? now`
  - `PATCH /:slug/community/:postSlug/reject` — admin only, `review` → `draft` (작성자에게 임시저장으로 반려)
- **Pre-condition 검증**: status !== 'review' 면 400 (혼란 방지)
- **Imports**: 추가 import 없음 — workspaces.ts 가 이미 다 갖고 있음
- **codex scope creep 1건 (types/course.ts)**: priceMinor/originalPriceMinor/ratingAvg/ratingCount/tags + CourseTag interface 추가하려 함 — 무관한 변경. `git restore packages/types/src/course.ts` 로 복구. **다음 prompt 부터 CRITICAL 블록에 "types/course.ts 등 임의 enrichment 절대 금지" 명시 필요.** types/ 절대금지 규칙은 있었지만 codex 가 task-tangential enrichment 욕구를 못 참는 패턴이 보임.

### wedge B-crud-3b — 학생 글 편집 폼 + DocPage 수정/삭제 버튼 (2026-04-30, commit e03209c)

- **신규 페이지**: `CommunityEdit.tsx` + `.css` — CommunityCompose 와 동형 textarea 폼, mount 시 `GET /documents/by-slug?workspace=&slug=community/{postSlug}` 로 기존 데이터 로드 + `GET /workspaces/{ws}/community` 로 studentPublish 모드 조회
- **studentPublish 모드별 편집 UI**:
  - `approval` → "본문 수정 시 다시 승인 대기" 안내
  - `auto` → "수정 즉시 반영" 안내
  - `student-choice` → 공개 토글 (체크박스 초기값 = 현재 status === 'approved')
- **라우트**: `/w/:workspace/community/:postSlug/edit` — specific 한 `/new` 와 splat `/community/*` 사이에 끼움 (react-router specific 우선)
- **DocPage 작성자 식별**: `currentDocument.slug.startsWith('community/')` && `currentDocument.createdBy === user.id` 조건부 렌더 — `.doc-title-actions` 우측에 "수정"/"삭제" 두 버튼 추가 (`.doc-author-edit-btn`/`.doc-author-delete-btn`)
- **삭제 핸들러**: `window.confirm` → DELETE `/workspaces/{ws}/community/{postSlug}` → 성공 시 `/w/{ws}/community` navigate. 401/403/error 모두 alert 처리
- **CSS**: DocPage.css 에 `.doc-author-*-btn` (edit hover 파란색, delete hover 빨간색) 추가
- **codex scope creep 0건**: prompt 첫 머리 CRITICAL 블록에 `.serena/` + `cli/` + `types/` + `worker/` 절대금지 4가지 모두 명시 → codex 가 정확히 viewer 5 파일만 변경. **이 패턴 (CRITICAL 블록에 금지 디렉토리 enumerate) 표준화 확정.**

### wedge B-crud-3 — 학생 글쓰기 폼 UI (2026-04-30, commit a969cf2)

- **신규 페이지**: `CommunityCompose.tsx` + `.css` — textarea 기반 폼 (Plate editor 안 씀, 가벼움 우선), sha256 contentHash 클라 계산
- **studentPublish 모드별 UI 분기**:
  - `approval` → "강사 승인 후 공개" 안내 박스
  - `auto` → "게시 즉시 공개" 안내 박스
  - `student-choice` → "바로 공개" 체크박스 토글
- **라우트 추가**: `/w/:workspace/community/new` (DocPage splat 보다 위 — react-router specific 우선)
- **CommunityList 글쓰기 버튼 활성화** → navigate
- **codex scope creep 6 파일 (cli/ssg + types/config) — 자가 alert + 복구**: codex 가 또 무관한 cli/types 건드림. `git restore` 로 6 파일 모두 원복. **MUST NOT 강도 더 올려도 cli/ ssg 영역은 codex 가 자꾸 침범** — 다음 wedge 부터 prompt 첫 머리 CRITICAL 블록에 "/cli/, /types/ 절대 금지" 도 함께 배치.

### wedge B-crud-2b — PUT/DELETE 학생 게시판 글 endpoint (2026-04-30, commit f623160)

- **Worker**: `routes/workspaces.ts` line 502 (PUT) + line 591 (DELETE)
- **PUT 정책**: 작성자 본인만 (`createdBy === user.id`). content 변경 시 R2 갱신 + contentHash 필수. studentPublish 흐름 재적용:
  - `auto` → 항상 approved 유지
  - `approval` → content 변경 시 approved → review 회귀 (재승인 필요)
  - `student-choice` → body.publish 토글로 approved ↔ draft
- **DELETE 정책**: 작성자 본인 또는 admin (`canEditDocuments`) — soft delete (`deletedAt`)
- **codex scope creep 0건**: prompt 첫 줄 CRITICAL 강조 (".serena/project.yml 절대 건드리지 말 것 + 작업 종료 직전 자가검증") 추가하니 codex 가 정확히 1 파일만 변경. 다음 prompt 부터 이 패턴 표준화.

### wedge B-crud-2 — POST /workspaces/:slug/community 학생 글 작성 endpoint (2026-04-30, commit bc1ba4b)

- **Worker**: `routes/workspaces.ts` line 407 에 새 POST endpoint
- **studentPublish flow 분기**:
  - `auto` → `status='approved'` + `publishedAt=now`
  - `approval` → `status='review'` (강사 승인 큐 대기)
  - `student-choice`/null → `body.publish` 기준 (true→approved, false→draft)
- **slug 자동 생성**: `community/{title-sluggify}-{8자hex}`, accessLevel public, authorType student 고정
- **멤버십 확인**: `getWorkspaceRole` 로 비멤버 403
- **codex scope creep 또 1건**: `.serena/project.yml` — MUST NOT 에 강조 명시했음에도 또 건드림. `git restore` 로 복구. **다음 prompt 부터 codex 격리 강도 더 올릴 필요** (예: 작업 시작 시 `.serena/` 디렉토리 자체 chmod readonly 또는 prompt 첫 줄에 절대금지 강조 반복).

### wedge B-crud-1 — document.authorType enum + GET 응답 노출 (2026-04-30, commit 9b19a46)

- **DB**: `document.authorType` enum (`instructor`/`student`, NULL 허용) — migration 0058 + journal idx 6 + snapshot 0006
- **Types**: `Document.authorType?` optional
- **Worker route**: `routes/documents.ts` GET select + 두 개 응답 매핑 노출 (검증/PUT/POST 변경 X)
- **codex scope creep 1건 + 자가 alert 후 복구**: `.serena/project.yml` 변경 감지 → `git restore` 로 원복. MUST NOT 명시했음에도 codex 가 또 건드림 — 다음 prompt 부터 더 강한 격리 (예: snapshot 작업 시 외부 yaml 파일 명시적 readonly).

### wedge B-route — 학생 게시판 surface (리스트 + 라우트 + DocPage prefix) (2026-04-30, commit 8d0541a)

- **Worker**: `routes/workspaces.ts` 에 `GET /:slug/community` public endpoint 신설 — `slug LIKE 'community/%'` + `accessLevel='public'` + `status='approved'` 게시글 100개 반환 (인증 없음, SEO 자산)
- **Viewer page (신규)**: `pages/workspace/CommunityList.tsx` + `.css` — 워크스페이스별 게시글 목록 + empty state + 글쓰기 disabled 버튼
- **Viewer router**: `/w/:workspace/community` (리스트), `/w/:workspace/community/*` (상세, DocPage 재사용) 2개 라우트 추가
- **DocPage**: `getSlug` 가 `location.pathname.includes('/community/')` 일 때 splat 앞에 `community/` prefix 자동 부착 → 기존 fetch flow 그대로 재사용
- **데이터 모델**: 새 컬럼/테이블 0개 — 기존 `document` 테이블의 slug pattern + accessLevel 으로 게시판 글 표현
- **codex scope 결과**: 정확히 4 modified + 2 new (+ tsbuildinfo 자동 산출), MUST NOT 위반 0건. 빌드 3종 (worker tsc, viewer tsc, viewer build) 모두 green.

### wedge B-pre — workspace.studentPublish enum + Admin UI (2026-04-30, commit 24c3f74)

- **DB**: `workspace.studentPublish` enum 컬럼 (`auto`/`approval`/`student-choice`, NULL 허용) — migration 0057
- **Types**: `Workspace.studentPublish?` optional 노출
- **Worker route**: `routes/workspaces.ts` PUT 검증 + GET join + 단일 응답; `routes/documents.ts` workspace 응답에 포함
- **Admin UI**: `AdminSettings.tsx` `type==='course'` 조건부 셀렉터 (3 옵션 한국어 라벨, 기본 `student-choice`)
- **codex scope 자가 alert 적용**: prompt MUST NOT 에 건드리지 말 파일 절대경로 명시 + verification 단계에서 `git status --porcelain` 보고 요구. 결과: scope creep 0건, 정확히 8 파일만 변경.

### wedge A — workspace.classPreset enum + customDomain admin nav 숨김 (2026-04-30, commit dcd8242)

- **DB**: `core/packages/worker/src/db/schema.ts` — `workspace.classPreset` enum 컬럼 추가
- **Migration**: `core/packages/worker/migrations/0056_add_workspace_class_preset.sql` + `meta/_journal.json` idx 4 + `meta/0004_snapshot.json`
- **Types**: `core/packages/types/src/workspace.ts` — `Workspace.classPreset` optional 노출
- **Worker route**: `core/packages/worker/src/routes/workspaces.ts` — PUT 검증 + GET join + 단일 응답 wiring; `routes/documents.ts` — workspace 응답에 classPreset 포함
- **Admin UI**: `core/packages/viewer/src/pages/admin/AdminSettings.tsx` — `type==='course'` 조건부 셀렉터 (3 옵션 한국어 라벨); `layouts/AdminLayout.tsx` — customDomain 링크 주석 처리 (라우트는 유지)
- **부수 정리**: `book`/`ebook`/`tutorial-book` 잔재 docs (cli/configuration/examples/getting-started/usecase-inventory/workspace-taxonomy) + locale (`viewer/src/locales/en.ts`) + MCP (`worker/src/mcp/index.ts`, `mcp/instructions.ts`) — 모두 `course` 로 통합. `docs/book-reading-mode.md` 삭제.

스코프 외: 학생 게시판 surface, studentPublish 토글, 기수제 4가지 정책 (a)(b)(c)(d) 결정 — 후속 wedge.

## Backlog

### v2 — 클래스 유형 확장 (v1 검증 후)
- **live 콘텐츠 모드** — 실시간 강의/진행 (Zoom embed, 라이브 스트림, 채팅)
- **hybrid 콘텐츠 모드** — async 영상 + live 보조
- **정기 / 일회성 시간 구조** — 매주 반복 / 단발 행사
- **6개 프리셋 추가** — 부트캠프, 세미나/특강, 정기 스터디, 동네 모임, 멘토링/코칭, 커뮤니티 멤버십
- **3차원 자유 조합 UI** — 프리셋 고정 enum 대신 차원값 (콘텐츠/시간/만남) 직접 조정
- **오프라인 지역 SEO** — 동네 모임/오프라인 부트캠프 — 지역 키워드 + Google 비즈니스/지도 연동

### v2 — 학생 콘텐츠
- **Q&A 스레드/답변/베스트답변 구조** — `class_post` 별도 테이블 + reply 모델
- **학생 reputation/badge 시스템** — Stack Overflow 식, 답변자 brand 강화
- **좋아요/댓글 평가 surface** — v1 단순 글 모델 위에 추가
- **수강생 onboarding 시 username 필수** — `/s/{username}/{slug}` 경로 위해

### 플랫폼 SEO 확장 (별도 의도 후보)
- **카테고리/태그 hub 페이지 SSG** — `openhow.io/tags/ax`, `openhow.io/tags/...`
- **작가 디렉토리 페이지** (`/authors`) + customDomain 외부 링크 정책
- **트렌딩 페이지** (`/trending`, daily/weekly)
- **발견 surface 책임 분리** — 플랫폼 home / 작가 home wireframe 정리
- **크리에이터↔플랫폼 backlink/redirect 정책** — 매출 모델 정해진 뒤

### 인프라 / 운영
- **(보류) 자동 서브도메인 발급** (`{slug}.openhow.io`, CF DNS API) — 패턴 자체 도입 보류 (사용자 결정 2026-04-30). 필요해지면 별도 의도
- **IndexNow API 연동** (네이버/빙 즉시색인) — `workspace-seo-v1` Backlog 와 통합
- **크리에이터 onboarding 시 URL 형식 선택 UX** (path vs subdomain vs custom)
- **E-A-T 강화 메타** — 학생 doc 에 `og:author`, JSON-LD `Person`, 클래스명 + 강사명 명시

## Learnings

### 2026-04-30: [signal] 정체성 게이트 통과 — α (liveklass-aligned 순수 크리에이터 SaaS) 잠금
- **사용자 결정**: editorial-traffic-engine kill, 플랫폼-레벨 SEO 디스커버리/토픽 허브/외부 임포트 모두 폐기. 본 의도가 v1 MVP 의 핵심 정체성으로 승격.
- **본 의도 영향**:
  - **살아남음**: 인강 + 기수제 인강 2종 프리셋, `/w/{slug}` 워크스페이스 진입, 학생 게시판 `/w/{slug}/community/{post-slug}`, 클래스 sitemap·canonical, 기수 4정책 (지난 기수 noindex 등), 강의/학생 doc canonical 정책.
  - **재해석 필요**: 학생 게시판 SEO 자산은 **"각 클래스 워크스페이스(=독립 스토어) 내부 자산"** 으로만 유효. 플랫폼 토픽 허브로 흘러가는 시나리오 폐기 — `/topics/`, 토픽 cross-listing, 에디터 큐레이션 surface 모두 v1 범위 외.
  - **평면 홈 변동**: openhow.io/ 홈은 워크스페이스 디스커버리가 아니라 **크리에이터 가입 LP** 로 피봇 (public-blog-home 의도 별도 피봇 필요).
- **다음 행동**: 본 의도의 "Why" 문장에서 "openhow 플랫폼 셋 다 트래픽" 부분은 사실상 폐기 — 트래픽 단위는 (1) 클래스 (2) 크리에이터 brand 둘만. 플랫폼은 단지 호스팅·인프라 제공. 이 점 What 섹션 어휘 정돈 필요 (별도 update).

### 2026-04-30: seed created (iteration 1)

- **Background**: liveklass-style creator subdomain + 플랫폼 SEO 양립을 묻는 사용자 발화. 인프라 조각 (customDomain, paywalled-seo, members-only-ssg-gate, workspace-seo-v1, public-blog-home, /s/{username}) 다 있으나 일관된 IA 로 묶인 적 없음. "ux 정돈이 필요해" 는 그 비통합 상태에 대한 표현.
- **Initial notes**:
  - 가장 큰 미결정 = URL 구조 (path / subdomain / 둘 다). 이게 잠겨야 canonical / cross-link / SEO 권위 분배가 자연스럽게 결정됨.
  - liveklass 는 subdomain 위주이지만, openhow 는 무료 콘텐츠 비중이 더 커서 platform 흡수 여지가 더 큼 — 단순 모방이 아니라 자기 콘텐츠 믹스에 맞춘 분배 정책 필요.
  - 부모 의도 `creator-platform` (작가 정체성) + `public-blog-home` (플랫폼 큐레이션) 둘 위에 도메인/IA 축을 결정하는 성격. 둘 중 어느 한쪽 iteration 으로 묶기엔 SEO/도메인이라는 angle 이 충분히 다름 → 별도 의도.
  - 자동 서브도메인 발급은 현 인프라에 없음 — URL 결정이 subdomain 으로 가면 별도 인프라 의도 필요 (Backlog).

### 2026-04-30: 클래스 유형 = 3차원 + 8 프리셋 모두 지원 (v1 확정)

- **사용자 인사이트**: "기수제 = 모임일 수도 인강일 수도, 동네 모임일 수도" → 기수제는 type 이 아니라 **시간 축 modifier**. type 을 단일 enum 으로 두면 차원 폭발.
- **3차원 분리**: (a) 콘텐츠 모드 (async/live/hybrid), (b) 시간 구조 (상시/기수제/정기/일회성), (c) 만남 형태 (online/offline/hybrid).
- **8 프리셋 정의**: 인강 / 코호트 / 부트캠프 / 세미나 / 정기 스터디 / 동네 모임 / 멘토링 / 커뮤니티 멤버십. 각 프리셋 = 차원의 추천 조합.
- **사용자 결정 (2026-04-30)**: v1 MVP 에 8 프리셋 다 지원. **차원 자유 조합도 모두 지원** — 프리셋은 사용자 노출 직관 이름이고 강제 enum 아님. 예: "기수제 + offline + live" = 기수제 오프라인 모임 (트레바리식 시즌제), "기수제 + offline + hybrid" = 영상으로 보고 매월 오프라인 미팅. 사용자가 명시한 케이스 = "기수제 이면서 오프라인 모임" → 차원 모델로 그대로 표현됨.
- **SEO 정책의 함의**: 상시+async = evergreen, 기수제 = 지난 기수 archive 정책 필요, offline = 지역 키워드 SEO 가능 (Backlog), live + 일회성 = 행사 종료 후 video archive indexable 결정 필요.
- **What 상태 변화**: "(v1) 클래스 유형 = 3차원 모델 + 8 프리셋 모두 지원" → [validated].
- **남은 미결정**:
  - 게시판 surface 모양 (1개 통합 vs Q&A·자유토론·숙제 분리, 클래스 유형별 차이)
  - 학생 글 공개 흐름 (즉시/승인/학생 선택)
  - 클래스 = 워크스페이스 확장 vs 새 entity (데이터 모델)
  - 기수제 archive 정책 (지난 기수 indexable?)

### 2026-04-30: 두 hinge 잠김 — URL = path / 학생 콘텐츠 = 클래스 내 공개 게시판

- **사용자 결정 1 (URL)**: 자동 서브도메인 발급은 안 함. 서브도메인은 admin 본인 또는 Pro 요금제만. 일반 워크스페이스는 `openhow.io/{slug}` path 기반.
- **사용자 결정 2 (학생 콘텐츠)**: 학생 글은 해당 워크스페이스 안에 쌓이되, **공개 게시판 surface** 로 분리. 강의 본문은 paywall/members-only 가능, 게시판은 항상 공개 (SEO 자산).
- **모델 매핑**: 인프런식 강의+Q&A 통합. 강의 페이지 (paywalled) + Q&A 페이지 (public, indexable). 차이점: openhow 는 강의도 공개 가능 (paywalled-seo-v1 메커니즘으로 preview SEO).
- **What 상태 변화**: 5건 [hypothesis] → 3건 [validated] (URL / 학생 위치 / 학생 canonical), 2건은 hypothesis 유지 (클래스 entity 정체성, 모임-인강 SEO 차이). 신규 3건 추가 (게시판 데이터 모델, publish 흐름, 평가 surface).
- **state 전이**: seed → exploring (방향 잠금, 세부 미결정 진행 중).
- **남은 미결정** (다음 인터뷰 후보):
  - 게시판 surface URL/이름 (`/board`, `/community`, `/q-a` 등)
  - 게시판 글의 데이터 모델 (기존 doc 확장 vs 별도 테이블)
  - 학생 publish 흐름 (즉시/승인/학생 선택)
  - 모임 vs 인강의 게시판 정책 차이 (기수별 archive?)

### 2026-04-30: 게시판 path 잠금 + Pro 요금제 kill + 기수제 4가지 explicit 화

- **사용자 결정 3가지**:
  1. **게시판 path = Claude 일임 (SEO 최우선)** + 워크스페이스별로 분리 관리
  2. **기수제는 뭘 결정해야 하는지 explicit 하게 풀어달라** (결정 자체는 다음 turn 에)
  3. **Pro 요금제 폐기** — "pro 가치는 일단 없다고 보자고. pro 요금제 제공하지말자"
- **결정 1 (게시판 path)**: `openhow.io/w/{slug}/community/{post-slug}` 로 잠금. 근거:
  - SEO 가산점은 segment 보다 post 의 title/content/메타 비중이 훨씬 큼 → segment 는 일관성 + 의미 명확성 우선
  - `/community` segment = 인강 v1 범위에서 다양한 글 형식 (질문·후기·회고·숙제 결과) 모두 수용 가능 — 한 surface 면 충분
  - 한국어 UI 라벨 "커뮤니티" 자연스러움
  - 차후 분화 (`/community/q-a`, `/community/reviews`) 로 무손실 확장 가능
  - schema.org `DiscussionForumPosting` 마크업으로 검색 의도 명확
  - 워크스페이스별 분리는 path 가 `/w/{slug}/community/...` 로 자연 분리됨 (DB 권한도 workspace 단위)
- **결정 2 (기수제 4가지)**: 한 [hypothesis] 항목으로 묶고 (a)(b)(c)(d) 풀어 둠 — 1차 가설 모두 적시, 사용자가 다음 turn 에 OK/수정 결정:
  - (a) 지난 기수 강의 indexable: 1차 가설 = ① 항상 indexable
  - (b) 반복 강의 canonical: 1차 가설 = ③ cohort-agnostic URL (`/w/{slug}/lessons/{lesson-slug}`)
  - (c) 게시판 기수별 분리: 1차 가설 = ③ 한 surface + post 메타 cohortNumber 필터
  - (d) 기수 메타 surface: 1차 가설 = workspace 단일 + post 의 cohortNumber 필드 (별도 entity X)
- **결정 3 (Pro kill)**:
  - `.omj/core/platform-pro-plan.md` → `.omj/_killed/platform-pro-plan.md` 이동
  - frontmatter `status: seed` → `status: killed`, `killed_at: 2026-04-30` 추가
  - 본문 상단에 Kill 사유 + 부활 조건 메모 추가 (원본 보존)
  - 본 의도의 "확정된 주변 정책" 에서 Pro 관련 2줄 (customDomain Pro 전용, footer Pro 면 제거) 제거 + Pro 폐기 사실 명시
  - Backlog 의 "크리에이터↔플랫폼 backlink … Pro 활성 후" → "매출 모델 정해진 뒤"
  - 인프라 표의 platform-pro-plan 행에 ~~취소선~~ + killed 표기
  - **Pro 폐기로 customDomain 가치 트레이드는 유지** — 인프라 동작은 살아 있되 셀프서비스 안 함, 운영자 본인 워크스페이스(예: clauders.ai)만 비공개로 사용
- **What 상태 변화**: [validated] 5건 (URL, 클래스 유형, 학생 위치+path, 학생 doc canonical), [hypothesis] 4건 (canonical 정책, 기수제 4가지 묶음, 클래스 entity, 게시판 데이터 모델, publish 흐름).
- **남은 v1 미결정 (다음 인터뷰 후보)**:
  - 기수제 4가지 OK 또는 수정 (가장 큰 묶음)
  - 게시판 글 데이터 모델 (workspace doc 확장 vs 별도 테이블 — 1차 가설 ①)
  - 학생 publish 흐름 (1차 가설 student-choice)

### 2026-04-30: URL 구조 추가 좁힘 — `/w/{slug}` 단일, 서브도메인 패턴 폐기

- **사용자 결정**: "{slug}.openhow.io 이걸로 하지말고 현재 커스텀 도메인이 가능해 (이건 개방안할거야 일단 되기는 해), 대부분의 사용자는 openhow.io/w/slug 가 되겠지"
- **변경 3가지**:
  - 일반 워크스페이스 URL = `openhow.io/w/{slug}` (이전: `openhow.io/{slug}` → `/w/` 네임스페이스 prefix 추가)
  - `{slug}.openhow.io` 서브도메인 패턴 = **v1 도입 자체 안 함** (이전: admin/Pro 한정 발급 → 완전 폐기)
  - customDomain = 인프라 동작하나 **공개 모집/셀프서비스 안 함** (이전: Pro 한정 노출 → 운영자 본인 워크스페이스만 비공개로 사용)
- **`/w/` prefix 의 함의**: 루트 path namespace 를 비워둠 (예: `openhow.io/about`, `openhow.io/tags/...`, `openhow.io/s/{username}` 같은 플랫폼 자체 surface 가 워크스페이스 slug 와 충돌 없이 들어갈 공간). slug squatting 우려도 줄음.
- **Pro 요금제와의 분리**: 이전 안에선 customDomain = Pro 의 핵심 가치였는데, customDomain 자체를 v1 에서 안 열면 `platform-pro-plan` 의 v1 가치 제안이 약해짐 → Pro 의도는 (a) 보류 또는 (b) 다른 가치로 재정의 (브랜딩 제거, 분석 권한 등) 해야 함. 이 인텐트 외부 결정이라 별도 신호로 platform-pro-plan 의도에 옮길 가능성 있음.
- **What/Backlog 영향**: URL 구조 [validated] 항목 갱신, Canonical [hypothesis] 갱신 (`/w/` 케이스로), Backlog 의 자동 서브도메인 발급 항목은 "보류" 로 격하.

### 2026-04-30: MVP 좁힘 — 인강 + 기수제 인강(온/오프) 만 v1

- **사용자 결정**: "지금 mvp 가 너무 크지? seo, 인강, 기수제 인강(온라인, 오프라인) 위주로만 집중하는걸로 하자."
- **트리거**: 직전 결정에서 8 프리셋 + 3차원 자유 조합을 v1 에 다 넣기로 했었음 → MVP 가 너무 커진다는 자기 진단.
- **좁힘 범위 (3축)**:
  - 콘텐츠 모드: `async` 만 (live/hybrid 제외)
  - 시간 구조: `상시` + `기수제` 만 (정기/일회성 제외)
  - 만남 형태: `online` + `offline` 만 (hybrid 제외)
- **v1 프리셋 = 3종**: 인강 (async + 상시 + online), 기수제 인강 온라인 (async + 기수제 + online), 기수제 인강 오프라인 (async + 기수제 + offline — 영상 + 오프라인 미팅 = 트레바리식).
- **What 항목 정리** (13 → 8):
  - 살림 (v1 [validated] 4건): URL 구조, 학생 콘텐츠 위치, 학생 doc canonical, 클래스 유형 (3-enum 으로 좁힘)
  - 살림 (v1 [hypothesis] 4건): canonical 정책, 기수제 archive, 클래스 entity 정체성, 게시판 데이터 모델, publish 흐름
  - Backlog 으로 (v1 제외 5건): 플랫폼 home SEO 자체 콘텐츠, 크리에이터→플랫폼 backlink, 플랫폼→크리에이터 link/redirect, 발견 surface 책임 분리, 학생 평가 surface
  - 변형 1건: "모임 vs 인강 SEO 차이" → 모임 빠지면서 "기수제 archive SEO 정책" 으로 좁혀 살림
- **새 신호 — 데이터 모델 단순화 가능**:
  - live/hybrid 콘텐츠 빠지면서 Zoom/스트림 인프라 v1 불필요
  - 정기/일회성 빠지면서 캘린더/RSVP 인프라 v1 불필요
  - 3차원 자유 조합 UI 빠지면서 `classPreset` enum 3종으로 끝
  - workspace `course` type 확장 + 기수제 메타 3 필드 + 학생 게시판 surface = v1 인프라 신규 요소 전체
- **남은 미결정** (v1 안에서 결정):
  - 게시판 surface URL/이름 (`/board` vs `/community` vs `/q-a`)
  - 게시판 글 데이터 모델 (1차 가설: workspace doc 확장)
  - 학생 publish 흐름 (1차 가설: `student-choice` 기본)
  - 기수제 archive SEO 정책 (1차 가설: 항상 indexable + cohortStatus 메타)

### 2026-04-30: schema 감사 — cohort 인프라 이미 존재, 가설 (d) 정정

- **발견**: `core/packages/worker/src/db/schema.ts` 감사 결과 다음이 이미 있음:
  - `cohort` 테이블 (line 395) — 워크스페이스별 기수 entity
  - `cohortMember` 테이블 (line 418) — 학생 기수 enrollment
  - `liveSession` (line 438), `attendanceRecord` (line 466) — 기수제 라이브 진행 인프라
  - `document.cohortId` FK (line 563) — doc/post 가 특정 기수에 묶이는 메커니즘
- **가설 (d) 정정**: "workspace 단일 + cohortNumber 필드만, 별도 entity 불필요" → 잘못된 가정. **이미 별도 entity (`cohort`) 가 있고 v1 은 그걸 재사용**. workspace 에 cohort 메타 컬럼 추가는 불필요·중복.
- **What 상태 변화**: "(v1) 클래스 = 기존 워크스페이스 확장" 항목이 [hypothesis] → [validated] 로. 인프라 표에 cohort/cohortMember/liveSession/attendanceRecord 행 추가 필요 (별도 turn).
- **wedge A 확정**: v1 첫 PR 범위 = (1) `workspace.classPreset` enum 컬럼 + 마이그레이션, (2) Admin UI 에서 customDomain 입력 hide + classPreset 셀렉터 추가. 그 외 게시판 surface, 학생 publish, 기수제 4가지 정책은 후속 PR.

### 2026-04-30: wedge A 빌드 — codex scope creep 감지 + 부분 restore

- **결과**: wedge A (classPreset enum + customDomain hide + book 잔재 정리) 정상 완료, commit `dcd8242` push 됨. types/worker/viewer 빌드 모두 통과.
- **scope creep 사례**: codex 가 prompt 범위를 벗어나 10개 추가 변경 시도 — cli/types `package.json` 버전 bump, worker `index.ts` SSG 캐시 정책 fix, viewer `DocPage.tsx` CTA 추가, `UnifiedLayout.tsx` siteTitle fallback, `Login.css`, cli/publish.ts·buildHtml.ts·ssgStyles.ts, `.serena/project.yml` LSP 언어 리스트.
- **대응**: 사용자 확인 후 `git restore` 로 10개 모두 원복. wedge A 핵심 + book 정리만 commit.
- **교훈 → 다음 codex prompt 작성 시 적용**:
  - prompt 의 "Scope" 섹션에 **변경할 파일 절대 경로 + 라인 범위** 명시
  - "MUST NOT" 에 "다른 파일 수정 금지", "package.json version 변경 금지", "기존 동작 영역 (SSG 캐시, CTA, layout fallback) 건드리지 말 것" 명시
  - codex 종료 후 `git status --porcelain` 으로 prompt scope 비교 — scope 외 변경 발견 시 자동 alert
- **다음 wedge 후보** (사용자 결정 대기):
  - **(B) 학생 게시판 surface** — `/w/{slug}/community/{post-slug}` 신설, 데이터 모델 (workspace doc 확장 vs `class_post` 테이블 — 1차 가설 ①), CRUD + 권한
  - **(C) studentPublish 토글** — `studentPublish: 'auto' | 'approval' | 'student-choice'` (기본 student-choice), 게시판 publish 흐름. wedge B 와 묶일 가능성 큼
  - **(D) 기수제 4가지 정책 결정** — (a)(b)(c)(d) 1차 가설 OK 또는 수정 → 결정 후 게시판 cohortId·archive 정책 구현
- **추천 순서**: D (정책 결정 — 작업 0줄, 결정만) → B+C 묶음 빌드 (게시판 + publish 흐름 한 번에). D 가 먼저여야 B 의 데이터 모델에 cohortId 분리/통합 결정이 반영됨.

### 2026-04-30: [signal] 지식플랫폼 vision 확장 — 학생도 콘텐츠 생산자

- **Trigger**: 사용자 발화 — "openhow 는 지식플랫폼. 누구나 클래스 개설(모임/인강), 수강생 게시글·숙제도 SEO 자산이 되어 클래스 + 플랫폼 둘 다 유입."
- **Why 변경**: 처음엔 creator(brand) ↔ platform(traffic) 2축 양립 문제. 이제 student 축 추가 → **3-way SEO 분배 문제** 로 확장.
- **새 unknowns**:
  - 학생 콘텐츠 schema (워크스페이스 doc author 확장 / 별도 surface / 학생 공간 backlink)
  - 클래스 = 워크스페이스 (type=course) 인가 새 entity 인가
  - 모임/인강 모드 표현 (sequenceMode + joinPolicy + 기수 archive 정책)
  - 학생 doc canonical (클래스 vs 학생 프로필)
- **What 4건 추가**: 수강생 schema / 클래스 정체성 / 학생 doc SEO 분배 / 모임-인강 SEO 차이.
- **결정 의존 관계 갱신**: hinge 가 1개 (URL 구조) 에서 2개 (URL + 학생 콘텐츠 위치) 로. 두 hinge 는 독립이지만, 학생 콘텐츠 위치를 먼저 잠그면 URL 후보가 줄어듦.
- **Open question (다음 인터뷰)**: 학생 콘텐츠 위치 — 인프런식 (클래스 통합 surface) / Discourse 식 (forum 분리) / 학생-brand-first (학생 공간 + backlink) 중 어디. SEO 분배 + 데이터 모델 + UX 가 옵션마다 갈림.
- **레퍼런스 비교 추가**: liveklass / 인프런 / Discourse / Discord / Stack Overflow — 학생 콘텐츠 SEO 처리 방식 정리.
