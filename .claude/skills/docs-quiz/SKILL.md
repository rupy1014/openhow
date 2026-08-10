---
name: docs-quiz
description: 'Use when the user asks to turn a docs folder into a quiz — "이 문서로 퀴즈 만들어줘", "수강생용 퀴즈", "자가진단 퀴즈", "make a quiz from these docs". Builds a self-graded single-file HTML quiz from every markdown doc in a target directory. Not for writing new docs (use the clauders.ai tone guide) and not for grading submissions.'
---

# docs-quiz

문서 폴더 하나를 수강생용 자가진단 퀴즈 HTML 한 장으로 만든다.

강사가 답을 열어주는 진행용이 아니라 **학습자가 직접 답을 고르고 즉시 채점받는** 형태다.
기존 라이브 진행용 퀴즈(`examples/clauders.ai/docs/live-diagnostic-quiz.html`)와 목적이 다르니 섞지 않는다.

## 산출물

```
{docs_root}/{폴더명}-quiz.html
```

예: `docs/getting-started/` → `docs/getting-started-quiz.html`

단일 파일이다. 외부 CSS/JS/폰트/이미지를 링크하지 않는다. 파일을 그대로 보내도 열려야 한다.

## 절차

### 1. 문서를 끝까지 읽는다

대상 폴더의 `*.md` **전부**와 `_meta.json`을 읽는다. 검색 스니펫으로 문항을 만들지 않는다.
문서 하나를 안 읽으면 그 챕터 문항이 통째로 틀린 사실을 담게 된다.

`_meta.json`에서 가져올 것:

| 필드 | 쓰임 |
|---|---|
| `label` | 퀴즈 제목의 주제명 |
| `badge` | eyebrow의 주차 표기 (예: `2주차`) |
| `items[].label` | 챕터 제목 |

### 2. 문항을 고른다 — 10~15개

**개수 상한이 곧 품질 기준이다.** 20개를 넘기면 반드시 채울 문항이 생기고, 그 문항이 짜친다.

남길 것 — **틀리게 알면 실제로 다르게 행동하게 되는 것**:

- 개념 구분 (A와 B가 뭐가 다른가)
- 판단 기준 (언제 이걸 쓰고 언제 저걸 쓰나)
- 흔한 오해 교정 (문서가 명시적으로 "아니야"라고 말한 것)
- 우선순위·범위 감각 (뭐부터, 어디까지)

뺄 것:

| 유형 | 이유 |
|---|---|
| 운영 공지성 숫자 (점수, 시간, 장소, 출석 방법) | 공지 찾아보면 나온다. 이해가 아니다 |
| 절차·설치 단계 암기 (플래그 이름, 설치 항목) | 손으로 한 번 하면 알게 된다 |
| 표 암기 (문서의 비교표를 그대로 되묻기) | 이해가 아니라 조회다 |
| 다른 문항과 논지가 겹치는 것 | 같은 걸 두 번 묻는다 |

챕터별 문항 수는 균등하게 맞추지 않는다. 내용이 얕은 문서는 1문항이어도 된다.

### 3. 챕터로 묶는다

문서 하나 = 챕터 하나. `tag`는 **원문 파일 번호를 그대로** 쓴다.

챕터를 통째로 뺐으면 번호에 구멍이 생기는데, 메우지 않는다.
틀렸을 때 어느 문서를 열어야 하는지 바로 찾게 하는 게 번호의 목적이다.

```js
{ tag: '03', title: '왜 CLI인가', source: '시작하기 · Claude Code 쓰는 이유', questions: [...] }
```

`source`는 각 문항 해설 아래 칩으로 붙는다. 링크가 아니라 텍스트다 — 배포 URL 구조에 의존하지 않는다.

### 4. 문항을 쓴다

말투는 **대상 문서의 말투를 따른다**. clauders.ai 문서는 평어(`~이야`, `~해`, `~거야`)라서 퀴즈도 평어다.
`examples/clauders.ai/CLAUDE.md`의 톤 규칙이 그대로 적용된다.

