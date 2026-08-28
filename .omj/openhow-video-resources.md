---
status: done
created: 2026-08-14
updated: 2026-08-28
iteration: 2
---

# 오픈하우 더 보기의 Codex 비용·계정 관리 자료

## Why

사용자 발화 (2026-08-14):

> "오케이 이제 영상자료 메뉴를 하나 만들어서 거기에 내가 유튜브에 올리는걸 추가하도록 하자. ... 요런 내용의 대본 추가해주고, 참조할 스킬은 복붙 가능하도록 ... codex-auth 이걸로 구성해줘. 다운로드 가능한 zip 형태여도 좋고. github 처럼 코드를 선택해서 볼수있도록 구현해줘도 좋고. 개선좀해봐."

오픈하우의 `더 보기`에서 개인 유튜브 자료를 보완하고, 영상에서 소개한 실사용 파일을 바로 가져갈 수 있게 한다.

## What

- [validated] `더 보기`에 Codex 비용·계정 관리 문서를 추가한다. → **metric: 로컬 내비게이션의 `더 보기`에서 문서로 이동한다**
- [validated] Codex 계정 슬롯 영상의 핵심 내용과 원본 대본을 제공한다. → **metric: 설명 페이지와 대본 원문 다운로드가 모두 HTTP 200으로 열린다**
- [validated] `codex-auth` 원본 스킬을 복사·설치하기 쉽게 제공한다. → **metric: Codex/Claude Code 설치 탭, AI 설치용 copy-embed, 원본 전체 ZIP이 존재하고 selftest가 통과한다**
- [validated] 공개된 YouTube 영상을 첫 영상 자료에 연결한다. → **metric: 문서에 `fsmEm3_Tb4M` YouTube 임베드와 직접 링크가 모두 존재한다**

## Not

- `core/packages/viewer`의 신규 UI 컴포넌트 — 기존 메뉴, 코드 그룹, copy-embed, 첨부파일 카드를 재사용한다.
- 프로덕션 publish — 이번 작업은 로컬 자료 구성과 검증까지다.
- 가격·프로모션 정보의 최신성 보증 — 원본 대본을 제공하되 촬영 시점 재확인 안내를 둔다.

## Context

- Parent intent: `.omj/openhow-purpose-youtube-archive.md`
- Source script: `/Users/taesupyoon/sideProjects/youtube/channels/jobdori/docs/youtube/draft/scripts/02-codex-계정-슬롯-비용절감.md`
- Source skill: `/Users/taesupyoon/sideProjects/oh-my-jobdori/skills/codex-auth/`

## Footprint

- `openhow-docs/docs/more/_meta.json` — `더 보기` 사이드바 항목 등록
- `openhow-docs/docs/more/04-codex-at-7000-won.md` — YouTube 임베드, 설치 탭, 주의사항, 다운로드 카드
- `openhow-docs/docs/_embeds/install-codex-auth.md` — AI 설치·검증용 복사 블록
- `openhow-docs/docs/_downloads/codex-auth.zip` — oh-my-jobdori의 현재 `codex-auth` 스킬 전체 패키지
- `openhow-docs/docs/_downloads/codex-account-slots-video-script.md.txt` — 원본 영상 대본
- 검증: Playwright 로컬 렌더·내비게이션·코드 탭·copy-embed·첨부 링크 통과, ZIP HTTP 200 및 `unzip -t` 통과, 정적 export 46페이지/46자산 완료, `codex-auth` selftest 28/28 통과

## Backlog

- 다음 영상 자료의 위치와 분류는 주제에 맞춰 정한다.

## Learnings

- 기존 openhow 문법만으로 GitHub식 코드 탭, 복사 가능한 설치 프롬프트, 다운로드 카드를 만들 수 있어 신규 UI 코드가 필요 없었다.
- 일반 `downloads/` 폴더는 자동 내비게이션에 노출된다. 비공개 자산 폴더는 `_downloads/`처럼 `_` 접두어를 써야 한다.
