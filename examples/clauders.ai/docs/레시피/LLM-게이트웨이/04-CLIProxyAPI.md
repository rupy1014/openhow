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

## Management OAuth Flow (핵심)

이 섹션이 CLIProxyAPI를 **프로덕션 서비스에서 쓸 수 있게 만드는 핵심**이야.
WebView나 앱 내장 OAuth가 차단되는 환경(Android WebView, Electron 등)에서도 이 방식이면 동작해.

### 왜 필요해?

OAuth 프로바이더(Google, OpenAI 등)는 **WebView에서의 로그인을 차단**해.
"보안 브라우저 정책을 준수하지 않습니다" 같은 에러가 나.
CLIProxyAPI의 Management OAuth Flow는 **일반 브라우저에서 로그인**하고, 콜백을 **서버가 직접 수신**하는 구조라서 이 문제를 우회해.

### 흐름 (Web UI 모드)

:::steps

#### 프론트엔드가 Auth URL 요청

`?is_webui=1` 파라미터가 핵심이야. 이걸 붙이면 서버 콜백 모드로 동작해.

```bash:터미널
curl "https://ai-proxy.example.com/v0/management/anthropic-auth-url?is_webui=1" \
  -H "X-Secret-Key: mgmt-secret"
```

응답:
```json
{"status": "ok", "url": "https://claude.ai/oauth/authorize?...", "state": "abc123"}
```

서버 내부에서 일어나는 일:
1. PKCE verifier/challenge 생성 (S256)
2. 랜덤 state 생성
3. **세션 등록** — in-memory store에 state + provider 저장 (10분 TTL)
4. **콜백 포워더 시작** — localhost:{provider_port}에서 서버의 콜백 엔드포인트로 리다이렉트하는 미니 HTTP 서버
5. Auth URL + state 반환

#### 유저가 브라우저에서 로그인

프론트엔드가 반환된 URL을 **새 탭이나 팝업**으로 열어.
일반 브라우저(Chrome, Safari 등)라서 OAuth 프로바이더가 차단하지 않아.

#### 콜백이 서버로 돌아옴

로그인 완료 후 프로바이더가 리다이렉트하면:

**로컬 개발** (`oauth.base-url` 미설정):
```
Provider → http://localhost:54545/callback?code=X&state=Y
         → 포워더가 캐치
         → http://127.0.0.1:8317/anthropic/callback?code=X&state=Y 로 리다이렉트
```

**프로덕션** (`oauth.base-url: "https://ai-proxy.example.com"`):
```
Provider → https://ai-proxy.example.com/anthropic/callback?code=X&state=Y
         → 서버가 직접 수신 (포워더 불필요)
```

서버의 콜백 핸들러가 code를 받아서 `.oauth-{provider}-{state}.oauth` 파일에 기록해.

#### 토큰 교환 & 저장

1단계에서 시작된 goroutine이 파일을 감지하면:
1. Authorization code + PKCE verifier로 **토큰 교환**
2. Access token + refresh token을 `~/.cliproxyapi/auths/{provider}-{email}.json`에 저장
3. 세션 완료 표시

#### 프론트엔드가 완료 확인

프론트엔드는 state를 가지고 있으니 폴링으로 확인하면 돼.

```bash:터미널
curl "https://ai-proxy.example.com/v0/management/get-auth-status" \
  -H "X-Secret-Key: mgmt-secret"
```

연결 완료된 계정 목록이 돌아와.

:::

### 콜백 포워더 상세

| 프로바이더 | 기본 포트 | 콜백 경로 | 포워더 대상 |
|-----------|----------|----------|------------|
| Claude | 54545 | `/callback` | `/anthropic/callback` |
| ChatGPT (Codex) | 1455 | `/auth/callback` | `/codex/callback` |
| Gemini | 8085 | `/oauth2callback` | `/google/callback` |

로컬 개발에서는 포워더가 이 포트들에서 리슨하면서 서버 콜백으로 리다이렉트해.
프로덕션에서는 `oauth.base-url`이 설정되면 포워더 없이 서버가 직접 콜백을 받아.

### 세션 관리

- **In-memory store**: state → (provider, status) 매핑
- **TTL**: 10분 (로그인 안 하면 자동 만료)
- **파일 기반 IPC**: 콜백 핸들러 → `.oauth` 파일 → goroutine 감지. 프로세스 간 통신에 파일을 쓰는 심플한 설계.

### 범용 콜백 엔드포인트

프로바이더별 GET 콜백 외에 **범용 POST 콜백**도 있어.

```bash:터미널
curl -X POST "https://ai-proxy.example.com/v0/management/oauth-callback" \
  -H "X-Secret-Key: mgmt-secret" \
  -H "Content-Type: application/json" \
  -d '{"provider": "anthropic", "code": "auth_code_here", "state": "abc123"}'
```

또는 `redirect_url` 필드로 전체 콜백 URL을 넘겨도 돼. 서버가 code/state를 파싱해줘.

```json
{"provider": "anthropic", "redirect_url": "http://localhost:54545/callback?code=X&state=Y"}
```

---

## Management API

인증 상태를 REST API로 관리할 수 있어.

| 엔드포인트 | 메서드 | 역할 |
|-----------|--------|------|
| `/v0/management/anthropic-auth-url` | GET | Claude OAuth URL 생성 (`?is_webui=1` 지원) |
| `/v0/management/codex-auth-url` | GET | ChatGPT OAuth URL 생성 |
| `/v0/management/gemini-cli-auth-url` | GET | Gemini OAuth URL 생성 |
| `/v0/management/get-auth-status` | GET | 인증 상태 확인 |
| `/v0/management/auth-files` | GET | 저장된 계정 목록 |
| `/v0/management/oauth-callback` | POST | 범용 콜백 처리 |
| `/anthropic/callback` | GET | Claude 콜백 (프로바이더가 리다이렉트) |
| `/codex/callback` | GET | ChatGPT 콜백 |
| `/google/callback` | GET | Gemini 콜백 |
| `/v1/models` | GET | 사용 가능한 모델 목록 |

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

