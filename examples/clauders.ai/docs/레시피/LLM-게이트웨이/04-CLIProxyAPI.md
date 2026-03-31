---
slug: LLM-게이트웨이-CLIProxyAPI
title: "CLIProxyAPI"
nav: CLIProxyAPI
order: 4
---

**유저가 자기 구독으로 로그인하게 하고 싶으면 이거야.**

llm-mux는 개발자가 직접 로그인하잖아.
[CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI)는 **웹사이트 방문자가** 자기 Claude/ChatGPT 계정으로 로그인해서 쓸 수 있어.

---

## llm-mux랑 뭐가 달라?

| | llm-mux | CLIProxyAPI |
|---|---|---|
| **누가 로그인?** | 개발자 본인 | 웹사이트 유저 (엔드유저) |
| **용도** | 로컬 개발, 서버 배포 | 웹 서비스에 AI 붙이기 |
| **OAuth 방식** | CLI에서 로그인 | REST API로 OAuth URL 생성 |
| **관리 API** | 없어 | 있어 (인증 상태, 계정 목록) |

한 마디로, llm-mux는 **너 혼자 쓰는 용**, CLIProxyAPI는 **서비스에 붙이는 용**이야.

---

## 어떻게 돌아가?

유저가 로그인 버튼 누르면 이런 흐름이야.

:::steps

### OAuth URL 요청

웹 프론트엔드가 프록시한테 OAuth URL을 달라고 해.

```bash:터미널
curl http://localhost:8317/v0/management/anthropic-auth-url \
  -H "X-Secret-Key: mgmt-secret"
```

Claude OAuth 로그인 페이지 URL이 돌아와.

### 유저가 로그인

유저 브라우저에서 claude.ai 로그인 화면이 열려.
본인 계정으로 로그인하면 돼. PKCE 방식이라 안전해.

### 콜백 → 토큰 저장

로그인 완료되면 프록시의 `/anthropic/callback`으로 리다이렉트돼.
프록시가 토큰을 받아서 파일로 저장해.

### API 요청

이제 그 유저의 토큰으로 AI를 호출할 수 있어.

```bash:터미널
curl http://localhost:8317/v1/chat/completions \
  -H "Authorization: Bearer canvas-local-dev-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "messages": [{"role": "user", "content": "안녕"}]
  }'
```

유저의 Claude 구독이 소모돼. 운영자 비용 = 0.

:::

---

## 지원하는 프로바이더

| 프로바이더 | OAuth URL 엔드포인트 | 콜백 |
|-----------|---------------------|------|
| Claude (Anthropic) | `/v0/management/anthropic-auth-url` | `/anthropic/callback` |
| ChatGPT (Codex) | `/v0/management/codex-auth-url` | `/codex/callback` |
| Gemini (Google) | `/v0/management/gemini-cli-auth-url` | `/google/callback` |

Claude Pro/Max, ChatGPT Plus, Gemini Advanced 구독이 있으면 API 키 없이 쓸 수 있어.

---

## 설치하려면?

4가지 방법이 있어. Docker가 가장 간편해.

```bash:터미널
# Docker
docker-compose up

# 또는 Go 바이너리 (GitHub Releases에서 다운로드)
# 또는 소스 빌드
go build ./cmd/server
```

설정 파일 하나 만들면 돼.

```yaml:config.yaml
port: 8317
host: "0.0.0.0"

# 프록시 접근용 API 키
api-keys:
  - "my-api-key"

# Management API 시크릿
remote-management:
  secret-key: "mgmt-secret"

# OAuth 콜백 URL (프로덕션에서는 실제 도메인)
oauth:
  base-url: "https://ai-proxy.example.com"
```

`oauth.base-url`이 핵심이야.
원본은 `localhost` 하드코딩이라 원격 유저가 OAuth 못 해.
이걸 서버 도메인으로 바꾸면 어디서든 로그인 가능해.

---

## Management API

인증 상태를 REST API로 관리할 수 있어.

| 엔드포인트 | 역할 |
|-----------|------|
| `GET /v0/management/get-auth-status` | 인증 상태 확인 |
| `GET /v0/management/auth-files` | 저장된 계정 목록 |
| `POST /v0/management/oauth-callback` | 범용 콜백 처리 |
| `GET /v1/models` | 사용 가능한 모델 목록 |

모든 management 엔드포인트는 `X-Secret-Key` 헤더가 필요해.

---

## 웹 서비스에 붙이는 구조

```
┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│  웹 프론트   │    │  CLIProxyAPI  │    │  AI 서비스   │
│  (React 등)  │    │  (:8317)      │    │              │
│              │    │               │    │  claude.ai   │
│ "로그인" ───►├───►│ /auth-url ───►├───►│  OAuth 로그인│
│              │◄───┤ /callback  ◄──┤◄───┤  (유저 본인) │
│              │    │               │    │              │
│ 채팅 메시지 ─├───►│ /v1/chat/  ──►├───►│  API 호출    │
│ (SSE 스트림) │◄───┤ completions◄──┤◄───┤  (유저 토큰) │
└──────────────┘    └───────────────┘    └──────────────┘
```

프론트엔드 코드는 OpenAI SDK 그대로 써도 돼.
엔드포인트만 CLIProxyAPI 주소로 바꾸면 돼.

---

## Go 앱에 내장하려면?

Go로 백엔드를 만들고 있으면 SDK로 임베딩도 돼.

```go:main.go
import "github.com/router-for-me/CLIProxyAPI/pkg/cliproxy"

proxy := cliproxy.NewBuilder().
    Port(8317).
    APIKeys([]string{"my-key"}).
    Build()
proxy.Start()
```

별도 프로세스 없이 Go 앱 안에서 프록시가 돌아.

---

## 한 줄 정리

CLIProxyAPI는 웹 서비스에 AI를 붙일 때 쓰는 프록시야. 유저가 자기 구독으로 로그인하니까 운영자 API 비용이 0이야.
