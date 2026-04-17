# creator 콘텐츠 구조화 — MVP P1 기능명세

작성일: 2026-04-16
갱신일: 2026-04-17
상태: implemented (iteration 1 — 2026-04-17)

## 1. 목적

`.omj/gpters-seo-flywheel.md` 의 첫 구현 단계를 실제 개발 가능한 수준으로 쪼갠다.

P1의 목적은 세 가지다.

1. creator가 자기 글을 **article / tutorial / case / faq** 로 분류할 수 있게 한다.
2. 모든 공개 글에 **CTA 1개** 를 붙일 수 있게 한다.
3. 홈이 그 분류를 활용해 **case / tutorial / faq 섹션**을 분리 노출한다.

이 단계에서는 복잡한 점수 모델이나 자동 추천 엔진보다, **문서 메타데이터와 공개 표면을 표준화**하는 데 집중한다.

> **SEO 원칙**: 발행(=`accessLevel: public` + `status: approved`) = 검색 색인. `promotionStatus` 같은 별도 승격 게이트는 두지 않는다. 메인 홈 노출은 기존 `featuredContent` 수동 큐레이션 유지.

---

## 2. 현재 구현 기준선

이미 있는 것:

- 공개 홈: `core/packages/viewer/src/pages/PublicBlogHome.tsx`
- 공개 피드 API: `core/packages/worker/src/routes/public-feed.ts`
- 타입/정렬 기반 홈 카드 분기
- editor pick / popular / new authors 데이터
- 기본 SEO 훅: `core/packages/viewer/src/hooks/useDocumentMeta.ts`
- 문서 공개 판단: `accessLevel`, `status`, `hidden` 필드 (이미 존재)
- 메인 홈 큐레이션: `featuredContent` 테이블 (기존 수동 운영)

현재 없는 것:

- 문서의 `contentType`
- 문서의 `ctaType`
- 문서의 `topicTags`
- 홈에서 case / tutorial / faq 전용 섹션
- 문서 하단 공통 CTA 블록

---

## 3. P1 범위

### 포함
- 문서 메타데이터 3종 추가 (`contentType`, `ctaType`, `topicTags`)
- public feed 응답 확장
- 공개 홈 섹션 확장 (case / tutorial / faq)
- 문서 상세 CTA 블록 추가
- creator 문서 설정 UI에서 3종 필드 편집 가능
- sitemap / noindex 기준을 기존 `accessLevel` + `status` + `hidden` 로 정리

### 제외
- topic 허브 페이지 구현 (P2)
- 관련 문서 자동 추천 (P2)
- 점수/에디터 기반 SEO 자동 큐레이션 (post-MVP)
- 승격/검수 워크플로우 (`promotionStatus`, `internal→review→public`) — P3, 워크스페이스 옵션으로만
- featured 자동 선별 (기존 수동 운영 유지)
- 메일 발송/자동화 — creator-platform에서 별도 관리
- 고급 analytics 대시보드 (P4)

---

## 4. 데이터 모델

## 4.1 저장 위치

P1에서는 **DB/API를 진실 원천**으로 둔다.

이유:
- openhow는 CLI 기반 정적 문서만이 아니라 웹 에디터/관리자 수정이 핵심이다.
- 홈/피드/SEO/sitemap 이 서버에서 안정적으로 읽을 수 있어야 한다.
- frontmatter만으로 가면 web editor 변경과 동기화 비용이 커진다.

즉:
- **문서 메타데이터는 DB 컬럼(또는 JSON 컬럼)**
- frontmatter import/export 는 후순위

## 4.2 추가 필드

대상: `core/packages/worker/src/db/schema.ts` 의 document 테이블 + `@openhow/types`

```ts
contentType: 'article' | 'tutorial' | 'case' | 'faq'
ctaType: 'none' | 'waitlist' | 'course' | 'apply'
topicTagsJson: string // JSON stringified string[]
```

### 기본값
- `contentType = 'article'`
- `ctaType = 'none'`
- `topicTagsJson = '[]'`

### 왜 `promotionStatus`를 P1에 넣지 않는가
- openhow는 multi-creator 플랫폼이고, creator-ownership 원칙상 **creator가 `accessLevel: public`으로 발행하면 곧 공개**다.
- 별도 승격 게이트는 코호트 운영 전제(operator가 검수)에서나 의미 있다.
- 코호트 운영이 필요해지는 시점에는 **워크스페이스 옵션 `requireReview: true`**로 복원 가능 (P3).
- MVP에선 maily.so / tistory 모델 그대로: 발행 = 검색 가능.

### 왜 `featured` 를 P1에서 추가하지 않는가
- 이미 `featuredContent` 테이블이 존재한다.
- P1은 "메인 승격 자동화"가 아니라 **creator가 자기 콘텐츠를 구조화하는 표준**까지만.
- featured는 기존 editor pick 수동 운영으로 유지한다.