- 오답 보기도 그럴듯해야 한다. 명백한 농담 보기를 넣으면 3지선다가 된다
- 해설은 정답 확인이 아니라 **왜 그런지 + 문서의 원문 논지**를 짧게 (1~3문장)
- 코드·파일명은 `<code>` 로 감싼다. 보기 안에서도 쓴다
- 부정형 문항("~이 아닌 것은")은 `<strong>아닌</strong>`으로 강조한다. 안 하면 반드시 오독한다

### 5. 정답 위치를 섞는다

문항을 순서대로 쓰면 정답 인덱스가 주기적으로 반복되기 쉽다.
실제로 이 스킬을 만든 세션에서 `BDACBDACBDACB`가 나왔다 — 4주기 반복이라 패턴만 보고 찍으면 전부 맞았다.

규칙:

- A~D 분포를 대체로 균등하게 (13문항이면 3/3/3/4)
- **주기 2~6의 반복이 없을 것.** 검증 스크립트가 자동으로 잡는다
- 가장 긴 보기가 정답인 문항이 연속되지 않게

### 6. 템플릿에 얹는다

`assets/quiz-template.html`을 복사하고 `META`와 `CHAPTERS`만 바꾼다. CSS/렌더링/채점 로직은 손대지 않는다.

문항 수에 연동되는 값(총 문항, 통과 기준선, 결과 등급)은 **전부 `TOTAL`에서 런타임 계산된다.**
템플릿을 이렇게 만든 이유가 있다 — 초안에서 본문에 "22문항"이라 써놓고 실제로는 25문항이 나온 적이 있다.
숫자를 본문에 손으로 적지 않는다.

바꿀 건 `META` 4개 필드뿐이다.

```js
const META = {
  eyebrow: '클로더즈 2주차 · 자동화 입문',   // 상단 작은 라벨
  title: '자동화 입문 자가진단 퀴즈',          // h1
  sourceLabel: '2주차 문서',                  // "OO를 읽고 뭐가 남았는지"
  nextStep: '숙제',                           // "OO로 넘어가도 돼"
};
```

### 7. 검증한다 — 생략하지 않는다

```bash
NODE_PATH=/opt/homebrew/lib/node_modules node \
  .claude/skills/docs-quiz/assets/verify.js \
  <퀴즈-html-절대경로>
```

playwright는 전역에만 설치돼 있어서 `NODE_PATH`가 필요하다. MCP 서버는 쓰지 않는다 (전역 룰).

스크립트가 잡는 것:

- 카드 수 = `CHAPTERS`의 문항 합
- 보기 4개, `answer` 인덱스 범위
- 정답 분포와 주기적 패턴
- 전 문항 정답 클릭 시 만점 도달, 결과 카드 노출
- JS 런타임 에러

전부 통과하면 exit 0. 하나라도 실패하면 exit 1과 함께 이유를 찍는다.

### 8. 브라우저로 연다

```bash
open <퀴즈-html-절대경로>
```

`localhost`가 아닌 `file://`이라 Firecrawl은 못 쓴다. 화면 확인이 필요하면 playwright 스크린샷을 `scratchpad/`에 저장하고 Read로 본다.

스크린샷을 마지막 클릭 **직후에** 찍으면 progress bar가 CSS transition(0.25s) 중간 상태로 잡힌다.
채워진 걸 확인하려면 `waitForTimeout(500)` 이상 두거나, `getBoundingClientRect().width`로 재는 게 확실하다.

## 만들지 않는 것

- 정답 저장·제출·서버 전송 — 자가진단이라 로컬에서 끝난다
- 타이머·문항 셔플 — 시험이 아니다
- 다크모드 — 기존 퀴즈 파일과 톤을 맞춘다

## 참고 파일

| 경로 | 용도 |
|---|---|
| `examples/clauders.ai/docs/getting-started-quiz.html` | 1주차, 13문항 |
| `examples/clauders.ai/docs/automation-quiz.html` | 2주차, 13문항 |
| `examples/clauders.ai/docs/live-diagnostic-quiz.html` | 강사 진행용 (형태가 다름) |
| `examples/clauders.ai/CLAUDE.md` | 말투 규칙 |
