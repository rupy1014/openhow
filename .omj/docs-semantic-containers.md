---
name: docs-semantic-containers
status: done
iteration: 3
domain: platform
stage: mvp
created: 2026-04-21
updated: 2026-04-21
---

# Intent: SDK 문서를 위한 의미적 마크다운 컨테이너 확장

## Why

openhow가 serve하는 외부 SDK 문서(현재 bootpay-contents 132개 MD)가 **시각적으로 표 도배**된다. 스캔 결과:

- 132개 중 77개(58%)가 `::: info/tip/warning` 박스 안에 일반 마크다운 테이블을 넣어 레이아웃 래퍼로 남용
- "내가 하는 것 / Bootpay가 알아서 하는 것" 2열 책임 분담 패턴이 **7개 파일에 동일 관용구로 반복**
- "순서 \| 발신 \| 수신 \| 내용" 시퀀스 흐름 테이블이 **13개 파일에 반복**
- reference 계열 파일은 100~230개 테이블이 수직 나열 — 파라미터/응답/에러코드/상태 테이블이 시각적으로 구분되지 않음

읽는 개발자 입장에서 "지금 보는 표가 책임 분담인지, 파라미터 스펙인지, 시퀀스 흐름인지" 한눈에 안 들어옴. 문서 품질이 openhow의 **판매 포인트(SDK 문서 호스팅)** 인데, 경쟁 SaaS(Mintlify/Stripe Docs) 대비 시각적 단조로움이 걸림돌.

## What

### (v1 iter 3) — 이번 빌드

iter 2가 `create.md` 1파일에만 적용된 상태로 마감됐는데, 사용자 피드백:
- `cancel-withdraw.md` 는 "API 엔드포인트 / **PUT** url / 인증: Basic Auth" 가 3줄로 흩어져 렌더됨 → `:::endpoint` 적용 누락
- "응답" 섹션의 `#### 성공 응답 + ```json` 구조는 탭 컴포넌트로 처리되어야 함 (ai-docs `ResponseExample.vue` 패턴)

**신규 마크다운 확장 1종** (SPA + SSG):

- **`:::response`** — 내부에 여러 `#### 라벨 + \`\`\`json` 쌍을 **탭 UI**로 변환
  - 문법:
    ```
    :::response
    #### 성공 응답
    ```json
    { "status": 1 }
    ```

    #### 404 응답
    ```json
    { "code": 404 }
    ```
    :::
    ```
  - 파싱: 내부 body를 `this.lexer.blockTokens()` 로 파싱 → heading(h1~h4) + 다음 code 토큰을 쌍으로 묶기. heading 없이 code만 있으면 "성공 응답" / "응답 N" 기본 라벨.
  - **렌더 DOM 재사용**: 기존 `md-code-group` 구조 그대로 + `md-code-group--response` variant modifier만 추가. 이 방식으로 `hydrateScript.ts` 의 `initCodeGroupDelegation` JS 핸들러 그대로 사용 (수정 불필요).
  - 1개 응답만 있어도 탭 1개로 렌더.

**`cancel-withdraw.md` 치환 4곳** (Claude 직접):
1. "## API 엔드포인트 \n\n **PUT** url \n\n 인증: Basic Auth" → `:::endpoint`
2. "## 요청 파라미터" + 테이블 → `:::parameters`
3. "## 응답" > "#### 성공 응답 + json" → `:::response`
4. "## 에러 코드" + 테이블 → `:::error-codes`

**문서화** — `core/CLAUDE.md`의 "API 문서용 확장" 섹션 말미에 `:::response` 하위 섹션 추가.

### (v1 iter 2) — 이번 빌드

참조: `/Users/taesupyoon/bootpay-commerce/multi-manager/projects/ai-docs/` (VitePress/Nuxt 기반, `ApiEndpoint.vue`, `Parameters.vue`, `ResponseFields.vue`, `ErrorCodes.vue` 등 의미적 컴포넌트 5종 확인 완료). openhow는 marked v11 기반이라 Vue 컴포넌트를 쓸 수 없으므로 **동일 UX를 marked extension으로 재현**한다.

**신규 마크다운 확장 4종** (SPA `markdown.ts` + SSG `ssgStyles.ts` 양쪽):

1. **`:::endpoint`** — HTTP 메서드 배지 + URL + (옵션) 인증 배지
   - 문법:
     ```
     :::endpoint
     method: GET
     url: https://api.bootapi.com/v1/orders/{order_number}
     auth: Basic Auth
     :::
     ```
   - 렌더: `[GET]` 컬러 배지(method별 색: GET=파랑, POST=초록, PUT=주황, PATCH=청록, DELETE=빨강) + URL 모노스페이스 + 복사 버튼 + 선택적 auth 회색 배지
