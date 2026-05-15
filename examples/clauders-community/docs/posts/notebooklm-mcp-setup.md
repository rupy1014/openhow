---
title: "NotebookLM MCP 직접 깔아본 경험"
description: "공식 docs 가 살짝 부족해서 어떻게 채워가며 깔았는지 기록. Google 계정 다중 프로필이 핵심이었다."
date: 2026-05-06
author: "taesup"
authorHandle: "@taesup"
authorBio: "리서치·자료 정리에 NotebookLM 자주 씀, MCP 로 자동화 시도 중"
tags: ["MCP", "NotebookLM", "삽질기록"]
slug: "notebooklm-mcp-setup"
---

Claude Code 에서 NotebookLM 의 노트북을 직접 조작하고 싶어서 MCP 서버를 깔았다. 공식 README 만 보고는 한 번에 안 됐다 — 어떤 부분이 어떻게 막혔는지 정리.

## 설치 자체는 쉽다

```bash
npm install -g @nlm/mcp
nlm login
```

`nlm login` 이 브라우저를 열고 Google OAuth 로 토큰을 받는다. 여기까진 무난.

## 막힌 지점: 계정 다중 프로필

평소 NotebookLM 을 **회사 워크스페이스 계정** 으로 쓰는데, 개인 계정도 같이 로그인되어 있었다. `nlm login` 이 어떤 계정을 잡는지 명시적으로 안 보여줘서 한참 헷갈렸다.

해결: `nlm login switch <profile>` 명령으로 활성 프로필을 명시적으로 바꾼다.

```bash
nlm login switch work
# 이후 MCP 호출은 work 프로필 사용
```

이걸 알기 전엔 "왜 내 노트북이 안 보이지?" 하면서 30분 날렸다.

## 막힌 지점 2: 사진 source

PDF/텍스트 source 는 잘 들어가는데, 사진 (PNG/JPG) 을 `source_add` 로 넣었더니 OCR 결과가 영 별로였다. NotebookLM 의 사진 OCR 자체 한계인 듯.

→ 결국 사진은 OCR 한 번 거쳐서 markdown 으로 변환한 다음 `source_type=text` 로 넣는 흐름으로 정착.

## 만족하는 부분

- `notebook_query` 로 RAG 질의를 코드에서 직접 호출 — 정말 빠르다.
- studio (오디오/슬라이드/인포그래픽 생성) 까지 한 줄로 트리거 가능.
- `download_artifact` 로 결과를 로컬에 떨군다 — 후속 자동화에 편하다.

## 다음에 시도할 것

- 여러 노트북에 같은 source 일괄 추가 (자동화 루프 일부로)
- `studio_revise` 로 슬라이드 일부만 수정해서 deck 재생산
