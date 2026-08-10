# Plan — 클로더즈 상용화 모듈 (iter 1)

## Goal
서비스 만들기 파트가 PMF에서 끊기지 않도록, 모객→가격·첫 결제→첫 판매로 이어지는 11~13강을 신설하고 기존 흐름(09·10·00·toc·index·_meta)을 정합시킨다.

## Architecture Decision
- **선택**: 신규 3강을 build-service 11~13으로 본편 연속 배치 — 기존 번호 체계(00~10) 자연 연장, 3주차 그룹 내 완결.
- **거절**: 별도 "5주차/수료 후" nav 그룹 신설 — _meta nav 구조 변경 + cohort 운영 결정 필요. Backlog로 유보.
- **콘텐츠 집필 위임**: Codex에 챕터별 brief(tone 규칙 + 참고 챕터 + 리서치 소재 포함)로 위임. 평어체·구조는 brief에 명시.

## Files to Modify
### New
- `examples/clauders.ai/docs/build-service/11-distribution.md` — 모객 (한국 채널 맵 + 채널 선택 기준 5 + 시간축 정합 + 빌드인퍼블릭)
- `examples/clauders.ai/docs/build-service/12-pricing.md` — 가격과 첫 결제 (결제 구현 없이 돈 받기)
- `examples/clauders.ai/docs/build-service/13-first-sale.md` — 첫 판매 제안 (전환 스크립트 + 콜드메일)

### Existing
- `examples/clauders.ai/docs/build-service/09-feedback.md` — 5명 중 모르는 사람 2명 + 11강 연결
- `examples/clauders.ai/docs/build-service/10-pmf.md` — 말미에 11~13강 연결
- `examples/clauders.ai/docs/build-service/00-overview.md` — 루프 7단계→8단계(모객·첫 판매), 목차 표 11~13 추가
- `examples/clauders.ai/docs/build-service/_meta.json` — items 11~13 추가
- `examples/clauders.ai/docs/toc.md` — 서비스 만들기 후반 강 목록 + 인증물 갱신
- `examples/clauders.ai/docs/index.md` — 4주 흐름 표 인증물 갱신

### Docs (phase 4)
- `.omj/clauders-monetization-curriculum/INTENT.md` — Footprint/Learnings

## Estimated Scope
~900 라인 신규 + ~60 라인 수정, 9 files, Codex 5 steps

## Verification (per step)
1. 11강: 파일 존재 + frontmatter(slug/title/nav/description/hook/status/tags) + `grep -c '습니다\|합니다\|해요'` = 0 + 채널 선택 기준 5개 표 존재
2. 12강: 동일 frontmatter/톤 체크 + 결제 연동 코드 블록 없음 + 토스 결제링크/크몽 언급 존재
3. 13강: 동일 체크 + `=== 여기서부터 복사 ===` 또는 복붙 스크립트 블록 ≥ 1
4. 09/10/00: 기존 섹션 보존(diff 추가 위주) + 11강 링크 존재
5. `jq empty _meta.json` + toc/index에 11~13 링크 존재

## MUST NOT
- 결제 기능 구현(Stripe/토스페이먼츠 연동 코드) 추가 금지
- 존댓말(습니다/해요체) 금지 — tone.md 평어체
- demo-night/cohort-plan/project-scope-guide 수정 금지
- 기존 챕터 내용 대량 삭제 금지 (추가·연결 위주)
- git commit 금지 (워킹트리에 다른 미커밋 변경 존재)

## Reference
- INTENT.md Why/Context (리서치 소스 목록)
- 톤: `examples/clauders.ai/rules/tone.md`, `examples/clauders.ai/CLAUDE.md`
- 형식 참고 챕터: `09-feedback.md`, `10-pmf.md`