2. **`:::parameters`** — 요청 파라미터 테이블을 감싸 타입/필수 배지 강조
   - 문법: `:::parameters\n| 파라미터 | 타입 | 필수 | 설명 |\n|---|---|---|---|\n| ... |\n:::`
   - 렌더: 내부 MD 테이블을 파싱하되, 타입 컬럼은 타입별 컬러 배지(String 회색, Integer 보라, Boolean 초록, Object 주황, Array 청록), 필수 컬럼은 Y→빨간 "필수" 배지 / N→회색 "선택" 배지. 파라미터명은 bold + monospace.
3. **`:::response-fields`** — 응답 필드 테이블을 감싸 ∟ 중첩 계층 시각화
   - 문법: `:::response-fields\n| 필드 | 타입 | 필수 | 설명 |\n...\n:::` (∟ 접두 유지)
   - 렌더: `:::parameters`와 같은 타입/필수 배지 + ∟로 시작하는 필드명은 들여쓰기(깊이별 padding-left) + 계층 가이드 라인
4. **`:::error-codes`** — 에러 코드 테이블을 감싸 코드 배지 + (옵션) JSON 예시 확장
   - 문법: `:::error-codes\n| 코드 | 메시지 | 대처 방법 |\n...\n:::`
   - 렌더: 첫 컬럼은 빨간 배지(code 스타일), 나머지 컬럼 읽기 용이하게. 클릭 확장(v3 이후 JSON 예시 토글은 우선 스킵, CSS only 정적 렌더).

**bootpay-contents 치환** (Claude 직접 편집 — iter 1 learning: writable-root 밖):
- `developer/commerce/checkout/create.md` 1건 우선 (검증 목표 페이지):
  - `#### 요청 파라미터` 테이블 → `:::parameters`
  - `**GET** URL` + `인증: Basic Auth` 2줄 → `:::endpoint`
  - `#### 주문 조회 응답` 뒤 필드 테이블 → `:::response-fields`
  - `## 에러 코드` 테이블 → `:::error-codes`

**문서화** — `core/CLAUDE.md`의 `## Responsibility Split` 섹션 아래에 4개 신규 확장 섹션 일괄 추가.

### (v1 iter 1) — 완료

- **신규 `:::responsibility` 마크다운 확장 추가** (SPA `markdown.ts` + SSG `ssgStyles.ts` 양쪽)
  - 문법: `:::responsibility\n## 내가 하는 것\n- ...\n## Bootpay가 알아서 하는 것\n- ...\n:::`
  - 렌더: 2-컬럼 CSS grid, 좌/우 아이콘(체크/자동화) + 헤더 색 구분, 모바일은 세로 스택
  - 다크모드 팔레트 포함 (기존 `alert`/`container` 컨벤션 따름)
- **bootpay-contents 7개 파일 치환** — 기존 `::: info 내가 하는 것 / Bootpay가 알아서 하는 것` + 2열 테이블을 `:::responsibility` 블록으로 교체
  - `developer/payments/guide/payment-flow.md`
  - `developer/payments/payment-widget/quickstart.md`
  - `developer/payments/reference/integration/checklist.md`
  - `developer/commerce/subscription/overview/overview.md`
  - `developer/commerce/orders/overview.md`
  - `developer/commerce/checkout/create.md`
  - `developer/commerce/checkout/quickstart.md`
- **canvas-sequence PoC 1건** — `developer/commerce/checkout/create.md`의 "연동 흐름" 9단계 테이블을 `:::canvas-sequence` JSON 블록으로 치환. 나머지 12개 파일은 같은 변환 규칙으로 후속 진행.
- **문서화** — `core/CLAUDE.md`의 "Canvas Chart (마크다운 확장)" 섹션 바로 아래에 `:::responsibility` 사용법/JSON 규칙 추가

### (v2) — 다음 반복

- `:::response-example` 확장 — 여러 JSON 응답(성공/에러) 탭 전환 UI (iter 2는 단일 JSON + 필드 테이블 묶음까지만)
- `:::error-codes` 클릭 확장 — 행 클릭 시 해당 에러의 JSON 응답 예시 토글 (iter 2는 CSS-only 정적 렌더)
- 나머지 12개 "순서\|발신\|수신\|내용" 테이블 → `:::canvas-sequence` 일괄 변환
- `:::parameters` / `:::response-fields` 자동 감지 — `| 파라미터 | 타입 | 필수 | 설명 |` 헤더 패턴을 바깥 wrapper 없이 감지해서 자동 스타일
- reference 계열 거대 테이블(230개) 가독성 개선 — 검색/접힘 UI
- bootpay-contents의 나머지 reference 파일(~40+) 에 iter 2 확장 전파

## Not (이번 범위 밖)

