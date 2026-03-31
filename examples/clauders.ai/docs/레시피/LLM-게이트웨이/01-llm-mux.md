---
slug: LLM-게이트웨이-llm-mux
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
llm-mux login codex
```

브라우저가 열려. 평소 쓰던 ChatGPT 계정으로 로그인하면 돼.

### 서버 실행

```bash:터미널
llm-mux serve
```

`localhost:8317`에서 OpenAI 호환 API가 열려.
어떤 도구든 엔드포인트만 바꾸면 연결돼.

:::

---

## 설치가 귀찮아? Claude Code한테 시켜

위에 단계 따라할 필요 없어. Claude Code한테 git 주소만 넘기면 돼.

```text:프롬프트
https://github.com/nghyane/llm-mux 이거 참고해서 우리 프로젝트에 적용해줘
```

Claude Code가 README 읽고, 설치하고, 설정까지 알아서 해.
너는 OAuth 로그인할 때 브라우저에서 클릭만 하면 돼.

---

## 다른 provider도 돼?

돼. Codex 외에도 여러 provider를 지원해.

```bash:터미널
llm-mux login codex       # ChatGPT Plus/Pro (추천)
llm-mux login copilot     # GitHub Copilot
llm-mux login claude      # Claude Pro/Max
llm-mux login antigravity # Google Gemini
```

계정 여러 개를 동시에 연결하면 부하 분산도 해줘.
할당량 초과되면 자동으로 다른 계정으로 넘어가.

> **codex를 써.** Claude(`login claude`)나 Gemini(`login antigravity`)는 구독 약관상 API 용도를 허용하지 않아서, 계정이 정지될 수 있어. ChatGPT의 Codex(`login codex`)가 가장 안전해.

출력 포맷은 OpenAI, Anthropic, Ollama 호환이라 어떤 클라이언트든 엔드포인트만 바꾸면 붙어.
Ollama를 쓰고 있었다면 코드 수정 없이 llm-mux로 교체할 수 있어.

---

## 서버에 배포하려면?

로컬에서 OAuth 로그인하면 토큰이 파일로 저장돼.
이 파일을 서버에 복사하면 끝이야. 서버에서 브라우저 열 필요 없어.

:::steps

### 로컬에서 로그인

```bash:터미널
llm-mux login codex
```

브라우저가 열리고, 로그인하면 credential 파일이 생겨.

```bash:터미널
ls ~/.config/llm-mux/auth/
```

```text:출력 예시
codex-me@gmail.com.json
```

이 파일 안에 `access_token`, `refresh_token`, 만료일이 다 들어있어.
llm-mux가 알아서 갱신해주니까 수동으로 건드릴 건 없어.

### 서버에 auth 폴더 만들기

```bash:터미널
ssh your-server "mkdir -p /path/to/llm-mux-auth"
```

### credential 파일 복사

```bash:터미널
scp ~/.config/llm-mux/auth/*.json your-server:/path/to/llm-mux-auth/
```

### Docker Compose에 볼륨 연결

```yaml:docker-compose.yaml
services:
  llm-mux:
    image: llm-mux:latest
    volumes:
      - ./docker/llm-mux-auth:/root/.config/llm-mux/auth
    restart: always
```

핵심은 `volumes` 한 줄이야. 호스트의 auth 폴더를 컨테이너 안 `~/.config/llm-mux/auth`에 마운트하면 돼.

### 컨테이너 올리기

```bash:터미널
docker compose up -d llm-mux
```

로그에 `1 clients (1 auth files ...)`가 보이면 성공이야.

```bash:터미널
docker logs llm-mux-1
```

```text:정상 로그
server clients and configuration updated: 1 clients (1 auth files ...)
core auth auto-refresh started (interval=15m0s)
```

:::

---

## 토큰 갱신은?

신경 안 써도 돼.

credential 파일 안에 `refresh_token`이 있어.
llm-mux가 15분마다 토큰 상태를 확인하고, 만료되면 자동으로 갱신해.

갱신된 토큰은 같은 파일에 덮어쓰여.
볼륨 마운트 덕분에 컨테이너가 재시작돼도 유지돼.

---

## 언제 쓰면 좋아?

API 키가 없는데 Claude Code 같은 도구를 연결하고 싶을 때.
이미 구독하고 있으면 추가 비용이 없어.

---

## 한 줄 정리

llm-mux는 구독 계정을 API로 바꿔주는 도구야. 로컬에서 로그인하고 credential 파일만 서버에 복사하면 돼.
