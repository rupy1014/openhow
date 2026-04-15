---
slug: 부록-google-stitch-mcp
title: "Google Stitch MCP 설정"
nav: Stitch MCP
order: 4
---

**텍스트 프롬프트로 UI를 만들고, Claude Code에서 바로 코드로 가져오기.**

Google Stitch는 프롬프트 → UI 디자인 → HTML/CSS 코드를 생성해주는 도구다.
MCP로 연결하면 Claude Code 안에서 "로그인 페이지 만들어줘" 같은 요청으로 UI를 생성하고, 그 코드를 프로젝트에 바로 적용할 수 있다.

> 2025년 4월 기준 무료 프리뷰. GCP 빌링 활성화는 필요하지만 Stitch 자체 과금은 없다.

---

## 사전 준비

- Node.js 18+
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- Google Cloud 프로젝트 (빌링 활성화)
- [stitch.withgoogle.com](https://stitch.withgoogle.com)에서 프로젝트 1개 이상 생성

---

## 설정

### 1. gcloud 인증

```bash
gcloud auth login
gcloud config set account YOUR_EMAIL@gmail.com
gcloud config set project YOUR_PROJECT_ID
```

### 2. Stitch API 활성화

```bash
gcloud services enable stitch.googleapis.com --project=YOUR_PROJECT_ID
```

> `PERMISSION_DENIED`가 뜨면 해당 계정이 프로젝트 Owner/Editor인지 확인.

### 3. 커스텀 OAuth 프록시 설치

공식 `@_davideast/stitch-mcp proxy`에는 **치명적인 버그**가 있다:
- 프록시 시작 시 `STITCH_API_KEY`를 요구하지만
- 실제 Stitch API는 **API Key를 거부**하고 OAuth2만 허용
- 즉, 공식 프록시는 연결은 되지만 **모든 API 호출이 401로 실패**한다

해결: Stitch HTTP 엔드포인트에 직접 OAuth Bearer 토큰으로 요청하는 커스텀 MCP 프록시를 사용한다.

```bash
mkdir -p ~/.stitch-mcp
```

`~/.stitch-mcp/proxy.mjs` 파일을 생성한다:

```js
#!/usr/bin/env node
import { createInterface } from "readline";
import { execSync } from "child_process";

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "YOUR_PROJECT_ID";
const ENDPOINT = "https://stitch.googleapis.com/mcp";

let token;
try {
  token = execSync("gcloud auth print-access-token", { encoding: "utf-8" }).trim();
} catch {
  process.stderr.write("Failed to get access token\\n");
  process.exit(1);
}

let tools = [];

async function callStitch(body) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-Goog-User-Project": PROJECT,
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    try { token = execSync("gcloud auth print-access-token", { encoding: "utf-8" }).trim(); } catch { return null; }
    const retry = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}`, "X-Goog-User-Project": PROJECT }, body: JSON.stringify(body) });
    return retry.ok ? retry.json() : null;
  }
  return res.ok ? res.json() : null;
}

function respond(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\\n"); }
function respondError(id, code, message) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\\n"); }

async function handleMessage(msg) {
  const { id, method, params } = msg;
  if (method === "initialize") {
    await callStitch({ jsonrpc: "2.0", id: Date.now(), method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "stitch-oauth-proxy", version: "1.0.0" } } });
    const listRes = await callStitch({ jsonrpc: "2.0", id: Date.now(), method: "tools/list", params: {} });
    if (listRes?.result?.tools) { tools = listRes.result.tools; process.stderr.write(`[stitch] ${tools.length} tools\\n`); }
    return respond(id, { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "stitch-oauth-proxy", version: "1.0.0" } });
  }
  if (method === "notifications/initialized") return;
  if (method === "tools/list") return respond(id, { tools });
  if (method === "tools/call") {
    const res = await callStitch({ jsonrpc: "2.0", id: Date.now(), method: "tools/call", params });
    return res?.result ? respond(id, res.result) : respondError(id, -32000, "Stitch API call failed");
  }
  if (method === "ping") return respond(id, {});
  if (id) respondError(id, -32601, `Method not found: ${method}`);
}

