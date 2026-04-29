---
hidden: true
---

# Google Stitch MCP 설정 프롬프트

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣어.

---

=== 여기서부터 복사 ===

Google Stitch MCP를 설치해줘. 아래 순서대로 진행해.

## 1. gcloud 인증 확인

gcloud CLI가 설치돼 있는지 확인하고, 로그인 상태인지 봐줘.

```bash
gcloud auth print-access-token
```

토큰이 나오면 OK. 안 되면 사용자한테 `gcloud auth login`을 안내해.

## 2. Stitch API 활성화

```bash
gcloud services enable stitch.googleapis.com --project=$(gcloud config get-value project)
```

`PERMISSION_DENIED`가 뜨면 프로젝트 Owner/Editor 권한이 필요하다고 안내해.

## 3. 커스텀 OAuth 프록시 설치

공식 프록시(`@_davideast/stitch-mcp proxy`)는 API Key 인증을 쓰는데, Stitch API는 OAuth2만 허용해서 모든 호출이 401로 실패해. 그래서 커스텀 프록시를 써야 해.

`~/.stitch-mcp/proxy.mjs` 파일을 만들어줘:

```js
#!/usr/bin/env node
import { createInterface } from "readline";
import { execSync } from "child_process";

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || execSync("gcloud config get-value project", { encoding: "utf-8" }).trim();
const ENDPOINT = "https://stitch.googleapis.com/mcp";

let token;
try {
  token = execSync("gcloud auth print-access-token", { encoding: "utf-8" }).trim();
} catch {
  process.stderr.write("Failed to get access token\n");
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

function respond(id, result) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n"); }
function respondError(id, code, message) { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n"); }

async function handleMessage(msg) {
  const { id, method, params } = msg;
  if (method === "initialize") {
    await callStitch({ jsonrpc: "2.0", id: Date.now(), method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "stitch-oauth-proxy", version: "1.0.0" } } });
    const listRes = await callStitch({ jsonrpc: "2.0", id: Date.now(), method: "tools/list", params: {} });
    if (listRes?.result?.tools) { tools = listRes.result.tools; process.stderr.write(`[stitch] ${tools.length} tools\n`); }
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
rl.on("line", async (line) => { if (!line.trim()) return; try { await handleMessage(JSON.parse(line)); } catch (e) { process.stderr.write(`[stitch] ${e.message}\n`); } });
rl.on("close", () => process.exit(0));
```

## 4. Claude Code에 MCP 등록

```bash
claude mcp add \
  -e GOOGLE_CLOUD_PROJECT=$(gcloud config get-value project) \
  -s user \
  stitch -- node ~/.stitch-mcp/proxy.mjs
```

## 5. 확인

Claude Code를 재시작하고, Stitch 도구가 보이는지 확인해줘. `create_project`, `generate_screen_from_text`, `get_screen_code` 등 12개 도구가 나타나면 성공이야.

설치 결과를 알려줘:
1. gcloud 인증 상태
2. Stitch API 활성화 여부
3. 프록시 파일 생성 결과
4. MCP 등록 결과

=== 여기까지 복사 ===
