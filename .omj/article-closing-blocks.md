---
status: building
created: 2026-04-17
updated: 2026-04-17
iteration: 3
---

# article-closing-blocks — 아티클 말미의 "다음 단계" 블록 시각 분리

## Why

블로그 아티클 말미에는 독자가 다음 행동으로 넘어가게 돕는 섹션이 붙는다: **관련 글 추천**, **실제 연동(개발자 문서) 링크**, **영업·가맹 문의 같은 CTA 링크**. 문제는 지금 이 세 가지가 본문 마크다운(`## 다음 단계` → `### 추천 콘텐츠`(blockquote) → `### 바로 참고할 문서`(불릿)) 형태로 그대로 이어져 본문과 시각 차이가 없다는 점이다.

실제 사례: `blog.bootpay.ai/payment-planning/pg-rejection`에서 독자가 본문 끝에 도달했는지, 추천 콘텐츠 블록으로 넘어갔는지 **시각으로 구분이 안 된다**. 본문도 이미 `> 이런 상황이라면` blockquote를 쓰기 때문에 추천 콘텐츠의 blockquote가 본문 흐름처럼 읽힌다.

세 문제가 겹쳐 있다.

1. **위계 낭비**: `## 다음 단계`라는 안내 한 줄에 H2를 쓰고, 그 아래 H3 두 개를 또 둔다. 내용 밀도에 비해 섹션이 과분.
2. **blockquote 충돌**: 본문에서 스토리 도입에 `>` 를 쓰고 있는데, 말미의 추천 글도 `>` 로 감싸면 구분이 안 된다.
3. **링크 종류 혼재**: 내부 블로그 글 / 개발자 문서(다른 도메인) / 영업 문의(CTA) 세 가지가 한 블록에 섞여 있어 "지금 내 맥락에 맞는 링크"를 고르기 어렵다.

글쓴이가 마크다운 문법으로 이 분리를 매번 손으로 만들면 일관성이 깨진다. openhow 플랫폼이 **아티클 말미 클로징 블록을 시각적으로 분리된 1급 UI 구성요소**로 지원하는 쪽이 자연스럽다.

## Context

- **채널**: `channels/bootpay` (블로그, `blog.bootpay.ai`) — 현재 51편 아티클이 모두 동일 패턴. 스펙은 bootpay 1차 적용 후 확장
- **관련 intent**: `.omj/article-reading-ux.md` — 아티클 읽기 경험 고도화. 본 intent는 그중 **"관련 글 추천"의 저자 기입 경로**만 다룬다.
- **openhow 기존 컨테이너 블록**: `::: info / tip / warning / danger / success` 지원. 시각 분리(세로 bar + 배경)가 이미 검증됨.

### 실제 렌더러 구조 (iter2 확인)

- **파이프라인**: marked.js + custom extensions (Plate.js 아님)
- **SPA 경로**: `packages/viewer/src/utils/markdown.ts` + `packages/viewer/src/styles/markdown.css`
- **SSG 경로**: `packages/cli/src/ssg/renderMarkdown.ts` + `packages/cli/src/ssg/ssgStyles.ts`
- **이중 관리**: SPA/SSG 각각 별도 CSS라 스타일·파서 모두 **네 개 파일을 함께** 수정해야 함 (core/CLAUDE.md "SSG / SPA 스타일 이중 관리" 규칙)
- **기존 extension 충돌 주의**: `::: cta https://url Label` 은 이미 URL 필수 CTA 버튼 extension으로 예약됨 → 새 문의 블록은 `::: contact` 로 네이밍

### 저자 관점의 링크 3종 분류

| 유형 | 성격 | 라우팅 | 예시 |
|---|---|---|---|
| **추천 콘텐츠** (`related`) | 같은 블로그 내부 글 | 상대 경로 `.md` | `[PG 계약은 어떻게 하나요?](pg-contract.md)` |
| **실제 연동** (`integrate`) | 다른 도메인(개발자 문서) | 절대 URL | `https://developers.bootpay.ai/payment/pg-intro` |
| **도입 문의** (`contact`) | 외부 서비스(영업·가맹) | 절대 URL | `https://www.bootpay.co.kr/inquiry` |

이 세 종은 **독자 맥락이 다르다**: 추천 콘텐츠는 "더 읽기", 실제 연동은 "구현 시작", 도입 문의는 "세일즈". 한 블록에 섞이면 독자가 "지금 나에게 필요한 링크"를 찾는 데 인지 부담이 늘어난다.

## What

### Phase 1 (MVP — 이 iteration에서 구현)

