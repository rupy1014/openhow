---
slug: 부록-llm-mux
title: "llm-mux"
nav: llm-mux
order: 1
---

**구독만 있으면 API 키 없이도 돼.**

Claude Pro나 ChatGPT Plus 구독이 있어?
그러면 API 키 발급 없이 바로 API처럼 쓸 수 있어.
그게 [llm-mux](https://github.com/nghyane/llm-mux)야.

---

## 어떻게 되는 거야?

llm-mux는 네 브라우저 로그인(OAuth)을 이용해서 구독 계정을 API로 바꿔줘.

:::steps

### llm-mux 설치

```bash:터미널
curl -fsSL https://raw.githubusercontent.com/nghyane/llm-mux/main/install.sh | bash
```

### OAuth 로그인

```bash:터미널
llm-mux login claude
```

브라우저가 열려. 평소 쓰던 Claude 계정으로 로그인하면 돼.

### 서버 실행

```bash:터미널
llm-mux serve
```

`localhost:8317`에서 OpenAI 호환 API가 열려.
어떤 도구든 엔드포인트만 바꾸면 연결돼.

:::

---

## 설치가 귀찮아? Claude Code한테 시켜

직접 설치해도 되지만, Claude Code한테 맡기는 게 더 빨라.

:::steps

### Claude Code를 열어

터미널에서 `claude`를 실행해.

### GitHub 주소를 넘겨

이렇게 말하면 돼:

```text:프롬프트
https://github.com/nghyane/llm-mux 이 프로젝트 보고 llm-mux 설치해줘.
설치 끝나면 claude 로그인까지 해줘.
```

### Claude Code가 알아서 해

README를 읽고, 설치 스크립트를 실행하고, OAuth 로그인까지 안내해줘.
너는 브라우저에서 로그인만 하면 돼.

:::

이게 바이브코딩이야. 문서 읽고 따라하는 대신, AI한테 문서를 읽게 시키는 거야.

---

## Claude 말고 다른 것도 돼?

돼. GitHub Copilot이나 Gemini 구독도 쓸 수 있어.

```bash:터미널
llm-mux login copilot    # GitHub Copilot
llm-mux login antigravity # Google Gemini
```

계정 여러 개를 동시에 연결하면 부하 분산도 해줘.
할당량 초과되면 자동으로 다른 계정으로 넘어가.

---

## 언제 쓰면 좋아?

API 키가 없는데 Claude Code 같은 도구를 연결하고 싶을 때.

이미 구독하고 있으면 추가 비용이 없어.
근데 구독 약관을 확인하는 게 좋아. API 용도를 허용하지 않을 수도 있거든.

---

## 한 줄 정리

llm-mux는 구독 계정을 API로 바꿔주는 도구야. GitHub 주소 하나 던져주면 Claude Code가 설치부터 로그인까지 해줘.
