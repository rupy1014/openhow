---
slug: 09-outline
title: "09장 개요"
nav: 09장 개요
status: draft
draft: true
---

# 09장 개요 — OpenClaw 설치하고 첫 대화 나누기

## 장의 역할
독자가 OpenClaw를 직접 설치하고, 텔레그램으로 첫 메시지를 주고받는 hands-on 챕터다.
Part 1-2에서 만든 자동화 조각들에 "코디네이터"를 붙이는 첫 단계.

## 독자가 읽고 남겨야 할 변화
- OpenClaw가 내 컴퓨터에서 돌아가고 있다.
- 텔레그램으로 메시지를 보내면 AI가 대답하는 걸 직접 확인했다.
- "이걸로 자동화를 연결할 수 있겠구나"라는 감각이 생겼다.

## 핵심 메시지
- 자동화 스크립트는 직원, OpenClaw는 사무실 매니저다.
- 매니저가 있어야 누가 언제 무엇을 할지 정리된다.
- 설치는 어렵지 않다 — 10분이면 첫 메시지를 보낼 수 있다.

## 소단원별 전개

### 09.1 AI 비서는 왜 따로 필요한 걸까
- Part 1-2 요약: 스크립트도 만들고, 서비스도 배포했다. 그런데 누가 이걸 묶어서 관리하지?
- 비유: 스크립트 = 직원들, OpenClaw = 사무실 매니저
- Codex/Claude Code는 "일을 시키는 도구", OpenClaw는 "일이 돌아가게 관리하는 시스템"

### 09.2 OpenClaw 설치하기
- macOS 기준 happy path: `brew install openclaw` → `openclaw onboard` → `openclaw doctor`
- 설정 파일 기초: `~/.openclaw/openclaw.json`, 모델 선택
- Gateway 시작: `openclaw gateway` — "어? 뭔가 돌아가기 시작했다"
- Windows/Linux 독자는 공식 문서 안내 (박스)

### 09.3 채널 하나 연결하고 메시지 보내기
- 텔레그램 봇 만들기: BotFather에서 토큰 발급 (5분)
- `openclaw channels login telegram`
- 첫 메시지: "안녕, 비서님" → AI 응답 확인
- "어? 진짜 대답하네" 모먼트

### 09.4 이게 왜 자동화의 시작점인가
- 지금은 단순 채팅이지만, 여기에 cron, 스킬, standing orders가 붙으면 자동화 시스템이 된다.
- 다음 장 미리보기: OpenClaw의 구조를 읽으면 자동화 설계가 보인다.

## 꼭 넣을 장면 / 사례 / 실습
- 터미널에서 `openclaw onboard`를 치는 장면
- 텔레그램에서 첫 메시지를 보내고 응답 받는 스크린샷
- "이게 자동화랑 무슨 상관이야?"라는 의문 → 09.4에서 해소

## 참고 소스
- OpenClaw 가이드 PDF (chapters 6-10: 설치, 14: 첫 성공 경험)
- `backlog/자동화/29-맥미니-세팅.md`
- `backlog/자동화/28-AI-비서는-어떻게-만들어졌을까.md`