- 별도 `:::sequence` 마크다운 확장 신설 — **기존 `:::canvas-sequence`로 완전 대체**되므로 중복 불필요
- `:::responsibility`의 N-컬럼 확장 (3열 이상) — 현재 관용구는 2열만이고 YAGNI
- 77개 `info+table` 안티패턴 전체 일괄 리팩토링 — v1에서 7+1건만 잡히고 나머지는 변환 규칙이 정립된 뒤 점진 적용
- bootpay-contents 외 다른 워크스페이스(gpters 등) 동일 치환 — 다른 문서 코퍼스에 같은 관용구가 있는지 먼저 스캔 필요
- bootpay-contents의 MD 본문 재작성(문장 수정) — 이번엔 **컨테이너 치환만**, 콘텐츠 의미 변경 금지
- **iter 2**: `:::tip` / `:::warning` 강화 — openhow `alertExtension`/`containerExtension`이 이미 ai-docs `Admonition.vue`와 동등 기능
- **iter 2**: `<ApiEndpoint>` 등 HTML 태그 그대로 포팅 — openhow는 marked 기반, Vue SFC 아님. `:::xxx` fenced container 문법만 사용
- **iter 2**: `create.md` 외 다른 파일 치환 — iter 2는 검증 목표 페이지 1개만. 나머지는 v2 반복에서
- **iter 3**: `:::response` 의 prev sibling 자동 라벨링(ai-docs ResponseExample.vue 방식) — openhow는 MD 토큰 기반이라 bare code block 위 heading을 "자동으로 라벨화" 처리는 heuristic 실패 가능. 대신 **명시적 `#### 라벨` 을 inside `:::response`** 패턴으로 강제 (안전하고 예측 가능).
- **iter 3**: `cancel-withdraw.md` 외 유사 패턴 파일 일괄 치환 — iter 3 목적은 "`:::response` 확장이 실제로 동작한다"의 확인. 나머지는 iter 4+ 자동 마이그레이션 툴로 일괄 처리.
- **iter 3**: `:::response` 내부 code block이 json 외 yaml/xml인 경우 — 현재는 구분 없이 그대로 렌더. SDK 문서 특성상 JSON 위주이므로 색상 코딩은 불필요.

## Backlog

- SDK별 톤 프리셋(bootpay 노란색 / 가상의 다른 PG사 파란색) — brand token 체계 필요
- `:::responsibility`에 "Why this split?" 툴팁 — 책임 경계 설명 필요 시
- `::: info`/`::: tip`/`::: warning`의 `::: {variant} {title}` 라인 중 한글 타이틀 감지해서 책임분담 관용구로 **자동 마이그레이션 스크립트** — 7개 파일 수동 치환 후 검증

## Learnings

