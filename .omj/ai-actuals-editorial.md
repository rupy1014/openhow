---
status: seed
created: 2026-04-17
updated: 2026-04-17
iteration: 1
---

# ai-actuals-editorial — AI 신기능 follow-along 편집 규격

## Why

유튜브/공식 블로그는 "이게 뭐다"를 빠르게 전달하는 데는 적합하지만, 독자가 **그대로 따라해서 자기 일에 써먹기엔 부족**하다. 속도는 빠른데 재현성·맥락·"내일 써먹을 시나리오"가 누락된다.

openhow는 `creator-platform`(정체성·구독), `gpters-seo-flywheel`(contentType 4종·CTA), `public-blog-home`(큐레이션)까지 **인프라는 깔아놨다.** 다만 `contentType: tutorial`은 라벨일 뿐, **"AI 신기능을 어떻게 쪼개서 따라할 수 있게 만드는가"의 편집 규격이 비어 있다.**

> **2026-04-30 정합성 신호**: 부모 인프라 의도 (`creator-platform` / `gpters-seo-flywheel` / `public-blog-home`) 위에서 정체성-레벨 결정 2건이 동시에 exploring 중 — `creator-platform-discovery` (지식플랫폼 = 클래스 + 학생-as-author) 와 `editorial-traffic-engine` (에디터 큐레이션 트래픽 엔진). 본 의도는 "사람이 쓰는 follow-along 편집 규격" 으로 **두 정체성 어느 쪽이 채택되어도 재사용 가능** (강사 자율 발행 글의 규격 OR 에디터 큐레이션 글의 규격). dogfood 단계에선 후속 결정 영향 없음, 정식 스키마화 시점엔 두 의도 결과 반영 필요.

이번 의도는 그 공백을 **편집 가이드 + 템플릿 문서 1개**로 먼저 채운다. 스키마·UI·파이프라인 같은 인프라는 건드리지 않고, 본인 워크스페이스에서 2~3편 dogfood해서 규격이 쓸 만한지 먼저 검증한다. 검증되면 후속 의도로 정식 스키마화·자동화로 승격.

## What

- [validated] **follow-along 아티클 템플릿 정의** — 고정 섹션 순서로 `TL;DR → 30초 데모 → 사전조건 → 그대로 따라하기(복붙 가능한 명령/입력/출력) → 써먹을 시나리오 3 → 한계·대안 → 소스` → **metric**: 템플릿이 마크다운 파일 1개로 `docs/editorial/ai-actuals-template.md`에 존재하고, 각 섹션에 작성 지침(1~2줄)이 포함됨 ✓ (W2·W3·W4 규격도 이 템플릿에 함께 명시됨 — 남은 검증은 dogfood)
- [hypothesis] **재현성 필드 규격** — frontmatter or 본문 상단에 **`verifiedAt`(날짜) / `envVersion`(도구·모델 버전) / `runtimeSec`(대략 소요시간) / `failureModes[]`(걸리는 지점)** 을 자유 필드로 기록. 스키마 변경은 안 하지만 작성자는 반드시 채움 → **metric**: 템플릿에 이 4개 필드가 예시와 함께 명시되고, dogfood 아티클 3편이 전부 채움
- [hypothesis] **성숙도 스테이지 라벨 3종** — `shipping-soon`(릴리즈 직후·변화 잦음) / `stabilizing`(72시간~2주·주요 버그 안정화) / `decided`(써먹을 결론 도달) 을 본문 상단 배지로 표시. "살짝 느리게"의 기준을 명시 → **metric**: 템플릿에 정의+언제 승격하는지 규칙 기록, dogfood 아티클에 스테이지 배지 표시
- [hypothesis] **인레이크 소스맵 체크리스트** — 글 쓰기 전 확인할 소스 규격: 공식 릴리즈노트 / 공식 블로그·문서 / 관련 유튜브 1~2 / 커뮤니티 이슈(깃허브/레딧/x) / 실제 실행 로그. 자동화 아님, **체크리스트 1장** → **metric**: 체크리스트가 템플릿 부록에 포함되고, dogfood 3편의 `소스` 섹션이 이 구조를 따름
- [hypothesis] **dogfood 파일럿 2~3편** — 본인 워크스페이스에서 최근 AI 출시 기능으로 템플릿 적용 아티클 발행. 규격이 실제로 글 쓰기 쉽게 만드는지 검증 → **metric**: 3편 발행(`contentType: tutorial`, 성숙도 라벨 부착), 본인이 "다음 글도 이 틀로 쓸 만하다" 판정

## Not