- [hypothesis] `::: related` / `::: integrate` / `::: contact` 세 개 container type 추가 (기존 `::: tip` 구조 재사용) → **metric**: 새 블록이 본문의 blockquote/H3와 시각으로 즉시 구별됨
- [hypothesis] 각 블록에 **고유 색상 + 아이콘**(📚/🔌/✉️)을 부여 → **metric**: 타이틀 없이도 아이콘만으로 블록 종류 식별 가능
- [hypothesis] 블록 상단에 **두꺼운 구분선**을 넣어 본문과 분리 → **metric**: "본문이 끝났다"는 시그널이 생김

### Phase 2 (백로그)

- 자동 `## 함께 보면 좋은 글` 래퍼 + 구분선 자동 삽입 (여러 closing 블록 감지해서 한 번만 삽입)
- 블록 내부 스키마 강제(링크 리스트만 허용) — 현재는 자유 마크다운
- 에디터 슬래시 커맨드 (`/related`, `/integrate`, `/contact`)

### 저자 문법 (확정)

```markdown
::: related 추천 콘텐츠
- [PG 계약은 어떻게 하나요?](pg-contract.md) — 심사 신청 순서와 서류 준비 기준
- [PG 심사 전에 뭐부터 준비해야 하나요?](pg-review-preparation.md) — 사이트·서류·업종 체크리스트
:::

::: integrate 실제 연동할 때
- [결제 개요](https://developers.bootpay.ai/payment/pg-intro) — API 흐름 요약
- [위젯 Quick Start](https://developers.bootpay.ai/payment/widget-quickstart) — 최소 코드로 결제창
:::

::: contact 도입 문의
- [부트페이 영업팀](https://www.bootpay.co.kr/inquiry) — 가맹·계약 상담
:::
```

### 시각 디자인 (Phase 1)

| 블록 | 아이콘 | 색상(라이트) | 의미 |
|---|---|---|---|
| `related` | 📚 | 보라 `#8b5cf6` | 내부 더 읽기 |
| `integrate` | 🔌 | 시안 `#06b6d4` | 다른 도메인 이동 |
| `contact` | ✉️ | 주황 `#f97316` | 외부 문의 |

- 기존 `md-container` 컴포넌트 확장: 새 타입에 대해 **헤더 왼쪽 아이콘 강제 노출** (기존 `tip` 은 untitled일 때만)
- 블록 상단에 `border-top: 2px dashed var(--container-accent)` 추가로 본문과 분리
- 블록 본문 padding을 기존보다 1.5배 늘려 카드 느낌 강화

## Not

- 블록 **내부의 자유 마크다운 차단** — 1차에서는 기존 container처럼 모든 마크다운 허용. 스키마 강제는 phase 2.
- 자동 추천(알고리즘) — 본 intent는 **저자 기입 경로**만 다룬다. 자동 추천은 `.omj/article-reading-ux.md`로 분리.
- 아티클 본문 중간의 기존 `::: tip / info / warning` 변경 — 그대로 두고 새 타입 **추가**.
- 기존 51편 플랫폼 교체와 동시 치환 — 플랫폼 배포 후 bootpay 측 별도 마이그레이션 작업.
- 시리즈 네비게이션(`::: series`) — 별도 intent로 분리.
- `::: next-steps` 같은 통합 블록 — 세 종 분리가 독자 맥락 구분 효과가 크다고 판단, 통합 블록은 만들지 않음.

## Footprint

### 2026-04-17 iter3 — related 블록 카드 그리드 전환

- **문제**: iter2 출시 직후 "글씨만 빽빽해서 피로하다" 피드백. 리스트 형식이 쇼핑몰 추천상품처럼 한눈에 안 들어옴.
- **변경**: `::: related` 본문이 **링크 리스트**이면 자동으로 `md-content-cards` 그리드로 렌더. `::: integrate`/`::: contact` 는 기존 리스트 유지 (외부 URL 맥락 다름).
- **썸네일 fallback**: 페이지 frontmatter 에 `thumbnail` 없으면 **제목 첫 2글자 + 해시 그라디언트 카드**. 6색 팔레트 (violet/cyan/amber/rose/emerald/slate). 같은 슬러그는 항상 같은 색 (deterministic).
- **호환성**: 기존 `::: related` 를 그대로 쓴 글은 카드로 자동 전환. 자유 마크다운을 쓴 경우 generic container 로 fallback (regex 검증 실패 시).
- **수정 파일 (5개)**:
  - `core/packages/viewer/src/utils/markdown.ts` — `parseRelatedLinkList`, `renderRelatedCard`, `hashSlug`, `extractInitials`, `LETTER_PALETTE` 추가. `containerExtension` tokenizer/renderer 에 related 분기.
  - `core/packages/cli/src/ssg/renderMarkdown.ts` — 동일 로직 미러.
  - `core/packages/viewer/src/styles/markdown.css` — `.md-content-cards--related`, `.md-content-card__thumbnail--letter`, `.md-content-card__letter` 스타일.
  - `core/packages/cli/src/ssg/ssgStyles.ts` — SSG CSS 동일 미러.
  - `core/packages/cli/src/ssg/renderMarkdown.test.ts` — related 3종 테스트 추가 (resolved 썸네일 / letter fallback / 자유 마크다운 fallback).
