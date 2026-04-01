---
slug: AI회사-92-지금-당장-Paperclip-처음-세팅해보기
title: "지금 당장 Paperclip 처음 세팅해보기"
nav: 지금 당장 처음 세팅해보기
order: 92
---

**말로만 보면 감이 안 와. 한 번 직접 켜보면 훨씬 빨라.**

이번 글은 진짜로 Paperclip을 처음 띄워보는 순서야.

---

## 뭘 할 거야?

딱 여기까지만 해볼 거야.

1. Paperclip 설치하고 켜기
2. 웹 화면 들어가기
3. 첫 회사 만들기
4. 회사 목표 넣기
5. CEO 하나 만들기

이 정도면 충분해.

---

## 먼저 뭘 준비해?

공식 문서 기준으로,
로컬에서 가장 빠른 시작은 이거야.

- Node.js 20+
- 터미널
- 브라우저

이 정도면 돼.

---

## 어떻게 켜?

가장 쉬운 시작 명령은 이거야.

```bash
npx paperclipai onboard --yes
```

이걸 치면 세팅을 잡고,
Paperclip을 띄우는 쪽으로 이어져.

나중에 다시 켤 땐 이걸 써.

```bash
npx paperclipai run
```

공식 Quickstart도 이 흐름이야.

---

## 켜지면 어디로 가?

브라우저에서 Paperclip 화면으로 들어가.

공식 문서 기준 로컬 주소는 보통 이거야.

```text
http://localhost:3100
```

여기 들어가면 이제 웹 화면에서 작업해.

---

## 첫 회사는 어떻게 만들어?

화면에서 `New Company`를 눌러.

그리고 이 정도만 넣으면 돼.

- 회사 이름
- 회사 설명

설명은 길 필요 없어.

예:

- 이름: AI Content Lab
- 설명: 블로그 글과 뉴스레터를 만드는 작은 AI 팀

---

## 목표는 뭘 넣어?

공식 문서는 목표를 먼저 넣으라고 해.

왜냐면 Paperclip은 일이 목표에 이어지길 원하거든.

처음 목표는 너무 거창할 필요 없어.

예:

- 한 달 안에 블로그 글 10개 발행하기
- 제품 소개 페이지 초안 만들기
- 경쟁사 조사 리포트 3개 만들기

핵심은,
**왜 이 회사를 굴리는지 한 줄로 보이게 쓰는 거야.**

---

## CEO는 어떻게 만들까?

이제 첫 AI를 만든다.

공식 문서 흐름에선 보통 CEO부터 시작해.

넣을 건 대충 이래.

- 이름: CEO
- 역할: `ceo`
- adapter: Claude Local 같은 기본값
- budget: 처음엔 작게

중요한 건,
CEO는 직접 다 만드는 사람이라기보다
**전략 보고, 일 나누고, 진행 보는 사람**으로 잡는 거야.

---

## CEO한테 어떤 두뇌를 줄까?

adapter는 두뇌야.

CEO가 쓸 모델을 골라.

대표 adapter는 셋이야.

- `Claude Local`: Anthropic API 키가 필요해
- `OpenAI`: OpenAI API 키가 필요해
- `Ollama`: 로컬 모델이야. 키는 안 필요해

처음 켤 때
onboard가 키를 물어봐.

그때 넣어도 돼.

나중에 넣어도 돼.

웹 화면 `Settings`로 가.

거기서 다시 넣어.

## 여기까지 하고 뭘 보면 돼?

이제 봐야 할 건 세 가지야.

### 1. 회사가 생겼나?

회사 화면에 첫 회사가 보여야 해.

### 2. 목표가 들어갔나?

Goals 쪽에서 네 목표가 보여야 해.

### 3. CEO가 생겼나?

Agents 쪽에서 CEO가 보여야 해.

이 세 개가 보이면 시작은 된 거야.

---

## 바로 여러 명 더 넣어야 해?

이번 글 기준으로는 아니야.

먼저 여기까지만 보는 게 좋아.

- 회사
- 목표
- CEO

이 세 개가 잡혀야 다음이 쉬워.

여기서 바로 조직도를 크게 늘리면,
오히려 처음 감을 잡기 어려워져.

---

## 어디서 확인했어?

- [Paperclip 공식 문서 `Quickstart`](https://paperclip.ing/docs/quickstart)
- [Paperclip 공식 문서 `Creating a Company`](https://paperclip.ing/docs/creating-a-company)
- [Paperclip 공식 문서 `Core Concepts`](https://paperclip.ing/docs/concepts)
- [Paperclip 공식 문서 `What is Paperclip?`](https://paperclip.ing/docs/what-is-paperclip)

---

## 한 줄 정리

처음엔 설치하고, 회사 만들고, 목표 넣고, CEO 하나 만들면 돼. 그게 Paperclip 시작점이야.

다음은 실제로 heartbeat를 돌려볼 거야.
