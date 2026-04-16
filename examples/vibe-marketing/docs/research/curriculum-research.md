---
slug: curriculum-research
title: 바이브 마케팅 커리큘럼 리서치 노트
status: published
tags: [리서치, 소스맵, AI마케팅]
---

*리서치 기준일: 2026-04-15*

# 바이브 마케팅 커리큘럼 리서치 노트

> 이 문서는 공식 자료와 로컬 사례 문서를 함께 읽고, 왜 이 커리큘럼이 이런 순서로 배치되어 있는지 정리한 노트다.

---

## 1. 왜 이 커리큘럼은 첫 팬과 바이럴에서 시작하나

많은 AI 마케팅 자료는 도구, 채널, 자동화부터 설명한다.
하지만 실제 현장에서는 보통 아래 질문이 먼저 나온다.

- 초기 1,000명의 충성고객은 어떻게 모으는가
- 바이럴은 어떻게 구조로 설계하는가
- 제품 데모는 왜 마케팅 자산이 되는가

즉,
학습의 출발점은 "AI 마케팅 정의"보다
**어떻게 첫 팬을 만들고, 어떻게 공유와 루프를 만들 것인가**에 더 가깝다.

---

## 2. 1,000 true fans는 여전히 강한 출발점이다

### 외부 소스
Kevin Kelly의 "1,000 True Fans"는
대중적 히트보다 깊은 팬층을 먼저 확보하는 모델을 제시한다.

### 사례 문서
`examples/clauders.ai/docs/바이브코딩/08-1-PMF찾기.md`는 이 관점을 더 실무적으로 풀어 쓴다.

중요한 문장:
- "1,000명의 진짜 팬만 있으면 먹고살 수 있다"
- "100만 명이 한 번 써보는 서비스보다 1,000명이 매일 쓰는 서비스"

### 커리큘럼 반영
그래서 EP01을
"AI란 무엇인가"가 아니라
**1,000명의 진짜 팬부터 시작하기**로 둔다.

---

## 3. Build in Public은 유통 전략이다

### 사례 문서
같은 문서(`바이브코딩/08-1-PMF찾기.md`)는
"만드는 과정을 공유하는 것 자체가 마케팅"이라고 정리한다.

### 의미
초기 제품에는 광고 예산보다
- 만드는 과정 공개
- 기능 개선 로그
- 실패와 수정 공유
- 사용자 반응 재공유
가 더 강한 유통 채널이 될 수 있다.

### 커리큘럼 반영
그래서 Build in Public을 부록처럼 두지 않고
EP04로 앞단에 배치한다.

---

## 4. 바이럴은 buzz가 아니라 구조다

### 외부 소스
Andrew Chen은 virality를
제품 안에 내장된 invite/share/collaboration 구조와 retention의 문제로 본다.

### 의미
"바이럴이 터졌으면 좋겠다"보다 먼저 봐야 하는 건 아래다.
- 초대하면 제품 가치가 커지는가
- 공유하면 상대도 써볼 이유가 생기는가
- 리텐션이 바이럴을 밀어주는 구조인가

### 커리큘럼 반영
그래서 EP03을
**바이럴은 기대하지 말고 설계하기**로 두고,
콘텐츠 파트에는 EP25 **공유를 부르는 기능과 콘텐츠 포맷**을 둔다.

---

## 5. OpenClaw 같은 리얼 스토리는 이론보다 강하다

### 사례 문서
- `examples/clauders.ai/docs/웨비나/openclaw-to-kakaotalk.md`
- `examples/openclaw/docs/활용/04-개발자사례.md`

### 왜 강한 사례인가
OpenClaw 문맥은 아래를 동시에 보여준다.

1. 설명이 쉽다
2. 데모 장면이 강하다
3. 공유 포인트가 있다
4. QA, 오버스펙 MVP, 런칭 지연 같은 현실 문제도 함께 있다

### 커리큘럼 반영
그래서 EP05를 OpenClaw형 데모 스토리 해부로 두고,
초반 학습 구간 전체를 "리얼 케이스 → 구조 이해" 흐름으로 잡았다.

---

## 6. 공식 자료는 뼈대를 잡는 역할을 한다

스토리만으로는 커리큘럼이 쉽게 흩어진다.
그래서 공식 자료는 계속 뼈대를 잡는 역할로 남긴다.

- [HS], [GG] → AI literacy / prompting / responsible use
- [MAI] → 팀 정책, roadmap, council, training
- [GS] → search/answer-engine 변화
- [RDT] → 커뮤니티가 discovery와 trust에 미치는 영향
- [PMA] → research, positioning, content, enablement 연결
- [GH] → growth 실험 루프 감각

---

## 7. 전체 설계 결론

이 커리큘럼의 전체 흐름은 아래와 같다.

```text
첫 1,000명의 팬
→ Build in Public
→ 바이럴 구조 설계
→ 질문/커뮤니티 리서치
→ 포지셔닝/메시지
→ 콘텐츠 시스템
→ CRM/자동화
→ 측정/운영
→ 90일 실행 로드맵
```

이 순서면
사용자는 먼저 와닿는 문제와 장면을 이해하고,
그 다음 운영 체계까지 단계적으로 올라갈 수 있다.

---

## 8. 본문과 운영 레이어 구성

이 프로젝트는 본문만 있는 문서 묶음이 아니라,
실행을 위한 운영 레이어도 같이 갖고 있다.

### 본문
- `바이브마케팅/01~32`

### 운영 레이어
- `briefs/` : 역할별 실행 브리프와 30일 실행팩
- `templates/` : 질문 백로그, 포지셔닝, 재가공, 90일 로드맵 템플릿
- `rules/` : 집필, 커뮤니티 참여, AI 검수 규칙
- `lanes/` : Founder / In-house / B2B용 학습 동선
- `drafts/` : Build in Public, FAQ 랜딩, 비교표, 메일, 실험 로그 샘플 초안

즉 이 커리큘럼은 읽기용 설명과 실행용 운영 문서를 함께 가진 구조다.

---

## 출처

### 외부 소스
- Kevin Kelly — The Technium / 1,000 True Fans 계열 글  
  https://kk.org/thetechnium/
- Andrew Chen — Why the best way to drive viral growth is to increase retention and engagement  
  https://andrewchen.com/more-retention-more-viral-growth/
- Andrew Chen — The Cold Start Problem  
  https://andrewchen.com/chapter-one-cold-start/
- HubSpot Academy — AI for Marketers  
  https://academy.hubspot.com/courses/AI-for-Marketers
- Google AI Essentials  
  https://www.grow.google/ai-essentials/
- Google AI Boost Bites  
  https://business.google.com/en-all/think/ai-excellence/boost-bites-ai-training-videos/
- Google Search — AI Mode  
  https://blog.google/products-and-platforms/products/search/ai-mode-search/
- 2025 State of Marketing AI Report  
  https://www.marketingaiinstitute.com/2025-state-of-marketing-ai-report
- Reddit Pro / Reddit in HubSpot  
  https://www.business.reddit.com/blog/reddit-pro-is-here
  https://www.business.reddit.com/blog/reddit-in-hubspot

### 사례 문서
- `examples/clauders.ai/docs/바이브코딩/08-1-PMF찾기.md`
- `examples/clauders.ai/docs/웨비나/openclaw-to-kakaotalk.md`
- `examples/openclaw/docs/활용/04-개발자사례.md`
