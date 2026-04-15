---
slug: source-map
title: "소스 매핑"
nav: 소스 매핑
status: draft
draft: true
---

# 챕터별 참고 소스 매핑

> 기준 목차: [toc-final](./toc-final)

## Part 1. 코덱스로 바이브코딩 시작하기

### 01장 코덱스 설치하고 바로 실행하기
- `examples/clauders.ai/docs/입문/01-설치.md` — 설치 흐름과 최소 준비물
- `examples/clauders.ai/docs/입문/02-프로젝트설정.md` — 프로젝트 시작 장면
- `examples/clauders.ai/docs/입문/03-hello-world.md` — 첫 실행 실습 감각
- `examples/clauders.ai/docs/바이브코딩연재/04-개발-환경-세팅.md` — VS Code 세팅 보조
- `examples/clauders.ai/docs/바이브코딩연재/03-claude-code-설치하기.md` — "마법의 한 줄" 톤 참고

### 02장 AI 캐릭터 채팅 — 30분 만에 서비스 만들기
- `examples/clauders.ai/docs/바이브코딩연재/17-AI-챗봇-만들기.md` — 캐릭터 채팅 서비스 뼈대
- `examples/clauders.ai/docs/바이브코딩/02-바이브기획.md` — 기획 흐름
- `examples/clauders.ai/docs/바이브코딩연재/10-기획-뭘-만들지-정하기.md` — 기획~개발 흐름 연결
- `examples/clauders.ai/docs/완전초보/01-AI기초.md` — LLM API, 시스템 프롬프트 기본 개념
- `examples/clauders.ai/docs/완전초보/04-컨텍스트.md` — 컨텍스트 개념 (02.3 참고)

### 03장 바이브코딩 — "만들어줘"만으로는 안 되는 이유
- `examples/clauders.ai/docs/바이브코딩/02-바이브기획.md` — 기획 흐름
- `examples/clauders.ai/docs/바이브코딩/02-1-PRD작성법.md` — PRD 작성법
- `examples/clauders.ai/docs/바이브코딩/02-2-안만들것.md` — MVP 범위 자르기
- `examples/clauders.ai/docs/바이브코딩/03-레퍼런스.md` — 레퍼런스 주기의 중요성
- `examples/clauders.ai/docs/바이브코딩연재/10-기획-뭘-만들지-정하기.md` — 스코프/기획 언어
- `examples/clauders.ai/docs/바이브코딩/08-피드백.md` — 만들고→보고→고치기 루프

### 04장 배포해서 세상에 보여주기
- `examples/clauders.ai/docs/바이브코딩연재/05-git-기초.md` — Git/GitHub 입문
- `examples/clauders.ai/docs/바이브코딩/06-배포.md` — 배포 흐름
- `examples/clauders.ai/docs/바이브코딩연재/13-배포하기.md` — 링크로 공개되는 감각
- `examples/clauders.ai/docs/입문/05-비용관리.md` — 배포 비용/운영 감각

### 05장 피드백 반영하기 — 의도가 코드를 이끈다
- `examples/clauders.ai/docs/바이브코딩/08-피드백.md` — 빠른 피드백 루프
- `examples/clauders.ai/docs/바이브코딩/02-1-PRD작성법.md` — PRD 재활용
- `examples/clauders.ai/docs/바이브코딩연재/10-기획-뭘-만들지-정하기.md` — 의도 기반 개발

## Part 2. 코덱스로 콘텐츠 자동화 시작하기

### 06장 스킬과 에이전트 — 자동화의 뼈대

**핵심 레퍼런스 (에이전트 개념 + 구현):**
- `examples/clauders.ai/docs/자동화/00-4가지기능.md` — commands/agents/skills/hooks 4가지 구분표, 각각 언제 쓰는지
- `examples/clauders.ai/docs/자동화/01-작업맡기기.md` — `.claude/` 폴더 구조 전문, agent 파일 정의(model, description), `/write` 커맨드→에이전트 호출 흐름. webnovel-writer 실사례(GitHub 2000+ 스타)
- `examples/clauders.ai/docs/자동화/02-멀티에이전트.md` — 5에이전트 파이프라인 다이어그램(series-manager→outline-writer→writer→style-touch→proofreader), 팀장↔담당자 통신 패턴, 80점 품질게이트
- `examples/clauders.ai/docs/자동화/03-사례모음.md` — 5가지 오케스트레이션 패턴(체인/라우팅/병렬/지휘자/반복개선) + 각각 다이어그램, 언제 어떤 패턴 쓰는지 비교표

