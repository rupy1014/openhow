---
status: done
created: 2026-04-17
updated: 2026-04-17
iteration: 1
domain: dx
size: S
---

# local-prod-proxy — 로컬 viewer + 프로덕션 API 연동 개발 모드

## Why

스타일/UI 변경을 프로덕션 데이터(실제 워크스페이스, 문서, 에셋)로 즉시 확인하고 싶다. 현재는 로컬 Worker를 띄워야 하는데, D1 데이터가 비어 있어서 의미 있는 테스트가 안 된다. 프로덕션 API에 프록시만 걸면 빌드 없이 바로 확인 가능.

## What

- (v1) `pnpm dev:prod` 스크립트: viewer의 vite proxy target을 `https://openhow.io`로 전환
- (v1) 환경변수 `VITE_API_TARGET`으로 proxy target 제어 (기본: localhost:7877)
- (v1) viewer README나 CLAUDE.md에 사용법 한 줄 추가

## Not

- Worker 로컬 실행 불필요 (프로덕션 API 직접 사용)
- 프로덕션 DB write 방지 장치 — 스코프 밖 (읽기 위주 UI 확인 목적)
- CORS 이슈 가능성 — viewer가 localhost에서 openhow.io API 호출 시 브라우저 CORS 차단될 수 있음. Vite proxy가 서버사이드로 우회하므로 문제없음.

## Context

- viewer vite config: `packages/viewer/vite.config.ts` line 122-127
- 현재 proxy: `/api` → `http://localhost:7877`
- CLAUDE.md 포트 할당: viewer 5173, worker 7877
- Vite의 `server.proxy`는 서버사이드 프록시이므로 CORS 무관

## Footprint

- `core/packages/viewer/package.json` — `dev:prod` 스크립트 추가 (`VITE_API_TARGET=https://openhow.io vite`)
- 전역 `CLAUDE.md` (`~/.claude/CLAUDE.md`) — 포트 할당 섹션에 사용법 명시

## Learnings

### 2026-04-17: 구현 완료 → done
- `pnpm dev:prod` 스크립트 실제로 동작 (viewer/package.json:8 확인)
- 전역 CLAUDE.md에 사용법 등록됨 — 재사용 준비 완료
- frontmatter 포맷을 다른 intent와 통일 (`title` 필드 제거, `status/created/updated/iteration` 표준화)