- **document 스키마 변경** (`maturity`, `verifiedAt` 정식 필드화, UI 입력 등) — dogfood로 규격 굳은 뒤 **별도 의도**로 승격
- **인레이크 자동화 파이프라인** (MCP·omx `$ingest`·소스→드래프트 자동생성) — 책(`book-curriculum-revamp`)의 omx 영역과 겹침. 이번은 사람이 쓰는 기준만
- **참여·소통 구조 (기수제/게시판/챌린지형)** — 접근성 이슈로 기본 아키텍처 아님. 편집 규격 검증 후 별도 의도 후보 (→ Backlog)
- **타 creator 온보딩 가이드** — dogfood 먼저. 본인 기준선이 서야 남에게 적용 가능
- **카테고리/시리즈 구조 설계** — tutorial 단건 편집만. 시리즈 연결·내부 링킹 전략은 후속

## Context

### 인접 의도 — 이 레이어가 앉는 자리

| 의도 | 축 | 상태 |
|------|-----|------|
| `creator-platform` | 정체성·구독·이메일 | done |
| `gpters-seo-flywheel` | contentType (article/tutorial/case/faq) + CTA | done |
| `public-blog-home` | 플랫폼 홈 발견·큐레이션 | building |
| `core/workspace-seo-v1` | 워크스페이스 SEO 플러밍 | building |
| **`ai-actuals-editorial`** | **tutorial 콘텐츠의 편집 규격 (이번 의도)** | seed |

이 의도는 위 네 인프라 **위에 얹는 콘텐츠 스펙**이다. `contentType: tutorial` 라벨을 구체적 편집 규격으로 채우는 레이어.

### 핵심 원칙

- **상시가 기본, 타이밍은 옵트인**: 콘텐츠는 언제든 진입 가능한 아카이브. 기수·챌린지형은 이번에 넣지 않음 (접근성 우선, 유튜브 극복이 목적인데 유튜브보다 접근성 나쁘면 안 됨)
- **"살짝 느리게"는 의도된 속도**: shipping-soon 단계는 일부러 피하고, stabilizing/decided 단계에서 집필. 속도로 유튜브와 경쟁하지 않음
- **재현성이 차별점**: 유튜브 대비 openhow가 줄 수 있는 건 "직접 돌려본 로그". 이걸 규격으로 담지 않으면 차별 소실

### 결정 기록 (2026-04-17)

- **기수제 vs 게시판 vs 상시**: 사용자 본인이 "접근성이 떨어진다"고 우려 표명 → 기수·게시판 기본 아키텍처 제외. openhow의 SEO·구독 축과 충돌하기도 함
- **접근 A 선택**: 스키마 변경 없이 편집 가이드 + 템플릿만. B(메타 필드 추가)·C(인레이크 자동화)는 dogfood 검증 후로 연기

## Footprint

### 2026-04-17: 편집 템플릿 v1 (dogfood용)

- `docs/editorial/ai-actuals-template.md` — follow-along 아티클 템플릿
  - 인레이크 소스맵 체크리스트 (W4)
  - frontmatter 재현성 4필드 규격: `verifiedAt` / `envVersion` / `runtimeSec` / `failureModes[]` (W2)
  - 성숙도 라벨 3종 + 승격 규칙: `shipping-soon` / `stabilizing` / `decided` (W3)
  - 본문 7개 고정 섹션 + 섹션별 작성 지침
  - 발행 전 셀프 체크 + bare skeleton 복붙본

### 2026-04-17: 에디터 자동 적용 (접근 A — 스키마 변경 ✕)

글 쓰기 시작 시 템플릿이 체감되도록 에디터에 contentType 선택 + 스켈레톤 자동 삽입.

- `core/packages/viewer/src/lib/document-templates.ts` — `getDocumentTemplate(contentType, title)` 순수 클라이언트 함수. tutorial만 템플릿 제공, 나머지는 빈 문자열. 템플릿은 원본(`docs/editorial/ai-actuals-template.md`) 의 **bare skeleton** 버전 (발행 전 셀프체크는 HTML 주석으로 숨김)
- `core/packages/viewer/src/pages/admin/EditorPage.tsx` — Content type 드롭다운(아티클/튜토리얼/사례/FAQ) 추가. 새 문서 + contentType=tutorial + 에디터 비어있음(또는 이전 템플릿 그대로) 조건에서 자동 주입. PlateEditor 는 remountKey 로 재마운트. 새 문서 POST + 수정 PUT 모두 contentType 동봉
- **스키마 변경 없음** — frontmatter 재현성 필드(verifiedAt / envVersion / runtimeSec / failureModes)와 성숙도 라벨은 전부 마크다운 본문으로만 존재. document 테이블은 건드리지 않음 (Not 준수)

