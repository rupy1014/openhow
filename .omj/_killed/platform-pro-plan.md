---
status: killed
created: 2026-04-17
updated: 2026-04-30
killed_at: 2026-04-30
iteration: 1
domain: core
stage: seed
---

# platform-pro-plan — openhow 플랫폼 Pro 연구독 (커스텀 도메인 + 브랜딩 제거) [KILLED]

## Kill 사유 (2026-04-30)

`creator-platform-discovery` 의 v1 MVP 좁힘 과정에서 **customDomain 자체를 v1 에서 공개하지 않기로 결정**. customDomain 이 Pro 의 핵심 가치 번들이었고, 그게 빠지면 남는 가치 = "Powered by openhow" 푸터 제거 — 이것만으로는 ₩99k/yr 의 가격 정당성이 약함.

사용자 결정: "pro 가치는 일단 없다고 보자고. pro 요금제 제공하지말자."

**대신 채택된 방향**:
- customDomain = 인프라적으로 동작은 하지만 운영자 본인 워크스페이스(예: clauders.ai) 에만 비공개로 사용. 셀프서비스 UI 안 노출
- 일반 사용자 = `openhow.io/w/{slug}` path 만
- 플랫폼 자체 매출 라인은 v1 외 — 우선 무료로 트래픽/사용 검증 → 매출 모델은 별도 의도로 다시 설계

**부활 조건**: 트래픽/사용자가 충분히 모인 뒤, 매출 모델을 "도메인 + 브랜딩" 외 가치 번들 (분석, 스토리지, AI 보조, Bootpay 매출 연동 무료 같은 매출 공유 모델 등) 로 재설계할 때. 그 때는 같은 Why 가 아니므로 부활보다 신규 의도로 시작.

---

(이하 원본 — 참고용 보존)

## Why (원본)

openhow는 현재 전원 무료다. 플랫폼 자체의 MRR/ARR 라인이 없다. 동시에 자기 브랜드로 운영하는 크리에이터에게 openhow.io/d/{slug}/... 서브경로 + "Powered by openhow" 푸터는 독립된 브랜드감을 해친다. **이 두 지점을 한 번에 묶어서 유료화**한다 — 자기 도메인 쓰고 싶은 크리에이터 = 브랜딩 제거하고 싶은 크리에이터 = 이미 어느 정도 돌아가는 크리에이터. 지불 의사와 지불 능력이 겹친다.

가격: **연 ₩99,000 (월 환산 약 ₩8,250)**. Notion Business $20/mo, Gitbook Plus $8/mo, Carrd Pro $19/yr, Framer Mini $15/mo 등 레퍼런스에서 **진입 티어 하단**. 한국 크리에이터 심리 앵커(커피 한 잔).

## What

- [hypothesis] **(v1) 결제 주기 — 연만 vs 월+연 병행** — 사용자 의사: "일단 연만 깔끔하게". 월 옵션 생략 시 초기 운영 단순화(Bootpay 빌링키 1종, 만기 알림 1종), 반면 월 옵션 없으면 "일단 한달 써보자" 유저를 놓침 → **metric**: 연만으로 3개월 돌려보고 전환율 관찰, 월 요청 피드백 빈도 집계
- [hypothesis] **(v1) 플랜 엔티티 레벨 — workspace vs user** — `workspace.customDomain` 이 이미 workspace 단위라 **workspace 플랜이 가장 자연스럽다**(플랜=해당 워크스페이스가 유료). user 플랜은 "user가 가진 모든 workspace에 적용" 뜻이라 멀티 워크스페이스 보유자 과금 설계가 복잡 → **metric**: v1은 workspace 플랜으로 결정, user 플랜은 v2 이상에서 재검토
- [hypothesis] **(v1) DB 스키마** — `workspace_plan` 테이블 (workspaceId, tier: 'free'|'pro', startedAt, expiresAt, bootpayBillingKey, autoRenew, status) — 기존 `subscription` 테이블은 크리에이터의 구독자 대상이라 이름 충돌. 새 테이블로 분리 → **metric**: migration + schema.ts 추가, `isProWorkspace(workspaceId)` 헬퍼 1개로 전역 게이트
- [hypothesis] **(v1) 브랜딩 게이트 — 푸터 조건부 렌더** — SSG/SPA 양쪽에서 "Powered by openhow" 푸터를 기본 렌더, `workspace.plan === 'pro'` 면 숨김. SSG는 `buildHtml.ts` 에서 HTML 생성 시 분기, SPA는 `Footer` 컴포넌트 분기 → **metric**: Pro 워크스페이스 퍼블리시 결과 HTML에 푸터 문자열 미포함, 무료 워크스페이스는 포함
- [hypothesis] **(v1) 커스텀 도메인 게이트 — 이미 무료로 열려있음 → Pro 전용으로 클로즈** — 현재 `/api/workspaces/:id/custom-domain` 이 Free도 설정 가능. 이걸 Pro 전용으로 잠그면 **기존 커스텀 도메인 사용자 grandfathering** 문제 발생 → **metric**: 현재 customDomain 설정된 워크스페이스 수 집계 → grandfathering 전략(기존 사용자 무기한 유지 vs 6개월 유예) 결정
- [hypothesis] **(v1) 업셀 CTA 위치** — 후보: ① AdminSettings "도메인" 섹션 상단("커스텀 도메인은 Pro 전용" 배너), ② AdminSettings "일반"에 "Pro로 업그레이드" 카드, ③ 무료 워크스페이스 푸터 "Powered by openhow" 옆 ℹ️ → 관리자에게만 "브랜딩 제거" 링크 → **metric**: A/B로 위치별 클릭률 비교, v1은 ① + ② 동시 노출
- [hypothesis] **(v1) 환불 정책** — 연 구독 대상: ① 7일 이내 100% 환불, ② 그 이후 잔여 개월 선형 환불, ③ 환불 불가 — 한국 전자상거래법상 디지털 콘텐츠는 7일 청약철회가 원칙이나 "사용 개시 후 불가" 예외 가능 → **metric**: v1은 "7일 이내 100%, 이후 불가" (업계 관례 + 법적 안전) 로 시작, 클레임 빈도 보고 조정
- [hypothesis] **(v1) Bootpay 정기결제 연동** — 이미 결제 인프라 있음 (`bootpay_billing_key` 컬럼). 연 정기결제 등록 → 1년 후 자동 갱신 → 실패 시 7일 유예 후 Free 강등 → **metric**: Bootpay billing key 발급 → 다음해 -7일 시점 retry 로그 테스트

