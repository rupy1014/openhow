---
status: done
created: 2026-04-29
updated: 2026-04-29
iteration: 1
domain: docs
stage: done
---

# markdown-directive-nesting — `:::` 컨테이너 nesting 지원

## Why

저자가 `:::steps` 안에서 `:::code-group` 을 쓰거나 `:::figure-side` 안에서 `:::canvas-flow` 를 쓰고 싶어한다. 현재는 외곽 directive 의 regex 가 `[\s\S]*?...:::` non-greedy 라 **내부 directive 의 첫 `:::` 에서 외곽이 닫혀 버림**.

실측 사례 (`youtube/channels/bootpay-contents/developer/payments/recipes/billing.md`):
```markdown
::: steps
1. ...
:::                       ← 저자가 abrupt 종료 의도 없는데 강제로 닫음

::: code-group            ← 별도 블록으로 분리해야만 동작
```ts
```
:::
```

저자는 "왜 한 줄을 비워야만 인식되지?" 라며 버그로 인지. 이게 "이게 맞나?" 질문의 답 — **버그 맞음, fence 가변화로 해결**.

## What (iter 1)

- [v1] **`(:{3,})` + `\1` 백참조 패턴 일괄 적용** — 모든 directive extension 의 fence regex 를 `^:::` non-greedy 에서 `^(:{3,})` 같은 길이 백참조로 교체. `renderMarkdown.ts` + `markdown.ts` 두 파일. `whenExtension` 이 이미 이 패턴이라 reference. → **metric: `::::steps\n:::code-group\n...\n:::\n::::` 가 외곽 steps + 내부 code-group 둘 다 정상 매칭, 기존 `:::name\n...\n:::` 도 그대로 동작 (non-regression)**
- [v1] **기존 테스트 회귀 통과** — `markdown.test.ts` + `renderMarkdown.test.ts` 모든 케이스가 fence 패턴 변경 후에도 그대로 통과. → **metric: `pnpm --filter @openhow/viewer test` + `pnpm --filter @openhow/cli test` 양쪽 0 failure**
- [v1] **nesting smoke test 신규 추가** — 양쪽 test 파일에 `::::steps` + 내부 `:::code-group` (탭 2개) 케이스. depth 2 nesting 정상 파싱 확인. → **metric: 신규 테스트 양쪽 1개씩 pass**

## Not

- 임의 깊이 nesting 자동 fence 길이 추론 (저자가 `:::` / `::::` / `:::::` 직접 선택 — VitePress 표준)
- legacy `:::` 외곽 → `::::` 자동 마이그레이션 (불필요 — 호환 유지)
- 새 directive 종류 추가
- markdown.ts / renderMarkdown.ts 외 파일 변경 (hydrateScript / DOMPurify allowlist 등은 파싱 결과만 소비하므로 무관)
- docs 사이트 업데이트 (별도 intent — 우선 동작 검증 후)

## Context

### Root cause

각 extension 의 regex 패턴 (예시 `stepsExtension` at `cli/src/ssg/renderMarkdown.ts:249`):
```ts
/^:::[ \t]*steps[ \t]*\n([\s\S]*?)\n?:::/
```
`[\s\S]*?` non-greedy + 닫는 `:::` 가 고정. 외곽 안의 첫 `:::` (내부 directive 시작 줄) 가 닫힘으로 잡힘.

### 해결 패턴 — `whenExtension` 이미 사용 중 (`cli/src/ssg/renderMarkdown.ts:664+` / `viewer/src/utils/markdown.ts:1068+`)

```ts
/^(:{3,})[ \t]*when[ \t]+([\w-]+)[ \t]*=[ \t]*([\w-]+)[ \t]*\n([\s\S]*?)\n\1[ \t]*(?:\n|$)/
```
- `(:{3,})` — 외곽 fence 길이 캡처
- `\1` — 같은 길이 백참조로만 닫힘. 내부 `:::` 3개는 외곽 `::::` 4개를 못 닫음
- 후방호환: `:::name\n...\n:::` 도 그대로 매칭 (3=3)

### 변경 대상 directive (총 20+개)

**renderMarkdown.ts** (`core/packages/cli/src/ssg/renderMarkdown.ts`):
- `youtubeExtension:66`, `videoExtension:86`, `copyEmbedExtension:110`, `contentCardsExtension:129`, `canvasChartExtension:225`, `stepsExtension:249`, `ctaExtension:269`, `linkCardExtension:294`, `figmaExtension:359`, `figureSideExtension:384`, `figureTabsExtension:468`, `notionExtension:522`, `containerExtension:547`, `detailsExtension:600`, `selectorExtension:642`, `codeGroupExtension:764`
- 이미 변환됨: `whenExtension:664+`