**보조 레퍼런스:**
- `examples/clauders.ai/docs/자동화/06-멀티툴공유설정.md` — `.agents/` 심볼릭 링크로 Codex/Copilot/Cursor 공유, AGENTS.md 표준
- `examples/clauders.ai/docs/AI로일하기/00-AI로일하기.md` — 실무 자동화 감각

### 07장 파이프라인 설계하기 — 블로그 자동화

**핵심 레퍼런스 (파이프라인 구조 + 실행):**
- `examples/clauders.ai/docs/자동화/01-작업맡기기.md` — `/write 1화` 실행 시 5단계 흐름, 에이전트 파이프라인 테이블, 품질게이트(80점 미달→재실행)
- `examples/clauders.ai/docs/자동화/02-멀티에이전트.md` — "담당자는 매번 새 메모장을 받아서 시작해" = 에이전트 분리의 이유, 시퀀스 다이어그램
- `examples/clauders.ai/docs/레시피/03-codex-orchestration.md` — Claude(지휘자)+Codex(실행자) 2인 모델, TASK/EXPECTED/MUST NOT/CONTEXT 4파트 프로토콜, JSON 상태 전달 코드블록, Phase 기반 실행(Backend→Frontend→Integration)
- `examples/clauders.ai/docs/자동화/03-사례모음.md` — 체인 패턴 상세(자기소개서 4단계), "순서를 바꾸면 안 돼" 원칙, 성공 기준 설정법

**보조 레퍼런스:**
- `examples/clauders.ai/docs/레시피/04-멀티프로젝트-오케스트레이션.md` — projects.json 레지스트리, 5가지 실행 패턴(순차/병렬/공유모듈/풀스택), Phase 격리
- `examples/clauders.ai/docs/완전초보/01-AI기초.md` — AI 모델/컨텍스트 기초
- `examples/clauders.ai/docs/완전초보/04-컨텍스트.md` — 컨텍스트 윈도우와 메모리

### 08장 뉴스봇 파이프라인 설계하기