---

## 5. SEO 정책

## 5.1 색인 정책

P1에서는 **공개 판단과 색인 판단을 일치**시킨다. 별도 게이트를 두지 않는다.

### index 허용 조건 (AND)
- `accessLevel === 'public'`
- `status === 'approved'`
- `hidden === false`
- 소속 workspace가 공개 워크스페이스

### noindex 조건 (OR)
- 위 조건 중 하나라도 위반
- 문서가 `draft` 상태
- 워크스페이스가 비공개

구현 지점: `core/packages/cli/src/ssg/buildSeoMeta.ts` 의 `<meta name="robots">` 주입 분기.

## 5.2 sitemap 포함 기준

색인 허용 조건과 **동일**. workspace-seo-v1의 sitemap 생성기에서 같은 필터 공유.

## 5.3 이유

- creator가 발행한 글이 곧 검색 가능한 상태여야 한다 (maily.so / tistory 패턴).
- "개인 블로그/발행 서비스" 사용자 기대와 일치.
- 품질 관리는 creator 본인의 `status: draft/approved` 토글로 이미 가능.
- 메인 홈 품질은 별도 축인 `featured`로 operator가 컨트롤하므로, 색인과 노출을 분리해도 품질 리스크 낮음.
- 후속 단계에서 에디터/점수 기반 큐레이션을 쌓을 여지는 열려 있다 (post-MVP).

---

## 6. API / 타입 변경

## 6.1 types

대상 파일:
- `core/packages/types/src/document.ts`
- 필요 시 `core/packages/types/src/index.ts`

추가 타입:

```ts
export type DocumentContentType = 'article' | 'tutorial' | 'case' | 'faq'
export type DocumentCtaType = 'none' | 'waitlist' | 'course' | 'apply'
```

문서 응답 타입에 추가:

```ts
contentType: DocumentContentType
ctaType: DocumentCtaType
topicTags: string[]
```

## 6.2 worker routes

대상 파일:
- `core/packages/worker/src/routes/documents.ts`
- `core/packages/worker/src/routes/public-feed.ts`

필수 작업:

1. 문서 조회 응답에 `contentType`, `ctaType`, `topicTags` 포함
2. 문서 수정 API에서 위 필드를 저장 가능하게 (creator가 직접 편집)
3. public feed 응답에 위 메타데이터 포함
4. `public-feed` 에서 아래 그룹 응답 추가:

```ts
{
  tutorials: PublicArticle[]
  cases: PublicArticle[]
  faqs: PublicArticle[]
}
```

### 그룹 생성 규칙
- 공개 판단: `accessLevel === 'public'` + `status === 'approved'` + `hidden === false`
- 타입 필터: `contentType === 'tutorial' | 'case' | 'faq'`
- 정렬: 최신순 (후속 단계에서 viewCount 반영)

---

## 7. 프론트엔드 변경

## 7.1 공개 홈

대상:
- `core/packages/viewer/src/pages/PublicBlogHome.tsx`
- `core/packages/viewer/src/pages/PublicBlogHome.css`

메인 홈 섹션 구조 (기존 + 신규):

```
히어로 (에디터 픽)                 — 기존
→ 추천 시리즈 (course/book)        — 기존 (public-blog-home)
→ 사례 (case)                     — 신규
→ 튜토리얼 (tutorial)              — 신규
→ FAQ (faq)                       — 신규
→ 최신 아티클                      — 기존
```

### 카드 규칙
- 타입 배지 노출 (`Case`, `Tutorial`, `FAQ`)
- CTA 성격이 드러나는 보조 문구 허용 (ctaType 기반)

## 7.2 문서 상세

대상:
- 현재 문서 공개 페이지 렌더링 컴포넌트
- `core/packages/viewer/src/hooks/useDocumentMeta.ts`

추가:
- 문서 하단 **공통 CTA 블록**
- CTA 문구는 `ctaType` 기반 렌더링

예:
- `none` → CTA 블록 렌더 안 함
- `waitlist` → "다음 기수 대기자 등록"
- `course` → "관련 강의 보기"
- `apply` → "실전 기수 신청하기"

## 7.3 creator 문서 설정 UI

대상 후보:
- `core/packages/viewer/src/pages/admin/EditorPage.tsx`
- `core/packages/viewer/src/pages/admin/AdminDocs.tsx`
- 또는 기존 문서 메타 설정 영역

P1 최소 요구:
- `contentType` select (article / tutorial / case / faq)
- `ctaType` select (none / waitlist / course / apply)
- `topicTags` comma input (배열 저장)

편집 위치는 새 페이지보다 **기존 문서 설정 영역**에 붙이는 것이 우선.

