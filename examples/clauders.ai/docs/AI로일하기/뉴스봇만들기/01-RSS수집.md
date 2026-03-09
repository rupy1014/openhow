---
slug: 뉴스봇만들기-시작하기
title: "시작하기"
nav: 시작하기
order: 1
---

**프로젝트 받고, Claude Code 열고, `/workflow` 치면 끝이야.**

5분이면 돌아가.

---

## Step 1. 프로젝트 받기

```bash
git clone https://github.com/rupy1014/max5.ai.git
cd max5.ai
npm install
```

:::info git clone이 뭐야?
다른 사람이 만든 프로젝트를 내 컴퓨터에 복사하는 거야. GitHub에 올라가 있는 코드를 그대로 가져와.
:::

---

## Step 2. Claude Code 열기

```bash
claude
```

프로젝트 폴더에서 Claude Code를 열면, 이 프로젝트의 구조를 자동으로 이해해. `CLAUDE.md`라는 파일에 프로젝트 설명이 다 적혀 있거든.

---

## Step 3. /workflow 실행

```
/workflow
```

이러면 이런 일이 벌어져:

```
📡 1단계: RSS 수집
  [hacker-news] 15개 확인 → 3개 신규
  [hackernoon] 10개 확인 → 2개 신규
  [marktechpost] 10개 확인 → 4개 신규
  ...
✅ 수집 완료 (9개 신규)

🤖 2단계: AI 리뷰 생성
  hacker-news-agent-safehouse.md → dev_reviewer → ✅ 생성 완료
  hackernoon-ai-startups.md → story_reviewer → ✅ 생성 완료
  ...

✍️ 3단계: 퇴고
  번역투 제거, 반말체 확인, 태그/카테고리 점검
  ✅ 퇴고 완료
```

`content-workflow/` 폴더에 한국어 리뷰가 생성돼 있어.

---

## Step 4. 결과 확인

로컬에서 바로 볼 수 있어:

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`을 열면 리뷰가 바로 보여. Supabase(DB) 없이도 로컬 파일로 먼저 보여주거든.

---

## 내부에서 무슨 일이 벌어지냐

알 필요는 없지만, 궁금하면:

```
max5.ai/
├── scripts/fetch-all.js        ← RSS 10개 소스에서 수집
├── .agent/skills/              ← AI 리뷰어 프롬프트 3종
│   ├── dev_reviewer/           ← 개발 도구 리뷰 (설치법, 활용 프롬프트)
│   ├── product_reviewer/       ← 서비스 리뷰 (사용 팁, 비즈 기회)
│   └── story_reviewer/         ← 성공 사례 리뷰 (핵심 교훈, 적용법)
├── content/날짜/               ← 수집된 원문
└── content-workflow/           ← AI가 만든 한국어 리뷰
```

`/workflow` 명령이 이걸 순서대로 실행하는 거야:

1. `fetch-all.js`로 RSS 수집
2. 원문을 읽고 유형별 리뷰어로 한국어 리뷰 생성
3. 퇴고 규칙 적용 (번역투 제거, 마케팅 문구 삭제)

코드를 이해할 필요 없어. `/workflow` 치면 알아서 돌아가니까.

---

## 한 줄 정리

클론 → Claude Code → `/workflow`. 3단계면 뉴스봇이 돌아가.