## 프로덕션 배포 예시

실제 서비스에서 쓸 때의 전체 구조야. 핵심은 **CLIProxyAPI를 LLM 게이트웨이로 배포**하는 거야.

### 아키텍처

```
┌──────────────┐    ┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│  Android 앱  │    │  웹 대시보드 │    │  CLIProxyAPI  │    │  AI 서비스   │
│  (SoulEngine)│    │  (Nginx SPA) │    │  (Docker)     │    │              │
│              │    │              │    │               │    │  claude.ai   │
│              │    │ OAuth 버튼 ──├───►│ /auth-url ───►├───►│  로그인      │
│              │    │              │◄───┤ /callback  ◄──┤◄───┤  (유저 본인) │
│              │    │              │    │               │    │              │
│ LLM 호출 ───├───►│              │    │ /v1/chat/  ──►├───►│  API 호출    │
│              │◄───┤              │    │ completions◄──┤◄───┤  (유저 토큰) │
└──────────────┘    └──────────────┘    └───────────────┘    └──────────────┘
```

### 왜 이 구조가 좋아?

1. **WebView 차단 우회**: Android 앱이 Chrome Custom Tab으로 웹 대시보드를 열면, 거기서 일반 브라우저로 OAuth 로그인. 프로바이더가 차단하지 않아.
2. **토큰 관리 위임**: 토큰 저장, 갱신, 암호화를 CLIProxyAPI가 다 해줘. 우리가 직접 구현할 필요 없어.
3. **OpenAI 호환 API**: `/v1/chat/completions` 엔드포인트가 OpenAI SDK 호환이라, 기존 코드를 거의 안 바꿔도 돼.
4. **멀티 프로바이더**: Claude, ChatGPT, Gemini 다 하나의 프록시로 커버.
5. **운영 비용 0**: 유저 구독으로 호출하니까 AI API 비용이 안 나와.

### 설정 예시

```yaml:config.yaml
port: 8317
host: "0.0.0.0"

api-keys:
  - "service-internal-key"

remote-management:
  secret-key: "mgmt-secret-production"

# 이게 프로덕션의 핵심!
# 이 URL로 OAuth 콜백이 직접 들어옴
oauth:
  base-url: "https://ai-proxy.myservice.com"
```

### Nginx 프록시 설정

CLIProxyAPI를 직접 노출하지 말고 Nginx 뒤에 둬.

```nginx
# OAuth 콜백 (프로바이더가 리다이렉트하는 경로)
location ~ ^/(anthropic|codex|google)/callback {
    proxy_pass http://127.0.0.1:8317;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

# Management API (프론트엔드 → 프록시)
location /v0/management/ {
    proxy_pass http://127.0.0.1:8317;
    proxy_set_header Host $host;
    proxy_set_header X-Secret-Key "mgmt-secret-production";  # 또는 프론트엔드에서 전달
}

# LLM API (앱/서버 → 프록시)
location /v1/ {
    proxy_pass http://127.0.0.1:8317;
    proxy_set_header Host $host;
    proxy_set_header Authorization $http_authorization;
    proxy_read_timeout 120s;  # SSE 스트리밍 고려
}
```

### 프론트엔드 연동 코드

```javascript
// OAuth 시작
async function connectAI(provider) {
  const providerMap = {
    claude: 'anthropic-auth-url',
    chatgpt: 'codex-auth-url',
    gemini: 'gemini-cli-auth-url',
  };
  const endpoint = providerMap[provider];

  const res = await fetch(
    `/v0/management/${endpoint}?is_webui=1`,
    { headers: { 'X-Secret-Key': MGMT_SECRET } }
  );
  const { url, state } = await res.json();

  // 새 탭으로 OAuth 로그인 페이지 열기
  const popup = window.open(url, '_blank', 'width=600,height=700');

  // 완료 폴링
  const timer = setInterval(async () => {
    if (popup.closed) {
      clearInterval(timer);
      const status = await fetch('/v0/management/get-auth-status',
        { headers: { 'X-Secret-Key': MGMT_SECRET } });
      // UI 업데이트
    }
  }, 1000);
}
```

### Android 연동

Android 앱에서는 OAuth를 직접 처리하지 않아.
웹 대시보드를 Chrome Custom Tab으로 열어서 거기서 로그인시키면 돼.

```kotlin
// OAuth는 웹에서 처리 — Chrome Custom Tab으로 대시보드 열기
val url = "https://myservice.com/#settings"  // OAuth 버튼이 있는 페이지
CustomTabsIntent.Builder().build()
    .launchUrl(context, Uri.parse(url))
```

로그인 후 LLM 호출은 CLIProxyAPI 주소로 보내면 돼.

```kotlin
// LLM 호출 시 base_url을 CLIProxyAPI로 설정
val baseUrl = "https://ai-proxy.myservice.com/v1/chat/completions"
```

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

**기억할 것**: `oauth.base-url`을 서버 도메인으로 설정하고, `?is_webui=1`로 호출하면, WebView 없이도 프로덕션에서 유저 OAuth가 동작해. Android는 Chrome Custom Tab으로 웹 대시보드를 열어서 로그인시키면 끝.