**markdown.ts** (`core/packages/viewer/src/utils/markdown.ts`):
- 위 16개 + `responsibilityExtension:358`, `endpointExtension:566`, `parametersExtension:599`, `responseFieldsExtension:619`, `errorCodesExtension:639`, `responseExtension:1219`
- 이미 변환됨: `whenExtension:1068+`

### Capture group index shift

각 regex 의 capture group 번호가 +1 됨 (group 1 = fence). 코드에서 `match[1]`, `match[2]` 참조하는 곳 일괄 +1. 또는 fence 를 destructure 시 `[, fence, name, ...rest]` 로 받기.

`copyEmbedExtension` 만 self-closing (`:::name args\n:::`) 라 닫는 fence 의 `\n` 앞 위치도 검토 필요.

## Backlog

- VS Code / Plate 에디터 측 syntax highlighting 업데이트 (별도 intent)
- 저자 가이드 문서에 nesting 예시 추가 (별도 intent)

## Footprint

### Step 1 — variable-fence regex 일괄 변환 (2026-04-29)

- `core/packages/cli/src/ssg/renderMarkdown.ts` — 16개 directive extension regex 를 `^:::` non-greedy → `^(:{3,}) ... \n\1[ \t]*(?:\n|$)` 가변 fence 로 교체. 모든 capture index `match[N]` → `match[N+1]` 시프트 (group 1 = fence 길이). `whenExtension` 은 이미 가변 fence — 보존
- `core/packages/viewer/src/utils/markdown.ts` — 동일 패턴 22개 directive (위 16개 + responsibility / endpoint / parameters / response-fields / error-codes / response). `whenExtension` 보존
- `core/packages/cli/src/ssg/renderMarkdown.test.ts` — 신규 `directive nesting` describe 블록: (a) `::::steps` 외곽 + `:::code-group` 내부 nesting (b) 기존 3-fence 회귀 (총 +6 cases, 27 → 33)
- `core/packages/viewer/src/utils/markdown.test.ts` — 동일 케이스 (총 +5 cases, 10 → 15)
- 검증:
  - `pnpm --filter @openhow/cli test -- --run` → 108/108 pass (renderMarkdown 33 tests 포함)
  - `pnpm --filter @openhow/viewer test -- --run` → 15/15 pass
  - `pnpm --filter @openhow/viewer build` → 통과
  - `grep -c "(:{3,})"` SSG 17 (16+1) / SPA 23 (22+1) — 일치
  - `git diff --stat` 4 의도 파일 (+3 무관 dirty 보존)

## Learnings

### 2026-04-29: VitePress 표준 fence 백참조가 정답이었음

`whenExtension` 만 1년 가까이 가변 fence (`(:{3,})\n...\n\1`) 였고 나머지 20+ extension 은 모두 `:::` non-greedy. 같은 코드베이스 안에 두 패턴이 공존했지만 `whenExtension` 외곽 안에 다른 directive 를 쓰는 경우가 거의 없어서 cascade 결함이 드러나지 않았음.

**Why**: 사용자가 `:::steps` 안에 `:::code-group` 을 쓸 때마다 첫 내부 `:::` 이 외곽을 닫아버려 저자가 빈 `:::` 을 한 줄 띄우는 workaround 를 발견. "이게 맞나?" 라는 질문이 트리거.

**How to apply**: 새 directive extension 을 추가할 때는 `whenExtension` 을 reference 로 가변 fence 패턴을 그대로 차용. capture group 1 = fence, 본문 capture 는 group 2 부터 시작.

### 2026-04-29: capture group 시프트는 매뉴얼이지만 패턴화 가능

가변 fence 추가 = group 1 = fence 길이. 기존 `match[1]` (이름/URL 등) → `match[2]`, `match[2]` → `match[3]` 식으로 일괄 +1. tokenizer 내부에서 `match[N]` 참조하는 모든 곳이 대상. Codex 가 이 변환을 깔끔하게 일괄 처리할 수 있는 기계적 패턴.

**How to apply**: regex 만 바꾸고 group ref 시프트를 잊으면 런타임 undefined 참조로 깨짐. 변환 후 `pnpm test` 로 즉시 회귀 확인이 1차 방어선.

### 2026-04-29: 후방호환은 `(:{3,})` 의 자연 속성

가변 fence 패턴은 기존 모든 `:::name\n...\n:::` 케이스를 그대로 매칭 (3=3 백참조). 즉 **마이그레이션 작업 0**. 새 nesting 사용처만 `::::` 4개로 외곽을 쓰면 됨. legacy 마크업 변경 불필요.

**How to apply**: regex 후방호환 변경 시 fence 길이 캡처 + 백참조가 가장 간단한 가변 길이 마커 패턴. 다른 토큰 (예: pretty-print 펜스, custom container) 에도 동일 트릭 사용 가능.
