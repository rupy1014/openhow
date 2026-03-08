---
slug: 뉴스봇만들기-RSS수집
title: "RSS 수집"
nav: RSS 수집
order: 1
---

**RSS 피드 주소만 알면, 뉴스를 자동으로 긁어올 수 있어.**

MAX5에서는 10개 소스에서 매일 뉴스를 수집해. 스크립트 하나로.

---

## RSS가 뭐냐?

뉴스레터 구독이랑 비슷해.

블로그에 새 글이 올라오면, RSS 피드라는 주소에 목록이 자동으로 올라와. 이 주소를 프로그램에 넣으면, 사이트에 직접 안 가도 새 글을 가져올 수 있어.

뉴스레터는 이메일로 오잖아. RSS는 프로그램이 직접 가져가는 거야.

---

## 어떻게 만드냐?

**Step 1.** 프로젝트 폴더를 만들어

```bash
mkdir news-bot && cd news-bot
npm init -y
claude
```

:::info npm이 뭐야?
Node.js의 프로그램 설치 도구야. `npm init -y`는 "이 폴더를 프로젝트로 만들어줘"라는 뜻이야. 한 번만 하면 돼.
:::

**Step 2.** AI한테 수집 스크립트를 시켜

스크립트는 컴퓨터가 순서대로 실행하는 명령어 모음이야. 레시피 같은 거야.

```
> RSS 피드를 읽어서 마크다운으로 저장하는 스크립트 만들어줘.
>
> 소스 목록:
> - hacker-news: https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=15
> - marktechpost: https://www.marktechpost.com/feed/
> - hackernoon: https://hackernoon.com/feed
>
> 각 뉴스에서 제목, 링크, 날짜를 뽑고,
> 링크를 따라가서 본문도 가져와서 마크다운으로 변환해줘.
> content/오늘날짜/ 폴더에 저장.
> 이미 같은 파일 있으면 스킵.
```

Claude가 스크립트를 만들면서 필요한 패키지도 같이 설치해줄 거야. `npm install` 명령어가 자동으로 실행되면서 필요한 도구들이 깔려.

:::info 패키지가 뭐야?
다른 사람이 만들어둔 프로그램 조각이야. "RSS를 읽는 도구", "HTML에서 본문만 뽑는 도구" 같은 게 이미 만들어져 있어. 설치만 하면 바로 쓸 수 있어.
:::

MAX5의 `fetch-all.js`가 정확히 이 구조야:

```javascript
// 소스 정의 — 어디서 긁을지 목록
const SOURCES = {
  'hacker-news': {
    type: 'hackernews',
    url: 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=15',
  },
  'marktechpost': {
    type: 'rss',
    url: 'https://www.marktechpost.com/feed/',
  },
};

// 소스별로 돌면서 수집 → 마크다운 저장
for (const name of sourcesToFetch) {
  if (source.type === 'hackernews') {
    items = await fetchHackerNews(source, mdDir, today);
  } else {
    items = await fetchRSS(name, source, mdDir, today);
  }
}
```

코드를 이해할 필요 없어. 구조만 봐. "소스를 정의하고, 하나씩 돌면서 가져온다." 이게 전부야.

**Step 3.** 실행해봐

```bash
node scripts/fetch-all.js
```

```
[hacker-news]
  [HN] Claude Code adds multi-agent... ✓ 3842 chars
  [HN] The Unix Pipe Card Game... ✓ 1893 chars
[marktechpost]
  [marktechpost] Microsoft releases... ✓ 4521 chars

→ Markdown: content/2025-03-08/
```

`content/2025-03-08/` 폴더를 열면 뉴스가 마크다운 파일로 저장돼 있어.

파일 이름은 `소스이름-제목.md` 형식이야:

```
content/2025-03-08/
├── hacker-news-claude-code-adds-multi-agent.md
├── hacker-news-the-unix-pipe-card-game.md
└── marktechpost-microsoft-releases.md
```

이 파일들이 다음 단계(필터링 + AI 리뷰)의 입력이 돼.

---

## 소스 추가는 한 줄이면 돼

```
> SOURCES에 GeekNews 추가해줘. URL은 https://news.hada.io/rss
```

경쟁사 블로그도 마찬가지야:

```
> 경쟁사 블로그 추가해줘. URL은 https://competitor.com/blog/feed
```

---

## 본문 추출이 핵심이야

RSS에는 보통 제목과 링크만 있어. 본문은 URL에 가서 직접 긁어와야 해.

MAX5에서는 두 가지 방법을 조합해:

1. RSS에 본문이 포함돼 있으면 그걸 먼저 써
2. 없거나 짧으면 URL에 직접 가서 긁어와

```
> 외부 URL에서 본문을 추출하는 기능 추가해줘.
> HTML에서 본문만 뽑고, 마크다운으로 변환해.
> 본문이 500자 미만이면 품질 낮으니까 스킵.
```

:::info HTML이 뭐야?
웹페이지를 만드는 코드야. 브라우저가 이걸 읽어서 화면에 보여줘. 본문 추출은 이 코드에서 글 내용만 골라내는 거야.
:::

---

## 한 줄 정리

소스 정의하고, 수집 스크립트 실행하면 뉴스가 마크다운으로 쌓여. 다음은 이걸 필터링하고 AI로 리뷰를 만드는 거야.