- **검증**: `pnpm --filter @openhow/cli test` 66 테스트 통과, `pnpm --filter @openhow/viewer build` 성공.

### 2026-04-17 iter2 — Phase 1 MVP 구현

- **수정 파일 (4개)**:
  - `core/packages/viewer/src/utils/markdown.ts` — containerTypes에 `related/integrate/contact` 추가, 헤더 아이콘 로직 확장
  - `core/packages/viewer/src/styles/markdown.css` — 3종 색상 토큰 + 상단 dashed border + 카드 padding
  - `core/packages/cli/src/ssg/renderMarkdown.ts` — SPA와 동일 로직
  - `core/packages/cli/src/ssg/ssgStyles.ts` — SPA CSS와 동일 스타일 (SSG 접두어 대응)
- **검증**: `openhow serve` 로컬 뷰어(3600 대역 포트)에서 샘플 마크다운 말미에 3종 블록 렌더, 구분선·아이콘·색상 확인

## Backlog

- [hypothesis] 자동 `## 함께 보면 좋은 글` 래퍼 + 단일 구분선 (여러 closing 블록 감지 후 한번만) — Phase 2
- [hypothesis] 블록 내부 스키마 강제 (링크 리스트만) — Phase 2
- [hypothesis] 에디터 슬래시 커맨드 통합 (Creator Platform) — 에디터 런칭 시점
- [hypothesis] 블록에 아이콘 커스터마이즈 (`::: related icon=book`) — 필요성 발견되면
- [hypothesis] CTA 블록 클릭률·전환 추적 — 분석 레이어 도입 시
- [hypothesis] 시리즈 네비게이션 블록(`::: series`) — 별도 intent
- [signal] 51편 마이그레이션 시 발견할 저자 패턴 다양성 — 치환 스크립트에서 수집

## Learnings

### 2026-04-17 iter1: seed
- 저자 마크다운 패턴이 H2-H3-H3 과분 위계 + blockquote 본문 충돌 + 링크 3종 혼재
- 플랫폼이 클로징 블록을 1급 UI로 지원해야 일관성 확보 가능

### 2026-04-17 iter3: related 카드 전환
- "글씨만 빽빽해서 피로"는 평범한 리스트 UI 의 구조적 한계. 같은 closing container 래퍼를 유지하되 본문만 카드 그리드로 바꿔 **정보 밀도 vs 시각 피로** 균형을 맞춤.
- 기존 `::: content-cards` extension 을 재활용하지 않고 `::: related` 본문 링크 리스트를 자동 승격하는 쪽을 선택한 이유:
  - 저자 문법을 안 건드려도 됨 (51편 bootpay 글 마이그레이션 부담 없음)
  - 작성자가 직접 설명을 적는 `— 설명` 이 카드 description 으로 그대로 매핑됨
- **letter fallback 이 "기본 이미지 5개 돌려쓰기" 보다 낫다**: 중복감 없음, 정보 전달 (PG/구독 같은 2글자가 주제 힌트), 에셋 관리 비용 0. Notion/Linear/네이버 카페 카테고리와 같은 패턴.
- 해시 기반 색상: `slug` 문자 코드 % 6 → 같은 글은 항상 같은 색 → 기억하기 쉬움. 의도성 있는 스타일로 읽힘.

### 2026-04-17 iter2: 기술 범위 확정 + 이름 충돌 해결
- **렌더러 오인 정정**: 기존 doc의 "Plate.js 기반" 은 오류. 실제는 **marked.js + custom extensions**. DocPage.tsx 는 `dangerouslySetInnerHTML` 로 HTML 문자열 주입.
- **이중 렌더러**: SPA(viewer) + SSG(cli) 각각 별도 파서/CSS. 네 개 파일 동시 유지 필요.
- **이름 충돌**: `::: cta` 는 이미 URL 필수 버튼 extension 으로 예약 → 새 문의 블록은 `::: contact` 로 네이밍 변경.
- **MVP 축소**: 자동 H2 래퍼/구분선 자동 생성은 Phase 2 로 빼고, 1차는 "3종 container + 아이콘 + 색상 + 상단 구분선" 만.
- **관련 intent 연결**:
  - `article-reading-ux.md` — 관련 글 추천(저자 기입 경로)의 1차 버전
  - `design-system-foundation.md` — 아이콘·색상 토큰 의존 (토큰 없으면 플랫폼 기본값)
  - `creator-platform.md` — 에디터 슬래시 커맨드 통합(Phase 2)