**주체**: creator 본인 (workspace owner). 플랫폼 admin이 대신 결정하지 않는다.

---

## 8. 운영 정책

## 8.1 발행 흐름

P1에선 creator가 이미 쓰는 `status` + `accessLevel` 조합으로 관리. 별도 상태 도입 없음.

- `status === 'draft'` + `accessLevel === 'public'`: 준비 중, 검색 미색인
- `status === 'approved'` + `accessLevel === 'public'`: **발행 = 검색 색인 + sitemap 포함**
- `accessLevel !== 'public'` (member / paid 등): 발행되어도 공개 노출·색인 안 됨

## 8.2 메인 승격

P1에서는 메인 승격을 자동화하지 않는다.

- 색인된 공개 문서 중
- 기존 `featuredContent` 수동 운영으로 홈 hero / editor pick 구성

즉:
- **공개/색인 = creator 결정**
- **featured = operator 메인 노출 결정**

## 8.3 추천 운영 규칙

초기엔 다음 규칙을 둔다.

- 문서당 CTA는 1개만 허용 (`ctaType` 단일 값)
- 얇은 메모나 초안은 creator 스스로 `status: draft` 유지
- FAQ는 짧아도 좋지만 중복 질문은 creator 본인이 병합

## 8.4 후속 단계와의 연결

- **P3 워크스페이스 옵션 `requireReview: true`** 활성화 시, 해당 워크스페이스는 `internal → review → public` 플로우로 전환 (코호트 운영).
- **P4 analytics** 에서 공개 문서별 organic 유입·CTA 클릭·전환을 측정. 측정은 `workspace-seo-v1`의 GA/GTM 플러밍 위에 쌓음.
- **에디터/점수 기반 SEO 큐레이션**은 실제 데이터가 쌓인 뒤 post-MVP로.

---

## 9. 수용 기준

## 기능
- 문서 저장 시 `contentType`, `ctaType`, `topicTags` 를 설정/조회할 수 있다.
- creator가 admin UI에서 위 3종 필드를 편집·저장할 수 있다.
- `/api/public/feed` 가 `tutorials`, `cases`, `faqs` 그룹을 반환한다.
- 공개 홈에 case / tutorial / faq 섹션이 각각 노출된다 (최소 1개 이상 있을 때).
- 문서 상세 하단에 `ctaType` 기반 CTA 블록이 보인다 (`none` 이면 미노출).

## SEO
- `accessLevel === 'public'` + `status === 'approved'` + `hidden === false` 인 문서만 sitemap 포함.
- 그 외 문서는 `<meta name="robots" content="noindex">` 자동 주입.
- 별도 승격 상태 체크 없음.

## 운영
- creator가 자기 문서의 3종 메타를 직접 편집할 수 있다.
- 홈 featured는 기존 수동 운영을 유지한다.
- 플랫폼 admin이 creator 콘텐츠의 색인 여부를 결정하지 않는다.

---

## 10. 구현 순서

### Step 1
- `types` 타입 추가 (`DocumentContentType`, `DocumentCtaType`)
- DB migration + schema 반영 (`contentType`, `ctaType`, `topicTagsJson` 컬럼)

### Step 2
- `documents.ts` 저장/조회 확장
- `public-feed.ts` 그룹 응답 확장 (`tutorials`, `cases`, `faqs`)

### Step 3
- creator 문서 설정 UI 추가 (3종 필드)

### Step 4
- `PublicBlogHome` 섹션 확장 (case / tutorial / faq)
- 문서 상세 CTA 블록 추가

### Step 5
- sitemap / noindex 기준을 `accessLevel` + `status` + `hidden`로 정리
- `buildSeoMeta.ts` 의 `<meta robots>` 분기 단순화

---

## 11. P1 이후 바로 이어질 것

P2에서는 다음으로 넘어간다.

- `/topics/:slug` 플랫폼 전역 허브 + `/w/{workspace}/topics/:slug` 워크스페이스 내 뷰 (같은 데이터)
- 관련 문서 자동 연결 (태그 기반)
- 태그 기반 내부링크 강화

P3:
- 워크스페이스별 `requireReview` 옵션 (코호트용 internal→review→public 복원)

P4:
- `public_doc_view`, `public_cta_click`, `topic_hub_view`, `waitlist_submit`, `apply_click` 이벤트
- weekly organic / CTA / 전환 리포트

post-MVP:
- 에디터 / 점수 기반 SEO 큐레이션

즉 P1은 **"콘텐츠를 구조화하는 단계"**, P2는 **"구조화된 콘텐츠를 엮어서 SEO cluster를 만드는 단계"**, P3는 **"운영 패턴 확장"**, P4는 **"측정 단계"**.
