---
slug: more/browser-automation
title: 브라우저 자동화
nav: 브라우저 자동화
description: '로그인·스크린샷·데이터 긁기 같은 반복 브라우저 작업을 Claude Code에 맡기는 방법을 MCP vs CLI(Playwright) 비교와 함께 정리한 문서다.'
thumbnail: /__content__/images/img-AT05.png
hook: '브라우저를 열고, 클릭하고, 입력하고, 스크린샷까지. 프롬프트 한 줄로 끝나요.'
status: 출시
tags: [더보기, browser, playwright, mcp, cli]
access: public
---

# 브라우저 자동화

> **예상 시간**: 글 10분 + 따라하기 15분
> **바이브 4단계**: Build
> **이번 강의 끝나면**
> - 브라우저 자동화의 **두 가지 방식**(MCP vs CLI)이 구분된다
> - 왜 대부분의 경우 **CLI(Playwright)가 낫다**는 결론이 나는지 안다
> - 프롬프트 한 줄로 사이트 열고 **스크린샷 찍는** 경험이 손에 남는다
>
> **인증물**: Claude가 찍어준 `screenshot.png` 1장

## 핵심 요약

**Claude Code한테 "이 사이트 열어서 스크린샷 찍어와" 하면 진짜로 해요.**

손으로 매일 반복하는 브라우저 작업 — 로그인, 데이터 긁기, 폼 제출, 스크린샷. 이걸 프롬프트 한 줄로 끝낼 수 있어요. 방식이 두 개인데 **대부분 CLI(Playwright)로 충분해요.**

- **MCP 방식** — 클릭 하나마다 Claude가 왕복. 토큰 많이 먹어요
- **CLI 방식** — 스크립트 한 번 짜서 한 방에 실행. 빠르고 싸
- **결론** — `npm install playwright` 한 줄이면 시작

## 1. 두 가지 방법이 있어요

| | MCP 방식 | CLI 방식 |
|--|---------|---------|
| 원리 | 클릭 하나마다 Claude가 도구 호출 | 스크립트 하나를 짜서 한 번에 실행 |
| 토큰 | 많이 먹어 (동작마다 왕복) | 적게 먹어 (한 번에 끝) |
| 설치 | `claude mcp add ...` | `npm install playwright` |
| 장점 | 화면 보면서 대화형 조작 | 빠르고, 안정적이고, 저렴해 |

**MCP**는 Claude가 매 클릭마다 "클릭했어 → 결과 봤어 → 다음 뭐 하지"를 반복해요. 동작 10개면 왕복 10번. 토큰이 쌓여요.

**CLI**는 Claude가 스크립트를 한 번 짜고, `node`로 한 번 실행해요. 동작 10개든 100개든 토큰은 비슷해요.

**결론: CLI가 나아.** 대부분의 브라우저 자동화는 CLI로 충분해요.

## 2. 어떻게 설치하나요?

### Step 1. Playwright 설치

프로젝트 폴더에서 실행해요.

```bash
npm install playwright
```

끝. 이게 전부예요.

### Step 2. Claude Code한테 시켜봐요

```
playwright로 naver.com 열어서 스크린샷 찍어줘.
스크립트 짜서 node로 실행해.
```

Claude가 하는 일:

1. Playwright 스크립트를 작성해요
2. `node`로 실행해요
3. 스크린샷 파일을 저장해요
4. 결과를 보여줘

## 3. 실전 예시 — 네이버 로그인

```
playwright로 네이버 로그인하는 스크립트 만들어서 실행해줘.
아이디: myid123
비밀번호: mypass456
로그인 후 스크린샷 찍어서 보여줘.
```

Claude가 이런 스크립트를 만들어:

```javascript
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://nid.naver.com/nidlogin.login');
  await page.fill('#id', 'myid123');
  await page.fill('#pw', 'mypass456');
  await page.click('.btn_login');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'result.png' });
  await browser.close();
})();
```

그리고 `node script.js`로 한 번에 실행해요. MCP였으면 동작마다 왕복했을 걸, CLI는 한 방에 끝나요.

> 캡챠(보안 문자)가 뜰 수 있어요. 자동 로그인을 막는 거라 정상이에요. 중요한 건 **Claude가 브라우저를 직접 조작한다**는 거예요.

## 4. 뭘 시킬 수 있나요?

로그인은 맛보기예요. 진짜 쓸모는 이런 거다:

```
이 URL 열어서 페이지 전체 스크린샷 찍어줘.
```

```
내 블로그 들어가서 최근 글 제목 5개를 긁어와.
```

```
localhost:3000 열어서 버튼 클릭이 제대로 동작하는지 확인해.
```

```
이 사이트 열어서 폼에 데이터 넣고 제출해줘.
```

브라우저로 할 수 있는 건 다 시킬 수 있어요. 손으로 마우스 클릭하던 반복 작업이 프롬프트 한 줄로 끝나요.

## 5. MCP는 언제 쓰나요?

CLI가 대부분 낫지만, MCP가 맞는 경우도 있어:

- **화면을 보면서 판단해야 할 때** — "이 버튼이 빨간색이면 클릭, 아니면 스킵" 같은 조건부 조작
- **매 단계 확인이 필요할 때** — 한 번에 스크립트로 못 짤 만큼 복잡한 흐름

근데 이런 경우는 드물어요. 90%는 CLI로 충분해요.

## 자주 헷갈리는 포인트

- **Playwright 설치에서 에러가 나** — `npm install playwright` 뒤에 `npx playwright install chromium`을 한 번 더 쳐야 브라우저가 깔리는 경우가 있어요. Claude한테 에러 메시지 그대로 넘기면 자동으로 고쳐줘요.
- **로그인 정보를 코드에 박아도 되나요?** — 연습용이면 괜찮아요. 실제 계정 자동화엔 `.env` 파일에 넣고 `process.env.XXX`로 읽게 해요. 이것도 Claude한테 시키면 알아서 분리해줘요.
