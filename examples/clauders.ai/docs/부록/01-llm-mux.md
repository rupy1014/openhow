---
slug: 부록-llm-mux
title: "llm-mux"
nav: llm-mux
order: 1
---

**구독만 있으면 API 키 없이도 돼.**

Claude Pro나 ChatGPT Plus 구독이 있어?
그러면 API 키 발급 없이 바로 API처럼 쓸 수 있어.
그게 llm-mux야.

---

## 어떻게 되는 거야?

llm-mux는 네 브라우저 로그인 정보를 이용해.

:::steps

### llm-mux login 실행

`llm-mux login claude`를 실행하면 브라우저가 열려.

### Claude에 로그인

평소 쓰던 계정 그대로 로그인해.

### API 요청 보내기

끝. 이제 `localhost:8317`로 API 요청을 보내면 돼.

```bash:터미널
curl http://localhost:8317/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude",
    "messages": [{"role": "user", "content": "안녕"}]
  }'
```

:::

OpenAI 형식 그대로야.
그래서 OpenAI API를 쓰는 어떤 도구든 엔드포인트만 바꾸면 연결돼.

---

## 어떻게 설치해?

두 가지 방법이 있어.

**방법 1. Go로 설치**

```bash:터미널
go install github.com/nicholasgasior/llm-mux@latest
```

**방법 2. 바이너리 다운로드**

GitHub Releases에서 네 OS에 맞는 파일을 받아.

설치 후 실행은 이렇게:

```bash:터미널
llm-mux serve
```

이러면 `localhost:8317`에서 대기해.

---

## 언제 쓰면 좋아?

API 키가 없는데 Claude Code 같은 도구를 연결하고 싶을 때.

이미 구독하고 있으면 추가 비용이 없어.
근데 구독 약관을 확인하는 게 좋아. API 용도를 허용하지 않을 수도 있거든.

---

## 한 줄 정리

llm-mux는 구독 계정을 API로 바꿔주는 도구야. API 키 없이 시작하고 싶으면 이걸 써.