- **2026-04-21**: openhow 마크다운 확장은 이미 13종 존재(`alert/container/steps/code-group/content-cards/canvas-flow/canvas-sequence/canvas-state/youtube/video/copyEmbed/cta/figma/notion/details`). 새 확장 추가 전 반드시 기존 목록 스캔 필요 — 첫 계획에서 `:::sequence` 신설 제안했다가 `:::canvas-sequence` 중복 발견해 계획 수정.
- **2026-04-21**: SPA/SSG 이중 관리 주의 (`CLAUDE.md` 명시). `markdown.ts`에 extension 추가 시 `packages/cli/src/ssg/ssgStyles.ts`의 CSS 문자열 상수도 같은 값으로 맞춰야 페이지 전환 시 깜빡임 없음. px 단위까지 일치.
- **2026-04-21**: marked v11의 `unshift()` 동작 — 나중에 등록한 extension이 먼저 시도됨. `stepsExtension`/`youtubeExtension`보다 **뒤에** `responsibilityExtension` 등록해서 specific 매칭이 container generic 매칭보다 우선되게 해야 함.
- **2026-04-21**: `::: info 내가 하는 것 / Bootpay가 알아서 하는 것`는 이미 **7곳 완전 동일 관용구** — 템플릿화 정당성 충분. "N≥3이면 컴포넌트화" 임계값 넘김.
- **2026-04-21 [signal]**: Codex cowork-run.sh는 writable root 제약이 있어 `~/sideProjects/openhow/` 밖 경로(예: `~/sideProjects/youtube/channels/bootpay-contents/...`)에 대해 `PermissionError: Operation not permitted`로 거부한다. 크로스 워크스페이스 치환 작업은 Codex가 아닌 Claude 직접 Edit으로 수행해야 한다. Build 프로토콜의 "Fallback to Claude direct coding" 판단 조건에 **writable-root 밖 파일**을 추가 고려.
- **2026-04-21 [signal]**: `openhow serve`(CLI) 렌더는 `@openhow/cli`의 **빌드된** SSG를 사용. `markdown.ts` 확장 추가만으로는 serve 화면에 반영되지 않고 `pnpm --filter @openhow/cli build` 통과가 필요함. 현재 `core/packages/cli/src/commands/publish.ts:1203`의 `isPaidWorkspace` 미정의 타입 에러(이번 작업 전부터 존재, 다른 작업 브랜치 영향)로 CLI 빌드 실패 → 브라우저 검증 불가 상태. 사용자가 해당 타입 에러 해결 후 재빌드 필요.
- **2026-04-21 iter 2**: ai-docs(VitePress/Nuxt)는 `<Parameters>`, `<ResponseFields>`, `<ErrorCodes>` 처럼 **Vue 컴포넌트 슬롯에 MD 테이블 자동 파싱** 패턴을 쓴다. openhow는 marked v11이라 Vue가 없으므로 `:::parameters` fenced container 내부에 MD 테이블을 두고, 토크나이저에서 `this.lexer.blockTokens()` 로 하위 테이블 토큰 생성 → 렌더 시 `<table>` 그대로 출력 + CSS로 컬럼 배지 주입이 표준 경로. 불가피한 JS 후처리는 SPA hook 또는 CSS nth-child 셀렉터로 대체.
- **2026-04-21 iter 3**: 탭 UI가 필요한 새 확장은 `md-code-group` DOM 구조를 **재사용(variant modifier)** 하는 게 최단거리. `hydrateScript.ts` 의 `initCodeGroupDelegation` 는 `.md-code-group__tab` 셀렉터에 하드코딩이라 generic하게 고치는 것보다 래퍼 클래스를 `md-code-group md-code-group--response` 로 부여하는 쪽이 diff 최소. 탭 동작 로직 검증도 재활용 가능.
- **2026-04-21 iter 3 [signal]**: iter 2 완료 직후 사용자가 `cancel-withdraw.md` 페이지를 실제로 확인하고 "엔드포인트가 1 컴포넌트로 안 묶였다" 지적 → **iter 2가 `create.md` 1파일에만 치환한 게 스코프 실수**였음. 다음 반복부터는 "치환 범위"를 intent의 What 항목으로 명시적으로 정의하거나, 확장 추가와 전체 파일 전파를 별도 iter로 쪼갤 때 **전파가 빠졌다는 잔여 부채를 명시적으로 표기**해야 함 (사용자가 놓친 케이스를 발견해야 할 부담을 줄임).
- **2026-04-21 iter 3 polish [signal]**: 블로그 워크스페이스(`workspace-type: blog` → `body.blog-detail`)의 페이지-전역 규칙(`.doc-page.blog-detail .markdown-content table { margin: 2rem 0 }`, `.markdown-content :not(pre) > code { padding/bg/border-radius }`, `.markdown-content p { margin: 1.75rem 0 }`)이 API 확장 컴포넌트(`.md-error-codes table`, `.md-endpoint__url`, `.md-param`, `.md-error-code`, `.md-container-body p`) 를 **specificity로 덮는다** (0,3,1~0,3,2 vs 0,2,1~0,2,2). 대응: 컴포넌트 전용 typography/layout 속성에 `!important` 를 기본값으로 붙여 "컨테이너 안에선 페이지 규칙 무시" 시맨틱 보장. 새 API 확장을 추가할 때 baseline 으로 적용해야 함.
- **2026-04-21 iter 3 polish**: SPA 와 SSG 의 CSS 변수 정의가 갈라져 있었음 — SSG는 `--bg-elevated`, SPA는 `--surface-elevated`. API 확장 rule 이 `--bg-elevated` 를 쓰고 있었는데 SPA 에선 미정의라 wrap 배경이 투명으로 깨짐. 해결: SPA `main.css` Tier 3 블록에 `--bg-elevated: var(--surface-elevated)` 앨리어스 추가. 교훈: 양쪽에 같은 값(px 단위)뿐 아니라 **같은 변수 이름**도 필요. 새 var 를 한쪽에 정의할 땐 반대편에 미리 앨리어스.
- **2026-04-21 iter 3 polish [signal]**: 페이지 하단 "추천 콘텐츠 / 실제 연동할 때 / 도입 문의" 3개 closing 컨테이너가 **blog-detail 페이지에서 시각적으로 무겁고 도배된 느낌** 이라는 사용자 피드백. 원인은 두 층: (a) `.md-container--closing` 자체가 gradient + 두꺼운 dashed top + 5px left border + drop shadow 로 강조 callout 수준의 비중이었고, (b) `.doc-page.blog-detail .markdown-content .md-container:not(.md-container--untitled)` (0,3,2) 가 그 위에 gradient + border-left + shadow 를 한 번 더 얹었음. 해결: closing 컨테이너를 **hairline 분리선 + 작은 헤더 + 리스트/카드** 의 "조용한 다음 단계" 푸터로 재설계하고, blog-detail 광역 override 의 `:not()` 체인에 `md-container--closing` 도 추가. 교훈: 동일 마크다운 확장이어도 **역할(callout vs footer)** 이 다르면 base rule 에서 시각 비중을 분리해야 하고, blog-detail 광역 override 는 "새로 추가하는 footer 류 컴포넌트" 를 항상 예외 처리해야 함.