## Not

- **부트페이 매출 연동 무료화** (크리에이터의 Bootpay 매출 일정 이상이면 Pro 자동 제공) — **별도 intent** (`pro-plan-revenue-waiver.md` 예정)
- **월 결제 옵션** — v1 연만으로 시작, 수요 관찰 후 v2에서 검토
- **user 레벨 플랜** (한 유저가 가진 모든 워크스페이스에 적용) — v2 이상
- **팀/Enterprise 플랜** (다수 편집자, SSO, SLA) — 별도 intent
- **creator-platform.md 의 "발행자 과금 (베이직/브랜딩/마케팅)"** — 그건 maily.so 스타일 크리에이터→구독자 과금 구조. 이 인텐트는 openhow→워크스페이스 소유자 과금. Why가 다름
- **Pro 전용 기능 번들링** (고급 애널리틱스, AI 편집 보조, 스토리지 상한 해제 등) — v1은 "도메인 + 브랜딩 제거" 최소 번들. 추가 기능은 구독 전환율 보고 점진적으로 얹음
- **프로모션 쿠폰/할인/얼리버드** — v1 직후 launch 프로모션은 별도 마케팅 intent

## Context

### 이미 있는 인프라

| 위치 | 상태 |
|------|------|
| `worker/src/db/schema.ts:63` | `workspace.customDomain` 컬럼 — 이미 무료 사용자도 설정 가능 |
| `worker/src/routes/workspaces.ts:349` | `/api/workspaces/:id/custom-domain` PUT — CF hostname 등록까지 처리 |
| `worker/src/index.ts:73` | hostname → workspace 라우팅 |
| `cli/src/ssg/buildHtml.ts:152` | `buildCanonicalUrl` — customDomain 있으면 canonical 자동 전환 (workspace-seo-v1 에서 처리됨) |
| `worker/src/db/schema.ts:540` | `subscription_plan` / `subscription` — **크리에이터→구독자** 과금용. 이름 중복 주의 |
| `worker/src/db/schema.ts:575` | `bootpayBillingKey` / `bootpaySubscriptionId` — 구독자 테이블에 붙어있음 |

### 관련 인텐트

- `workspace-seo-v1.md` (done) — customDomain canonical/sitemap 처리는 이미 끝남. Pro 플랜은 그 위에 **gate** 만 얹는 작업
- `creator-platform.md` — "발행자 과금 (플랜 체계)" 항목이 Not list에 있음. 이건 크리에이터→구독자 방향. **본 인텐트는 openhow→워크스페이스 방향**. 용어 충돌 방지 필요
- `platform-cost-simulation.md` (2026-04-17) — 인프라/수수료/순이익 시뮬레이션. 비디오 정책(무료=YouTube embed / 유료=Stream)과 커미션 10% 기초 분석
- `pro-plan-revenue-waiver.md` (미작성, 별도 예정) — Bootpay 매출 연동 무료화

### 확정된 주변 정책 (시뮬레이션 기반)

- **비디오 정책**: 무료 강의는 YouTube embed, 유료 강의만 Cloudflare Stream — Stream 비용이 유료 구매자 수에 비례하도록 제한
- **커미션율**: 유료 콘텐츠 매출의 **10%** — Bootpay PG 수수료는 openhow 흡수
- 근거·민감도는 `platform-cost-simulation.md` 참조

### 전제

- 현재 customDomain 설정된 워크스페이스 수 — **확인 필요**. 적으면 grandfathering 무기한, 많으면 유예기간
- 타깃: 이미 자기 브랜드 있는 크리에이터 (블로그 운영자, 뉴스레터 발행자, 소규모 코치/강사). 완전 신규 유저는 Free로 충분
- 가격 앵커: ₩99,000/yr = 월 ₩8,250. 레퍼런스 대비 하단. 재조정 여지는 "너무 싸서 가치 없어 보인다" 피드백 나오면 ₩149,000 으로 상향 가능

## Learnings

*(실험 결과·사용자 피드백이 쌓이는 자리 — 현재 없음)*
