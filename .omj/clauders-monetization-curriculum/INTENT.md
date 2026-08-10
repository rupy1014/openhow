---
status: building
created: 2026-06-11
updated: 2026-06-11
iteration: 2
---

# 클로더즈 상용화 모듈 — 모객·가격·첫 결제·첫 판매

## Why

clauders.ai 커리큘럼(서비스 만들기 파트)이 "만들기 → 배포 → 지인 5명 피드백 → PMF 사고법"에서 끝난다. 수강생이 진짜 궁금해하는 "어떻게 팔아서 돈 버냐"(상용화)가 없다.

리서치로 확인한 갭 (2026-06-11):
1. `10-pmf.md` 단계 표가 "이후: 유료화·영업·확장 검토"로 끝나는데 그걸 가르치는 챕터가 없음 — 커리큘럼이 스스로 던진 질문("이 고객이 모여 있는 채널은 어디인가")에 답을 안 줌.
2. `09-feedback.md`의 5명은 사실상 지인 — 모르는 사람을 데려오는 모객이 0.
3. 결제는 `project-scope-guide`·`toc.md`에서 명시적 범위 밖 → 첫 매출 경험이 영원히 안 옴.
4. 2026 인디해커 정설: building is table stakes, **distribution is the moat**. distribution-first 플레이북(채널 7개 중 2개 선택 + 6주 커밋)이 표준.
5. 주언규(신사임당) 모델 = audience-first distribution의 한국어판 (트래픽 → 팬덤 → 자기 상품 판매). 단 트래픽 선행 축적은 수개월 단위라 4주 기수제와 시간축이 안 맞음 → 그대로 복제 불가, 압축 번역 필요.
6. Rob Walling stair-step: 초보 1단계는 자체 모객 SaaS가 아니라 **유통이 내장된 마켓플레이스**에서 첫 매출 — 4주 안에 "돈 받아본 경험"을 만들 현실적 경로.
7. 경쟁 강의(패스트캠퍼스)는 이미 "배포 후 마케팅까지 올인원", "1인 개발 수익화 패키지"를 구매 후크로 사용 — 클로더즈는 약속이 "배포 링크 + 피드백"에서 끝나 비교 열위.

## What

- [validated] 신규 11강 "모객" (`build-service/11-distribution.md`) — 내 고객이 모여 있는 채널 1~2개 고르기 + 한국 채널 맵(스레드·유튜브·디스콰이엇·오픈채팅·네이버 카페·크몽) + 채널 선택 기준 5개(고객 근접도·실행 가능성·피드백 속도·복리성·유지 비용) → **metric: 문서 출시 + toc/_meta 반영, 수강생이 채널 2개를 고르는 숙제 포함**
- [validated] 신규 12강 "가격과 첫 결제" (`build-service/12-pricing.md`) — 결제 *구현* 없이 돈 받는 법(토스 결제링크·계좌이체·크몽 입점·Gumroad) + 초보 undercharging 교정 → **metric: 문서 출시, "결제 구현 범위 밖" 제약과 충돌하지 않음을 본문에 명시**
- [validated] 신규 13강 "첫 판매 제안" (`build-service/13-first-sale.md`) — 인터뷰한 5명을 유료 제안으로 전환하는 스크립트 + B2B DM·콜드메일 한 통 → **metric: 문서 출시, 복붙 가능한 제안 스크립트 1개 이상 포함**
- [validated] 빌드인퍼블릭을 1주차부터 — "만드는 과정 자체가 모객 콘텐츠" 프레임을 시작하기/자동화 입문 숙제에 끼움 (주언규식 트래픽 선행의 4주 압축판) → **metric: 기존 챕터 1~2곳에 빌드인퍼블릭 숙제 추가, 인증물에 공개 포스트 1개 반영**
- [validated] `09-feedback.md` 피드백 5명에 "채널에서 온 모르는 사람 2명" 추가 → **metric: 09 문서 수정 + 모객 최소 단위 경험으로 11강과 연결**
- [validated] 시간축 정합 섹션 — "유튜브에서 본 조언(트래픽 먼저)이 맞지만 4주 안에서는 이렇게 압축한다"를 11강 도입부에 명시 (`cohort-plan.md`의 유튜브 vs 기수제 구분을 수강생용으로 번역) → **metric: 11강 도입부에 해당 섹션 존재**
- [validated] `toc.md`·`index.md`·`00-overview.md` 흐름 갱신 — 서비스 만들기 11~13강 추가, 인증물·완주 지표 갱신 → **metric: 세 문서가 신규 강과 정합**
- [signal] (iter 2) 13강 설득력 보강 — 스크립트·구조만 있어 이론적, "보낼 용기"(마인드셋: 거절 공포·미안함 프레임 전환)와 "받는 사람이 믿을 근거"(신뢰 자산: 제안 전 깔아두는 콘텐츠 — 사례 글·데모·후기·과정 기록) 추가 → **metric: 마인드셋 섹션 + 신뢰 자산 섹션 + 숙제에 신뢰 자산 1개 반영, 사용자 재독 시 "설득된다" 확인**
- [signal] (iter 2) 12강 결제 도입 로드맵 보강 — "지금은 아니야"만 있고 결제를 언제·뭘·어떻게 붙이는지 없음. 신호 기반 단계 로드맵(수동 링크 → 플랫폼 → PG 위젯 → 정기결제) + 갈아탈 신호 표 + 그때 Claude한테 시키는 프롬프트 추가 → **metric: 단계 로드맵 표 + "갈아탈 신호" 명시, 사용자 재독 확인**
- [signal] (iter 2) 13강 B2C/B2B 트랙 분리 — 개인 고객과 가게·회사 고객은 제안 채널·가격대·결정 구조(돈 내는 사람≠쓰는 사람)·후속 방식이 다른데 챕터가 섞어 설명 중. 구분 기준 + 비교 표 + 트랙별 섹션 재구성 → **metric: "내 고객은 B2C야 B2B야?" 구분 섹션 + 비교 표 + 트랙별 제안 흐름 분리, 사용자 재독 확인**