## Footprint

- **2026-04-21 iter 3 (done)** — `:::response` 탭 확장을 SPA/SSG 양쪽에 추가. DOM은 기존 `md-code-group` 재사용 + `md-code-group--response` variant modifier. `hydrateScript.ts` 의 탭 전환 JS는 수정 없이 재활용. `cancel-withdraw.md` 의 4곳을 신규 확장으로 치환. `core/CLAUDE.md` 의 "API 문서용 확장" 섹션 말미에 `:::response` 하위 섹션 추가.
  - core 변경(Codex Step 1): `packages/viewer/src/utils/markdown.ts` (+90: `parseResponseItems` + `responseExtension`), `packages/viewer/src/styles/markdown.css` (+25: variant), `packages/cli/src/ssg/ssgStyles.ts` (+25: variant)
  - bootpay-contents 변경(Claude 직접): `developer/commerce/orders/cancel-withdraw.md` 1파일 4곳 — `## API 엔드포인트` → `:::endpoint`, 요청 파라미터 → `:::parameters`, 성공 응답 → `:::response`, 에러 코드 → `:::error-codes`
  - docs: `core/CLAUDE.md` "## API 문서용 확장" 섹션에 `### :::response` 하위 섹션 +39줄 추가
  - 검증 status: `viewer build ✓ (2.54s)` / `cli build ✗ (iter 1~2와 동일한 기존 타입 에러 `publish.ts:1203 isPaidWorkspace`, 이번 작업과 무관)` / `hydrateScript.ts` 미수정 — 탭 전환 JS는 기존 코드-그룹 핸들러가 `md-code-group md-code-group--response` 에도 그대로 동작.
  - 잔여 부채: iter 1~3 확장 4+1종이 `create.md` + `cancel-withdraw.md` 2파일에만 적용됨. bootpay-contents 나머지 API reference 파일(~40+) 에 동일 확장을 전파하는 작업은 v2 반복 (자동 마이그레이션 스크립트 병행 검토).

- **2026-04-21 iter 2 (done)** — API 문서용 4개 확장(`:::endpoint`, `:::parameters`, `:::response-fields`, `:::error-codes`) 을 SPA/SSG 양쪽에 추가. `checkout/create.md`의 4곳을 신규 확장으로 치환. `core/CLAUDE.md`에 "API 문서용 확장" 섹션 추가.
  - core 변경(Codex Step 1): `packages/viewer/src/utils/markdown.ts` (+263), `packages/viewer/src/styles/markdown.css` (+234), `packages/cli/src/ssg/ssgStyles.ts` (+234). `data-depth` 는 DOMPurify `ALLOWED_ATTR` 에 자동 편입됨.
  - bootpay-contents 변경(Claude 직접): `checkout/create.md` 1파일 4곳 치환 (요청 파라미터 → `:::parameters`, GET URL+Basic Auth → `:::endpoint`, 주문 조회 응답 → `:::response-fields`, 에러 코드 → `:::error-codes`).
  - docs: `core/CLAUDE.md` 에 "## API 문서용 확장 (endpoint / parameters / response-fields / error-codes)" 섹션 +84줄 추가.
  - 검증 status: `viewer build ✓ (tsc -b + vite build, 2.43s)` / `cli build ✗ (iter 1부터 이어지는 기존 타입 에러 `publish.ts:1203 isPaidWorkspace`, 이번 작업과 무관)` / `localhost:3501 렌더 확인은 CLI 빌드 복구 후 가능`. 그 외 MUST NOT 위반 없음(extension 등록 순서 유지, responsibility 로직 변경 없음, 새 파일 생성 없음).

- **2026-04-21 iter 1 (done)** — `:::responsibility` 확장을 SPA/SSG 양쪽에 추가하고, bootpay-contents 7개 MD 파일의 "내가/Bootpay" info+table 블록을 치환. `checkout/create.md`의 "연동 흐름" 9단계 테이블을 기존 `:::canvas-sequence`로 PoC 변환. `core/CLAUDE.md`에 `## Responsibility Split (마크다운 확장)` 섹션 추가.
  - core 변경(Codex Step 1): `packages/viewer/src/utils/markdown.ts` (+133), `packages/viewer/src/styles/markdown.css` (+127), `packages/cli/src/ssg/ssgStyles.ts` (+109)
  - bootpay-contents 변경(Claude 직접): 7개 MD 파일 치환 + create.md의 canvas-sequence PoC = 8개 파일
  - docs: `core/CLAUDE.md`에 섹션 추가
  - 검증 status: `viewer build ✓` / `cli build ✗ (기존 타입 에러 — 이번 작업과 무관)` / `localhost:3501 렌더 확인은 CLI 빌드 복구 후 가능`

