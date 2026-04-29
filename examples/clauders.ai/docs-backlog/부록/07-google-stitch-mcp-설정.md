---
slug: 부록-google-stitch-mcp
title: "Google Stitch MCP 설정"
nav: Stitch MCP
order: 4
---

**"로그인 페이지 만들어줘" — Claude Code 안에서 UI가 바로 나와.**

Google Stitch는 프롬프트 → UI 디자인 → HTML/CSS를 생성하는 도구야.
MCP로 연결하면 Claude Code에서 바로 쓸 수 있어.

> 2025년 4월 기준 무료 프리뷰. GCP 빌링 활성화는 필요하지만 Stitch 과금은 없어.

---

## 왜 Stitch냐

빈 화면에서 시작하면 느려. UI 초안을 먼저 뽑고 거기서 편집하는 게 훨씬 빨라.

| 방법 | 뭐가 나와 |
|------|----------|
| Claude Code만 | 코드만 — 화면을 머릿속으로 그려야 해 |
| Stitch + Claude Code | **디자인 + 코드** — 보면서 수정할 수 있어 |

Stitch가 HTML/CSS 초안을 뽑으면, Claude Code가 React/Vue 등 프레임워크에 맞게 변환해줘.

---

## 뭘 할 수 있냐

1. Claude Code에서 "대시보드 페이지 만들어줘" 요청
2. Stitch가 UI 디자인 생성
3. `get_screen_code`로 HTML/CSS 코드 추출
4. Claude Code가 프로젝트 프레임워크에 맞게 변환·적용

| 도구 | 설명 |
|------|------|
| `create_project` | Stitch 프로젝트 생성 |
| `generate_screen_from_text` | 텍스트 프롬프트로 UI 화면 생성 |
| `get_screen_code` | 생성된 화면의 HTML/CSS 코드 추출 |
| `extract_design_context` | 디자인 스타일(색상, 폰트 등) 추출 |
| `list_projects` / `list_screens` | 프로젝트·화면 목록 조회 |
| `build_site` | 여러 화면을 라우트 매핑해서 사이트 생성 |

총 12개 도구가 설치돼.

---

## 현실적인 제약

솔직히 말할게.

- Stitch 출력은 **정적 HTML/CSS**야. React/Vue 컴포넌트가 바로 나오진 않아.
- 복잡한 인터랙션이나 상태 관리는 직접 구현해야 해.
- 바이브 코딩의 **시작점(스캐폴딩)**으로 쓸만하고, 완성품을 기대하면 실망해.

---

## 어떻게 깔아

아래 복사 버튼 누르고 Claude Code에 붙여넣으면 gcloud 인증부터 MCP 등록까지 한 번에 돼.

:::copy-embed _embeds/setup-stitch-mcp Google Stitch MCP 설정 프롬프트
:::

### 사전 준비

- Node.js 18+
- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- Google Cloud 프로젝트 (빌링 활성화)
- [stitch.withgoogle.com](https://stitch.withgoogle.com)에서 프로젝트 1개 이상 생성

---

## 트러블슈팅

| 증상 | 해결 |
|------|------|
| `PERMISSION_DENIED` | 계정에 프로젝트 Owner/Editor 권한 필요 |
| 401 에러 | Claude Code 재시작 (OAuth 토큰 1시간 만료) |
| 도구가 안 보여 | Claude Code 재시작. 프록시 초기화에 몇 초 걸려 |

:::tip 왜 공식 프록시를 안 쓰냐
`@_davideast/stitch-mcp proxy`는 API Key 인증을 쓰는데, Stitch API는 OAuth2만 허용해. 그래서 모든 호출이 401로 실패해. 위 설정 프롬프트의 커스텀 프록시가 이걸 해결해.
:::

---

## 한 줄 정리

텍스트로 UI 초안을 뽑고 Claude Code가 프레임워크에 맞게 변환해. 빈 화면에서 시작하는 것보단 훨씬 빨라.