## Not

- 결제 기능 **구현** 강의 (Stripe/토스페이먼츠 연동 코드) — 기존 범위 제약 유지
- 유료 광고 집행 (페이드 마케팅)
- 본격 유튜브 채널 운영 강의 — 주언규 영역 통째 복제 안 함, 빌드인퍼블릭 최소 단위만
- demo-night을 외부 모객 무대로 전환 — 별도 결정 사항
- Part 5 / OpenClaw 자동화 운영 범위 변경

## Context

- 대상 경로: `examples/clauders.ai/docs/` — `build-service/00~10` 기존 11개 챕터, `toc.md`, `index.md`, `_meta.json`
- 톤앤매너: `examples/clauders.ai/CLAUDE.md` + `rules/tone.md` — 평어(~이야/~해), 원포인트, 결과→과정→라이브→다시 구조
- 현 git 상태: build-service 05~10이 번호 재정렬 중 (untracked 신규 파일들) — 11~13 추가 시 번호 충돌 없음
- 리서치 소스: alexcloudstar.com "Distribution Is the Only Moat" (2026-03, 채널 7개·distribution-first 타임라인·채널 선택 기준 5개), Rob Walling stair-step (robwalling.com/microconf.com), 주언규PD 강의 분석 (teal.kr), 패스트캠퍼스 바이브코딩 강의 2종 (biz_online_vibecoding30, data_online_vibecoding)
- 배치 기본값: 신규 강은 build-service 11~13으로 본편 뒤에 연속 배치. "5주차/수료 후 모듈" 분리는 Backlog 참고
- 관련 의도: `_archived/book-curriculum-revamp.md` (도서 원고용 — 다른 Why), `_killed/clauders-ai-course-migration` (워크스페이스 인프라 — 다른 Why), `openhow-positioning-clauders-seo.md` (플랫폼 포지셔닝)

## Footprint