## Context

- **프로젝트 스코프**: openhow/viewer (SPA) + openhow/cli (SSG) — 단일 프로젝트. `.omj/` 루트 배치.
- **관련 파일**:
  - `core/packages/viewer/src/utils/markdown.ts` (extension 추가 지점)
  - `core/packages/viewer/src/styles/markdown.css` (SPA CSS)
  - `core/packages/cli/src/ssg/ssgStyles.ts` (SSG CSS 상수)
  - `core/CLAUDE.md` (Canvas Chart 섹션 뒤에 문서 추가)
- **렌더 경로 확인**: `localhost:3501`은 openhow CLI가 `bootpay-contents/developer/commerce` 디렉토리를 serve 중 (`openhow serve ... --port 3501`). 변경 후 viewer + SSG 양쪽에서 동일하게 렌더되는지 확인.
- **검증 URL**: `http://localhost:3501/checkout/create` (v1 PoC 목표 페이지)
- **canvas-sequence 기존 스키마**: `canvasChart.ts`의 `SequenceConfig { participants: {id, label}[], messages: {from, to, label, type?: 'solid'|'dashed', note?}[] }`. 기존 9단계 테이블의 "발신/수신/내용" → `from/to/label`로 1:1 매핑 가능.
- **이전 대화 맥락**: 사용자가 처음엔 "신규 컨테이너 2종(responsibility + sequence)" 제안에 OK 했으나, "기존 canvas-sequence 같은 컴포넌트가 있을 수 있다" 지적 → 재스캔 결과 실제로 존재해서 1종(responsibility)만 신설로 축소.
- **iter 2 참조 프로젝트**: `/Users/taesupyoon/bootpay-commerce/multi-manager/projects/ai-docs/` — Nuxt Content v3 + VitePress 테마. 커스텀 컴포넌트 5종 확인: `ApiEndpoint.vue`, `Parameters.vue`, `ResponseFields.vue`, `ResponseExample.vue`, `ErrorCodes.vue`. 검증된 UX를 marked 확장으로 포팅.
- **iter 2 치환 타겟**: `checkout/create.md` 에서 확인된 4곳:
  1. `#### 요청 파라미터` 바로 뒤 테이블 (라인 ~231)
  2. `### 서버 검증` 안의 `**GET** https://api.bootapi.com/v1/orders/{order_number}` + `인증: Basic Auth` 2줄 (라인 ~267)
  3. `## 응답` > `#### 주문 조회 응답` 뒤 JSON + 필드 테이블 (라인 ~515)
  4. `## 에러 코드` 뒤 테이블 (라인 ~564)

## Storyboard (UI)

### `:::responsibility` 블록 렌더 예시

```
┌─────────────────────────────────┬─────────────────────────────────┐
│  ✓ 내가 하는 것                 │  ⚙ Bootpay가 알아서 하는 것     │
│  (좌측: 주 색상 — 사용자 책임)  │  (우측: 보조 색상 — 자동화 영역) │
├─────────────────────────────────┼─────────────────────────────────┤
│  · 상품 등록 (관리자 또는 API)  │  · 주문서 UI 호스팅, 결제 처리  │
│  · 서버에서 주문 완료 후 검증   │  · 주문 생성·저장, 고객 데이터  │
│  · 웹훅으로 주문 상태 동기화    │  · 웹훅 알림, 취소/환불 처리    │
└─────────────────────────────────┴─────────────────────────────────┘
```

- 모바일 < 640px: 세로 스택 (헤더 → 좌측 리스트 → 헤더 → 우측 리스트)
- 다크모드: 헤더 색상 dim, 테두리 색 유지
- 빌더 관점: 기존 `::: info {title}\n| a | b |\n|---|---|\n| ... |` 6줄이 `:::responsibility\n## 내가 하는 것\n- ...\n## Bootpay가 알아서 하는 것\n- ...\n:::` 로 줄어듦 — 타이핑 줄고 의미 명확

### canvas-sequence 치환 예시 (checkout/create.md)

현재:
```
| 순서 | 발신 | 수신 | 내용 |
| ①   | 관리자 | BOOTPAY | 상품 등록 / product_id 발급 |
| ②   | 백엔드 | 백엔드 | 주문 초안 생성 / 할인 반영 |
...
```

