---
slug: 뉴스봇만들기-시작하기
title: "시작하기"
nav: 시작하기
order: 1
---

**3번 딸깍이면 뉴스봇이 돌아가.**

---

## 딸깍 1. 프로젝트 받기

[max5-clone.zip 다운로드 (Google Drive)](https://drive.google.com/file/d/TODO/view?usp=sharing)

```bash
unzip max5-clone.zip
cd max5-clone
npm install
```

다운로드 → 압축 풀기 → npm install. 이 세 줄이면 끝이야.

---

## 딸깍 2. Claude Code 열기

```bash
claude
```

이 프로젝트 폴더에서 Claude Code를 열면, AI가 프로젝트 구조를 자동으로 이해해. `CLAUDE.md`라는 파일에 "이 프로젝트는 뭐고, 뭘 해야 하는지"가 다 적혀 있거든.

그래서 네가 설명할 필요 없이, 명령만 치면 돼.

---

## 딸깍 3. /workflow 실행

```
/workflow
```

이러면:

```
📡 1단계: RSS 수집
  [hacker-news] 15개 확인 → 3개 신규
  [hackernoon] 10개 확인 → 2개 신규
  [marktechpost] 10개 확인 → 4개 신규
  ...
✅ 수집 완료 (9개 신규)

🤖 2단계: AI 리뷰 생성
  hacker-news-agent-safehouse.md → dev_reviewer → ✅ 생성
  hackernoon-ai-startups.md → story_reviewer → ✅ 생성
  ...

✍️ 3단계: 퇴고
  번역투 제거, 반말체 확인, 태그/카테고리 점검
  ✅ 퇴고 완료
```

끝. `content-workflow/` 폴더에 한국어 리뷰가 만들어져 있어.

---

## 결과 확인도 딸깍

```bash
npm run dev
```

브라우저에서 열리는 주소(`http://localhost:3000` 또는 자동 선택된 포트)를 열면 리뷰가 바로 보여.

DB 설정? 서버 설정? 필요 없어. 로컬 파일을 바로 읽어서 보여주거든.

---

## 안에서 무슨 일이 벌어졌냐

궁금하면. 안 궁금하면 넘어가.

`/workflow`가 실행한 3단계:

| 단계 | 뭘 했냐 | 결과 |
|------|---------|------|
| 수집 | Hacker News, HackerNoon 등 10개 소스에서 RSS 긁기 | `content/오늘날짜/` 폴더에 원문 저장 |
| 리뷰 | 원문 유형 판별 → 맞는 리뷰어가 한국어 리뷰 작성 | `content-workflow/` 폴더에 리뷰 저장 |
| 퇴고 | 번역투 제거, 마케팅 문구 삭제, 톤 맞춤 | 같은 파일 수정 |

리뷰어는 3종류야:

| 원문 유형 | 리뷰어 | 뭘 쓰냐 |
|----------|--------|---------|
| GitHub/오픈소스 | `dev_reviewer` | 설치법, 활용 프롬프트, 바이브 코딩 레시피 |
| 서비스/SaaS 출시 | `product_reviewer` | 사용 팁, 가격, 비즈니스 기회 |
| 뉴스/성공 사례 | `story_reviewer` | 핵심 교훈, 타임라인, 적용법 |

유형 판별도 AI가 자동으로 해. 키워드를 보고 "이건 개발 도구니까 dev_reviewer로 보내자" 이런 식.

---

## 한 줄 정리

clone → claude → `/workflow`. 3번 딸깍이면 뉴스봇 완성.