## Backlog

- [ ] **정식 스키마화** (`document.maturity`, `verifiedAt` 필드, UI 입력) — dogfood 3편 검증 후 의도 분리
- [ ] **인레이크 자동화** (MCP/omx `$ingest` — 소스 URL → 드래프트 자동생성) — 책의 omx와 정합성 맞춘 뒤
- [ ] **챌린지형 옵트인 오버레이** — 특정 기간 "같이 써보기" 스레드를 상시 아티클 위에 얹는 경량 구조 (기수제 아님). 편집 규격 검증 후 별도 의도 후보
- [ ] **시리즈·내부 링킹 전략** — tutorial 간 연결, "이 기능으로 풀 수 있는 문제" 크로스링크
- [ ] **타 creator 적용 가이드** — 본인 검증 후 템플릿·체크리스트를 creator 온보딩에 연결

## Learnings

### 2026-04-17: seed 생성 (iteration 1)

- **배경**: AI 뉴스 속도가 너무 빨라 따라가기 바쁨. 유튜브는 "이게 뭐다" 수준이지 따라하기엔 부적합. 이 공백을 openhow가 채우려는 동기
- **프로젝트 상태 분석**: creator-platform(done), gpters-seo-flywheel(done, contentType 4종+CTA), public-blog-home(building), workspace-seo-v1(building) — **인프라는 깔렸고 "편집 규격"만 비었음**
- **4대 공백 식별**:
  1. tutorial 타입은 라벨만, 고정 섹션 템플릿 없음
  2. "직접 돌려봄" 재현성 메타가 자유 서술로 흩어짐
  3. 릴리즈 → 아티클 인레이크 흐름 없음 (omx `$news`는 책에만 있고 openhow 자체 없음)
  4. "살짝 느리게"의 기준(성숙도 스테이지)이 없음
- **접근 A 선택**: 스키마 변경 ✕ / 문서 기준선만. dogfood 2~3편으로 검증 후 후속 의도로 스키마화·자동화 승격
- **기수제 vs 게시판 vs 상시 결정**: 사용자 본인이 "접근성이 떨어진다" 우려. 기수는 SEO·구독 축과 충돌, 게시판은 creator 공간과 기능 중복. **상시가 기본, 챌린지형은 옵트인 오버레이로 Backlog** 결정

### 2026-04-17: 템플릿 v1 작성 (dogfood용)

- **결과**: W1 validated — `docs/editorial/ai-actuals-template.md` 생성. W2·W3·W4 규격도 한 템플릿 안에 통합 수록 (분리 운영 시 오버헤드 대비 정합성 이득 큼)
- **통합 결정 근거**: "작성자가 글 쓸 때 한 곳에서 다 본다" 원칙. 재현성 필드·성숙도 라벨·인레이크 체크리스트가 흩어져 있으면 dogfood 단계에서 놓치기 쉬움
- **다음 검증**: W2·W3·W4는 dogfood 아티클이 실제로 규격을 따를 때만 [validated] 승격. 템플릿에 정의만 있다고 검증 완료 아님

### 2026-04-17: 에디터 자동 적용 — 접근 A 유지, B는 Not 그대로

- **요청**: "이 템플릿 기준으로 글 쓸 때 적용되게 기능개선"
- **범위 판단**: 스키마 승격(B)은 원래 Not에 명시되어 있어 일부러 회피. 대신 A의 "문서 기준선" 위에 **클라이언트 전용 스켈레톤 삽입**으로 체감은 동일하게 제공
- **구현 선택**:
  - 템플릿은 viewer 내 순수 함수(`document-templates.ts`)에서 문자열 리턴 — 워커 왕복 없음, DB 컬럼 없음
  - 재현성 4필드·성숙도 라벨은 frontmatter/본문으로만 존재. 정식 필드화는 dogfood 검증 후로 유지
  - PlateEditor 재주입은 `key` remount 로. `usePlateEditor` 가 `value` 를 초기 마운트에만 읽는 구조라 상태만 갱신으론 반영 안 됨
  - 사용자 타이핑 보호: ref 로 "어떤 타입에 대해 주입했는가" 기록, 에디터가 비어있거나 이전 주입 템플릿 그대로일 때만 재주입
- **의도 무결성**: Not("document 스키마 변경 / 전용 UI")는 그대로. contentType 자체는 `gpters-seo-flywheel` 에서 이미 존재하는 컬럼이라 새 스키마 아님