변환 후:
```
:::canvas-sequence
{
  "participants": [
    { "id": "admin", "label": "관리자" },
    { "id": "fe", "label": "프론트엔드" },
    { "id": "be", "label": "백엔드" },
    { "id": "bp", "label": "BOOTPAY" },
    { "id": "user", "label": "고객" }
  ],
  "messages": [
    { "from": "admin", "to": "bp", "label": "상품 등록 / product_id 발급", "type": "solid" },
    { "from": "be", "to": "be", "label": "주문 초안 생성", "type": "solid" },
    ...
  ]
}
:::
```

### iter 2 Storyboard — 4개 신규 블록 렌더 예시

**`:::endpoint`**:
```
┌────────────────────────────────────────────────────────────────────┐
│ [GET] https://api.bootapi.com/v1/orders/{order_number}  [📋] [🔒 Basic Auth] │
└────────────────────────────────────────────────────────────────────┘
```
- method 배지 색: GET=blue-600, POST=green-600, PUT=orange-500, PATCH=teal-500, DELETE=red-600 (dark mode는 -400 톤)
- URL: monospace, truncate 없이 wrap, hover 시 복사 버튼 표시
- auth 배지: 우측 작은 회색 pill, 옵션

**`:::parameters`**:
```
┌────────────────────────────────────────────────────────────────────┐
│ 파라미터           │ 타입      │ 필수 │ 설명                          │
├────────────────────┼───────────┼──────┼──────────────────────────────┤
│ client_key         │ [String]  │ [필수]│ Commerce 클라이언트 키         │
│ price              │ [Integer] │ [필수]│ 서버에서 계산한 결제 금액      │
│ user.phone         │ [String]  │ [선택]│ 구매자 전화번호                │
└────────────────────┴───────────┴──────┴──────────────────────────────┘
```
- 타입 배지: String=slate, Integer=purple, Boolean=emerald, Object=amber, Array=cyan
- 필수 배지: Y → red-500 "필수", N → slate-400 "선택"
- 파라미터명: `<code>` bold monospace (다크모드 dim)

**`:::response-fields`** (∟ 중첩):
```
│ order_id                      │ [String]  │ [필수] │ Commerce 주문 ID         │
│ result_data                   │ [Object]  │ [선택] │ 결제 결과 상세          │
│ └─ receipt_id                 │ [String]  │ [필수] │ Bootpay 영수증 ID       │
│ └─ card_data                  │ [Object]  │ [선택] │ 카드 결제 시 카드 정보  │
│      └─ card_company          │ [String]  │ [필수] │ 카드사                   │
```
- ∟ 접두로 시작하는 행은 depth에 비례해 `padding-left` (0/1.5rem/3rem)
- depth별 가이드 선(왼쪽 border-left, slate-200/dark:slate-700)

**`:::error-codes`**:
```
│ [ORDER_PRICE_NOT_MATCH]      │ 요청 금액과 결제 금액 불일치 │ price 계산 확인      │
│ [ORDER_PRODUCT_NOT_FOUND]    │ 상품 정보 없음             │ product_id 확인      │
```
- 첫 컬럼: red-50 배경 + red-700 글씨의 code 배지 (다크모드: red-950/red-300)
- 나머지 컬럼: 일반 텍스트

모든 블록 공통:
- 다크모드 대응 (기존 `md-*` 컨벤션)
- 모바일 < 640px: `:::parameters` / `:::response-fields` / `:::error-codes` 는 테이블을 stacked card로 전환(기존 markdown.css 테이블 반응형 전략 따라감)
- `:::endpoint` 는 모바일에서 method 배지 한 줄 → URL 한 줄 → auth 한 줄 세로 스택

## Implementation Notes

1. **Extension 추가 순서** — `markdown.ts`의 extension 등록 배열에 `responsibilityExtension`을 `containerExtension`보다 뒤, `stepsExtension`과 같은 위치권(구체 매처)에 추가.
2. **CSS 클래스 네이밍** — 기존 `md-steps`, `md-canvas-chart` 컨벤션 따라 `md-responsibility`, `md-responsibility__col`, `md-responsibility__header`, `md-responsibility__list`.
3. **파서 방침** — 내부 `## 내가 하는 것` / `## Bootpay가 알아서 하는 것` 헤더를 탐지해서 좌/우 컬럼으로 분배. 헤더 텍스트는 **자유 입력** (다른 PG사 문서에서도 재사용 위해 "가맹점 / 플랫폼" 같은 변형 허용). 헤더가 정확히 2개일 때만 매칭, 아니면 fallback으로 `containerExtension`이 처리하도록 return undefined.
4. **SSG 동기화** — `ssgStyles.ts`의 `SSG_CSS` 상수에 `.ssg-responsibility` 접두 버전 추가. 같은 grid 설정, 같은 색상값, 픽셀 일치.
5. **DOMPurify allowlist** — `data-` 속성 불필요 (순수 HTML 구조). 기존 sanitize 설정 그대로.
6. **bootpay-contents 치환 스크립트** — 7개 파일은 완전 동일 관용구이므로 정규식 치환 가능하나, 각 파일마다 불릿 내용이 다르므로 수동 변환 권장(검증 용이). canvas-sequence PoC도 1건만이니 수동.
7. **검증 체크리스트**:
   - `localhost:3501/checkout/create` 에서 `:::responsibility` 렌더 확인
   - 동일 페이지에서 `:::canvas-sequence` 연동 흐름 렌더 확인
   - 다크모드 토글 시 양쪽 모두 정상
   - 모바일 너비(<640px)에서 세로 스택 확인
   - SSG 빌드(`openhow publish` dry-run 또는 `pnpm --filter @openhow/cli build`)에서 SSG CSS도 같은 스타일 적용 확인