- examples/clauders.ai/docs/build-service/11-distribution.md — doc — v1-hyp-1 — 신규 모객 챕터 (시간축 정합 도입부 = hyp-6 포함, 326라인) (2026-06-11)
- examples/clauders.ai/docs/build-service/12-pricing.md — doc — v1-hyp-2 — 신규 가격·첫 결제 챕터 (260라인, 결제 연동 코드 0건); iter2: 신호 기반 결제 도입 4단계 로드맵 + 사업자등록 FAQ (319라인) (2026-06-11)
- examples/clauders.ai/docs/build-service/13-first-sale.md — doc — v1-hyp-3 — 신규 첫 판매 챕터 (복붙 스크립트 4개); iter2: 마인드셋·신뢰 자산 섹션 + B2C/B2B 트랙 재구성 (비교 표, B2B 시범·팔로업, 숙제 Step 0~1, 515라인 — soft limit 초과, 다음 실질 수정 시 분할 검토) (2026-06-11)
- examples/clauders.ai/docs/automation/04-homework.md — doc — v1-hyp-4 — 빌드인퍼블릭 보너스 숙제 + 11강 링크 (2026-06-11)
- examples/clauders.ai/docs/build-service/09-feedback.md — doc — v1-hyp-5 — 5명 중 모르는 사람 2명 + 모객 연결 (2026-06-11)
- examples/clauders.ai/docs/build-service/00-overview.md — doc — v1-hyp-7 — 루프 8단계화 + 장비표·읽기안내·목차에 11~13 추가 (2026-06-11)
- examples/clauders.ai/docs/build-service/10-pmf.md — doc — v1-hyp-7 — 11~13강 연결 문장 3곳 (2026-06-11)
- examples/clauders.ai/docs/build-service/_meta.json — config — v1-hyp-7 — items 11~13 등록 (2026-06-11)
- examples/clauders.ai/docs/toc.md — doc — v1-hyp-7 — 후반 6~14강 + 인증물 갱신 (2026-06-11)
- examples/clauders.ai/docs/index.md — doc — v1-hyp-7 — 4주 흐름 표·변화 표·구성 갱신 (2026-06-11)

## Backlog

- 신규 3강을 본편이 아닌 "5주차 보너스/수료 후 모듈"로 분리하는 옵션 — 4주 부하 초과 시 재검토
- 랜딩 카피/전환 관점 한 장 (08-deploy와 연결) — v2 후보
- 데모나잇에 외부 게스트 1명 초대 규칙 — 모객 경험과 연결 가능, 별도 결정

## Learnings

### 2026-06-11: (iteration 2) 13강 전체 퇴고 — 직접 재작성
- **Signal**: "문서 처음이 b2b 대상으로 글을 쓰는데 다시 처음부터 문서 전체 퇴고해봐" — 트랙 분리를 뒤에 끼우면서 앞 섹션들(신뢰 자산 예시 메시지, 누구한테 제안해?)이 분리 이전 전제로 남아 대상 흐름이 역전됨.
- **발견**: 직전 fix(morph-fast-apply)가 frontmatter YAML을 `## slug: ...` 한 줄로 파손. 신뢰 자산 예시가 B2C 스크립트와 중복, 거절 FAQ 이중 존재, 숙제 Step 1/2 모순.
- **조치**: 위임 파이프라인 파손 이력 + 전문이 컨텍스트에 있어 Claude가 직접 전체 재작성 (Codex 위임 룰 예외, 사유 기록). 새 구조: 핵심 요약 → 마인드셋 → **트랙 구분(앞으로 이동)** → 누구한테(트랙별) → 신뢰 자산(중복 제거, 한 줄 끼우기로 축소) → B2C → B2B → 거절(FAQ 중복 흡수) → 기록 → Claude 활용(트랙 분기) → 데모나잇 한 장(B2C/B2B 예시 둘 다) → 숙제(Step 1 트랙→2 신뢰 자산→3 대상→4 발송→5 기록) → FAQ → 한 줄 정리. 486라인.
- **Learned**: 구조 재편(섹션 이동·강등)은 patch 위임이 아니라 전체 재작성이 안전. morph 계열 적용은 frontmatter 파손 위험 — 위임 후 head 검증 필수.

### 2026-06-11: (iteration 2) /omj:build execution feedback — 시그널 3건 반영
- **Done**: 13강 마인드셋(전송 버튼 앞 장면 + 프레임 전환 3개)·신뢰 자산 4종 + B2C/B2B 트랙 재구성(비교 표, B2B 돈 내는 사람≠쓰는 사람·시범 제안·팔로업 1회 규칙), 12강 결제 도입 4단계 로드맵(갈아탈 신호 = 내 손이 병목).
- **Learned**: "범위 밖" 선언형 챕터는 반드시 다음 단계로 가는 신호 기반 다리를 같이 줘야 설득됨. 신규 집필 섹션은 문단 호흡(1~3문장 후 빈 줄)이 자주 뭉개져 fix 1회씩 필요 — brief에 호흡 규칙을 EXPECTED로 승격할 것.
- **Open**: 13강 515라인 — soft limit(500) 초과. 다음 실질 수정 시 B2B 트랙 분리(13-2) 검토.