const rl = createInterface({ input: process.stdin });
rl.on("line", async (line) => { if (!line.trim()) return; try { await handleMessage(JSON.parse(line)); } catch (e) { process.stderr.write(`[stitch] ${e.message}\\n`); } });
rl.on("close", () => process.exit(0));
```

### 4. Claude Code에 MCP 등록

```bash
claude mcp add \
  -e GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID \
  -s user \
  stitch -- node ~/.stitch-mcp/proxy.mjs
```

### 5. 확인

Claude Code 재시작 후 Stitch 도구 12개가 나타나면 성공.

---

## 토큰 갱신

- OAuth 토큰은 1시간 만료. **Claude Code를 재시작하면 자동으로 새 토큰을 발급**한다.
- 1시간 이상 연속 사용 시 401이 뜨면, 프록시가 자동으로 한 번 재발급을 시도한다.
- 그래도 실패하면 `gcloud auth login` 후 Claude Code 재시작.

---

## 사용할 수 있는 도구 (12개)

| 도구 | 설명 |
|------|------|
| `create_project` | Stitch 프로젝트 생성 |
| `generate_screen_from_text` | 텍스트 프롬프트로 UI 화면 생성 |
| `get_screen_code` | 생성된 화면의 HTML/CSS 코드 추출 |
| `extract_design_context` | 디자인 스타일(색상, 폰트 등) 추출 |
| `list_projects` / `list_screens` | Stitch 프로젝트·화면 목록 조회 |
| `build_site` | 여러 화면을 라우트 매핑해서 사이트 생성 |

---

## 실제로 뭘 할 수 있나?

**워크플로우:**

1. Claude Code에서 "대시보드 페이지 만들어줘" 요청
2. Stitch가 UI 디자인 생성
3. `get_screen_code`로 HTML/CSS 코드 추출
4. Claude Code가 프로젝트 프레임워크(React, Vue 등)에 맞게 변환·적용

**현실적인 제약:**

- Stitch 출력은 **정적 HTML/CSS**. React/Vue 컴포넌트가 바로 나오진 않는다.
- Claude Code가 프레임워크에 맞게 변환하는 추가 작업이 필요하다.
- 복잡한 인터랙션이나 상태 관리는 직접 구현해야 한다.
- 바이브 코딩의 **시작점(스캐폴딩)**으로 쓸만하고, 완성품을 기대하면 실망한다.

**결론:** 빈 화면에서 시작하는 것보단 낫다. UI 초안을 빠르게 뽑고, 거기서 편집해나가는 용도.

---

## 트러블슈팅

| 증상 | 원인 & 해결 |
|------|------------|
| `PERMISSION_DENIED` on API enable | 계정에 프로젝트 Owner/Editor 권한 없음 |
| 401: `API keys are not supported` | 공식 프록시의 버그. 커스텀 프록시(`proxy.mjs`) 사용 |
| `StitchProxy requires an API key` | 공식 프록시 사용 중. 커스텀 프록시로 전환 |
| 도구가 안 보임 | Claude Code 재시작 필요. 프록시 초기화에 몇 초 걸림 |
| `.env` 충돌 | 프로젝트 루트의 `.env`에 `GOOGLE_CLOUD_PROJECT`가 있으면 충돌 |
| 1시간 후 401 | Claude Code 재시작 (자동 토큰 갱신) |

---

## 왜 공식 프록시를 안 쓰나?

`@_davideast/stitch-mcp proxy`의 `forwardToStitch()` 함수가 **항상 `X-Goog-Api-Key` 헤더**로 인증을 보낸다.
그런데 Stitch API는 API Key를 거부하고 `Authorization: Bearer` 토큰만 허용한다.
OAuth 분기 코드가 `StitchToolClient` 클래스에는 있지만, `StitchProxy` 클래스에는 없다.
프리뷰 단계의 SDK 버그로 보이며, 향후 수정될 수 있다.