### iter 2 Implementation Notes

8. **등록 순서(iter 2)** — 4개 신규 extension(`endpointExtension` → `parametersExtension` → `responseFieldsExtension` → `errorCodesExtension`) 를 `responsibilityExtension` **바로 뒤**에 추가. container(generic) 매처보다 specific. marked `unshift()` 특성상 가장 뒤에 추가된 게 먼저 매칭 시도.
9. **파서 방침(endpoint)** — `:::endpoint` 내부는 YAML 유사 key:value 라인 파싱:
   - 필수: `method:` (GET/POST/PUT/PATCH/DELETE 화이트리스트 매칭, 모르면 fallback undefined)
   - 필수: `url:` (임의 문자열, path 파라미터 `{xxx}` 포함 허용)
   - 옵션: `auth:` (임의 문자열, 미지정 시 렌더 생략)
   - 방어: method/url 둘 다 있어야 매칭, 아니면 return undefined → container fallback
10. **파서 방침(parameters / response-fields / error-codes)** — 공통 패턴:
    - 내부 body를 `this.lexer.blockTokens(body, token.tokens)`로 파싱
    - 렌더 시 `this.parser.parse(token.tokens)`로 기존 테이블 HTML 생성
    - 결과를 `<div class="md-parameters">...</div>` 로 감싸기
    - 배지는 **순수 CSS** (`td:nth-child(n)` + `attr()` 트릭 필요 없음, 단순 자식 매칭으로 스타일)
    - **필수 제약**: body에 정확히 1개의 MD 테이블이 있어야 함. 없거나 2개 이상이면 fallback.
11. **CSS 클래스 네이밍** — `md-endpoint` / `md-endpoint__method` / `md-endpoint__url` / `md-endpoint__auth` / `md-endpoint__copy`, `md-parameters`, `md-response-fields` (∟ 행은 `.md-response-fields tr[data-depth="1"]` 대신 **렌더 시 첫 셀 텍스트가 `∟`로 시작하는지 감지해 `data-nested="true"` 주입** 또는 CSS selector로 처리), `md-error-codes`.
12. **타입 배지 매핑** — 테이블 `<td>` 값 기준 간단 매핑:
    ```
    [data-type-badge="String"]  { bg: slate-100 }
    [data-type-badge="Integer"] { bg: purple-100 }
    ...
    ```
    단순화를 위해 **타입 배지는 CSS-only 처리**. td 텍스트에 `data-type-badge` 속성 주입이 번거로우면 ** rendering 단계에서 td innerHTML을 `<span class="md-type md-type--{type}">{type}</span>`로 직접 래핑**.
13. **∟ 중첩 처리** — `response-fields` 렌더러에서 `<tr>`의 첫 `<td>` innerText가 `∟ ` 로 시작하면 `<tr class="md-response-fields__nested" data-depth="1">`. `∟∟ ` 는 depth=2. CSS에서 `data-depth` attribute selector로 padding-left 설정.
14. **SSG 동기화** — `ssgStyles.ts` 의 `SSG_CSS` 문자열에 4개 섹션 CSS 동일하게 추가. iter 1과 같은 px 단위 일치 원칙.
15. **DOMPurify allowlist(iter 2)** — `data-depth`, `data-type-badge`, `data-required` 속성 추가 필요할 수 있음. `markdown.ts` 의 DOMPurify config 확인해 `ALLOWED_ATTR` 확장.
16. **bootpay-contents 치환 방법** — writable-root 밖이므로 Claude 직접 Edit. `create.md` 4곳 하나씩 변환, 각 치환마다 diff 확인.
17. **iter 2 검증 체크리스트**:
    - `localhost:3501/checkout/create` 에서 4개 블록 모두 렌더(iter 1 blocker 유효 시 viewer dev 서버로 대체)
    - 다크모드 토글 시 타입/필수 배지 색 contrast 유지
    - 모바일 너비에서 endpoint 세로 스택, 테이블 반응형 전환
    - `pnpm --filter @openhow/viewer build` 통과 (typecheck 포함)