### 2026-06-11: [signal] 13강은 B2C/B2B를 나눠 설명해야 한다
- **Source**: 대화 중 사용자 발화 (2026-06-11 session, 12강 시그널 직후)
- **Signal**: "이건 b2c, b2b 나눠서 설명을 해야할거같네"
- **Intent change**: 첫 판매는 고객 유형에 따라 제안 방식이 갈라지는데 단일 흐름으로 서술 중 — 트랙 분리 재구성을 iter 2 What에 추가. step7(마인드셋·신뢰 자산) 완료 후 같은 파일에 순차 적용

### 2026-06-11: [signal] 12강도 이론적 — 결제를 언제 붙이는지 답이 없다
- **Source**: 대화 중 사용자 발화 (2026-06-11 session, 13강 시그널 직후)
- **Signal**: "이것도 보강해줘 그럼 결제는 언제 붙이라는건지. 너무 이론적인거같아"
- **Intent change**: "범위 밖" 선언만으로는 부족 — 범위 밖이어도 독자가 다음 단계로 가는 다리(신호 기반 로드맵)는 챕터 안에 있어야 함. iter 2 What에 12강 보강 추가

### 2026-06-11: [signal] 13강이 이론적이라 설득이 안 된다
- **Source**: 대화 중 사용자 발화 (2026-06-11 session, 13강 재독 직후)
- **Signal**: "마인드셋이나 신뢰도 구축을 위한 콘텐츠 생산 등이 필요할거같거든. 이렇게 너무 이론적인 내용만 있으니까 설득이 안되네"
- **Intent change**: iter 2 What에 13강 보강 항목 추가 — 스크립트/프레임워크 위주 챕터는 심리 장벽(보내는 사람)과 신뢰 근거(받는 사람) 양쪽을 같이 다뤄야 설득력이 생김

### 2026-06-11: (iteration 1) metric verification
- [verified] 11강 모객 — 문서 출시 + toc/_meta 반영 + 채널 2개 선정 숙제(점수표): 기계 확인 + 사용자 일괄 승인
- [verified] 12강 가격·첫 결제 — 문서 출시 + 결제 연동 코드 0건 + 범위 무충돌 명시: 기계 확인 + 사용자 일괄 승인
- [verified] 13강 첫 판매 — 문서 출시 + 복붙 스크립트 4개: 기계 확인 + 사용자 일괄 승인
- [verified] 빌드인퍼블릭 — automation/04-homework 보너스 숙제 + toc/index 인증물에 공개 포스트 1개: 기계 확인 + 사용자 일괄 승인
- [verified] 09-feedback 모르는 사람 2명 + 11강 연결: 기계 확인 + 사용자 일괄 승인
- [verified] 시간축 정합 — 11강 도입부 "유튜브에서 말한 트래픽 모아라가 맞아?" 섹션: 기계 확인 + 사용자 일괄 승인
- [verified] toc/index/00-overview 정합 — jq 통과 + 11~13 링크 존재: 기계 확인 + 사용자 일괄 승인

### 2026-06-11: (iteration 1) /omj:build execution feedback
- **Deviation from plan**: 빌드인퍼블릭 "1주차 도입"은 시작하기가 아닌 자동화 입문 숙제(2주차)에 보너스로 배치 — 시작하기 단계엔 공개할 산출물이 아직 없어 기록할 거리가 없음. 13강 첫 섹션 헤딩이 챕터 컨벤션(## 핵심 요약)과 어긋나 fix 1회.
- **Learned**: Codex 콘텐츠 위임 시 brief에 톤 규칙 + 참고 챕터 정독 지시 + 아웃라인 고정을 넣으면 평어체 품질이 안정적. 13강처럼 고객용 스크립트가 들어가는 챕터는 "스크립트 안은 존댓말 예외"를 명시해야 함.
- **Side note**: Codex 리뷰가 `examples/clauders-community/docs/_meta.json`의 nav key `articles` → 존재하지 않는 폴더 (P2) 발견 — 본 의도 밖, 세션 전부터 있던 다른 작업의 미커밋 변경.

### 2026-06-11: seed created (iteration 1)
- **Background**: 커리큘럼이 PMF 사고법에서 끊기고 모객→가격→첫 결제→첫 판매 블록이 통째로 부재. 시장은 이미 수익화를 구매 후크로 사용 중.
- **Initial notes**: 주언규식 트래픽 선행은 4주와 시간축 불일치 → 빌드인퍼블릭 압축 + 마켓플레이스(stair-step) 우회로 번역. 결제 구현 없이 돈 받는 경로(토스 결제링크 등)로 기존 범위 제약과 무충돌 설계.