**핵심 레퍼런스 (뉴스봇 시리즈 — 7편 전체):**
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/00-뉴스봇만들기.md` — 6단계 파이프라인 개요(수집→분류→포맷→퇴고→승인→발행), 신문사 비유, 실행 결과 터미널 출력
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/01-콘텐츠모으기.md` — RSS vs API 구분, 실제 10개 소스 URL, `npm run fetch` 실행, content/YYYY-MM-DD/ 폴더 구조
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/02-원하는것만추리기.md` — 콘텐츠 라우터(키워드→리뷰어 매칭), 3종 리뷰어(dev/product/story) 각각 출력 형식, LLM API 비용 구조($0.001~0.01/건), Skills 폴더 구조
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/03-채널에맞게다듬기.md` — 채널별 포맷 비교표(카톡/Threads/웹/Slack/이메일), 같은 기사의 채널별 변환 예시, 퇴고 규칙("번역투 제거", "마케팅 과장 삭제")
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/04-승인하고내보내기.md` — 수동 승인 체크포인트, 배포 채널 난이도표(Slack 5분~Threads 복잡), Webhook 개념, 카카오톡 4단계 셋업
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/05-매일자동으로.md` — 자동화 3단계(수동→수집만→전자동), 모델별 비용표(Gemini Flash $0.3/월~Claude Sonnet $5/월), GitHub Actions YAML 전문, cron 설명
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/06-내것으로바꾸기.md` — 파이프라인 재활용(경쟁사 모니터링/채용/논문), 3단계 변환법(소스→리뷰어→채널)

**보조 레퍼런스:**
- `backlog/자동화/27-뉴스-요약-봇-만들기.md` — 뉴스봇 초안 (구 코덱스 직접 명령 방식, 톤 참고용)
- `examples/clauders.ai/docs/자동화/05-브라우저자동화.md` — Playwright CLI vs MCP 비교, 실제 스크립트 코드블록
- `examples/clauders.ai/docs/자동화/05-5-MCP기초.md` — MCP 6대 서버(Notion/Slack/Google Drive/Brave Search/GitHub/PostgreSQL), 설치 커맨드
- `examples/clauders.ai/docs/자동화/03-사례모음.md` — 자동화 사례 확장, 패턴 조합

## Part 3. 오픈클로 — 에이전트에게 일을 맡기다

### 09장 오픈클로 설치하고 첫 대화하기

**핵심 레퍼런스:**
- `examples/clauders_book/references/openclaw-guide-extract.md` — OpenClaw 설치 흐름, 핵심 구조 6가지, 채널 연결, 코덱스 vs 오픈클로 비교
- `examples/clauders.ai/docs/웨비나/openclaw-to-kakaotalk.md` — OpenClaw 4가지 핵심 기능, 코덱스 vs 오픈클로 역할 분리 실사례
- `examples/clauders.ai/docs/AI회사/92-지금-당장-Paperclip-처음-세팅해보기.md` — 설치→첫 회사→CEO 만들기 실습 흐름

**보조 레퍼런스:**
- `backlog/자동화/29-맥미니-세팅.md` — Mac Mini 세팅 맥락 (서버 환경)
- `examples/clauders.ai/docs/AI회사/02-처음엔-어떻게-시작해.md` — 초기 세팅 순서

### 10장 워크스페이스 꾸미기 — SOUL.md, AGENTS.md, MEMORY.md

**핵심 레퍼런스:**
- `examples/clauders_book/references/openclaw-guide-extract.md` — 워크스페이스 파일 지도(AGENTS/SOUL/USER/MEMORY/STATE), 설정 파일 읽는 순서, openclaw.json
- `examples/clauders.ai/docs/웨비나/openclaw-to-kakaotalk.md` — OpenClaw 실사례, 4가지 핵심 기능

**보조 레퍼런스:**
- `examples/clauders.ai/docs/AI회사/03-멀티-에이전트는-어떻게-짜.md` — 역할 구조
- `examples/clauders.ai/docs/AI회사/04-할일과-heartbeat은-어떻게-굴러.md` — 운영 루프, heartbeat

### 11장 블로그를 오픈클로에게 맡기기
- `examples/clauders.ai/docs/AI회사/04-할일과-heartbeat은-어떻게-굴러.md` — 운영 루프
- `backlog/자동화/30-cron으로-정기-실행-만들기.md` — cron 설명
- `examples/clauders.ai/docs/바이브코딩연재/21-정기-실행.md` — 정기 실행/봇화

### 12장 뉴스봇을 오픈클로에게 맡기기
- `backlog/자동화/27-뉴스-요약-봇-만들기.md` — 뉴스봇 파이프라인
- `backlog/자동화/30-cron으로-정기-실행-만들기.md` — cron 자동화
- `examples/clauders.ai/docs/레시피/03-codex-orchestration.md` — MCP 연결 예시
- `examples/clauders.ai/docs/AI회사/03-멀티-에이전트는-어떻게-짜.md` — 멀티에이전트 비판 근거

## Part 4. 콘텐츠를 세상에 내보내기

### 13장 뉴스봇을 SNS에 자동 발행하기 — Threads·Instagram API

**핵심 레퍼런스:**
- `backlog/자동화/27-뉴스-요약-봇-만들기.md` — STEP 4-5 (발행 흐름)
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/04-승인하고내보내기.md` — 채널별 난이도표, 토큰/OAuth, 카카오톡 4단계 셋업
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/03-채널에맞게다듬기.md` — 채널별 포맷 비교표, 퇴고 규칙, 톤 변환 예시

**보조 레퍼런스:**
- `examples/clauders.ai/docs/자동화/03-사례모음.md` — SNS 자동화 사례, 오케스트레이션 패턴
- `examples/clauders.ai/docs/자동화/05-5-MCP기초.md` — MCP 6대 서버, 설치 커맨드

### 14장 자동 발행 파이프라인 완성

**핵심 레퍼런스:**
- `backlog/자동화/30-cron으로-정기-실행-만들기.md` — cron 자동화, 스크립트 준비, 로그 관리
- `examples/clauders.ai/docs/AI로일하기/01-내업무에적용하기.md` — 업무 적용 관점, 수집→정리→생성 패턴
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/06-내것으로바꾸기.md` — 파이프라인 재활용(경쟁사/논문/채용), 3단계 변환법

**보조 레퍼런스:**
- `examples/clauders.ai/docs/자동화/03-사례모음.md` — 자동화 확장 아이디어, 5가지 패턴
- `examples/clauders.ai/docs/AI로일하기/뉴스봇만들기/05-매일자동으로.md` — 자동화 3단계, 모델별 비용표, GitHub Actions YAML
