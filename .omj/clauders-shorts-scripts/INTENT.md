---
status: done
created: 2026-06-30
updated: 2026-06-30
iteration: 1
---

# 클로더즈 커리큘럼 쇼츠 대본화

## Why

사용자가 `examples/clauders.ai/docs` 커리큘럼 전체를 쇼츠형 대본으로 재가공하고, 롱폼을 먼저 만들지 여부를 판단하고 싶어 한다.

기존 docs 문서들이 이미 롱폼 원본 역할을 하므로, 새 롱폼을 중복 작성하기보다 원본 문서 1개당 한 포인트를 뽑아 30~45초 쇼츠 대본으로 만드는 게 더 빠르고 재사용성이 높다.

## What

- [validated] `examples/clauders.ai/docs/shorts-scripts/`에 쇼츠 제작 전략 문서 생성 → **metric: README 존재, 롱폼 우선 여부 결론 포함**
- [validated] 시작하기 6편 대본 생성 → **metric: GS-00~GS-05 존재**
- [validated] 초보 개념잡기 3편 + 자동화 입문 4편 대본 생성 → **metric: CC-01~CC-03, AU-01~AU-04 존재**
- [validated] 서비스 만들기 13편 대본 생성 → **metric: BS-00~BS-12 존재**
- [validated] 데모나잇 2편 대본 생성 → **metric: DN-01~DN-02 존재**
- [validated] 부록·운영 10편 대본 생성 + 유튜브용 편한 존칭(~요체) 톤 전환 → **metric: OP-01~OP-10 존재, 2인칭 반말 호칭과 `아니야`, `거야` 등 평어 잔여 패턴 0건**
- [validated] YouTube 퇴고 가이드 기반 보강 + 쇼츠별 팩트체크 문서 생성 — 훅/시청자 고통/시각 장면/CTA/팩트체크 메모를 각 쇼츠에 추가하고 내부·공식 문서 근거를 분리 기록 → **metric: 38개 쇼츠 모두 `시청자 고통` + `팩트체크/보강` 필드 존재, `07-fact-check-and-research.md` 존재, `_meta.json` 등록, 외부 근거 URL 7개 접근 확인**

## Not

- 원본 커리큘럼 문서 본문 수정
- 쇼츠 영상 편집 파일 생성
- 썸네일 이미지 생성
- 루트 docs 네비게이션 노출 변경
- 외부 SNS 업로드

## Context

- 대상 경로: `examples/clauders.ai/docs/`
- 출력 경로: `examples/clauders.ai/docs/shorts-scripts/`
- 톤 기준: 원본 문서는 `examples/clauders.ai/CLAUDE.md`, `examples/clauders.ai/rules/tone.md`를 참고하되, 사용자 요청에 따라 쇼츠 대본은 유튜브용 말하듯한 편한 존칭(~요체) 내레이션으로 전환
- 원칙: 한 영상에 한 포인트, 30~45초, Hook/시청자 고통/팩트체크/Script/Visual/CTA 구성
- 퇴고 기준: `/Users/taesupyoon/sideProjects/YouTube/.claude/agents/proofreader.md`, `script-writer.md`, `.agent/workflows/script-workflow.md`, `channels/jobdori/channel.yaml`

## Footprint

- `examples/clauders.ai/docs/shorts-scripts/_meta.json` — doc nav metadata — 쇼츠 대본 묶음 로컬 메타
- `examples/clauders.ai/docs/shorts-scripts/README.md` — doc — 제작 전략 및 롱폼 우선 여부 결론
- `examples/clauders.ai/docs/shorts-scripts/01-getting-started.md` — doc — 시작하기 6편
- `examples/clauders.ai/docs/shorts-scripts/02-claude-code-intro.md` — doc — 초보 개념잡기 3편
- `examples/clauders.ai/docs/shorts-scripts/03-automation.md` — doc — 자동화 입문 4편
- `examples/clauders.ai/docs/shorts-scripts/04-build-service.md` — doc — 서비스 만들기 13편
- `examples/clauders.ai/docs/shorts-scripts/05-demo-night.md` — doc — 데모나잇 2편
- `examples/clauders.ai/docs/shorts-scripts/06-appendix-and-ops.md` — doc — 부록·운영 10편
- 2026-06-30 tone revision — all shorts scripts — 평어/반말 대본을 유튜브용 편한 존칭(~요체) 내레이션으로 전환
- 2026-06-30 research revision — all shorts scripts — YouTube proofreader 기준으로 시청자 고통·팩트체크/보강 필드 38개 추가, 설치·AI비유·자동화기능·Vercel·피드백질문·Bootpay·MCP·Playwright 표현 보정
- `examples/clauders.ai/docs/shorts-scripts/07-fact-check-and-research.md` — doc — 쇼츠별 팩트체크와 공식/내부 근거 정리
- `examples/clauders.ai/docs/shorts-scripts/_meta.json` — config — 팩트체크 문서 등록

## Backlog

- 반응 좋은 쇼츠를 기준으로 롱폼 유튜브/라이브 세션 확장
- 각 대본별 자막용 3줄 요약과 썸네일 문구 추가
- 촬영 순서표와 B-roll 체크리스트 추가

## Learnings

### 2026-06-30: 기존 문서가 있으면 쇼츠 먼저 잘라도 된다
- **Decision**: 커리큘럼 문서 자체가 롱폼 원본이므로 새 롱폼을 만들지 않고 바로 쇼츠 대본으로 변환.
- **Reason**: 새 롱폼을 먼저 만들면 원본 docs와 메시지가 이중화되고, 쇼츠 제작 속도가 늦어진다.
- **Rule**: 새 주제처럼 원본이 없을 때만 1장짜리 롱폼 브리프를 먼저 만든다.

### 2026-06-30: 유튜브용이면 원본 사이트 톤보다 진행자 톤이 우선
- **Signal**: 사용자 피드백 — “유튜브로 할거니까 평어로 하지말자”.
- **Change**: 쇼츠 대본만 `여러분` 기준 편한 존칭(~요체) 내레이션으로 변경. 원본 커리큘럼 문서는 수정하지 않음.
- **Verification**: script count 38 유지, 평어 잔여 패턴 검사 0건.

### 2026-06-30: YouTube 퇴고 가이드 반영 + 쇼츠별 리서치 보강
- **Signal**: 사용자 피드백 — “퇴고가이드 ... 참고해서 퇴고해주고, 각 쇼츠에 대한 내용 팩트체크 ... 리서치해서 보완”.
- **Guide loaded**: YouTube repo의 `proofreader`, `script-writer`, `script-workflow`, `jobdori/channel.yaml`. 핵심 기준은 훅 15초, 시청자 고통, 설명보다 시연/장면, 시각 매핑, CTA, 채널 톤.
- **Research**: Anthropic Claude Code docs, MCP docs, Git/GitHub docs, Vercel docs, Playwright docs, Bootpay developer docs root 접근 확인. Bootpay MCP 검색은 결과가 비어 있어 코드 수준 세부 API 대신 “프론트 결제 + 서버 검증” 안전 표현으로 보정.
- **Changes**: 각 쇼츠에 `시청자 고통`과 `팩트체크/보강` 필드 추가. 공식 근거가 필요한 쇼츠는 표현을 완화하거나 최신 문서 확인 지시를 붙임.
- **Verification**: script count 38, pain notes 38, fact notes 38, informal/bad grammar/plain second-person checks 0, `_meta.json` parse OK, intent schema OK.

### 2026-06-30: 격식체 존댓말에서 유튜브식 편한 존칭으로 재조정
- **Signal**: 사용자 피드백 — “톤앤매너도 평어 말고 유튜브니까 말하듯한 편한 존칭으로 하자”.
- **Change**: 촬영 대본 영역(heading/hook/script/CTA)을 `합니다/입니다` 중심 격식체에서 `해요/예요/거든요` 중심의 편한 존칭으로 전환. 딱딱한 `지시` 표현은 `맡기다/요청` 쪽으로 완화.
- **Verification**: 훅·대본·CTA·제목 영역에서 격식체/반말/2인칭 반말 패턴 0건.
